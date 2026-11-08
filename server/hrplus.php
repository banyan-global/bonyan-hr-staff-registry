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
    $t = ''; foreach ($rows as $r) if ((string)$r[1] !== '') $t .= '<tr><td style="padding:6px 0;color:#6B778A;width:130px;vertical-align:top;">' . esc_html($r[0]) . '</td><td style="padding:6px 0;font-weight:700;color:#1D2A3B;">' . nl2br(esc_html((string)$r[1])) . '</td></tr>';
    $inner = '<p style="margin:0 0 10px;font-size:14px;line-height:1.9;color:#1D2A3B;">' . esc_html($line) . '</p>' . ($t ? '<table style="border-collapse:collapse;width:100%;font-size:13.5px;">' . $t . '</table>' : '')
        . '<div style="margin:16px 0 6px;"><a href="' . esc_html((string)cfg('site_url') . '#' . $hash) . '" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#16294A;color:#fff;font-weight:700;font-size:13.5px;text-decoration:none;">' . esc_html($btn) . '</a></div>';
    try { send_mail($to, $title, mail_frame('الموارد البشرية · مجموعة بنيان العالمية', $title, $inner), $line . "\n" . (string)cfg('site_url') . '#' . $hash, 'الموارد البشرية · مجموعة بنيان العالمية', logo_inline()); }
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
    if ($r['type'] === 'clear') {
        $s = staff_get($r['ref']); if (!$s) return;
        $s['data']['serviceStatus'] = 'منتهية خدمته'; $s['data']['serviceEnd'] = (string)($d['lastDay'] ?? ''); $s['data']['endReason'] = (string)($d['why'] ?? '');
        $s['updated_at'] = now(); staff_put($s);
        audit_log($r['ref'], 'انتهاء خدمة المنسوب', 'إخلاء الطرف ' . $r['no'] . ' · آخر يوم عمل ' . ($d['lastDay'] ?? '') . ' · ' . ($d['why'] ?? '') . ' · يبقى الملف في السجل للرجوع إليه', $actor);
    }
}
