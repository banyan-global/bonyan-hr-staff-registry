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

/* ====== السجل المعتمد في الكود: يُزامَن مباشرة مع المنصة عند كل نشر ======
 * كل تحديث أنشره يُضاف هنا، فيظهر تلقائيًا في «سجل الإصدارات» ويُرتَّب بالتاريخ.
 * المفتاح (key) ثابت لكل تحديث، فتُحدَّث صياغته لاحقًا دون تكراره. */
const REL_SEED = [
    ['key' => '20261123a', 'date' => '2026-11-23', 'ver' => 'ن-20261123أ', 'title' => 'الهيكل التنظيمي البياني التفاعلي', 'tag' => 'feature', 'area' => 'المنسوبون', 'pinned' => 1, 'items' => [
        'مخطط هيكلي بياني أنيق: الرئيس التنفيذي ثم النواب الثلاثة (بأرقام وألوان) ثم الكيانات بشعاراتها الحقيقية، بخطوط ربط واضحة.',
        'التوسّع يحدث داخل الهيكل نفسه (لا نافذة منبثقة): الضغط على أي جهة يفتح ما تحتها هرميًا — كيانات بشعاراتها أو مناصب بصور أصحابها — ثم الموظفين كبطاقات أنيقة بصورهم، والضغط على المنسوب يفتح ملفه كاملًا.',
        'تمييز واضح بين الكيان والشخص: شركة بنيان تتفرّع لكيانات وشركات بشعاراتها (دار التمكين، طاقات، نمذجة المدارس، عن بعد، المقر)، وجامعة بنيان تتفرّع لمناصب (الإدارة الأكاديمية، البنين، البنات، الإسكان).',
        'ربط الموظفين تلقائيًا بأقسامهم من سجل المنسوبين، مع فصل الأساتذة والموظفين وتقسيم البنين والبنات، ويعمل في الوضعين الفاتح والداكن.',
    ]],
    ['key' => '20261122d', 'date' => '2026-11-22', 'ver' => 'ن-20261122د', 'title' => 'سجل الإصدارات يتحدّث مباشرة، وضبط الشعار', 'tag' => 'improve', 'area' => 'النظام', 'pinned' => 0, 'items' => [
        'سجل الإصدارات صار يتحدّث مباشرة: كل تعديل أنفّذه على المنصة يُصاغ ويُرتَّب هنا تلقائيًا فور نشره.',
        'تصميم جديد لصفحة سجل الإصدارات على هيئة خط زمني بنقاط ذهبية تتابع التحديثات يومًا بيوم، مع تحسينها دوريًا.',
        'ضبط شعار التطبيق وأيقونته: شعار بنيان داخل بطاقة أنيقة بإطار ذهبي وخلفية فاتحة.',
    ]],
    ['key' => '20261122c', 'date' => '2026-11-22', 'ver' => 'ن-20261122ج', 'title' => 'تقسيم المصاريف وأختام حالات الطلبات', 'tag' => 'feature', 'area' => 'المصاريف', 'pinned' => 0, 'items' => [
        'تقسيم المصاريف إلى أربعة أقسام: تذاكر سفر، العلاج، تأشيرة وإقامة، ومصاريف أخرى.',
        'استبعاد الرواتب من حساب المصاريف؛ تبقى الرواتب في قسمها وحدها.',
        'إظهار حالات الطلبات (معتمد ومرفوض وملغى وقيد الإجراء) كأختام حبرية ملوّنة أنيقة.',
    ]],
    ['key' => '20261122b', 'date' => '2026-11-22', 'ver' => 'ن-20261122ب', 'title' => 'ختم استلام الراتب', 'tag' => 'improve', 'area' => 'الرواتب', 'pinned' => 0, 'items' => [
        'ختم حبري حقيقي لاستلام الراتب في قائمة رواتب المنسوب: مائل بإطار مزدوج وعلامة داخل حلقة ختم.',
    ]],
    ['key' => '20261121g', 'date' => '2026-11-21', 'ver' => 'ن-20261121ز', 'title' => 'توحيد وسوم كشف التوقيع وشعار الجهة', 'tag' => 'improve', 'area' => 'الرواتب', 'pinned' => 0, 'items' => [
        'توحيد شكل الوسوم (الجهة والصفة والتوقيع) بنمط واحد راقٍ.',
        'إظهار شعار كل جهة داخل جدول كشف التوقيع.',
    ]],
    ['key' => '20261121f', 'date' => '2026-11-21', 'ver' => 'ن-20261121و', 'title' => 'ضبط صلاحية التوقيع وبطاقة المنسوب', 'tag' => 'feature', 'area' => 'الرواتب', 'pinned' => 0, 'items' => [
        'حصر التوقيع نيابةً عن المنسوب على حساب النظام فقط؛ الموارد البشرية ترسل طلب التوقيع فقط، والمنسوب يوقّع بنفسه.',
        'جدول كشف التوقيع يتّسع دون تمرير أفقي، وكل المعلومات ظاهرة ومنسّقة.',
        'الضغط على اسم المنسوب يعرض بياناته وإحصاءاته المالية.',
        'توحيد المصطلح إلى «دائن» و«مدين».',
    ]],
    ['key' => '20261121e', 'date' => '2026-11-21', 'ver' => 'ن-20261121هـ', 'title' => 'إيقاف طلبات التوقيع', 'tag' => 'fix', 'area' => 'الرواتب', 'pinned' => 0, 'items' => [
        'إمكانية إيقاف طلبات توقيع الاستلام المعلّقة فورًا، فلا تصل أي تذكيرات.',
    ]],
    ['key' => '20261121c', 'date' => '2026-11-21', 'ver' => 'ن-20261121ج', 'title' => 'توقيع استلام الرواتب وكشف الحساب', 'tag' => 'feature', 'area' => 'الرواتب', 'pinned' => 0, 'items' => [
        'دمج توقيع استلام الرواتب داخل «كشف الرواتب» بتحديد مرن: فردي أو جهة أو الجميع أو محدد.',
        'إرسال طلب توقيع للمنسوب بالبريد، مع تذكير تلقائي بعد ٢٤ ساعة.',
        'اختيار «شهر الصرف الفعلي»، وقائمة باستلام الرواتب للمنسوب مع زر «أؤكد الاستلام».',
        'كشف حساب للمنسوب، وتسجيل تلقائي بأثر رجعي، وحذف صفحة «الحسابات البنكية» المستقلة.',
    ]],
    ['key' => '20261121b', 'date' => '2026-11-21', 'ver' => 'ن-20261121ب', 'title' => 'إصلاح: من يُصرف له نقدًا', 'tag' => 'fix', 'area' => 'الرواتب', 'pinned' => 0, 'items' => [
        'من هو مسجّل أنه يُصرف له نقدًا لم يَعُد يظهر ضمن «بلا حساب بنكي» ولا يتعطّل صرفه.',
    ]],
    ['key' => 'myfin-launch', 'date' => '2026-11-18', 'ver' => '', 'title' => 'إطلاق «سجلي المالي»', 'tag' => 'feature', 'area' => 'سجلي المالي', 'pinned' => 0, 'items' => [
        'استبدال «سجلي الوظيفي» بـ«سجلي المالي»: الرواتب والمصاريف والعهد.',
        'احتساب رواتب كل منسوب تلقائيًا من تاريخ تسجيله، مع مكافئ بالريال للعملات الأخرى.',
        'تسجيل العهدة ذاتيًا من المنسوب مع اقتراحات حسب جهته.',
    ]],
    ['key' => 'org-view', 'date' => '2026-11-10', 'ver' => '', 'title' => 'عرض الهيكل الإداري', 'tag' => 'improve', 'area' => 'الهيكلة', 'pinned' => 0, 'items' => [
        'عرض الهيكلة الإدارية بتصميم راقٍ: الإدارة العليا ثم الجهات في بطاقات أنيقة.',
    ]],
];
/* مزامنة السجل المعتمد مع قاعدة البيانات (إضافة الجديد وتحديث المعدّل)، بحارس تجزئة فلا يعمل إلا عند تغيّر المحتوى */
function rel_sync(): void {
    $h = md5(json_encode(REL_SEED, JSON_UNESCAPED_UNICODE));
    $cur = kv_get('rel_sync_h'); if ($cur === $h) return;
    try {
        if ($cur === null) { /* تنظيف البذار القديم الذي لا يحمل مفتاحًا */
            $st = db()->prepare("DELETE FROM releases WHERE (rkey IS NULL OR rkey='') AND title=?");
            foreach (REL_SEED as $r) $st->execute([$r['title']]);
        }
        $by = 'م. أسامة جنيدي';
        foreach (REL_SEED as $r) {
            $items = json_encode(array_values($r['items']), JSON_UNESCAPED_UNICODE);
            $ex = q1('SELECT id FROM releases WHERE rkey=?', [$r['key']]);
            if ($ex) q('UPDATE releases SET rdate=?, ver=?, title=?, tag=?, area=?, items=?, pinned=? WHERE id=?', [$r['date'], $r['ver'], $r['title'], rel_tag_ok($r['tag']), $r['area'], $items, $r['pinned'] ? 1 : 0, $ex['id']]);
            else q('INSERT INTO releases (rdate, ver, title, tag, area, items, by_name, at, pinned, rkey) VALUES (?,?,?,?,?,?,?,?,?,?)', [$r['date'], $r['ver'], $r['title'], rel_tag_ok($r['tag']), $r['area'], $items, $by, now(), $r['pinned'] ? 1 : 0, $r['key']]);
        }
        kv_put('rel_sync_h', $h, 0);
    } catch (Throwable $e) { error_log('[bonyan-hr] rel sync ' . $e->getMessage()); }
}

function rel_list(array $b): array {
    require_perm('settings.manage'); rel_sync();
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
