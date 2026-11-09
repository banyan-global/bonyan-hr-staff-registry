<?php
/**
 * الوحدات المتكاملة: إعدادات المنصة (إظهار/إخفاء) · أرصدة الإجازات · الحضور والانصراف · التعاميم
 * كل ما يخص المنسوب يُفحص هنا في الخادم أيضًا (إخفاء قسم في الواجهة لا يكفي وحده).
 */
declare(strict_types=1);

/* ============================================================ إعدادات المنصة */
const SITE_DEFAULTS = [
    'modules' => ['reqs' => true, 'forms' => true, 'payroll' => true, 'att' => true, 'news' => true, 'org' => true, 'reports' => true, 'acts' => true, 'custody' => true, 'evals' => true, 'jobs' => true],
    'home' => ['hero' => true, 'kpis' => true, 'todo' => true, 'qa' => true, 'events' => true, 'charts' => true, 'quality' => true, 'cal' => true, 'ents' => true, 'recent' => true, 'log' => true],
    'staff' => ['card' => true, 'docs' => true, 'pay' => true, 'reqs' => true, 'balance' => true, 'att' => true, 'news' => true, 'update' => true, 'myhr' => true],
    'leave' => ['annual' => 30, 'prorate' => true, 'kinds' => ['اعتيادية (سنوية)'], 'carry' => 0,
        'quotas' => ['مرضية' => 30, 'طارئة (اضطرارية)' => 5, 'أمومة' => 70, 'حج' => 10, 'زواج' => 5, 'وفاة قريب' => 5, 'دراسة / تدريب' => 0, 'تعويضية' => 0]],
    'work' => ['start' => '08:00', 'end' => '16:00', 'grace' => 15, 'weekend' => [5, 6], 'probation' => 90, 'mobile' => 'off', 'mobileRefs' => [], 'remoteRefs' => [], 'sites' => [], 'checkEvery' => 60],
];
function site(): array {
    static $c = null; if ($c !== null) return $c;
    $s = json_decode((string)(setting('site') ?: ''), true); $s = is_array($s) ? $s : [];
    $c = SITE_DEFAULTS;
    foreach ($c as $g => $vals) if (isset($s[$g]) && is_array($s[$g])) foreach ($vals as $k => $def) if (array_key_exists($k, $s[$g])) $c[$g][$k] = $s[$g][$k];
    $c['leave']['kinds'] = array_values(array_unique(array_map(fn($k) => leave_kind_norm((string)$k), (array)$c['leave']['kinds'])));
    return $c;
}
function site_on(string $g, string $k): bool { return !empty(site()[$g][$k]); }
/* قسم يخص المنسوب: يجب أن تكون الوحدة مفعّلة وعنصر البوابة ظاهرًا */
function staff_can_see(string $k): bool { $mod = ['reqs' => 'reqs', 'att' => 'att', 'news' => 'news'][$k] ?? null; return site_on('staff', $k) && (!$mod || site_on('modules', $mod)); }
function site_get(): array { $u = current_user(); if (!$u) throw new HttpError('auth_required', 401); return ['ok' => true, 'site' => site(), 'canEdit' => has_perm($u, 'settings.manage'), 'ui' => ui_get($u)]; }
/* ترتيب الصفحة الرئيسية لكل مستخدم (يحفظه بنفسه من زر «ترتيب الواجهة»): الترتيب والمخفي فقط، والصلاحيات تبقى هي الحَكَم */
const UI_HOME_BLOCKS = ['hero', 'kpis', 'ents', 'quality', 'geo', 'doclvl', 'cal', 'recent', 'log', 'third', 'status', 'qa', 'events'];
function ui_get(array $u): array { $v = json_decode((string)(kv_get('ui:home:' . (int)$u['id']) ?? ''), true); return ['home' => is_array($v) ? $v : null]; }
function ui_save(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    if (!empty($b['reset'])) { kv_del('ui:home:' . (int)$u['id']); return ['ok' => true, 'ui' => ui_get($u)]; }
    $h = is_array($b['home'] ?? null) ? $b['home'] : [];
    $ok = fn($a) => array_values(array_unique(array_filter(array_map('strval', is_array($a) ? $a : []), fn($x) => in_array($x, UI_HOME_BLOCKS, true))));
    kv_put('ui:home:' . (int)$u['id'], json_encode(['order' => $ok($h['order'] ?? []), 'hidden' => $ok($h['hidden'] ?? [])]));
    return ['ok' => true, 'ui' => ui_get($u)];
}
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
        $o['leave']['kinds'] = $kinds ?: ['اعتيادية (سنوية)'];
        $o['leave']['carry'] = max(0, min(60, (int)($L['carry'] ?? 0)));
        if (isset($L['quotas']) && is_array($L['quotas'])) { $qq = []; foreach ($L['quotas'] as $k => $v) if (in_array($k, LEAVE_KINDS, true) && !in_array($k, $o['leave']['kinds'], true)) $qq[$k] = max(0, min(180, (int)$v)); $o['leave']['quotas'] = $qq; }
    }
    if (isset($in['work'])) {
        $W = $in['work']; $t = fn($v, $d) => preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string)$v) ? (string)$v : $d;
        $o['work']['start'] = $t($W['start'] ?? '', '08:00'); $o['work']['end'] = $t($W['end'] ?? '', '16:00');
        if ($o['work']['end'] <= $o['work']['start']) throw new HttpError('وقت نهاية الدوام يجب أن يكون بعد بدايته');
        $o['work']['grace'] = max(0, min(120, (int)($W['grace'] ?? 15)));
        $o['work']['weekend'] = array_values(array_unique(array_filter(array_map('intval', (array)($W['weekend'] ?? [])), fn($d) => $d >= 0 && $d <= 6)));
        $o['work']['probation'] = max(0, min(180, (int)($W['probation'] ?? 90)));
        $o['work']['mobile'] = in_array($W['mobile'] ?? 'off', ['off', 'all', 'listed'], true) ? $W['mobile'] : 'off';
        $o['work']['checkEvery'] = in_array((int)($W['checkEvery'] ?? 60), [0, 30, 60, 90, 120], true) ? (int)($W['checkEvery'] ?? 60) : 60;
        $o['work']['mobileRefs'] = array_values(array_filter(array_map('strval', (array)($W['mobileRefs'] ?? [])), fn($r) => (bool)preg_match('/^[A-Z0-9-]{4,40}$/', $r)));
        $o['work']['remoteRefs'] = array_values(array_unique(array_filter(array_map('strval', (array)($W['remoteRefs'] ?? [])), fn($r) => (bool)preg_match('/^[A-Z0-9-]{4,40}$/', $r))));
        $sites = [];
        foreach (array_slice((array)($W['sites'] ?? []), 0, 30) as $x) {
            $nm = mb_substr(safe_text($x['name'] ?? ''), 0, 80); $la = (float)($x['lat'] ?? 0); $lo = (float)($x['lng'] ?? 0); $rad = max(20, min(5000, (int)($x['radius'] ?? 50)));
            if ($nm === '' || abs($la) > 90 || abs($lo) > 180 || ($la == 0 && $lo == 0)) throw new HttpError('أكمل اسم كل مقر وإحداثياته');
            $tz = (string)($x['tz'] ?? ''); if (!att_tz_ok($tz)) $tz = ATT_TZ_DEFAULT;
            $sites[] = ['name' => $nm, 'entity' => mb_substr(safe_text($x['entity'] ?? ''), 0, 120), 'lat' => round($la, 6), 'lng' => round($lo, 6), 'radius' => $rad, 'tz' => $tz];
        }
        $o['work']['sites'] = $sites;
        if ($o['work']['mobile'] !== 'off' && !$sites) throw new HttpError('أضف موقع عمل واحدًا على الأقل قبل تفعيل الحضور من الجوال');
    }
    setting_set('site', json_encode($o, JSON_UNESCAPED_UNICODE));
    audit_log('', 'تعديل إعدادات المنصة', '', $me['_label']);
    return ['ok' => true, 'site' => $o, 'canEdit' => true];
}

/* ============================================================ إحداثيات المقر من رابط خرائط جوجل */
/* يقبل الرابط المختصر (maps.app.goo.gl) أو الكامل أو «خط العرض، خط الطول»، ويتتبع التحويلات داخل نطاقات جوجل فقط */
function geo_parse(string $s, bool $page = false): ?array {
    $s = rawurldecode(rawurldecode(html_entity_decode($s, ENT_QUOTES)));
    /* داخل صفحة الخريطة نقبل دبوس المكان (!3d!4d) فقط؛ مركز العرض فيها قد يكون موقع الزائر لا المقر */
    $pats = $page ? ['/!3d(-?\d{1,2}\.\d{3,})!4d(-?\d{1,3}\.\d{3,})/'] : ['/!3d(-?\d{1,2}\.\d{3,})!4d(-?\d{1,3}\.\d{3,})/', '/[?&](?:q|query|ll|sll|daddr|destination)=(?:loc:)?[^0-9\-]{0,12}(-?\d{1,2}\.\d{3,})\s*[,+ ]\s*\+?(-?\d{1,3}\.\d{3,})/',
        '/\/search\/(-?\d{1,2}\.\d{3,}),\+?(-?\d{1,3}\.\d{3,})/', '/\/maps\/place\/[^\/]*\/@(-?\d{1,2}\.\d{3,}),(-?\d{1,3}\.\d{3,})/', '/^\s*(-?\d{1,2}\.\d{3,})\s*[,،\s]\s*(-?\d{1,3}\.\d{3,})\s*$/u'];
    foreach ($pats as $p) if (preg_match($p, $s, $m)) { $la = (float)$m[1]; $lo = (float)$m[2]; if (abs($la) <= 90 && abs($lo) <= 180 && ($la || $lo)) return [round($la, 6), round($lo, 6)]; }
    return null;
}
function geo_place_name(string $u): string {
    return preg_match('#/maps/place/([^/@?]+)#', $u, $m) ? mb_substr(trim(str_replace('+', ' ', rawurldecode($m[1]))), 0, 80) : '';
}
function geo_resolve(array $b): array {
    require_perm('settings.manage');
    $u = trim((string)($b['url'] ?? ''));
    if ($u === '' || mb_strlen($u) > 2000) throw new HttpError('الصق رابط الموقع من خرائط جوجل');
    if ($c = geo_parse($u)) return ['ok' => true, 'lat' => $c[0], 'lng' => $c[1], 'name' => geo_place_name($u)];
    if (!preg_match('#^https?://#i', $u) && preg_match('#^(maps\.app\.goo\.gl|goo\.gl|(www\.|maps\.)?google\.[a-z.]+)/#i', $u)) $u = 'https://' . $u;
    $okHost = fn($x) => (bool)preg_match('/(^|\.)(goo\.gl|google\.[a-z]{2,3}(\.[a-z]{2})?)$/i', (string)parse_url($x, PHP_URL_HOST));
    if (!$okHost($u) || !preg_match('#^https?://#i', $u)) throw new HttpError('يُقبل رابط من خرائط جوجل فقط');
    if (!function_exists('curl_init')) throw new HttpError('تعذّر فتح الرابط على الخادم؛ أدخل الإحداثيات يدويًا');
    $name = '';
    for ($i = 0; $i < 7; $i++) {
        $ch = curl_init($u);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HEADER => true, CURLOPT_FOLLOWLOCATION => false, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS | CURLPROTO_HTTP, CURLOPT_USERAGENT => 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
            CURLOPT_HTTPHEADER => ['Accept-Language: ar,en;q=0.8'], CURLOPT_MAXFILESIZE => 3000000]);
        $res = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE); $hl = (int)curl_getinfo($ch, CURLINFO_HEADER_SIZE); curl_close($ch);
        if ($res === false) break;
        $name = geo_place_name($u) ?: $name;
        if ($code >= 300 && $code < 400 && preg_match('/^location:\s*(\S+)/im', substr($res, 0, $hl), $m)) {
            $next = trim($m[1]); if ($next[0] === '/') $next = preg_replace('#^(https?://[^/]+).*#', '$1', $u) . $next;
            if ($c = geo_parse($next)) return ['ok' => true, 'lat' => $c[0], 'lng' => $c[1], 'name' => geo_place_name($next) ?: $name];
            if (!$okHost($next)) break;
            $u = $next; continue;
        }
        if ($c = geo_parse(substr($res, $hl, 1500000), true)) return ['ok' => true, 'lat' => $c[0], 'lng' => $c[1], 'name' => $name];
        break;
    }
    throw new HttpError('لم أستخرج الإحداثيات من هذا الرابط. افتحه في خرائط جوجل، واضغط مطوّلًا على المكان، وانسخ الرقمين الظاهرين والصقهما هنا');
}

/* ============================================================ أرصدة الإجازات */
/* الاستحقاق السنوي (يُحتسب بالتناسب في سنة المباشرة إن فُعّل)، والمستهلك = الإجازات المعتمدة من الأنواع المخصومة في السنة الحالية */
function leave_annual_left(string $ref, array $rec, int $y): float {
    $L = site()['leave']; $start = (string)($rec['data']['startDate'] ?? ''); $ent = (float)$L['annual'];
    if (preg_match('/^(\d{4})-(\d{2})-\d{2}$/', $start, $m)) { if ((int)$m[1] > $y) $ent = 0; elseif ((int)$m[1] === $y && $L['prorate']) $ent = round($L['annual'] * (13 - (int)$m[2]) / 12, 1); }
    $used = 0;
    foreach (q("SELECT data FROM requests WHERE ref=? AND type='leave' AND status='approved'", [$ref])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: []; if (substr((string)($d['from'] ?? ''), 0, 4) !== (string)$y) continue;
        if (in_array(leave_kind_norm((string)($d['kind'] ?? '')), $L['kinds'], true)) $used += (int)($d['days'] ?? 0);
    }
    return max(0, $ent - $used);
}
/* رصيد الأنواع المستقلة (مرضية، طارئة، أمومة، حج، زواج، وفاة) للسنة الحالية */
function leave_quota_left(string $ref, string $kind, string $exceptNo = ''): ?array {
    $q = (int)(site()['leave']['quotas'][$kind] ?? 0); if ($q <= 0) return null;
    $y = (string)date('Y'); $used = 0; $pend = 0;
    foreach (q("SELECT no, status, data FROM requests WHERE ref=? AND type='leave' AND status IN ('approved','pending') AND no<>?", [$ref, $exceptNo])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: []; if (leave_kind_norm((string)($d['kind'] ?? '')) !== $kind || substr((string)($d['from'] ?? ''), 0, 4) !== $y) continue;
        if ($r['status'] === 'approved') $used += (int)($d['days'] ?? 0); else $pend += (int)($d['days'] ?? 0);
    }
    return ['quota' => $q, 'used' => $used, 'pending' => $pend, 'left' => max(0, $q - $used - $pend)];
}
function leave_quota_check(string $ref, array $o, string $exceptNo = ''): void {
    $k = (string)$o['kind'];
    if ($k === 'أمومة') { $s = staff_get($ref); if ($s && preg_match('/^(male|m|ذكر|laki-laki|pria)$/iu', trim((string)($s['data']['gender'] ?? '')))) throw new HttpError('إجازة الأمومة للمنسوبات فقط'); }
    $x = leave_quota_left($ref, $k, $exceptNo); if (!$x) return;
    if ((int)$o['days'] > $x['left'] && in_array($k, LEAVE_STRICT, true))
        throw new HttpError('رصيد إجازة «' . $k . '» لهذا العام ' . $x['quota'] . ' يومًا، والمتاح منه ' . $x['left'] . ' يومًا' . ($x['pending'] ? ' (منها ' . $x['pending'] . ' قيد الاعتماد)' : '') . '. قلّل المدة أو اختر نوعًا آخر.');
}
function leave_balance(string $ref, ?array $rec = null): array {
    $L = site()['leave']; $y = (int)date('Y');
    $rec = $rec ?? staff_get($ref); $start = (string)($rec['data']['startDate'] ?? '');
    $ent = (float)$L['annual'];
    /* المرحَّل من العام السابق بحد أقصى تحدده الإعدادات */
    $carry = (int)($L['carry'] ?? 0) > 0 && $rec && (!preg_match('/^(\d{4})/', $start, $sm) || (int)$sm[1] < $y) ? min((float)$L['carry'], leave_annual_left($ref, $rec, $y - 1)) : 0;
    if (preg_match('/^(\d{4})-(\d{2})-\d{2}$/', $start, $m)) {
        if ((int)$m[1] > $y) $ent = 0;
        elseif ((int)$m[1] === $y && $L['prorate']) $ent = round($L['annual'] * (13 - (int)$m[2]) / 12, 1);
    }
    $used = 0; $pend = 0; $byKind = [];
    foreach (q("SELECT status, data FROM requests WHERE ref=? AND type='leave' AND status IN ('approved','pending')", [$ref])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: []; if (substr((string)($d['from'] ?? ''), 0, 4) !== (string)$y) continue;
        $days = (int)($d['days'] ?? 0); $k = leave_kind_norm((string)($d['kind'] ?? ''));
        if ($r['status'] === 'approved') $byKind[$k] = ($byKind[$k] ?? 0) + $days;
        if (!in_array($k, $L['kinds'], true)) continue;
        if ($r['status'] === 'approved') $used += $days; else $pend += $days;
    }
    /* أيام التأخر عن العودة (من إشعار المباشرة المعتمد) تُخصم من الرصيد السنوي */
    $late = 0;
    foreach (q("SELECT data FROM requests WHERE ref=? AND type='resume' AND status='approved'", [$ref])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: []; if (substr((string)($d['day'] ?? ''), 0, 4) === (string)$y) $late += (int)($d['lateDays'] ?? 0);
    }
    $used += $late;
    $ent += $carry;
    $female = (bool)preg_match('/^(female|f|أنثى|انثى|perempuan|wanita)$/iu', trim((string)($rec['data']['gender'] ?? '')));
    $quotas = []; foreach ((array)($L['quotas'] ?? []) as $k => $q) if ((int)$q > 0 && ($k !== 'أمومة' || $female)) { $x = leave_quota_left($ref, (string)$k); if ($x) $quotas[] = ['kind' => (string)$k] + $x + ['strict' => in_array($k, LEAVE_STRICT, true)]; }
    return ['year' => $y, 'entitled' => $ent, 'carried' => $carry, 'used' => $used, 'pending' => $pend, 'left' => max(0, $ent - $used), 'byKind' => $byKind, 'kinds' => $L['kinds'], 'lateReturn' => $late, 'quotas' => $quotas];
}
function leave_balances(): array {
    $u = require_perm('staff.view');
    $out = []; $hide = private_hidden_for($u);
    foreach (q('SELECT ref FROM staff ORDER BY id')->fetchAll() as $x) { if (in_array($x['ref'], $hide, true)) continue; $r = staff_get($x['ref']); if ($r) $out[$x['ref']] = leave_balance($x['ref'], $r); }
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
function att_calc(string $in, string $out, array $W, bool $free = false): array {
    $mn = fn($t) => $t ? ((int)substr($t, 0, 2)) * 60 + (int)substr($t, 3, 2) : null;
    $i = $mn($in); $o = $mn($out); $s = $mn($W['start']); $e = $mn($W['end']);
    $mins = $i !== null && $o !== null && $o > $i ? $o - $i : 0;
    $late = $i !== null && $i > $s + (int)$W['grace'] ? $i - $s : 0;
    $early = $o !== null && $o < $e ? $e - $o : 0;
    if ($free) return [$mins, 0, 0]; /* العمل عن بعد: لا تأخير ولا انصراف مبكر */
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
    /* الاستئذان المعتمد يبرّر التأخير أو الخروج المبكر في يومه، والعمل الإضافي المعتمد يُجمع بالساعات */
    $perm = []; $ot = [];
    foreach (q("SELECT ref, type, data FROM requests WHERE status='approved' AND type IN ('perm','ot')" . ($only ? ' AND ref=?' : ''), $only ? [$only] : [])->fetchAll() as $r) {
        $d = json_decode($r['data'], true) ?: []; $day = (string)($d['day'] ?? ''); if ($day < $from || $day > $to) continue;
        if ($r['type'] === 'perm') $perm[$r['ref']][$day][] = ['k' => (string)($d['kind'] ?? ''), 'from' => (string)($d['fromT'] ?? ''), 'to' => (string)($d['toT'] ?? '')];
        else $ot[$r['ref']] = ($ot[$r['ref']] ?? 0) + (int)($d['mins'] ?? 0);
    }
    $workDays = []; for ($t = strtotime($from); $t <= strtotime($last); $t += 86400) if (!in_array((int)date('w', $t), $W['weekend'], true)) $workDays[] = date('Y-m-d', $t);
    $refs = $only ? [$only] : array_values(array_unique(array_merge(array_keys($by), array_keys($ot))));
    $out = [];
    foreach ($refs as $ref) {
        $days = $by[$ref] ?? []; $lv = $leave[$ref] ?? []; $pm = $perm[$ref] ?? [];
        $pres = count($days); $late = 0; $lateMin = 0; $early = 0; $mins = 0; $absent = []; $excused = 0;
        foreach ($days as $d) {
            /* يُبرَّر التأخير إن كان الحضور قبل نهاية الاستئذان (مع السماحية)، والخروج المبكر إن كان الخروج بعد بدايته */
            $mn = fn($t) => $t ? ((int)substr($t, 0, 2)) * 60 + (int)substr($t, 3, 2) : null; $g = (int)$W['grace'];
            $in = $mn(substr((string)$d['in_time'], 0, 5)); $outT = $mn(substr((string)$d['out_time'], 0, 5)); $exL = false; $exE = false;
            foreach ($pm[$d['day']] ?? [] as $p) {
                if ($p['k'] === 'تأخر صباحي' && $in !== null && $in <= $mn($p['to']) + $g) $exL = true;
                if ($p['k'] === 'خروج مبكر' && $outT !== null && $outT >= $mn($p['from']) - $g) $exE = true;
            }
            if ($d['late_min'] > 0) { if ($exL) $excused++; else { $late++; $lateMin += (int)$d['late_min']; } }
            if ($d['early_min'] > 0) { if ($exE) $excused++; else $early++; }
            $mins += (int)$d['minutes'];
        }
        foreach ($workDays as $wd) if (!isset($days[$wd]) && !isset($lv[$wd])) $absent[] = $wd;
        $out[$ref] = ['present' => $pres, 'late' => $late, 'lateMin' => $lateMin, 'early' => $early, 'hours' => round($mins / 60, 1), 'absent' => count($absent), 'absentDays' => $absent, 'leaveDays' => count($lv),
            'excused' => $excused, 'perms' => array_sum(array_map('count', $pm)), 'otHours' => round(($ot[$ref] ?? 0) / 60, 1), 'permDays' => $only ? array_map(fn($a) => array_map(fn($p) => $p['k'] . ' ' . $p['from'] . '–' . $p['to'], $a), $pm) : null,
            'days' => $only ? array_values(array_map(fn($d) => ['day' => $d['day'], 'in' => substr((string)$d['in_time'], 0, 5), 'out' => substr((string)$d['out_time'], 0, 5), 'late' => (int)$d['late_min'], 'early' => (int)$d['early_min'], 'mins' => (int)$d['minutes'], 'src' => (string)$d['source']], $days)) : null,
            'leave' => $only ? $lv : null];
    }
    return ['month' => $ym, 'workDays' => count($workDays), 'rows' => $out, 'work' => $W];
}
function att_month(array $b): array {
    $u = require_perm('attendance.view');
    $ref = (string)($b['ref'] ?? ''); $hide = private_hidden_for($u);
    if ($ref !== '' && in_array($ref, $hide, true)) throw new HttpError('not_found', 404);
    $res = att_month_rows((string)($b['month'] ?? ''), $ref !== '' ? $ref : null);
    foreach ($hide as $h) unset($res['rows'][$h]);
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
function news_list(array $b = []): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    /* asStaff: صاحب حساب النظام في «واجهة الموظف» يرى ما يراه المنسوب */
    $asStaff = !empty($b['asStaff']) && $u['role'] !== 'staff';
    $admin = !$asStaff && has_perm($u, 'announce.manage');
    if (!$admin && !site_on('modules', 'news')) return ['ok' => true, 'rows' => [], 'hidden' => true];
    if ($u['role'] === 'staff' && !staff_can_see('news')) return ['ok' => true, 'rows' => [], 'hidden' => true];
    $rec = ($r = my_staff_ref($u)) ? staff_get($r) : null;
    $rows = q('SELECT * FROM news ORDER BY pinned DESC, created_at DESC LIMIT 200')->fetchAll();
    $out = [];
    foreach ($rows as $n) {
        $live = $n['active'] && (!$n['expires_at'] || $n['expires_at'] >= date('Y-m-d'));
        if (!$admin && (!$live || (($u['role'] === 'staff' || $asStaff) && !news_audience_ok($n, $rec)))) continue;
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

/* ============================================================ تصحيح بيانات الجهات لمرة واحدة (نوفمبر 2026)
   ١) «عفوى…» من «financial administration» إلى «بنيان الإنسانية»
   ٢) «أكاديمية بنيان» ← «جامعة بنيان العالمية بنات»، وتُنقل إليها منسوبات «جامعة بنيان العالمية»
   كل نقل يُسجَّل في سجل العمليات باسم «النظام» */
function ent_norm(string $s): string {
    $s = preg_replace('/[\x{064B}-\x{065F}\x{0640}]/u', '', mb_strtolower(trim($s)));
    return preg_replace('/\s+/u', ' ', strtr($s, ['أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ى' => 'ي', 'ة' => 'ه']));
}
/* ٣) تسمية الجامعة بفرعيها: «(بنين)» و«(بنات)» — تُحدَّث القيم المخزّنة مرة واحدة */
function data_fix_entities_2611b(): void {
    if (setting('fix:ent2611b', '') !== '') return;
    try { named_lock('fix_ent2611b', 5); } catch (Throwable $e) { return; }
    try {
        if (setting('fix:ent2611b', '') !== '') return;
        $MAP = [];
        foreach (['جامعة بنيان العالمية', 'Bonyan International University', 'Universitas Internasional Bonyan', 'bonyan-university'] as $x) $MAP[ent_norm($x)] = 'جامعة بنيان العالمية (بنين)';
        foreach (['جامعة بنيان العالمية بنات', 'أكاديمية بنيان', 'Bonyan Academy', 'bonyan-academy'] as $x) $MAP[ent_norm($x)] = 'جامعة بنيان العالمية (بنات)';
        $n = 0;
        foreach (q('SELECT id, ref, data FROM staff')->fetchAll() as $r) {
            $d = json_decode($r['data'], true); if (!is_array($d)) continue;
            $to = $MAP[ent_norm((string)($d['entity'] ?? ''))] ?? null; if (!$to || ($d['entity'] ?? '') === $to) continue;
            $d['entity'] = $to; q('UPDATE staff SET data=?, updated_at=? WHERE id=?', [json_encode($d, JSON_UNESCAPED_UNICODE), now(), $r['id']]); $n++;
        }
        if ($n) audit_log('', 'إعادة تسمية جهة', 'جامعة بنيان العالمية ← (بنين) و(بنات) · ' . $n . ' سجلًا', 'النظام');
        setting_set('fix:ent2611b', json_encode(['at' => now(), 'n' => $n]));
    } finally { named_unlock('fix_ent2611b'); }
}
function data_fix_entities_2611(): void {
    if (setting('fix:ent2611', '') !== '') { data_fix_entities_2611b(); return; }
    try { named_lock('fix_ent2611', 5); } catch (Throwable $e) { return; }
    try {
        if (setting('fix:ent2611', '') !== '') return;
        $UNI = array_map('ent_norm', ['جامعة بنيان العالمية', 'Bonyan International University', 'Universitas Internasional Bonyan', 'bonyan-university']);
        $ACAD = array_map('ent_norm', ['أكاديمية بنيان', 'Bonyan Academy', 'Akademi Bonyan', 'bonyan-academy']);
        $FEM = array_map('ent_norm', ['أنثى', 'female', 'f', 'perempuan', 'wanita']); $MALE = array_map('ent_norm', ['ذكر', 'male', 'm', 'laki-laki', 'pria']);
        $NAMES = array_map('ent_norm', ['إيمان', 'مايسة', 'هدى', 'حنان', 'سمر', 'نور', 'جومان', 'ralim', 'iman', 'eman', 'maysa', 'maisa', 'huda', 'hoda', 'hanan', 'samar', 'nour', 'noor', 'nur', 'joman', 'juman']);
        $moved = [];
        foreach (q('SELECT id, ref, data FROM staff')->fetchAll() as $r) {
            $d = json_decode($r['data'], true); if (!is_array($d)) continue;
            $ent = ent_norm((string)($d['entity'] ?? '')); $g = ent_norm((string)($d['gender'] ?? ''));
            $ar = ent_norm((string)($d['fullNameAr'] ?? '')); $la = ent_norm((string)($d['fullNameLatin'] ?? ''));
            $first = [explode(' ', $ar)[0] ?? '', explode(' ', $la)[0] ?? ''];
            $to = null;
            if ($ent === 'financial administration' && (mb_strpos($ar, 'عفو') === 0 || mb_strpos($la, 'afwa') === 0 || mb_strpos($la, 'afwah') === 0)) $to = 'بنيان الإنسانية';
            elseif (in_array($ent, $ACAD, true)) $to = 'جامعة بنيان العالمية بنات';
            elseif (in_array($ent, $UNI, true) && (in_array($g, $FEM, true) || (!in_array($g, $MALE, true) && array_intersect($first, $NAMES)))) $to = 'جامعة بنيان العالمية بنات';
            if (!$to) continue;
            $from = (string)($d['entity'] ?? ''); $d['entity'] = $to;
            q('UPDATE staff SET data=?, updated_at=? WHERE id=?', [json_encode($d, JSON_UNESCAPED_UNICODE), now(), $r['id']]);
            audit_log($r['ref'], 'نقل إلى جهة أخرى', ($d['fullNameAr'] ?? $d['fullNameLatin'] ?? '') . ' · من «' . $from . '» إلى «' . $to . '»', 'النظام');
            $moved[] = $r['ref'];
        }
        setting_set('fix:ent2611', json_encode(['at' => now(), 'moved' => $moved]));
    } finally { named_unlock('fix_ent2611'); }
    data_fix_entities_2611b();
}
