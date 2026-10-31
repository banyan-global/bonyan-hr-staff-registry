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
/* هل يستطيع هذا الحساب اتخاذ القرار في الخطوة الحالية؟ */
function req_can_decide(array $u, array $r): bool {
    if ($r['status'] !== 'pending' || !has_perm($u, 'requests.approve')) return false;
    $chain = json_decode($r['chain'], true) ?: []; $step = $chain[(int)$r['stage']] ?? null;
    return $step && ($u['role'] === 'admin' || $u['role'] === $step['role']);
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
function req_mail_approvers(array $r, string $role): void {
    $list = [];
    foreach (q('SELECT * FROM users WHERE active=1 AND role IN (?, ?)', [$role, 'admin'])->fetchAll() as $u) {
        if ($u['role'] === 'admin' && $role !== 'admin' && !user_notify($u)) continue;
        if (in_array('requests.approve', user_perms($u), true)) $list[strtolower($u['email'])] = 1;
    }
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
    $data = req_clean($type, is_array($b['data'] ?? null) ? $b['data'] : []);
    $chain = array_map(function ($c) { return ['role' => $c[0], 'label' => $c[1], 'decision' => '', 'by' => '', 'at' => '', 'note' => '']; }, REQ_CHAINS[$type]);
    named_lock('req_no');
    try {
        $no = req_next_no($type);
        q('INSERT INTO requests (no, ref, type, status, stage, chain, data, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [$no, $ref, $type, 'pending', 0, json_encode($chain, JSON_UNESCAPED_UNICODE), json_encode($data, JSON_UNESCAPED_UNICODE), $by, now(), now()]);
    } finally { named_unlock('req_no'); }
    $r = q1('SELECT * FROM requests WHERE no=?', [$no]);
    audit_log($ref, 'تقديم ' . REQ_TYPES[$type][1], $no . ' · ' . req_summary($r), $by);
    req_mail_staff($r, 'استلمنا طلبك', 'استلمت الموارد البشرية طلبك، وسيصلك بريد عند كل خطوة في مساره.');
    req_mail_approvers($r, $chain[0]['role']);
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
    $u = require_perm('requests.approve');
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
    else { req_mail_staff($r, 'تقدّم طلبك خطوة', 'وافقت ' . $chain[$i]['label'] . ' على طلبك، وهو الآن عند ' . $chain[$stage]['label'] . '.'); req_mail_approvers($r, $chain[$stage]['role']); }
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
