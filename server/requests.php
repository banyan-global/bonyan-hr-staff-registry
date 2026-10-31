<?php
/**
 * طلبات المنسوبين: إجازة · أمر إركاب · تعريف بالراتب
 * - لكل طلب رقم ثابت (LV-2026-0001) ومسار اعتماد بالأدوار، ويُسجَّل كل قرار باسم صاحبه ووقته
 * - المنسوب يقدّم من صفحته، والموارد البشرية تستطيع التقديم نيابة عنه
 * - المتابعة متاحة بلا دخول برقم الطلب والبريد المسجّل (دون تفاصيل حساسة)
 */
declare(strict_types=1);

const REQ_TYPES = [
    'leave'  => ['LV', 'طلب إجازة', 'BNY-F-HR-05'],
    'travel' => ['TR', 'أمر إركاب / مهمة رسمية', 'BNY-F-HR-08'],
    'cert'   => ['CR', 'تعريف بالراتب أو شهادة خبرة', 'BNY-F-HR-16'],
];
/* مسار الاعتماد لكل نوع: [الدور الذي يعتمد، اسم الخطوة] — مدير النظام يستطيع اعتماد أي خطوة */
const REQ_CHAINS = [
    'leave'  => [['hr', 'الموارد البشرية']],
    'travel' => [['hr', 'الموارد البشرية'], ['ceo', 'الرئيس التنفيذي']],
    'cert'   => [['hr', 'الموارد البشرية']],
];
const REQ_ST = ['pending' => 'قيد الإجراء', 'approved' => 'معتمد', 'rejected' => 'مرفوض', 'cancelled' => 'ملغى'];
const LEAVE_KINDS = ['اعتيادية', 'مرضية', 'اضطرارية', 'بدون راتب', 'أخرى'];
const CERT_KINDS = ['تعريف بالراتب', 'شهادة خبرة', 'تعريف بدون راتب'];

function req_str($v, int $max = 300): string { return mb_substr(safe_text($v ?? ''), 0, $max); }
function req_date($v): string { $v = trim((string)$v); return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) && checkdate((int)substr($v, 5, 2), (int)substr($v, 8, 2), (int)substr($v, 0, 4)) ? $v : ''; }
function req_days(string $a, string $b): int { if (!$a || !$b) return 0; $d = (int)round((strtotime($b) - strtotime($a)) / 86400) + 1; return max(0, $d); }

/* يتحقق من بيانات كل نوع ويعيدها نظيفة */
function req_clean(string $type, array $d): array {
    if ($type === 'leave') {
        $o = ['kind' => in_array($d['kind'] ?? '', LEAVE_KINDS, true) ? $d['kind'] : '', 'from' => req_date($d['from'] ?? ''), 'to' => req_date($d['to'] ?? ''),
            'substitute' => req_str($d['substitute'] ?? '', 120), 'contact' => req_str($d['contact'] ?? '', 60), 'note' => req_str($d['note'] ?? '', 1500)];
        if (!$o['kind']) throw new HttpError('اختر نوع الإجازة');
        if (!$o['from'] || !$o['to'] || $o['to'] < $o['from']) throw new HttpError('تحقق من تاريخي البداية والنهاية');
        $o['days'] = req_days($o['from'], $o['to']);
        if ($o['days'] > 120) throw new HttpError('مدة الإجازة أطول من المسموح في طلب واحد');
        return $o;
    }
    if ($type === 'travel') {
        $o = ['dest' => req_str($d['dest'] ?? '', 160), 'purpose' => req_str($d['purpose'] ?? '', 1500), 'from' => req_date($d['from'] ?? ''), 'to' => req_date($d['to'] ?? ''),
            'transport' => in_array($d['transport'] ?? '', ['طيران', 'بري', 'لا يلزم'], true) ? $d['transport'] : 'طيران', 'hotel' => !empty($d['hotel']),
            'advance' => max(0, min(1000000, (float)($d['advance'] ?? 0))), 'currency' => preg_match('/^[A-Z]{3}$/', (string)($d['currency'] ?? '')) ? $d['currency'] : 'SAR'];
        if ($o['dest'] === '' || $o['purpose'] === '') throw new HttpError('اكتب الوجهة والغرض من المهمة');
        if (!$o['from'] || !$o['to'] || $o['to'] < $o['from']) throw new HttpError('تحقق من تاريخي السفر والعودة');
        $o['days'] = req_days($o['from'], $o['to']);
        return $o;
    }
    $o = ['kind' => in_array($d['kind'] ?? '', CERT_KINDS, true) ? $d['kind'] : '', 'to' => req_str($d['to'] ?? '', 160), 'lang' => in_array($d['lang'] ?? '', ['العربية', 'الإنجليزية'], true) ? $d['lang'] : 'العربية', 'note' => req_str($d['note'] ?? '', 800)];
    if (!$o['kind'] || $o['to'] === '') throw new HttpError('اختر نوع الخطاب واكتب الجهة الموجّه إليها');
    return $o;
}
function req_next_no(string $type): string {
    $p = REQ_TYPES[$type][0] . '-' . date('Y') . '-';
    $r = q1('SELECT no FROM requests WHERE no LIKE ? ORDER BY no DESC LIMIT 1', [$p . '%']);
    return $p . str_pad((string)((int)($r ? substr($r['no'], -4) : 0) + 1), 4, '0', STR_PAD_LEFT);
}
function req_row(array $r, bool $full = true): array {
    $s = staff_get($r['ref']); $d = $s ? $s['data'] : [];
    $o = ['no' => $r['no'], 'ref' => $r['ref'], 'type' => $r['type'], 'typeName' => REQ_TYPES[$r['type']][1], 'form' => REQ_TYPES[$r['type']][2],
        'status' => $r['status'], 'statusName' => REQ_ST[$r['status']] ?? $r['status'], 'stage' => (int)$r['stage'],
        'chain' => json_decode($r['chain'], true) ?: [], 'createdAt' => substr($r['created_at'], 0, 16), 'updatedAt' => substr($r['updated_at'], 0, 16),
        'name' => $s ? staff_name($s) : $r['ref']];
    if ($full) {
        $o['data'] = json_decode($r['data'], true) ?: [];
        $o['createdBy'] = $r['created_by'];
        $o['staff'] = ['entity' => (string)($d['entity'] ?? ''), 'jobTitle' => (string)($d['jobTitle'] ?? ''), 'department' => (string)($d['department'] ?? ''),
            'manager' => (string)($d['manager'] ?? ''), 'mobile' => (string)($d['mobile'] ?? ''), 'email' => (string)(($d['officialEmail'] ?? '') ?: ($d['personalEmail'] ?? '')),
            'employeeNo' => (string)($d['employeeNo'] ?? ''), 'workCountry' => (string)($d['workCountry'] ?? '')];
    }
    return $o;
}
/* ============ النماذج الإدارية ومسؤولو اعتمادها (يحددهم مدير النظام) ============
   الخطوة إمّا «دور» (كل حساب بهذا الدور ولديه صلاحية الاعتماد) أو «حساب محدد» بالاسم.
   التعديل يسري على الطلبات الجديدة؛ الطلب القائم يكمل المسار الذي قُدّم عليه. */
const REQ_FORM_INFO = [
    'leave'  => 'إجازة اعتيادية أو مرضية أو اضطرارية أو بدون راتب، بتاريخ البداية والنهاية والقائم بالعمل.',
    'travel' => 'تكليف بمهمة رسمية: الوجهة والغرض والتواريخ ووسيلة السفر والسكن والسلفة.',
    'cert'   => 'خطاب تعريف بالراتب أو شهادة خبرة موجّه إلى جهة، بالعربية أو الإنجليزية.',
];
const REQ_STEP_ROLES = ['hr', 'ceo', 'admin', 'viewer'];
function req_flow(): array {
    $saved = json_decode((string)(setting('req_flow') ?: ''), true); $saved = is_array($saved) ? $saved : [];
    $out = [];
    foreach (REQ_CHAINS as $t => $def) {
        $f = $saved[$t] ?? null;
        $steps = is_array($f['steps'] ?? null) && $f['steps'] ? $f['steps'] : array_map(fn($c) => ['kind' => 'role', 'v' => $c[0], 'label' => $c[1]], $def);
        $out[$t] = ['on' => isset($f['on']) ? (bool)$f['on'] : true, 'steps' => array_values($steps)];
    }
    return $out;
}
/* سلسلة الطلب الجديد من الإعداد الحالي */
function req_new_chain(string $type): array {
    return array_map(function ($s) {
        $c = ['label' => (string)$s['label'], 'decision' => '', 'by' => '', 'at' => '', 'note' => ''];
        if (($s['kind'] ?? '') === 'user') { $c['user'] = (int)$s['v']; $c['role'] = ''; } else $c['role'] = (string)$s['v'];
        return $c;
    }, req_flow()[$type]['steps']);
}
/* من يعتمد هذه الخطوة؟ (حسابات نشطة) */
function req_step_people(array $step): array {
    if (!empty($step['user'])) { $u = q1('SELECT * FROM users WHERE id=? AND active=1', [(int)$step['user']]); return $u ? [$u] : []; }
    return array_values(array_filter(q('SELECT * FROM users WHERE active=1 AND role=?', [(string)($step['role'] ?? '')])->fetchAll(), fn($u) => in_array('requests.approve', user_perms($u), true)));
}
/* هل يستطيع هذا الحساب اتخاذ القرار في الخطوة الحالية؟ مدير النظام يستطيع دائمًا (للطوارئ) */
function req_can_decide(array $u, array $r): bool {
    if ($r['status'] !== 'pending') return false;
    $chain = json_decode($r['chain'], true) ?: []; $step = $chain[(int)$r['stage']] ?? null;
    if (!$step) return false;
    if ($u['role'] === 'admin' && has_perm($u, 'requests.approve')) return true;
    if (!empty($step['user'])) return (int)$step['user'] === (int)$u['id'];
    return has_perm($u, 'requests.approve') && $u['role'] === ($step['role'] ?? '');
}
function req_forms(): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $flow = req_flow(); $isAdmin = has_perm($u, 'users.manage'); $forms = [];
    $cnt = []; foreach (q('SELECT type, status, COUNT(*) n FROM requests GROUP BY type, status')->fetchAll() as $r) $cnt[$r['type']][$r['status']] = (int)$r['n'];
    foreach (REQ_TYPES as $t => $T) {
        $steps = array_map(function ($s) {
            $c = ($s['kind'] ?? '') === 'user' ? ['user' => (int)$s['v']] : ['role' => (string)$s['v']];
            $people = array_map(fn($p) => ['id' => (int)$p['id'], 'name' => $p['name'] ?: mask_email((string)$p['email'])], req_step_people($c));
            return ['kind' => $s['kind'], 'v' => $s['v'], 'label' => $s['label'], 'people' => $people];
        }, $flow[$t]['steps']);
        $forms[] = ['type' => $t, 'code' => $T[2], 'prefix' => $T[0], 'name' => $T[1], 'info' => REQ_FORM_INFO[$t] ?? '', 'on' => $flow[$t]['on'], 'steps' => $steps,
            'total' => array_sum($cnt[$t] ?? []), 'pending' => $cnt[$t]['pending'] ?? 0];
    }
    return ['ok' => true, 'forms' => $forms, 'roles' => array_intersect_key(ROLE_NAMES, array_flip(REQ_STEP_ROLES)), 'canEdit' => $isAdmin];
}
function req_forms_save(array $b): array {
    $me = require_perm('users.manage');
    $t = (string)($b['type'] ?? ''); if (!isset(REQ_TYPES[$t])) throw new HttpError('نوع النموذج غير معروف');
    $in = is_array($b['steps'] ?? null) ? $b['steps'] : [];
    if (!$in) throw new HttpError('أضف خطوة اعتماد واحدة على الأقل');
    if (count($in) > 5) throw new HttpError('خمس خطوات على الأكثر');
    $steps = []; $seen = [];
    foreach ($in as $s) {
        $kind = ($s['kind'] ?? '') === 'user' ? 'user' : 'role';
        $label = req_str($s['label'] ?? '', 60);
        if ($kind === 'user') {
            $u = q1("SELECT * FROM users WHERE id=? AND active=1 AND role <> 'staff'", [(int)($s['v'] ?? 0)]);
            if (!$u) throw new HttpError('اختر حسابًا نشطًا لكل خطوة');
            $v = (int)$u['id']; if ($label === '') $label = $u['title'] ?: $u['name'];
        } else {
            $v = (string)($s['v'] ?? ''); if (!in_array($v, REQ_STEP_ROLES, true)) throw new HttpError('اختر المسؤول عن كل خطوة');
            if ($label === '') $label = ROLE_NAMES[$v];
        }
        if (mb_strlen($label) < 2) throw new HttpError('اكتب اسمًا لكل خطوة');
        $k = $kind . ':' . $v; if (isset($seen[$k])) throw new HttpError('المسؤول نفسه مكرر في خطوتين'); $seen[$k] = 1;
        $steps[] = ['kind' => $kind, 'v' => $v, 'label' => $label];
    }
    $flow = req_flow(); $flow[$t] = ['on' => !isset($b['on']) || (bool)$b['on'], 'steps' => $steps];
    setting_set('req_flow', json_encode($flow, JSON_UNESCAPED_UNICODE));
    audit_log('', 'تحديد مسؤولي اعتماد ' . REQ_TYPES[$t][1], ($flow[$t]['on'] ? '' : 'النموذج موقوف · ') . implode(' ← ', array_column($steps, 'label')), $me['_label']);
    return req_forms();
}
function req_summary(array $r): string {
    $d = json_decode($r['data'], true) ?: [];
    if ($r['type'] === 'leave') return 'إجازة ' . ($d['kind'] ?? '') . ' · ' . ($d['days'] ?? 0) . ' يومًا · من ' . ($d['from'] ?? '') . ' إلى ' . ($d['to'] ?? '');
    if ($r['type'] === 'travel') return 'مهمة إلى ' . ($d['dest'] ?? '') . ' · ' . ($d['days'] ?? 0) . ' أيام · من ' . ($d['from'] ?? '');
    return ($d['kind'] ?? '') . ' موجّه إلى ' . ($d['to'] ?? '');
}
function req_mail_staff(array $r, string $title, string $line): void {
    $s = staff_get($r['ref']); if (!$s) return;
    $to = trim((string)(($s['data']['officialEmail'] ?? '') ?: ($s['data']['personalEmail'] ?? '')));
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return;
    $inner = '<p style="margin:0 0 10px;font-size:14px;line-height:1.9;color:#1D2A3B;">' . esc_html($line) . '</p>'
        . '<table style="border-collapse:collapse;width:100%;font-size:13.5px;"><tr><td style="padding:5px 0;color:#6B778A;width:110px;">رقم الطلب</td><td style="padding:5px 0;font-weight:800;direction:ltr;text-align:right;">' . esc_html($r['no']) . '</td></tr>'
        . '<tr><td style="padding:5px 0;color:#6B778A;">التفاصيل</td><td style="padding:5px 0;">' . esc_html(req_summary($r)) . '</td></tr></table>'
        . '<div style="margin:14px 0 6px;"><a href="' . esc_html(cfg('site_url')) . '#myreq" style="display:inline-block;padding:9px 18px;border-radius:10px;background:#16294A;color:#fff;font-weight:700;font-size:13px;text-decoration:none;">متابعة طلبي</a></div>';
    try { send_mail($to, $title . ' · ' . $r['no'], mail_frame('الموارد البشرية · طلباتي', $title, $inner), $line . "\n" . $r['no'] . "\n" . req_summary($r), 'الموارد البشرية · مجموعة بنيان العالمية', logo_inline(), (string)cfg('hr_notify')); }
    catch (Throwable $e) { audit_log($r['ref'], 'تعذّر إرسال بريد الطلب', $r['no'] . ' · ' . $e->getMessage()); }
}
function req_mail_approvers(array $r, array $step): void {
    $list = [];
    foreach (req_step_people($step) as $u) $list[strtolower($u['email'])] = 1;
    /* مدير النظام تصله نسخة إن كانت تنبيهاته مفعّلة (يستطيع الاعتماد عند الطوارئ) */
    foreach (q("SELECT * FROM users WHERE active=1 AND role='admin'")->fetchAll() as $u) if (user_notify($u) && in_array('requests.approve', user_perms($u), true)) $list[strtolower($u['email'])] = 1;
    $s = staff_get($r['ref']); $name = $s ? staff_name($s) : $r['ref'];
    $inner = '<p style="margin:0 0 10px;font-size:14px;color:#1D2A3B;">طلب جديد بانتظار قرارك من <b>' . esc_html($name) . '</b>.</p><p style="margin:0 0 10px;font-size:13.5px;color:#3D4A60;">' . esc_html(req_summary($r)) . '</p>'
        . '<div style="margin:14px 0 6px;"><a href="' . esc_html(cfg('site_url')) . '#reqs" style="display:inline-block;padding:9px 18px;border-radius:10px;background:#16294A;color:#fff;font-weight:700;font-size:13px;text-decoration:none;">فتح الطلب</a></div>';
    foreach (array_keys($list) as $to) {
        try { send_mail($to, 'بانتظار اعتمادك: ' . REQ_TYPES[$r['type']][1] . ' · ' . $r['no'], mail_frame('Bonyan HR · الطلبات', REQ_TYPES[$r['type']][1], $inner), req_summary($r), 'منصة بنيان للموارد البشرية', logo_inline()); }
        catch (Throwable $e) { audit_log($r['ref'], 'تعذّر إرسال تنبيه الاعتماد', mask_email($to)); }
    }
}

/* تقديم طلب: المنسوب لنفسه، أو الموارد البشرية نيابة عن منسوب */
function req_create(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $type = (string)($b['type'] ?? ''); if (!isset(REQ_TYPES[$type])) throw new HttpError('نوع الطلب غير معروف');
    $mine = my_staff_ref($u);
    $ref = (string)($b['ref'] ?? '');
    if ($ref === '' || $ref === $mine) { if (!$mine) throw new HttpError('لا يوجد سجل منسوب لهذا الحساب'); $ref = $mine; $by = $u['name'] ?: $u['email']; }
    else { if (!has_perm($u, 'staff.edit')) throw new HttpError('forbidden', 403); if (!staff_get($ref)) throw new HttpError('not_found', 404); $by = ($u['name'] ?: $u['email']) . ' (نيابة عن المنسوب)'; }
    if (rate_hit('req:' . $u['id'], 30, 86400)) throw new HttpError('too_many', 429);
    if (!req_flow()[$type]['on']) throw new HttpError('هذا النموذج موقوف حاليًا. تواصل مع الموارد البشرية.');
    $data = req_clean($type, is_array($b['data'] ?? null) ? $b['data'] : []);
    $chain = req_new_chain($type);
    named_lock('req_no');
    try {
        $no = req_next_no($type);
        q('INSERT INTO requests (no, ref, type, status, stage, chain, data, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [$no, $ref, $type, 'pending', 0, json_encode($chain, JSON_UNESCAPED_UNICODE), json_encode($data, JSON_UNESCAPED_UNICODE), $by, now(), now()]);
    } finally { named_unlock('req_no'); }
    $r = q1('SELECT * FROM requests WHERE no=?', [$no]);
    audit_log($ref, 'تقديم ' . REQ_TYPES[$type][1], $no . ' · ' . req_summary($r), $by);
    req_mail_staff($r, 'استلمنا طلبك', 'استلمت الموارد البشرية طلبك، وسيصلك بريد عند كل خطوة في مساره.');
    req_mail_approvers($r, $chain[0]);
    return ['ok' => true, 'request' => req_row($r) + ['canDecide' => req_can_decide($u, $r)]];
}
function req_list(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    if (has_perm($u, 'staff.view')) {
        $rows = q('SELECT * FROM requests ORDER BY id DESC LIMIT 500')->fetchAll();
        return ['ok' => true, 'rows' => array_map(function ($r) use ($u) { return req_row($r, true) + ['canDecide' => req_can_decide($u, $r)]; }, $rows)];
    }
    $ref = my_staff_ref($u); if (!$ref) return ['ok' => true, 'rows' => []];
    $rows = q('SELECT * FROM requests WHERE ref=? ORDER BY id DESC', [$ref])->fetchAll();
    return ['ok' => true, 'rows' => array_map(function ($r) { return req_row($r, true) + ['canDecide' => false]; }, $rows)];
}
function req_decide(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $r = q1('SELECT * FROM requests WHERE no=?', [(string)($b['no'] ?? '')]); if (!$r) throw new HttpError('not_found', 404);
    if (!req_can_decide($u, $r)) throw new HttpError('هذه الخطوة ليست من صلاحيتك أو سبق اتخاذ القرار فيها', 403);
    $ok = ($b['decision'] ?? '') === 'approve'; $note = req_str($b['note'] ?? '', 600);
    if (!$ok && $note === '') throw new HttpError('اكتب سبب الرفض ليصل إلى المنسوب');
    $chain = json_decode($r['chain'], true); $i = (int)$r['stage'];
    $chain[$i] = array_merge($chain[$i], ['decision' => $ok ? 'approve' : 'reject', 'by' => $u['name'] ?: $u['email'], 'at' => now_min(), 'note' => $note]);
    $last = $i >= count($chain) - 1;
    $status = !$ok ? 'rejected' : ($last ? 'approved' : 'pending'); $stage = $ok && !$last ? $i + 1 : $i;
    q('UPDATE requests SET chain=?, status=?, stage=?, updated_at=? WHERE id=?', [json_encode($chain, JSON_UNESCAPED_UNICODE), $status, $stage, now(), $r['id']]);
    $r = q1('SELECT * FROM requests WHERE id=?', [$r['id']]);
    audit_log($r['ref'], ($ok ? 'اعتماد ' : 'رفض ') . REQ_TYPES[$r['type']][1], $r['no'] . ' · ' . $chain[$i]['label'] . ($note ? ' · ' . $note : ''), $u['_label']);
    if ($status === 'approved') req_mail_staff($r, 'اعتُمد طلبك', 'اعتُمد طلبك نهائيًا.' . ($note ? ' ملاحظة: ' . $note : ''));
    elseif ($status === 'rejected') req_mail_staff($r, 'لم يُعتمد طلبك', 'لم يُعتمد طلبك. السبب: ' . $note);
    else { req_mail_staff($r, 'تقدّم طلبك خطوة', 'وافقت ' . $chain[$i]['label'] . ' على طلبك، وهو الآن عند ' . $chain[$stage]['label'] . '.'); req_mail_approvers($r, $chain[$stage]); }
    return ['ok' => true, 'request' => req_row($r) + ['canDecide' => req_can_decide($u, $r)]];
}
function req_cancel(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $r = q1('SELECT * FROM requests WHERE no=?', [(string)($b['no'] ?? '')]); if (!$r) throw new HttpError('not_found', 404);
    $own = my_staff_ref($u) === $r['ref'];
    if (!$own && !has_perm($u, 'staff.edit')) throw new HttpError('forbidden', 403);
    if ($r['status'] !== 'pending') throw new HttpError('لا يمكن إلغاء طلب بعد صدور القرار فيه');
    q("UPDATE requests SET status='cancelled', updated_at=? WHERE id=?", [now(), $r['id']]);
    audit_log($r['ref'], 'إلغاء ' . REQ_TYPES[$r['type']][1], $r['no'], $u['_label']);
    return ['ok' => true];
}
/* متابعة بلا دخول: رقم الطلب + البريد المسجّل في ملف المنسوب */
function req_track(array $b): array {
    if (rate_hit('reqtrack:' . client_ip(), 30, 3600)) throw new HttpError('locked', 429);
    $no = strtoupper(preg_replace('/\s+/', '', (string)($b['no'] ?? ''))); $mail = strtolower(trim((string)($b['email'] ?? '')));
    $r = $no !== '' ? q1('SELECT * FROM requests WHERE no=?', [$no]) : null;
    $s = $r ? staff_get($r['ref']) : null;
    $mails = $s ? array_filter(array_map(function ($k) use ($s) { return strtolower(trim((string)($s['data'][$k] ?? ''))); }, ['officialEmail', 'personalEmail'])) : [];
    if (!$r || !$mail || !in_array($mail, $mails, true)) { usleep(500000); throw new HttpError('لم نجد طلبًا بهذا الرقم والبريد'); }
    $chain = array_map(function ($c) { return ['label' => $c['label'], 'decision' => $c['decision'], 'at' => $c['at'], 'note' => $c['decision'] === 'reject' ? $c['note'] : '']; }, json_decode($r['chain'], true) ?: []);
    return ['ok' => true, 'no' => $r['no'], 'typeName' => REQ_TYPES[$r['type']][1], 'status' => $r['status'], 'statusName' => REQ_ST[$r['status']], 'stage' => (int)$r['stage'], 'chain' => $chain, 'createdAt' => substr($r['created_at'], 0, 16)];
}
