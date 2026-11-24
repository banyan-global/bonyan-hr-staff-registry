<?php
/**
 * سجلي المالي: رواتب المنسوب شهرًا بشهر بأثر رجعي، وما صُرف له أو عليه، وتصنيفات العهد.
 * الرواتب تُحسب من الراتب الحالي وقرارات العلاوة المعتمدة والعمل الإضافي والسلف والجزاءات والإجازات بدون راتب.
 * المصروفات: ما يُستخرج من الطلبات (مستحقات، علاج، سلف، سلفة مهمة، تدريب) + ما يسجّله قسم الموارد البشرية يدويًا.
 */
declare(strict_types=1);

/* ============================================================ تصنيفات العهد (مجموعات، مع «أخرى» يكتبها المسجّل) */
const CUS_GROUPS = [
    'أجهزة تقنية' => ['حاسب محمول', 'حاسب مكتبي', 'شاشة', 'جهاز لوحي', 'جوال عمل', 'طابعة', 'ماسح ضوئي', 'جهاز عرض (بروجكتر)', 'سبورة ذكية أو شاشة تفاعلية', 'كاميرا', 'سماعات وميكروفون', 'جهاز إنترنت متنقل', 'قرص تخزين خارجي', 'ملحقات (شاحن، فأرة، لوحة مفاتيح)'],
    'أثاث مكتبي' => ['مكتب', 'كرسي', 'خزانة ملفات', 'رف أو مكتبة', 'طاولة اجتماعات', 'خزنة'],
    'أثاث وتجهيزات السكن' => ['سرير', 'مرتبة', 'خزانة ملابس', 'مكيف', 'ثلاجة', 'غسالة', 'سخان مياه', 'تلفاز', 'جلسة أو كنب', 'مفارش وبطانيات', 'ستائر'],
    'المطبخ والأدوات المنزلية' => ['موقد أو فرن', 'ميكروويف', 'غلاية', 'أواني وأدوات طبخ', 'برادة مياه', 'مكنسة كهربائية'],
    'تعليمية وتدريبية' => ['سبورة', 'حقيبة تدريبية', 'كتب ومراجع', 'أدوات مختبر', 'وسائل تعليمية', 'أدوات رياضية', 'أدوات تدريب حرفي'],
    'مركبات ونقل' => ['سيارة', 'حافلة', 'دراجة نارية', 'بطاقة وقود', 'جهاز تتبع مركبة'],
    'مفاتيح وبطاقات' => ['مفتاح مكتب', 'مفتاح فصل أو قاعة', 'مفتاح غرفة السكن', 'بطاقة دخول', 'بطاقة موظف', 'جهاز تحكم بوابة', 'مفتاح خزنة'],
    'مستندات وأختام' => ['ختم الجهة', 'مستندات أصلية', 'عقود وسجلات', 'دفتر سندات'],
    'عهد مالية' => ['عهدة نقدية تشغيلية', 'صندوق نثرية', 'بطاقة مشتريات للجهة'],
    'معدات ميدانية وإغاثية' => ['خيمة', 'مولد كهربائي', 'مضخة مياه', 'هاتف فضائي', 'حقيبة إسعافات أولية', 'معدات توزيع'],
    'أمن وسلامة' => ['جهاز لاسلكي', 'كاميرا مراقبة', 'طفاية حريق', 'معدات حماية شخصية'],
    'زي وملابس عمل' => ['زي رسمي', 'معطف مختبر', 'سترة ميدانية'],
];
/* مقترحات العهد حسب الجهة (يُطابَق بجزء من اسم الجهة، بالترتيب) */
const CUS_SUGGEST = [
    'عن بعد' => ['حاسب محمول', 'سماعات وميكروفون', 'كاميرا', 'جهاز إنترنت متنقل', 'شاشة', 'ملحقات (شاحن، فأرة، لوحة مفاتيح)', 'جهاز لوحي', 'جوال عمل', 'قرص تخزين خارجي', 'مكتب', 'كرسي', 'بطاقة موظف'],
    'جامعة' => ['سرير', 'مرتبة', 'خزانة ملابس', 'مكيف', 'مفتاح غرفة السكن', 'ثلاجة', 'مفارش وبطانيات', 'غسالة', 'سخان مياه', 'ستائر', 'مكتب', 'كرسي', 'بطاقة دخول'],
    'بنين' => ['سبورة ذكية أو شاشة تفاعلية', 'حاسب محمول', 'جهاز عرض (بروجكتر)', 'كتب ومراجع', 'أدوات مختبر', 'مفتاح فصل أو قاعة', 'أدوات رياضية', 'وسائل تعليمية', 'سبورة', 'طابعة', 'مكتب', 'كرسي', 'بطاقة موظف'],
    'بنات' => ['سبورة ذكية أو شاشة تفاعلية', 'حاسب محمول', 'جهاز عرض (بروجكتر)', 'كتب ومراجع', 'أدوات مختبر', 'مفتاح فصل أو قاعة', 'وسائل تعليمية', 'أدوات رياضية', 'سبورة', 'طابعة', 'مكتب', 'كرسي', 'بطاقة موظف'],
    'الإنسانية' => ['خيمة', 'مولد كهربائي', 'حقيبة إسعافات أولية', 'سيارة', 'عهدة نقدية تشغيلية', 'معدات توزيع', 'مضخة مياه', 'هاتف فضائي', 'جهاز لاسلكي', 'سترة ميدانية', 'بطاقة وقود', 'حاسب محمول', 'معدات حماية شخصية'],
    'التمكين' => ['سرير', 'مرتبة', 'خزانة ملابس', 'أواني وأدوات طبخ', 'غسالة', 'ثلاجة', 'موقد أو فرن', 'أدوات تدريب حرفي', 'جهاز لوحي', 'مفتاح غرفة السكن', 'مفارش وبطانيات', 'مكيف', 'تلفاز'],
    'كينيا' => ['هاتف فضائي', 'مولد كهربائي', 'مضخة مياه', 'سيارة', 'خيمة', 'عهدة نقدية تشغيلية', 'دراجة نارية', 'حاسب محمول', 'جوال عمل', 'حقيبة إسعافات أولية', 'بطاقة وقود', 'جهاز إنترنت متنقل'],
    'كفاءة' => ['حاسب محمول', 'حاسب مكتبي', 'شاشة', 'جوال عمل', 'جهاز لوحي', 'كاميرا', 'سماعات وميكروفون', 'قرص تخزين خارجي', 'جهاز إنترنت متنقل', 'ملحقات (شاحن، فأرة، لوحة مفاتيح)', 'طابعة', 'بطاقة دخول'],
    'تدريب' => ['حاسب محمول', 'جوال عمل', 'جهاز عرض (بروجكتر)', 'حقيبة تدريبية', 'بطاقة دخول', 'مفتاح مكتب', 'طابعة', 'كتب ومراجع', 'سبورة ذكية أو شاشة تفاعلية', 'سيارة', 'مكتب', 'كرسي', 'ختم الجهة'],
    '*' => ['حاسب محمول', 'جوال عمل', 'بطاقة دخول', 'مفتاح مكتب', 'مكتب', 'كرسي', 'شاشة', 'طابعة', 'جهاز لوحي', 'خزانة ملفات', 'سيارة', 'بطاقة موظف'],
];
function cus_suggest_for(string $entity): array { foreach (CUS_SUGGEST as $k => $l) if ($k !== '*' && mb_strpos($entity, $k) !== false) return $l; return CUS_SUGGEST['*']; }
function cus_cat_all(): array { $a = []; foreach (CUS_GROUPS as $g) $a = array_merge($a, $g); return $a; }
function cus_group_of(string $cat): string {
    foreach (CUS_GROUPS as $g => $items) if (in_array($cat, $items, true)) return $g;
    return in_array($cat, CUS_CATS, true) && $cat !== 'أخرى' ? 'تصنيف سابق' : 'أخرى';
}
/* التصنيف المرسل: عنصر من المجموعات، أو تصنيف قديم (عند تعديل عهدة سابقة)، أو «أخرى» بنص يكتبه المسجّل */
function cus_cat_clean(array $b): string {
    $c = (string)($b['category'] ?? '');
    if (in_array($c, cus_cat_all(), true)) return $c;
    if ($c === 'أخرى' || str_starts_with($c, 'أخرى: ')) {
        $t = hrp_str($b['catOther'] ?? ($c !== 'أخرى' ? mb_substr($c, 6) : ''), 100);
        if (mb_strlen($t) < 2) throw new HttpError('اكتب نوع العهدة');
        return 'أخرى: ' . $t;
    }
    if (in_array($c, CUS_CATS, true)) return $c;
    throw new HttpError('اختر تصنيف العهدة');
}
function cus_meta(): array { return ['groups' => CUS_GROUPS, 'suggest' => CUS_SUGGEST]; }

/* ============================================================ العملة والأرقام */
function fin_num($v): float { return (float)preg_replace('/[^\d.]/', '', to_ascii_digits((string)$v)); }
function fin_cur_req(array $d): string {
    $m = ['ريال سعودي' => 'SAR', 'روبية إندونيسية' => 'IDR', 'دولار أمريكي' => 'USD', 'شلن كيني' => 'KES'];
    return $m[(string)($d['cur'] ?? '')] ?? 'SAR';
}

/* ============================================================ الرواتب شهرًا بشهر */
function fin_raises(string $ref): array {
    $o = [];
    foreach (q("SELECT no, data FROM hr_actions WHERE ref=? AND kind='raise' AND status='issued'", [$ref])->fetchAll() as $a) {
        $d = json_decode($a['data'], true) ?: []; $e = (string)($d['effective'] ?? ''); $nw = (float)($d['newSalary'] ?? 0);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $e) || $nw <= 0) continue;
        $o[] = ['no' => $a['no'], 'effective' => $e, 'old' => (float)($d['oldSalary'] ?? 0), 'new' => $nw];
    }
    usort($o, fn($a, $b) => strcmp($a['effective'], $b['effective']));
    return $o;
}
/* سجل الراتب اليدوي (تكتبه الموارد البشرية: «من شهر كذا الراتب كذا») */
function fin_hist(string $ref): array { return array_map(fn($r) => ['from' => $r['from_ym'], 'amount' => (float)$r['amount']], q('SELECT from_ym, amount FROM salary_hist WHERE ref=? ORDER BY from_ym', [$ref])->fetchAll()); }
/* الراتب الأساسي لشهر: آخر تغيير بدأ في هذا الشهر أو قبله (من سجل الراتب أو من علاوة معتمدة)، وقبل أول تغيير يُعتمد ما سبقه */
function fin_base_for(string $ym, float $now, array $raises, array $hist = []): float {
    $ev = [];
    foreach ($raises as $r) $ev[] = [substr($r['effective'], 0, 7), $r['new']];
    foreach ($hist as $h) $ev[] = [$h['from'], $h['amount']]; /* سجل الراتب اليدوي يغلب العلاوة في الشهر نفسه (الترتيب ثابت) */
    if (!$ev) return $now;
    usort($ev, fn($a, $b) => strcmp($a[0], $b[0]));
    $b = null; foreach ($ev as $e) if ($e[0] <= $ym) $b = $e[1];
    if ($b !== null) return $b;
    if ($hist && $hist[0]['from'] === $ev[0][0]) return $hist[0]['amount'];
    return $raises && $raises[0]['old'] > 0 ? $raises[0]['old'] : $now;
}
function fin_salary(string $ref, int $year): array {
    $s = staff_get($ref); if (!$s) throw new HttpError('not_found', 404);
    $sd = $s['data']; $now = fin_num($sd['salary'] ?? ''); $cur = pay_cur($sd); $raises = fin_raises($ref);
    $hist = fin_hist($ref); if ($now <= 0 && $hist) $now = $hist[count($hist) - 1]['amount'];
    $conf = []; foreach (q('SELECT * FROM pay_confirm WHERE ref=? AND ym LIKE ?', [$ref, $year . '-%'])->fetchAll() as $c) $conf[$c['ym']] = $c;
    $start = substr((string)($sd['startDate'] ?? ''), 0, 7); $thisM = date('Y-m');
    $ot = []; $loans = []; $unpaid = []; $pens = [];
    foreach (q("SELECT no, type, data FROM requests WHERE ref=? AND status='approved' AND type IN ('ot','loan','leave')", [$ref])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: [];
        if ($r['type'] === 'ot') { $day = (string)($d['day'] ?? ''); if ($day === '') continue; $m = substr($day, 0, 7); $ot[$m]['mins'] = ($ot[$m]['mins'] ?? 0) + (int)($d['mins'] ?? 0); $ot[$m]['nos'][] = $r['no']; }
        elseif ($r['type'] === 'loan') $loans[] = ['no' => $r['no'], 'start' => (string)($d['start'] ?? ''), 'end' => (string)($d['end'] ?? ''), 'n' => (int)($d['months'] ?? 1), 'inst' => (float)($d['inst'] ?? 0), 'amount' => (float)($d['amount'] ?? 0)];
        elseif (leave_kind_norm((string)($d['kind'] ?? '')) === 'بدون راتب' && !empty($d['from']) && !empty($d['to'])) $unpaid[] = ['no' => $r['no'], 'from' => (string)$d['from'], 'to' => (string)$d['to']];
    }
    foreach (q("SELECT no, data FROM hr_actions WHERE ref=? AND status='issued' AND kind='violation'", [$ref])->fetchAll() as $a) {
        $d = json_decode($a['data'], true) ?: []; $e = (string)($d['effective'] ?? ''); if ((int)($d['deduct'] ?? 0) < 1 || $e === '') continue;
        $pens[substr($e, 0, 7)][] = ['no' => $a['no'], 'days' => (int)$d['deduct']];
    }
    $months = [];
    for ($i = 1; $i <= 12; $i++) {
        $ym = sprintf('%04d-%02d', $year, $i);
        $cf = $conf[$ym] ?? null; $st = $cf ? 'paid' : ($ym < $thisM ? 'wait' : ($ym === $thisM ? 'due' : 'proj'));
            $endM = substr((string)($sd['serviceEnd'] ?? ''), 0, 7);
        if (($start !== '' && $ym < $start) || ($endM !== '' && $ym > $endM) || $now <= 0) { $months[] = ['m' => $ym, 'st' => 'none']; continue; }
        $base = fin_base_for($ym, $now, $raises, $hist); $h = $base / 30 / 8; $lines = [];
        $o = $ot[$ym] ?? null; $otAmt = $o ? round($o['mins'] / 60 * $h * 1.5, 2) : 0;
        if ($o) $lines[] = ['k' => 'ot', 'amount' => $otAmt, 'hours' => round($o['mins'] / 60, 2), 'rate' => round($h * 1.5, 2), 'nos' => $o['nos']];
        $ded = 0.0;
        foreach ($loans as $l) {
            if (!$l['start'] || $ym < $l['start'] || $ym > $l['end']) continue;
            $k = 1; for ($t = strtotime($l['start'] . '-01'); date('Y-m', $t) < $ym; $t = strtotime('+1 month', $t)) $k++;
            $inst = $k === $l['n'] ? round($l['amount'] - $l['inst'] * ($l['n'] - 1), 2) : $l['inst'];
            $lines[] = ['k' => 'loan', 'amount' => $inst, 'no' => $l['no'], 'i' => $k, 'n' => $l['n'], 'total' => $l['amount']]; $ded += $inst;
        }
        foreach ($pens[$ym] ?? [] as $p) { $a = round($h * 8 * $p['days'], 2); $lines[] = ['k' => 'pen', 'amount' => $a, 'no' => $p['no'], 'days' => $p['days']]; $ded += $a; }
        $from = $ym . '-01'; $to = date('Y-m-t', strtotime($from));
        foreach ($unpaid as $u) {
            $a0 = max($u['from'], $from); $b0 = min($u['to'], $to); if ($a0 > $b0) continue;
            $days = req_days($a0, $b0); $a = round($base / 30 * $days, 2);
            $lines[] = ['k' => 'unpaid', 'amount' => $a, 'no' => $u['no'], 'days' => $days, 'daily' => round($base / 30, 2)]; $ded += $a;
        }
        $months[] = ['m' => $ym, 'st' => $st, 'base' => $base, 'add' => $otAmt, 'ded' => round($ded, 2), 'net' => round($base + $otAmt - $ded, 2), 'lines' => $lines,
            'raise' => array_values(array_filter($raises, fn($r) => substr($r['effective'], 0, 7) === $ym)),
            'conf' => $cf ? ['at' => substr($cf['at'], 0, 16), 'by' => $cf['by_name'], 'amount' => (float)$cf['amount'], 'kind' => (string)($cf['by_kind'] ?? 'admin'), 'paid' => $cf['paid_on'] ? substr($cf['paid_on'], 0, 7) : $ym] : null];
    }
    $yrs = []; $y0 = $start !== '' ? (int)substr($start, 0, 4) : (int)date('Y'); for ($y = max($y0, (int)date('Y') - 5); $y <= (int)date('Y'); $y++) $yrs[] = $y;
    return ['cur' => $cur, 'salary' => $now, 'start' => (string)($sd['startDate'] ?? ''), 'raises' => $raises, 'months' => $months, 'years' => array_reverse($yrs),
        'rule' => 'أجر الساعة = الراتب ÷ 30 ÷ 8، والساعة الإضافية = أجر الساعة × 1.5، واليوم = الراتب ÷ 30'];
}

/* ============================================================ المصروفات */
const EXP_CATS = ['ticket' => 'تذاكر سفر', 'med' => 'العلاج', 'visa' => 'تأشيرة وإقامة', 'other' => 'مصاريف أخرى'];
/* توحيد التصنيفات القديمة إلى الأربعة المعتمدة */
function exp_cat_map(string $c): string { return in_array($c, ['ticket', 'med', 'visa'], true) ? $c : ($c === 'gov' ? 'visa' : 'other'); }
function exp_row(array $e): array {
    $s = staff_get($e['ref']);
    return ['id' => 'M' . $e['id'], 'src' => 'hr', 'ref' => $e['ref'], 'name' => $s ? staff_name($s) : $e['ref'], 'day' => $e['day'], 'cat' => exp_cat_map($e['cat']), 'dir' => $e['dir'],
        'amount' => (float)$e['amount'], 'cur' => $e['cur'], 'title' => $e['title'], 'note' => $e['note'], 'no' => $e['req_no'], 'pend' => false, 'by' => $e['created_by']];
}
/* ما يُستخرج من الطلبات: المعتمدة تُحتسب، والتي قيد الاعتماد تظهر دون أن تُجمع */
function exp_from_requests(?string $ref, int $year): array {
    $sql = "SELECT * FROM requests WHERE status IN ('approved','pending','returned') AND type IN ('dues','med','loan','travel','train')" . ($ref !== null ? ' AND ref=?' : '');
    $o = [];
    foreach (q($sql, $ref !== null ? [$ref] : [])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: []; $day = substr($r['updated_at'], 0, 10); $pend = $r['status'] !== 'approved';
        if ((int)substr($day, 0, 4) !== $year) continue;
        $s = staff_get($r['ref']); $sc = $s ? pay_cur($s['data']) : 'SAR'; $x = null;
        if ($r['type'] === 'dues' && ($a = fin_num($d['amount'] ?? 0)) > 0)
            $x = ['cat' => 'dues', 'dir' => 'in', 'amount' => $a, 'cur' => fin_cur_req($d), 'title' => (string)($d['kind'] === 'أخرى' ? ($d['kindOther'] ?? 'مستحقات مالية') : ($d['kind'] ?? 'مستحقات مالية')), 'note' => 'طلب مستحقات مالية'];
        elseif ($r['type'] === 'med' && ($a = fin_num($d['cost'] ?? 0)) > 0)
            $x = ['cat' => 'med', 'dir' => str_starts_with((string)($d['need'] ?? ''), 'تعويض') ? 'in' : 'out', 'amount' => $a, 'cur' => $sc, 'title' => 'علاج: ' . (string)(($d['kind'] ?? '') === 'أخرى' ? ($d['kindOther'] ?? 'أخرى') : ($d['kind'] ?? '')), 'note' => (string)($d['need'] ?? '') . (!empty($d['facility']) ? ' · ' . $d['facility'] : '')];
        elseif ($r['type'] === 'loan' && ($a = (float)($d['amount'] ?? 0)) > 0)
            $x = ['cat' => 'loan', 'dir' => 'in', 'amount' => $a, 'cur' => $sc, 'title' => 'سلفة على الراتب', 'note' => ($d['months'] ?? 1) . ' أقساط من ' . ($d['start'] ?? '')];
        elseif ($r['type'] === 'travel' && ($a = (float)($d['advance'] ?? 0)) > 0)
            $x = ['cat' => 'ticket', 'dir' => 'in', 'amount' => $a, 'cur' => $sc, 'title' => 'سلفة مصاريف مهمة', 'note' => trim(($d['fromCity'] ?? '') . ' ← ' . ($d['toCity'] ?? ''), ' ←')];
        elseif ($r['type'] === 'train' && ($a = (float)($d['cost'] ?? 0)) > 0)
            $x = ['cat' => 'train', 'dir' => 'out', 'amount' => $a, 'cur' => $sc, 'title' => 'برنامج تدريبي: ' . ($d['program'] ?? ''), 'note' => (string)($d['provider'] ?? '')];
        if (!$x) continue;
        $x['cat'] = exp_cat_map($x['cat']);
        $o[] = $x + ['id' => 'R' . $r['no'], 'src' => 'req', 'ref' => $r['ref'], 'name' => $s ? staff_name($s) : $r['ref'], 'day' => $day, 'no' => $r['no'], 'pend' => $pend, 'by' => ''];
    }
    return $o;
}
function exp_rows(?string $ref, int $year): array {
    $man = $ref !== null ? q('SELECT * FROM expenses WHERE ref=? AND YEAR(day)=?', [$ref, $year])->fetchAll() : q('SELECT * FROM expenses WHERE YEAR(day)=?', [$year])->fetchAll();
    $rows = array_merge(array_map('exp_row', $man), exp_from_requests($ref, $year));
    usort($rows, fn($a, $b) => strcmp($b['day'], $a['day']) ?: strcmp($b['id'], $a['id']));
    return $rows;
}
function fin_year($v): int { $y = (int)$v; return $y >= 2000 && $y <= (int)date('Y') + 1 ? $y : (int)date('Y'); }

/* ============================================================ الواجهات */
/* سجلي المالي للمنسوب (أو لمنسوب محدد لمن يملك صلاحية الرواتب) */
function my_fin(array $b): array {
    $u = hrp_me(); $year = fin_year($b['year'] ?? 0);
    $ref = (string)($b['ref'] ?? '');
    if ($ref !== '' && has_perm($u, 'finance.view')) { if (in_array($ref, private_hidden_for($u), true)) throw new HttpError('not_found', 404); }
    else { $ref = (string)my_staff_ref($u); if ($ref === '' || !site_on('staff', 'myhr')) return ['ok' => true, 'off' => true]; }
    $pay = fin_salary($ref, $year); /* راتب كل منسوب يظهر له دائمًا، محسوبًا من تسجيله */
    $me = $ref === (string)my_staff_ref($u);
    return ['ok' => true, 'year' => $year, 'pay' => $pay, 'exp' => exp_rows($ref, $year), 'cats' => EXP_CATS, 'signreq' => $me ? array_keys(pay_signreq_pending($ref)) : [], 'me' => $me];
}
/* سجل المصروفات لكل المنسوبين (الموارد البشرية) */
function exp_list(array $b): array {
    $u = require_perm('finance.view'); $year = fin_year($b['year'] ?? 0);
    $ref = (string)($b['ref'] ?? '');
    $rows = private_filter($u, exp_rows($ref !== '' ? $ref : null, $year));
    return ['ok' => true, 'year' => $year, 'rows' => $rows, 'cats' => EXP_CATS, 'canEdit' => has_perm($u, 'staff.edit')];
}
function exp_save(array $b): array {
    $u = require_perm('finance.view'); if (!has_perm($u, 'staff.edit')) throw new HttpError('forbidden', 403);
    $ref = (string)($b['ref'] ?? ''); if (!staff_get($ref)) throw new HttpError('اختر المنسوب');
    $day = hrp_date($b['day'] ?? ''); if (!$day) throw new HttpError('اختر تاريخ الصرف');
    $cat = array_key_exists($b['cat'] ?? '', EXP_CATS) ? (string)$b['cat'] : ''; if (!$cat) throw new HttpError('اختر بند المصروف');
    $dir = ($b['dir'] ?? '') === 'in' ? 'in' : (($b['dir'] ?? '') === 'out' ? 'out' : ''); if (!$dir) throw new HttpError('حدّد هل صُرف للمنسوب أم عليه');
    $amt = round(fin_num($b['amount'] ?? 0), 2); if ($amt <= 0 || $amt > 100000000) throw new HttpError('اكتب المبلغ');
    $cur = preg_match('/^[A-Z]{3}$/', (string)($b['cur'] ?? '')) ? (string)$b['cur'] : 'SAR';
    $title = hrp_str($b['title'] ?? '', 160); if (mb_strlen($title) < 2) throw new HttpError('اكتب وصف المصروف');
    $no = preg_match('/^[A-Z]{2}-\d{4}-\d{4}$/', (string)($b['no'] ?? '')) ? (string)$b['no'] : '';
    $args = [$ref, $day, $cat, $dir, $amt, $cur, $title, hrp_str($b['note'] ?? '', 600), $no];
    $id = (int)preg_replace('/\D/', '', (string)($b['id'] ?? ''));
    if ($id) {
        if (!q1('SELECT id FROM expenses WHERE id=?', [$id])) throw new HttpError('not_found', 404);
        q('UPDATE expenses SET ref=?, day=?, cat=?, dir=?, amount=?, cur=?, title=?, note=?, req_no=? WHERE id=?', array_merge($args, [$id]));
        audit_log($ref, 'تعديل مصروف في السجل المالي', $title . ' · ' . $day, hrp_label($u));
    } else {
        q('INSERT INTO expenses (ref, day, cat, dir, amount, cur, title, note, req_no, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)', array_merge($args, [hrp_label($u), now()]));
        $id = (int)db()->lastInsertId();
        audit_log($ref, 'تسجيل مصروف في السجل المالي', $title . ' · ' . EXP_CATS[$cat] . ' · ' . $day, hrp_label($u));
    }
    return ['ok' => true, 'row' => exp_row(q1('SELECT * FROM expenses WHERE id=?', [$id]))];
}
function exp_delete(array $b): array {
    $u = require_perm('finance.view'); if (!has_perm($u, 'staff.edit')) throw new HttpError('forbidden', 403);
    $id = (int)preg_replace('/\D/', '', (string)($b['id'] ?? ''));
    $e = q1('SELECT * FROM expenses WHERE id=?', [$id]); if (!$e) throw new HttpError('not_found', 404);
    q('DELETE FROM expenses WHERE id=?', [$id]);
    audit_log($e['ref'], 'حذف مصروف من السجل المالي', $e['title'] . ' · ' . $e['day'], hrp_label($u));
    return ['ok' => true];
}

/* ============================================================ تأكيد صرف الرواتب (الإدارة العليا والموارد البشرية ومدير النظام) */
/* كتابة توقيع استلام راتب شهر، مع شهر الصرف الفعلي ومصدر التوقيع (admin/self/system)، وإغلاق أي طلب توقيع معلّق */
function pay_sign_put(string $ym, string $ref, float $net, string $cur, string $byEmail, string $byName, string $kind, ?string $paidYm, string $note): void {
    $paid = ($paidYm && preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', (string)$paidYm)) ? $paidYm . '-01' : $ym . '-01';
    q('INSERT INTO pay_confirm (ym, ref, amount, cur, by_email, by_name, at, note, paid_on, by_kind) VALUES (?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE amount=VALUES(amount), cur=VALUES(cur), by_email=VALUES(by_email), by_name=VALUES(by_name), at=VALUES(at), note=VALUES(note), paid_on=VALUES(paid_on), by_kind=VALUES(by_kind)',
        [$ym, $ref, $net, $cur, $byEmail, $byName, now(), $note, $paid, $kind]);
    q("UPDATE pay_signreq SET status='done', done_at=? WHERE ym=? AND ref=? AND status='pending'", [now(), $ym, $ref]);
}
/* الأشهر التي طُلب من المنسوب توقيعها ولم يوقّع بعد (مفتاح ym => سطر الطلب) */
function pay_signreq_pending(string $ref): array { $o = []; foreach (q("SELECT ym, sent_at, reminded FROM pay_signreq WHERE ref=? AND status='pending'", [$ref])->fetchAll() as $r) $o[$r['ym']] = $r; return $o; }
function pay_conf_rows(array $u, string $ym): array {
    $hide = private_hidden_for($u); $year = (int)substr($ym, 0, 4); $i = (int)substr($ym, 5, 2) - 1; $rows = [];
    $req = []; foreach (q("SELECT ref, sent_at, reminded FROM pay_signreq WHERE ym=? AND status='pending'", [$ym])->fetchAll() as $rq) $req[$rq['ref']] = ['at' => substr($rq['sent_at'], 0, 16), 'reminded' => (int)$rq['reminded']];
    foreach (q('SELECT ref FROM staff ORDER BY ref')->fetchAll() as $r) {
        if (in_array($r['ref'], $hide, true)) continue;
        $s = staff_get($r['ref']); if (!$s) continue;
        if (fin_num($s['data']['salary'] ?? '') <= 0 && !q1('SELECT id FROM salary_hist WHERE ref=? LIMIT 1', [$r['ref']])) continue;
        $f = fin_salary($r['ref'], $year); $m = $f['months'][$i] ?? null; if (!$m || $m['st'] === 'none') continue;
        $rows[] = ['ref' => $r['ref'], 'name' => staff_name($s), 'job' => (string)($s['data']['job'] ?? ''), 'entity' => (string)($s['data']['entity'] ?? ''), 'start' => (string)($s['data']['startDate'] ?? ''), 'cur' => $f['cur'], 'base' => $m['base'], 'add' => $m['add'], 'ded' => $m['ded'], 'net' => $m['net'], 'conf' => $m['conf'], 'req' => $req[$r['ref']] ?? null, 'mail' => hrp_staff_mail($r['ref']) !== '', 'hist' => count(fin_hist($r['ref']))];
    }
    usort($rows, fn($a, $b) => strcmp($a['entity'], $b['entity']) ?: strcmp($a['name'], $b['name']));
    return $rows;
}
function fin_ym($v): string { return preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', (string)$v) ? (string)$v : date('Y-m'); }
const FIN_MN = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
function fin_mn(string $ym): string { return (FIN_MN[(int)substr($ym, 5, 2) - 1] ?? '') . ' ' . substr($ym, 0, 4); }
const FIN_CUR_N = ['SAR' => 'ريال', 'USD' => 'دولار', 'EGP' => 'جنيه', 'IDR' => 'روبية', 'KES' => 'شلن كيني', 'PKR' => 'روبية'];
function fin_money(float $v, string $cur): string { return number_format($v, $v == floor($v) ? 0 : 2) . ' ' . (FIN_CUR_N[$cur] ?? $cur); }
function pay_conf_list(array $b): array {
    $u = require_perm('finance.view'); $ym = fin_ym($b['month'] ?? '');
    $months = []; for ($k = 0; $k < 14; $k++) $months[] = date('Y-m', strtotime(date('Y-m-01') . " -$k month"));
    return ['ok' => true, 'month' => $ym, 'months' => $months, 'rows' => pay_conf_rows($u, $ym)];
}
function pay_confirm(array $b): array {
    $u = require_perm('settings.manage'); $ym = fin_ym($b['month'] ?? ''); /* التوقيع نيابةً عن المنسوب لحساب النظام فقط */
    if ($ym > date('Y-m')) throw new HttpError('لا يمكن تأكيد صرف شهر لم يأتِ بعد');
    $scope = (string)($b['scope'] ?? ''); $undo = !empty($b['undo']);
    $rows = pay_conf_rows($u, $ym);
    if ($scope === 'entity') { $e = (string)($b['entity'] ?? ''); $rows = array_values(array_filter($rows, fn($r) => $r['entity'] === $e)); }
    elseif ($scope === 'refs') { $refs = array_map('strval', (array)($b['refs'] ?? [])); $rows = array_values(array_filter($rows, fn($r) => in_array($r['ref'], $refs, true))); }
    elseif ($scope !== 'all') throw new HttpError('حدّد من تؤكد صرف رواتبهم');
    $mn = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][(int)substr($ym, 5, 2) - 1] . ' ' . substr($ym, 0, 4);
    $n = 0; $note = hrp_str($b['note'] ?? '', 300); $paidYm = isset($b['paidYm']) && preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', (string)$b['paidYm']) ? (string)$b['paidYm'] : null;
    foreach ($rows as $r) {
        if ($undo) { if (!$r['conf']) continue; q('DELETE FROM pay_confirm WHERE ym=? AND ref=?', [$ym, $r['ref']]); $n++; continue; }
        if ($r['conf']) continue;
        pay_sign_put($ym, $r['ref'], $r['net'], $r['cur'], (string)$u['email'], hrp_label($u), 'admin', $paidYm, $note); $n++;
        $to = hrp_staff_mail($r['ref']); if ($to) note_add($to, 'صُرف راتب ' . $mn, 'أكّدت الإدارة صرف راتبك لشهر ' . $mn . '. التفاصيل في «سجلي المالي».', '', 'ok');
    }
    if ($n) audit_log($scope === 'refs' && count($rows) === 1 ? $rows[0]['ref'] : '', $undo ? 'التراجع عن تأكيد صرف رواتب' : 'تأكيد صرف رواتب', $mn . ' · ' . $n . ' منسوب' . ($scope === 'entity' ? ' · ' . ($b['entity'] ?? '') : ($scope === 'all' ? ' · الكل' : '')), hrp_label($u));
    return ['ok' => true, 'count' => $n, 'rows' => pay_conf_rows($u, $ym)];
}
/* جوهر توقيع الرواتب بأثر رجعي — من بداية دوام كل منسوب حتى شهر الحدّ. يستدعيه زر الإدارة والتسجيل التلقائي معًا */
function pay_sign_core(string $through, string $byEmail, string $byName, string $kind, string $note, array $hide = [], string $scope = 'all', array $refs = [], string $ent = '', bool $notify = true): array {
    if ($through > date('Y-m')) $through = date('Y-m');
    $n = 0; $people = 0; $MN = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    foreach (q('SELECT ref FROM staff ORDER BY ref')->fetchAll() as $row) {
        $ref = $row['ref']; if (in_array($ref, $hide, true)) continue;
        if ($scope === 'refs' && !in_array($ref, $refs, true)) continue;
        $s = staff_get($ref); if (!$s) continue;
        if ($scope === 'entity' && (string)($s['data']['entity'] ?? '') !== $ent) continue;
        if (fin_num($s['data']['salary'] ?? '') <= 0 && !q1('SELECT id FROM salary_hist WHERE ref=? LIMIT 1', [$ref])) continue;
        $start = substr((string)($s['data']['startDate'] ?? ''), 0, 7); if ($start === '' || $start > $through) $start = $through;
        $y0 = (int)substr($start, 0, 4); $y1 = (int)substr($through, 0, 4);
        $have = array_flip(q('SELECT ym FROM pay_confirm WHERE ref=?', [$ref])->fetchAll(PDO::FETCH_COLUMN)); $first = null; $last = null; $added = 0;
        for ($y = $y0; $y <= $y1; $y++) {
            $f = fin_salary($ref, $y);
            foreach ($f['months'] as $m) {
                if ($m['st'] === 'none' || $m['m'] < $start || $m['m'] > $through || isset($have[$m['m']])) continue;
                pay_sign_put($m['m'], $ref, $m['net'], $f['cur'], $byEmail, $byName, $kind, null, $note);
                $n++; $added++; if ($first === null) $first = $m['m']; $last = $m['m'];
            }
        }
        if ($added) { $people++;
            if ($notify && ($to = hrp_staff_mail($ref)) && $first) note_add($to, 'توقيع استلام رواتبك', 'سُجّل استلامك رواتب ' . $MN[(int)substr($first, 5, 2) - 1] . ' ' . substr($first, 0, 4) . ' حتى ' . $MN[(int)substr($last, 5, 2) - 1] . ' ' . substr($last, 0, 4) . '. تجدها في «سجلي المالي».', '', 'ok'); }
    }
    return ['count' => $n, 'people' => $people, 'through' => $through];
}
/* زر الإدارة: توقيع استلام الرواتب بأثر رجعي (افتراضيًا حتى قبل 3 أشهر، فتبقى آخر ثلاثة بانتظار التوقيع) */
function pay_sign_retro(array $b): array {
    $u = require_perm('settings.manage'); /* التوقيع بأثر رجعي لحساب النظام فقط */
    $through = fin_ym($b['through'] ?? date('Y-m', strtotime(date('Y-m-01') . ' -3 month')));
    $scope = (string)($b['scope'] ?? 'all'); $refs = array_map('strval', (array)($b['refs'] ?? [])); $ent = (string)($b['entity'] ?? '');
    $r = pay_sign_core($through, (string)$u['email'], hrp_label($u), 'admin', 'توقيع بأثر رجعي', private_hidden_for($u), $scope, $refs, $ent, true);
    if ($r['count']) audit_log($scope === 'refs' && count($refs) === 1 ? $refs[0] : '', 'توقيع استلام رواتب بأثر رجعي', 'حتى ' . $r['through'] . ' · ' . $r['people'] . ' منسوب · ' . $r['count'] . ' شهر' . ($scope === 'entity' ? ' · ' . $ent : ($scope === 'all' ? ' · الكل' : '')), hrp_label($u));
    return ['ok' => true, 'count' => $r['count'], 'people' => $r['people'], 'through' => $r['through'], 'rows' => pay_conf_rows($u, fin_ym($b['month'] ?? ''))];
}
/* أُلغي التسجيل التلقائي للرواتب بأثر رجعي: صار كل منسوب يوقّع استلام رواتبه بنفسه من تاريخ مباشرته العمل. */
function pay_backfill_once(): void { /* مُعطّل عمدًا — لا توقيع تلقائي بعد الآن */ }

/* إزالة التواقيع التلقائية السابقة (باسم النظام) مرة واحدة، ليعود كل منسوب فيوقّع استلام رواتبه بنفسه */
function pay_unsign_system_once(): void {
    if (kv_get('pay_unsign_system_v1') !== null) return;
    kv_put('pay_unsign_system_v1', now(), 0);
    try {
        $n = (int)q("DELETE FROM pay_confirm WHERE by_kind='system'")->rowCount();
        if ($n) audit_log('', 'إزالة التواقيع التلقائية ليوقّع كل منسوب بنفسه', $n . ' توقيع أُزيل · النظام', 'النظام');
    } catch (Throwable $e) { error_log('[bonyan-hr] unsign system ' . $e->getMessage()); }
}

/* توقيع رواتب سنتَي ٢٠٢٤ و٢٠٢٥ باسم النظام مرة واحدة (من تاريخ مباشرة كل منسوب) — وتُترك ٢٠٢٦ ليوقّعها كلٌّ بنفسه */
function pay_sign_2425_once(): void {
    if (kv_get('pay_sign_2425_v1') !== null) return;
    kv_put('pay_sign_2425_v1', now(), 0);
    try {
        $n = 0; $people = 0;
        foreach (q('SELECT ref FROM staff ORDER BY ref')->fetchAll() as $row) {
            $ref = $row['ref']; $s = staff_get($ref); if (!$s) continue;
            if (fin_num($s['data']['salary'] ?? '') <= 0 && !q1('SELECT id FROM salary_hist WHERE ref=? LIMIT 1', [$ref])) continue;
            $have = array_flip(q('SELECT ym FROM pay_confirm WHERE ref=?', [$ref])->fetchAll(PDO::FETCH_COLUMN)); $added = 0;
            foreach ([2024, 2025] as $y) {
                $f = fin_salary($ref, $y);
                foreach ($f['months'] as $m) {
                    if ($m['st'] === 'none' || isset($have[$m['m']])) continue;
                    pay_sign_put($m['m'], $ref, $m['net'], $f['cur'], '', 'النظام (توقيع ٢٠٢٤ و٢٠٢٥)', 'system', null, 'توقيع تلقائي لسنتَي ٢٠٢٤ و٢٠٢٥');
                    $n++; $added++;
                }
            }
            if ($added) $people++;
        }
        if ($n) audit_log('', 'توقيع رواتب ٢٠٢٤ و٢٠٢٥ تلقائيًا', $people . ' منسوب · ' . $n . ' شهر · النظام', 'النظام');
    } catch (Throwable $e) { error_log('[bonyan-hr] sign2425 ' . $e->getMessage()); }
}
/* اعتماد كل رواتب السنوات الماضية تلقائيًا (من المباشرة حتى ديسمبر السنة الماضية) — وتبقى السنة الحالية ليوقّعها كلٌّ بنفسه */
function pay_sign_pastyears_once(): void {
    if (kv_get('pay_sign_past_v2') !== null) return; kv_put('pay_sign_past_v2', now(), 0);
    try {
        $through = ((int)date('Y') - 1) . '-12';
        $r = pay_sign_core($through, '', 'النظام (اعتماد السنوات الماضية)', 'system', 'اعتماد تلقائي لرواتب السنوات الماضية', [], 'all', [], '', false);
        if ($r['count']) audit_log('', 'اعتماد رواتب السنوات الماضية تلقائيًا', $r['people'] . ' منسوب · ' . $r['count'] . ' شهر · حتى ' . $through . ' · النظام', 'النظام');
    } catch (Throwable $e) { error_log('[bonyan-hr] sign past ' . $e->getMessage()); }
}

/* ======================================= طلب توقيع استلام الراتب من المنسوب + بريد أنيق + تذكير بعد ٢٤ ساعة */
/* بريد احترافي بشعار بنيان: صافي راتب الشهر، وإجمالي ما استلمه هذا العام، وزر يفتح «سجلي المالي» للتوقيع */
function pay_signreq_mail(string $ref, string $ym, bool $reminder): bool {
    $to = hrp_staff_mail($ref); if ($to === '') return false;
    $s = staff_get($ref); if (!$s) return false;
    $year = (int)substr($ym, 0, 4); $f = fin_salary($ref, $year); $i = (int)substr($ym, 5, 2) - 1;
    $m = $f['months'][$i] ?? null; if (!$m || $m['st'] === 'none') return false;
    $cur = $f['cur']; $ml = fin_mn($ym);
    $title = ($reminder ? 'تذكير · ' : '') . 'توقيع استلام راتب ' . $ml;
    $body = mx_rows([
        ['المنسوب', staff_name($s)],
        ['الجهة', (string)($s['data']['entity'] ?? '')],
        ['الشهر', $ml],
        ['صافي راتب الشهر', fin_money($m['net'], $cur), true],
        ['حالة التوقيع', 'بانتظار تأكيدك'],
    ], 'راتب ' . $ml)
        . mx_note('افتح «سجلي المالي ← الرواتب» وستجد زر «أؤكد استلام الراتب» أمام الشهر. ضغطة واحدة تُسجّل توقيعك إلكترونيًا بالتاريخ والوقت، وتصل الموارد البشرية مباشرة.', 'gold', 'كيف أوقّع؟')
        . ($reminder ? mx_note('هذا تذكير تلقائي؛ مضى أكثر من يوم على طلب التوقيع ولم يُسجَّل بعد.', 'amber', 'تذكير') : '');
    $html = mx_page(['eyebrow' => 'منصة الموارد البشرية · الرواتب', 'title' => $title, 'tone' => 'gold', 'icon' => '✍', 'badge' => $reminder ? 'تذكير' : 'بانتظار توقيعك',
        'lead' => 'يرجى تأكيد استلامك راتب شهر ' . $ml . '؛ التوقيع يتم من المنصة بضغطة واحدة.', 'pre' => 'تأكيد استلام راتب ' . $ml,
        'body' => $body, 'buttons' => [[mx_url('myhr'), 'تأكيد استلام الراتب', 'gold'], [mx_url('myhr'), 'فتح «سجلي المالي»', 'ghost']]]);
    try { send_mail($to, $title, $html, 'يرجى تأكيد استلامك راتب ' . $ml . ' من «سجلي المالي»: ' . mx_url('myhr'), 'Bonyan HR', logo_inline()); return true; }
    catch (Throwable $e) { error_log('[bonyan-hr] signreq mail ' . $e->getMessage()); return false; }
}
/* الإدارة ترسل طلب توقيع لمنسوب أو جهة أو الكل */
function pay_signreq_send(array $b): array {
    $u = require_perm('finance.view'); $ym = fin_ym($b['month'] ?? '');
    if ($ym > date('Y-m')) throw new HttpError('لا يمكن طلب توقيع شهر لم يأتِ بعد');
    $scope = (string)($b['scope'] ?? ''); $rows = pay_conf_rows($u, $ym);
    if ($scope === 'entity') { $e = (string)($b['entity'] ?? ''); $rows = array_values(array_filter($rows, fn($r) => $r['entity'] === $e)); }
    elseif ($scope === 'refs') { $refs = array_map('strval', (array)($b['refs'] ?? [])); $rows = array_values(array_filter($rows, fn($r) => in_array($r['ref'], $refs, true))); }
    elseif ($scope !== 'all') throw new HttpError('حدّد لمن تُرسل طلب التوقيع');
    $n = 0; $noMail = 0; $signed = 0; $remindAt = date('Y-m-d H:i:s', strtotime('+1 day')); $send = [];
    foreach ($rows as $r) {
        if ($r['conf']) { $signed++; continue; }
        if (empty($r['mail'])) { $noMail++; continue; }
        $ex = q1("SELECT id FROM pay_signreq WHERE ym=? AND ref=?", [$ym, $r['ref']]);
        if ($ex) q("UPDATE pay_signreq SET status='pending', sent_at=?, sent_by=?, reminded=0, remind_at=?, done_at=NULL WHERE id=?", [now(), hrp_label($u), $remindAt, $ex['id']]);
        else q("INSERT INTO pay_signreq (ym, ref, status, sent_at, sent_by, reminded, remind_at) VALUES (?,?, 'pending', ?,?,0,?)", [$ym, $r['ref'], now(), hrp_label($u), $remindAt]);
        $to = hrp_staff_mail($r['ref']); if ($to) note_add($to, 'طلب توقيع استلام راتب ' . fin_mn($ym), 'يرجى تأكيد استلامك راتب ' . fin_mn($ym) . ' من «سجلي المالي ← الرواتب».', '', 'warn');
        $send[] = $r['ref']; $n++;
    }
    if ($n) { $refsCopy = $send; defer_after(function () use ($refsCopy, $ym) { foreach ($refsCopy as $rf) pay_signreq_mail($rf, $ym, false); });
        audit_log($scope === 'refs' && $n === 1 ? $send[0] : '', 'إرسال طلب توقيع استلام الراتب', fin_mn($ym) . ' · ' . $n . ' منسوب' . ($scope === 'entity' ? ' · ' . ($b['entity'] ?? '') : ($scope === 'all' ? ' · الكل' : '')), hrp_label($u)); }
    return ['ok' => true, 'count' => $n, 'noMail' => $noMail, 'signed' => $signed, 'rows' => pay_conf_rows($u, $ym)];
}
/* المنسوب يؤكد استلام راتب شهر بنفسه (توقيع إلكتروني)، أو يتراجع عن توقيعٍ سجّله هو */
function pay_self_sign(array $b): array {
    $u = hrp_me(); $ref = (string)my_staff_ref($u);
    if ($ref === '' || !site_on('staff', 'myhr')) throw new HttpError('غير متاح', 403);
    $ym = fin_ym($b['month'] ?? ''); if ($ym > date('Y-m')) throw new HttpError('لا يمكن تأكيد استلام راتب شهر لم يأتِ بعد');
    $year = (int)substr($ym, 0, 4); $f = fin_salary($ref, $year); $i = (int)substr($ym, 5, 2) - 1;
    $m = $f['months'][$i] ?? null; if (!$m || $m['st'] === 'none') throw new HttpError('لا يوجد راتب لهذا الشهر');
    $nm = staff_name(staff_get($ref));
    if (!empty($b['undo'])) {
        /* التوقيع نهائي: لا يستطيع المنسوب التراجع بعد تسجيله؛ التعديل حصريًّا للموارد البشرية وحساب النظام */
        throw new HttpError('التوقيع نهائي ولا يمكن التراجع عنه بعد تسجيله؛ لأي تصحيح يرجى التواصل مع الموارد البشرية');
    }
    if (!$m['conf']) {
        $src = (string)($b['src'] ?? ''); $via = $src === 'paymail' ? 'عبر زر بريد اعتماد الرواتب' : 'من المنصة مباشرة';
        pay_sign_put($ym, $ref, $m['net'], $f['cur'], (string)$u['email'], $nm, 'self', null, 'وقّع المنسوب الاستلام بنفسه · ' . $via);
        audit_log($ref, 'توقيع المنسوب استلام راتبه', fin_mn($ym) . ' · ' . fin_money($m['net'], $f['cur']) . ' · ' . $via, $nm);
    }
    return ['ok' => true, 'year' => $year, 'pay' => fin_salary($ref, $year)];
}
/* تذكير تلقائي بعد ٢٤ ساعة لمن لم يوقّع (يعمل من المهمة اليومية أو مع زيارات المنصة، بحدّ مرة كل ٥ دقائق) */
function pay_signreq_tick(): void {
    if (kv_get('psr_tick') !== null) return; kv_put('psr_tick', now(), 300);
    $due = q("SELECT ym, ref FROM pay_signreq WHERE status='pending' AND reminded=0 AND remind_at IS NOT NULL AND remind_at <= ? ORDER BY remind_at LIMIT 40", [now()])->fetchAll();
    foreach ($due as $d) {
        if (q1('SELECT id FROM pay_confirm WHERE ym=? AND ref=?', [$d['ym'], $d['ref']])) { q("UPDATE pay_signreq SET status='done', done_at=? WHERE ym=? AND ref=?", [now(), $d['ym'], $d['ref']]); continue; }
        q("UPDATE pay_signreq SET reminded=1 WHERE ym=? AND ref=?", [$d['ym'], $d['ref']]);
        try { pay_signreq_mail($d['ref'], $d['ym'], true); $to = hrp_staff_mail($d['ref']); if ($to) note_add($to, 'تذكير: توقيع استلام راتب ' . fin_mn($d['ym']), 'ما زال بانتظار تأكيد استلامك راتب ' . fin_mn($d['ym']) . '.', '', 'warn'); }
        catch (Throwable $e) { error_log('[bonyan-hr] signreq remind ' . $e->getMessage()); }
    }
}
/* إيقاف طارئ مرة واحدة: يُلغي كل طلبات التوقيع المعلّقة (دفعة أُرسلت بالخطأ) فلا تصل تذكيراتها */
function pay_signreq_cancel_once(): void {
    if (kv_get('psr_cancel_once_v1') !== null) return; kv_put('psr_cancel_once_v1', now(), 0);
    try { $n = q("UPDATE pay_signreq SET status='cancel', done_at=? WHERE status='pending'", [now()])->rowCount();
        if ($n) audit_log('', 'إيقاف طلبات توقيع الاستلام (دفعة طارئة)', 'أُلغي ' . $n . ' طلب توقيع معلّق — لن تصل تذكيراته', 'النظام'); }
    catch (Throwable $e) { error_log('[bonyan-hr] psr cancel once ' . $e->getMessage()); }
}
/* إيقاف طلبات التوقيع يدويًا من الزر: الكل أو شهر محدّد (يمنع التذكيرات اللاحقة) */
function pay_signreq_stop(array $b): array {
    $u = require_perm('finance.view');
    $ym = !empty($b['month']) && $b['month'] !== 'all' ? fin_ym($b['month']) : '';
    if ($ym) $n = q("UPDATE pay_signreq SET status='cancel', done_at=? WHERE status='pending' AND ym=?", [now(), $ym])->rowCount();
    else $n = q("UPDATE pay_signreq SET status='cancel', done_at=? WHERE status='pending'", [now()])->rowCount();
    if ($n) audit_log('', 'إيقاف طلبات توقيع الاستلام', $n . ' طلب' . ($ym ? ' · ' . fin_mn($ym) : ' · كل الأشهر'), hrp_label($u));
    return ['ok' => true, 'count' => $n, 'rows' => pay_conf_rows($u, fin_ym($b['cur'] ?? ''))];
}
/* سجل الراتب: «من شهر كذا الراتب كذا» — يصحح الرواتب السابقة ويحدد القادمة */
function sal_hist_get(array $b): array {
    $u = require_perm('finance.view'); $ref = (string)($b['ref'] ?? ''); $s = staff_get($ref);
    if (!$s || in_array($ref, private_hidden_for($u), true)) throw new HttpError('not_found', 404);
    return ['ok' => true, 'ref' => $ref, 'name' => staff_name($s), 'salary' => fin_num($s['data']['salary'] ?? ''), 'cur' => pay_cur($s['data']), 'start' => (string)($s['data']['startDate'] ?? ''), 'rows' => fin_hist($ref), 'raises' => fin_raises($ref)];
}
function sal_hist_save(array $b): array {
    $u = require_perm('finance.view'); if (!has_perm($u, 'staff.edit')) throw new HttpError('forbidden', 403);
    $ref = (string)($b['ref'] ?? ''); $s = staff_get($ref); if (!$s || in_array($ref, private_hidden_for($u), true)) throw new HttpError('not_found', 404);
    $rows = [];
    foreach ((array)($b['rows'] ?? []) as $r) {
        $f = (string)($r['from'] ?? ''); $a = round(fin_num($r['amount'] ?? 0), 2);
        if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $f)) throw new HttpError('اختر الشهر لكل سطر');
        if ($a <= 0) throw new HttpError('اكتب الراتب لكل سطر');
        $rows[$f] = $a;
    }
    ksort($rows);
    q('DELETE FROM salary_hist WHERE ref=?', [$ref]);
    foreach ($rows as $f => $a) q('INSERT INTO salary_hist (ref, from_ym, amount, by_name, at) VALUES (?,?,?,?,?)', [$ref, $f, $a, hrp_label($u), now()]);
    /* الراتب الحالي في الملف = آخر سطر بدأ هذا الشهر أو قبله */
    $curAmt = null; foreach ($rows as $f => $a) if ($f <= date('Y-m')) $curAmt = $a;
    if ($curAmt !== null && fin_num($s['data']['salary'] ?? '') != $curAmt) { $s['data']['salary'] = (string)(floor($curAmt) == $curAmt ? (int)$curAmt : $curAmt); $s['updated_at'] = now(); staff_put($s); }
    audit_log($ref, 'تعديل سجل الراتب', count($rows) . ' سطر (القيم لا تُكتب في السجل)', hrp_label($u));
    return ['ok' => true] + sal_hist_get(['ref' => $ref]);
}
function ev_gone(): array { throw new HttpError('أُلغي قسم تقييم الأداء من المنصة', 410); }

/* تسجيل المنسوب عهدة استلمها بنفسه (إن فتحها مدير النظام من الإعدادات) — تُعدّ مُقرًّا بها، وتراها الموارد البشرية وتعدّلها */
function cus_self_save(array $b): array {
    $u = hrp_me(); $ref = (string)my_staff_ref($u);
    if ($ref === '' || !site_on('staff', 'cusself') || !site_on('staff', 'myhr')) throw new HttpError('تسجيل العهد من المنسوب غير مفعّل', 403);
    $item = hrp_str($b['item'] ?? '', 160); if (mb_strlen($item) < 2) throw new HttpError('اكتب وصف العهدة');
    $cat = cus_cat_clean($b);
    $on = hrp_date($b['issuedOn'] ?? ''); if (!$on) throw new HttpError('اختر متى استلمتها'); if ($on > date('Y-m-d')) throw new HttpError('تاريخ الاستلام بعد اليوم');
    $val = trim(to_ascii_digits((string)($b['value'] ?? ''))); $val = $val === '' ? null : round((float)$val, 2);
    $cond = in_array($b['condOut'] ?? '', ['جديدة', 'مستعملة بحالة جيدة', 'تحتاج صيانة'], true) ? $b['condOut'] : 'جديدة';
    q('INSERT INTO custody (ref, item, category, serial, value, issued_on, cond_out, note, created_by, created_at, ack_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [$ref, $item, $cat, hrp_str($b['serial'] ?? '', 80), $val, $on, $cond, hrp_str($b['note'] ?? '', 600), 'سجّلها المنسوب بنفسه', now(), now()]);
    $id = (int)db()->lastInsertId();
    audit_log($ref, 'تسجيل المنسوب عهدة استلمها', $item . ' · ' . $cat . ' · ' . $on, hrp_label($u));
    return ['ok' => true, 'row' => cus_row(q1('SELECT * FROM custody WHERE id=?', [$id]))];
}
/* === بريد مراجعة الرواتب (تصميم معتمد) — مُولّد من المعاينة === */
function pay_review_mail_html(string $name = ''): string {
    $nm = $name !== '' ? esc_html($name) : '';
    $hi = $nm !== '' ? 'حيّاكم الله، <b style="color:#14284B;">' . $nm . '</b>،<br>' : 'حيّاكم الله،<br>';
    $yr = date('Y'); $sig = mail_signature(true);
    return <<<HTML
<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>اعتماد استلام رواتب {$yr}</title>
</head><body style="margin:0;padding:0;background:#E8EAF0;-webkit-text-size-adjust:100%;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">اعتمدوا استلامكم لكل ما صُرف إليكم من رواتب خلال العام بتوقيع موثّق</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#E8EAF0"><tr><td align="center" style="padding:30px 12px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="max-width:600px;background:#FFFFFF;border-radius:28px;overflow:hidden;box-shadow:0 22px 50px rgba(16,28,56,.16);border:1px solid #E3E6EE;">

<!-- Header -->
<tr><td style="background-color:#14284B;background-image:radial-gradient(130% 150% at 100% 0%,rgba(201,162,74,.26) 0%,rgba(201,162,74,0) 48%),linear-gradient(135deg,#24406F 0%,#14284B 54%,#0B1A33 100%);padding:24px 30px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td valign="middle" style="text-align:right;"><div style="font-size:18px;font-weight:900;color:#fff;letter-spacing:-.2px;">مجموعة بنيان العالمية</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr><td style="background:rgba(201,162,74,.16);border:1px solid rgba(201,162,74,.5);border-radius:999px;padding:4px 13px;font-size:11.5px;font-weight:800;color:#E7CE97;letter-spacing:.3px;">الشؤون المالية · الرواتب</td></tr></table></td>
  <td align="left" width="66" valign="middle"><img src="cid:logo" width="60" alt="بنيان" style="display:block;width:60px;height:auto;border:0;"></td>
  </tr></table></td></tr>
<tr><td style="height:3px;font-size:0;line-height:3px;background:linear-gradient(90deg,#9C7A33,#C9A24A,#E7CE97,#C9A24A,#9C7A33);">&nbsp;</td></tr>

<!-- Hero -->
<tr><td align="center" style="padding:36px 32px 8px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" style="width:84px;height:84px;line-height:84px;border-radius:44px;background:#FBF7EE;border:2px solid #C9A24A;box-shadow:0 0 0 6px rgba(201,162,74,.12);font-size:34px;color:#14284B;font-family:'Segoe UI Symbol',Arial,sans-serif;">✍</td></tr></table>
  <h1 style="margin:20px 0 0;font-size:25px;line-height:1.5;color:#14284B;font-weight:900;letter-spacing:-.3px;">اعتماد استلام رواتب {$yr}</h1>
  <p style="margin:12px auto 0;max-width:470px;font-size:15px;line-height:2.05;color:#3B485D;">{$hi}نرجو اعتماد استلامكم لما صُرِف إليكم من رواتب خلال عام <b style="color:#14284B;">{$yr}</b> بتوقيعٍ إلكترونيّ موثّق بالتاريخ والوقت، حِرصًا على دقّة سجلّكم المالي.</p>
</td></tr>

<!-- Steps -->
<tr><td style="padding:26px 34px 2px;">
  <div style="font-size:12.5px;font-weight:900;color:#9C7A33;margin:0 2px 14px;text-align:right;"><span style="display:inline-block;width:6px;height:6px;border-radius:3px;background:#9C7A33;vertical-align:middle;margin-left:7px;"></span>خطوات الاعتماد</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="40" valign="top" style="padding:0 0 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="width:30px;height:30px;line-height:30px;border-radius:16px;background:#FBF7EE;border:1.5px solid #C9A24A;color:#14284B;font-family:Tajawal,Tahoma,sans-serif;font-size:13px;font-weight:900;">١</td></tr></table>
    </td><td valign="middle" style="padding:0 12px 0 6px;"><div style="font-family:Tajawal,Tahoma,sans-serif;font-size:14.5px;line-height:1.8;color:#243149;font-weight:700;">رواتب أعوامك الماضية مُعتمدة تلقائيًا، ولم يبقَ إلا اعتماد ما استلمته خلال عام {$yr}.</div></td></tr>
    <tr><td style="padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" width="40"><div style="width:2px;height:12px;background:#E7E3D6;margin:3px auto;"></div></td></tr></table></td><td></td></tr><tr><td width="40" valign="top"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="width:30px;height:30px;line-height:30px;border-radius:16px;background:#FBF7EE;border:1.5px solid #C9A24A;color:#14284B;font-family:Tajawal,Tahoma,sans-serif;font-size:13px;font-weight:900;">٢</td></tr></table></td><td valign="middle" style="padding:0 12px 0 6px;"><div style="font-family:Tajawal,Tahoma,sans-serif;font-size:14.5px;line-height:1.8;color:#243149;font-weight:700;">اضغط «أؤكّد الاستلام» أمام كل شهر استلمته.</div></td></tr></table>
</td></tr>

<!-- CTA -->
<tr><td style="padding:26px 34px 6px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#14284B" style="border-radius:18px;background-color:#14284B;background-image:linear-gradient(135deg,#24406F 0%,#14284B 55%,#0B1A33 100%);box-shadow:0 14px 30px -12px rgba(11,26,51,.65);">
  <a href="https://hr.bonyanglobal.com/?src=paymail#mypay" target="_blank" style="display:block;padding:17px 20px;font-family:Tajawal,Tahoma,sans-serif;font-size:16px;font-weight:900;color:#F3E6C6;text-decoration:none;border-radius:18px;border:1px solid rgba(201,162,74,.45);"><span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:50%;background:#E7CE97;color:#14284B;font-size:13px;font-weight:900;vertical-align:middle;margin-left:9px;">&#10003;</span>اعتمِد استلام رواتبي &nbsp;<span style="color:#E7CE97;">←</span></a>
  </td></tr></table>
  <p style="margin:13px 0 0;text-align:center;font-size:12px;color:#6B7689;line-height:1.8;">يفتح الزرّ صفحة رواتبك مباشرةً · التوقيع نهائيّ بعد تسجيله.</p>
</td></tr>

<tr><td style="height:18px;font-size:0;">&nbsp;</td></tr>
<!-- Footer: التوقيع القياسي -->
<tr><td style="background:#F7F6F2;border-top:1px solid #E7E3D6;padding:8px 18px 16px;">{$sig}</td></tr>

</table></td></tr></table></body></html>
HTML;
}


/* إرسال بريد المراجعة لمنسوب واحد */
function pay_review_mail(string $ref): bool {
    $to = hrp_staff_mail($ref); if ($to === '') return false;
    $s = staff_get($ref); $name = $s ? staff_name($s) : ''; $yr = date('Y');
    $html = pay_review_mail_html($name);
    $text = "السلام عليكم،\nنرجو اعتماد استلامكم لما صُرف إليكم من رواتب خلال عام " . $yr . " في «سجلي المالي ← الرواتب»:\nhttps://hr.bonyanglobal.com/?src=paymail#mypay";
    try { send_mail($to, 'اعتماد استلام رواتب ' . $yr, $html, $text, 'Bonyan HR', logo_inline()); return true; }
    catch (Throwable $e) { error_log('[bonyan-hr] review mail ' . $e->getMessage()); return false; }
}
/* هل لدى المنسوب شهرٌ مستحقٌّ لم يُوقّع استلامه بعد (هذا العام والذي قبله حتى الشهر الحالي)؟ */
function pay_has_unsigned(string $ref): bool {
    $cy = (int)date('Y'); $nowYm = date('Y-m');
    foreach ([$cy, $cy - 1] as $y) {
        $f = fin_salary($ref, $y); if (empty($f['months'])) continue;
        foreach ($f['months'] as $idx => $m) {
            if (!$m || ($m['st'] ?? 'none') === 'none') continue;
            $ym = sprintf('%04d-%02d', $y, $idx + 1); if ($ym > $nowYm) continue;
            if (empty($m['conf'])) return true;
        }
    }
    return false;
}
/* إرسال بريد مراجعة الرواتب لكل من لم يوقّع مرّة واحدة (يعمل بعد إرسال الرد، فلا يُبطئ المستخدم) */
function pay_review_broadcast_once(): void {
    if (kv_get('pay_review_bcast_v1') !== null) return; kv_put('pay_review_bcast_v1', now(), 0);
    $sent = 0;
    foreach (q('SELECT ref FROM staff ORDER BY ref')->fetchAll() as $r) {
        $rf = $r['ref']; if (hrp_staff_mail($rf) === '') continue;
        try { if (!pay_has_unsigned($rf)) continue; if (pay_review_mail($rf)) $sent++; } catch (Throwable $e) { error_log('[bonyan-hr] review bcast ' . $e->getMessage()); }
    }
    try { audit_log('', 'إرسال بريد مراجعة الرواتب لمن لم يوقّع', $sent . ' منسوب', 'م. أسامة جنيدي'); } catch (Throwable $e) {}
}
/* إرسال بريد اعتماد رواتب السنة لكل المنسوبين مرّة واحدة (مرّة ثانية بصيغة الاعتماد الجديدة) */
function pay_yearreview_sendall_once(): void {
    if (kv_get('pay_yr_all_v1') !== null) return; kv_put('pay_yr_all_v1', now(), 0);
    $sent = 0;
    foreach (q('SELECT ref FROM staff ORDER BY ref')->fetchAll() as $r) {
        $rf = $r['ref']; if (hrp_staff_mail($rf) === '') continue;
        try { if (pay_review_mail($rf)) $sent++; } catch (Throwable $e) { error_log('[bonyan-hr] yr all ' . $e->getMessage()); }
    }
    try { audit_log('', 'إرسال بريد اعتماد رواتب السنة للجميع', $sent . ' منسوب', 'م. أسامة جنيدي'); } catch (Throwable $e) {}
}
/* زر الإدارة: إرسال بريد المراجعة (الكل/جهة/محدّدين) */
function pay_review_send(array $b): array {
    $u = require_perm('finance.view');
    $scope = (string)($b['scope'] ?? 'all'); $refs = [];
    foreach (q('SELECT ref FROM staff ORDER BY ref')->fetchAll() as $r) {
        $rf = $r['ref']; if (hrp_staff_mail($rf) === '') continue;
        if ($scope === 'entity') { $s = staff_get($rf); if (!$s || (string)($s['data']['entity'] ?? '') !== (string)($b['entity'] ?? '')) continue; }
        elseif ($scope === 'refs') { if (!in_array($rf, array_map('strval', (array)($b['refs'] ?? [])), true)) continue; }
        $refs[] = $rf;
    }
    $refsCopy = $refs; defer_after(function () use ($refsCopy) { foreach ($refsCopy as $rf) { try { pay_review_mail($rf); } catch (Throwable $e) {} } });
    audit_log('', 'إرسال بريد مراجعة الرواتب', count($refs) . ' منسوب' . ($scope === 'all' ? ' · الكل' : ($scope === 'entity' ? ' · ' . ($b['entity'] ?? '') : '')), hrp_label($u));
    return ['ok' => true, 'count' => count($refs)];
}
