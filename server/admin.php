<?php
/**
 * أدوات الإدارة: سجل العمليات وفحص سلامته، أرشيف المرفقات واسترجاعها، التصدير والنسخ الاحتياطي، والاستيراد من النظام القديم
 */
declare(strict_types=1);

function audit_list(array $b): array {
    require_perm('audit.view');
    $lim = min(1000, max(50, (int)($b['limit'] ?? 300)));
    $ref = (string)($b['ref'] ?? '');
    $rows = $ref !== '' ? q('SELECT id, at, ref, action, detail, actor, ip FROM audit WHERE ref=? ORDER BY id DESC LIMIT ' . $lim, [$ref])->fetchAll()
        : q('SELECT id, at, ref, action, detail, actor, ip FROM audit ORDER BY id DESC LIMIT ' . $lim)->fetchAll();
    return ['ok' => true, 'rows' => $rows, 'integrity' => audit_verify()];
}
/* المرفقات المؤرشفة لمنسوب (الملفات المستبدلة) — يمكن استرجاعها */
function file_history(array $b): array {
    require_perm('staff.edit');
    $ref = (string)($b['ref'] ?? '');
    $out = array_map(function ($f) {
        return ['id' => $f['id'], 'kind' => $f['kind'], 'title' => $f['kind'][0] === '_' ? 'بطاقة المنسوب' : col_title($f['kind']), 'name' => $f['name'], 'size' => (int)$f['size'],
            'at' => substr($f['created_at'], 0, 16), 'by' => $f['created_by'], 'archivedAt' => $f['archived_at'] ? substr($f['archived_at'], 0, 16) : '', 'archivedBy' => (string)$f['archived_by'], 'url' => file_url($f['id'])];
    }, files_of($ref, null, true));
    return ['ok' => true, 'files' => $out];
}
function file_restore(array $b): array {
    $u = require_perm('staff.files');
    $f = q1('SELECT * FROM files WHERE id=?', [(string)($b['id'] ?? '')]);
    if (!$f || !$f['archived_at']) throw new HttpError('not_found', 404);
    if (!has_perm($u, 'finance.view') && in_array($f['kind'], FINANCE_KEYS, true)) throw new HttpError('forbidden', 403);
    q('UPDATE files SET archived_at=?, archived_by=? WHERE ref=? AND kind=? AND archived_at IS NULL', [now(), $u['_label'], $f['ref'], $f['kind']]);
    q('UPDATE files SET archived_at=NULL, archived_by=NULL WHERE id=?', [$f['id']]);
    audit_log($f['ref'], 'استرجاع مرفق من الأرشيف', $u['_label'] . ' · ' . $f['name'], $u['_label']);
    return ['ok' => true];
}

/* نسخة احتياطية كاملة: قاعدة البيانات (JSON مضغوط) في مجلد التخزين الخاص؛ تُحفظ آخر ٣٠ نسخة */
function make_backup(string $actor = 'النظام'): array {
    $dump = ['version' => BHR_VERSION, 'at' => now(), 'tables' => []];
    foreach (['staff', 'files', 'users', 'audit', 'messages', 'settings', 'requests', 'attendance', 'att_batches', 'news', 'news_reads'] as $t) {
        $rows = q('SELECT * FROM ' . $t)->fetchAll();
        if ($t === 'settings') $rows = array_values(array_filter($rows, function ($r) { return !in_array($r['k'], ['app_secret'], true); }));
        $dump['tables'][$t] = $rows;
    }
    $dir = storage_dir('backups');
    $name = 'bonyan-hr-' . date('Y-m-d-His') . '.json.gz';
    file_put_contents($dir . '/' . $name, gzencode(json_encode($dump, JSON_UNESCAPED_UNICODE), 9), LOCK_EX);
    @chmod($dir . '/' . $name, 0640);
    $all = glob($dir . '/bonyan-hr-*.json.gz') ?: []; sort($all);
    while (count($all) > 30) @unlink(array_shift($all));
    audit_log('', 'نسخة احتياطية', $name, $actor);
    return ['ok' => true, 'name' => $name, 'size' => filesize($dir . '/' . $name), 'staff' => count($dump['tables']['staff'])];
}
function backups_list(): array {
    require_perm('backup.run');
    $dir = storage_dir('backups'); $out = [];
    foreach (array_reverse(glob($dir . '/bonyan-hr-*.json.gz') ?: []) as $p) $out[] = ['name' => basename($p), 'size' => filesize($p), 'at' => date('Y-m-d H:i', filemtime($p))];
    $used = 0; foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(storage_dir(), FilesystemIterator::SKIP_DOTS)) as $f) $used += $f->getSize();
    return ['ok' => true, 'backups' => $out, 'storageBytes' => $used, 'files' => (int)q1('SELECT COUNT(*) n FROM files')['n'], 'staff' => (int)q1('SELECT COUNT(*) n FROM staff')['n']];
}
function backup_now(): array { $u = require_perm('backup.run'); make_backup($u['_label']); return backups_list(); }
function backup_download(): void {
    $u = require_perm('backup.run');
    $name = basename((string)($_GET['name'] ?? ''));
    if (!preg_match('/^bonyan-hr-[\d-]+\.json\.gz$/', $name)) throw new HttpError('not_found', 404);
    $p = storage_dir('backups') . '/' . $name;
    if (!is_file($p)) throw new HttpError('not_found', 404);
    audit_log('', 'تنزيل نسخة احتياطية', $name, $u['_label']);
    header_remove('Content-Type');
    header('Content-Type: application/gzip');
    header('Content-Disposition: attachment; filename="' . $name . '"');
    header('Content-Length: ' . filesize($p));
    readfile($p);
}

/* ============================================================ الاستيراد من النظام القديم (Google Sheets + Drive)
   يُستدعى من دالة migrateToHostinger في Apps Script بمفتاح import_token من ملف الإعدادات، ثم يُفرَّغ المفتاح بعد النقل */
function import_check(array $b): void {
    $t = (string)cfg('import_token');
    if (strlen($t) < 24 || !hash_equals($t, (string)($b['importToken'] ?? ''))) { usleep(800000); throw new HttpError('forbidden', 403); }
}
function import_row(array $b): array {
    import_check($b);
    $x = (array)($b['row'] ?? []);
    $ref = strtoupper(trim((string)($x['ref'] ?? '')));
    if (!preg_match('/^[A-Z0-9-]{6,40}$/', $ref)) throw new HttpError('bad_ref');
    $d = [];
    foreach (staff_cols() as [$k, , $t]) {
        if (in_array($k, ['ref', 'status', 'createdAt', 'updatedAt', 'folder', 'folderId'], true)) continue;
        $v = $x['data'][$k] ?? '';
        if ($t === 'f') { if (is_string($v) && trim($v) === 'لا يوجد') $d[$k] = 'لا يوجد'; continue; }
        if ($t === 'n') { try { $n = parse_num(is_array($v) ? '' : $v); } catch (HttpError $e) { $n = null; } $d[$k] = $n === null ? '' : $n; continue; }
        if ($t === 'd') { $d[$k] = valid_date(substr(trim((string)$v), 0, 10)); continue; }
        $v = is_array($v) ? '' : (string)$v;
        if (strpos($v, "'") === 0 && preg_match("/^'[=+\-@]/", $v)) $v = substr($v, 1);
        $d[$k] = in_array($k, ['workCountryCode', 'nationalityCode'], true) ? cc_($v) : safe_text($v);
    }
    $kids = [];
    foreach (KIDS as $kk => [, , $n]) {
        $kids[$kk] = [];
        foreach ((array)($x[$kk] ?? []) as $r) { $o = []; for ($i = 0; $i < $n; $i++) $o[] = safe_text($r[$i] ?? ''); if (implode('', $o) !== '') $kids[$kk][] = $o; }
    }
    $fix = function ($s) { $s = trim((string)$s); return preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?/', $s) ? substr($s . ':00', 0, 19) . (strlen($s) <= 10 ? ' 00:00:00' : '') : now(); };
    $created = substr($fix($x['createdAt'] ?? ''), 0, 19); $updatedAt = substr($fix($x['updatedAt'] ?? ''), 0, 19);
    staff_put(['ref' => $ref, 'status' => safe_text($x['status'] ?? ST_DONE) ?: ST_DONE, 'created_at' => $created, 'updated_at' => $updatedAt, 'data' => $d] + $kids);
    if (preg_match('/-(\d{4})-(\d{4})$/', $ref, $m)) {
        $key = 'seq_' . $m[1]; $cur = (int)(setting($key) ?? 0);
        if ((int)$m[2] > $cur) setting_set($key, (string)(int)$m[2]);
    }
    /* إعادة الاستيراد لنفس المنسوب تستبدل ملفاته المستوردة سابقًا (لا تتكرر) */
    foreach (q('SELECT id, path FROM files WHERE ref=? AND created_by=?', [$ref, 'استيراد من النظام القديم'])->fetchAll() as $old) {
        $pp = storage_dir() . '/' . $old['path']; if (is_file($pp)) @unlink($pp);
    }
    q('DELETE FROM files WHERE ref=? AND created_by=?', [$ref, 'استيراد من النظام القديم']);
    kv_del('countries');
    audit_log($ref, 'استيراد من النظام القديم', staff_name(staff_get($ref)), 'الاستيراد');
    return ['ok' => true, 'ref' => $ref];
}
function import_file(array $b): array {
    import_check($b);
    $ref = strtoupper((string)($b['ref'] ?? ''));
    if (!staff_get($ref)) throw new HttpError('not_found', 404);
    $kind = (string)($b['kind'] ?? '');
    if (col_type($kind) !== 'f' && !in_array($kind, ['_card_gif', '_card_jpg'], true)) throw new HttpError('bad_kind');
    $allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $name = preg_replace('/\.[a-z0-9]{2,5}$/i', '', clean_name($b['name'] ?? $kind));
    $f = file_store($ref, $kind, (string)($b['data'] ?? ''), max(1, (int)($b['idx'] ?? 1)), $name, 'استيراد من النظام القديم', false, $allowed);
    return ['ok' => true, 'id' => $f['id']];
}
/* للتحقق بعد النقل: ما حُفظ فعلًا لكل منسوب (القيم + عدد الملفات + عدد صفوف المؤهلات والخبرات واللغات) */
function import_stats(array $b): array {
    import_check($b);
    $files = [];
    foreach (q("SELECT ref, kind, COUNT(*) n FROM files WHERE archived_at IS NULL AND LEFT(kind, 1) <> '_' GROUP BY ref, kind") as $f) $files[$f['ref']][$f['kind']] = (int)$f['n'];
    $out = [];
    foreach (q('SELECT ref FROM staff ORDER BY id')->fetchAll() as $x) {
        $r = staff_get($x['ref']);
        $d = $r['data'];
        foreach (staff_cols() as [$k, , $t]) if ($t === 'n' && isset($d[$k]) && $d[$k] !== '') $d[$k] = fmt_num($d[$k]);
        $out[$r['ref']] = ['status' => $r['status'], 'data' => $d, 'files' => $files[$r['ref']] ?? (object)[],
            'kids' => ['quals' => $r['quals'], 'exp' => $r['exp'], 'langs' => $r['langs']]];
    }
    return ['ok' => true, 'rows' => $out, 'audit' => audit_verify()];
}
function import_audit(array $b): array {
    import_check($b);
    $n = 0;
    foreach ((array)($b['rows'] ?? []) as $r) { if (!is_array($r)) continue; audit_log((string)($r[1] ?? ''), 'سجل النظام القديم · ' . mb_substr((string)($r[2] ?? ''), 0, 120), trim((string)($r[0] ?? '')) . ' · ' . (string)($r[3] ?? ''), 'الاستيراد'); $n++; }
    return ['ok' => true, 'n' => $n];
}
function import_mailed(array $b): array {
    import_check($b);
    $mm = json_decode(setting('mailed', '{}'), true) ?: [];
    foreach ((array)($b['mailed'] ?? []) as $k => $v) $mm[(string)$k] = (string)$v;
    setting_set('mailed', json_encode($mm, JSON_UNESCAPED_UNICODE));
    return ['ok' => true];
}

/* فحص الجاهزية لصفحة «النظام» */
function health(): array {
    $u = require_perm('users.manage');
    $c = cfg(); $checks = [];
    $checks[] = ['قاعدة البيانات', true, 'متصلة · ' . q1('SELECT VERSION() v')['v']];
    try { $dir = storage_dir(); $w = is_writable($dir); $checks[] = ['مجلد التخزين الخاص', $w, $w ? 'خارج المجلد العام وقابل للكتابة' : 'غير قابل للكتابة']; }
    catch (HttpError $e) { $checks[] = ['مجلد التخزين الخاص', false, $e->getMessage()]; }
    $smtp = (array)($c['smtp'] ?? []);
    $checks[] = ['البريد (SMTP)', !empty($smtp['user']) && !empty($smtp['pass']), !empty($smtp['user']) ? 'يرسل من ' . ($smtp['from'] ?? $smtp['user']) : 'لم يُضبط'];
    $checks[] = ['وضع التجربة للبريد', ($c['mail_only_to'] ?? '') === '', ($c['mail_only_to'] ?? '') === '' ? 'متوقف — الرسائل تصل أصحابها' : 'كل الرسائل تذهب إلى ' . $c['mail_only_to']];
    $checks[] = ['مفتاح الاستيراد', strlen((string)($c['import_token'] ?? '')) === 0, strlen((string)($c['import_token'] ?? '')) ? 'ما زال مفعّلًا — أفرغه بعد نقل البيانات' : 'مغلق'];
    $last = glob(storage_dir('backups') . '/bonyan-hr-*.json.gz') ?: []; sort($last); $lb = end($last);
    $fresh = $lb && filemtime($lb) > time() - 2 * 86400;
    $checks[] = ['النسخ الاحتياطي اليومي', (bool)$fresh, $lb ? 'آخر نسخة: ' . date('Y-m-d H:i', filemtime($lb)) : 'لا توجد نسخة بعد — فعّل المهمة المجدولة'];
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $checks[] = ['الاتصال المشفّر HTTPS', $https, $https ? 'مفعّل' : 'غير مفعّل'];
    $integrity = audit_verify();
    $checks[] = ['سلامة سجل العمليات', $integrity['ok'], $integrity['ok'] ? 'سليم · ' . $integrity['rows'] . ' عملية' : 'تغيّر سطر رقم ' . $integrity['brokenAt']];
    /* أين تُحفظ البيانات وكم حجمها */
    $fs = q1("SELECT COUNT(*) n, COALESCE(SUM(size),0) b, SUM(archived_at IS NOT NULL) a FROM files WHERE LEFT(kind,1) <> '_'");
    $home = preg_match('~^(/home/[^/]+)~', storage_dir(), $m) ? $m[1] : '';
    $stats = [
        'staff' => (int)q1('SELECT COUNT(*) n FROM staff')['n'],
        'files' => (int)$fs['n'], 'filesBytes' => (int)$fs['b'], 'archived' => (int)$fs['a'],
        'audit' => (int)q1('SELECT COUNT(*) n FROM audit')['n'], 'backups' => count($last),
        'db' => (string)(cfg('db')['name'] ?? ''), 'storage' => $home !== '' ? str_replace($home, '~', storage_dir()) : 'bonyan-hr-private/storage',
        'server' => 'Hostinger · ' . php_uname('n'), 'users' => (int)q1('SELECT COUNT(*) n FROM users WHERE active=1')['n'],
    ];
    return ['ok' => true, 'checks' => array_map(function ($x) { return ['name' => $x[0], 'ok' => (bool)$x[1], 'note' => $x[2]]; }, $checks), 'stats' => $stats, 'version' => BHR_VERSION, 'php' => PHP_VERSION];
}
