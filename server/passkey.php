<?php
/**
 * الدخول السريع
 * ١) حفظ الجهاز: بعد الدخول بالرمز يمكن تذكّر الجهاز ٣٠ يومًا، فيدخل صاحبه بضغطة واحدة دون رمز.
 *    الرمز المحفوظ في الجهاز عشوائي (٢٥٦ بت) ويُخزَّن في الخادم مجزّأً فقط، ويتجدد مع كل دخول، ويُلغى من «الدخول والأمان».
 * ٢) الدخول بالبصمة (WebAuthn / مفاتيح المرور): البصمة أو الوجه أو رمز قفل الجهاز لا تغادر الجهاز أبدًا؛
 *    الخادم يحفظ المفتاح العام فقط ويتحقق من توقيع كل دخول. لا حاجة لكتابة البريد: المفتاح يعرّف صاحبه.
 */
declare(strict_types=1);

const DEVICE_COOKIE = 'bhr_d';
const DEVICE_DAYS = 30;

function b64u_enc(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64u_dec(string $s): string {
    $s = strtr(trim($s), '-_', '+/'); $r = base64_decode($s . str_repeat('=', (4 - strlen($s) % 4) % 4), true);
    if ($r === false) throw new HttpError('bad_passkey'); return $r;
}
function is_https(): bool { return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'); }
function rp_id(): string { return strtolower((string)preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'))); }
/* المصدر المقبول: https دائمًا، و http للتجربة المحلية فقط */
function rp_origin_ok(string $o): bool {
    $h = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    if ($h === '' || $o === '') return false;
    if (strtolower($o) === 'https://' . $h) return true;
    return preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?$/', $h) === 1 && strtolower($o) === 'http://' . $h;
}

/* ---------- الجلسة (مشتركة بين الرمز والجهاز المحفوظ والبصمة) ---------- */
function open_session(array $u, string $how): void {
    q('UPDATE users SET fails=0, locked_until=NULL, last_login_at=? WHERE id=?', [now(), $u['id']]);
    $token = bin2hex(random_bytes(32));
    $hours = (int)cfg('session_hours');
    q('INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at, ip, ua) VALUES (?,?,?,?,?,?,?)',
        [hash('sha256', $token), $u['id'], now(), now(), date('Y-m-d H:i:s', time() + $hours * 3600), client_ip(), substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255)]);
    set_session_cookie($token, time() + $hours * 3600);
    $who = $u['name'] ?: $u['email'];
    audit_log('', 'تسجيل دخول' . ($how !== '' ? ' ' . $how : ''), $who, $who);
}

/* اسم مفهوم للجهاز من بيانات المتصفح: «Chrome على Windows» */
function ua_label(string $ua = ''): string {
    $ua = $ua !== '' ? $ua : (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
    $os = preg_match('/iPhone/i', $ua) ? 'iPhone' : (preg_match('/iPad/i', $ua) ? 'iPad' : (preg_match('/Android/i', $ua) ? 'Android' : (preg_match('/Windows/i', $ua) ? 'Windows' : (preg_match('/Mac OS X|Macintosh/i', $ua) ? 'Mac' : (preg_match('/Linux/i', $ua) ? 'Linux' : 'جهاز')))));
    $br = preg_match('/Edg\//', $ua) ? 'Edge' : (preg_match('/OPR\//', $ua) ? 'Opera' : (preg_match('/SamsungBrowser/', $ua) ? 'Samsung Internet' : (preg_match('/Firefox\//', $ua) ? 'Firefox' : (preg_match('/CriOS|Chrome\//', $ua) ? 'Chrome' : (preg_match('/Safari\//', $ua) ? 'Safari' : 'المتصفح')))));
    return $br . ' على ' . $os;
}

/* ---------- ١) حفظ الجهاز ---------- */
function set_device_cookie(string $value, int $expires): void {
    if (PHP_SAPI === 'cli') return;
    setcookie(DEVICE_COOKIE, $value, ['expires' => $expires, 'path' => '/', 'secure' => is_https(), 'httponly' => true, 'samesite' => 'Strict']);
}
function device_issue(array $u): void {
    $old = (string)($_COOKIE[DEVICE_COOKIE] ?? ''); /* الجهاز نفسه لا يُحفظ مرتين */
    if (preg_match('/^[a-f0-9]{64}$/', $old)) q('DELETE FROM devices WHERE id=?', [hash('sha256', $old)]);
    $tok = bin2hex(random_bytes(32)); $exp = time() + DEVICE_DAYS * 86400;
    q('INSERT INTO devices (id, user_id, label, ip, created_at, last_used_at, expires_at) VALUES (?,?,?,?,?,?,?)',
        [hash('sha256', $tok), $u['id'], ua_label(), client_ip(), now(), now(), date('Y-m-d H:i:s', $exp)]);
    /* عشرة أجهزة على الأكثر لكل حساب */
    $ids = q('SELECT id FROM devices WHERE user_id=? ORDER BY last_used_at DESC', [$u['id']])->fetchAll(PDO::FETCH_COLUMN);
    foreach (array_slice($ids, 10) as $old) q('DELETE FROM devices WHERE id=?', [$old]);
    set_device_cookie($tok, $exp);
}
/* الجهاز المحفوظ الحالي (أو null) */
function device_current(): ?array {
    $tok = (string)($_COOKIE[DEVICE_COOKIE] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $tok)) return null;
    $d = q1('SELECT * FROM devices WHERE id=?', [hash('sha256', $tok)]);
    if (!$d) { set_device_cookie('', time() - 3600); return null; }
    if ($d['expires_at'] < now()) { q('DELETE FROM devices WHERE id=?', [$d['id']]); set_device_cookie('', time() - 3600); return null; }
    $u = q1('SELECT * FROM users WHERE id=? AND active=1', [$d['user_id']]);
    if (!$u) return null;
    return ['d' => $d, 'u' => $u];
}
/* بطاقة «مرحبًا مجددًا» في صفحة الدخول */
function device_hello(): array {
    $c = device_current();
    if (!$c) return ['ok' => true, 'device' => null];
    $u = $c['u']; $nm = trim((string)$u['name']);
    return ['ok' => true, 'device' => ['name' => $nm !== '' ? $nm : mask_email((string)$u['email']), 'email' => mask_email((string)$u['email']), 'role' => ROLE_NAMES[$u['role']] ?? '',
        'passkey' => (int)q1('SELECT COUNT(*) n FROM passkeys WHERE user_id=?', [$u['id']])['n'] > 0]];
}
function device_login(): array {
    if (rate_hit('ip_dev:' . client_ip(), 30, 3600)) throw new HttpError('locked', 429);
    $c = device_current();
    if (!$c) throw new HttpError('device_expired', 401);
    $u = $c['u'];
    if ($u['locked_until'] && $u['locked_until'] > now()) throw new HttpError('locked', 429);
    /* يتجدد رمز الجهاز مع كل دخول (المسروق القديم لا يعمل) */
    q('DELETE FROM devices WHERE id=?', [$c['d']['id']]);
    device_issue($u);
    open_session($u, 'سريع من جهاز محفوظ');
    return ['ok' => true, 'user' => user_public($u)];
}
function device_forget(): array {
    $tok = (string)($_COOKIE[DEVICE_COOKIE] ?? '');
    if (preg_match('/^[a-f0-9]{64}$/', $tok)) q('DELETE FROM devices WHERE id=?', [hash('sha256', $tok)]);
    set_device_cookie('', time() - 3600);
    return ['ok' => true];
}

/* ---------- CBOR (لقراءة مفتاح المرور فقط) ---------- */
function cbor_len(string $s, int &$i, int $ai): int {
    if ($ai < 24) return $ai;
    $n = [24 => 1, 25 => 2, 26 => 4, 27 => 8][$ai] ?? 0;
    if (!$n || $i + $n > strlen($s)) throw new HttpError('bad_passkey');
    $v = 0; for ($k = 0; $k < $n; $k++) $v = ($v << 8) | ord($s[$i + $k]);
    $i += $n; return $v;
}
function cbor_item(string $s, int &$i, int $depth = 0) {
    if ($depth > 16 || $i >= strlen($s)) throw new HttpError('bad_passkey');
    $b = ord($s[$i++]); $mt = $b >> 5; $ai = $b & 31;
    if ($mt === 7) { if ($ai === 20) return false; if ($ai === 21) return true; if ($ai === 22 || $ai === 23) return null; throw new HttpError('bad_passkey'); }
    $len = cbor_len($s, $i, $ai);
    switch ($mt) {
        case 0: return $len;
        case 1: return -1 - $len;
        case 2: case 3: if ($i + $len > strlen($s)) throw new HttpError('bad_passkey'); $v = substr($s, $i, $len); $i += $len; return $v;
        case 4: $a = []; for ($k = 0; $k < $len; $k++) $a[] = cbor_item($s, $i, $depth + 1); return $a;
        case 5: $m = []; for ($k = 0; $k < $len; $k++) { $key = cbor_item($s, $i, $depth + 1); $m[$key] = cbor_item($s, $i, $depth + 1); } return $m;
    }
    throw new HttpError('bad_passkey');
}

/* ---------- مفتاح COSE → PEM ---------- */
function der_len(int $n): string { if ($n < 128) return chr($n); $o = ''; while ($n > 0) { $o = chr($n & 255) . $o; $n >>= 8; } return chr(0x80 | strlen($o)) . $o; }
function der(int $tag, string $v): string { return chr($tag) . der_len(strlen($v)) . $v; }
function der_uint(string $b): string { $b = ltrim($b, "\0"); if ($b === '' || ord($b[0]) & 0x80) $b = "\0" . $b; return der(0x02, $b); }
function cose_to_pem(array $k): array {
    $kty = $k[1] ?? null; $alg = $k[3] ?? null;
    if ($kty === 2 && $alg === -7 && ($k[-1] ?? 0) === 1 && strlen((string)($k[-2] ?? '')) === 32 && strlen((string)($k[-3] ?? '')) === 32) {
        $spki = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200') . "\x04" . $k[-2] . $k[-3];
        $alg = -7;
    } elseif ($kty === 3 && $alg === -257 && is_string($k[-1] ?? null) && is_string($k[-2] ?? null)) {
        $rsa = der(0x30, der_uint($k[-1]) . der_uint($k[-2]));
        $spki = der(0x30, der(0x30, hex2bin('06092a864886f70d0101010500')) . der(0x03, "\0" . $rsa));
    } else throw new HttpError('passkey_alg');
    return [$alg, "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($spki), 64, "\n") . "-----END PUBLIC KEY-----\n"];
}

/* ---------- التحقق المشترك ---------- */
function pk_client_data(string $b64, string $type): array {
    $raw = b64u_dec($b64); $c = json_decode($raw, true);
    if (!is_array($c) || ($c['type'] ?? '') !== $type) throw new HttpError('bad_passkey');
    if (!rp_origin_ok((string)($c['origin'] ?? ''))) throw new HttpError('bad_passkey');
    return [$c, $raw];
}
function pk_auth_data(string $ad, bool $needAttested): array {
    if (strlen($ad) < 37) throw new HttpError('bad_passkey');
    if (!hash_equals(hash('sha256', rp_id(), true), substr($ad, 0, 32))) throw new HttpError('bad_passkey');
    $flags = ord($ad[32]);
    if (!($flags & 0x01) || !($flags & 0x04)) throw new HttpError('passkey_uv'); /* حضور المستخدم + التحقق منه (بصمة/وجه/رمز الجهاز) */
    $count = unpack('N', substr($ad, 33, 4))[1];
    $out = ['flags' => $flags, 'count' => $count];
    if ($needAttested) {
        if (!($flags & 0x40) || strlen($ad) < 55) throw new HttpError('bad_passkey');
        $n = unpack('n', substr($ad, 53, 2))[1];
        $out['credId'] = substr($ad, 55, $n);
        $i = 55 + $n; $out['cose'] = cbor_item($ad, $i);
        if (!is_array($out['cose']) || strlen($out['credId']) !== $n || $n < 16) throw new HttpError('bad_passkey');
    }
    return $out;
}
function user_handle(array $u): string { return substr(hash_hmac('sha256', 'uh:' . $u['id'], app_secret(), true), 0, 32); }

/* ---------- ٢) تسجيل بصمة هذا الجهاز (بعد الدخول) ---------- */
/* عمر الجلسة الحالية بالدقائق (تفعيل البصمة يحتاج دخولًا حديثًا) */
function session_age_min(): int {
    $tok = (string)($_COOKIE[SESSION_COOKIE] ?? ''); if (!preg_match('/^[a-f0-9]{64}$/', $tok)) return 99999;
    $s = q1('SELECT created_at FROM sessions WHERE id=?', [hash('sha256', $tok)]);
    return $s ? (int)floor((time() - strtotime($s['created_at'])) / 60) : 99999;
}
function pk_reg_start(): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    if (session_age_min() > 30) throw new HttpError('pk_fresh');
    $ch = random_bytes(32); kv_put('pkreg:' . $u['id'], b64u_enc($ch), 300);
    $ex = array_map(fn($c) => ['type' => 'public-key', 'id' => $c], q('SELECT cred_id FROM passkeys WHERE user_id=?', [$u['id']])->fetchAll(PDO::FETCH_COLUMN));
    return ['ok' => true, 'publicKey' => [
        'rp' => ['name' => 'منصة بنيان للموارد البشرية', 'id' => rp_id()],
        'user' => ['id' => b64u_enc(user_handle($u)), 'name' => (string)$u['email'], 'displayName' => (string)($u['name'] ?: $u['email'])],
        'challenge' => b64u_enc($ch), 'timeout' => 90000, 'attestation' => 'none',
        'pubKeyCredParams' => [['type' => 'public-key', 'alg' => -7], ['type' => 'public-key', 'alg' => -257]],
        'authenticatorSelection' => ['residentKey' => 'required', 'requireResidentKey' => true, 'userVerification' => 'required'],
        'excludeCredentials' => $ex]];
}
function pk_reg_finish(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $want = kv_get('pkreg:' . $u['id']); kv_del('pkreg:' . $u['id']);
    if (!$want) throw new HttpError('passkey_timeout');
    [$c] = pk_client_data((string)($b['clientDataJSON'] ?? ''), 'webauthn.create');
    if (!hash_equals($want, (string)($c['challenge'] ?? ''))) throw new HttpError('bad_passkey');
    $i = 0; $att = cbor_item(b64u_dec((string)($b['attestationObject'] ?? '')), $i);
    if (!is_array($att) || !is_string($att['authData'] ?? null)) throw new HttpError('bad_passkey');
    $ad = pk_auth_data($att['authData'], true);
    [$alg, $pem] = cose_to_pem($ad['cose']);
    if (!openssl_pkey_get_public($pem)) throw new HttpError('bad_passkey');
    $cid = b64u_enc($ad['credId']);
    if (q1('SELECT id FROM passkeys WHERE cred_id=?', [$cid])) throw new HttpError('passkey_exists');
    if ((int)q1('SELECT COUNT(*) n FROM passkeys WHERE user_id=?', [$u['id']])['n'] >= 10) throw new HttpError('passkey_many');
    $label = ua_label();
    q('INSERT INTO passkeys (user_id, cred_id, pubkey, alg, sign_count, label, created_at, last_used_at) VALUES (?,?,?,?,?,?,?,?)', [$u['id'], $cid, $pem, $alg, $ad['count'], $label, now(), now()]);
    audit_log('', 'تفعيل الدخول بالبصمة', $label, $u['_label']);
    return ['ok' => true, 'label' => $label];
}

/* ---------- ٣) الدخول بالبصمة (دون بريد) ---------- */
function pk_login_start(): array {
    if (rate_hit('ip_pk:' . client_ip(), 60, 3600)) throw new HttpError('locked', 429);
    $ch = b64u_enc(random_bytes(32)); kv_put('pkc:' . $ch, '1', 300);
    return ['ok' => true, 'publicKey' => ['challenge' => $ch, 'rpId' => rp_id(), 'timeout' => 90000, 'userVerification' => 'required', 'allowCredentials' => []]];
}
function pk_login_finish(array $b): array {
    if (rate_hit('ip_pkv:' . client_ip(), 40, 3600)) throw new HttpError('locked', 429);
    [$c, $cdj] = pk_client_data((string)($b['clientDataJSON'] ?? ''), 'webauthn.get');
    $ch = (string)($c['challenge'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_-]{20,100}$/', $ch) || !kv_get('pkc:' . $ch)) throw new HttpError('passkey_timeout');
    kv_del('pkc:' . $ch); /* لمرة واحدة */
    $row = q1('SELECT * FROM passkeys WHERE cred_id=?', [(string)($b['id'] ?? '')]);
    if (!$row) { usleep(400000); throw new HttpError('passkey_unknown', 401); }
    $adRaw = b64u_dec((string)($b['authenticatorData'] ?? ''));
    $ad = pk_auth_data($adRaw, false);
    $sig = b64u_dec((string)($b['signature'] ?? ''));
    if (openssl_verify($adRaw . hash('sha256', $cdj, true), $sig, (string)$row['pubkey'], OPENSSL_ALGO_SHA256) !== 1) { usleep(400000); throw new HttpError('bad_passkey', 401); }
    if ($ad['count'] > 0 && (int)$row['sign_count'] > 0 && $ad['count'] <= (int)$row['sign_count']) {
        audit_log('', 'رفض دخول بالبصمة', 'عدّاد المفتاح لم يتقدّم (احتمال نسخ المفتاح) · ' . $row['label']);
        throw new HttpError('bad_passkey', 401);
    }
    $u = q1('SELECT * FROM users WHERE id=? AND active=1', [$row['user_id']]);
    if (!$u) throw new HttpError('passkey_unknown', 401);
    if ($u['locked_until'] && $u['locked_until'] > now()) throw new HttpError('locked', 429);
    q('UPDATE passkeys SET sign_count=?, last_used_at=? WHERE id=?', [$ad['count'], now(), $row['id']]);
    open_session($u, 'بالبصمة');
    if (!empty($b['remember'])) device_issue($u);
    return ['ok' => true, 'user' => user_public($u)];
}

/* ---------- «الدخول والأمان»: بصمات الحساب وأجهزته ---------- */
function sec_list(): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $cur = (string)($_COOKIE[DEVICE_COOKIE] ?? ''); $curId = preg_match('/^[a-f0-9]{64}$/', $cur) ? hash('sha256', $cur) : '';
    $pk = array_map(fn($r) => ['id' => (int)$r['id'], 'label' => $r['label'], 'created' => substr($r['created_at'], 0, 16), 'used' => substr((string)$r['last_used_at'], 0, 16)],
        q('SELECT * FROM passkeys WHERE user_id=? ORDER BY last_used_at DESC', [$u['id']])->fetchAll());
    $dv = array_map(fn($r) => ['id' => substr($r['id'], 0, 16), 'label' => $r['label'], 'created' => substr($r['created_at'], 0, 16), 'used' => substr((string)$r['last_used_at'], 0, 16), 'expires' => substr($r['expires_at'], 0, 10), 'current' => $r['id'] === $curId],
        q('SELECT * FROM devices WHERE user_id=? AND expires_at > ? ORDER BY last_used_at DESC', [$u['id'], now()])->fetchAll());
    return ['ok' => true, 'passkeys' => $pk, 'devices' => $dv, 'deviceDays' => DEVICE_DAYS];
}
function sec_remove(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $kind = (string)($b['kind'] ?? ''); $id = (string)($b['id'] ?? '');
    if ($kind === 'passkey') {
        $r = q1('SELECT * FROM passkeys WHERE id=? AND user_id=?', [(int)$id, $u['id']]); if (!$r) throw new HttpError('not_found', 404);
        q('DELETE FROM passkeys WHERE id=?', [$r['id']]); audit_log('', 'إلغاء بصمة', $r['label'], $u['_label']);
    } elseif ($kind === 'device' && preg_match('/^[a-f0-9]{16}$/', $id)) {
        $r = q1('SELECT * FROM devices WHERE user_id=? AND id LIKE ?', [$u['id'], $id . '%']); if (!$r) throw new HttpError('not_found', 404);
        q('DELETE FROM devices WHERE id=?', [$r['id']]); audit_log('', 'إلغاء جهاز محفوظ', $r['label'], $u['_label']);
    } elseif ($kind === 'remember') {
        $c = device_current(); if ($c) q('DELETE FROM devices WHERE id=?', [$c['d']['id']]);
        device_issue($u); audit_log('', 'حفظ جهاز للدخول السريع', ua_label(), $u['_label']);
    } else throw new HttpError('bad_request');
    return sec_list();
}
