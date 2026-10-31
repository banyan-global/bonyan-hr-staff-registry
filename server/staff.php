<?php
/**
 * سجل المنسوبين — نفس منطق Code.gs ونفس شكل الطلبات والردود، لتعمل الواجهات الحالية دون إعادة كتابة،
 * مع الإصلاحات الأمنية: جلسات وصلاحيات بدل الرمز المشترك، إخفاء البيانات المالية عمّن لا يملك صلاحيتها،
 * رمز تحقق على البريد بدل الاكتفاء بمطابقة البريد/الجوال في صفحة التحديث، وأرشفة المرفقات بدل حذفها.
 */
declare(strict_types=1);

const ADMIN_LOCKED = ['ref', 'createdAt', 'updatedAt', 'folder', 'folderId', 'fullNameAr', 'fullNameLatin', 'lang', 'tz'];
const SELF_LOCKED = ['status'];
const NAME_PARTS = ['firstNameAr', 'fatherNameAr', 'grandNameAr', 'lastNameAr', 'firstName', 'fatherName', 'grandName', 'lastName'];
const FINANCE_KEYS = ['salary', 'iban', 'accountNo', 'swift', 'accountHolder', 'bankBranch', 'payOther', 'bankProof'];
const DEGREE_RANK = ['دكتوراه' => 6, 'ماجستير' => 5, 'بكالوريوس' => 4, 'دبلوم' => 3, 'ثانوي' => 2, 'أخرى' => 1];
const KIDS = [
    'quals' => ['المؤهلات', ['الرقم المرجعي', 'الاسم', 'الدرجة', 'التخصص', 'الجهة', 'الدولة', 'سنة التخرج', 'التقدير'], 6],
    'exp'   => ['الخبرات', ['الرقم المرجعي', 'الاسم', 'جهة العمل', 'المسمى', 'الدولة', 'من', 'إلى'], 5],
    'langs' => ['اللغات', ['الرقم المرجعي', 'الاسم', 'اللغة', 'المستوى'], 2],
];
const ST_PENDING = 'بانتظار المرفقات';
const ST_DONE = 'مكتمل';

function staff_cols(): array { static $c = null; return $c ??= require __DIR__ . '/cols.php'; }
function col_type(string $k): ?string { foreach (staff_cols() as $c) if ($c[0] === $k) return $c[2]; return null; }
function col_title(string $k): string { foreach (staff_cols() as $c) if ($c[0] === $k) return $c[1]; return $k; }

function named_lock(string $name, int $timeout = 30): void { if ((int)q1('SELECT GET_LOCK(?, ?) l', [$name, $timeout])['l'] !== 1) throw new HttpError('busy', 503); }
function named_unlock(string $name): void { q('SELECT RELEASE_LOCK(?)', [$name]); }

function staff_get(string $ref): ?array {
    $r = q1('SELECT * FROM staff WHERE ref=?', [$ref]);
    if (!$r) return null;
    $r['data'] = json_decode($r['data'], true) ?: [];
    foreach (array_keys(KIDS) as $k) $r[$k] = json_decode((string)$r[$k], true) ?: [];
    return $r;
}
function staff_put(array $r): void {
    $d = $r['data'];
    $d['ref'] = $r['ref']; $d['status'] = $r['status']; $d['createdAt'] = substr($r['created_at'], 0, 16); $d['updatedAt'] = substr($r['updated_at'], 0, 16);
    $args = [$r['status'], normalize_((string)($d['passportNo'] ?? '')), $r['created_at'], $r['updated_at'],
        json_encode($d, JSON_UNESCAPED_UNICODE), json_encode($r['quals'] ?? [], JSON_UNESCAPED_UNICODE), json_encode($r['exp'] ?? [], JSON_UNESCAPED_UNICODE), json_encode($r['langs'] ?? [], JSON_UNESCAPED_UNICODE), $r['ref']];
    if (q1('SELECT id FROM staff WHERE ref=?', [$r['ref']]))
        q('UPDATE staff SET status=?, passport_norm=?, created_at=?, updated_at=?, data=?, quals=?, exp=?, langs=? WHERE ref=?', $args);
    else
        q('INSERT INTO staff (status, passport_norm, created_at, updated_at, data, quals, exp, langs, ref) VALUES (?,?,?,?,?,?,?,?,?)', $args);
}
function staff_name(array $r): string { return trim((string)($r['data']['fullNameAr'] ?? '')) ?: trim((string)($r['data']['fullNameLatin'] ?? '')); }

function next_ref(string $cc): string {
    $y = date('Y'); $key = 'seq_' . $y;
    $pdo = db(); $pdo->beginTransaction();
    try {
        q('INSERT IGNORE INTO settings (k, v) VALUES (?, ?)', [$key, '0']);
        $n = (int)q1('SELECT v FROM settings WHERE k=? FOR UPDATE', [$key])['v'] + 1;
        q('UPDATE settings SET v=? WHERE k=?', [(string)$n, $key]);
        $pdo->commit();
    } catch (Throwable $e) { $pdo->rollBack(); throw $e; }
    return cfg('ref_prefix') . '-' . (cc_($cc) ?: 'XX') . '-' . $y . '-' . str_pad((string)$n, 4, '0', STR_PAD_LEFT);
}
function top_degree($quals): string {
    $best = ''; $rank = 0;
    foreach ((array)$quals as $q) { $r = DEGREE_RANK[$q['degree'] ?? ''] ?? 0; if ($r > $rank) { $rank = $r; $best = $q['degree'] . (!empty($q['major']) ? ' · ' . $q['major'] : ''); } }
    return $best;
}
function valid_date($v): string { $v = trim((string)$v); return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) && checkdate((int)substr($v, 5, 2), (int)substr($v, 8, 2), (int)substr($v, 0, 4)) ? $v : ''; }
function parse_num($v): ?float {
    $s = trim(str_replace([',', ' '], '', to_ascii_digits((string)$v)));
    if ($s === '') return null;
    if (!is_numeric($s)) throw new HttpError('bad_number');
    return (float)$s;
}
function fmt_num($v): string { if ($v === '' || $v === null) return ''; $f = (float)$v; return number_format($f, floor($f) == $f ? 0 : 2); }

/* ============================================================ الكرة الأرضية: أرقام مجمّعة فقط بلا أي بيانات شخصية */
function countries(): array {
    $hit = kv_get('countries'); if ($hit) return json_decode($hit, true);
    $out = []; $nats = []; $allNat = []; $regs = []; $total = 0;
    foreach (q('SELECT status, data FROM staff') as $r) {
        if (strpos($r['status'], 'بانتظار') === 0) continue;
        $d = json_decode($r['data'], true) ?: [];
        $c = cc_($d['workCountryCode'] ?? ''); $n = cc_($d['nationalityCode'] ?? '');
        if ($c === '') continue;
        $out[$c] = $out[$c] ?? ['n' => 0, 'nat' => 0, 'reg' => 0]; $out[$c]['n']++; $total++;
        $rk = preg_replace('/\s+/u', ' ', preg_replace('/^(منطقة|محافظة|provinsi|county)\s+/u', '', mb_strtolower(trim((string)($d['workRegion'] ?? '')))));
        if ($rk !== '' && empty($regs[$c][$rk])) { $regs[$c][$rk] = 1; $out[$c]['reg']++; }
        if ($n !== '' && empty($nats[$c][$n])) { $nats[$c][$n] = 1; $out[$c]['nat']++; }
        if ($n !== '') $allNat[$n] = 1;
    }
    $res = ['ok' => true, 'countries' => (object)$out, 'total' => $total, 'nationalities' => count($allNat)];
    kv_put('countries', json_encode($res), 300);
    return $res;
}

/* ============================================================ التسجيل من النموذج العام */
function submit(array $p): array {
    if (empty($p['raw']) || empty($p['ar'])) throw new HttpError('بيانات ناقصة');
    if (!empty($p['meta']['website'])) return ['ok' => false, 'error' => 'rejected'];
    if (rate_hit('submit:' . client_ip(), 20, 3600)) throw new HttpError('locked', 429);
    $raw = (array)$p['raw']; $ar = (array)$p['ar']; $meta = (array)($p['meta'] ?? []);
    foreach (['firstName', 'lastName', 'passportNo', 'workCountry', 'nationality', 'personalEmail'] as $k) if (empty($raw[$k])) throw new HttpError('حقل مطلوب مفقود: ' . $k);
    named_lock('bhr_submit');
    try {
        $passport = normalize_((string)$raw['passportNo']);
        $old = null; $dup = false;
        $hit = q1('SELECT ref FROM staff WHERE passport_norm=? ORDER BY id LIMIT 1', [$passport]);
        if ($hit) {
            /* لا يُسمح بتحديث سجل موجود إلا إذا طابق البريد الشخصي أو رقم الجوال المسجّلين مسبقًا */
            $o = staff_get($hit['ref']);
            $oldMail = strtolower(trim((string)($o['data']['personalEmail'] ?? ''))); $oldMob = substr(digits_($o['data']['mobile'] ?? ''), -8);
            $newMail = strtolower(trim((string)$raw['personalEmail'])); $newMob = substr(digits_($ar['mobile'] ?? ($raw['mobile'] ?? '')), -8);
            if (($oldMail !== '' && $oldMail === $newMail) || (strlen($oldMob) === 8 && $oldMob === $newMob)) $old = $o; else $dup = true;
        }
        $updated = (bool)$old;
        $ref = $updated ? $old['ref'] : next_ref((string)$raw['workCountry']);
        $d = [];
        foreach (staff_cols() as [$k, $title, $t]) {
            switch ($k) {
                case 'ref': case 'status': case 'createdAt': case 'updatedAt': case 'folder': case 'folderId': continue 2;
                case 'contractStatus': $d[$k] = ($raw['hasContract'] ?? '') === 'no' ? 'لا يوجد' : 'يوجد'; continue 2;
                case 'contractFile': $d[$k] = ($raw['hasContract'] ?? '') === 'no' ? 'لا يوجد' : ''; continue 2;
                case 'topDegree': $d[$k] = top_degree($ar['qualifications'] ?? []); continue 2;
                case 'lang': $d[$k] = safe_text($meta['lang'] ?? ''); continue 2;
                case 'tz': $d[$k] = safe_text($meta['tz'] ?? ''); continue 2;
                case 'workCountryCode': $d[$k] = cc_($ar['workCountryCode'] ?? ($raw['workCountry'] ?? '')); continue 2;
                case 'nationalityCode': $d[$k] = cc_($ar['nationalityCode'] ?? ($raw['nationality'] ?? '')); continue 2;
            }
            if ($t === 'f') continue;
            if ($t === 'n') { try { $n = parse_num($raw[$k] ?? ''); } catch (HttpError $e) { $n = null; } $d[$k] = $n === null ? '' : $n; continue; }
            if ($t === 'd') { $d[$k] = valid_date($raw[$k] ?? ''); continue; }
            $v = array_key_exists($k, $ar) && $ar[$k] !== null ? $ar[$k] : ($raw[$k] ?? '');
            $d[$k] = is_array($v) ? '' : safe_text($v);
        }
        $name = (string)($ar['fullNameLatin'] ?? '');
        $kids = [
            'quals' => array_map(function ($q, $i) use ($raw) { $rq = $raw['qualifications'][$i] ?? []; return array_map('safe_text', [$q['degree'] ?? '', $q['major'] ?? '', $q['institution'] ?? '', $q['country'] ?? '', (string)($rq['gradYear'] ?? ($q['gradYear'] ?? '')), $q['grade'] ?? '']); }, (array)($ar['qualifications'] ?? []), array_keys((array)($ar['qualifications'] ?? []))),
            'exp' => array_map(function ($x, $i) use ($raw) { $rx = $raw['experience'][$i] ?? []; return array_map('safe_text', [$x['org'] ?? '', $x['title'] ?? '', $x['country'] ?? '', $rx['from'] ?? ($x['from'] ?? ''), $rx['to'] ?? ($x['to'] ?? '')]); }, (array)($ar['experience'] ?? []), array_keys((array)($ar['experience'] ?? []))),
            'langs' => array_map(function ($l) { return array_map('safe_text', [$l['language'] ?? '', $l['level'] ?? '']); }, (array)($ar['languages'] ?? [])),
        ];
        if ($updated) {
            /* نصوص خانات المرفقات (مثل «لا يوجد») تبقى كما هي إن لم يغيّرها النموذج */
            foreach (staff_cols() as [$k, , $t]) if ($t === 'f' && !isset($d[$k]) && isset($old['data'][$k])) $d[$k] = $old['data'][$k];
        }
        $row = ['ref' => $ref, 'status' => ST_PENDING, 'created_at' => $updated ? $old['created_at'] : now(), 'updated_at' => now(), 'data' => $d] + $kids;
        staff_put($row);
        $token = uuid();
        kv_put('tok_' . $ref, $token, 21600);
        kv_put('upd_' . $ref, $updated ? '1' : '', 21600);
        audit_log($ref, $updated ? 'تحديث بيانات' : ($dup ? 'تسجيل جديد · رقم جواز مكرر يحتاج مراجعة' : 'تسجيل جديد'), $name . ' · ' . ($ar['workCountry'] ?? ''), 'النموذج العام');
        return ['ok' => true, 'ref' => $ref, 'token' => $token, 'updated' => $updated];
    } finally { named_unlock('bhr_submit'); }
}
function check_token($ref, $token): string {
    $ref = (string)$ref; $t = kv_get('tok_' . $ref);
    if (!$t || !hash_equals($t, (string)$token)) throw new HttpError('انتهت صلاحية جلسة الرفع، أعد الإرسال');
    return $ref;
}
function upload(array $b): array {
    $ref = check_token($b['ref'] ?? '', $b['token'] ?? '');
    $kind = (string)($b['kind'] ?? '');
    if (col_type($kind) !== 'f') throw new HttpError('نوع مرفق غير معروف');
    $r = staff_get($ref); if (!$r) throw new HttpError('الرقم المرجعي غير موجود', 404);
    $idx = max(1, (int)($b['idx'] ?? 1)); $total = max(1, (int)($b['total'] ?? 1));
    $base = clean_name($b['label'] ?? col_title($kind)) . ' - ' . clean_name(staff_name($r) ?: $ref) . ($total > 1 ? ' (' . $idx . ')' : '');
    $f = file_store($ref, $kind, (string)($b['data'] ?? ''), $idx, $base, 'المنسوب (النموذج)', $idx === 1);
    if ($kind === 'contractFile' && ($r['data']['contractFile'] ?? '') === 'لا يوجد') { $r['data']['contractFile'] = ''; staff_put($r); }
    return ['ok' => true, 'url' => file_url($f['id'])];
}
function finalize(array $b): array {
    $ref = (string)($b['ref'] ?? '');
    if ($ref !== '' && !empty($b['token']) && kv_get('done_' . $ref) === $b['token']) return ['ok' => true];
    check_token($ref, $b['token'] ?? '');
    $r = staff_get($ref); if (!$r) throw new HttpError('الرقم المرجعي غير موجود', 404);
    $updated = kv_get('upd_' . $ref) === '1';
    $r['status'] = ST_DONE; $r['updated_at'] = now(); staff_put($r);
    kv_del('countries'); kv_del('tok_' . $ref); kv_put('done_' . $ref, (string)$b['token'], 3600);
    audit_log($ref, 'اكتمل الرفع', '', 'النموذج العام');
    if (!$updated) notify_hr($r);
    try { send_confirm($r, $updated); } catch (Throwable $e) { audit_log($ref, 'تعذّر إرسال رسالة التأكيد', $e->getMessage()); }
    return ['ok' => true];
}
/* بطاقة المنسوب المتحركة (يصنعها المتصفح) تُحفظ مع ملفاته وتُرفق برسالة التأكيد */
function save_card(string $ref, string $name, string $gif, string $jpg, string $actor): void {
    if ($jpg !== '') file_store($ref, '_card_jpg', $jpg, 1, 'بطاقة المنسوب - ' . clean_name($name ?: $ref), $actor, true, ['image/jpeg', 'image/png']);
    if ($gif !== '') file_store($ref, '_card_gif', $gif, 1, 'بطاقة المنسوب - ' . clean_name($name ?: $ref) . ' (متحركة)', $actor, true, ['image/gif']);
}
function card_img(array $b): array {
    $ref = check_token($b['ref'] ?? '', $b['token'] ?? '');
    $r = staff_get($ref); if (!$r) throw new HttpError('الرقم المرجعي غير موجود', 404);
    save_card($ref, staff_name($r), (string)($b['gif'] ?? ''), (string)($b['jpg'] ?? ''), 'المنسوب (النموذج)');
    if (!empty($b['info'])) kv_put('mailinfo_' . $ref, mb_substr(json_encode($b['info'], JSON_UNESCAPED_UNICODE), 0, 90000), 21600);
    return ['ok' => true];
}

/* ============================================================ لوحة الموارد البشرية */
/* صف العرض: نفس قيم «العرض» في الجدول القديم (تواريخ yyyy-mm-dd، أرقام بفواصل، المرفقات روابط) */
function display_row(array $r, array $filesByKind, bool $finance): array {
    $o = [];
    foreach (staff_cols() as [$k, , $t]) {
        if ($k === 'folderId') continue;
        if ($t === 'f') { $u = array_map(function ($f) { return file_url($f['id']); }, $filesByKind[$k] ?? []); $o[$k] = $u ?: (string)($r['data'][$k] ?? ''); continue; }
        $v = $r['data'][$k] ?? '';
        $o[$k] = $t === 'n' ? fmt_num($v) : (string)$v;
    }
    $o['ref'] = $r['ref']; $o['status'] = $r['status']; $o['createdAt'] = substr($r['created_at'], 0, 16); $o['updatedAt'] = substr($r['updated_at'], 0, 16); $o['folder'] = '';
    if (!$finance) {
        foreach (['salary', 'swift', 'accountHolder', 'bankBranch', 'payOther'] as $k) if ($o[$k] !== '') $o[$k] = '••••';
        foreach (['iban', 'accountNo'] as $k) if ($o[$k] !== '') $o[$k] = '••••' . substr(preg_replace('/\s+/', '', $o[$k]), -4);
        $o['bankProof'] = is_array($o['bankProof']) && $o['bankProof'] ? ['#restricted'] : $o['bankProof'];
    }
    return $o;
}
function files_by_ref(): array {
    $by = [];
    foreach (q("SELECT id, ref, kind FROM files WHERE archived_at IS NULL AND LEFT(kind, 1) <> '_' ORDER BY created_at, idx") as $f) $by[$f['ref']][$f['kind']][] = $f;
    return $by;
}
function kid_rows(array $r, string $k): array {
    $nm = staff_name($r);
    return array_map(function ($x) use ($r, $nm) { return array_merge([$r['ref'], $nm], array_map('strval', $x)); }, $r[$k] ?? []);
}
function admin_list(): array {
    $u = require_perm('staff.view');
    $fin = has_perm($u, 'finance.view');
    $files = files_by_ref(); $rows = []; $kids = ['quals' => [KIDS['quals'][1]], 'exp' => [KIDS['exp'][1]], 'langs' => [KIDS['langs'][1]]];
    foreach (q('SELECT ref FROM staff ORDER BY id')->fetchAll() as $x) {
        $r = staff_get($x['ref']);
        $rows[] = display_row($r, $files[$r['ref']] ?? [], $fin);
        foreach (array_keys(KIDS) as $k) foreach (kid_rows($r, $k) as $kr) $kids[$k][] = $kr;
    }
    audit_log('', 'عرض بيانات المنسوبين', $u['_label'], $u['_label']);
    $audit = has_perm($u, 'audit.view') ? array_map(function ($a) { return [substr($a['at'], 0, 16), $a['action'], $a['detail']]; },
        q("SELECT at, action, detail FROM audit WHERE action IN ('تسجيل دخول','دخول لوحة البيانات','محاولة دخول خاطئة') ORDER BY id DESC LIMIT 80")->fetchAll()) : [];
    return ['ok' => true, 'at' => now_min(), 'who' => $u['_label'], 'user' => user_public($u), 'audit' => $audit,
        'cols' => array_values(array_filter(staff_cols(), function ($c) { return $c[0] !== 'folderId'; })),
        'rows' => $rows, 'quals' => $kids['quals'], 'exp' => $kids['exp'], 'langs' => $kids['langs'], 'sheetUrl' => '',
        'mailed' => json_decode(setting('mailed', '{}'), true) ?: (object)[]];
}
function latest_photo(string $ref): ?array {
    $f = q1("SELECT * FROM files WHERE ref=? AND kind='photo' AND archived_at IS NULL ORDER BY created_at DESC, idx LIMIT 1", [$ref]);
    if (!$f || strpos($f['mime'], 'image/') !== 0) return null;
    return ['mime' => $f['mime'], 'b64' => base64_encode(file_bytes($f))];
}
function photo(array $b): array {
    require_perm('staff.view');
    if (!staff_get((string)($b['ref'] ?? ''))) throw new HttpError('not_found', 404);
    $p = latest_photo((string)$b['ref']);
    return $p ? ['ok' => true, 'mime' => $p['mime'], 'b64' => $p['b64']] : ['ok' => true, 'none' => true];
}

/* التعديل (من لوحة الموارد البشرية أو من المنسوب نفسه) — تُكتب التغييرات فقط ويُسجَّل الفرق في السجل */
function update_core(array $b, string $who, bool $self, bool $finance): array {
    $ref = (string)($b['ref'] ?? '');
    named_lock('bhr_rec_' . $ref, 20);
    try {
        $r = staff_get($ref); if (!$r) throw new HttpError('الرقم المرجعي غير موجود', 404);
        $ch = (array)($b['changes'] ?? []); $done = []; $nameChanged = false; $statusSet = false;
        foreach ($ch as $k => $v) {
            $k = (string)$k; $t = col_type($k);
            if (!$t || in_array($k, ADMIN_LOCKED, true) || ($self && in_array($k, SELF_LOCKED, true)) || $t === 'f') continue;
            if (!$finance && in_array($k, FINANCE_KEYS, true)) continue;
            $old = $k === 'status' ? $r['status'] : ($r['data'][$k] ?? '');
            $v = is_array($v) ? '' : trim((string)($v ?? ''));
            if ($t === 'd') { if ($v !== '' && valid_date($v) === '') throw new HttpError('تاريخ غير صالح في «' . col_title($k) . '»'); $new = $v; }
            elseif ($t === 'n') { try { $n = parse_num($v); } catch (HttpError $e) { throw new HttpError('رقم غير صالح في «' . col_title($k) . '»'); } $new = $n === null ? '' : $n; }
            else $new = in_array($k, ['workCountryCode', 'nationalityCode'], true) ? cc_($v) : safe_text($v);
            if ((string)$new === (string)$old) continue;
            if ($k === 'status') { $r['status'] = (string)$new; $statusSet = true; } else $r['data'][$k] = $new;
            if (in_array($k, NAME_PARTS, true)) $nameChanged = true;
            $show = function ($x) use ($t) { return $t === 'n' ? fmt_num($x) : (string)$x; };
            $done[] = in_array($k, FINANCE_KEYS, true) ? col_title($k) . ': (تغيّرت — القيمة لا تُكتب في السجل)' : col_title($k) . ': «' . ($show($old) ?: '—') . '» ← «' . ($show($new) ?: '—') . '»';
        }
        if ($nameChanged) {
            $j = function (array $ks) use ($r) { return trim(preg_replace('/\s+/u', ' ', implode(' ', array_filter(array_map(function ($k) use ($r) { return trim((string)($r['data'][$k] ?? '')); }, $ks), 'strlen')))); };
            $r['data']['fullNameAr'] = safe_text($j(['firstNameAr', 'fatherNameAr', 'grandNameAr', 'lastNameAr']));
            $r['data']['fullNameLatin'] = safe_text(mb_strtoupper($j(['firstName', 'fatherName', 'grandName', 'lastName'])));
        }
        foreach (KIDS as $kk => [$title, , $n]) {
            if (!isset($b[$kk]) || !is_array($b[$kk])) continue;
            $rows = [];
            foreach ($b[$kk] as $x) {
                if (!is_array($x)) continue;
                $o = []; for ($i = 0; $i < $n; $i++) $o[] = safe_text($x[$i] ?? '');
                if (implode('', $o) !== '') $rows[] = $o;
            }
            $r[$kk] = $rows; $done[] = $title . ': ' . count($rows) . ' صف';
        }
        if (!$done) return ['ok' => true, 'changed' => 0];
        $r['updated_at'] = now();
        if (!$statusSet && $r['status'] === 'محدَّث') $r['status'] = ST_DONE;
        staff_put($r);
        kv_del('countries');
        audit_log($ref, $self ? 'تحديث ذاتي من المنسوب' : 'تعديل من لوحة الموارد البشرية', $who . ' · ' . implode(' | ', $done), $who);
        return ['ok' => true, 'changed' => count($done)];
    } finally { named_unlock('bhr_rec_' . $ref); }
}
function admin_update(array $b): array { $u = require_perm('staff.edit'); return update_core($b, $u['_label'], false, has_perm($u, 'finance.view')); }

function upload_core(array $b, string $who, bool $self): array {
    $ref = (string)($b['ref'] ?? ''); $kind = (string)($b['kind'] ?? '');
    $r = staff_get($ref); if (!$r) throw new HttpError('الرقم المرجعي غير موجود', 404);
    if (col_type($kind) !== 'f') throw new HttpError('نوع مرفق غير معروف');
    $idx = max(1, (int)($b['idx'] ?? 1)); $total = max(1, (int)($b['total'] ?? 1));
    $base = clean_name(col_title($kind)) . ' - ' . clean_name(staff_name($r) ?: $ref) . ($total > 1 ? ' (' . $idx . ')' : '');
    $f = file_store($ref, $kind, (string)($b['data'] ?? ''), $idx, $base, $who, $idx === 1);
    if ($idx >= $total) {
        if (in_array($r['data'][$kind] ?? '', ['لا يوجد'], true)) $r['data'][$kind] = '';
        $r['updated_at'] = now(); staff_put($r);
        audit_log($ref, $self ? 'استبدال مرفق من المنسوب' : 'استبدال مرفق من لوحة الموارد البشرية', $who . ' · ' . col_title($kind) . ' · ' . $total . ' ملف (السابق محفوظ في الأرشيف)', $who);
    }
    return ['ok' => true, 'url' => file_url($f['id'])];
}
function admin_upload(array $b): array {
    $u = require_perm('staff.files');
    if (!has_perm($u, 'finance.view') && in_array($b['kind'] ?? '', FINANCE_KEYS, true)) throw new HttpError('forbidden', 403);
    return upload_core($b, $u['_label'], false);
}
function admin_mail(array $b): array {
    $u = require_perm('staff.mail');
    $r = staff_get((string)($b['ref'] ?? '')); if (!$r) throw new HttpError('الرقم المرجعي غير موجود', 404);
    if (!empty($b['skipIfMailed']) && !empty((json_decode(setting('mailed', '{}'), true) ?: [])[$r['ref']])) return ['ok' => true, 'skipped' => true];
    if (!empty($b['gif']) || !empty($b['jpg'])) save_card($r['ref'], staff_name($r), (string)($b['gif'] ?? ''), (string)($b['jpg'] ?? ''), $u['_label']);
    $to = send_confirm($r, false, is_array($b['info'] ?? null) ? $b['info'] : null);
    if ($to === '') throw new HttpError('لا يوجد بريد إلكتروني مسجّل لهذا المنسوب');
    audit_log($r['ref'], 'إعادة إرسال رسالة التأكيد من لوحة الموارد البشرية', $u['_label'] . ' · ' . $to, $u['_label']);
    return ['ok' => true, 'to' => $to];
}
/* رسالة مباشرة من الموارد البشرية إلى منسوب (بريد) — تُحفظ في سجل الرسائل */
function admin_message(array $b): array {
    $u = require_perm('staff.mail');
    $r = staff_get((string)($b['ref'] ?? '')); if (!$r) throw new HttpError('الرقم المرجعي غير موجود', 404);
    $to = trim((string)(($b['to'] ?? '') === 'personal' ? ($r['data']['personalEmail'] ?? '') : (($r['data']['officialEmail'] ?? '') ?: ($r['data']['personalEmail'] ?? ''))));
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) throw new HttpError('لا يوجد بريد إلكتروني مسجّل لهذا المنسوب');
    $subject = mb_substr(safe_text($b['subject'] ?? ''), 0, 200); $body = mb_substr(safe_text($b['body'] ?? ''), 0, 8000);
    if ($subject === '' || $body === '') throw new HttpError('اكتب العنوان والرسالة');
    if (rate_hit('msg:' . $u['id'], 200, 86400)) throw new HttpError('too_many', 429);
    $inner = '<div style="font-size:14px;line-height:2;color:#1D2A3B;white-space:pre-wrap;">' . nl2br(esc_html($body)) . '</div>'
        . '<p style="margin:16px 0 4px;font-size:13px;color:#6B778A;">' . esc_html($u['name'] . ($u['title'] ? ' · ' . $u['title'] : '')) . '</p>';
    send_mail($to, $subject, mail_frame('الموارد البشرية · مجموعة بنيان العالمية', $subject, $inner), $body, 'الموارد البشرية · مجموعة بنيان العالمية', logo_inline(), (string)cfg('hr_notify'));
    q('INSERT INTO messages (ref, channel, to_addr, subject, body, sent_by, at) VALUES (?,?,?,?,?,?,?)', [$r['ref'], 'mail', $to, $subject, $body, $u['_label'], now()]);
    audit_log($r['ref'], 'رسالة من الموارد البشرية', $u['_label'] . ' · ' . $to . ' · ' . $subject, $u['_label']);
    return ['ok' => true, 'to' => $to];
}

/* ============================================================ «تحديث بياناتي»
   ١) رابط الرسالة الخاص (k) يفتح السجل مباشرة بعد كتابة الرقم المرجعي
   ٢) بدون الرابط: يكتب البريد أو الجوال المسجّل ← يصله رمز من ٦ أرقام على بريده المسجّل ← يكتب الرمز فيفتح السجل */
function row_obj(array $r): array {
    $have = []; foreach (files_of($r['ref']) as $f) $have[$f['kind']] = ($have[$f['kind']] ?? 0) + 1;
    $o = [];
    foreach (staff_cols() as [$k, , $t]) {
        if ($k === 'folderId' || $k === 'folder') continue;
        if ($t === 'f') { $o[$k] = $have[$k] ?? 0; continue; }
        $v = $r['data'][$k] ?? ''; $o[$k] = $t === 'n' ? fmt_num($v) : (string)$v;
    }
    $o['ref'] = $r['ref']; $o['status'] = $r['status']; $o['createdAt'] = substr($r['created_at'], 0, 16); $o['updatedAt'] = substr($r['updated_at'], 0, 16);
    $kids = []; foreach (KIDS as $k => $def) $kids[$k] = array_merge([$def[1]], kid_rows($r, $k));
    return ['rec' => $o, 'kids' => $kids];
}
function self_start(array $b): array {
    $ref = strtoupper(preg_replace('/\s+/', '', (string)($b['ref'] ?? '')));
    $fk = 'selffail_' . $ref;
    if (rate_count($fk) >= 6 || rate_hit('selfip:' . client_ip(), 40, 3600)) throw new HttpError('locked', 429);
    $r = $ref !== '' ? staff_get($ref) : null;
    $ok = false;
    if ($r) {
        $mails = array_values(array_filter(array_map(function ($k) use ($r) { return strtolower(trim((string)($r['data'][$k] ?? ''))); }, ['officialEmail', 'personalEmail'])));
        if (!empty($b['k']) && hash_equals(self_sig($ref), (string)$b['k'])) $ok = true;
        elseif (!empty($b['otp'])) {
            $st = json_decode((string)kv_get('selfotp_' . $ref), true);
            $code = to_ascii_digits(preg_replace('/\s+/', '', (string)$b['otp']));
            if ($st && $st['n'] < 5 && hash_equals($st['h'], hash_hmac('sha256', $ref . ':' . $code, app_secret()))) { $ok = true; kv_del('selfotp_' . $ref); }
            elseif ($st) { $st['n']++; kv_put('selfotp_' . $ref, json_encode($st), 600); }
            if (!$ok) { rate_hit($fk, 6, 900); usleep(600000); throw new HttpError('otp_bad', 401); }
        } elseif (!empty($b['contact'])) {
            $c = strtolower(trim((string)$b['contact'])); $cd = substr(digits_($c), -8);
            $mobs = array_map(function ($k) use ($r) { return substr(digits_($r['data'][$k] ?? ''), -8); }, ['mobile', 'whatsapp']);
            $match = (str_contains($c, '@') && in_array($c, $mails, true)) || (strlen($cd) === 8 && in_array($cd, $mobs, true));
            if ($match && $mails) {
                $to = str_contains($c, '@') ? $c : $mails[0];
                if (rate_hit('selfotp_mail:' . $ref, 5, 3600)) throw new HttpError('locked', 429);
                $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                kv_put('selfotp_' . $ref, json_encode(['h' => hash_hmac('sha256', $ref . ':' . $code, app_secret()), 'n' => 0]), 600);
                send_self_code($to, staff_name($r), $ref, $code, mail_lang($b['lang'] ?? ($r['data']['lang'] ?? 'ar')));
                audit_log($ref, 'إرسال رمز التحقق لصفحة التحديث', mask_email($to), 'المنسوب نفسه');
                return ['ok' => true, 'otp' => true, 'to' => mask_email($to)];
            }
        }
    }
    if (!$ok) { rate_hit($fk, 6, 900); usleep(600000); throw new HttpError('self_bad', 401); }
    rate_clear($fk);
    $token = uuid(); kv_put('self_' . $ref, $token, 7200);
    audit_log($ref, 'فتح صفحة التحديث الذاتي', !empty($b['k']) ? 'عبر رابط الرسالة' : 'برمز التحقق على البريد', 'المنسوب نفسه');
    $out = row_obj($r); $ph = latest_photo($ref);
    return ['ok' => true, 'ref' => $ref, 'token' => $token, 'rec' => $out['rec'], 'kids' => $out['kids'],
        'cols' => array_values(array_filter(staff_cols(), function ($c) { return $c[0] !== 'folderId' && $c[0] !== 'folder'; })),
        'photo' => $ph ? 'data:' . $ph['mime'] . ';base64,' . $ph['b64'] : ''];
}
function self_check(array $b): string {
    $ref = strtoupper((string)($b['ref'] ?? '')); $t = kv_get('self_' . $ref);
    if (!$t || !hash_equals($t, (string)($b['token'] ?? ''))) throw new HttpError('self_expired', 401);
    return $ref;
}
function self_update(array $b): array {
    $b['ref'] = self_check($b);
    $res = update_core($b, 'المنسوب نفسه', true, true);
    $out = row_obj(staff_get($b['ref'])); $res['rec'] = $out['rec']; $res['kids'] = $out['kids'];
    return $res;
}
function self_upload(array $b): array { $b['ref'] = self_check($b); return upload_core($b, 'المنسوب نفسه', true); }
function self_finish(array $b): array {
    $ref = self_check($b); $r = staff_get($ref);
    if (!empty($b['gif']) || !empty($b['jpg'])) save_card($ref, staff_name($r), (string)($b['gif'] ?? ''), (string)($b['jpg'] ?? ''), 'المنسوب نفسه');
    $to = '';
    try { $to = send_confirm($r, true, is_array($b['info'] ?? null) ? $b['info'] : null); } catch (Throwable $e) { audit_log($ref, 'تعذّر إرسال رسالة التأكيد', $e->getMessage()); }
    return ['ok' => true, 'mailed' => $to !== ''];
}
