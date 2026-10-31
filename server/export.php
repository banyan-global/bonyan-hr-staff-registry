<?php
/**
 * التصدير والتنزيل من الموقع مباشرة (بديل جدول Google ومجلد Drive)
 * - ملف Excel كامل: المنسوبون + المؤهلات + الخبرات + اللغات (+ سجل العمليات لمن يملك صلاحيته)
 * - ملف مضغوط لكل مرفقات منسوب واحد
 * الصلاحيات تُطبَّق كما في اللوحة: الرواتب والحسابات البنكية لا تظهر إلا لمن يملك صلاحية الرواتب.
 */
declare(strict_types=1);

/* ============================================================ كاتب XLSX بسيط (بلا مكتبات) */
function xlsx_col(int $i): string { $s = ''; $i++; while ($i > 0) { $m = ($i - 1) % 26; $s = chr(65 + $m) . $s; $i = intdiv($i - 1, 26); } return $s; }
function xlsx_x(string $v): string {
    $v = preg_replace('/[^\x{9}\x{A}\x{D}\x{20}-\x{D7FF}\x{E000}-\x{FFFD}\x{10000}-\x{10FFFF}]/u', '', $v) ?? '';
    return htmlspecialchars($v, ENT_QUOTES | ENT_XML1, 'UTF-8');
}
function xlsx_sheet(array $rows, array $widths): string {
    $cols = '';
    foreach ($widths as $i => $w) $cols .= '<col min="' . ($i + 1) . '" max="' . ($i + 1) . '" width="' . $w . '" customWidth="1"/>';
    $x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' .
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' .
        '<sheetViews><sheetView workbookViewId="0" rightToLeft="1"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' .
        '<sheetFormatPr defaultRowHeight="18"/>' . ($cols ? '<cols>' . $cols . '</cols>' : '') . '<sheetData>';
    foreach ($rows as $ri => $row) {
        $x .= '<row r="' . ($ri + 1) . '"' . ($ri === 0 ? ' ht="24" customHeight="1"' : '') . '>';
        foreach (array_values($row) as $ci => $v) {
            $ref = xlsx_col($ci) . ($ri + 1);
            $s = $ri === 0 ? ' s="1"' : ' s="2"';
            /* كل القيم نصوص: لا صيغ ولا تحويل تلقائي لأرقام الجوازات والحسابات */
            $x .= '<c r="' . $ref . '" t="inlineStr"' . $s . '><is><t xml:space="preserve">' . xlsx_x((string)$v) . '</t></is></c>';
        }
        $x .= '</row>';
    }
    $last = $rows ? xlsx_col(max(0, count($rows[0]) - 1)) . count($rows) : 'A1';
    return $x . '</sheetData><autoFilter ref="A1:' . $last . '"/></worksheet>';
}
function xlsx_build(array $sheets): string {
    if (!class_exists('ZipArchive')) throw new HttpError('zip_unavailable', 500);
    $tmp = tempnam(sys_get_temp_dir(), 'bhrx');
    $z = new ZipArchive(); $z->open($tmp, ZipArchive::OVERWRITE);
    $ct = ''; $wb = ''; $rels = '';
    $i = 0;
    foreach ($sheets as $name => [$rows, $widths]) {
        $i++;
        $z->addFromString('xl/worksheets/sheet' . $i . '.xml', xlsx_sheet($rows, $widths));
        $ct .= '<Override PartName="/xl/worksheets/sheet' . $i . '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
        $wb .= '<sheet name="' . xlsx_x(mb_substr(str_replace(['[', ']', ':', '*', '?', '/', '\\'], ' ', $name), 0, 31)) . '" sheetId="' . $i . '" r:id="rId' . $i . '"/>';
        $rels .= '<Relationship Id="rId' . $i . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' . $i . '.xml"/>';
    }
    $z->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' . $ct . '</Types>');
    $z->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    $z->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><workbookViews><workbookView rightToLeft="1"/></workbookViews><sheets>' . $wb . '</sheets></workbook>');
    $z->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . $rels . '<Relationship Id="rId' . ($i + 1) . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    /* تنسيق بهوية بنيان: رأس كحلي بخط أبيض عريض، وحدود خفيفة، ومحاذاة لليمين */
    $z->addFromString('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' .
        '<fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts>' .
        '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF16294A"/><bgColor indexed="64"/></patternFill></fill></fills>' .
        '<borders count="2"><border/><border><left style="thin"><color rgb="FFE3E8F0"/></left><right style="thin"><color rgb="FFE3E8F0"/></right><top style="thin"><color rgb="FFE3E8F0"/></top><bottom style="thin"><color rgb="FFE3E8F0"/></bottom></border></borders>' .
        '<cellStyleXfs count="1"><xf/></cellStyleXfs>' .
        '<cellXfs count="3"><xf/><xf fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf borderId="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top" wrapText="1"/></xf></cellXfs>' .
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
    $z->close();
    $bin = (string)file_get_contents($tmp); @unlink($tmp);
    return $bin;
}
function send_download(string $bin, string $name, string $mime): void {
    header_remove('Content-Type');
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . strlen($bin));
    header("Content-Disposition: attachment; filename=\"" . preg_replace('/[^A-Za-z0-9._-]/', '-', $name) . "\"; filename*=UTF-8''" . rawurlencode($name));
    header('Cache-Control: private, no-store');
    echo $bin;
}

/* ============================================================ تنزيل Excel كامل */
function export_xlsx(): void {
    $u = require_perm('staff.view');
    $fin = has_perm($u, 'finance.view');
    $cols = array_values(array_filter(staff_cols(), function ($c) { return $c[0] !== 'folderId' && $c[0] !== 'folder'; }));
    $files = files_by_ref();
    $head = array_map(function ($c) { return $c[1]; }, $cols);
    $main = [$head]; $kids = ['quals' => [KIDS['quals'][1]], 'exp' => [KIDS['exp'][1]], 'langs' => [KIDS['langs'][1]]];
    foreach (q('SELECT ref FROM staff ORDER BY id')->fetchAll() as $x) {
        $r = staff_get($x['ref']);
        $d = display_row($r, $files[$r['ref']] ?? [], $fin);
        $main[] = array_map(function ($c) use ($d) {
            $v = $d[$c[0]] ?? '';
            if (is_array($v)) return $v === ['#restricted'] ? 'محجوب' : (count($v) ? count($v) . ' ملف' : '');
            return $v;
        }, $cols);
        foreach (array_keys(KIDS) as $k) foreach (kid_rows($r, $k) as $kr) $kids[$k][] = $kr;
    }
    $w = array_map(function ($c) { return in_array($c[2], ['d', 'n', 'f'], true) ? 14 : 22; }, $cols);
    $sheets = [
        'المنسوبون' => [$main, $w],
        'المؤهلات' => [$kids['quals'], [22, 26, 16, 20, 26, 14, 12, 12]],
        'الخبرات' => [$kids['exp'], [22, 26, 26, 20, 14, 10, 10]],
        'اللغات' => [$kids['langs'], [22, 26, 16, 14]],
    ];
    if (has_perm($u, 'audit.view')) {
        $log = [['الوقت', 'الرقم المرجعي', 'العملية', 'التفاصيل', 'بواسطة']];
        foreach (q('SELECT at, ref, action, detail, actor FROM audit ORDER BY id DESC LIMIT 5000') as $a) $log[] = [substr($a['at'], 0, 16), $a['ref'], $a['action'], $a['detail'], $a['actor']];
        $sheets['سجل العمليات'] = [$log, [17, 22, 28, 60, 22]];
    }
    audit_log('', 'تنزيل ملف Excel كامل', count($main) - 1 . ' منسوبًا' . ($fin ? ' · مع الرواتب' : ' · بلا الرواتب'), $u['_label']);
    send_download(xlsx_build($sheets), 'Bonyan-HR-' . date('Y-m-d') . '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/* ============================================================ تنزيل كل مرفقات منسوب في ملف مضغوط */
function staff_zip(): void {
    $u = require_perm('staff.view');
    $ref = strtoupper((string)($_GET['ref'] ?? ''));
    $r = staff_get($ref); if (!$r) throw new HttpError('not_found', 404);
    if (!class_exists('ZipArchive')) throw new HttpError('zip_unavailable', 500);
    $tmp = tempnam(sys_get_temp_dir(), 'bhrz');
    $z = new ZipArchive(); $z->open($tmp, ZipArchive::OVERWRITE);
    $n = 0; $used = [];
    foreach (files_of($ref) as $f) {
        if ($f['kind'][0] === '_') continue;
        if ($f['kind'] === 'bankProof' && !has_perm($u, 'finance.view')) continue;
        $base = clean_name(col_title($f['kind']) . ($f['idx'] > 1 ? ' ' . $f['idx'] : ''));
        $nm = $base . '.' . mime_ext($f['mime']); $k = 2;
        while (isset($used[$nm])) $nm = $base . ' (' . $k++ . ').' . mime_ext($f['mime']);
        $used[$nm] = 1;
        try { $z->addFromString($nm, file_bytes($f)); $n++; } catch (Throwable $e) { }
    }
    if (!$n) $z->addFromString('لا توجد مرفقات.txt', 'لا توجد مرفقات لهذا المنسوب.');
    $z->close();
    $bin = (string)file_get_contents($tmp); @unlink($tmp);
    audit_log($ref, 'تنزيل كل المرفقات', $n . ' ملف', $u['_label']);
    send_download($bin, $ref . ' - ' . clean_name(staff_name($r)) . '.zip', 'application/zip');
}
