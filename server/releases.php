<?php
/* ============================================================================
 * سجل الإصدارات — تحديثات المنصة يومًا بيوم، يصوغها المطوّر ويطّلع عليها في
 * «النظام ← سجل الإصدارات»، ويمكنه إرسال ملخّص منها للمدير بالبريد.
 * ========================================================================== */

const REL_TAGS = [
    'feature'  => 'ميزة جديدة',
    'improve'  => 'تحسين',
    'fix'      => 'إصلاح',
    'security' => 'أمان',
    'data'     => 'بيانات',
];
function rel_tag_ok(string $t): string { return isset(REL_TAGS[$t]) ? $t : 'feature'; }

function rel_decode(array $r): array {
    $items = json_decode((string)$r['items'], true); if (!is_array($items)) $items = [];
    return ['id' => (int)$r['id'], 'date' => (string)$r['rdate'], 'ver' => (string)$r['ver'], 'title' => (string)$r['title'],
        'tag' => (string)$r['tag'], 'area' => (string)$r['area'], 'items' => array_values($items),
        'by' => (string)$r['by_name'], 'at' => substr((string)$r['at'], 0, 16), 'pinned' => (int)$r['pinned'] ? 1 : 0];
}
function rel_rows(): array {
    $o = []; foreach (q('SELECT * FROM releases ORDER BY pinned DESC, rdate DESC, id DESC')->fetchAll() as $r) $o[] = rel_decode($r);
    return $o;
}
function rel_add(string $date, string $ver, string $title, string $tag, array $items, string $area, string $by, int $pinned = 0): int {
    $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : date('Y-m-d');
    $items = array_values(array_filter(array_map(fn($x) => hrp_str((string)$x, 300), $items), fn($x) => $x !== ''));
    q('INSERT INTO releases (rdate, ver, title, tag, area, items, by_name, at, pinned) VALUES (?,?,?,?,?,?,?,?,?)',
        [$date, hrp_str($ver, 40), hrp_str($title, 200), rel_tag_ok($tag), hrp_str($area, 60), json_encode($items, JSON_UNESCAPED_UNICODE), $by, now(), $pinned ? 1 : 0]);
    return (int)db()->lastInsertId();
}

/* بذار أولي مرة واحدة: يملأ السجل بآخر التحديثات المعروفة حتى لا يبدأ فارغًا */
function rel_seed_once(): void {
    if (kv_get('rel_seed_v1') !== null) return; kv_put('rel_seed_v1', now(), 0);
    if ((int)q('SELECT COUNT(*) c FROM releases')->fetch()['c'] > 0) return;
    $by = 'م. أسامة جنيدي';
    $seed = [
        ['2026-11-21', 'ن-20261121ج', 'توقيع استلام الرواتب وكشف الحساب', 'feature', 'الرواتب', 1, [
            'دمج توقيع استلام الرواتب داخل «كشف الرواتب» بجدول بالأفراد (الاسم والصفة والجهة والراتب وحالة التوقيع) مع تحديد مرن: فردي أو جهة أو الجميع أو محدد.',
            'إرسال طلب توقيع للمنسوب بالبريد عبر أيقونة لكل سطر، مع تذكير تلقائي بعد ٢٤ ساعة إن لم يوقّع.',
            'بريد احترافي بشعار بنيان يحوي صافي راتب الشهر وإجمالي ما استُلم في السنة وحالة التوقيع.',
            'إضافة اختيار «شهر الصرف الفعلي» عند تأكيد الصرف.',
            'استبدال مخطط «مسار راتبك» بقائمة باستلام الرواتب شهرًا بشهر مع زر «أؤكد الاستلام» للمنسوب.',
            'كشف حساب للمنسوب يجمع الراتب وكل ما صُرف له أو عليه (راتب/سلفة/علاج/تذاكر/تدريب) برصيد تراكمي بالريال.',
            'تسجيل تلقائي لاستلام الرواتب بأثر رجعي من تاريخ انضمام كل منسوب حتى قبل ثلاثة أشهر.',
            'حذف صفحة «الحسابات البنكية» المستقلة وإبقاء مؤشّر «بلا حساب بنكي».',
        ]],
        ['2026-11-21', 'ن-20261121ب', 'إصلاح: من يُصرف له نقدًا', 'fix', 'الرواتب', 0, [
            'من هو مسجّل أنه يُصرف له نقدًا لم يَعُد يظهر ضمن «بلا حساب بنكي» ولا يتعطل صرفه.',
        ]],
        ['2026-11-18', '', 'إطلاق «سجلي المالي»', 'feature', 'سجلي المالي', 0, [
            'استبدال «سجلي الوظيفي» بـ«سجلي المالي»: الرواتب والمصاريف والعهد.',
            'احتساب رواتب كل منسوب تلقائيًا من تاريخ تسجيله، مع مكافئ بالريال للعملات الأخرى.',
            'تسجيل العهدة ذاتيًا من المنسوب مع اقتراحات حسب جهته، وخانة حرة لغيرها.',
            'مصطلحات موحّدة: «لك = دائن» و«عليك = مدين».',
        ]],
        ['2026-11-10', '', 'عرض الهيكل الإداري', 'improve', 'الهيكلة', 0, [
            'عرض الهيكلة الإدارية بتصميم راقٍ: الإدارة العليا ثم الجهات في بطاقات أنيقة.',
        ]],
    ];
    /* كل سطر: [التاريخ, الإصدار, العنوان, التصنيف, القسم, مثبّت, [النقاط]] */
    foreach ($seed as $s) { try { rel_add($s[0], $s[1], $s[2], $s[3], $s[6], $s[4], $by, (int)$s[5]); } catch (Throwable $e) { error_log('[bonyan-hr] rel seed ' . $e->getMessage()); } }
}

function rel_list(array $b): array {
    require_perm('settings.manage'); rel_seed_once();
    return ['ok' => true, 'rows' => rel_rows(), 'tags' => REL_TAGS];
}
function rel_save(array $b): array {
    $u = require_perm('settings.manage');
    $title = hrp_str($b['title'] ?? '', 200); if ($title === '') throw new HttpError('اكتب عنوان التحديث');
    $items = is_array($b['items'] ?? null) ? $b['items'] : preg_split('/\r?\n/', (string)($b['items'] ?? ''));
    $items = array_values(array_filter(array_map(fn($x) => hrp_str((string)$x, 300), (array)$items), fn($x) => $x !== ''));
    if (!$items) throw new HttpError('أضف نقطة واحدة على الأقل');
    $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($b['date'] ?? '')) ? (string)$b['date'] : date('Y-m-d');
    $tag = rel_tag_ok((string)($b['tag'] ?? 'feature')); $ver = hrp_str($b['ver'] ?? '', 40); $area = hrp_str($b['area'] ?? '', 60); $pin = !empty($b['pinned']) ? 1 : 0;
    $id = (int)($b['id'] ?? 0);
    if ($id) {
        if (!q1('SELECT id FROM releases WHERE id=?', [$id])) throw new HttpError('التحديث غير موجود');
        q('UPDATE releases SET rdate=?, ver=?, title=?, tag=?, area=?, items=?, pinned=? WHERE id=?',
            [$date, $ver, $title, $tag, $area, json_encode($items, JSON_UNESCAPED_UNICODE), $pin, $id]);
        audit_log('', 'تعديل تحديث في سجل الإصدارات', $title, hrp_label($u));
    } else {
        $id = rel_add($date, $ver, $title, $tag, $items, $area, hrp_label($u), $pin);
        audit_log('', 'إضافة تحديث لسجل الإصدارات', $title, hrp_label($u));
    }
    return ['ok' => true, 'id' => $id, 'rows' => rel_rows()];
}
function rel_delete(array $b): array {
    $u = require_perm('settings.manage'); $id = (int)($b['id'] ?? 0);
    $r = q1('SELECT title FROM releases WHERE id=?', [$id]); if (!$r) throw new HttpError('التحديث غير موجود');
    q('DELETE FROM releases WHERE id=?', [$id]);
    audit_log('', 'حذف تحديث من سجل الإصدارات', (string)$r['title'], hrp_label($u));
    return ['ok' => true, 'rows' => rel_rows()];
}

/* إرسال ملخّص الإصدارات للمدير بالبريد (يحدّد المستلم المستخدمُ وقت الإرسال) */
function rel_email_body(array $rows): string {
    $MN = ['01' => 'يناير', '02' => 'فبراير', '03' => 'مارس', '04' => 'أبريل', '05' => 'مايو', '06' => 'يونيو', '07' => 'يوليو', '08' => 'أغسطس', '09' => 'سبتمبر', '10' => 'أكتوبر', '11' => 'نوفمبر', '12' => 'ديسمبر'];
    $h = '';
    foreach ($rows as $r) {
        $d = $r['date']; $dl = (int)substr($d, 8, 2) . ' ' . ($MN[substr($d, 5, 2)] ?? '') . ' ' . substr($d, 0, 4);
        $tag = REL_TAGS[$r['tag']] ?? 'تحديث';
        $lis = '';
        foreach ($r['items'] as $it) $lis .= '<tr><td style="padding:3px 0 3px 8px;vertical-align:top;color:#C9A24B;font-weight:700">•</td><td style="padding:3px 0;color:#2b3a4b;font-size:14px;line-height:1.85">' . htmlspecialchars($it, ENT_QUOTES, 'UTF-8') . '</td></tr>';
        $h .= '<div style="margin:0 0 14px;padding:14px 16px;border:1px solid #e7ebf0;border-radius:14px;background:#fbfcfd">'
            . '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px">'
            . '<b style="font-size:15px;color:#13293d">' . htmlspecialchars($r['title'], ENT_QUOTES, 'UTF-8') . '</b>'
            . '<span style="font-size:12px;color:#7d8aa0">' . $dl . ($r['ver'] ? ' · ' . htmlspecialchars($r['ver'], ENT_QUOTES, 'UTF-8') : '') . '</span></div>'
            . '<span style="display:inline-block;font-size:11px;font-weight:700;color:#5b6b7f;background:#eef2f6;border-radius:999px;padding:2px 10px;margin-bottom:6px">' . $tag . ($r['area'] ? ' · ' . htmlspecialchars($r['area'], ENT_QUOTES, 'UTF-8') : '') . '</span>'
            . '<table style="width:100%;border-collapse:collapse">' . $lis . '</table></div>';
    }
    return $h;
}
function rel_send(array $b): array {
    $u = require_perm('settings.manage');
    $to = trim((string)($b['to'] ?? ''));
    if ($to === '' && !empty($b['ref'])) $to = hrp_staff_mail((string)$b['ref']);
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) throw new HttpError('أدخل بريدًا صحيحًا للمستلم');
    $ids = array_map('intval', (array)($b['ids'] ?? []));
    $rows = rel_rows();
    if ($ids) { $set = array_flip($ids); $rows = array_values(array_filter($rows, fn($r) => isset($set[$r['id']]))); }
    else { $rows = array_slice($rows, 0, (int)($b['limit'] ?? 10)); }
    if (!$rows) throw new HttpError('لا توجد تحديثات للإرسال');
    $note = hrp_str($b['note'] ?? '', 500);
    $cnt = count($rows); $title = 'تحديثات منصة الموارد البشرية' . ($cnt === 1 ? '' : ' (' . $cnt . ')');
    $lead = $note !== '' ? $note : 'ملخّص بآخر التحديثات التي نُفِّذت على منصة الموارد البشرية.';
    $html = mx_page(['eyebrow' => 'منصة الموارد البشرية · سجل الإصدارات', 'title' => $title, 'tone' => 'navy', 'icon' => '🗂',
        'badge' => 'ملخّص التحديثات', 'lead' => $lead, 'pre' => $title, 'body' => rel_email_body($rows)]);
    try { send_mail($to, $title, $html, strip_tags(str_replace('</td>', ' ', rel_email_body($rows))), 'Bonyan HR', logo_inline()); }
    catch (Throwable $e) { throw new HttpError('تعذّر إرسال البريد: ' . $e->getMessage()); }
    audit_log('', 'إرسال سجل الإصدارات بالبريد', $cnt . ' تحديث · إلى ' . $to, hrp_label($u));
    return ['ok' => true, 'count' => $cnt, 'to' => $to];
}
