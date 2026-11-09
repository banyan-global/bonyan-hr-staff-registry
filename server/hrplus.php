<?php
/**
 * وحدات الموارد البشرية المكمّلة:
 * مستحقات واستقطاعات الشهر (العمل الإضافي والسلف) · الإجراءات الإدارية على ملف المنسوب · العهد وإخلاء الطرف
 * · تقييم الأداء · التوظيف — كلها تُسجَّل في سجل العمليات وتُفحص صلاحياتها في الخادم.
 */
declare(strict_types=1);

/* ============================================================ مستحقات واستقطاعات الشهر */
function pay_rate_hour(array $sd): float { $base = (float)preg_replace('/[^\d.]/', '', (string)($sd['salary'] ?? '')); return $base > 0 ? $base / 30 / 8 : 0.0; }
function pay_cur(array $sd): string { return preg_match('/[A-Z]{3}/', (string)($sd['currency'] ?? ''), $m) ? $m[0] : 'SAR'; }
function pay_month(array $b): array {
    require_perm('finance.view');
    $ym = preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', (string)($b['month'] ?? '')) ? (string)$b['month'] : date('Y-m');
    $from = $ym . '-01'; $to = date('Y-m-t', strtotime($from));
    $ot = []; $loans = [];
    foreach (q("SELECT * FROM requests WHERE status='approved' AND type IN ('ot','loan')")->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: [];
        if ($r['type'] === 'ot') {
            $day = (string)($d['day'] ?? ''); if ($day < $from || $day > $to) continue;
            $x = $ot[$r['ref']] ?? ['mins' => 0, 'wmins' => 0, 'nos' => []];
            $x['mins'] += (int)($d['mins'] ?? 0); if (!empty($d['weekend'])) $x['wmins'] += (int)($d['mins'] ?? 0); $x['nos'][] = $r['no']; $ot[$r['ref']] = $x;
        } else {
            $st = (string)($d['start'] ?? ''); $en = (string)($d['end'] ?? ''); if (!$st || $ym < $st || $ym > $en) continue;
            $k = 1; for ($t = strtotime($st . '-01'); date('Y-m', $t) < $ym; $t = strtotime('+1 month', $t)) $k++;
            $n = (int)($d['months'] ?? 1); $inst = (float)($d['inst'] ?? 0); $amt = (float)($d['amount'] ?? 0);
            /* آخر قسط يكمّل الفرق حتى لا يبقى كسر */
            $cur = $k === $n ? round($amt - $inst * ($n - 1), 2) : $inst;
            $loans[] = ['ref' => $r['ref'], 'no' => $r['no'], 'k' => $k, 'n' => $n, 'inst' => $cur, 'amount' => $amt, 'left' => round(max(0, $amt - $inst * ($k - 1) - $cur), 2)];
        }
    }
    /* جزاء الحسم من الأجر (مخالفة معتمدة) في شهر نفاذها */
    $pen = [];
    foreach (q("SELECT * FROM hr_actions WHERE status='issued' AND kind='violation'")->fetchAll() as $a) {
        $d = json_decode($a['data'], true) ?: []; $e = (string)($d['effective'] ?? ''); if ((int)($d['deduct'] ?? 0) < 1 || $e < $from || $e > $to) continue;
        $pen[$a['ref']][] = ['no' => $a['no'], 'days' => (int)$d['deduct']];
    }
    $rows = [];
    $refs = array_unique(array_merge(array_keys($ot), array_column($loans, 'ref'), array_keys($pen)));
    foreach ($refs as $ref) {
        $s = staff_get((string)$ref); $sd = $s ? $s['data'] : []; $h = pay_rate_hour($sd); $o = $ot[$ref] ?? null;
        $otAmt = $o ? round($o['mins'] / 60 * $h * 1.5, 2) : 0;
        $ln = array_values(array_filter($loans, fn($l) => $l['ref'] === $ref)); $ded = array_sum(array_column($ln, 'inst'));
        $pn = $pen[$ref] ?? []; $penAmt = 0; foreach ($pn as &$x) { $x['amount'] = round($h * 8 * $x['days'], 2); $penAmt += $x['amount']; } unset($x); $ded += $penAmt;
        $rows[] = ['ref' => (string)$ref, 'name' => $s ? staff_name($s) : (string)$ref, 'entity' => (string)($sd['entity'] ?? ''), 'cur' => pay_cur($sd), 'hourly' => round($h, 2),
            'otHours' => $o ? round($o['mins'] / 60, 2) : 0, 'otWeekend' => $o ? round($o['wmins'] / 60, 2) : 0, 'otNos' => $o['nos'] ?? [], 'otAmount' => $otAmt, 'noSalary' => $o && !$h,
            'loans' => $ln, 'pens' => $pn, 'deduct' => round($ded, 2), 'net' => round($otAmt - $ded, 2)];
    }
    usort($rows, fn($a, $b) => strcmp($a['name'], $b['name']));
    $months = []; for ($i = -6; $i <= 6; $i++) $months[] = date('Y-m', strtotime(date('Y-m-01') . ' ' . ($i >= 0 ? '+' : '') . $i . ' month'));
    return ['ok' => true, 'month' => $ym, 'rows' => $rows, 'months' => $months, 'rule' => 'أجر الساعة = الراتب الشهري ÷ 30 ÷ 8، والساعة الإضافية = أجر الساعة × 1.5'];
}

/* ============================================================ أدوات مشتركة */
function hrp_str($v, int $max = 300): string { return mb_substr(safe_text($v ?? ''), 0, $max); }
function hrp_date($v): string { $v = trim((string)$v); return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) && checkdate((int)substr($v, 5, 2), (int)substr($v, 8, 2), (int)substr($v, 0, 4)) ? $v : ''; }
function hrp_me(): array { $u = current_user(); if (!$u) throw new HttpError('auth_required', 401); return $u; }
function hrp_label(array $u): string { return (string)($u['_label'] ?? ($u['name'] ?: $u['email'])); }
/* الإدارة العليا (تعتمد القرارات المؤثرة في الملف): مدير النظام والرئيس التنفيذي ممن يملكون صلاحية الاعتماد */
function hrp_is_top(array $u): bool { return in_array($u['role'], ['admin', 'ceo'], true) && has_perm($u, 'requests.approve'); }
function hrp_mail(string $to, string $title, string $line, array $rows, string $hash, string $btn): void {
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return;
    $url = (string)cfg('site_url') . (strpos($hash, '.html') !== false ? $hash : '#' . $hash);
    $t = ''; foreach ($rows as $r) if ((string)$r[1] !== '') $t .= '<tr><td style="padding:6px 0;color:#6B778A;width:130px;vertical-align:top;">' . esc_html($r[0]) . '</td><td style="padding:6px 0;font-weight:700;color:#1D2A3B;">' . nl2br(esc_html((string)$r[1])) . '</td></tr>';
    $inner = '<p style="margin:0 0 10px;font-size:14px;line-height:1.9;color:#1D2A3B;">' . esc_html($line) . '</p>' . ($t ? '<table style="border-collapse:collapse;width:100%;font-size:13.5px;">' . $t . '</table>' : '')
        . ($hash !== '' ? '<div style="margin:16px 0 6px;"><a href="' . esc_html($url) . '" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#16294A;color:#fff;font-weight:700;font-size:13.5px;text-decoration:none;">' . esc_html($btn) . '</a></div>' : '');
    try { send_mail($to, $title, mail_frame('الموارد البشرية · مجموعة بنيان العالمية', $title, $inner), $line . ($hash !== '' ? "\n" . $url : ''), 'الموارد البشرية · مجموعة بنيان العالمية', logo_inline()); }
    catch (Throwable $e) { audit_log('', 'تعذّر إرسال بريد', $title . ' · ' . mask_email($to)); }
}
function hrp_staff_mail(string $ref): string { $s = staff_get($ref); return $s ? req_staff_email($s) : ''; }
function hrp_next_no(string $table, string $prefix): string {
    $p = $prefix . '-' . date('Y') . '-';
    $r = q1("SELECT no FROM $table WHERE no LIKE ? ORDER BY no DESC LIMIT 1", [$p . '%']);
    return $p . str_pad((string)((int)($r ? substr($r['no'], -4) : 0) + 1), 4, '0', STR_PAD_LEFT);
}

/* ============================================================ الإجراءات الإدارية على ملف المنسوب
   تصدرها الموارد البشرية؛ ما يغيّر الملف أو الراتب يعتمده أحد الإدارة العليا أولًا، ثم يُطبَّق ويصل المنسوب ليطّلع ويؤكد اطلاعه. */
const ACT_KINDS = [
    'notice'      => ['لفت نظر', 0],
    'warning'     => ['إنذار', 0],
    'violation'   => ['مخالفة وجزاء', 1],
    'thanks'      => ['شكر وتقدير', 0],
    'promotion'   => ['ترقية', 1],
    'transfer'    => ['نقل', 1],
    'raise'       => ['علاوة', 1],
    'termination' => ['إنهاء خدمة', 1],
];
const ACT_ST = ['pending' => 'بانتظار اعتماد الإدارة العليا', 'issued' => 'صادر', 'rejected' => 'لم يُعتمد', 'void' => 'ملغى'];
function act_row(array $a, bool $full = true): array {
    $s = staff_get($a['ref']); $d = json_decode($a['data'], true) ?: [];
    return ['id' => (int)$a['id'], 'no' => $a['no'], 'ref' => $a['ref'], 'name' => $s ? staff_name($s) : $a['ref'], 'entity' => (string)($s['data']['entity'] ?? ''), 'jobTitle' => (string)($s['data']['jobTitle'] ?? ''),
        'kind' => $a['kind'], 'kindName' => ACT_KINDS[$a['kind']][0] ?? $a['kind'], 'status' => $a['status'], 'statusName' => ACT_ST[$a['status']] ?? $a['status'], 'data' => $d,
        'createdBy' => $a['created_by'], 'createdAt' => substr($a['created_at'], 0, 16), 'decidedBy' => $a['decided_by'], 'decidedAt' => $a['decided_at'] ? substr($a['decided_at'], 0, 16) : '',
        'ackAt' => $a['ack_at'] ? substr($a['ack_at'], 0, 16) : '', 'ackNote' => $a['ack_note'], 'sum' => act_summary($a['kind'], $d)];
}
function act_summary(string $k, array $d): string {
    $n = ACT_KINDS[$k][0] ?? $k;
    if ($k === 'warning') return 'إنذار ' . ($d['degree'] ?? '');
    if ($k === 'violation') return 'مخالفة' . (!empty($d['deduct']) ? ' · حسم ' . $d['deduct'] . ' يوم' : '');
    if ($k === 'promotion') return 'ترقية إلى ' . ($d['newTitle'] ?? '');
    if ($k === 'transfer') return 'نقل إلى ' . trim(($d['newEntity'] ?? '') . ' ' . ($d['newDepartment'] ?? ''));
    if ($k === 'raise') return 'علاوة · الراتب الجديد ' . number_format((float)($d['newSalary'] ?? 0)) . ' ' . ($d['cur'] ?? '');
    if ($k === 'termination') return 'إنهاء خدمة · آخر يوم ' . ($d['lastDay'] ?? '');
    return $n . (($d['title'] ?? '') !== '' && $d['title'] !== $n ? ' · ' . $d['title'] : '');
}
function act_list(array $b): array {
    $u = hrp_me();
    if (has_perm($u, 'staff.view')) {
        $ref = (string)($b['ref'] ?? '');
        $rows = $ref !== '' ? q('SELECT * FROM hr_actions WHERE ref=? ORDER BY id DESC', [$ref])->fetchAll() : q('SELECT * FROM hr_actions ORDER BY id DESC LIMIT 600')->fetchAll();
        return ['ok' => true, 'rows' => array_map('act_row', $rows), 'kinds' => array_map(fn($k) => ['name' => $k[0], 'approve' => (bool)$k[1]], ACT_KINDS), 'canIssue' => has_perm($u, 'staff.edit'), 'canDecide' => hrp_is_top($u)];
    }
    $ref = my_staff_ref($u); if (!$ref || !site_on('staff', 'myhr')) return ['ok' => true, 'rows' => []];
    return ['ok' => true, 'rows' => array_map('act_row', q("SELECT * FROM hr_actions WHERE ref=? AND status='issued' ORDER BY id DESC", [$ref])->fetchAll())];
}
function act_save(array $b): array {
    $u = require_perm('staff.edit'); if (!site_on('modules', 'acts')) throw new HttpError('قسم الإجراءات الإدارية موقوف من الإعدادات');
    $ref = (string)($b['ref'] ?? ''); $s = staff_get($ref); if (!$s) throw new HttpError('اختر المنسوب');
    $k = (string)($b['kind'] ?? ''); if (!isset(ACT_KINDS[$k])) throw new HttpError('اختر نوع الإجراء');
    $in = is_array($b['data'] ?? null) ? $b['data'] : []; $sd = $s['data'];
    $d = ['title' => hrp_str($in['title'] ?? '', 160), 'effective' => hrp_date($in['effective'] ?? '') ?: date('Y-m-d'), 'details' => hrp_str($in['details'] ?? '', 3000)];
    if (mb_strlen(trim($d['details'])) < 5) throw new HttpError('اكتب تفاصيل الإجراء ومسوّغه (5 أحرف على الأقل)');
    if ($k === 'warning') { $d['degree'] = in_array($in['degree'] ?? '', ['أول', 'ثانٍ', 'نهائي'], true) ? $in['degree'] : ''; if (!$d['degree']) throw new HttpError('اختر درجة الإنذار'); }
    if ($k === 'violation') { $d['deduct'] = max(0, min(5, (int)to_ascii_digits((string)($in['deduct'] ?? '0')))); $d['vdate'] = hrp_date($in['vdate'] ?? '') ?: $d['effective']; }
    if ($k === 'promotion') { $d['newTitle'] = hrp_str($in['newTitle'] ?? '', 120); $d['newGrade'] = hrp_str($in['newGrade'] ?? '', 60); $d['oldTitle'] = (string)($sd['jobTitle'] ?? ''); $d['oldGrade'] = (string)($sd['grade'] ?? '');
        if (mb_strlen($d['newTitle']) < 2) throw new HttpError('اكتب المسمى الوظيفي الجديد'); }
    if ($k === 'transfer') { foreach (['newEntity' => 'entity', 'newDepartment' => 'department', 'newManager' => 'manager'] as $a => $o) { $d[$a] = hrp_str($in[$a] ?? '', 120); $d['old' . ucfirst($o)] = (string)($sd[$o] ?? ''); }
        if ($d['newEntity'] === '' && $d['newDepartment'] === '' && $d['newManager'] === '') throw new HttpError('اكتب الجهة أو الإدارة أو المدير الجديد'); }
    if ($k === 'raise') { $d['newSalary'] = round((float)to_ascii_digits((string)($in['newSalary'] ?? '0')), 2); $d['oldSalary'] = (float)preg_replace('/[^\d.]/', '', (string)($sd['salary'] ?? '')); $d['cur'] = pay_cur($sd);
        if ($d['newSalary'] <= 0) throw new HttpError('اكتب الراتب الجديد'); }
    if ($k === 'termination') { $d['lastDay'] = hrp_date($in['lastDay'] ?? ''); $d['reason'] = in_array($in['reason'] ?? '', ['انتهاء العقد', 'عدم اجتياز فترة التجربة', 'فصل لمخالفة جسيمة', 'إعادة هيكلة', 'أخرى'], true) ? $in['reason'] : '';
        if (!$d['lastDay'] || !$d['reason']) throw new HttpError('اكتب آخر يوم عمل واختر السبب'); }
    if ($d['title'] === '') $d['title'] = in_array($k, ['notice', 'thanks'], true) ? ACT_KINDS[$k][0] : act_summary($k, $d);
    $d['byId'] = (int)$u['id'];
    $need = (bool)ACT_KINDS[$k][1]; $st = $need ? 'pending' : 'issued';
    named_lock('act_no');
    try { $no = hrp_next_no('hr_actions', 'AC');
        q('INSERT INTO hr_actions (no, ref, kind, status, data, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)', [$no, $ref, $k, $st, json_encode($d, JSON_UNESCAPED_UNICODE), hrp_label($u), now(), now()]);
    } finally { named_unlock('act_no'); }
    $a = q1('SELECT * FROM hr_actions WHERE no=?', [$no]);
    audit_log($ref, 'إصدار إجراء إداري: ' . ACT_KINDS[$k][0], $no . ' · ' . act_summary($k, $d) . ($need ? ' · بانتظار اعتماد الإدارة العليا' : ''), hrp_label($u));
    if ($need) act_mail_top($a); else act_mail_staff($a);
    return ['ok' => true, 'row' => act_row($a)];
}
function act_mail_top(array $a): void {
    $r = act_row($a); $sent = [];
    foreach (q("SELECT * FROM users WHERE active=1 AND role IN ('admin','ceo')")->fetchAll() as $x) {
        if (!in_array('requests.approve', user_perms($x), true) || isset($sent[strtolower($x['email'])])) continue; $sent[strtolower($x['email'])] = 1;
        hrp_mail((string)$x['email'], 'بانتظار اعتمادك: ' . $r['kindName'] . ' · ' . $r['no'], 'إجراء إداري على ملف ' . $r['name'] . ' بانتظار اعتمادك قبل تطبيقه.', [['رقم الإجراء', $r['no']], ['المنسوب', $r['name']], ['الإجراء', $r['sum']], ['تاريخ النفاذ', $r['data']['effective'] ?? ''], ['المسوّغ', $r['data']['details'] ?? ''], ['أصدره', $r['createdBy']]], 'hract', 'فتح الإجراءات الإدارية');
    }
}
function act_mail_staff(array $a): void {
    $r = act_row($a); $to = hrp_staff_mail($a['ref']); if (!$to) return;
    hrp_mail($to, $r['kindName'] . ' · ' . $r['no'], 'صدر بحقك إجراء إداري من الموارد البشرية. اطّلع عليه في صفحتك وأكّد اطلاعك.', [['رقم الإجراء', $r['no']], ['الإجراء', $r['sum']], ['تاريخ النفاذ', $r['data']['effective'] ?? '']], 'myhr', 'الاطلاع على الإجراء');
}
function act_decide(array $b): array {
    $u = hrp_me(); if (!hrp_is_top($u) && !has_perm($u, 'requests.override')) throw new HttpError('الاعتماد للإدارة العليا', 403);
    $ok = ($b['decision'] ?? '') === 'approve'; $note = hrp_str($b['note'] ?? '', 600);
    if (!$ok && mb_strlen(trim($note)) < 3) throw new HttpError('اكتب سبب عدم الاعتماد');
    named_lock('act_dec');
    try {
        $a = q1('SELECT * FROM hr_actions WHERE id=?', [(int)($b['id'] ?? 0)]); if (!$a) throw new HttpError('not_found', 404);
        if ($a['status'] !== 'pending') throw new HttpError('سبق اتخاذ القرار في هذا الإجراء');
        if (my_staff_ref($u) === $a['ref']) throw new HttpError('لا يعتمد أحد إجراءً على ملفه');
        $d = json_decode($a['data'], true) ?: []; $d['decisionNote'] = $note;
        q('UPDATE hr_actions SET status=?, data=?, decided_by=?, decided_at=?, updated_at=? WHERE id=?', [$ok ? 'issued' : 'rejected', json_encode($d, JSON_UNESCAPED_UNICODE), hrp_label($u), now(), now(), $a['id']]);
        $a = q1('SELECT * FROM hr_actions WHERE id=?', [$a['id']]);
        if ($ok) act_apply($a, hrp_label($u));
    } finally { named_unlock('act_dec'); }
    audit_log($a['ref'], ($ok ? 'اعتماد إجراء إداري: ' : 'رفض إجراء إداري: ') . (ACT_KINDS[$a['kind']][0] ?? ''), $a['no'] . ($note ? ' · ' . $note : ''), hrp_label($u));
    if ($ok) act_mail_staff($a);
    $by = q1('SELECT email FROM users WHERE id=?', [(int)((json_decode($a['data'], true) ?: [])['byId'] ?? 0)]);
    if (!$ok && $by) hrp_mail((string)$by['email'], 'لم يُعتمد الإجراء ' . $a['no'], 'لم تعتمد الإدارة العليا الإجراء الذي أصدرته.', [['الإجراء', act_summary($a['kind'], json_decode($a['data'], true) ?: [])], ['السبب', $note]], 'hract', 'فتح الإجراءات الإدارية');
    return ['ok' => true, 'row' => act_row($a)];
}
/* تطبيق القرار المعتمد على ملف المنسوب (يبقى أثر القيم السابقة في الإجراء وفي سجل العمليات) */
function act_apply(array $a, string $actor): void {
    $d = json_decode($a['data'], true) ?: []; $s = staff_get($a['ref']); if (!$s) return; $ch = [];
    $set = function (string $k, $v) use (&$s, &$ch) { if ($v === '' || $v === null) return; $old = (string)($s['data'][$k] ?? ''); if ($old === (string)$v) return; $s['data'][$k] = $v; $ch[] = (['grade' => 'المرتبة', 'serviceStatus' => 'حالة الخدمة', 'serviceEnd' => 'آخر يوم عمل', 'endReason' => 'سبب انتهاء الخدمة'][$k] ?? col_title($k)) . ': ' . ($old ?: '—') . ' ← ' . $v; };
    if ($a['kind'] === 'promotion') { $set('jobTitle', $d['newTitle'] ?? ''); $set('grade', $d['newGrade'] ?? ''); }
    if ($a['kind'] === 'transfer') { $set('entity', $d['newEntity'] ?? ''); $set('department', $d['newDepartment'] ?? ''); $set('manager', $d['newManager'] ?? ''); }
    if ($a['kind'] === 'raise') $set('salary', (string)($d['newSalary'] ?? ''));
    if ($a['kind'] === 'termination') { $set('serviceStatus', 'إنهاء خدمة قيد الإخلاء'); $set('serviceEnd', $d['lastDay'] ?? ''); $set('endReason', $d['reason'] ?? ''); }
    if (!$ch) return;
    $s['updated_at'] = now(); staff_put($s);
    audit_log($a['ref'], 'تحديث الملف بقرار ' . $a['no'], implode(' · ', $ch), $actor);
}
function act_ack(array $b): array {
    $u = hrp_me(); $ref = my_staff_ref($u);
    $a = q1("SELECT * FROM hr_actions WHERE id=? AND status='issued'", [(int)($b['id'] ?? 0)]); if (!$a || $a['ref'] !== $ref) throw new HttpError('not_found', 404);
    if ($a['ack_at']) return ['ok' => true, 'row' => act_row($a)];
    q('UPDATE hr_actions SET ack_at=?, ack_note=?, updated_at=? WHERE id=?', [now(), hrp_str($b['note'] ?? '', 600), now(), $a['id']]);
    audit_log($ref, 'اطّلاع المنسوب على إجراء إداري', $a['no'] . (trim((string)($b['note'] ?? '')) !== '' ? ' · ملاحظته: ' . hrp_str($b['note'], 600) : ''), hrp_label($u));
    return ['ok' => true, 'row' => act_row(q1('SELECT * FROM hr_actions WHERE id=?', [$a['id']]))];
}
function act_void(array $b): array {
    $u = hrp_me(); if (($u['role'] ?? '') !== 'admin') throw new HttpError('إلغاء الإجراء لمدير النظام', 403);
    $note = hrp_str($b['note'] ?? '', 600); if (mb_strlen(trim($note)) < 3) throw new HttpError('اكتب سبب الإلغاء');
    $a = q1('SELECT * FROM hr_actions WHERE id=?', [(int)($b['id'] ?? 0)]); if (!$a) throw new HttpError('not_found', 404);
    if (!in_array($a['status'], ['pending', 'issued'], true)) throw new HttpError('الإجراء ليس قائمًا');
    $d = json_decode($a['data'], true) ?: []; $d['voidNote'] = $note;
    q("UPDATE hr_actions SET status='void', data=?, updated_at=? WHERE id=?", [json_encode($d, JSON_UNESCAPED_UNICODE), now(), $a['id']]);
    audit_log($a['ref'], 'إلغاء إجراء إداري', $a['no'] . ' · ' . $note . ($a['status'] === 'issued' && ACT_KINDS[$a['kind']][1] ? ' · التغييرات التي طُبّقت على الملف تُعدّل يدويًا إن لزم' : ''), hrp_label($u));
    return ['ok' => true, 'row' => act_row(q1('SELECT * FROM hr_actions WHERE id=?', [$a['id']]))];
}

/* ============================================================ العهد */
const CUS_CATS = ['جهاز حاسب', 'جوال أو جهاز لوحي', 'مفاتيح أو بطاقة دخول', 'سيارة', 'أثاث أو معدات', 'مستندات أو أختام', 'أخرى'];
function custody_open(string $ref): array { return q('SELECT * FROM custody WHERE ref=? AND returned_on IS NULL ORDER BY id', [$ref])->fetchAll(); }
function cus_row(array $c): array {
    $s = staff_get($c['ref']);
    return ['id' => (int)$c['id'], 'ref' => $c['ref'], 'name' => $s ? staff_name($s) : $c['ref'], 'entity' => (string)($s['data']['entity'] ?? ''), 'item' => $c['item'], 'category' => $c['category'], 'serial' => $c['serial'],
        'value' => $c['value'] !== null ? (float)$c['value'] : null, 'issuedOn' => $c['issued_on'], 'condOut' => $c['cond_out'], 'returnedOn' => $c['returned_on'] ?? '', 'condIn' => $c['cond_in'], 'note' => $c['note'],
        'by' => $c['created_by'], 'returnedBy' => $c['returned_by'], 'ackAt' => $c['ack_at'] ? substr($c['ack_at'], 0, 16) : '', 'open' => $c['returned_on'] === null];
}
function cus_list(array $b): array {
    $u = hrp_me();
    if (has_perm($u, 'staff.view')) {
        $ref = (string)($b['ref'] ?? '');
        $rows = $ref !== '' ? q('SELECT * FROM custody WHERE ref=? ORDER BY returned_on IS NULL DESC, id DESC', [$ref])->fetchAll() : q('SELECT * FROM custody ORDER BY returned_on IS NULL DESC, id DESC LIMIT 1000')->fetchAll();
        return ['ok' => true, 'rows' => array_map('cus_row', $rows), 'cats' => CUS_CATS, 'canEdit' => has_perm($u, 'staff.edit')];
    }
    $ref = my_staff_ref($u); if (!$ref || !site_on('staff', 'myhr')) return ['ok' => true, 'rows' => []];
    return ['ok' => true, 'rows' => array_map('cus_row', q('SELECT * FROM custody WHERE ref=? ORDER BY returned_on IS NULL DESC, id DESC', [$ref])->fetchAll())];
}
function cus_save(array $b): array {
    $u = require_perm('staff.edit');
    $ref = (string)($b['ref'] ?? ''); if (!staff_get($ref)) throw new HttpError('اختر المنسوب');
    $item = hrp_str($b['item'] ?? '', 160); if (mb_strlen($item) < 2) throw new HttpError('اكتب وصف العهدة');
    $cat = in_array($b['category'] ?? '', CUS_CATS, true) ? $b['category'] : 'أخرى';
    $on = hrp_date($b['issuedOn'] ?? '') ?: date('Y-m-d'); $val = trim(to_ascii_digits((string)($b['value'] ?? ''))); $val = $val === '' ? null : round((float)$val, 2);
    $cond = in_array($b['condOut'] ?? '', ['جديدة', 'مستعملة بحالة جيدة', 'تحتاج صيانة'], true) ? $b['condOut'] : 'جديدة';
    $args = [$ref, $item, $cat, hrp_str($b['serial'] ?? '', 80), $val, $on, $cond, hrp_str($b['note'] ?? '', 600)];
    if (!empty($b['id'])) {
        $c = q1('SELECT * FROM custody WHERE id=?', [(int)$b['id']]); if (!$c) throw new HttpError('not_found', 404);
        q('UPDATE custody SET ref=?, item=?, category=?, serial=?, value=?, issued_on=?, cond_out=?, note=? WHERE id=?', array_merge($args, [$c['id']]));
        audit_log($ref, 'تعديل بيانات عهدة', $item, hrp_label($u)); $id = (int)$c['id'];
    } else {
        q('INSERT INTO custody (ref, item, category, serial, value, issued_on, cond_out, note, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)', array_merge($args, [hrp_label($u), now()]));
        $id = (int)db()->lastInsertId();
        audit_log($ref, 'تسليم عهدة للمنسوب', $item . ($args[3] ? ' · ' . $args[3] : '') . ' · ' . $on, hrp_label($u));
        $to = hrp_staff_mail($ref); if ($to) hrp_mail($to, 'سُجّلت عهدة باسمك', 'سجّلت الموارد البشرية عهدة باسمك. راجعها في صفحتك وأقرّ باستلامها.', [['العهدة', $item], ['النوع', $cat], ['الرقم التسلسلي', $args[3]], ['تاريخ الاستلام', $on], ['الحالة', $cond]], 'myhr', 'الإقرار بالاستلام');
    }
    return ['ok' => true, 'row' => cus_row(q1('SELECT * FROM custody WHERE id=?', [$id]))];
}
function cus_return(array $b): array {
    $u = require_perm('staff.edit');
    $c = q1('SELECT * FROM custody WHERE id=?', [(int)($b['id'] ?? 0)]); if (!$c) throw new HttpError('not_found', 404);
    if ($c['returned_on'] !== null) throw new HttpError('سُلّمت هذه العهدة مسبقًا');
    $on = hrp_date($b['returnedOn'] ?? '') ?: date('Y-m-d'); if ($on < $c['issued_on']) throw new HttpError('تاريخ الإرجاع قبل تاريخ الاستلام');
    $cond = in_array($b['condIn'] ?? '', ['سليمة', 'بها تلف', 'مفقودة'], true) ? $b['condIn'] : 'سليمة';
    q('UPDATE custody SET returned_on=?, cond_in=?, note=CONCAT(note, ?), returned_by=? WHERE id=?', [$on, $cond, trim((string)($b['note'] ?? '')) !== '' ? ' | عند الإرجاع: ' . hrp_str($b['note'], 400) : '', hrp_label($u), $c['id']]);
    audit_log($c['ref'], 'استلام عهدة من المنسوب', $c['item'] . ' · ' . $cond . ' · ' . $on, hrp_label($u));
    return ['ok' => true, 'row' => cus_row(q1('SELECT * FROM custody WHERE id=?', [$c['id']]))];
}
function cus_ack(array $b): array {
    $u = hrp_me(); $ref = my_staff_ref($u);
    $c = q1('SELECT * FROM custody WHERE id=?', [(int)($b['id'] ?? 0)]); if (!$c || $c['ref'] !== $ref) throw new HttpError('not_found', 404);
    if (!$c['ack_at']) { q('UPDATE custody SET ack_at=? WHERE id=?', [now(), $c['id']]); audit_log($ref, 'إقرار المنسوب باستلام عهدة', $c['item'], hrp_label($u)); }
    return ['ok' => true, 'row' => cus_row(q1('SELECT * FROM custody WHERE id=?', [$c['id']]))];
}

/* ============================================================ ما يحدث بعد الاعتماد النهائي لبعض الطلبات */
function req_on_approved(array $r, string $actor): void {
    $d = json_decode($r['data'], true) ?: [];
    if ($r['type'] === 'resign') {
        $s = staff_get($r['ref']); $nm = $s ? staff_name($s) : $r['ref'];
        foreach (hr_recipients() as $to) hrp_mail($to, 'اعتُمدت استقالة ' . $nm . ' · ' . $r['no'], 'اعتُمدت استقالة ' . $nm . '. الخطوة التالية: افتح إخلاء الطرف من «الطلبات ← طلب نيابة عن منسوب ← إخلاء طرف»، واربطه بهذه الاستقالة.', [['آخر يوم عمل', (string)($d['lastDay'] ?? '')], ['العهد غير المسلّمة', (string)count(custody_open($r['ref']))]], 'reqs-new', 'فتح إخلاء الطرف');
    }
    if ($r['type'] === 'clear') {
        $s = staff_get($r['ref']); if (!$s) return;
        $s['data']['serviceStatus'] = 'منتهية خدمته'; $s['data']['serviceEnd'] = (string)($d['lastDay'] ?? ''); $s['data']['endReason'] = (string)($d['why'] ?? '');
        $s['updated_at'] = now(); staff_put($s);
        audit_log($r['ref'], 'انتهاء خدمة المنسوب', 'إخلاء الطرف ' . $r['no'] . ' · آخر يوم عمل ' . ($d['lastDay'] ?? '') . ' · ' . ($d['why'] ?? '') . ' · يبقى الملف في السجل للرجوع إليه', $actor);
    }
}

/* ============================================================ الحضور من الجوال وتصحيح الحضور */
function geo_m(float $a1, float $o1, float $a2, float $o2): float {
    $R = 6371000; $p1 = deg2rad($a1); $p2 = deg2rad($a2); $dp = deg2rad($a2 - $a1); $dl = deg2rad($o2 - $o1);
    $h = sin($dp / 2) ** 2 + cos($p1) * cos($p2) * sin($dl / 2) ** 2; return 2 * $R * asin(min(1, sqrt($h)));
}
/* مقرات المنسوب: مقر جهته (وما لم تُحدَّد له جهة يصلح للجميع) */
function att_sites_for(string $ref): array {
    $s = staff_get($ref); $ent = mb_strtolower(trim((string)($s['data']['entity'] ?? '')));
    $all = (array)site()['work']['sites'];
    $mine = array_values(array_filter($all, fn($x) => trim((string)($x['entity'] ?? '')) !== '' && mb_strtolower(trim((string)$x['entity'])) === $ent));
    return $mine ?: array_values(array_filter($all, fn($x) => trim((string)($x['entity'] ?? '')) === ''));
}
function att_mobile_ok(string $ref): bool { $W = site()['work']; return $W['mobile'] === 'all' || ($W['mobile'] === 'listed' && in_array($ref, (array)$W['mobileRefs'], true)); }
/* التوقيت المحلي: لكل مقر توقيته، والعامل عن بعد بتوقيت جهازه */
const ATT_TZ_DEFAULT = 'Asia/Riyadh';
function att_tz_ok(string $tz): bool { return $tz !== '' && strlen($tz) <= 64 && in_array($tz, DateTimeZone::listIdentifiers(), true); }
/* العمل عن بعد: جهة اسمها فيه «عن بعد»، أو منسوب مضاف في الإعدادات */
function att_remote(string $ref): bool {
    if (in_array($ref, (array)(site()['work']['remoteRefs'] ?? []), true)) return true;
    $s = staff_get($ref); return mb_strpos((string)($s['data']['entity'] ?? ''), 'عن بعد') !== false;
}
function att_tz_for(string $ref, string $client = '', ?bool $remote = null): string {
    if ($remote ?? att_remote($ref)) return att_tz_ok($client) ? $client : ATT_TZ_DEFAULT;
    foreach (att_sites_for($ref) as $x) if (att_tz_ok((string)($x['tz'] ?? ''))) return (string)$x['tz'];
    return ATT_TZ_DEFAULT;
}
function att_clock(string $tz): array {
    $d = new DateTime('now', new DateTimeZone(att_tz_ok($tz) ? $tz : ATT_TZ_DEFAULT));
    return ['day' => $d->format('Y-m-d'), 't' => $d->format('H:i:s'), 'hm' => $d->format('H:i'), 'w' => (int)$d->format('w'), 'min' => (int)$d->format('G') * 60 + (int)$d->format('i'), 'off' => intdiv($d->getOffset(), 60), 'tz' => $d->getTimezone()->getName()];
}
/* سجل اليوم للمنسوب (للزر في صفحته) */
function att_today(array $b): array {
    $u = hrp_me(); $ref = my_staff_ref($u); if (!$ref || !staff_can_see('att')) return ['ok' => true, 'on' => false];
    $remote = att_remote($ref); $C = att_clock(att_tz_for($ref, (string)($b['tz'] ?? ''), $remote));
    $r = q1('SELECT * FROM attendance WHERE ref=? AND day=?', [$ref, $C['day']]);
    $W = site()['work'];
    return ['ok' => true, 'on' => att_mobile_ok($ref), 'remote' => $remote, 'in' => $r ? substr((string)$r['in_time'], 0, 5) : '', 'out' => $r && $r['out_time'] ? substr((string)$r['out_time'], 0, 5) : '', 'source' => $r['source'] ?? '',
        'sites' => $remote ? [] : array_map(fn($x) => ['name' => $x['name'], 'radius' => $x['radius'], 'lat' => $x['lat'], 'lng' => $x['lng']], att_sites_for($ref)), 'weekend' => !$remote && in_array($C['w'], $W['weekend'], true), 'now' => $C['hm'],
        'tz' => $C['tz'], 'tzOff' => $C['off'], 'start' => $W['start'], 'end' => $W['end'], 'grace' => (int)$W['grace'], 'push' => (bool)q1('SELECT id FROM push_subs WHERE user_id=? LIMIT 1', [(int)$u['id']]), 'vapid' => vapid()['pub']];
}
function att_check(array $b): array {
    $u = hrp_me(); $ref = my_staff_ref($u); if (!$ref) throw new HttpError('لا يوجد سجل منسوب لهذا الحساب');
    if (!staff_can_see('att') || !att_mobile_ok($ref)) throw new HttpError('تسجيل الحضور من الجوال غير مفعّل لك. تواصل مع الموارد البشرية.');
    if (rate_hit('attck:' . $u['id'], 12, 3600)) throw new HttpError('محاولات كثيرة، حاول بعد قليل', 429);
    $la = (float)($b['lat'] ?? 0); $lo = (float)($b['lng'] ?? 0); $acc = max(0, (float)($b['acc'] ?? 9999));
    $hasLoc = !($la == 0 && $lo == 0) && abs($la) <= 90 && abs($lo) <= 180;
    $remote = att_remote($ref); $exit = !$remote && !empty($b['exit']);
    if ($remote) {
        /* عن بعد: يبصم من أي مكان وفي أي وقت؛ الموقع يُحفظ إن أُرسل للتوثيق فقط */
        $best = [['name' => 'عن بعد'], 0.0];
        $where = $hasLoc ? sprintf('%.5f، %.5f', $la, $lo) : 'بلا موقع';
    } else {
        if (!$hasLoc) throw new HttpError('تعذّر قراءة موقعك. فعّل خدمة الموقع في الجوال وحاول مرة أخرى.');
        if ($acc > 300) throw new HttpError('دقة الموقع ضعيفة (' . round($acc) . ' م). اخرج إلى مكان مفتوح أو فعّل «الموقع الدقيق» وحاول مرة أخرى.');
        $best = null;
        foreach (att_sites_for($ref) as $x) { $d = geo_m($la, $lo, (float)$x['lat'], (float)$x['lng']); if (!$best || $d < $best[1]) $best = [$x, $d]; }
        if (!$best) throw new HttpError('لم يُحدَّد مقر لجهتك بعد. تواصل مع الموارد البشرية.');
        /* هامش الدقة: نصف دقة القراءة بحد أقصى 25 م، حتى لا يُقبل من خارج النطاق بقراءة ضعيفة */
        if (!$exit && $best[1] > $best[0]['radius'] + min($acc / 2, 25)) throw new HttpError('أنت على بُعد ' . round($best[1]) . ' م من «' . $best[0]['name'] . '». تُقبل البصمة داخل ' . $best[0]['radius'] . ' م من المقر فقط.');
        $where = round($best[1]) . ' م';
    }
    $C = att_clock(att_tz_for($ref, (string)($b['tz'] ?? ''), $remote)); $day = $C['day']; $t = $C['t']; $W = site()['work'];
    named_lock('att:' . $ref);
    try {
        $r = q1('SELECT * FROM attendance WHERE ref=? AND day=?', [$ref, $day]);
        $src = 'الجوال · ' . $best[0]['name'] . ' · ' . $where;
        if ($exit && (!$r || $r['out_time'])) throw new HttpError('لا يوجد حضور مفتوح اليوم لتسجيل انصرافه');
        if ($exit) $src = 'انصراف عند مغادرة النطاق' . (!empty($b['auto']) ? ' (تلقائي)' : '') . ' · ' . $where . ' من ' . $best[0]['name'];
        if (!$r) {
            [$m, $late, $early] = att_calc(substr($t, 0, 5), '', $W, $remote);
            q('INSERT INTO attendance (ref, day, in_time, out_time, minutes, late_min, early_min, source, batch, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)', [$ref, $day, $t, null, 0, $late, 0, mb_substr($src, 0, 120), 'mobile', now()]);
            $kind = 'in';
        } else {
            if ($r['out_time'] && substr((string)$r['out_time'], 0, 5) === $C['hm']) throw new HttpError('سُجّل انصرافك للتو');
            [$m, $late, $early] = att_calc(substr((string)$r['in_time'], 0, 5), substr($t, 0, 5), $W, $remote);
            q('UPDATE attendance SET out_time=?, minutes=?, late_min=?, early_min=?, source=? WHERE id=?', [$t, $m, $late, $early, mb_substr($r['source'] . ' | ' . ($exit ? $src : 'انصراف: ' . $best[0]['name']), 0, 120), $r['id']]);
            $kind = 'out';
        }
    } finally { named_unlock('att:' . $ref); }
    audit_log($ref, $kind === 'in' ? 'تسجيل حضور من الجوال' . ($remote ? ' (عن بعد)' : '') : ($exit ? 'انصراف عند مغادرة نطاق المقر' . (!empty($b['auto']) ? ' (تلقائي)' : '') : 'تسجيل انصراف من الجوال' . ($remote ? ' (عن بعد)' : '')), $best[0]['name'] . ' · ' . $where . ($hasLoc ? ' · دقة ' . round($acc) . ' م' : '') . ' · ' . $C['tz'], hrp_label($u));
    return ['ok' => true, 'kind' => $kind, 'site' => $best[0]['name'], 'dist' => round($best[1])] + att_today(['tz' => (string)($b['tz'] ?? '')]);
}
/* تصحيح يوم حضور بسبب مكتوب (يُحفظ في سجل العمليات بالقيم السابقة والجديدة) */
function att_fix(array $b): array {
    $u = require_perm('attendance.manage');
    $ref = (string)($b['ref'] ?? ''); if (!staff_get($ref)) throw new HttpError('not_found', 404);
    $day = hrp_date($b['day'] ?? ''); if (!$day || $day > date('Y-m-d')) throw new HttpError('اختر يومًا صحيحًا (اليوم أو قبله)');
    $tm = fn($v) => preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', trim((string)$v)) ? trim((string)$v) : '';
    $in = $tm($b['in'] ?? ''); $out = $tm($b['out'] ?? ''); $why = hrp_str($b['reason'] ?? '', 300); $del = !empty($b['remove']);
    if (mb_strlen(trim($why)) < 3) throw new HttpError('اكتب سبب التصحيح (3 أحرف على الأقل)');
    if (!$del && !$in) throw new HttpError('اكتب وقت الحضور');
    if ($in && $out && $out <= $in) throw new HttpError('وقت الانصراف يجب أن يكون بعد الحضور');
    $old = q1('SELECT * FROM attendance WHERE ref=? AND day=?', [$ref, $day]);
    $was = $old ? substr((string)$old['in_time'], 0, 5) . '–' . substr((string)$old['out_time'], 0, 5) : 'لا سجل';
    if ($del) { if ($old) q('DELETE FROM attendance WHERE id=?', [$old['id']]); }
    else {
        [$m, $late, $early] = att_calc($in, $out, site()['work'], att_remote($ref)); $src = mb_substr('تصحيح: ' . $why, 0, 120);
        if ($old) q('UPDATE attendance SET in_time=?, out_time=?, minutes=?, late_min=?, early_min=?, source=?, batch=? WHERE id=?', [$in . ':00', $out ? $out . ':00' : null, $m, $late, $early, $src, 'fix', $old['id']]);
        else q('INSERT INTO attendance (ref, day, in_time, out_time, minutes, late_min, early_min, source, batch, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)', [$ref, $day, $in . ':00', $out ? $out . ':00' : null, $m, $late, $early, $src, 'fix', now()]);
    }
    audit_log($ref, 'تصحيح سجل الحضور', $day . ' · ' . $was . ' ← ' . ($del ? 'حُذف السجل' : $in . '–' . $out) . ' · السبب: ' . $why, hrp_label($u));
    return ['ok' => true];
}

/* ============================================================ تقييم الأداء */
const EV_CRIT = [['q', 'جودة العمل وإتقانه'], ['t', 'الالتزام بالمواعيد والدوام'], ['c', 'التعاون والعمل الجماعي'], ['i', 'المبادرة والإبداع'], ['s', 'المهارات الفنية'], ['b', 'خدمة المستفيدين والتواصل']];
const EV_REC = ['تجديد العقد', 'ترشيح لترقية', 'خطة تطوير', 'متابعة الأداء', 'لا توصية'];
function ev_label(float $t): string { return $t >= 4.5 ? 'ممتاز' : ($t >= 3.5 ? 'جيد جدًا' : ($t >= 2.5 ? 'جيد' : ($t >= 1.5 ? 'مقبول' : 'يحتاج تحسينًا'))); }
function ev_row(array $e): array {
    $s = staff_get($e['ref']); $d = json_decode($e['data'], true) ?: [];
    return ['id' => (int)$e['id'], 'ref' => $e['ref'], 'name' => $s ? staff_name($s) : $e['ref'], 'entity' => (string)($s['data']['entity'] ?? ''), 'jobTitle' => (string)($s['data']['jobTitle'] ?? ''), 'period' => $e['period'],
        'scores' => json_decode($e['scores'], true) ?: [], 'total' => (float)$e['total'], 'label' => ev_label((float)$e['total']), 'data' => $d, 'status' => $e['status'],
        'by' => $e['created_by'], 'createdAt' => substr($e['created_at'], 0, 16), 'sentAt' => $e['sent_at'] ? substr($e['sent_at'], 0, 16) : '', 'ackAt' => $e['ack_at'] ? substr($e['ack_at'], 0, 16) : '', 'ackNote' => $e['ack_note']];
}
function ev_list(array $b): array {
    $u = hrp_me();
    if (has_perm($u, 'staff.view')) return ['ok' => true, 'rows' => array_map('ev_row', q('SELECT * FROM evals ORDER BY id DESC LIMIT 800')->fetchAll()), 'crit' => EV_CRIT, 'recs' => EV_REC, 'canEdit' => has_perm($u, 'staff.edit')];
    $ref = my_staff_ref($u); if (!$ref || !site_on('staff', 'myhr')) return ['ok' => true, 'rows' => [], 'crit' => EV_CRIT];
    return ['ok' => true, 'rows' => array_map('ev_row', q("SELECT * FROM evals WHERE ref=? AND status IN ('sent','ack') ORDER BY id DESC", [$ref])->fetchAll()), 'crit' => EV_CRIT];
}
function ev_save(array $b): array {
    $u = require_perm('staff.edit'); if (!site_on('modules', 'evals')) throw new HttpError('قسم تقييم الأداء موقوف من الإعدادات');
    $ref = (string)($b['ref'] ?? ''); if (!staff_get($ref)) throw new HttpError('اختر المنسوب');
    $period = hrp_str($b['period'] ?? '', 60); if (mb_strlen($period) < 3) throw new HttpError('اكتب فترة التقييم (مثال: الربع الرابع 2026)');
    $sc = []; foreach (EV_CRIT as $c) { $v = (int)($b['scores'][$c[0]] ?? 0); if ($v < 1 || $v > 5) throw new HttpError('قيّم «' . $c[1] . '» من 1 إلى 5'); $sc[$c[0]] = $v; }
    $total = round(array_sum($sc) / count($sc), 2);
    $d = ['strengths' => hrp_str($b['strengths'] ?? '', 1500), 'improve' => hrp_str($b['improve'] ?? '', 1500), 'goals' => hrp_str($b['goals'] ?? '', 1500), 'evaluator' => hrp_str($b['evaluator'] ?? '', 120),
        'rec' => in_array($b['rec'] ?? '', EV_REC, true) ? $b['rec'] : 'لا توصية'];
    $send = !empty($b['send']);
    if (!empty($b['id'])) {
        $e = q1('SELECT * FROM evals WHERE id=?', [(int)$b['id']]); if (!$e) throw new HttpError('not_found', 404);
        if ($e['status'] !== 'draft') throw new HttpError('لا يُعدَّل التقييم بعد إرساله للمنسوب');
        q('UPDATE evals SET ref=?, period=?, scores=?, total=?, data=?, status=?, sent_at=?, updated_at=? WHERE id=?', [$ref, $period, json_encode($sc), $total, json_encode($d, JSON_UNESCAPED_UNICODE), $send ? 'sent' : 'draft', $send ? now() : null, now(), $e['id']]);
        $id = (int)$e['id'];
    } else {
        $dup = q1("SELECT id FROM evals WHERE ref=? AND period=? AND status<>'void'", [$ref, $period]); if ($dup) throw new HttpError('سبق تقييم هذا المنسوب للفترة نفسها');
        q('INSERT INTO evals (ref, period, scores, total, data, status, created_by, created_at, sent_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)', [$ref, $period, json_encode($sc), $total, json_encode($d, JSON_UNESCAPED_UNICODE), $send ? 'sent' : 'draft', hrp_label($u), now(), $send ? now() : null, now()]);
        $id = (int)db()->lastInsertId();
    }
    audit_log($ref, $send ? 'إرسال تقييم أداء للمنسوب' : 'حفظ مسودة تقييم أداء', $period . ' · ' . $total . ' من 5 (' . ev_label($total) . ')', hrp_label($u));
    if ($send) { $to = hrp_staff_mail($ref); if ($to) hrp_mail($to, 'تقييم أدائك: ' . $period, 'أعدّت الموارد البشرية تقييم أدائك. اطّلع عليه في صفحتك وأكّد اطلاعك، ويمكنك إضافة ملاحظتك.', [['الفترة', $period], ['التقدير العام', $total . ' من 5 · ' . ev_label($total)]], 'myhr', 'الاطلاع على التقييم'); }
    return ['ok' => true, 'row' => ev_row(q1('SELECT * FROM evals WHERE id=?', [$id]))];
}
function ev_ack(array $b): array {
    $u = hrp_me(); $ref = my_staff_ref($u);
    $e = q1("SELECT * FROM evals WHERE id=? AND status='sent'", [(int)($b['id'] ?? 0)]); if (!$e || $e['ref'] !== $ref) throw new HttpError('not_found', 404);
    q("UPDATE evals SET status='ack', ack_at=?, ack_note=?, updated_at=? WHERE id=?", [now(), hrp_str($b['note'] ?? '', 600), now(), $e['id']]);
    audit_log($ref, 'اطّلاع المنسوب على تقييم أدائه', $e['period'] . (trim((string)($b['note'] ?? '')) !== '' ? ' · ملاحظته: ' . hrp_str($b['note'], 600) : ''), hrp_label($u));
    return ['ok' => true, 'row' => ev_row(q1('SELECT * FROM evals WHERE id=?', [$e['id']]))];
}
function ev_delete(array $b): array {
    $u = require_perm('staff.edit');
    $e = q1('SELECT * FROM evals WHERE id=?', [(int)($b['id'] ?? 0)]); if (!$e) throw new HttpError('not_found', 404);
    if ($e['status'] !== 'draft') throw new HttpError('تُحذف المسودات فقط');
    q('DELETE FROM evals WHERE id=?', [$e['id']]); audit_log($e['ref'], 'حذف مسودة تقييم أداء', $e['period'], hrp_label($u));
    return ['ok' => true];
}

/* ============================================================ التوظيف: الوظائف والمتقدمون والمقابلات */
const JOB_KINDS = ['دوام كامل', 'دوام جزئي', 'مؤقت', 'تعاقد', 'تدريب تعاوني', 'عن بعد'];
const APP_ST = ['new' => 'جديد', 'review' => 'قيد الدراسة', 'interview' => 'مقابلة', 'accepted' => 'مقبول', 'rejected' => 'غير مقبول'];
const INT_CRIT = [['p', 'التواصل والحضور'], ['k', 'المعرفة الفنية'], ['e', 'الخبرة'], ['f', 'الملاءمة للفريق'], ['m', 'الدافعية']];
function job_row(array $j, bool $pub = false): array {
    $d = json_decode($j['data'], true) ?: [];
    $o = ['slug' => $j['slug'], 'title' => $j['title'], 'entity' => (string)($d['entity'] ?? ''), 'location' => (string)($d['location'] ?? ''), 'kind' => (string)($d['kind'] ?? ''), 'count' => (int)($d['count'] ?? 1),
        'desc' => (string)($d['desc'] ?? ''), 'quals' => (string)($d['quals'] ?? ''), 'closesOn' => (string)($j['closes_on'] ?? '')];
    if ($pub) return $o;
    return $o + ['id' => (int)$j['id'], 'department' => (string)($d['department'] ?? ''), 'status' => $j['status'], 'needNo' => $j['need_no'], 'by' => $j['created_by'], 'createdAt' => substr($j['created_at'], 0, 16),
        'apps' => (int)(q1('SELECT COUNT(*) n FROM applicants WHERE job_id=?', [$j['id']])['n'] ?? 0)];
}
function app_row(array $a): array {
    $d = json_decode($a['data'], true) ?: []; $r = json_decode((string)$a['review'], true) ?: [];
    return ['id' => (int)$a['id'], 'jobId' => (int)$a['job_id'], 'name' => $a['name'], 'email' => $a['email'], 'phone' => $a['phone'], 'data' => $d, 'status' => $a['status'], 'statusName' => APP_ST[$a['status']] ?? $a['status'],
        'cv' => $a['cv_file'] !== '', 'review' => $r, 'createdAt' => substr($a['created_at'], 0, 16), 'updatedAt' => substr($a['updated_at'], 0, 16)];
}
function job_list(array $b): array {
    $u = require_perm('staff.view');
    $jobs = q('SELECT * FROM jobs ORDER BY (status=\'open\') DESC, id DESC')->fetchAll();
    $needs = array_map(fn($r) => ['no' => $r['no'], 'sum' => req_summary($r), 'data' => json_decode($r['data'], true) ?: []], q("SELECT * FROM requests WHERE type='hire' AND status='approved' ORDER BY id DESC LIMIT 50")->fetchAll());
    return ['ok' => true, 'jobs' => array_map('job_row', $jobs), 'apps' => array_map('app_row', q('SELECT * FROM applicants ORDER BY id DESC LIMIT 2000')->fetchAll()), 'needs' => $needs,
        'kinds' => JOB_KINDS, 'st' => APP_ST, 'crit' => INT_CRIT, 'canEdit' => has_perm($u, 'staff.edit'), 'url' => (string)cfg('site_url') . 'jobs.html'];
}
function job_save(array $b): array {
    $u = require_perm('staff.edit'); if (!site_on('modules', 'jobs')) throw new HttpError('قسم التوظيف موقوف من الإعدادات');
    $title = hrp_str($b['title'] ?? '', 120); if (mb_strlen($title) < 2) throw new HttpError('اكتب المسمى الوظيفي');
    $d = ['entity' => hrp_str($b['entity'] ?? '', 120), 'department' => hrp_str($b['department'] ?? '', 120), 'location' => hrp_str($b['location'] ?? '', 120), 'kind' => in_array($b['kind'] ?? '', JOB_KINDS, true) ? $b['kind'] : 'دوام كامل',
        'count' => max(1, min(50, (int)($b['count'] ?? 1))), 'desc' => hrp_str($b['desc'] ?? '', 4000), 'quals' => hrp_str($b['quals'] ?? '', 3000)];
    if (mb_strlen($d['desc']) < 10) throw new HttpError('اكتب وصف الوظيفة ومهامها');
    $closes = hrp_date($b['closesOn'] ?? '') ?: null; $need = preg_match('/^HN-\d{4}-\d{4}$/', (string)($b['needNo'] ?? '')) ? (string)$b['needNo'] : '';
    $st = in_array($b['status'] ?? 'open', ['open', 'closed', 'filled'], true) ? (string)($b['status'] ?? 'open') : 'open';
    if (!empty($b['id'])) {
        $j = q1('SELECT * FROM jobs WHERE id=?', [(int)$b['id']]); if (!$j) throw new HttpError('not_found', 404);
        q('UPDATE jobs SET title=?, data=?, status=?, need_no=?, closes_on=?, updated_at=? WHERE id=?', [$title, json_encode($d, JSON_UNESCAPED_UNICODE), $st, $need, $closes, now(), $j['id']]); $id = (int)$j['id'];
        audit_log('', 'تعديل إعلان وظيفة', $title . ' · ' . $st, hrp_label($u));
    } else {
        q('INSERT INTO jobs (slug, title, data, status, need_no, closes_on, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)', [bin2hex(random_bytes(6)), $title, json_encode($d, JSON_UNESCAPED_UNICODE), 'open', $need, $closes, hrp_label($u), now(), now()]);
        $id = (int)db()->lastInsertId(); audit_log('', 'إعلان وظيفة', $title . ($need ? ' · من الاحتياج ' . $need : ''), hrp_label($u));
    }
    return job_list([]) + ['saved' => $id];
}
/* صفحة الوظائف العامة (بلا دخول) */
function jobs_public(array $b): array {
    if (!site_on('modules', 'jobs')) return ['ok' => true, 'jobs' => []];
    $rows = q("SELECT * FROM jobs WHERE status='open' AND (closes_on IS NULL OR closes_on >= ?) ORDER BY id DESC", [date('Y-m-d')])->fetchAll();
    return ['ok' => true, 'jobs' => array_map(fn($j) => job_row($j, true), $rows)];
}
function job_apply(array $b): array {
    if (rate_hit('apply:' . client_ip(), 8, 3600)) throw new HttpError('locked', 429);
    if (trim((string)($b['website'] ?? '')) !== '') throw new HttpError('bad_request'); /* حقل مخفي لصدّ البرامج الآلية */
    $j = q1("SELECT * FROM jobs WHERE slug=? AND status='open' AND (closes_on IS NULL OR closes_on >= ?)", [(string)($b['slug'] ?? ''), date('Y-m-d')]);
    if (!$j || !site_on('modules', 'jobs')) throw new HttpError('هذه الوظيفة لم تعد متاحة للتقديم');
    $name = hrp_str($b['name'] ?? '', 120); $mail = strtolower(trim((string)($b['email'] ?? ''))); $phone = hrp_str($b['phone'] ?? '', 30);
    if (mb_strlen($name) < 5) throw new HttpError('اكتب اسمك الكامل');
    if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) throw new HttpError('اكتب بريدًا إلكترونيًا صحيحًا');
    if (strlen(preg_replace('/\D/', '', to_ascii_digits($phone))) < 8) throw new HttpError('اكتب رقم جوال صحيحًا مع رمز الدولة');
    if (q1('SELECT id FROM applicants WHERE job_id=? AND email=?', [$j['id'], $mail])) throw new HttpError('سبق تقديمك على هذه الوظيفة بهذا البريد، وسنتواصل معك');
    $d = ['city' => hrp_str($b['city'] ?? '', 80), 'nationality' => hrp_str($b['nationality'] ?? '', 60), 'edu' => hrp_str($b['edu'] ?? '', 160), 'years' => max(0, min(50, (int)($b['years'] ?? 0))), 'note' => hrp_str($b['note'] ?? '', 1500)];
    if (empty($b['consent'])) throw new HttpError('وافق على استخدام بياناتك لأغراض التوظيف');
    $cv = '';
    if (!empty($b['cv'])) {
        $bytes = base64_decode(preg_replace('/^data:[^,]*,/', '', (string)$b['cv']), true);
        if ($bytes === false || strlen($bytes) > 5 * 1024 * 1024) throw new HttpError('السيرة الذاتية أكبر من 5 ميجابايت');
        if (sniff_mime($bytes) !== 'application/pdf') throw new HttpError('أرفق السيرة الذاتية بصيغة PDF');
        storage_dir('jobs'); $cv = 'jobs/' . bin2hex(random_bytes(16)) . '.pdf';
        if (file_put_contents(storage_dir() . '/' . $cv, $bytes, LOCK_EX) === false) throw new HttpError('storage_write_failed', 500); @chmod(storage_dir() . '/' . $cv, 0640);
    }
    q('INSERT INTO applicants (job_id, name, email, phone, data, status, cv_file, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)', [$j['id'], $name, $mail, $phone, json_encode($d, JSON_UNESCAPED_UNICODE), 'new', $cv, now(), now()]);
    audit_log('', 'تقديم على وظيفة', $j['title'] . ' · ' . $name, 'صفحة الوظائف');
    hrp_mail($mail, 'استلمنا طلبك: ' . $j['title'], 'شكرًا لتقديمك على وظيفة «' . $j['title'] . '» في مجموعة بنيان العالمية. استلمنا طلبك، وسنتواصل معك إن ناسب ملفك الاحتياج.', [['الوظيفة', $j['title']], ['الاسم', $name]], '', 'زيارة الموقع');
    foreach (hr_recipients() as $to) hrp_mail($to, 'متقدم جديد: ' . $j['title'], 'تقدّم ' . $name . ' على وظيفة «' . $j['title'] . '».', [['البريد', $mail], ['الجوال', $phone], ['المؤهل', $d['edu']], ['الخبرة', $d['years'] . ' سنة']], 'jobs', 'فتح التوظيف');
    return ['ok' => true];
}
function app_set(array $b): array {
    $u = require_perm('staff.edit');
    $a = q1('SELECT * FROM applicants WHERE id=?', [(int)($b['id'] ?? 0)]); if (!$a) throw new HttpError('not_found', 404);
    $st = (string)($b['status'] ?? $a['status']); if (!isset(APP_ST[$st])) throw new HttpError('حالة غير معروفة');
    $r = json_decode((string)$a['review'], true) ?: [];
    if (isset($b['review']) && is_array($b['review'])) {
        $in = $b['review']; $sc = [];
        foreach (INT_CRIT as $c) { $v = (int)($in['scores'][$c[0]] ?? 0); if ($v >= 1 && $v <= 5) $sc[$c[0]] = $v; }
        $r = ['date' => hrp_date($in['date'] ?? ''), 'time' => preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string)($in['time'] ?? '')) ? (string)$in['time'] : '', 'mode' => in_array($in['mode'] ?? '', ['حضورية', 'عن بعد', 'هاتفية'], true) ? $in['mode'] : '',
            'panel' => hrp_str($in['panel'] ?? '', 200), 'scores' => $sc, 'total' => $sc ? round(array_sum($sc) / count($sc), 2) : 0, 'rec' => in_array($in['rec'] ?? '', ['توظيف', 'احتياط', 'عدم توظيف'], true) ? $in['rec'] : '', 'notes' => hrp_str($in['notes'] ?? '', 2000)];
    }
    q('UPDATE applicants SET status=?, review=?, updated_at=? WHERE id=?', [$st, json_encode($r, JSON_UNESCAPED_UNICODE), now(), $a['id']]);
    $j = q1('SELECT * FROM jobs WHERE id=?', [$a['job_id']]);
    audit_log('', 'متقدم: ' . (APP_ST[$st] ?? $st), $a['name'] . ' · ' . ($j['title'] ?? ''), hrp_label($u));
    if ($st !== $a['status'] && !empty($b['notify'])) {
        if ($st === 'interview' && ($r['date'] ?? '')) hrp_mail($a['email'], 'موعد مقابلة: ' . ($j['title'] ?? ''), 'يسعدنا دعوتك لمقابلة شخصية على وظيفة «' . ($j['title'] ?? '') . '».', [['التاريخ', $r['date']], ['الوقت', $r['time'] ?? ''], ['الطريقة', $r['mode'] ?? '']], '', 'مجموعة بنيان العالمية');
        if ($st === 'accepted') hrp_mail($a['email'], 'قبولك في وظيفة ' . ($j['title'] ?? ''), 'يسرّنا إبلاغك بقبولك في وظيفة «' . ($j['title'] ?? '') . '». الخطوة التالية: سجّل بياناتك ووثائقك في سجل المنسوبين من الرابط التالي، وستتواصل معك الموارد البشرية.', [], 'register.html', 'تسجيل بياناتي');
        if ($st === 'rejected') hrp_mail($a['email'], 'بشأن طلبك على وظيفة ' . ($j['title'] ?? ''), 'نشكر اهتمامك بالعمل في مجموعة بنيان العالمية. بعد دراسة الطلبات لم يقع الاختيار على طلبك لهذه الوظيفة، ونتمنى لك التوفيق، وسنحتفظ ببياناتك لفرص قادمة.', [], '', 'مجموعة بنيان العالمية');
    }
    return ['ok' => true, 'row' => app_row(q1('SELECT * FROM applicants WHERE id=?', [$a['id']]))];
}
function cv_serve(): void {
    $u = current_user(); if (!$u || !has_perm($u, 'staff.view')) throw new HttpError('forbidden', 403);
    $a = q1('SELECT * FROM applicants WHERE id=?', [(int)($_GET['id'] ?? 0)]); if (!$a || $a['cv_file'] === '') throw new HttpError('not_found', 404);
    $p = storage_dir() . '/' . $a['cv_file']; if (!is_file($p)) throw new HttpError('file_missing', 404);
    header('Content-Type: application/pdf'); header('Content-Disposition: inline; filename="cv-' . (int)$a['id'] . '.pdf"'); header('X-Content-Type-Options: nosniff'); header('Cache-Control: private, no-store');
    readfile($p); exit;
}

/* ============================================================ تنبيهات الجوال (Web Push بمعيار VAPID) */
if (!function_exists('b64u')) { function b64u(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); } }
if (!function_exists('b64u_dec')) { function b64u_dec(string $s): string { return (string)base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4)); } }
function ec_pub_pem(string $raw): string { return "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode(hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200') . $raw), 64, "\n") . "-----END PUBLIC KEY-----\n"; }
function ec_raw_pub($key): string { $d = openssl_pkey_get_details($key); return "\x04" . str_pad($d['ec']['x'], 32, "\0", STR_PAD_LEFT) . str_pad($d['ec']['y'], 32, "\0", STR_PAD_LEFT); }
/* مفتاحا VAPID يُنشآن مرة واحدة ويُحفظان في الإعدادات (الخاص لا يغادر الخادم) */
function vapid(): array {
    static $v = null; if ($v) return $v;
    $x = json_decode((string)(setting('vapid') ?: ''), true);
    if (!is_array($x) || empty($x['priv'])) {
        $k = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]); openssl_pkey_export($k, $pem);
        $x = ['priv' => $pem, 'pub' => b64u(ec_raw_pub($k))]; setting_set('vapid', json_encode($x));
    }
    return $v = $x;
}
function der_to_raw(string $der): string {
    $o = 3; $lr = ord($der[$o]); $r = substr($der, $o + 1, $lr); $o += 1 + $lr + 1; $ls = ord($der[$o]); $s = substr($der, $o + 1, $ls);
    return str_pad(ltrim($r, "\0"), 32, "\0", STR_PAD_LEFT) . str_pad(ltrim($s, "\0"), 32, "\0", STR_PAD_LEFT);
}
function vapid_jwt(string $aud): string {
    $h = b64u(json_encode(['typ' => 'JWT', 'alg' => 'ES256'])); $c = b64u(json_encode(['aud' => $aud, 'exp' => time() + 43200, 'sub' => rtrim((string)cfg('site_url'), '/')]));
    openssl_sign($h . '.' . $c, $sig, vapid()['priv'], OPENSSL_ALGO_SHA256); return $h . '.' . $c . '.' . b64u(der_to_raw($sig));
}
/* تشفير الرسالة (RFC 8291 · aes128gcm) */
function push_encrypt(string $payload, string $uaPub, string $auth): string {
    $as = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]); $asPub = ec_raw_pub($as);
    $ecdh = openssl_pkey_derive(openssl_pkey_get_public(ec_pub_pem($uaPub)), $as, 32); if ($ecdh === false) throw new RuntimeException('ecdh');
    $ikm = hash_hmac('sha256', "WebPush: info\0" . $uaPub . $asPub . "\x01", hash_hmac('sha256', $ecdh, $auth, true), true);
    $salt = random_bytes(16); $prk = hash_hmac('sha256', $ikm, $salt, true);
    $cek = substr(hash_hmac('sha256', "Content-Encoding: aes128gcm\0\x01", $prk, true), 0, 16); $nonce = substr(hash_hmac('sha256', "Content-Encoding: nonce\0\x01", $prk, true), 0, 12);
    $ct = openssl_encrypt($payload . "\x02", 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
    return $salt . pack('N', 4096) . chr(65) . $asPub . $ct . $tag;
}
function push_send_one(array $sub, array $msg): int {
    $u = parse_url((string)$sub['endpoint']); if (($u['scheme'] ?? '') !== 'https' || empty($u['host'])) return 400;
    $body = push_encrypt(json_encode($msg, JSON_UNESCAPED_UNICODE), b64u_dec((string)$sub['p256dh']), b64u_dec((string)$sub['auth']));
    $ch = curl_init((string)$sub['endpoint']);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Content-Type: application/octet-stream', 'Content-Encoding: aes128gcm', 'TTL: 3600', 'Urgency: high', 'Authorization: vapid t=' . vapid_jwt($u['scheme'] . '://' . $u['host']) . ', k=' . vapid()['pub']]]);
    curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($code === 404 || $code === 410) q('DELETE FROM push_subs WHERE id=?', [$sub['id']]);
    return $code;
}
function push_to_user(int $uid, array $msg): int { $n = 0; foreach (q('SELECT * FROM push_subs WHERE user_id=?', [$uid])->fetchAll() as $s) { try { if (push_send_one($s, $msg) < 300) $n++; } catch (Throwable $e) { } } return $n; }
function push_sub(array $b): array {
    $u = hrp_me(); $e = (string)($b['endpoint'] ?? ''); $k = (string)($b['p256dh'] ?? ''); $a = (string)($b['auth'] ?? '');
    if (!preg_match('~^https://[^\s]{10,500}$~', $e) || strlen(b64u_dec($k)) !== 65 || strlen(b64u_dec($a)) < 16) throw new HttpError('اشتراك تنبيهات غير صالح');
    q('DELETE FROM push_subs WHERE endpoint=?', [$e]);
    q('INSERT INTO push_subs (user_id, endpoint, p256dh, auth, ua, created_at) VALUES (?,?,?,?,?,?)', [(int)$u['id'], $e, $k, $a, mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200), now()]);
    $n = push_to_user((int)$u['id'], ['title' => 'فُعّلت تنبيهات الحضور', 'body' => 'سيصلك تنبيه عند بداية الدوام لتسجيل حضورك، وعند نهايته.', 'url' => '#myatt']);
    return ['ok' => true, 'sent' => $n];
}
function push_unsub(array $b): array { $u = hrp_me(); q('DELETE FROM push_subs WHERE user_id=? AND endpoint=?', [(int)$u['id'], (string)($b['endpoint'] ?? '')]); return ['ok' => true]; }
/* جولة التنبيهات: عند بداية الدوام لمن لم يسجّل حضوره، وعند نهايته لمن لم يسجّل انصرافه (مرة في اليوم لكل منهما) */
function att_push_tick(bool $force = false): array {
    $W = site()['work']; $out = ['start' => 0, 'end' => 0];
    if ($W['mobile'] === 'off') return $out;
    if (!$force) { if (kv_get('attpush:last') !== null) return $out; kv_put('attpush:last', '1', 240); }
    $mn = fn($t) => (int)substr($t, 0, 2) * 60 + (int)substr($t, 3, 2); $every = (int)($W['checkEvery'] ?? 60); $clk = [];
    foreach (q("SELECT DISTINCT p.user_id, u.staff_ref FROM push_subs p JOIN users u ON u.id=p.user_id WHERE u.active=1 AND u.staff_ref IS NOT NULL")->fetchAll() as $x) {
        $ref = (string)$x['staff_ref']; if (!att_mobile_ok($ref) || att_remote($ref)) continue; /* العامل عن بعد بلا مواعيد ثابتة */
        /* وقت المقر المحلي لكل منسوب */
        $tz = att_tz_for($ref, '', false); $C = $clk[$tz] ??= att_clock($tz);
        if (in_array($C['w'], $W['weekend'], true)) continue;
        $now = $C['min']; $day = $C['day'];
        $inStart = $now >= $mn($W['start']) - 10 && $now <= $mn($W['start']) + max(30, (int)$W['grace']); $inEnd = $now >= $mn($W['end']) && $now <= $mn($W['end']) + 45;
        $inWork = $now > $mn($W['start']) + max(30, (int)$W['grace']) && $now < $mn($W['end']) - 15;
        if (!$inStart && !$inEnd && !($every > 0 && $inWork)) continue;
        $lv = false; foreach (q("SELECT data FROM requests WHERE ref=? AND status='approved' AND type IN ('leave','travel')", [$ref])->fetchAll() as $r) { $d = json_decode($r['data'], true) ?: []; if (($d['from'] ?? '') <= $day && ($d['to'] ?? '') >= $day) { $lv = true; break; } }
        if ($lv) continue;
        $a = q1('SELECT * FROM attendance WHERE ref=? AND day=?', [$ref, $day]);
        if ($inStart && !$a && kv_get('attpush:s:' . $ref . ':' . $day) === null) { kv_put('attpush:s:' . $ref . ':' . $day, '1', 86400); if (push_to_user((int)$x['user_id'], ['title' => 'بداية الدوام', 'body' => 'اضغط لتسجيل حضورك من مقر جهتك.', 'url' => '#myatt-ck', 'tag' => 'att-in'])) $out['start']++; }
        /* تأكيد التواجد أثناء الدوام: يفتح المنسوب التنبيه فيتحقق الجوال من وجوده داخل نطاق المقر */
        if ($every > 0 && $inWork && $a && !$a['out_time']) {
            $slot = intdiv($now - $mn(substr((string)$a['in_time'], 0, 5)), $every);
            if ($slot >= 1 && kv_get('attpush:p:' . $ref . ':' . $day . ':' . $slot) === null) { kv_put('attpush:p:' . $ref . ':' . $day . ':' . $slot, '1', 86400); if (push_to_user((int)$x['user_id'], ['title' => 'تأكيد التواجد في المقر', 'body' => 'اضغط ليتحقق جوالك من وجودك في نطاق المقر.', 'url' => '#myatt-chk', 'tag' => 'att-chk'])) $out['check'] = ($out['check'] ?? 0) + 1; }
        }
        if ($inEnd && $a && !$a['out_time'] && kv_get('attpush:e:' . $ref . ':' . $day) === null) { kv_put('attpush:e:' . $ref . ':' . $day, '1', 86400); if (push_to_user((int)$x['user_id'], ['title' => 'نهاية الدوام', 'body' => 'لا تنسَ تسجيل انصرافك قبل مغادرة المقر.', 'url' => '#myatt-ck', 'tag' => 'att-out'])) $out['end']++; }
    }
    return $out;
}
