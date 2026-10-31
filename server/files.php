<?php
/**
 * المرفقات
 * - تُحفظ خارج المجلد العام في: <التخزين>/staff/<الرقم المرجعي>/<معرّف عشوائي>.<الامتداد>
 * - يُفحص النوع الحقيقي من أول بايتات الملف (لا يُوثق بما يرسله المتصفح): PDF وJPEG وPNG وWEBP وGIF فقط
 * - الملف المستبدَل لا يُحذف: يُنقل إلى الأرشيف (archived_at) ويبقى قابلًا للاسترجاع
 * - لا يُعرض أي ملف إلا لجلسة لها صلاحية عرض المنسوبين، أو للمنسوب نفسه داخل جلسة التحديث
 */
declare(strict_types=1);

const MAX_FILE_BYTES = 12 * 1024 * 1024;

function sniff_mime(string $bytes): ?string {
    $h = substr($bytes, 0, 16);
    if (strncmp($h, '%PDF-', 5) === 0) return 'application/pdf';
    if (strncmp($h, "\xFF\xD8\xFF", 3) === 0) return 'image/jpeg';
    if (strncmp($h, "\x89PNG\r\n\x1a\n", 8) === 0) return 'image/png';
    if (strncmp($h, 'RIFF', 4) === 0 && substr($h, 8, 4) === 'WEBP') return 'image/webp';
    if (strncmp($h, 'GIF87a', 6) === 0 || strncmp($h, 'GIF89a', 6) === 0) return 'image/gif';
    return null;
}
function mime_ext(string $m): string { return ['application/pdf' => 'pdf', 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'][$m] ?? 'bin'; }
function clean_name($v): string { return mb_substr(trim(preg_replace('/\s+/u', ' ', preg_replace('~[\\\\/:*?"<>|\n\r]+~u', '-', (string)$v))), 0, 80); }

/* يحفظ ملفًا ويعيد صفّه. $replace: ينقل ملفات الخانة الحالية إلى الأرشيف قبل الحفظ (أول ملف في الدفعة) */
function file_store(string $ref, string $kind, string $b64, int $idx, string $displayBase, string $actor, bool $replace, array $allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']): array {
    $bytes = base64_decode(preg_replace('/^data:[^,]*,/', '', $b64), true);
    if ($bytes === false || $bytes === '') throw new HttpError('bad_file');
    if (strlen($bytes) > MAX_FILE_BYTES) throw new HttpError('الملف كبير جدًا');
    $mime = sniff_mime($bytes);
    if (!$mime || !in_array($mime, $allowed, true)) throw new HttpError('نوع الملف غير مسموح: PDF أو صورة فقط');
    if (!preg_match('/^[A-Z0-9-]{6,40}$/', $ref)) throw new HttpError('bad_ref');
    $dir = storage_dir('staff/' . $ref);
    if ($replace) q('UPDATE files SET archived_at=?, archived_by=? WHERE ref=? AND kind=? AND archived_at IS NULL', [now(), $actor, $ref, $kind]);
    $id = bin2hex(random_bytes(16));
    $rel = 'staff/' . $ref . '/' . $id . '.' . mime_ext($mime);
    if (file_put_contents(storage_dir() . '/' . $rel, $bytes, LOCK_EX) === false) throw new HttpError('storage_write_failed', 500);
    @chmod(storage_dir() . '/' . $rel, 0640);
    $name = $displayBase . '.' . mime_ext($mime);
    q('INSERT INTO files (id, ref, kind, idx, name, mime, size, sha256, path, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [$id, $ref, $kind, $idx, $name, $mime, strlen($bytes), hash('sha256', $bytes), $rel, now(), $actor]);
    return ['id' => $id, 'name' => $name, 'mime' => $mime, 'size' => strlen($bytes)];
}
function files_of(string $ref, ?string $kind = null, bool $archived = false): array {
    $sql = 'SELECT * FROM files WHERE ref=?' . ($kind !== null ? ' AND kind=?' : '') . ($archived ? '' : ' AND archived_at IS NULL') . ' ORDER BY kind, created_at, idx';
    return q($sql, $kind !== null ? [$ref, $kind] : [$ref])->fetchAll();
}
function file_url(string $id): string { return cfg('site_url') . 'api/?action=file&id=' . $id; }
function file_bytes(array $f): string {
    $p = storage_dir() . '/' . $f['path'];
    if (!is_file($p)) throw new HttpError('file_missing', 404);
    return (string)file_get_contents($p);
}

/* تنزيل/عرض ملف: GET api/?action=file&id=… (بجلسة الموارد البشرية أو جلسة التحديث الذاتي لصاحب الملف) */
function file_serve(): void {
    $id = (string)($_GET['id'] ?? '');
    if (!preg_match('/^[a-f0-9]{32}$/', $id)) throw new HttpError('not_found', 404);
    $f = q1('SELECT * FROM files WHERE id=?', [$id]);
    if (!$f) throw new HttpError('not_found', 404);
    $u = current_user();
    $allowed = $u && has_perm($u, 'staff.view');
    if (!$allowed) {
        $self = (string)($_GET['t'] ?? '');
        $allowed = $self !== '' && hash_equals((string)kv_get('self_' . $f['ref']), $self);
    }
    if (!$allowed) throw new HttpError('auth_required', 401);
    if ($f['archived_at'] && !($u && has_perm($u, 'staff.edit'))) throw new HttpError('not_found', 404);
    /* إثبات الحساب البنكي لا يراه إلا من يملك صلاحية الرواتب */
    if ($u && $f['kind'] === 'bankProof' && !has_perm($u, 'finance.view')) throw new HttpError('forbidden', 403);
    $bytes = file_bytes($f);
    /* الصور الشخصية تظهر مصغّرة في القوائم؛ لا تُسجَّل كل مرة حتى لا يغرق السجل */
    if ($u && $f['kind'] !== 'photo') audit_log($f['ref'], 'عرض مرفق', $f['name'], $u['_label']);
    header_remove('Content-Type');
    header('Content-Type: ' . $f['mime']);
    header('Content-Length: ' . strlen($bytes));
    header("Content-Disposition: inline; filename=\"file." . mime_ext($f['mime']) . "\"; filename*=UTF-8''" . rawurlencode($f['name']));
    header('Cache-Control: private, no-store');
    header('X-Content-Type-Options: nosniff');
    if ($f['mime'] !== 'application/pdf') header("Content-Security-Policy: default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
    echo $bytes;
}
