<?php
/**
 * الوحدات المتكاملة: إعدادات المنصة (إظهار/إخفاء) · أرصدة الإجازات · الحضور والانصراف · التعاميم
 * كل ما يخص المنسوب يُفحص هنا في الخادم أيضًا (إخفاء قسم في الواجهة لا يكفي وحده).
 */
declare(strict_types=1);

/* ============================================================ إعدادات المنصة */
const SITE_DEFAULTS = [
    'modules' => ['reqs' => true, 'forms' => true, 'payroll' => true, 'att' => true, 'news' => true, 'org' => true, 'reports' => true],
    'home' => ['hero' => true, 'kpis' => true, 'todo' => true, 'qa' => true, 'events' => true, 'charts' => true, 'quality' => true, 'cal' => true, 'ents' => true, 'recent' => true, 'log' => true],
    'staff' => ['card' => true, 'docs' => true, 'pay' => true, 'reqs' => true, 'balance' => true, 'att' => true, 'news' => true, 'update' => true],
    'leave' => ['annual' => 30, 'prorate' => true, 'kinds' => ['اعتيادية']],
    'work' => ['start' => '08:00', 'end' => '16:00', 'grace' => 15, 'weekend' => [5, 6]],
];
function site(): array {
    static $c = null; if ($c !== null) return $c;
    $s = json_decode((string)(setting('site') ?: ''), true); $s = is_array($s) ? $s : [];
    $c = SITE_DEFAULTS;
    foreach ($c as $g => $vals) if (isset($s[$g]) && is_array($s[$g])) foreach ($vals as $k => $def) if (array_key_exists($k, $s[$g])) $c[$g][$k] = $s[$g][$k];
    return $c;
}
function site_on(string $g, string $k): bool { return !empty(site()[$g][$k]); }
/* قسم يخص المنسوب: يجب أن تكون الوحدة مفعّلة وعنصر البوابة ظاهرًا */
function staff_can_see(string $k): bool { $mod = ['reqs' => 'reqs', 'att' => 'att', 'news' => 'news'][$k] ?? null; return site_on('staff', $k) && (!$mod || site_on('modules', $mod)); }
function site_get(): array { $u = current_user(); if (!$u) throw new HttpError('auth_required', 401); return ['ok' => true, 'site' => site(), 'canEdit' => has_perm($u, 'settings.manage')]; }
function site_save(array $b): array {
    $me = require_perm('settings.manage');
    $in = is_array($b['site'] ?? null) ? $b['site'] : [];
    $o = site();
    foreach (['modules', 'home', 'staff'] as $g) foreach (array_keys(SITE_DEFAULTS[$g]) as $k) if (isset($in[$g][$k])) $o[$g][$k] = (bool)$in[$g][$k];
    if (isset($in['leave'])) {
        $L = $in['leave'];
        $o['leave']['annual'] = max(0, min(90, (int)($L['annual'] ?? 30)));
        $o['leave']['prorate'] = !empty($L['prorate']);
        $kinds = array_values(array_intersect(LEAVE_KINDS, (array)($L['kinds'] ?? [])));
        $o['leave']['kinds'] = $kinds ?: ['اعتيادية'];
    }
    if (isset($in['work'])) {
        $W = $in['work']; $t = fn($v, $d) => preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string)$v) ? (string)$v : $d;
        $o['work']['start'] = $t($W['start'] ?? '', '08:00'); $o['work']['end'] = $t($W['end'] ?? '', '16:00');
        if ($o['work']['end'] <= $o['work']['start']) throw new HttpError('وقت نهاية الدوام يجب أن يكون بعد بدايته');
        $o['work']['grace'] = max(0, min(120, (int)($W['grace'] ?? 15)));
        $o['work']['weekend'] = array_values(array_unique(array_filter(array_map('intval', (array)($W['weekend'] ?? [])), fn($d) => $d >= 0 && $d <= 6)));
    }
    setting_set('site', json_encode($o, JSON_UNESCAPED_UNICODE));
    audit_log('', 'تعديل إعدادات المنصة', '', $me['_label']);
    return ['ok' => true, 'site' => $o, 'canEdit' => true];
}

/* ============================================================ أرصدة الإجازات */
/* الاستحقاق السنوي (يُحتسب بالتناسب في سنة المباشرة إن فُعّل)، والمستهلك = الإجازات المعتمدة من الأنواع المخصومة في السنة الحالية */
function leave_balance(string $ref, ?array $rec = null): array {
    $L = site()['leave']; $y = (int)date('Y');
    $rec = $rec ?? staff_get($ref); $start = (string)($rec['data']['startDate'] ?? '');
    $ent = (float)$L['annual'];
    if (preg_match('/^(\d{4})-(\d{2})-\d{2}$/', $start, $m)) {
        if ((int)$m[1] > $y) $ent = 0;
        elseif ((int)$m[1] === $y && $L['prorate']) $ent = round($L['annual'] * (13 - (int)$m[2]) / 12, 1);
    }
    $used = 0; $pend = 0; $byKind = [];
    foreach (q("SELECT status, data FROM requests WHERE ref=? AND type='leave' AND status IN ('approved','pending')", [$ref])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: []; if (substr((string)($d['from'] ?? ''), 0, 4) !== (string)$y) continue;
        $days = (int)($d['days'] ?? 0); $k = (string)($d['kind'] ?? '');
        if ($r['status'] === 'approved') $byKind[$k] = ($byKind[$k] ?? 0) + $days;
        if (!in_array($k, $L['kinds'], true)) continue;
        if ($r['status'] === 'approved') $used += $days; else $pend += $days;
    }
    return ['year' => $y, 'entitled' => $ent, 'used' => $used, 'pending' => $pend, 'left' => max(0, $ent - $used), 'byKind' => $byKind, 'kinds' => $L['kinds']];
}
function leave_balances(): array {
    require_perm('staff.view');
    $out = [];
    foreach (q('SELECT ref FROM staff ORDER BY id')->fetchAll() as $x) { $r = staff_get($x['ref']); if ($r) $out[$x['ref']] = leave_balance($x['ref'], $r); }
    return ['ok' => true, 'rows' => $out, 'policy' => site()['leave']];
}

/* ============================================================ الحضور والانصراف */
/* قراءة ملف جهاز البصمة: CSV أو Excel (xlsx) — في الخادم دون مكتبات خارجية */
function att_read_rows(string $name, string $bin): array {
    $rows = [];
    if (preg_match('/\.xlsx$/i', $name) || substr($bin, 0, 2) === 'PK') {
        if (!class_exists('ZipArchive')) throw new HttpError('قراءة Excel غير متاحة على الخادم؛ احفظ الملف بصيغة CSV');
        $tmp = tempnam(sys_get_temp_dir(), 'att'); file_put_contents($tmp, $bin);
        $z = new ZipArchive(); if ($z->open($tmp) !== true) { @unlink($tmp); throw new HttpError('تعذّر فتح ملف Excel'); }
        $ss = [];
        if (($x = $z->getFromName('xl/sharedStrings.xml')) !== false) { $sx = @simplexml_load_string($x); if ($sx) foreach ($sx->si as $si) { $t = ''; if (isset($si->t)) $t = (string)$si->t; else foreach ($si->r as $rr) $t .= (string)$rr->t; $ss[] = $t; } }
        $sheet = $z->getFromName('xl/worksheets/sheet1.xml'); $z->close(); @unlink($tmp);
        if ($sheet === false) throw new HttpError('لم نجد ورقة بيانات في الملف');
        $sx = @simplexml_load_string($sheet); if (!$sx) throw new HttpError('ملف Excel غير صالح');
        foreach ($sx->sheetData->row as $row) {
            $line = [];
            foreach ($row->c as $c) {
                $ref = (string)$c['r']; $col = 0; for ($i = 0; $i < strlen($ref) && ctype_alpha($ref[$i]); $i++) $col = $col * 26 + (ord(strtoupper($ref[$i])) - 64);
                $t = (string)$c['t']; $v = isset($c->v) ? (string)$c->v : (isset($c->is->t) ? (string)$c->is->t : '');
                if ($t === 's') $v = $ss[(int)$v] ?? '';
                $line[$col - 1] = $v;
            }
            if ($line) { $mx = max(array_keys($line)); $full = []; for ($i = 0; $i <= $mx; $i++) $full[] = trim((string)($line[$i] ?? '')); $rows[] = $full; }
            if (count($rows) > 60000) break;
        }
    } else {
        $txt = $bin;
        if (substr($txt, 0, 3) === "\xEF\xBB\xBF") $txt = substr($txt, 3);
        elseif (substr($txt, 0, 2) === "\xFF\xFE" || substr($txt, 0, 2) === "\xFE\xFF") $txt = mb_convert_encoding($txt, 'UTF-8', 'UTF-16');
        elseif (!mb_check_encoding($txt, 'UTF-8')) $txt = mb_convert_encoding($txt, 'UTF-8', 'Windows-1256');
        $first = strtok($txt, "\n"); $sep = substr_count((string)$first, "\t") > substr_count((string)$first, ',') ? "\t" : (substr_count((string)$first, ';') > substr_count((string)$first, ',') ? ';' : ',');
        $h = fopen('php://memory', 'r+'); fwrite($h, $txt); rewind($h);
        while (($r = fgetcsv($h, 0, $sep, '"', '\\')) !== false) { if ($r === [null]) continue; $rows[] = array_map(fn($v) => trim((string)$v), $r); if (count($rows) > 60000) break; }
        fclose($h);
    }
    return array_values(array_filter($rows, fn($r) => implode('', $r) !== ''));
}
/* تاريخ ووقت من صيغ الأجهزة الشائعة (ومنها رقم Excel التسلسلي) */
function att_parse_dt(string $v): array {
    $v = trim(to_ascii_digits($v)); if ($v === '') return ['', ''];
    if (is_numeric($v) && (float)$v > 20000 && (float)$v < 80000) { $ts = (int)round(((float)$v - 25569) * 86400); return [gmdate('Y-m-d', $ts), (fmod((float)$v, 1) > 0 ? gmdate('H:i', $ts) : '')]; }
    if (is_numeric($v) && (float)$v >= 0 && (float)$v < 1) { $m = (int)round((float)$v * 1440); return ['', sprintf('%02d:%02d', intdiv($m, 60) % 24, $m % 60)]; }
    $d = ''; $t = '';
    if (preg_match('/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/', $v, $m)) $d = sprintf('%04d-%02d-%02d', $m[1], $m[2], $m[3]);
    elseif (preg_match('/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/', $v, $m)) { $a = (int)$m[1]; $b = (int)$m[2]; [$dd, $mm] = $a > 12 ? [$a, $b] : ($b > 12 ? [$b, $a] : [$a, $b]); $d = sprintf('%04d-%02d-%02d', $m[3], $mm, $dd); }
    if (preg_match('/(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm]|ص|م)?/u', $v, $m)) {
        $hh = (int)$m[1]; $ap = strtolower($m[3] ?? '');
        if (($ap === 'pm' || $ap === 'م') && $hh < 12) $hh += 12; if (($ap === 'am' || $ap === 'ص') && $hh === 12) $hh = 0;
        $t = sprintf('%02d:%s', $hh % 24, $m[2]);
    }
    if ($d && !checkdate((int)substr($d, 5, 2), (int)substr($d, 8, 2), (int)substr($d, 0, 4))) $d = '';
    return [$d, $t];
}
function att_norm(string $s): string { return mb_strtolower(preg_replace('/\s+/u', ' ', trim(to_ascii_digits($s)))); }
/* مطابقة معرّف الجهاز بالمنسوب: الربط المحفوظ ← الرقم الوظيفي ← الهوية/الجواز ← الاسم */
function att_index(): array {
    $map = json_decode((string)(setting('att_map') ?: ''), true) ?: [];
    $by = ['map' => $map, 'id' => [], 'name' => []];
    foreach (q('SELECT ref, data FROM staff')->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: [];
        foreach (['employeeNo', 'nationalIdNo', 'iqamaNo', 'passportNo'] as $k) { $v = att_norm((string)($d[$k] ?? '')); if ($v !== '') $by['id'][ltrim($v, '0') ?: $v] = $r['ref']; }
        $by['id'][att_norm($r['ref'])] = $r['ref'];
        foreach (['fullNameAr', 'fullNameLatin'] as $k) { $v = att_norm((string)($d[$k] ?? '')); if ($v !== '') $by['name'][$v] = $r['ref']; }
    }
    return $by;
}
function att_match(array $ix, string $id, string $name): ?string {
    $id = att_norm($id); $name = att_norm($name);
    if ($id !== '' && isset($ix['map']['id:' . $id])) return $ix['map']['id:' . $id];
    if ($name !== '' && isset($ix['map']['nm:' . $name])) return $ix['map']['nm:' . $name];
    if ($id !== '' && isset($ix['id'][ltrim($id, '0') ?: $id])) return $ix['id'][ltrim($id, '0') ?: $id];
    if ($name !== '' && isset($ix['name'][$name])) return $ix['name'][$name];
    return null;
}
/* ١) رفع الملف: يعيد العناوين وأول الصفوف واقتراح الأعمدة */
function att_upload(array $b): array {
    $me = require_perm('attendance.manage');
    $name = (string)($b['name'] ?? 'file.csv'); $bin = base64_decode((string)($b['b64'] ?? ''), true);
    if ($bin === false || $bin === '') throw new HttpError('الملف فارغ');
    if (strlen($bin) > 12 * 1024 * 1024) throw new HttpError('الملف أكبر من ١٢ ميغابايت');
    $rows = att_read_rows($name, $bin);
    if (count($rows) < 2) throw new HttpError('لم نجد صفوفًا في الملف');
    $head = $rows[0]; $tok = bin2hex(random_bytes(12));
    kv_put('att:' . $tok, json_encode(['name' => $name, 'rows' => $rows], JSON_UNESCAPED_UNICODE), 3600);
    $guess = ['id' => -1, 'name' => -1, 'dt' => -1, 'date' => -1, 'in' => -1, 'out' => -1, 'time' => -1];
    foreach ($head as $i => $h) {
        $x = att_norm($h);
        if ($guess['id'] < 0 && preg_match('/^(ac-?no\.?|no\.?|id|user ?id|emp(loyee)? ?(no|id|code)|enroll|الرقم|رقم الموظف|الرقم الوظيفي|كود)/u', $x)) $guess['id'] = $i;
        elseif ($guess['name'] < 0 && preg_match('/(name|الاسم|اسم)/u', $x)) $guess['name'] = $i;
        elseif ($guess['dt'] < 0 && preg_match('/(date ?time|datetime|التاريخ والوقت|time ?stamp|check ?time)/u', $x)) $guess['dt'] = $i;
        elseif ($guess['date'] < 0 && preg_match('/^(date|التاريخ|اليوم|day)/u', $x)) $guess['date'] = $i;
        elseif ($guess['in'] < 0 && preg_match('/(in|دخول|حضور|on ?duty|clock ?in)/u', $x) && !preg_match('/out/u', $x)) $guess['in'] = $i;
        elseif ($guess['out'] < 0 && preg_match('/(out|خروج|انصراف|off ?duty|clock ?out)/u', $x)) $guess['out'] = $i;
        elseif ($guess['time'] < 0 && preg_match('/^(time|الوقت)/u', $x)) $guess['time'] = $i;
    }
    return ['ok' => true, 'token' => $tok, 'name' => $name, 'head' => $head, 'sample' => array_slice($rows, 1, 6), 'total' => count($rows) - 1, 'guess' => $guess];
}
/* ٢) معاينة/استيراد بالأعمدة المختارة. dry=true يعيد الإحصاء وغير المطابقين فقط */
function att_import(array $b): array {
    $me = require_perm('attendance.manage');
    $raw = kv_get('att:' . preg_replace('/[^a-f0-9]/', '', (string)($b['token'] ?? '')));
    if (!$raw) throw new HttpError('انتهت مهلة الملف، ارفعه مرة أخرى');
    $F = json_decode($raw, true); $rows = array_slice($F['rows'], 1);
    $m = array_map('intval', (array)($b['map'] ?? []));
    $col = fn($r, $k) => isset($m[$k]) && $m[$k] >= 0 ? (string)($r[$m[$k]] ?? '') : '';
    if (($m['id'] ?? -1) < 0 && ($m['name'] ?? -1) < 0) throw new HttpError('اختر عمود رقم الموظف أو اسمه');
    if (($m['dt'] ?? -1) < 0 && ($m['date'] ?? -1) < 0) throw new HttpError('اختر عمود التاريخ');
    /* ربط يدوي جديد من المعاينة: معرّف الجهاز ← الرقم المرجعي */
    if (!empty($b['link']) && is_array($b['link'])) {
        $map = json_decode((string)(setting('att_map') ?: ''), true) ?: [];
        foreach ($b['link'] as $k => $ref) { $k = (string)$k; if (!preg_match('/^(id|nm):/', $k)) continue; if ($ref === '' || $ref === null) unset($map[$k]); elseif (staff_get((string)$ref)) $map[$k] = (string)$ref; }
        setting_set('att_map', json_encode($map, JSON_UNESCAPED_UNICODE));
    }
    $ix = att_index(); $days = []; $un = []; $bad = 0;
    foreach ($rows as $r) {
        $id = $col($r, 'id'); $nm = $col($r, 'name');
        if (($m['dt'] ?? -1) >= 0) [$d, $t] = att_parse_dt($col($r, 'dt')); else { [$d] = att_parse_dt($col($r, 'date')); $t = ''; }
        if ($d === '') { $bad++; continue; }
        $ref = att_match($ix, $id, $nm);
        if (!$ref) { $k = $id !== '' ? 'id:' . att_norm($id) : 'nm:' . att_norm($nm); $un[$k] = ['key' => $k, 'id' => $id, 'name' => $nm, 'n' => ($un[$k]['n'] ?? 0) + 1]; continue; }
        $key = $ref . '|' . $d; $cur = $days[$key] ?? ['ref' => $ref, 'day' => $d, 'in' => '', 'out' => ''];
        $pts = [];
        if (($m['in'] ?? -1) >= 0 || ($m['out'] ?? -1) >= 0) { [, $ti] = att_parse_dt($col($r, 'in')); [, $to] = att_parse_dt($col($r, 'out')); if ($ti) $pts[] = $ti; if ($to) $pts[] = $to; $cur['explicitOut'] = $to ?: ($cur['explicitOut'] ?? ''); }
        else { if ($t === '' && ($m['time'] ?? -1) >= 0) [, $t] = att_parse_dt($col($r, 'time')); if ($t) $pts[] = $t; }
        foreach ($pts as $p) { if ($cur['in'] === '' || $p < $cur['in']) $cur['in'] = $p; if ($cur['out'] === '' || $p > $cur['out']) $cur['out'] = $p; }
        $days[$key] = $cur;
    }
    $res = ['ok' => true, 'records' => count($days), 'staff' => count(array_unique(array_column($days, 'ref'))), 'unmatched' => array_values($un), 'badDates' => $bad,
        'from' => $days ? min(array_column($days, 'day')) : '', 'to' => $days ? max(array_column($days, 'day')) : ''];
    if (!empty($b['dry'])) return $res;
    $W = site()['work']; $batch = date('YmdHis') . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
    foreach ($days as $x) {
        $in = $x['in']; $out = $x['out'] !== $x['in'] ? $x['out'] : '';
        [$mins, $late, $early] = att_calc($in, $out, $W);
        q('INSERT INTO attendance (ref, day, in_time, out_time, minutes, late_min, early_min, source, batch, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE in_time=VALUES(in_time), out_time=VALUES(out_time), minutes=VALUES(minutes), late_min=VALUES(late_min), early_min=VALUES(early_min), source=VALUES(source), batch=VALUES(batch)',
            [$x['ref'], $x['day'], $in ?: null, $out ?: null, $mins, $late, $early, mb_substr((string)$F['name'], 0, 120), $batch, now()]);
    }
    q('INSERT INTO att_batches (id, file_name, records, staff, unmatched, from_day, to_day, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        [$batch, mb_substr((string)$F['name'], 0, 120), $res['records'], $res['staff'], count($un), $res['from'] ?: null, $res['to'] ?: null, $me['_label'], now()]);
    kv_del('att:' . (string)$b['token']);
    audit_log('', 'استيراد الحضور', $F['name'] . ' · ' . $res['records'] . ' يوم عمل · ' . $res['from'] . ' إلى ' . $res['to'], $me['_label']);
    return $res + ['batch' => $batch];
}
function att_calc(string $in, string $out, array $W): array {
    $mn = fn($t) => $t ? ((int)substr($t, 0, 2)) * 60 + (int)substr($t, 3, 2) : null;
    $i = $mn($in); $o = $mn($out); $s = $mn($W['start']); $e = $mn($W['end']);
    $mins = $i !== null && $o !== null && $o > $i ? $o - $i : 0;
    $late = $i !== null && $i > $s + (int)$W['grace'] ? $i - $s : 0;
    $early = $o !== null && $o < $e ? $e - $o : 0;
    return [$mins, $late, $early];
}
/* ملخص شهري: لكل منسوب أيام الحضور والتأخير والغياب (أيام العمل بلا بصمة ولا إجازة معتمدة) */
function att_month_rows(string $ym, ?string $only = null): array {
    if (!preg_match('/^\d{4}-\d{2}$/', $ym)) $ym = date('Y-m');
    $from = $ym . '-01'; $to = date('Y-m-t', strtotime($from)); $W = site()['work']; $today = date('Y-m-d');
    $last = min($to, $today);
    $rows = q('SELECT * FROM attendance WHERE day BETWEEN ? AND ?' . ($only ? ' AND ref=?' : '') . ' ORDER BY day', $only ? [$from, $to, $only] : [$from, $to])->fetchAll();
    $by = []; foreach ($rows as $r) $by[$r['ref']][$r['day']] = $r;
    /* الإجازات المعتمدة وأوامر الإركاب تُحتسب أيامها حضورًا مبرّرًا */
    $leave = [];
    foreach (q("SELECT ref, type, data FROM requests WHERE status='approved' AND type IN ('leave','travel')" . ($only ? ' AND ref=?' : ''), $only ? [$only] : [])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: []; $a = (string)($d['from'] ?? ''); $b = (string)($d['to'] ?? ''); if (!$a || !$b) continue;
        for ($t = strtotime(max($a, $from)); $t <= strtotime(min($b, $to)); $t += 86400) $leave[$r['ref']][date('Y-m-d', $t)] = $r['type'];
    }
    $workDays = []; for ($t = strtotime($from); $t <= strtotime($last); $t += 86400) if (!in_array((int)date('w', $t), $W['weekend'], true)) $workDays[] = date('Y-m-d', $t);
    $refs = $only ? [$only] : array_keys($by);
    $out = [];
    foreach ($refs as $ref) {
        $days = $by[$ref] ?? []; $lv = $leave[$ref] ?? [];
        $pres = count($days); $late = 0; $lateMin = 0; $early = 0; $mins = 0; $absent = [];
        foreach ($days as $d) { if ($d['late_min'] > 0) { $late++; $lateMin += (int)$d['late_min']; } if ($d['early_min'] > 0) $early++; $mins += (int)$d['minutes']; }
        foreach ($workDays as $wd) if (!isset($days[$wd]) && !isset($lv[$wd])) $absent[] = $wd;
        $out[$ref] = ['present' => $pres, 'late' => $late, 'lateMin' => $lateMin, 'early' => $early, 'hours' => round($mins / 60, 1), 'absent' => count($absent), 'absentDays' => $absent, 'leaveDays' => count($lv),
            'days' => $only ? array_values(array_map(fn($d) => ['day' => $d['day'], 'in' => substr((string)$d['in_time'], 0, 5), 'out' => substr((string)$d['out_time'], 0, 5), 'late' => (int)$d['late_min'], 'early' => (int)$d['early_min'], 'mins' => (int)$d['minutes']], $days)) : null,
            'leave' => $only ? $lv : null];
    }
    return ['month' => $ym, 'workDays' => count($workDays), 'rows' => $out, 'work' => $W];
}
function att_month(array $b): array {
    $u = require_perm('attendance.view');
    $ref = (string)($b['ref'] ?? '');
    $res = att_month_rows((string)($b['month'] ?? ''), $ref !== '' ? $ref : null);
    $months = q("SELECT DISTINCT DATE_FORMAT(day, '%Y-%m') m FROM attendance ORDER BY m DESC LIMIT 24")->fetchAll(PDO::FETCH_COLUMN);
    $batches = q('SELECT * FROM att_batches ORDER BY created_at DESC LIMIT 12')->fetchAll();
    return ['ok' => true] + $res + ['months' => $months, 'batches' => $batches, 'linked' => count(json_decode((string)(setting('att_map') ?: ''), true) ?: [])];
}
/* المنسوب يرى حضوره فقط (إن كانت الوحدة ظاهرة له) */
function att_my(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $ref = my_staff_ref($u); if (!$ref || !staff_can_see('att')) return ['ok' => true, 'hidden' => true];
    return ['ok' => true] + att_month_rows((string)($b['month'] ?? ''), $ref);
}
function att_batch_undo(array $b): array {
    $me = require_perm('attendance.manage');
    $id = (string)($b['batch'] ?? ''); $x = q1('SELECT * FROM att_batches WHERE id=?', [$id]); if (!$x) throw new HttpError('not_found', 404);
    $n = q('DELETE FROM attendance WHERE batch=?', [$id])->rowCount(); q('DELETE FROM att_batches WHERE id=?', [$id]);
    audit_log('', 'تراجع عن استيراد الحضور', $x['file_name'] . ' · ' . $n . ' سجل', $me['_label']);
    return ['ok' => true, 'removed' => $n];
}

/* ============================================================ التعاميم والإعلانات */
function news_audience_ok(array $n, ?array $rec): bool {
    $aud = json_decode((string)$n['audience'], true) ?: [];
    if (!$aud) return true;
    $ent = strtolower(trim((string)($rec['data']['entity'] ?? ''))); $cc = strtoupper((string)($rec['data']['workCountryCode'] ?? ''));
    foreach ($aud as $a) { $a = (string)$a; if (strpos($a, 'e:') === 0 && strtolower(substr($a, 2)) === $ent) return true; if (strpos($a, 'c:') === 0 && strtoupper(substr($a, 2)) === $cc) return true; }
    return false;
}
function news_row(array $n, array $u, bool $admin): array {
    $read = q1('SELECT read_at FROM news_reads WHERE news_id=? AND user_id=?', [$n['id'], $u['id']]);
    $o = ['id' => (int)$n['id'], 'title' => $n['title'], 'body' => $n['body'], 'kind' => $n['kind'], 'pinned' => (bool)$n['pinned'], 'by' => $n['created_by'], 'at' => substr($n['created_at'], 0, 16),
        'expires' => $n['expires_at'] ? substr($n['expires_at'], 0, 10) : '', 'audience' => json_decode((string)$n['audience'], true) ?: [], 'read' => (bool)$read, 'active' => (bool)$n['active']];
    if ($admin) $o['reads'] = (int)q1('SELECT COUNT(*) n FROM news_reads WHERE news_id=?', [$n['id']])['n'];
    return $o;
}
function news_list(): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $admin = has_perm($u, 'announce.manage');
    if (!$admin && !site_on('modules', 'news')) return ['ok' => true, 'rows' => [], 'hidden' => true];
    if ($u['role'] === 'staff' && !staff_can_see('news')) return ['ok' => true, 'rows' => [], 'hidden' => true];
    $rec = ($r = my_staff_ref($u)) ? staff_get($r) : null;
    $rows = q('SELECT * FROM news ORDER BY pinned DESC, created_at DESC LIMIT 200')->fetchAll();
    $out = [];
    foreach ($rows as $n) {
        $live = $n['active'] && (!$n['expires_at'] || $n['expires_at'] >= date('Y-m-d'));
        if (!$admin && (!$live || ($u['role'] === 'staff' && !news_audience_ok($n, $rec)))) continue;
        $out[] = news_row($n, $u, $admin);
    }
    return ['ok' => true, 'rows' => $out, 'canEdit' => $admin, 'staffTotal' => (int)q1("SELECT COUNT(*) n FROM users WHERE role='staff' AND active=1")['n']];
}
function news_save(array $b): array {
    $me = require_perm('announce.manage');
    $title = mb_substr(safe_text($b['title'] ?? ''), 0, 160); $body = mb_substr(trim(str_replace("\r", '', (string)($b['body'] ?? ''))), 0, 6000);
    $body = strip_tags($body);
    if (mb_strlen($title) < 3 || mb_strlen($body) < 3) throw new HttpError('اكتب عنوان التعميم ونصّه');
    $kind = in_array($b['kind'] ?? '', ['تعميم', 'إعلان', 'تهنئة', 'تنبيه'], true) ? $b['kind'] : 'تعميم';
    $aud = array_values(array_filter(array_map('strval', (array)($b['audience'] ?? [])), fn($a) => preg_match('/^(e|c):[^<>"]{1,80}$/u', $a)));
    $exp = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($b['expires'] ?? '')) ? $b['expires'] : null;
    $id = (int)($b['id'] ?? 0);
    if ($id) {
        if (!q1('SELECT id FROM news WHERE id=?', [$id])) throw new HttpError('not_found', 404);
        q('UPDATE news SET title=?, body=?, kind=?, pinned=?, audience=?, expires_at=?, active=? WHERE id=?', [$title, $body, $kind, !empty($b['pinned']) ? 1 : 0, json_encode($aud, JSON_UNESCAPED_UNICODE), $exp, isset($b['active']) && !$b['active'] ? 0 : 1, $id]);
        audit_log('', 'تعديل تعميم', $title, $me['_label']);
    } else {
        q('INSERT INTO news (title, body, kind, pinned, audience, expires_at, active, created_by, created_at) VALUES (?,?,?,?,?,?,1,?,?)', [$title, $body, $kind, !empty($b['pinned']) ? 1 : 0, json_encode($aud, JSON_UNESCAPED_UNICODE), $exp, $me['_label'], now()]);
        audit_log('', 'نشر ' . $kind, $title, $me['_label']);
    }
    return news_list();
}
function news_delete(array $b): array {
    $me = require_perm('announce.manage');
    $n = q1('SELECT * FROM news WHERE id=?', [(int)($b['id'] ?? 0)]); if (!$n) throw new HttpError('not_found', 404);
    q('DELETE FROM news_reads WHERE news_id=?', [$n['id']]); q('DELETE FROM news WHERE id=?', [$n['id']]);
    audit_log('', 'حذف تعميم', $n['title'], $me['_label']);
    return news_list();
}
function news_read(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $id = (int)($b['id'] ?? 0); if (!q1('SELECT id FROM news WHERE id=?', [$id])) throw new HttpError('not_found', 404);
    q('INSERT IGNORE INTO news_reads (news_id, user_id, read_at) VALUES (?,?,?)', [$id, $u['id'], now()]);
    return ['ok' => true];
}
function news_readers(array $b): array {
    require_perm('announce.manage');
    $rows = q('SELECT u.name, u.email, u.role, r.read_at FROM news_reads r JOIN users u ON u.id=r.user_id WHERE r.news_id=? ORDER BY r.read_at DESC', [(int)($b['id'] ?? 0)])->fetchAll();
    return ['ok' => true, 'rows' => array_map(fn($r) => ['name' => $r['name'] ?: mask_email((string)$r['email']), 'role' => ROLE_NAMES[$r['role']] ?? '', 'at' => substr($r['read_at'], 0, 16)], $rows)];
}

/* ============================================================ صفحة المنسوب: الرصيد والتعاميم غير المقروءة */
function my_extra(): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $ref = my_staff_ref($u); $o = ['ok' => true, 'site' => site()];
    if ($ref && staff_can_see('balance')) $o['balance'] = leave_balance($ref);
    return $o;
}
