<?php
/**
 * ============================================================
 *  Bonyan HR · خادم المنصة (PHP + MySQL) — الإقلاع المشترك
 * ============================================================
 *  - يقرأ ملف الإعدادات من خارج المجلد العام (لا يُحفظ في GitHub)
 *  - يتصل بقاعدة البيانات وينشئ الجداول تلقائيًا عند أول تشغيل
 *  - أدوات مشتركة: ذاكرة مؤقتة (kv)، إعدادات، سجل تدقيق متسلسل بالبصمة
 */
declare(strict_types=1);
date_default_timezone_set('Asia/Riyadh');
mb_internal_encoding('UTF-8');

const BHR_VERSION = '2.0.0';

final class HttpError extends Exception {
    public int $status;
    public function __construct(string $code, int $status = 400) { parent::__construct($code); $this->status = $status; }
}

/* ============================================================ الإعدادات */
function bhr_config_paths(): array {
    $paths = [];
    if ($p = getenv('BHR_CONFIG')) $paths[] = $p;
    $home = getenv('HOME') ?: (function_exists('posix_getpwuid') && function_exists('posix_geteuid') ? (posix_getpwuid(posix_geteuid())['dir'] ?? '') : '');
    if ($home) $paths[] = rtrim($home, '/') . '/bonyan-hr-private/config.php';
    /* على هوستنجر: /home/u123456789/domains/... ← المجلد الخاص في /home/u123456789/bonyan-hr-private */
    if (preg_match('~^(/home/[^/]+)/~', __DIR__, $m)) $paths[] = $m[1] . '/bonyan-hr-private/config.php';
    $paths[] = __DIR__ . '/config.php';
    return $paths;
}
function cfg(?string $key = null, $default = null) {
    static $C = null;
    if ($C === null) {
        $from = '';
        foreach (bhr_config_paths() as $p) { if (is_file($p)) { $C = require $p; $from = $p; break; } }
        if (!is_array($C)) throw new HttpError('not_setup', 503);
        /* مجلد التخزين الافتراضي: بجانب ملف الإعدادات (خارج المجلد العام) */
        if (empty($C['storage'])) $C['storage'] = dirname($from) . '/storage';
        $C += [
            'site_url' => 'https://hr.bonyanglobal.com/', 'ref_prefix' => 'BNY-HR', 'storage' => '',
            'hr_notify' => '', 'mail_only_to' => '', 'dev_email' => 'osama.mo.bonyan@gmail.com',
            'session_hours' => 12, 'idle_minutes' => 120, 'accounts' => [], 'self_secret' => '', 'import_token' => '',
        ];
        $C['site_url'] = rtrim((string)$C['site_url'], '/') . '/';
    }
    if ($key === null) return $C;
    return $C[$key] ?? $default;
}

/* مجلد التخزين الخاص (المرفقات والنسخ الاحتياطية) — يجب أن يكون خارج أي مجلد عام */
function storage_dir(string $sub = ''): string {
    $base = (string)cfg('storage');
    if ($base === '') throw new HttpError('storage_not_set', 503);
    $base = rtrim($base, '/');
    $docroot = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
    if ($docroot !== '' && strpos($base . '/', $docroot . '/') === 0) throw new HttpError('storage_inside_webroot', 503);
    if (preg_match('~/public_html(/|$)~', $base)) throw new HttpError('storage_inside_webroot', 503);
    $dir = $base . ($sub !== '' ? '/' . trim($sub, '/') : '');
    if (!is_dir($dir)) { @mkdir($dir, 0750, true); }
    if (!is_file($base . '/.htaccess')) { @file_put_contents($base . '/.htaccess', "Require all denied\nDeny from all\n"); }
    return $dir;
}

/* ============================================================ قاعدة البيانات */
function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $d = cfg('db');
    if (!is_array($d) || empty($d['name'])) throw new HttpError('not_setup', 503);
    $dsn = 'mysql:host=' . ($d['host'] ?? 'localhost') . ';port=' . ($d['port'] ?? 3306) . ';dbname=' . $d['name'] . ';charset=utf8mb4';
    $pdo = new PDO($dsn, $d['user'] ?? '', $d['pass'] ?? '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '+03:00'");
    migrate($pdo);
    return $pdo;
}
function q(string $sql, array $args = []): PDOStatement { $st = db()->prepare($sql); $st->execute($args); return $st; }
function q1(string $sql, array $args = []) { $r = q($sql, $args)->fetch(); return $r === false ? null : $r; }
function now(): string { return date('Y-m-d H:i:s'); }
function now_min(): string { return date('Y-m-d H:i'); }

const BHR_SCHEMA_VERSION = 3;
function migrate(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (k VARCHAR(64) PRIMARY KEY, v TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $v = $pdo->query("SELECT v FROM settings WHERE k='schema'")->fetchColumn();
    if ((int)$v >= BHR_SCHEMA_VERSION) return;
    if ((int)$v < 1) migrate_v1($pdo);
    /* ٢) من يصله تنبيه «تسجيل جديد» والتنبيه الأسبوعي: فارغ = حسب الدور (مدير النظام والموارد البشرية) */
    $has = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'notify'")->fetchColumn();
    if (!(int)$has) { try { $pdo->exec('ALTER TABLE users ADD COLUMN notify TINYINT NULL'); } catch (PDOException $e) { if (stripos($e->getMessage(), 'Duplicate column') === false) throw $e; } } /* طلبان متزامنان قد يضيفان العمود معًا */
    /* ٣) ربط حساب الدخول بسجل المنسوب (صفحة المنسوب الخاصة) */
    $has = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'staff_ref'")->fetchColumn();
    if (!(int)$has) { try { $pdo->exec('ALTER TABLE users ADD COLUMN staff_ref VARCHAR(40) NULL'); } catch (PDOException $e) { if (stripos($e->getMessage(), 'Duplicate column') === false) throw $e; } } /* طلبان متزامنان قد يضيفان العمود معًا */
    $pdo->prepare("REPLACE INTO settings (k, v) VALUES ('schema', ?)")->execute([(string)BHR_SCHEMA_VERSION]);
}
function migrate_v1(PDO $pdo): void {
    $T = ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
    $pdo->exec("CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY, ref VARCHAR(40) NOT NULL, status VARCHAR(40) NOT NULL DEFAULT '',
        passport_norm VARCHAR(64) NOT NULL DEFAULT '', created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL,
        data LONGTEXT NOT NULL, quals LONGTEXT NULL, exp LONGTEXT NULL, langs LONGTEXT NULL,
        UNIQUE KEY u_ref (ref), KEY k_pass (passport_norm))" . $T);
    $pdo->exec("CREATE TABLE IF NOT EXISTS files (
        id CHAR(32) PRIMARY KEY, ref VARCHAR(40) NOT NULL, kind VARCHAR(40) NOT NULL, idx INT NOT NULL DEFAULT 1,
        name VARCHAR(255) NOT NULL, mime VARCHAR(80) NOT NULL, size INT NOT NULL, sha256 CHAR(64) NOT NULL, path VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL, created_by VARCHAR(190) NOT NULL DEFAULT '', archived_at DATETIME NULL, archived_by VARCHAR(190) NULL,
        KEY k_ref (ref, kind, archived_at))" . $T);
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(190) NOT NULL, name VARCHAR(160) NOT NULL DEFAULT '', title VARCHAR(160) NOT NULL DEFAULT '',
        role VARCHAR(20) NOT NULL DEFAULT 'hr', perms TEXT NULL, active TINYINT NOT NULL DEFAULT 1, fails INT NOT NULL DEFAULT 0,
        locked_until DATETIME NULL, created_at DATETIME NOT NULL, last_login_at DATETIME NULL, UNIQUE KEY u_email (email))" . $T);
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_codes (
        id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, code_hash CHAR(64) NOT NULL, expires_at DATETIME NOT NULL,
        attempts INT NOT NULL DEFAULT 0, used_at DATETIME NULL, ip VARCHAR(64) NOT NULL DEFAULT '', created_at DATETIME NOT NULL, KEY k_user (user_id))" . $T);
    $pdo->exec("CREATE TABLE IF NOT EXISTS sessions (
        id CHAR(64) PRIMARY KEY, user_id INT NOT NULL, created_at DATETIME NOT NULL, last_seen_at DATETIME NOT NULL,
        expires_at DATETIME NOT NULL, ip VARCHAR(64) NOT NULL DEFAULT '', ua VARCHAR(255) NOT NULL DEFAULT '', KEY k_user (user_id))" . $T);
    $pdo->exec("CREATE TABLE IF NOT EXISTS kv (k VARCHAR(190) PRIMARY KEY, v LONGTEXT NOT NULL, expires_at DATETIME NULL, KEY k_exp (expires_at))" . $T);
    $pdo->exec("CREATE TABLE IF NOT EXISTS audit (
        id BIGINT AUTO_INCREMENT PRIMARY KEY, at DATETIME NOT NULL, ref VARCHAR(40) NOT NULL DEFAULT '', action VARCHAR(190) NOT NULL,
        detail TEXT NOT NULL, actor VARCHAR(190) NOT NULL DEFAULT '', ip VARCHAR(64) NOT NULL DEFAULT '',
        prev_hash CHAR(64) NOT NULL, hash CHAR(64) NOT NULL, KEY k_ref (ref), KEY k_action (action))" . $T);
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY, ref VARCHAR(40) NOT NULL DEFAULT '', channel VARCHAR(20) NOT NULL, to_addr VARCHAR(190) NOT NULL,
        subject VARCHAR(255) NOT NULL DEFAULT '', body TEXT NOT NULL, sent_by VARCHAR(190) NOT NULL DEFAULT '', at DATETIME NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'sent', KEY k_ref (ref))" . $T);
    $pdo->prepare("REPLACE INTO settings (k, v) VALUES ('schema', ?)")->execute([(string)BHR_SCHEMA_VERSION]);
}

/* ============================================================ الإعدادات الداخلية والأسرار */
function setting(string $k, ?string $default = null): ?string { $r = q1('SELECT v FROM settings WHERE k=?', [$k]); return $r ? $r['v'] : $default; }
function setting_set(string $k, string $v): void { q('REPLACE INTO settings (k, v) VALUES (?, ?)', [$k, $v]); }
/* سرّ التطبيق: يُولَّد تلقائيًا أول مرة ويُحفظ في قاعدة البيانات */
function app_secret(): string {
    $s = setting('app_secret');
    if (!$s) { $s = bin2hex(random_bytes(32)); setting_set('app_secret', $s); }
    return $s;
}
function self_secret(): string {
    $c = (string)cfg('self_secret');
    if ($c !== '') return $c; /* يمكن نسخ SELF_SECRET من Apps Script لتبقى روابط الرسائل القديمة صالحة */
    $s = setting('self_secret');
    if (!$s) { $s = bin2hex(random_bytes(32)); setting_set('self_secret', $s); }
    return $s;
}

/* ============================================================ الذاكرة المؤقتة (بديل CacheService) */
function kv_get(string $k): ?string {
    $r = q1('SELECT v, expires_at FROM kv WHERE k=?', [$k]);
    if (!$r) return null;
    if ($r['expires_at'] !== null && $r['expires_at'] < now()) { q('DELETE FROM kv WHERE k=?', [$k]); return null; }
    return $r['v'];
}
function kv_put(string $k, string $v, int $ttl = 0): void {
    q('REPLACE INTO kv (k, v, expires_at) VALUES (?, ?, ?)', [$k, $v, $ttl > 0 ? date('Y-m-d H:i:s', time() + $ttl) : null]);
}
function kv_del(string $k): void { q('DELETE FROM kv WHERE k=?', [$k]); }
function kv_gc(): void { if (random_int(1, 50) === 1) q('DELETE FROM kv WHERE expires_at IS NOT NULL AND expires_at < ?', [now()]); }

/* عدّاد محاولات بنافذة زمنية: يعيد true إن تجاوز الحد */
function rate_hit(string $key, int $limit, int $window): bool {
    $k = 'rl:' . $key;
    $n = (int)(kv_get($k) ?? 0) + 1;
    if ($n === 1) kv_put($k, '1', $window); else q('UPDATE kv SET v=? WHERE k=?', [(string)$n, $k]);
    return $n > $limit;
}
function rate_count(string $key): int { return (int)(kv_get('rl:' . $key) ?? 0); }
function rate_clear(string $key): void { kv_del('rl:' . $key); }

/* ============================================================ سجل التدقيق (متسلسل بالبصمة: أي تعديل أو حذف لسطر سابق يكسر السلسلة ويظهر في فحص السلامة) */
function audit_log(string $ref, string $action, string $detail = '', string $actor = ''): void {
    $own = false;
    try {
        $pdo = db();
        $own = !$pdo->inTransaction();
        if ($own) $pdo->beginTransaction();
        $prev = $pdo->query('SELECT hash FROM audit ORDER BY id DESC LIMIT 1 FOR UPDATE')->fetchColumn() ?: str_repeat('0', 64);
        $at = now(); $ip = client_ip(); $detail = mb_substr($detail, 0, 2000); $action = mb_substr($action, 0, 190); $actor = mb_substr($actor, 0, 190);
        $hash = hash('sha256', implode("\x1f", [$prev, $at, $ref, $action, $detail, $actor, $ip]));
        $pdo->prepare('INSERT INTO audit (at, ref, action, detail, actor, ip, prev_hash, hash) VALUES (?,?,?,?,?,?,?,?)')
            ->execute([$at, $ref, $action, $detail, $actor, $ip, $prev, $hash]);
        if ($own) $pdo->commit();
    } catch (Throwable $e) { try { if ($own && db()->inTransaction()) db()->rollBack(); } catch (Throwable $e2) { } }
}
function audit_verify(): array {
    $prev = str_repeat('0', 64); $n = 0;
    foreach (q('SELECT * FROM audit ORDER BY id') as $r) {
        $n++;
        $h = hash('sha256', implode("\x1f", [$prev, $r['at'], $r['ref'], $r['action'], $r['detail'], $r['actor'], $r['ip']]));
        if ($r['prev_hash'] !== $prev || $r['hash'] !== $h) return ['ok' => false, 'rows' => $n, 'brokenAt' => (int)$r['id']];
        $prev = $r['hash'];
    }
    return ['ok' => true, 'rows' => $n];
}

/* ============================================================ أدوات */
function client_ip(): string { return substr((string)($_SERVER['REMOTE_ADDR'] ?? 'cli'), 0, 64); }
function normalize_(string $v): string { return strtoupper(preg_replace('/\s+/u', '', $v)); }
function cc_($v): string { $v = strtoupper(trim((string)$v)); return preg_match('/^[A-Z]{2}$/', $v) ? $v : ''; }
function digits_($v): string { return preg_replace('/\D+/', '', (string)$v); }
/* تنظيف النص: مسافات موحّدة، ومنع الصيغ في أي تصدير إلى Excel/Sheets */
function safe_text($v): string {
    if (is_array($v) || is_object($v)) return '';
    $v = (string)($v ?? '');
    $v = preg_replace('/[ \t\x{00a0}]+/u', ' ', $v);
    $v = preg_replace('/ ?\n ?/u', "\n", $v);
    $v = trim(str_replace("\r", '', $v));
    $v = preg_replace('/[\x00-\x08\x0b\x0c\x0e-\x1f]/u', '', $v);
    return mb_substr($v, 0, 4000);
}
function csv_safe(string $v): string { return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v; }
function esc_html($v): string { return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function to_ascii_digits(string $v): string {
    return strtr($v, ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9', '٬' => '', '٫' => '.']);
}
function b64url(string $raw): string { return rtrim(strtr(base64_encode($raw), '+/', '-_'), '='); }
function uuid(): string { $b = random_bytes(16); $b[6] = chr(ord($b[6]) & 0x0f | 0x40); $b[8] = chr(ord($b[8]) & 0x3f | 0x80); return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4)); }
function mask_email(string $e): string {
    if (!str_contains($e, '@')) return '';
    [$u, $d] = explode('@', $e, 2);
    return mb_substr($u, 0, 2) . str_repeat('•', max(2, min(6, mb_strlen($u) - 2))) . '@' . $d;
}
