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
            'conf' => $cf ? ['at' => substr($cf['at'], 0, 16), 'by' => $cf['by_name'], 'amount' => (float)$cf['amount']] : null];
    }
    $yrs = []; $y0 = $start !== '' ? (int)substr($start, 0, 4) : (int)date('Y'); for ($y = max($y0, (int)date('Y') - 5); $y <= (int)date('Y'); $y++) $yrs[] = $y;
    return ['cur' => $cur, 'salary' => $now, 'start' => (string)($sd['startDate'] ?? ''), 'raises' => $raises, 'months' => $months, 'years' => array_reverse($yrs),
        'rule' => 'أجر الساعة = الراتب ÷ 30 ÷ 8، والساعة الإضافية = أجر الساعة × 1.5، واليوم = الراتب ÷ 30'];
}

/* ============================================================ المصروفات */
const EXP_CATS = ['ticket' => 'التذاكر والسفر', 'med' => 'العلاج', 'dues' => 'المستحقات والبدلات', 'loan' => 'السلف', 'train' => 'التدريب والتطوير',
    'house' => 'السكن', 'gov' => 'رسوم حكومية وتأشيرات', 'tools' => 'أجهزة واشتراكات عمل', 'reward' => 'مكافآت وحوافز', 'other' => 'أخرى'];
function exp_row(array $e): array {
    $s = staff_get($e['ref']);
    return ['id' => 'M' . $e['id'], 'src' => 'hr', 'ref' => $e['ref'], 'name' => $s ? staff_name($s) : $e['ref'], 'day' => $e['day'], 'cat' => $e['cat'], 'dir' => $e['dir'],
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
    return ['ok' => true, 'year' => $year, 'pay' => $pay, 'exp' => exp_rows($ref, $year), 'cats' => EXP_CATS];
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
function pay_conf_rows(array $u, string $ym): array {
    $hide = private_hidden_for($u); $year = (int)substr($ym, 0, 4); $i = (int)substr($ym, 5, 2) - 1; $rows = [];
    foreach (q('SELECT ref FROM staff ORDER BY ref')->fetchAll() as $r) {
        if (in_array($r['ref'], $hide, true)) continue;
        $s = staff_get($r['ref']); if (!$s) continue;
        if (fin_num($s['data']['salary'] ?? '') <= 0 && !q1('SELECT id FROM salary_hist WHERE ref=? LIMIT 1', [$r['ref']])) continue;
        $f = fin_salary($r['ref'], $year); $m = $f['months'][$i] ?? null; if (!$m || $m['st'] === 'none') continue;
        $rows[] = ['ref' => $r['ref'], 'name' => staff_name($s), 'job' => (string)($s['data']['job'] ?? ''), 'entity' => (string)($s['data']['entity'] ?? ''), 'start' => (string)($s['data']['startDate'] ?? ''), 'cur' => $f['cur'], 'base' => $m['base'], 'add' => $m['add'], 'ded' => $m['ded'], 'net' => $m['net'], 'conf' => $m['conf'], 'hist' => count(fin_hist($r['ref']))];
    }
    usort($rows, fn($a, $b) => strcmp($a['entity'], $b['entity']) ?: strcmp($a['name'], $b['name']));
    return $rows;
}
function fin_ym($v): string { return preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', (string)$v) ? (string)$v : date('Y-m'); }
function pay_conf_list(array $b): array {
    $u = require_perm('finance.view'); $ym = fin_ym($b['month'] ?? '');
    $months = []; for ($k = 0; $k < 14; $k++) $months[] = date('Y-m', strtotime(date('Y-m-01') . " -$k month"));
    return ['ok' => true, 'month' => $ym, 'months' => $months, 'rows' => pay_conf_rows($u, $ym)];
}
function pay_confirm(array $b): array {
    $u = require_perm('finance.view'); $ym = fin_ym($b['month'] ?? '');
    if ($ym > date('Y-m')) throw new HttpError('لا يمكن تأكيد صرف شهر لم يأتِ بعد');
    $scope = (string)($b['scope'] ?? ''); $undo = !empty($b['undo']);
    $rows = pay_conf_rows($u, $ym);
    if ($scope === 'entity') { $e = (string)($b['entity'] ?? ''); $rows = array_values(array_filter($rows, fn($r) => $r['entity'] === $e)); }
    elseif ($scope === 'refs') { $refs = array_map('strval', (array)($b['refs'] ?? [])); $rows = array_values(array_filter($rows, fn($r) => in_array($r['ref'], $refs, true))); }
    elseif ($scope !== 'all') throw new HttpError('حدّد من تؤكد صرف رواتبهم');
    $mn = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][(int)substr($ym, 5, 2) - 1] . ' ' . substr($ym, 0, 4);
    $n = 0; $note = hrp_str($b['note'] ?? '', 300);
    foreach ($rows as $r) {
        if ($undo) { if (!$r['conf']) continue; q('DELETE FROM pay_confirm WHERE ym=? AND ref=?', [$ym, $r['ref']]); $n++; continue; }
        if ($r['conf']) continue;
        q('INSERT INTO pay_confirm (ym, ref, amount, cur, by_email, by_name, at, note) VALUES (?,?,?,?,?,?,?,?)', [$ym, $r['ref'], $r['net'], $r['cur'], (string)$u['email'], hrp_label($u), now(), $note]); $n++;
        $to = hrp_staff_mail($r['ref']); if ($to) note_add($to, 'صُرف راتب ' . $mn, 'أكّدت الإدارة صرف راتبك لشهر ' . $mn . '. التفاصيل في «سجلي المالي».', '', 'ok');
    }
    if ($n) audit_log($scope === 'refs' && count($rows) === 1 ? $rows[0]['ref'] : '', $undo ? 'التراجع عن تأكيد صرف رواتب' : 'تأكيد صرف رواتب', $mn . ' · ' . $n . ' منسوب' . ($scope === 'entity' ? ' · ' . ($b['entity'] ?? '') : ($scope === 'all' ? ' · الكل' : '')), hrp_label($u));
    return ['ok' => true, 'count' => $n, 'rows' => pay_conf_rows($u, $ym)];
}
/* توقيع استلام الرواتب بأثر رجعي: من بداية دوام كل منسوب حتى شهر الحدّ (افتراضيًا قبل 3 أشهر، فتبقى آخر 3 أشهر بانتظار التوقيع) */
function pay_sign_retro(array $b): array {
    $u = require_perm('finance.view'); $hide = private_hidden_for($u);
    $through = fin_ym($b['through'] ?? date('Y-m', strtotime(date('Y-m-01') . ' -3 month')));
    if ($through > date('Y-m')) $through = date('Y-m');
    $scope = (string)($b['scope'] ?? 'all'); $refs = array_map('strval', (array)($b['refs'] ?? [])); $ent = (string)($b['entity'] ?? '');
    $n = 0; $people = 0;
    $MN = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    foreach (q('SELECT ref FROM staff ORDER BY ref')->fetchAll() as $row) {
        $ref = $row['ref']; if (in_array($ref, $hide, true)) continue;
        if ($scope === 'refs' && !in_array($ref, $refs, true)) continue;
        $s = staff_get($ref); if (!$s) continue;
        if ($scope === 'entity' && (string)($s['data']['entity'] ?? '') !== $ent) continue;
        if (fin_num($s['data']['salary'] ?? '') <= 0 && !q1('SELECT id FROM salary_hist WHERE ref=? LIMIT 1', [$ref])) continue;
        $start = substr((string)($s['data']['startDate'] ?? ''), 0, 7); if ($start === '' || $start > $through) $start = $through;
        $y0 = (int)substr($start, 0, 4); $y1 = (int)substr($through, 0, 4); $done = q('SELECT ym FROM pay_confirm WHERE ref=?', [$ref])->fetchAll(PDO::FETCH_COLUMN);
        $have = array_flip($done); $first = null; $last = null; $cur = 'SAR'; $added = 0;
        for ($y = $y0; $y <= $y1; $y++) {
            $f = fin_salary($ref, $y); $cur = $f['cur'];
            foreach ($f['months'] as $m) {
                if ($m['st'] === 'none' || $m['m'] < $start || $m['m'] > $through || isset($have[$m['m']])) continue;
                q('INSERT INTO pay_confirm (ym, ref, amount, cur, by_email, by_name, at, note) VALUES (?,?,?,?,?,?,?,?)', [$m['m'], $ref, $m['net'], $f['cur'], (string)$u['email'], hrp_label($u), now(), 'توقيع بأثر رجعي']);
                $n++; $added++; if ($first === null) $first = $m['m']; $last = $m['m'];
            }
        }
        if ($added) { $people++; $to = hrp_staff_mail($ref);
            if ($to && $first) note_add($to, 'توقيع استلام رواتبك', 'سُجّل استلامك رواتب ' . $MN[(int)substr($first, 5, 2) - 1] . ' ' . substr($first, 0, 4) . ' حتى ' . $MN[(int)substr($last, 5, 2) - 1] . ' ' . substr($last, 0, 4) . '. تجدها في «سجلي المالي».', '', 'ok'); }
    }
    if ($n) audit_log($scope === 'refs' && count($refs) === 1 ? $refs[0] : '', 'توقيع استلام رواتب بأثر رجعي', 'حتى ' . $through . ' · ' . $people . ' منسوب · ' . $n . ' شهر' . ($scope === 'entity' ? ' · ' . $ent : ($scope === 'all' ? ' · الكل' : '')), hrp_label($u));
    return ['ok' => true, 'count' => $n, 'people' => $people, 'through' => $through, 'rows' => pay_conf_rows($u, fin_ym($b['month'] ?? ''))];
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
