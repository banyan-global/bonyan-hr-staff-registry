<?php
/**
 * الحسابات والدخول والصلاحيات
 * - الدخول برمز من ٦ أرقام يصل إلى بريد صاحب الحساب (صالح ١٠ دقائق، ٥ محاولات للرمز الواحد)
 * - قفل لكل حساب على حدة بعد ٨ أخطاء (١٥ دقيقة) + حدّ للطلبات من كل عنوان IP — لا يوجد قفل عام يمكن استغلاله لإيقاف الموارد البشرية
 * - جلسة بملف تعريف آمن (HttpOnly, Secure, SameSite=Strict) تنتهي بعد مدة الخمول أو المدة القصوى
 * - الصلاحيات تُفحص في الخادم لكل عملية
 */
declare(strict_types=1);

const PERMS = [
    'staff.view'   => 'عرض بيانات المنسوبين',
    'staff.edit'   => 'تعديل بيانات المنسوبين',
    'staff.files'  => 'رفع المرفقات واستبدالها',
    'staff.mail'   => 'مراسلة المنسوبين',
    'finance.view' => 'عرض الرواتب والحسابات البنكية',
    'audit.view'   => 'عرض سجل العمليات',
    'users.manage' => 'إدارة الحسابات والصلاحيات',
    'backup.run'   => 'النسخ الاحتياطي والتصدير الكامل',
    'requests.approve' => 'اعتماد طلبات المنسوبين',
    'self.view'    => 'صفحة المنسوب الخاصة (بياناته فقط)',
];
const ROLE_PERMS = [
    'admin' => ['staff.view', 'staff.edit', 'staff.files', 'staff.mail', 'finance.view', 'audit.view', 'users.manage', 'backup.run', 'requests.approve'],
    'hr'    => ['staff.view', 'staff.edit', 'staff.files', 'staff.mail', 'finance.view', 'audit.view', 'requests.approve'],
    'ceo'   => ['staff.view', 'finance.view', 'audit.view', 'requests.approve'],
    'viewer'=> ['staff.view'],
    'staff' => ['self.view'],
];
const ROLE_NAMES = ['admin' => 'مدير النظام', 'hr' => 'الموارد البشرية', 'ceo' => 'الرئيس التنفيذي', 'viewer' => 'اطلاع فقط', 'staff' => 'منسوب'];

/* سجل المنسوب صاحب هذا البريد (الرسمي أو الشخصي) */
function staff_ref_by_email(string $email): ?string {
    $email = strtolower(trim($email)); if ($email === '') return null;
    foreach (q('SELECT ref, data FROM staff ORDER BY id DESC')->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: [];
        foreach (['officialEmail', 'personalEmail'] as $k) if (strtolower(trim((string)($d[$k] ?? ''))) === $email) return $r['ref'];
    }
    return null;
}
/* حساب المنسوب يُنشأ تلقائيًا أول مرة يطلب فيها رمز الدخول ببريده المسجّل */
function ensure_staff_user(string $email): ?array {
    $ref = staff_ref_by_email($email); if (!$ref) return null;
    $r = staff_get($ref); $name = $r ? staff_name($r) : '';
    q('INSERT INTO users (email, name, title, role, staff_ref, created_at) VALUES (?,?,?,?,?,?)', [$email, $name, 'منسوب', 'staff', $ref, now()]);
    audit_log($ref, 'إنشاء حساب منسوب', mask_email($email), 'النظام');
    return q1('SELECT * FROM users WHERE email=?', [$email]);
}
/* سجل المستخدم الحالي في المنسوبين (للمنسوب، أو لأي حساب إداري له سجل ببريده) */
function my_staff_ref(array $u): ?string {
    if (!empty($u['staff_ref']) && staff_get((string)$u['staff_ref'])) return (string)$u['staff_ref'];
    $ref = staff_ref_by_email((string)$u['email']);
    if ($ref) q('UPDATE users SET staff_ref=? WHERE id=?', [$ref, $u['id']]);
    return $ref;
}
const SESSION_COOKIE = 'bhr_s';

/* الحسابات الأولى تُنشأ من ملف الإعدادات مرة واحدة (حين يكون جدول الحسابات فارغًا) */
function seed_users(): void {
    if ((int)q1('SELECT COUNT(*) n FROM users')['n'] > 0) return;
    foreach ((array)cfg('accounts') as $a) {
        $email = strtolower(trim((string)($a['email'] ?? '')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) continue;
        $role = isset(ROLE_PERMS[$a['role'] ?? '']) ? $a['role'] : 'viewer';
        q('INSERT IGNORE INTO users (email, name, title, role, created_at) VALUES (?,?,?,?,?)', [$email, (string)($a['name'] ?? ''), (string)($a['title'] ?? ''), $role, now()]);
        audit_log('', 'إنشاء حساب', $email . ' · ' . ROLE_NAMES[$role], 'النظام');
    }
}
function user_perms(array $u): array {
    $p = $u['perms'] ? json_decode((string)$u['perms'], true) : null;
    $list = is_array($p) ? $p : (ROLE_PERMS[$u['role']] ?? []);
    return array_values(array_intersect(array_keys(PERMS), $list));
}
function user_public(array $u): array {
    return ['id' => (int)$u['id'], 'email' => $u['email'], 'name' => $u['name'], 'title' => $u['title'], 'role' => $u['role'],
        'roleName' => ROLE_NAMES[$u['role']] ?? $u['role'], 'perms' => user_perms($u), 'active' => (bool)$u['active'], 'notify' => user_notify($u),
        'lastLogin' => $u['last_login_at'] ? substr($u['last_login_at'], 0, 16) : '', 'locked' => $u['locked_until'] && $u['locked_until'] > now()];
}
/* هل يصله تنبيه «تسجيل جديد» والتنبيه الأسبوعي؟ (اختيار صريح، وإلا حسب الدور) */
function user_notify(array $u): bool { return isset($u['notify']) && $u['notify'] !== null ? (bool)$u['notify'] : in_array($u['role'], ['admin', 'hr'], true); }
function code_hash(string $code, int $uid): string { return hash_hmac('sha256', $uid . ':' . $code, app_secret()); }

/* ١) طلب رمز الدخول: الرد نفسه دائمًا سواء وُجد الحساب أم لا (منع كشف الحسابات) */
function auth_start(array $b): array {
    seed_users();
    $email = strtolower(trim((string)($b['email'] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new HttpError('bad_email');
    if (rate_hit('ip_auth:' . client_ip(), 30, 3600)) throw new HttpError('locked', 429);
    $generic = ['ok' => true, 'sent' => true, 'to' => mask_email($email)];
    $u = q1('SELECT * FROM users WHERE email=?', [$email]);
    if (!$u) $u = ensure_staff_user($email);
    if (!$u || !$u['active']) { usleep(400000); audit_log('', 'طلب رمز لبريد غير مسجّل', mask_email($email)); return $generic; }
    if ($u['locked_until'] && $u['locked_until'] > now()) throw new HttpError('locked', 429);
    if (rate_hit('mail_code:' . $u['id'], 5, 3600)) throw new HttpError('too_many_codes', 429);
    $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    q('UPDATE login_codes SET used_at=? WHERE user_id=? AND used_at IS NULL', [now(), $u['id']]);
    q('INSERT INTO login_codes (user_id, code_hash, expires_at, ip, created_at) VALUES (?,?,?,?,?)', [$u['id'], code_hash($code, (int)$u['id']), date('Y-m-d H:i:s', time() + 600), client_ip(), now()]);
    send_login_code($u, $code);
    audit_log('', 'طلب رمز دخول', $u['name'] ?: $email, $u['name'] ?: $email);
    return $generic;
}

/* ٢) التحقق من الرمز وفتح الجلسة */
function auth_verify(array $b): array {
    seed_users();
    $email = strtolower(trim((string)($b['email'] ?? '')));
    $code = to_ascii_digits(preg_replace('/\s+/', '', (string)($b['code'] ?? '')));
    if (rate_hit('ip_verify:' . client_ip(), 40, 3600)) throw new HttpError('locked', 429);
    $u = q1('SELECT * FROM users WHERE email=?', [$email]);
    if (!$u || !$u['active']) { usleep(700000); throw new HttpError('bad_code', 401); }
    if ($u['locked_until'] && $u['locked_until'] > now()) throw new HttpError('locked', 429);
    $row = q1('SELECT * FROM login_codes WHERE user_id=? AND used_at IS NULL AND expires_at > ? ORDER BY id DESC LIMIT 1', [$u['id'], now()]);
    $ok = $row && $row['attempts'] < 5 && preg_match('/^\d{6}$/', $code) && hash_equals($row['code_hash'], code_hash($code, (int)$u['id']));
    if (!$ok) {
        if ($row) q('UPDATE login_codes SET attempts=attempts+1 WHERE id=?', [$row['id']]);
        $fails = (int)$u['fails'] + 1;
        q('UPDATE users SET fails=?, locked_until=? WHERE id=?', [$fails >= 8 ? 0 : $fails, $fails >= 8 ? date('Y-m-d H:i:s', time() + 900) : null, $u['id']]);
        audit_log('', 'محاولة دخول خاطئة', ($u['name'] ?: $email) . ($fails >= 8 ? ' · أُوقف الحساب ١٥ دقيقة' : ''), $u['name'] ?: $email);
        usleep(700000);
        throw new HttpError($row ? 'bad_code' : 'code_expired', 401);
    }
    q('UPDATE login_codes SET used_at=? WHERE id=?', [now(), $row['id']]);
    q('UPDATE users SET fails=0, locked_until=NULL, last_login_at=? WHERE id=?', [now(), $u['id']]);
    $token = bin2hex(random_bytes(32));
    $hours = (int)cfg('session_hours');
    q('INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at, ip, ua) VALUES (?,?,?,?,?,?,?)',
        [hash('sha256', $token), $u['id'], now(), now(), date('Y-m-d H:i:s', time() + $hours * 3600), client_ip(), substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255)]);
    set_session_cookie($token, time() + $hours * 3600);
    audit_log('', 'تسجيل دخول', $u['name'] ?: $email, $u['name'] ?: $email);
    return ['ok' => true, 'user' => user_public($u)];
}
function set_session_cookie(string $value, int $expires): void {
    if (PHP_SAPI === 'cli') return;
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    setcookie(SESSION_COOKIE, $value, ['expires' => $expires, 'path' => '/', 'secure' => $secure, 'httponly' => true, 'samesite' => 'Strict']);
}

/* الجلسة الحالية (أو null) */
function current_user(): ?array {
    static $cached = false;
    if ($cached !== false) return $cached;
    $cached = null;
    $tok = (string)($_COOKIE[SESSION_COOKIE] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $tok)) return null;
    $s = q1('SELECT * FROM sessions WHERE id=?', [hash('sha256', $tok)]);
    if (!$s) return null;
    $idle = (int)cfg('idle_minutes') * 60;
    if ($s['expires_at'] < now() || strtotime($s['last_seen_at']) < time() - $idle) { q('DELETE FROM sessions WHERE id=?', [$s['id']]); return null; }
    $u = q1('SELECT * FROM users WHERE id=? AND active=1', [$s['user_id']]);
    if (!$u) return null;
    if (strtotime($s['last_seen_at']) < time() - 60) q('UPDATE sessions SET last_seen_at=? WHERE id=?', [now(), $s['id']]);
    $u['_perms'] = user_perms($u);
    $u['_label'] = $u['name'] ?: $u['email'];
    return $cached = $u;
}
/* يتحقق من الجلسة والصلاحية، ويعيد اسم المستخدم لتسجيله في السجل */
function require_perm(string $perm): array {
    $u = current_user();
    if (!$u) throw new HttpError('auth_required', 401);
    if (!in_array($perm, $u['_perms'], true)) throw new HttpError('forbidden', 403);
    return $u;
}
function has_perm(array $u, string $perm): bool { return in_array($perm, $u['_perms'] ?? [], true); }

function auth_me(): array { $u = current_user(); return ['ok' => true, 'user' => $u ? user_public($u) + ['hasRecord' => (bool)my_staff_ref($u)] : null, 'perms' => PERMS, 'roles' => ROLE_NAMES]; }
function auth_logout(): array {
    $tok = (string)($_COOKIE[SESSION_COOKIE] ?? '');
    if ($tok !== '') { $u = current_user(); q('DELETE FROM sessions WHERE id=?', [hash('sha256', $tok)]); if ($u) audit_log('', 'خروج', $u['_label'], $u['_label']); }
    set_session_cookie('', time() - 3600);
    return ['ok' => true];
}

/* ============================================================ إدارة الحسابات (مدير النظام) */
function users_list(): array {
    require_perm('users.manage');
    $rows = q("SELECT * FROM users WHERE role <> 'staff' ORDER BY id")->fetchAll();
    $staffN = (int)q1("SELECT COUNT(*) n FROM users WHERE role = 'staff'")['n'];
    $roles = ROLE_NAMES; unset($roles['staff']); $rp = ROLE_PERMS; unset($rp['staff']);
    return ['ok' => true, 'users' => array_map('user_public', $rows), 'staffAccounts' => $staffN, 'perms' => PERMS, 'roles' => $roles, 'rolePerms' => $rp];
}
function users_save(array $b): array {
    $me = require_perm('users.manage');
    $email = strtolower(trim((string)($b['email'] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new HttpError('bad_email');
    $role = (string)($b['role'] ?? 'viewer');
    if (!isset(ROLE_PERMS[$role]) || $role === 'staff') throw new HttpError('bad_role');
    $perms = isset($b['perms']) && is_array($b['perms']) ? array_values(array_intersect(array_keys(PERMS), $b['perms'])) : null;
    $id = (int)($b['id'] ?? 0);
    $active = isset($b['active']) ? (int)(bool)$b['active'] : 1;
    if ($id === (int)$me['id'] && (!$active || ($perms !== null && !in_array('users.manage', $perms, true)) || ($perms === null && !in_array('users.manage', ROLE_PERMS[$role], true))))
        throw new HttpError('cannot_lock_self');
    $permsJson = $perms === null ? null : json_encode($perms);
    $dup = q1('SELECT id FROM users WHERE email=? AND id<>?', [$email, $id]);
    if ($dup) throw new HttpError('email_exists');
    if ($id) {
        $old = q1('SELECT * FROM users WHERE id=?', [$id]);
        if (!$old) throw new HttpError('not_found', 404);
        q('UPDATE users SET email=?, name=?, title=?, role=?, perms=?, active=?, locked_until=IF(?=1, locked_until, NULL) WHERE id=?',
            [$email, safe_text($b['name'] ?? ''), safe_text($b['title'] ?? ''), $role, $permsJson, $active, $active, $id]);
        if (!$active) q('DELETE FROM sessions WHERE user_id=?', [$id]);
        if (array_key_exists('notify', $b)) q('UPDATE users SET notify=? WHERE id=?', [$b['notify'] === null ? null : (int)(bool)$b['notify'], $id]);
        audit_log('', 'تعديل حساب', $email . ' · ' . ROLE_NAMES[$role] . ($active ? '' : ' · موقوف') . ' · ' . ($perms === null ? 'صلاحيات الدور' : implode('، ', $perms)), $me['_label']);
    } else {
        q('INSERT INTO users (email, name, title, role, perms, active, created_at) VALUES (?,?,?,?,?,?,?)',
            [$email, safe_text($b['name'] ?? ''), safe_text($b['title'] ?? ''), $role, $permsJson, $active, now()]);
        if (array_key_exists('notify', $b) && $b['notify'] !== null) q('UPDATE users SET notify=? WHERE email=?', [(int)(bool)$b['notify'], $email]);
        audit_log('', 'إنشاء حساب', $email . ' · ' . ROLE_NAMES[$role] . ($perms === null ? '' : ' · ' . implode('، ', $perms)), $me['_label']);
    }
    return users_list();
}
function users_unlock(array $b): array {
    $me = require_perm('users.manage');
    q('UPDATE users SET fails=0, locked_until=NULL WHERE id=?', [(int)($b['id'] ?? 0)]);
    audit_log('', 'فك قفل حساب', (string)($b['id'] ?? ''), $me['_label']);
    return users_list();
}
function sessions_revoke(array $b): array {
    $me = require_perm('users.manage');
    q('DELETE FROM sessions WHERE user_id=?', [(int)($b['id'] ?? 0)]);
    audit_log('', 'إنهاء جلسات حساب', (string)($b['id'] ?? ''), $me['_label']);
    return ['ok' => true];
}
