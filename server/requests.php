<?php
/**
 * طلبات المنسوبين: إجازة · أمر إركاب · تعريف بالراتب
 * - لكل طلب رقم ثابت (LV-2026-0001) ومسار اعتماد، ويُسجَّل كل قرار باسم صاحبه ووقته
 * - المنسوب يقدّم من صفحته، والموارد البشرية تستطيع التقديم نيابة عنه
 * - الإجازة بآلية النظام السابق: المسؤول المباشر (يختاره المنسوب) يعتمد أو يعدّل أو يرفض، ثم المدير العام،
 *   ورسائل البريد السبع بقالبها، وأزرار البريد تفتح صفحة القرار ولا تنفّذ شيئًا بمجرد فتح الرابط
 * - المتابعة متاحة بلا دخول برقم الطلب والبريد المسجّل (دون تفاصيل حساسة)
 */
declare(strict_types=1);

const REQ_TYPES = [
    'leave'  => ['LV', 'طلب إجازة', 'BNY-F-HR-05'],
    'travel' => ['TR', 'أمر إركاب / مهمة رسمية', 'BNY-F-HR-08'],
    'cert'   => ['CR', 'تعريف بالراتب أو شهادة خبرة', 'BNY-F-HR-16'],
    'perm'   => ['PM', 'طلب استئذان', 'BNY-F-HR-06'],
    'ot'     => ['OT', 'طلب عمل إضافي', 'BNY-F-HR-07'],
    'loan'   => ['LN', 'طلب سلفة على الراتب', 'BNY-F-HR-09'],
    'resume' => ['RS', 'إشعار مباشرة عمل', 'BNY-F-HR-10'],
    'train'  => ['TN', 'طلب تدريب', 'BNY-F-HR-11'],
    'resign' => ['RG', 'طلب استقالة', 'BNY-F-HR-12'],
    'clear'  => ['CL', 'إخلاء طرف', 'BNY-F-HR-13'],
    'hire'   => ['HN', 'طلب احتياج وظيفي', 'BNY-F-HR-14'],
];
/* الأنواع المبنية بمخطط حقول: [المفتاح، الاسم، النوع، إلزامي، خيارات أو حدود، تلميح]
   الأنواع: text · area · date · time · month · int · money · seg · reqref (طلب إجازة/إركاب معتمد للمنسوب نفسه) */
const REQ_SCHEMA = [
    'perm' => [['kind', 'نوع الاستئذان', 'seg', 1, ['تأخر صباحي', 'خروج مبكر', 'خروج أثناء الدوام']], ['day', 'التاريخ', 'date', 1], ['fromT', 'من الساعة', 'time', 1], ['toT', 'إلى الساعة', 'time', 1],
        ['reason', 'السبب', 'area', 1, [3, 800], 'مثال: مراجعة مستشفى']],
    'ot' => [['day', 'التاريخ', 'date', 1], ['fromT', 'من الساعة', 'time', 1], ['toT', 'إلى الساعة', 'time', 1], ['tasks', 'المهام المنجزة أو المطلوبة', 'area', 1, [3, 1200], 'ما الذي أُنجز في هذا الوقت؟']],
    'loan' => [['amount', 'مبلغ السلفة', 'money', 1, [100, 200000]], ['months', 'عدد الأقساط الشهرية', 'int', 1, [1, 24]], ['start', 'شهر بداية الخصم', 'month', 1], ['reason', 'سبب السلفة', 'area', 1, [3, 800]]],
    'resume' => [['kind', 'نوع المباشرة', 'seg', 1, ['عودة من إجازة', 'عودة من مهمة رسمية', 'تعيين جديد']], ['link', 'الطلب المرتبط', 'reqref', 0, ['leave', 'travel']], ['day', 'تاريخ المباشرة الفعلي', 'date', 1], ['note', 'ملاحظات', 'area', 0, [0, 800]]],
    'train' => [['program', 'اسم البرنامج التدريبي', 'text', 1, [3, 160]], ['provider', 'الجهة المنفذة', 'text', 1, [2, 160]], ['mode', 'طريقة التنفيذ', 'seg', 1, ['حضوري', 'عن بعد', 'مدمج']], ['from', 'تاريخ البداية', 'date', 1], ['to', 'تاريخ النهاية', 'date', 1],
        ['cost', 'التكلفة التقديرية (ر.س)', 'money', 0, [0, 1000000]], ['benefit', 'العائد المتوقع على العمل', 'area', 1, [3, 1200]]],
    'resign' => [['lastDay', 'آخر يوم عمل مقترح', 'date', 1], ['reason', 'أسباب الاستقالة', 'area', 1, [3, 1500]], ['note', 'ملاحظات للتسليم', 'area', 0, [0, 800], 'المهام التي ستسلّمها ولمن']],
    'clear' => [['why', 'سبب إخلاء الطرف', 'seg', 1, ['استقالة', 'انتهاء العقد', 'إنهاء خدمة', 'نقل إلى جهة أخرى']], ['link', 'طلب الاستقالة المرتبط', 'reqref', 0, ['resign']], ['lastDay', 'آخر يوم عمل', 'date', 1],
        ['dues', 'المستحقات والالتزامات', 'area', 0, [0, 1200], 'مثال: رصيد إجازات، سلفة متبقية، مكافأة نهاية الخدمة'], ['note', 'ملاحظات', 'area', 0, [0, 800]]],
    'hire' => [['title', 'المسمى الوظيفي المطلوب', 'text', 1, [2, 120]], ['entity', 'الجهة', 'text', 1, [2, 120]], ['department', 'الإدارة أو القسم', 'text', 0, [0, 120]], ['count', 'العدد المطلوب', 'int', 1, [1, 50]],
        ['contract', 'نوع العقد', 'seg', 1, ['دوام كامل', 'دوام جزئي', 'مؤقت', 'تعاقد']], ['needBy', 'تاريخ الاحتياج', 'date', 1], ['budget', 'الراتب أو الميزانية التقديرية', 'money', 0, [0, 10000000]],
        ['quals', 'المؤهلات والخبرات المطلوبة', 'area', 1, [3, 1500]], ['reason', 'مبرر الاحتياج', 'area', 1, [3, 1500]]],
];
/* مسار الاعتماد الافتراضي لكل نوع: [نوع الخطوة، القيمة، اسم الخطوة]
   manager = المسؤول المباشر الذي يختاره المنسوب من قائمة المسؤولين (كما في النظام السابق) */
const REQ_CHAINS = [
    'leave'  => [['manager', '', 'المسؤول المباشر'], ['role', 'admin', 'المدير العام']],
    'travel' => [['role', 'hr', 'الموارد البشرية'], ['role', 'ceo', 'الرئيس التنفيذي']],
    'cert'   => [['role', 'hr', 'الموارد البشرية']],
    'perm'   => [['manager', '', 'المسؤول المباشر'], ['role', 'hr', 'الموارد البشرية']],
    'ot'     => [['manager', '', 'المسؤول المباشر'], ['role', 'hr', 'الموارد البشرية']],
    'loan'   => [['role', 'hr', 'الموارد البشرية'], ['role', 'admin', 'المدير العام']],
    'resume' => [['manager', '', 'المسؤول المباشر'], ['role', 'hr', 'الموارد البشرية']],
    'train'  => [['manager', '', 'المسؤول المباشر'], ['role', 'hr', 'الموارد البشرية']],
    'resign' => [['manager', '', 'المسؤول المباشر'], ['role', 'admin', 'المدير العام']],
    'clear'  => [['role', 'hr', 'الموارد البشرية'], ['role', 'admin', 'المدير العام']],
    'hire'   => [['role', 'hr', 'الموارد البشرية'], ['role', 'admin', 'المدير العام']],
];
const REQ_ST = ['pending' => 'قيد الإجراء', 'approved' => 'معتمد', 'rejected' => 'مرفوض', 'cancelled' => 'ملغى'];
/* أنواع الإجازة الستة في النظام السابق، و«بدون راتب» التي كانت في المنصة */
const LEAVE_KINDS = ['اعتيادية (سنوية)', 'تعويضية', 'مرضية', 'دراسة / تدريب', 'طارئة (اضطرارية)', 'أمومة', 'حج', 'زواج', 'وفاة قريب', 'بدون راتب', 'أخرى'];
/* الأنواع التي لها رصيد مستقل لا يُتجاوز (المرضية تُتجاوز بأجر مخفّض فتُنبّه ولا تُمنع) */
const LEAVE_STRICT = ['طارئة (اضطرارية)', 'أمومة', 'حج', 'زواج', 'وفاة قريب'];
const LEAVE_KIND_OLD = ['اعتيادية' => 'اعتيادية (سنوية)', 'اضطرارية' => 'طارئة (اضطرارية)'];
const CERT_KINDS = ['تعريف بالراتب', 'شهادة خبرة', 'تعريف بدون راتب'];
const REQ_LINK_DAYS = 30; /* صلاحية روابط القرار في البريد */

function req_str($v, int $max = 300): string { return mb_substr(safe_text($v ?? ''), 0, $max); }
function req_date($v): string { $v = trim((string)$v); return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) && checkdate((int)substr($v, 5, 2), (int)substr($v, 8, 2), (int)substr($v, 0, 4)) ? $v : ''; }
/* أيام تقويمية شاملة اليومين (كالنظام السابق) */
function req_days(string $a, string $b): int { if (!$a || !$b) return 0; $d = (int)round((strtotime($b) - strtotime($a)) / 86400) + 1; return max(0, $d); }
function leave_kind_norm(string $k): string { return LEAVE_KIND_OLD[$k] ?? $k; }

/* بيانات الإجازة: $strict للتقديم الجديد، والتعديل يتسامح مع الطلبات القديمة التي ليس فيها كل الحقول */
function req_clean_leave(array $d, bool $strict = true): array {
    $k = leave_kind_norm((string)($d['kind'] ?? ''));
    $o = ['kind' => in_array($k, LEAVE_KINDS, true) ? $k : '', 'from' => req_date($d['from'] ?? ''), 'to' => req_date($d['to'] ?? ''),
        'reason' => req_str($d['reason'] ?? ($d['note'] ?? ''), 1500),
        'substitute' => req_str($d['substitute'] ?? '', 120), 'subTitle' => req_str($d['subTitle'] ?? '', 120), 'subNo' => req_str($d['subNo'] ?? '', 40),
        'contact' => req_str($d['contact'] ?? '', 40), 'address' => req_str($d['address'] ?? '', 250),
        'supervisor' => req_str($d['supervisor'] ?? '', 40), 'supName' => req_str($d['supName'] ?? '', 120)];
    if (!$o['kind']) throw new HttpError('اختر نوع الإجازة');
    if (!$o['from'] || !$o['to'] || $o['to'] < $o['from']) throw new HttpError('تاريخ النهاية يجب أن يكون في يوم البداية أو بعده');
    $o['days'] = req_days($o['from'], $o['to']);
    if ($o['days'] > 120) throw new HttpError('مدة الإجازة أطول من المسموح في طلب واحد');
    if ($strict || $o['reason'] !== '') if (mb_strlen(trim($o['reason'])) < 3) throw new HttpError('اكتب سبب الإجازة (3 أحرف على الأقل)');
    if ($strict) {
        if ($o['substitute'] === '' || $o['subTitle'] === '') throw new HttpError('اكتب اسم الموظف البديل ومسماه الوظيفي');
        if (strlen(preg_replace('/\D/', '', to_ascii_digits($o['contact']))) < 6) throw new HttpError('اكتب رقم تواصل صحيحًا مع رمز الدولة');
    }
    return $o;
}
function req_mins(string $t): ?int { return preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $t, $m) ? (int)$m[1] * 60 + (int)$m[2] : null; }
/* بيانات الأنواع المبنية بالمخطط: التحقق ثم الحقول المحسوبة */
function req_clean_schema(string $type, array $d, string $ref = ''): array {
    $o = [];
    foreach (REQ_SCHEMA[$type] as $f) {
        [$k, $lab, $kind, $req] = $f; $opt = $f[4] ?? null; $v = $d[$k] ?? '';
        if ($kind === 'date') $v = req_date($v);
        elseif ($kind === 'time') $v = req_mins(trim((string)$v)) === null ? '' : trim((string)$v);
        elseif ($kind === 'month') $v = preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', trim((string)$v)) ? trim((string)$v) : '';
        elseif ($kind === 'int' || $kind === 'money') {
            $raw = str_replace(['٫', '٬', ','], ['.', '', ''], trim(to_ascii_digits((string)$v)));
            if ($raw !== '' && !preg_match($kind === 'int' ? '/^\d+$/' : '/^\d+(\.\d+)?$/', $raw)) throw new HttpError('اكتب ' . $lab . ' بالأرقام فقط');
            $v = $raw === '' ? '' : ($kind === 'int' ? (int)$raw : round((float)$raw, 2));
            if ($v !== '' && is_array($opt) && ($v < $opt[0] || $v > $opt[1])) throw new HttpError($lab . ': القيمة بين ' . $opt[0] . ' و' . $opt[1]);
        } elseif ($kind === 'seg') $v = in_array($v, (array)$opt, true) ? $v : '';
        elseif ($kind === 'reqref') {
            $v = strtoupper(trim((string)$v));
            if ($v !== '') { $x = q1("SELECT * FROM requests WHERE no=? AND ref=? AND status='approved'", [$v, $ref]); if (!$x || !in_array($x['type'], (array)$opt, true)) throw new HttpError('الطلب المرتبط غير صحيح'); }
        } else {
            $max = is_array($opt) ? (int)$opt[1] : ($kind === 'area' ? 1200 : 160); $v = req_str($v, $max);
            if ($v !== '' && is_array($opt) && mb_strlen(trim($v)) < (int)$opt[0]) throw new HttpError('اكتب ' . $lab . ' (' . $opt[0] . ' أحرف على الأقل)');
        }
        if ($req && ($v === '' || $v === null)) throw new HttpError(($kind === 'seg' || $kind === 'reqref' ? 'اختر ' : 'اكتب ') . $lab);
        $o[$k] = $v;
    }
    $o['supervisor'] = req_str($d['supervisor'] ?? '', 40); $o['supName'] = '';
    $today = date('Y-m-d');
    if ($type === 'perm' || $type === 'ot') {
        $a = req_mins($o['fromT']); $b = req_mins($o['toT']); $m = $b - $a;
        if ($type === 'ot' && $m < 0) $m += 1440; /* عمل إضافي يمتد بعد منتصف الليل */
        if ($m <= 0) throw new HttpError('وقت النهاية يجب أن يكون بعد وقت البداية');
        if ($type === 'perm' && $m > 300) throw new HttpError('الاستئذان خمس ساعات على الأكثر؛ للمدة الأطول قدّم طلب إجازة');
        if ($type === 'ot' && $m > 720) throw new HttpError('العمل الإضافي 12 ساعة على الأكثر في اليوم');
        $o['mins'] = $m;
        if ($o['day'] < date('Y-m-d', strtotime('-45 days'))) throw new HttpError('التاريخ أقدم من 45 يومًا؛ تواصل مع الموارد البشرية');
        $w = (int)date('w', strtotime($o['day']));
        if ($type === 'perm' && in_array($w, site()['work']['weekend'], true)) throw new HttpError('هذا اليوم عطلة نهاية أسبوع؛ لا يلزم استئذان');
        if ($type === 'ot') $o['weekend'] = in_array($w, site()['work']['weekend'], true);
        /* لا يتداخل مع طلب من النوع نفسه في اليوم نفسه (حتى لا يُحتسب الإضافي مرتين) */
        $a0 = req_mins($o['fromT']); $b0 = $a0 + $o['mins'];
        foreach (q("SELECT no, data FROM requests WHERE ref=? AND type=? AND status IN ('pending','approved')", [$ref, $type])->fetchAll() as $x) {
            $xd = json_decode($x['data'], true) ?: []; if (($xd['day'] ?? '') !== $o['day']) continue;
            $xa = req_mins((string)($xd['fromT'] ?? '')); $xb = $xa + (int)($xd['mins'] ?? 0);
            if ($xa !== null && $a0 < $xb && $xa < $b0) throw new HttpError('يتداخل هذا الوقت مع الطلب ' . $x['no'] . ' (' . ($xd['fromT'] ?? '') . '–' . ($xd['toT'] ?? '') . ')');
        }
        if ($type === 'perm') foreach (q("SELECT no, data FROM requests WHERE ref=? AND type IN ('leave','travel') AND status IN ('pending','approved')", [$ref])->fetchAll() as $x) {
            $xd = json_decode($x['data'], true) ?: []; if (($xd['from'] ?? '') <= $o['day'] && ($xd['to'] ?? '') >= $o['day']) throw new HttpError('هذا اليوم ضمن الطلب ' . $x['no'] . '؛ لا يلزم استئذان');
        }
    }
    if ($type === 'loan') {
        if ($o['start'] < date('Y-m')) throw new HttpError('شهر بداية الخصم لا يكون في الماضي');
        $o['inst'] = round($o['amount'] / max(1, $o['months']), 2);
        $o['end'] = date('Y-m', strtotime($o['start'] . '-01 +' . ($o['months'] - 1) . ' month'));
        foreach (q("SELECT no, data FROM requests WHERE ref=? AND type='loan' AND status IN ('pending','approved')", [$ref])->fetchAll() as $x) {
            $xd = json_decode($x['data'], true) ?: []; if (($xd['end'] ?? '') >= date('Y-m')) throw new HttpError('لديك سلفة قائمة (' . $x['no'] . ') لم تُسدَّد بعد');
        }
    }
    if ($type === 'resume') {
        if ($o['day'] > $today) throw new HttpError('تاريخ المباشرة لا يكون في المستقبل؛ قدّم الإشعار يوم مباشرتك أو بعده');
        $o['lateDays'] = 0; $o['linkTo'] = '';
        if ($o['link'] !== '') {
            $x = q1('SELECT * FROM requests WHERE no=?', [$o['link']]); $xd = json_decode($x['data'], true) ?: [];
            $o['linkTo'] = (string)($xd['to'] ?? ''); $back = date('Y-m-d', strtotime($o['linkTo'] . ' +1 day'));
            /* أيام التأخر عن العودة: أيام العمل بين اليوم التالي لنهاية الإجازة ويوم المباشرة */
            for ($t = strtotime($back); $t < strtotime($o['day']); $t += 86400) if (!in_array((int)date('w', $t), site()['work']['weekend'], true)) $o['lateDays']++;
            if ($o['day'] < $o['linkTo']) throw new HttpError('تاريخ المباشرة قبل نهاية ' . ($x['type'] === 'leave' ? 'الإجازة' : 'المهمة') . ' المرتبطة');
            $dup = q1("SELECT no FROM requests WHERE ref=? AND type='resume' AND status IN ('pending','approved') AND data LIKE ?", [$ref, '%"link":"' . $o['link'] . '"%']);
            if ($dup) throw new HttpError('سبق تقديم إشعار مباشرة لهذا الطلب: ' . $dup['no']);
        } elseif ($o['kind'] !== 'تعيين جديد') throw new HttpError('اختر الإجازة أو المهمة التي عدت منها');
    }
    if ($type === 'train') {
        if ($o['to'] < $o['from']) throw new HttpError('تاريخ النهاية يجب أن يكون في يوم البداية أو بعده');
        $o['days'] = req_days($o['from'], $o['to']);
    }
    if ($type === 'resign') {
        if ($o['lastDay'] < $today) throw new HttpError('آخر يوم عمل لا يكون في الماضي');
        $o['notice'] = req_days($today, $o['lastDay']) - 1;
        $dup = q1("SELECT no FROM requests WHERE ref=? AND type='resign' AND status IN ('pending','approved')", [$ref]); if ($dup) throw new HttpError('سبق تقديم طلب استقالة: ' . $dup['no']);
    }
    if ($type === 'clear') {
        $dup = q1("SELECT no FROM requests WHERE ref=? AND type='clear' AND status IN ('pending','approved')", [$ref]); if ($dup) throw new HttpError('سبق فتح إخلاء طرف لهذا المنسوب: ' . $dup['no']);
    }
    if ($type === 'hire' && $o['needBy'] < $today) throw new HttpError('تاريخ الاحتياج لا يكون في الماضي');
    return $o;
}
/* يتحقق من بيانات كل نوع ويعيدها نظيفة */
function req_clean(string $type, array $d, string $ref = ''): array {
    if ($type === 'leave') return req_clean_leave($d, true);
    if (isset(REQ_SCHEMA[$type])) return req_clean_schema($type, $d, $ref);
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
/* منع التداخل: لا تُقبل إجازة تتقاطع مع إجازة أخرى للمنسوب نفسه قيد الإجراء أو معتمدة */
function req_leave_overlap(string $ref, array $o, string $exceptNo = ''): void {
    foreach (q("SELECT no, data FROM requests WHERE ref=? AND type='leave' AND status IN ('pending','approved') AND no<>?", [$ref, $exceptNo])->fetchAll() as $x) {
        $d = json_decode($x['data'], true) ?: [];
        if (($d['from'] ?? '') && ($d['to'] ?? '') && $d['from'] <= $o['to'] && $d['to'] >= $o['from'])
            throw new HttpError('تتداخل هذه الفترة مع الطلب ' . $x['no'] . ' (من ' . $d['from'] . ' إلى ' . $d['to'] . '). عدّل التاريخين أو ألغِ الطلب السابق.');
    }
}
/* رقم الطلب: تسلسل سنوي لكل نوع، تحت قفل حتى لا يتكرر لو قُدّم طلبان في اللحظة نفسها */
function req_next_no(string $type): string {
    $p = REQ_TYPES[$type][0] . '-' . date('Y') . '-';
    $r = q1('SELECT no FROM requests WHERE no LIKE ? ORDER BY no DESC LIMIT 1', [$p . '%']);
    /* لا يُعاد استعمال رقم طلب محذوف (حتى لا تعمل روابطه القديمة على طلب جديد) */
    $floor = json_decode((string)(setting('req_seq_floor') ?: ''), true); $floor = is_array($floor) ? (int)($floor[$p] ?? 0) : 0;
    return $p . str_pad((string)(max((int)($r ? substr($r['no'], -4) : 0), $floor) + 1), 4, '0', STR_PAD_LEFT);
}
function req_staff_email(?array $s): string { if (!$s) return ''; $e = trim((string)(($s['data']['officialEmail'] ?? '') ?: ($s['data']['personalEmail'] ?? ''))); return filter_var($e, FILTER_VALIDATE_EMAIL) ? $e : ''; }
function req_row(array $r, bool $full = true): array {
    $s = staff_get($r['ref']); $d = $s ? $s['data'] : [];
    $chain = array_map(function ($c) { unset($c['email']); return $c; }, json_decode($r['chain'], true) ?: []);
    $o = ['no' => $r['no'], 'ref' => $r['ref'], 'type' => $r['type'], 'typeName' => REQ_TYPES[$r['type']][1], 'form' => REQ_TYPES[$r['type']][2],
        'status' => $r['status'], 'statusName' => REQ_ST[$r['status']] ?? $r['status'], 'stage' => (int)$r['stage'],
        'chain' => $chain, 'createdAt' => substr($r['created_at'], 0, 16), 'updatedAt' => substr($r['updated_at'], 0, 16),
        'name' => $s ? staff_name($s) : $r['ref'], 'sum' => req_summary($r)];
    if ($full) {
        $o['view'] = req_view_rows($r);
        $o['data'] = json_decode($r['data'], true) ?: [];
        if ($r['type'] === 'leave' && isset($o['data']['kind'])) $o['data']['kind'] = leave_kind_norm((string)$o['data']['kind']);
        $o['createdBy'] = $r['created_by'];
        $o['staff'] = ['entity' => (string)($d['entity'] ?? ''), 'jobTitle' => (string)($d['jobTitle'] ?? ''), 'department' => (string)($d['department'] ?? ''),
            'manager' => (string)($d['manager'] ?? ''), 'mobile' => (string)($d['mobile'] ?? ''), 'email' => req_staff_email($s),
            'employeeNo' => (string)($d['employeeNo'] ?? ''), 'workCountry' => (string)($d['workCountry'] ?? '')];
    }
    return $o;
}

/* ============ المسؤولون المباشرون (قائمة يديرها مدير النظام بدل كتابتها في الكود) ============ */
function req_sups(): array {
    $v = json_decode((string)(setting('leave_sups') ?: ''), true);
    return array_values(array_filter(is_array($v) ? $v : [], fn($s) => is_array($s) && !empty($s['id']) && !empty($s['email'])));
}
function req_sup(string $id): ?array { foreach (req_sups() as $s) if ($s['id'] === $id) return $s; return null; }
function req_sups_save(array $b): array {
    $me = require_perm('requests.forms');
    $in = is_array($b['sups'] ?? null) ? $b['sups'] : [];
    if (count($in) > 80) throw new HttpError('القائمة أطول من المسموح');
    $old = []; foreach (req_sups() as $s) $old[$s['id']] = $s;
    $out = []; $seen = [];
    foreach ($in as $s) {
        $name = req_str($s['name'] ?? '', 80); $email = strtolower(trim((string)($s['email'] ?? ''))); $title = req_str($s['title'] ?? '', 80);
        if (mb_strlen($name) < 2) throw new HttpError('اكتب اسم كل مسؤول');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new HttpError('بريد غير صحيح: ' . $name);
        if (isset($seen[$email])) throw new HttpError('البريد نفسه مكرر: ' . $email); $seen[$email] = 1;
        $id = preg_match('/^[a-f0-9]{8}$/', (string)($s['id'] ?? '')) ? (string)$s['id'] : bin2hex(random_bytes(4));
        $out[] = ['id' => $id, 'name' => $name, 'email' => $email, 'title' => $title];
    }
    setting_set('leave_sups', json_encode($out, JSON_UNESCAPED_UNICODE));
    $added = array_filter($out, fn($s) => !isset($old[$s['id']])); $gone = array_diff_key($old, array_column($out, null, 'id'));
    audit_log('', 'تحديث قائمة المسؤولين المباشرين', count($out) . ' مسؤولًا' . ($added ? ' · أُضيف: ' . implode('، ', array_column($added, 'name')) : '') . ($gone ? ' · حُذف: ' . implode('، ', array_column($gone, 'name')) : ''), $me['_label']);
    return req_forms();
}

/* ============ النماذج الإدارية ومسؤولو اعتمادها (يحددهم مدير النظام) ============
   الخطوة: «دور» (كل حساب بهذا الدور ولديه صلاحية الاعتماد) أو «حساب محدد» أو «شخص بالبريد» (بلا حساب، يعتمد من رابط البريد)
   أو «المسؤول المباشر» (للإجازة: يختاره المنسوب من القائمة). التعديل يسري على الطلبات الجديدة فقط. */
const REQ_FORM_INFO = [
    'leave'  => 'إجازة اعتيادية أو تعويضية أو مرضية أو دراسية أو طارئة، بتاريخ البداية والنهاية والسبب والموظف البديل. يعتمدها المسؤول المباشر ثم المدير العام.',
    'travel' => 'تكليف بمهمة رسمية: الوجهة والغرض والتواريخ ووسيلة السفر والسكن والسلفة.',
    'cert'   => 'خطاب تعريف بالراتب أو شهادة خبرة موجّه إلى جهة، بالعربية أو الإنجليزية.',
    'perm'   => 'تأخر صباحي أو خروج مبكر أو خروج أثناء الدوام، بالتاريخ والساعات والسبب. الاستئذان المعتمد يبرّر التأخير في كشف الحضور الشهري.',
    'ot'     => 'ساعات عمل خارج الدوام بالتاريخ والوقت والمهام. تظهر الساعات المعتمدة في الحضور وفي مستحقات الشهر بالرواتب.',
    'loan'   => 'سلفة من الراتب بالمبلغ وعدد الأقساط وشهر البداية. تظهر أقساطها في استقطاعات كل شهر بالرواتب حتى السداد.',
    'resume' => 'إشعار بالعودة إلى العمل بعد إجازة أو مهمة، أو المباشرة بعد التعيين. يحدد يوم العودة الفعلي، وأيام التأخر تُخصم من الرصيد السنوي.',
    'train'  => 'ترشيح لبرنامج تدريبي: البرنامج والجهة والتواريخ والتكلفة والعائد المتوقع.',
    'resign' => 'استقالة المنسوب بآخر يوم عمل مقترح وأسبابها. بعد اعتمادها يصل الموارد البشرية تنبيه لفتح إخلاء الطرف.',
    'clear'  => 'إخلاء طرف عند انتهاء الخدمة: لا يكتمل حتى تُسلَّم كل العهد المسجّلة على المنسوب، وبعد اعتماده يصبح ملفه «منتهية خدمته» ويبقى في السجل.',
    'hire'   => 'احتياج إدارة إلى موظف: المسمى والعدد ونوع العقد والمؤهلات والمبرر. بعد اعتماده تُعلن الوظيفة من صفحة التوظيف.',
];
const REQ_STEP_ROLES = ['hr', 'ceo', 'admin']; /* «اطلاع فقط» لا يملك صلاحية الاعتماد؛ لشخص بعينه اختر «حساب محدد» */
function req_flow(): array {
    $saved = json_decode((string)(setting('req_flow') ?: ''), true); $saved = is_array($saved) ? $saved : [];
    $out = [];
    foreach (REQ_CHAINS as $t => $def) {
        $f = $saved[$t] ?? null;
        $steps = is_array($f['steps'] ?? null) && $f['steps'] ? $f['steps'] : array_map(fn($c) => ['kind' => $c[0], 'v' => $c[1], 'label' => $c[2]], $def);
        $out[$t] = ['on' => isset($f['on']) ? (bool)$f['on'] : true, 'steps' => array_values($steps)];
    }
    return $out;
}
/* سلسلة الطلب الجديد من الإعداد الحالي (المسؤول المباشر يُثبَّت فيها ببريده واسمه) */
function req_new_chain(string $type, ?array $sup = null): array {
    return array_map(function ($s) use ($sup) {
        $c = ['label' => (string)$s['label'], 'kind' => (string)($s['kind'] ?? 'role'), 'decision' => '', 'by' => '', 'at' => '', 'note' => '', 'role' => ''];
        if ($c['kind'] === 'user') $c['user'] = (int)$s['v'];
        elseif ($c['kind'] === 'person') { $c['email'] = strtolower((string)$s['v']); $c['who'] = (string)$s['label']; }
        elseif ($c['kind'] === 'manager') { if (!$sup) throw new HttpError('اختر المسؤول المباشر'); $c['email'] = $sup['email']; $c['who'] = $sup['name']; $c['mgr'] = 1; }
        else { $c['kind'] = 'role'; $c['role'] = (string)$s['v']; }
        return $c;
    }, req_flow()[$type]['steps']);
}
/* من يعتمد هذه الخطوة؟ (حسابات نشطة) */
function req_step_people(array $step): array {
    if (!empty($step['email'])) return array_values(array_filter(q('SELECT * FROM users WHERE active=1 AND LOWER(email)=?', [strtolower((string)$step['email'])])->fetchAll()));
    if (!empty($step['user'])) { $u = q1('SELECT * FROM users WHERE id=? AND active=1', [(int)$step['user']]); return $u ? [$u] : []; }
    return array_values(array_filter(q('SELECT * FROM users WHERE active=1 AND role=?', [(string)($step['role'] ?? '')])->fetchAll(), fn($u) => in_array('requests.approve', user_perms($u), true)));
}
/* عناوين البريد التي تُرسل إليها روابط القرار لهذه الخطوة */
function req_step_emails(array $step): array {
    if (!empty($step['email'])) return [strtolower((string)$step['email']) => (string)($step['who'] ?? $step['label'])];
    $o = []; foreach (req_step_people($step) as $u) $o[strtolower((string)$u['email'])] = (string)($u['name'] ?: $step['label']); return $o;
}
/* هل يستطيع هذا الحساب اتخاذ القرار في الخطوة الحالية؟ مدير النظام يستطيع دائمًا (للطوارئ) */
function req_can_decide(array $u, array $r): bool {
    if ($r['status'] !== 'pending') return false;
    $chain = json_decode($r['chain'], true) ?: []; $step = $chain[(int)$r['stage']] ?? null;
    if (!$step) return false;
    /* لا يعتمد أحد طلبه هو، ولا حتى مدير النظام */
    static $mine = []; $uid = (int)$u['id']; if (!array_key_exists($uid, $mine)) $mine[$uid] = my_staff_ref($u);
    if ($mine[$uid] === $r['ref']) return false;
    static $em = []; if (!isset($em[$r['ref']])) $em[$r['ref']] = req_staff_emails($r['ref']);
    if (in_array(strtolower((string)$u['email']), $em[$r['ref']], true)) return false;
    if (has_perm($u, 'requests.override')) return true;
    /* من اعتمد خطوة سابقة لا يعتمد خطوة أخرى في الطلب نفسه (إلا مدير النظام عند الطوارئ) */
    foreach ($chain as $i => $c) if ($i < (int)$r['stage'] && (int)($c['uid'] ?? 0) === $uid) return false;
    if (!empty($step['email'])) return strtolower((string)$u['email']) === strtolower((string)$step['email']);
    if (!empty($step['user'])) return (int)$step['user'] === (int)$u['id'];
    return has_perm($u, 'requests.approve') && $u['role'] === ($step['role'] ?? '');
}
/* التعديل قبل الاعتماد: للمسؤول المباشر في خطوته فقط (كالنظام السابق) */
function req_step_can_edit(array $r): bool {
    if ($r['type'] !== 'leave' || $r['status'] !== 'pending') return false;
    $chain = json_decode($r['chain'], true) ?: []; return !empty($chain[(int)$r['stage']]['mgr']);
}
function req_forms(): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $flow = req_flow(); $isAdmin = has_perm($u, 'requests.forms'); $forms = [];
    $cnt = []; foreach (q('SELECT type, status, COUNT(*) n FROM requests GROUP BY type, status')->fetchAll() as $r) $cnt[$r['type']][$r['status']] = (int)$r['n'];
    $sups = req_sups();
    foreach (REQ_TYPES as $t => $T) {
        $steps = array_map(function ($s) use ($sups, $isAdmin) {
            $k = (string)($s['kind'] ?? 'role');
            if ($k === 'manager') $people = array_map(fn($p) => ['id' => 0, 'name' => $p['name']], $sups);
            elseif ($k === 'person') $people = [['id' => 0, 'name' => $isAdmin ? (string)$s['v'] : mask_email((string)$s['v'])]];
            else {
                $c = $k === 'user' ? ['user' => (int)$s['v']] : ['role' => (string)$s['v']];
                $people = array_map(fn($p) => ['id' => (int)$p['id'], 'name' => $p['name'] ?: mask_email((string)$p['email'])], req_step_people($c));
            }
            return ['kind' => $k, 'v' => $k === 'person' && !$isAdmin ? '' : $s['v'], 'label' => $s['label'], 'people' => $people];
        }, $flow[$t]['steps']);
        $forms[] = ['type' => $t, 'code' => $T[2], 'prefix' => $T[0], 'name' => $T[1], 'info' => REQ_FORM_INFO[$t] ?? '', 'on' => $flow[$t]['on'], 'steps' => $steps,
            'fields' => REQ_SCHEMA[$t] ?? null, 'mgrOk' => $t === 'leave' || isset(REQ_SCHEMA[$t]),
            'total' => array_sum($cnt[$t] ?? []), 'pending' => $cnt[$t]['pending'] ?? 0];
    }
    /* المنسوب يرى أسماء المسؤولين فقط ليختار منها؛ البريد لمن يدير النماذج */
    $supsOut = array_map(fn($s) => $isAdmin ? $s : ['id' => $s['id'], 'name' => $s['name'], 'title' => $s['title'] ?? ''], $sups);
    return ['ok' => true, 'forms' => $forms, 'roles' => array_intersect_key(ROLE_NAMES, array_flip(REQ_STEP_ROLES)), 'canEdit' => $isAdmin, 'sups' => $supsOut, 'leaveKinds' => LEAVE_KINDS];
}
function req_forms_save(array $b): array {
    $me = require_perm('requests.forms');
    $t = (string)($b['type'] ?? ''); if (!isset(REQ_TYPES[$t])) throw new HttpError('نوع النموذج غير معروف');
    $in = is_array($b['steps'] ?? null) ? $b['steps'] : [];
    if (!$in) throw new HttpError('أضف خطوة اعتماد واحدة على الأقل');
    if (count($in) > 5) throw new HttpError('خمس خطوات على الأكثر');
    $steps = []; $seen = [];
    foreach ($in as $i => $s) {
        $kind = in_array($s['kind'] ?? '', ['user', 'person', 'manager'], true) ? $s['kind'] : 'role';
        $label = req_str($s['label'] ?? '', 60);
        if ($kind === 'user') {
            $u = q1("SELECT * FROM users WHERE id=? AND active=1 AND role <> 'staff'", [(int)($s['v'] ?? 0)]);
            if (!$u) throw new HttpError('اختر حسابًا نشطًا لكل خطوة');
            if (!in_array('requests.approve', user_perms($u), true)) throw new HttpError('الحساب «' . ($u['name'] ?: $u['email']) . '» لا يملك صلاحية «اعتماد الطلبات»؛ أضفها له من الحسابات أولًا');
            $v = (int)$u['id']; if ($label === '') $label = $u['title'] ?: $u['name'];
        } elseif ($kind === 'person') {
            $v = strtolower(trim((string)($s['v'] ?? ''))); if (!filter_var($v, FILTER_VALIDATE_EMAIL)) throw new HttpError('اكتب بريدًا صحيحًا للخطوة ' . ($i + 1));
        } elseif ($kind === 'manager') {
            if ($t !== 'leave' && !isset(REQ_SCHEMA[$t])) throw new HttpError('«المسؤول المباشر» غير متاح لهذا النموذج');
            if ($i !== 0) throw new HttpError('«المسؤول المباشر» يكون الخطوة الأولى في المسار');
            $v = ''; if ($label === '') $label = 'المسؤول المباشر';
        } else {
            $v = (string)($s['v'] ?? ''); if (!in_array($v, REQ_STEP_ROLES, true)) throw new HttpError('اختر المسؤول عن كل خطوة');
            if ($label === '') $label = ROLE_NAMES[$v];
            if (!req_step_people(['role' => $v])) throw new HttpError('لا يوجد حساب نشط بدور «' . ROLE_NAMES[$v] . '» يملك صلاحية الاعتماد، فتتوقف الطلبات عند خطوة «' . $label . '». اختر حسابًا محددًا أو أضف الصلاحية أولًا.');
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
    if ($r['type'] === 'leave') return 'إجازة ' . leave_kind_norm((string)($d['kind'] ?? '')) . ' · ' . ($d['days'] ?? 0) . ' يومًا · من ' . ($d['from'] ?? '') . ' إلى ' . ($d['to'] ?? '');
    if ($r['type'] === 'travel') return 'مهمة إلى ' . ($d['dest'] ?? '') . ' · ' . ar_days((int)($d['days'] ?? 0)) . ' · من ' . ($d['from'] ?? '');
    if ($r['type'] === 'perm') return ($d['kind'] ?? 'استئذان') . ' · ' . ($d['day'] ?? '') . ' · ' . ($d['fromT'] ?? '') . '–' . ($d['toT'] ?? '');
    if ($r['type'] === 'ot') return 'عمل إضافي ' . req_hours((int)($d['mins'] ?? 0)) . ' · ' . ($d['day'] ?? '');
    if ($r['type'] === 'loan') return 'سلفة ' . number_format((float)($d['amount'] ?? 0)) . ' ر.س على ' . ($d['months'] ?? 0) . ' أقساط من ' . ($d['start'] ?? '');
    if ($r['type'] === 'resume') return ($d['kind'] ?? 'مباشرة') . ' · ' . ($d['day'] ?? '') . (!empty($d['lateDays']) ? ' · تأخر ' . ar_days((int)$d['lateDays']) . ' عمل' : '');
    if ($r['type'] === 'train') return 'تدريب: ' . ($d['program'] ?? '') . ' · ' . ($d['provider'] ?? '');
    if ($r['type'] === 'resign') return 'استقالة · آخر يوم عمل ' . ($d['lastDay'] ?? '');
    if ($r['type'] === 'clear') return 'إخلاء طرف · ' . ($d['why'] ?? '') . ' · آخر يوم ' . ($d['lastDay'] ?? '');
    if ($r['type'] === 'hire') return 'احتياج: ' . ($d['title'] ?? '') . ' × ' . ($d['count'] ?? 1) . ' · ' . ($d['entity'] ?? '');
    return ($d['kind'] ?? '') . ' موجّه إلى ' . ($d['to'] ?? '');
}
/* عدد الأيام بصيغة عربية سليمة */
function ar_days(int $n): string { return $n === 1 ? 'يوم واحد' : ($n === 2 ? 'يومان' : ($n >= 3 && $n <= 10 ? $n . ' أيام' : $n . ' يومًا')); }
/* كل عناوين المنسوب (الرسمي والشخصي وبريد حسابه) لمنع اعتماده طلبه بنفسه */
function req_staff_emails(string $ref): array {
    $s = staff_get($ref); $o = [];
    if ($s) foreach (['officialEmail', 'personalEmail'] as $k) { $e = strtolower(trim((string)($s['data'][$k] ?? ''))); if ($e !== '') $o[] = $e; }
    foreach (q('SELECT email FROM users WHERE staff_ref=?', [$ref])->fetchAll() as $u) $o[] = strtolower((string)$u['email']);
    return array_values(array_unique($o));
}
function req_hours(int $m): string { $h = intdiv($m, 60); $mm = $m % 60; return ($h ? $h . ' س' : '') . ($h && $mm ? ' ' : '') . ($mm ? $mm . ' د' : ($h ? '' : '0 د')); }
/* صفوف العرض الجاهزة (للورقة الرسمية وصفحة القرار والبريد) */
function req_view_rows(array $r): array {
    $d = json_decode($r['data'], true) ?: []; $t = $r['type']; $o = [];
    if (isset(REQ_SCHEMA[$t])) {
        foreach (REQ_SCHEMA[$t] as $f) {
            $v = $d[$f[0]] ?? ''; if ($v === '' || $v === null) continue;
            if ($f[2] === 'money') $v = number_format((float)$v, 2) . ' ر.س';
            if ($f[2] === 'area') continue;
            $o[] = [$f[1], (string)$v, in_array($f[2], ['date', 'time', 'month', 'reqref'], true) ? 1 : 0];
        }
        if ($t === 'perm' || $t === 'ot') $o[] = ['المدة', req_hours((int)($d['mins'] ?? 0))];
        if ($t === 'ot' && !empty($d['weekend'])) $o[] = ['ملاحظة', 'في يوم عطلة نهاية الأسبوع'];
        if ($t === 'loan') { $o[] = ['القسط الشهري', number_format((float)($d['inst'] ?? 0), 2) . ' ر.س']; $o[] = ['آخر قسط', (string)($d['end'] ?? ''), 1]; }
        if ($t === 'resume' && ($d['link'] ?? '') !== '') { $o[] = ['نهاية الإجازة أو المهمة', (string)($d['linkTo'] ?? ''), 1]; $o[] = ['التأخر عن العودة', !empty($d['lateDays']) ? ar_days((int)$d['lateDays']) . ' عمل (تُخصم من الرصيد السنوي)' : 'لا يوجد']; }
        if ($t === 'train') $o[] = ['المدة', ar_days((int)($d['days'] ?? 0))];
        if ($t === 'resign') $o[] = ['مهلة الإشعار', ar_days((int)($d['notice'] ?? 0)) . ' من تاريخ التقديم'];
        if ($t === 'clear' && function_exists('custody_open')) { $op = custody_open($r['ref']); $o[] = ['العهد غير المسلّمة', $op ? count($op) . ': ' . implode('، ', array_column($op, 'item')) : 'لا يوجد — سُلّمت كل العهد']; }
        if (($d['supName'] ?? '') !== '') $o[] = ['المسؤول المباشر', (string)$d['supName']];
        foreach (REQ_SCHEMA[$t] as $f) if ($f[2] === 'area' && ($d[$f[0]] ?? '') !== '') $o[] = [$f[1], (string)$d[$f[0]], 0, 1];
    } elseif ($t === 'travel') {
        $o = [['الوجهة', (string)($d['dest'] ?? '')], ['من', (string)($d['from'] ?? ''), 1], ['إلى', (string)($d['to'] ?? ''), 1], ['المدة', ar_days((int)($d['days'] ?? 0))],
            ['وسيلة السفر', (string)($d['transport'] ?? '') . (!empty($d['hotel']) ? ' مع سكن' : '')], ['السلفة', !empty($d['advance']) ? number_format((float)$d['advance'], 2) . ' ' . ($d['currency'] ?? 'SAR') : 'لا يوجد'],
            ['الغرض من المهمة', (string)($d['purpose'] ?? ''), 0, 1]];
    } elseif ($t === 'cert') {
        $o = [['نوع الخطاب', (string)($d['kind'] ?? '')], ['موجّه إلى', (string)($d['to'] ?? '')], ['لغة الخطاب', (string)($d['lang'] ?? '')]];
        if (($d['note'] ?? '') !== '') $o[] = ['ملاحظات', (string)$d['note'], 0, 1];
    }
    return $o;
}

/* ============ روابط القرار في البريد ============
   رمز لكل معتمِد ولكل خطوة، يُحفظ مُجزَّأً (hash)، وينتهي بعد 30 يومًا أو بمجرد حسم الخطوة.
   فتح الرابط يعرض الطلب فقط؛ التنفيذ بزر صريح (POST)، فلا تعتمد أدوات فحص البريد شيئًا بالخطأ. */
function req_tok_issue(array $r, int $stage, string $email, string $who): string {
    $t = bin2hex(random_bytes(24));
    kv_put('ract:' . hash('sha256', $t), json_encode(['no' => $r['no'], 'stage' => $stage, 'email' => strtolower($email), 'who' => $who], JSON_UNESCAPED_UNICODE), REQ_LINK_DAYS * 86400);
    return $t;
}
function req_tok_load(array $b): array {
    if (rate_hit('ract:' . client_ip(), 120, 3600)) throw new HttpError('locked', 429);
    $t = (string)($b['t'] ?? '');
    $x = preg_match('/^[a-f0-9]{48}$/', $t) ? json_decode((string)(kv_get('ract:' . hash('sha256', $t)) ?? ''), true) : null;
    if (!is_array($x)) { usleep(300000); throw new HttpError('الرابط غير صالح أو انتهت صلاحيته. افتح الطلب من المنصة أو اطلب من الموارد البشرية إعادة إرساله.'); }
    $r = q1('SELECT * FROM requests WHERE no=?', [(string)$x['no']]); if (!$r) throw new HttpError('الطلب غير موجود', 404);
    return [$x, $r];
}
function req_act_view(array $x, array $r): array {
    $o = req_row($r, true);
    $chain = json_decode($r['chain'], true) ?: [];
    $open = $r['status'] === 'pending' && (int)$r['stage'] === (int)$x['stage'];
    if (in_array(strtolower((string)$x['email']), req_staff_emails($r['ref']), true)) $open = false;
    return ['ok' => true, 'request' => $o, 'open' => $open, 'stageLabel' => (string)($chain[(int)$x['stage']]['label'] ?? ''), 'who' => (string)$x['who'],
        'canEdit' => $open && $r['type'] === 'leave' && !empty($chain[(int)$x['stage']]['mgr']), 'isLast' => (int)$x['stage'] >= count($chain) - 1, 'leaveKinds' => LEAVE_KINDS];
}
function req_act(array $b): array { [$x, $r] = req_tok_load($b); return req_act_view($x, $r); }
function req_act_do(array $b): array {
    [$x, $r] = req_tok_load($b);
    $v = req_act_view($x, $r);
    if (!$v['open']) throw new HttpError('تم اتخاذ القرار في هذه الخطوة مسبقًا، والطلب الآن: ' . (REQ_ST[$r['status']] ?? $r['status']));
    $label = ($x['who'] ?: mask_email($x['email'])) . ' (من رابط البريد)';
    $r = req_apply($r, $label, (string)($b['decision'] ?? ''), (string)($b['note'] ?? ''), is_array($b['edits'] ?? null) ? $b['edits'] : null, (string)$x['who']);
    return req_act_view($x, $r);
}

/* ============ رسائل البريد (قالب نظام الإجازات السابق) ============ */
const LV = ['navyDark' => '#161D35', 'navy' => '#1B2347', 'gold' => '#C9A84C', 'goldLight' => '#DDB95A', 'goldPale' => '#FBF5E6', 'bg' => '#EDEEF4', 'border' => '#DDE1EE', 'muted' => '#8E97B4', 'green' => '#1A6B3C', 'red' => '#C0392B'];
function lv_frame(string $entity, string $title, string $content): string {
    $C = LV;
    return '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>'
        . '<body style="margin:0;padding:0;background:' . $C['bg'] . ';font-family:Tahoma,Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;background:#FFFFFF;">'
        . '<div style="background:' . $C['navy'] . ';background-image:linear-gradient(135deg,' . $C['navyDark'] . ',' . $C['navy'] . ');padding:22px 24px 18px;text-align:center;">'
        . '<img src="cid:logo" alt="بنيان" width="60" style="width:60px;height:auto;margin:0 auto 10px;display:block;border:0;">'
        . '<div style="color:' . $C['gold'] . ';font-size:12px;font-weight:bold;letter-spacing:1px;margin-bottom:6px;">' . esc_html($entity) . '</div>'
        . '<div style="color:#FFFFFF;font-size:19px;font-weight:bold;">' . $title . '</div></div>'
        . '<div style="padding:24px;direction:rtl;text-align:right;color:' . $C['navy'] . ';font-size:14px;line-height:1.9;">' . $content . '</div>'
        . '<div style="background:' . $C['navy'] . ';padding:16px;text-align:center;color:' . $C['goldLight'] . ';font-size:12px;">مجموعة بنيان العالمية - نظام إدارة طلبات الإجازات</div>'
        . '<div style="background:#F6F7FA;padding:4px 18px 14px;">' . mail_signature(true) . '</div>'
        . '</div></body></html>';
}
function lv_table(array $rows): string {
    $C = LV; $h = '<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:13.5px;">';
    foreach (array_values($rows) as $i => $r) {
        $v = ($r[1] === '' || $r[1] === null) ? '—' : (!empty($r[2]) ? '<span dir="ltr" style="unicode-bidi:embed;">' . esc_html($r[1]) . '</span>' : esc_html($r[1]));
        $h .= '<tr style="background:' . ($i % 2 ? $C['bg'] : '#FFFFFF') . ';"><td style="padding:9px 12px;color:' . $C['muted'] . ';font-weight:bold;width:35%;border-bottom:1px solid ' . $C['border'] . ';">' . esc_html($r[0]) . '</td>'
            . '<td style="padding:9px 12px;color:' . $C['navy'] . ';font-weight:bold;border-bottom:1px solid ' . $C['border'] . ';">' . $v . '</td></tr>';
    }
    return $h . '</table>';
}
function lv_changes(array $ch): string {
    $C = LV;
    if (!$ch) return '<p style="color:' . $C['muted'] . ';">لا توجد تغييرات في البيانات الأساسية للطلب.</p>';
    $h = '<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:13px;"><tr style="background:' . $C['navy'] . ';color:#FFFFFF;"><td style="padding:9px 12px;font-weight:bold;">الحقل</td><td style="padding:9px 12px;font-weight:bold;">القيمة السابقة</td><td style="padding:9px 12px;font-weight:bold;">القيمة الجديدة</td></tr>';
    foreach (array_values($ch) as $i => $c) $h .= '<tr style="background:' . ($i % 2 ? $C['bg'] : '#FFFFFF') . ';"><td style="padding:9px 12px;font-weight:bold;color:' . $C['navy'] . ';border-bottom:1px solid ' . $C['border'] . ';">' . esc_html($c[0]) . '</td>'
        . '<td style="padding:9px 12px;color:' . $C['red'] . ';text-decoration:line-through;border-bottom:1px solid ' . $C['border'] . ';">' . esc_html($c[1] !== '' ? $c[1] : '—') . '</td>'
        . '<td style="padding:9px 12px;color:' . $C['green'] . ';font-weight:bold;border-bottom:1px solid ' . $C['border'] . ';">' . esc_html($c[2] !== '' ? $c[2] : '—') . '</td></tr>';
    return $h . '</table>';
}
function lv_box(string $label, string $text, string $tone): string {
    $C = LV; $bg = $tone === 'red' ? 'rgba(192,57,43,0.06)' : ($tone === 'gold' ? $C['goldPale'] : $C['bg']);
    $bd = ['red' => $C['red'], 'gold' => $C['gold'], 'green' => $C['green']][$tone] ?? $C['navy']; $fg = $tone === 'gold' ? '#9C7E2E' : $bd;
    return '<div style="background:' . $bg . ';border-right:4px solid ' . $bd . ';border-radius:8px;padding:12px 16px;margin:14px 0;"><div style="font-weight:bold;color:' . $fg . ';margin-bottom:6px;">' . esc_html($label) . '</div><div>' . nl2br(esc_html($text)) . '</div></div>';
}
function lv_date(string $d): string { return $d ? date('Y/m/d', strtotime($d)) : ''; }
function lv_rows(array $r): array {
    $d = json_decode($r['data'], true) ?: []; $s = staff_get($r['ref']); $sd = $s ? $s['data'] : [];
    $chain = json_decode($r['chain'], true) ?: []; $mgr = ''; foreach ($chain as $c) if (!empty($c['mgr'])) $mgr = (string)($c['who'] ?? '');
    $rows = [['رقم الطلب', $r['no'], 1], ['اسم الموظف', $s ? staff_name($s) : $r['ref']], ['المسمى الوظيفي', (string)($sd['jobTitle'] ?? '')]];
    if (!empty($sd['employeeNo'])) $rows[] = ['الرقم الوظيفي', (string)$sd['employeeNo']];
    $rows[] = ['الجهة / القسم', trim((string)($sd['entity'] ?? '') . (!empty($sd['department']) ? ' - ' . $sd['department'] : ''))];
    $rows[] = ['نوع الإجازة', leave_kind_norm((string)($d['kind'] ?? ''))];
    $rows[] = ['فترة الإجازة', lv_date((string)($d['from'] ?? '')) . ' إلى ' . lv_date((string)($d['to'] ?? ''))];
    $rows[] = ['عدد الأيام', ($d['days'] ?? 0) . ' يوم'];
    $rows[] = ['سبب الإجازة', (string)($d['reason'] ?? ($d['note'] ?? ''))];
    $rows[] = ['رقم التواصل', (string)(($d['contact'] ?? '') ?: ($sd['mobile'] ?? '')), 1];
    $rows[] = ['البريد الإلكتروني', req_staff_email($s), 1];
    if (!empty($d['address'])) $rows[] = ['العنوان أثناء الإجازة', (string)$d['address']];
    if ($mgr !== '') $rows[] = ['المسؤول المباشر', $mgr];
    return $rows;
}
function lv_sub(array $r): string {
    $d = json_decode($r['data'], true) ?: []; if (empty($d['substitute'])) return '';
    $C = LV; $rows = [['الاسم', (string)$d['substitute']], ['المسمى الوظيفي', (string)($d['subTitle'] ?? '')]];
    if (!empty($d['subNo'])) $rows[] = ['الرقم الوظيفي', (string)$d['subNo']];
    return '<div style="background:' . $C['goldPale'] . ';border:1px solid ' . $C['gold'] . ';border-radius:8px;padding:14px 16px;margin:14px 0;"><div style="color:#9C7E2E;font-weight:bold;font-size:13px;margin-bottom:8px;">&#128100; الموظف البديل أثناء الإجازة</div>' . lv_table($rows) . '</div>';
}
function lv_btn(string $url, string $text, string $bg, string $fg): string {
    return '<a href="' . esc_html($url) . '" style="display:block;text-align:center;background:' . $bg . ';color:' . $fg . ';text-decoration:none;padding:13px;border-radius:8px;font-weight:bold;font-size:14px;margin-bottom:10px;">' . $text . '</a>';
}
function lv_entity(array $r): string { $s = staff_get($r['ref']); $e = trim((string)($s['data']['entity'] ?? '')); return $e !== '' ? $e : 'مجموعة بنيان العالمية'; }
function lv_send(string $to, string $subject, string $html, string $text, string $ref, bool $toStaff): void {
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return;
    try { send_mail($to, $subject, $html, $text . mail_signature_text(), 'نظام الإجازات · مجموعة بنيان العالمية', logo_inline(), $toStaff ? (string)cfg('hr_notify') : ''); }
    catch (Throwable $e) { audit_log($ref, 'تعذّر إرسال بريد الإجازة', $subject . ' · ' . mask_email($to)); }
}
/* (1) تأكيد الاستلام · (3) اعتماد المرحلة · (4) التعديل · (6) الاعتماد النهائي · (7) الرفض — للموظف */
function lv_mail_staff(array $r, string $kind, array $x = []): void {
    $s = staff_get($r['ref']); $to = req_staff_email($s); if (!$to) return;
    $name = $s ? staff_name($s) : $r['ref']; $ent = lv_entity($r); $no = $r['no'];
    $hi = '<p>عزيزي/عزيزتي <strong>' . esc_html($name) . '</strong>،</p>';
    $track = '<div style="margin:16px 0 4px;">' . lv_btn((string)cfg('site_url') . '#myreq', 'متابعة طلبي في المنصة', LV['navy'], '#FFFFFF') . '</div>';
    $table = lv_table(lv_rows($r)); $sub = lv_sub($r);
    if ($kind === 'received') {
        $first = (string)($x['first'] ?? 'المسؤول المباشر');
        lv_send($to, 'تأكيد استلام طلب الإجازة - ' . $no, lv_frame($ent, '&#128233; تأكيد استلام طلب الإجازة', $hi . '<p>نشكر لك تقديم طلب الإجازة. تم استلام طلبك بنجاح، وهو الآن قيد المراجعة من قِبل ' . esc_html($first) . '.</p>' . $table . $sub . '<p style="margin-top:14px;">سيتم إشعارك بالبريد الإلكتروني فور اتخاذ أي قرار بشأن طلبك.</p>' . $track), 'تم استلام طلب الإجازة ' . $no, $r['ref'], true);
    } elseif ($kind === 'stage') {
        lv_send($to, 'تم اعتماد طلب الإجازة - ' . $x['label'] . ' - ' . $no, lv_frame($ent, '&#9989; تم اعتماد طلبك (' . esc_html($x['label']) . ')', $hi . '<p>نود إعلامك بأن طلب الإجازة الخاص بك تم <strong>اعتماده من ' . esc_html($x['label']) . '</strong>، وهو الآن عند ' . esc_html($x['next']) . ' للاعتماد.</p>' . $table . ($x['note'] !== '' ? lv_box('ملاحظة ' . $x['label'] . ':', $x['note'], 'green') : '') . '<p style="margin-top:14px;">سيتم إشعارك بالنتيجة النهائية فور البت في الطلب.</p>' . $track), 'اعتُمد طلبك من ' . $x['label'] . ' ' . $no, $r['ref'], true);
    } elseif ($kind === 'edited') {
        lv_send($to, 'تم تعديل طلب الإجازة - ' . $no, lv_frame($ent, '&#9999;&#65039; تعديل على طلب الإجازة', $hi . '<p>نود إعلامك بأن ' . esc_html($x['label']) . ' قام بإجراء بعض التعديلات على طلب إجازتك قبل اعتماده. وفيما يلي تفاصيل ما تغيّر:</p>' . lv_changes($x['changes']) . ($x['note'] !== '' ? lv_box('ملاحظة ' . $x['label'] . ':', $x['note'], 'gold') : '') . '<p style="font-weight:bold;margin:16px 0 6px;">بيانات الطلب بعد التعديل:</p>' . $table . $sub . '<p style="margin-top:14px;">' . ($x['next'] !== '' ? 'تم تحويل طلبك بعد التعديل إلى ' . esc_html($x['next']) . ' للاعتماد، وسيتم إشعارك بالنتيجة.' : 'واعتُمد طلبك بعد التعديل.') . '</p>' . $track), 'عُدّل طلب الإجازة ' . $no, $r['ref'], true);
    } elseif ($kind === 'final') {
        lv_send($to, 'تم اعتماد طلب الإجازة نهائياً - ' . $no, lv_frame($ent, '&#9989; تم اعتماد طلب الإجازة نهائياً', $hi . '<p>يسرنا إعلامك بأن طلب الإجازة الخاص بك قد تم <strong>اعتماده بشكل نهائي</strong>. نتمنى لك إجازة سعيدة ومباركة.</p>' . $table . ($x['note'] !== '' ? lv_box('ملاحظة ' . $x['label'] . ':', $x['note'], 'green') : '') . $track), 'اعتُمد طلب الإجازة نهائيًا ' . $no, $r['ref'], true);
    } elseif ($kind === 'rejected') {
        lv_send($to, 'تم رفض طلب الإجازة - ' . $no, lv_frame($ent, '&#10060; تم رفض طلب الإجازة', $hi . '<p>نأسف لإعلامك بأن طلب الإجازة الخاص بك تم <strong>رفضه</strong> من قِبل ' . esc_html($x['label']) . '.</p>' . $table . lv_box('سبب الرفض:', $x['note'], 'red') . '<p style="margin-top:14px;">في حال وجود أي استفسار، يرجى التواصل مع ' . esc_html($x['label']) . ' أو إدارة الموارد البشرية.</p>' . $track), 'رُفض طلب الإجازة ' . $no . "\nالسبب: " . $x['note'], $r['ref'], true);
    }
}
/* (2) طلب اعتماد · (5) طلب اعتماد بعد التعديل — لمن يعتمد الخطوة الحالية، برابط خاص بكل معتمد */
function lv_mail_approvers(array $r, array $x = []): void {
    $chain = json_decode($r['chain'], true) ?: []; $i = (int)$r['stage']; $step = $chain[$i] ?? null; if (!$step) return;
    $s = staff_get($r['ref']); $name = $s ? staff_name($s) : $r['ref']; $ent = lv_entity($r); $no = $r['no'];
    $prev = $i > 0 ? $chain[$i - 1] : null; $edited = !empty($x['changes']) || ($prev && ($prev['decision'] ?? '') === 'edit');
    $last = $i >= count($chain) - 1; $mgr = !empty($step['mgr']);
    $staffMails = req_staff_emails($r['ref']);
    foreach (req_step_emails($step) as $to => $who) {
        if (in_array($to, $staffMails, true)) continue; /* لا يعتمد أحد طلبه هو */
        $tk = req_tok_issue($r, $i, $to, $who); $base = (string)cfg('site_url') . 'decide.html#t=' . $tk;
        $btn = '<div style="margin:18px 0;">' . lv_btn($base . '&a=approve', $last ? '&#9989; اعتماد نهائي' : '&#9989; اعتماد الطلب', LV['green'], '#FFFFFF')
            . ($mgr ? lv_btn($base . '&a=edit', '&#9999;&#65039; تعديل الطلب قبل الاعتماد', LV['gold'], LV['navyDark']) : '')
            . lv_btn($base . '&a=view', '&#128172; عرض التفاصيل والتعليق', LV['navy'], '#FFFFFF')
            . lv_btn($base . '&a=reject', '&#10060; رفض الطلب', LV['red'], '#FFFFFF') . '</div>'
            . '<p style="font-size:12px;color:' . LV['muted'] . ';margin:4px 0 0;">الرابط خاص بك ويفتح صفحة الطلب لتأكيد قرارك، وصالح ' . REQ_LINK_DAYS . ' يومًا. ويمكنك أيضًا اتخاذ القرار من المنصة بعد الدخول.</p>';
        if ($edited && $prev) {
            $title = '&#128276; طلب اعتماد ' . ($last ? 'نهائي ' : '') . '(بعد التعديل)';
            $html = lv_frame($ent, $title, '<p>السلام عليكم،</p><p>قام ' . esc_html($prev['label']) . ' بإجراء بعض التعديلات على طلب الإجازة التالي ثم اعتمده، وهو الآن بانتظار ' . ($last ? 'الاعتماد النهائي من سعادتكم' : 'اعتمادكم') . '.</p>'
                . lv_changes((array)($x['changes'] ?? ($prev['changes'] ?? []))) . (($prev['note'] ?? '') !== '' ? lv_box('ملاحظة ' . $prev['label'] . ':', (string)$prev['note'], 'navy') : '')
                . '<p style="font-weight:bold;margin:16px 0 6px;">بيانات الطلب بعد التعديل:</p>' . lv_table(lv_rows($r)) . lv_sub($r) . $btn);
            lv_send($to, 'طلب اعتماد ' . ($last ? 'نهائي ' : '') . 'بعد التعديل - ' . $no, $html, 'طلب إجازة بانتظار اعتمادك بعد التعديل: ' . $no . "\n" . $base . '&a=view', $r['ref'], false);
        } else {
            $title = $i === 0 ? '&#128276; طلب اعتماد إجازة - ' . esc_html($step['label']) : ($last ? '&#128276; طلب الاعتماد النهائي لإجازة' : '&#128276; طلب اعتماد إجازة - ' . esc_html($step['label']));
            $intro = $i === 0 ? '<p>تم تقديم طلب إجازة جديد من الموظف <strong>' . esc_html($name) . '</strong>، وهو بانتظار اعتمادكم' . ($mgr ? ' كمسؤول مباشر' : '') . '.</p>'
                : '<p>طلب الإجازة التالي تم اعتماده من ' . esc_html($prev['label']) . '، وهو الآن بانتظار ' . ($last ? 'الاعتماد النهائي من سعادتكم' : 'اعتمادكم') . '.</p>';
            $html = lv_frame($ent, $title, '<p>السلام عليكم،</p>' . $intro . lv_table(lv_rows($r)) . lv_sub($r) . ($prev && ($prev['note'] ?? '') !== '' ? lv_box('ملاحظة ' . $prev['label'] . ':', (string)$prev['note'], 'navy') : '') . $btn);
            lv_send($to, ($i === 0 ? 'طلب اعتماد إجازة - ' . $step['label'] : ($last ? 'طلب الاعتماد النهائي لإجازة' : 'طلب اعتماد إجازة - ' . $step['label'])) . ' - ' . $no, $html, 'طلب إجازة بانتظار اعتمادك: ' . $no . ' · ' . $name . "\n" . $base . '&a=view', $r['ref'], false);
        }
    }
}

/* ============ رسائل الأنواع الأخرى (إركاب، تعريف) ============ */
function req_mail_staff(array $r, string $title, string $line): void {
    $s = staff_get($r['ref']); if (!$s) return;
    $to = req_staff_email($s); if (!$to) return;
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
    if (!empty($step['email'])) $list[strtolower((string)$step['email'])] = 1;
    /* مدير النظام تصله نسخة إن كانت تنبيهاته مفعّلة (يستطيع الاعتماد عند الطوارئ) */
    foreach (q("SELECT * FROM users WHERE active=1 AND role='admin'")->fetchAll() as $u) if (user_notify($u) && in_array('requests.approve', user_perms($u), true)) $list[strtolower($u['email'])] = 1;
    $s = staff_get($r['ref']); $name = $s ? staff_name($s) : $r['ref'];
    $staffMails = req_staff_emails($r['ref']);
    $rows = '';
    foreach (req_view_rows($r) as $v) $rows .= '<tr><td style="padding:6px 0;color:#6B778A;width:130px;vertical-align:top;">' . esc_html($v[0]) . '</td><td style="padding:6px 0;font-weight:700;color:#1D2A3B;">' . nl2br(esc_html($v[1])) . '</td></tr>';
    /* من يعتمد بالبريد (المسؤول المباشر أو شخص بلا حساب) يصله رابط قرار خاص به */
    $tokFor = !empty($step['email']) ? strtolower((string)$step['email']) : '';
    foreach (array_keys($list) as $to) {
        if (in_array($to, $staffMails, true)) continue; /* لا يعتمد أحد طلبه هو */
        $link = (string)cfg('site_url') . '#reqs'; $lab = 'فتح الطلب في المنصة';
        if ($tokFor !== '' && $to === $tokFor) { $link = (string)cfg('site_url') . 'decide.html#t=' . req_tok_issue($r, (int)$r['stage'], $to, (string)($step['who'] ?? $step['label'])) . '&a=view'; $lab = 'عرض الطلب واتخاذ القرار'; }
        $inner = '<p style="margin:0 0 10px;font-size:14px;color:#1D2A3B;">' . esc_html(REQ_TYPES[$r['type']][1]) . ' بانتظار قرارك' . (!empty($step['mgr']) ? ' بصفتك المسؤول المباشر' : '') . ' من <b>' . esc_html($name) . '</b>.</p>'
            . '<table style="border-collapse:collapse;width:100%;font-size:13.5px;"><tr><td style="padding:6px 0;color:#6B778A;width:130px;">رقم الطلب</td><td style="padding:6px 0;font-weight:800;direction:ltr;text-align:right;">' . esc_html($r['no']) . '</td></tr>' . $rows . '</table>'
            . '<div style="margin:14px 0 6px;"><a href="' . esc_html($link) . '" style="display:inline-block;padding:10px 20px;border-radius:10px;background:#16294A;color:#fff;font-weight:700;font-size:13.5px;text-decoration:none;">' . $lab . '</a></div>'
            . ($tokFor !== '' && $to === $tokFor ? '<p style="font-size:12px;color:#8E97B4;margin:4px 0 0;">الرابط خاص بك وصالح ' . REQ_LINK_DAYS . ' يومًا، ويفتح صفحة الطلب لتأكيد قرارك.</p>' : '');
        try { send_mail($to, 'بانتظار اعتمادك: ' . REQ_TYPES[$r['type']][1] . ' · ' . $r['no'], mail_frame('Bonyan HR · الطلبات', REQ_TYPES[$r['type']][1], $inner), req_summary($r) . "\n" . $link, 'منصة بنيان للموارد البشرية', logo_inline()); }
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
    if ($u['role'] === 'staff' && $type === 'clear') throw new HttpError('إخلاء الطرف تفتحه الموارد البشرية بعد اعتماد الاستقالة');
    if (rate_hit('req:' . $u['id'] . ($ref !== $mine ? ':' . $ref : ''), 30, 86400)) throw new HttpError('too_many', 429);
    if ($u['role'] === 'staff' && !staff_can_see('reqs')) throw new HttpError('تقديم الطلبات من بوابة المنسوب موقوف حاليًا. تواصل مع الموارد البشرية.');
    if (!req_flow()[$type]['on']) throw new HttpError('هذا النموذج موقوف حاليًا. تواصل مع الموارد البشرية.');
    $data = req_clean($type, is_array($b['data'] ?? null) ? $b['data'] : [], $ref);
    $sup = null;
    if ($type === 'leave' || isset(REQ_SCHEMA[$type])) {
        $needSup = in_array('manager', array_column(req_flow()[$type]['steps'], 'kind'), true);
        if ($needSup) {
            $sup = req_sup($data['supervisor']); if (!$sup) throw new HttpError('اختر المسؤول المباشر من القائمة');
            if (in_array(strtolower($sup['email']), req_staff_emails($ref), true)) throw new HttpError('لا يمكن أن يكون صاحب الطلب مسؤوله المباشر. اختر المسؤول المباشر الصحيح.');
            $data['supName'] = $sup['name'];
        } else { $data['supervisor'] = ''; $data['supName'] = ''; }
        if ($type === 'leave') { req_leave_overlap($ref, $data); if (function_exists('leave_quota_check')) leave_quota_check($ref, $data); }
    }
    $chain = req_new_chain($type, $sup);
    named_lock('req_no');
    try {
        $no = req_next_no($type);
        q('INSERT INTO requests (no, ref, type, status, stage, chain, data, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [$no, $ref, $type, 'pending', 0, json_encode($chain, JSON_UNESCAPED_UNICODE), json_encode($data, JSON_UNESCAPED_UNICODE), $by, now(), now()]);
    } finally { named_unlock('req_no'); }
    $r = q1('SELECT * FROM requests WHERE no=?', [$no]);
    audit_log($ref, 'تقديم ' . REQ_TYPES[$type][1], $no . ' · ' . req_summary($r) . ($sup ? ' · المسؤول المباشر: ' . $sup['name'] : ''), $by);
    if ($type === 'leave') { lv_mail_staff($r, 'received', ['first' => $chain[0]['who'] ?? $chain[0]['label']]); lv_mail_approvers($r); }
    else {
        if ($type === 'clear') req_mail_staff($r, 'فُتح إخلاء الطرف', 'فتحت الموارد البشرية إخلاء طرفك. سلّم ما لديك من عهد، وسيصلك بريد عند كل خطوة.');
        else req_mail_staff($r, 'استلمنا طلبك', 'وصل طلبك إلى ' . ($chain[0]['who'] ?? $chain[0]['label']) . '، وسيصلك بريد عند كل خطوة في مساره.');
        req_mail_approvers($r, $chain[0]);
    }
    return ['ok' => true, 'request' => req_out($u, $r)];
}
function req_out(array $u, array $r): array { $cd = req_can_decide($u, $r); return req_row($r) + ['canDecide' => $cd, 'canEdit' => $cd && req_step_can_edit($r)]; }
function req_list(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    if (has_perm($u, 'staff.view')) {
        $rows = q('SELECT * FROM requests ORDER BY id DESC LIMIT 500')->fetchAll();
        $appr = has_perm($u, 'requests.approve');
        return ['ok' => true, 'rows' => array_map(function ($r) use ($u, $appr) { $o = req_out($u, $r);
            /* سبب الإجازة والملاحظات (قد تكون صحية) لا يراها إلا من يعتمد */
            if (!$appr && !$o['canDecide']) { foreach (['note', 'reason', 'tasks', 'dues', 'purpose', 'benefit'] as $k) unset($o['data'][$k]); $o['view'] = array_values(array_filter($o['view'] ?? [], fn($v) => empty($v[3]))); }
            return $o; }, $rows)];
    }
    /* المنسوب: طلباته، وإن كان مسؤولًا مباشرًا أو معتمدًا بالبريد: الطلبات التي مرّت أو تمر عليه */
    $ref = my_staff_ref($u); $mail = strtolower((string)$u['email']);
    $rows = q('SELECT * FROM requests WHERE ref=? OR chain LIKE ? ORDER BY id DESC LIMIT 300', [(string)$ref, '%"email":"' . str_replace(['%', '_'], ['\%', '\_'], $mail) . '"%'])->fetchAll();
    return ['ok' => true, 'rows' => array_map(function ($r) use ($u, $ref) { $o = req_out($u, $r); $o['mine'] = $r['ref'] === $ref; return $o; }, $rows)];
}

/* تنفيذ القرار (من المنصة أو من رابط البريد): approve · reject · edit (تعديل ثم اعتماد، للمسؤول المباشر) */
function req_apply(array $r, string $actor, string $decision, string $note, ?array $edits, string $actorName = '', int $actorId = 0): array {
    if (!in_array($decision, ['approve', 'reject', 'edit'], true)) throw new HttpError('قرار غير معروف');
    $note = req_str($note, 600);
    if ($decision === 'reject' && mb_strlen(trim($note)) < 3) throw new HttpError('اكتب سبب الرفض ليصل إلى الموظف');
    if ($decision === 'edit' && !req_step_can_edit($r)) throw new HttpError('التعديل متاح للمسؤول المباشر في خطوته فقط');
    named_lock('req_dec');
    try {
        $r = q1('SELECT * FROM requests WHERE id=?', [$r['id']]); /* أحدث نسخة: لا يُحسم الطلب مرتين */
        if ($r['status'] !== 'pending') throw new HttpError('سبق اتخاذ القرار في هذا الطلب');
        $chain = json_decode($r['chain'], true); $i = (int)$r['stage']; $data = json_decode($r['data'], true) ?: [];
        $changes = [];
        if ($decision === 'edit') {
            $new = req_clean_leave(array_merge($data, array_intersect_key((array)$edits, array_flip(['kind', 'from', 'to', 'reason', 'substitute', 'subTitle', 'subNo']))), false);
            req_leave_overlap($r['ref'], $new, $r['no']);
            if (function_exists('leave_quota_check')) leave_quota_check($r['ref'], $new, $r['no']);
            $L = ['kind' => 'نوع الإجازة', 'from' => 'تاريخ البداية', 'to' => 'تاريخ النهاية', 'days' => 'عدد الأيام', 'reason' => 'سبب الإجازة', 'substitute' => 'اسم الموظف البديل', 'subTitle' => 'المسمى الوظيفي للبديل', 'subNo' => 'الرقم الوظيفي للبديل'];
            foreach ($L as $k => $lab) {
                $a = $k === 'kind' ? leave_kind_norm((string)($data[$k] ?? '')) : (string)($data[$k] ?? ($k === 'reason' ? ($data['note'] ?? '') : ''));
                $bv = (string)($new[$k] ?? '');
                if (trim($a) !== trim($bv)) $changes[] = [$lab, in_array($k, ['from', 'to'], true) ? lv_date($a) : $a, in_array($k, ['from', 'to'], true) ? lv_date($bv) : $bv];
            }
            foreach (['kind', 'from', 'to', 'days', 'reason', 'substitute', 'subTitle', 'subNo'] as $k) $data[$k] = $new[$k];
            unset($data['note']);
        }
        $chain[$i] = array_merge($chain[$i], ['decision' => $decision, 'by' => $actor, 'at' => now_min(), 'note' => $note] + ($actorId ? ['uid' => $actorId] : []) + ($decision === 'edit' ? ['changes' => $changes] : []));
        $last = $i >= count($chain) - 1; $ok = $decision !== 'reject';
        if ($ok && $last && $r['type'] === 'clear' && function_exists('custody_open') && ($op = custody_open($r['ref'])))
            throw new HttpError('لا يكتمل إخلاء الطرف قبل تسليم كل العهد. غير المسلّم: ' . implode('، ', array_column($op, 'item')));
        $status = !$ok ? 'rejected' : ($last ? 'approved' : 'pending'); $stage = $ok && !$last ? $i + 1 : $i;
        q('UPDATE requests SET chain=?, data=?, status=?, stage=?, updated_at=? WHERE id=?', [json_encode($chain, JSON_UNESCAPED_UNICODE), json_encode($data, JSON_UNESCAPED_UNICODE), $status, $stage, now(), $r['id']]);
    } finally { named_unlock('req_dec'); }
    $r = q1('SELECT * FROM requests WHERE id=?', [$r['id']]);
    if ($r['status'] === 'approved' && function_exists('req_on_approved')) req_on_approved($r, $actor);
    $lab = $chain[$i]['label'];
    audit_log($r['ref'], ['approve' => 'اعتماد ', 'reject' => 'رفض ', 'edit' => 'تعديل واعتماد '][$decision] . REQ_TYPES[$r['type']][1], $r['no'] . ' · ' . $lab . ($changes ? ' · عُدّل: ' . implode('، ', array_column($changes, 0)) : '') . ($note ? ' · ' . $note : ''), $actor);
    if ($r['type'] === 'leave') {
        $nextLab = $status === 'pending' ? (string)$chain[$stage]['label'] : '';
        if ($status === 'rejected') lv_mail_staff($r, 'rejected', ['label' => $lab, 'note' => $note]);
        else {
            if ($decision === 'edit') lv_mail_staff($r, 'edited', ['label' => $lab, 'note' => $note, 'changes' => $changes, 'next' => $nextLab]);
            if ($status === 'approved') lv_mail_staff($r, 'final', ['label' => $lab, 'note' => $decision === 'edit' ? '' : $note]);
            elseif ($decision === 'approve') lv_mail_staff($r, 'stage', ['label' => $lab, 'note' => $note, 'next' => $nextLab]);
            if ($status === 'pending') lv_mail_approvers($r, $decision === 'edit' ? ['changes' => $changes] : []);
        }
    } else {
        if ($status === 'approved') req_mail_staff($r, 'اعتُمد طلبك', 'اعتُمد طلبك نهائيًا.' . ($note ? ' ملاحظة: ' . $note : ''));
        elseif ($status === 'rejected') req_mail_staff($r, 'لم يُعتمد طلبك', 'لم يُعتمد طلبك. السبب: ' . $note);
        else { req_mail_staff($r, 'تقدّم طلبك خطوة', 'وافقت ' . $lab . ' على طلبك، وهو الآن عند ' . $chain[$stage]['label'] . '.'); req_mail_approvers($r, $chain[$stage]); }
    }
    return $r;
}
function req_decide(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $r = q1('SELECT * FROM requests WHERE no=?', [(string)($b['no'] ?? '')]); if (!$r) throw new HttpError('not_found', 404);
    if (!req_can_decide($u, $r)) throw new HttpError('هذه الخطوة ليست من صلاحيتك أو سبق اتخاذ القرار فيها', 403);
    $r = req_apply($r, $u['_label'] ?? ($u['name'] ?: $u['email']), (string)($b['decision'] ?? ''), (string)($b['note'] ?? ''), is_array($b['edits'] ?? null) ? $b['edits'] : null, (string)($u['name'] ?: ''), (int)$u['id']);
    return ['ok' => true, 'request' => req_out($u, $r)];
}
function req_cancel(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $r = q1('SELECT * FROM requests WHERE no=?', [(string)($b['no'] ?? '')]); if (!$r) throw new HttpError('not_found', 404);
    $own = my_staff_ref($u) === $r['ref'];
    if (!$own && !has_perm($u, 'staff.edit')) throw new HttpError('forbidden', 403);
    if ($r['status'] !== 'pending') throw new HttpError('لا يمكن إلغاء طلب بعد صدور القرار فيه');
    q("UPDATE requests SET status='cancelled', updated_at=? WHERE id=?", [now(), $r['id']]);
    audit_log($r['ref'], 'إلغاء ' . REQ_TYPES[$r['type']][1], $r['no'], $u['_label']);
    if (!$own) req_mail_staff($r, 'أُلغي طلبك', 'ألغت الموارد البشرية طلبك قبل صدور القرار فيه. للاستفسار تواصل معها.');
    return ['ok' => true];
}
/* حذف طلب نهائيًا من النظام: لمدير النظام فقط، ويبقى أثره في سجل العمليات */
function req_delete(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    if (($u['role'] ?? '') !== 'admin') throw new HttpError('حذف الطلبات لمدير النظام فقط', 403);
    $no = (string)($b['no'] ?? '');
    named_lock('req_dec');
    try {
        $r = q1('SELECT * FROM requests WHERE no=?', [$no]); if (!$r) throw new HttpError('الطلب غير موجود أو حُذف مسبقًا', 404);
        if (preg_match('/^(.*-)(\d{4})$/', $r['no'], $m)) {
            $floor = json_decode((string)(setting('req_seq_floor') ?: ''), true); $floor = is_array($floor) ? $floor : [];
            $floor[$m[1]] = max((int)($floor[$m[1]] ?? 0), (int)$m[2]); setting_set('req_seq_floor', json_encode($floor));
        }
        q('DELETE FROM requests WHERE id=?', [$r['id']]);
        $s = staff_get($r['ref']);
        audit_log($r['ref'], 'حذف ' . REQ_TYPES[$r['type']][1] . ' نهائيًا', $r['no'] . ' · ' . ($s ? staff_name($s) . ' · ' : '') . (REQ_ST[$r['status']] ?? $r['status']) . ' · ' . req_summary($r), $u['_label']);
        return ['ok' => true, 'no' => $r['no']];
    } finally { named_unlock('req_dec'); }
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
