<?php
/**
 * Bonyan HR · نقطة الخادم الوحيدة: https://hr.bonyanglobal.com/api/
 * POST: جسم JSON فيه action (نفس بروتوكول Apps Script السابق لتعمل الواجهات كما هي)
 * GET : action=countries | file | me | backupDownload
 */
declare(strict_types=1);
require __DIR__ . '/../server/bootstrap.php';
require __DIR__ . '/../server/auth.php';
require __DIR__ . '/../server/files.php';
require __DIR__ . '/../server/mail.php';
require __DIR__ . '/../server/staff.php';
require __DIR__ . '/../server/admin.php';
require __DIR__ . '/../server/export.php';
require __DIR__ . '/../server/requests.php';
require __DIR__ . '/../server/passkey.php';
require __DIR__ . '/../server/hrx.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');

function out(array $o, int $status = 200): void { http_response_code($status); echo json_encode($o, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE); }

/* الطلبات التي تغيّر شيئًا لا تُقبل إلا من نفس الموقع (حماية إضافية مع SameSite=Strict) */
function same_origin(): bool {
    $o = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($o === '') return true;
    $h = parse_url($o, PHP_URL_HOST);
    return $h && strcasecmp($h, (string)($_SERVER['HTTP_HOST'] ?? '')) === 0 || ($h && strcasecmp($h, (string)parse_url((string)cfg('site_url'), PHP_URL_HOST)) === 0);
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET') {
        $a = (string)($_GET['action'] ?? '');
        if ($a === 'countries') { header('Cache-Control: public, max-age=120'); out(countries()); }
        elseif ($a === 'file') file_serve();
        elseif ($a === 'me') out(auth_me());
        elseif ($a === 'backupDownload') backup_download();
        elseif ($a === 'exportXlsx') export_xlsx();
        elseif ($a === 'zip') staff_zip();
        else out(['ok' => true, 'service' => 'Bonyan HR · Global Staff Registry', 'v' => BHR_VERSION]);
        exit;
    }
    if ($method !== 'POST') throw new HttpError('method', 405);
    if (!same_origin()) throw new HttpError('forbidden_origin', 403);
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') throw new HttpError('empty');
    $b = json_decode($raw, true);
    if (!is_array($b)) throw new HttpError('bad_json');
    kv_gc();
    $map = [
        /* النموذج العام */
        'submit' => fn() => submit((array)($b['payload'] ?? [])), 'upload' => fn() => upload($b), 'finalize' => fn() => finalize($b), 'cardImg' => fn() => card_img($b),
        /* الدخول والحسابات */
        'authStart' => fn() => auth_start($b), 'authVerify' => fn() => auth_verify($b), 'authMe' => fn() => auth_me(), 'authLogout' => fn() => auth_logout(), 'me' => fn() => me_get(),
        'deviceHello' => fn() => device_hello(), 'deviceLogin' => fn() => device_login(), 'deviceForget' => fn() => device_forget(),
        'pkLoginStart' => fn() => pk_login_start(), 'pkLoginFinish' => fn() => pk_login_finish($b), 'pkRegStart' => fn() => pk_reg_start(), 'pkRegFinish' => fn() => pk_reg_finish($b),
        'secList' => fn() => sec_list(), 'secRemove' => fn() => sec_remove($b),
        'usersList' => fn() => users_list(), 'usersSave' => fn() => users_save($b), 'usersUnlock' => fn() => users_unlock($b), 'sessionsRevoke' => fn() => sessions_revoke($b),
        /* لوحة الموارد البشرية */
        'list' => fn() => admin_list(), 'photo' => fn() => photo($b), 'adminUpdate' => fn() => admin_update($b), 'adminUpload' => fn() => admin_upload($b),
        'adminMail' => fn() => admin_mail($b), 'message' => fn() => admin_message($b), 'messageWa' => fn() => message_wa($b), 'messages' => fn() => messages_list($b), 'audit' => fn() => audit_list($b),
        'fileHistory' => fn() => file_history($b), 'fileRestore' => fn() => file_restore($b),
        'backups' => fn() => backups_list(), 'backupNow' => fn() => backup_now(), 'health' => fn() => health(),
        /* طلبات المنسوبين */
        'reqCreate' => fn() => req_create($b), 'reqList' => fn() => req_list($b), 'reqDecide' => fn() => req_decide($b), 'reqCancel' => fn() => req_cancel($b), 'reqTrack' => fn() => req_track($b), 'reqForms' => fn() => req_forms(),
        /* الوحدات المتكاملة */
        'siteGet' => fn() => site_get(), 'siteSave' => fn() => site_save($b), 'myExtra' => fn() => my_extra(), 'leaveBalances' => fn() => leave_balances(),
        'attUpload' => fn() => att_upload($b), 'attImport' => fn() => att_import($b), 'attMonth' => fn() => att_month($b), 'attMy' => fn() => att_my($b), 'attUndo' => fn() => att_batch_undo($b),
        'newsList' => fn() => news_list(), 'newsSave' => fn() => news_save($b), 'newsDelete' => fn() => news_delete($b), 'newsRead' => fn() => news_read($b), 'newsReaders' => fn() => news_readers($b), 'reqFormsSave' => fn() => req_forms_save($b),
        /* تحديث المنسوب لبياناته */
        'selfStart' => fn() => self_start($b), 'selfUpdate' => fn() => self_update($b), 'selfUpload' => fn() => self_upload($b), 'selfFinish' => fn() => self_finish($b),
        /* الاستيراد من النظام القديم (بمفتاح مؤقت) */
        'importRow' => fn() => import_row($b), 'importFile' => fn() => import_file($b), 'importAudit' => fn() => import_audit($b), 'importMailed' => fn() => import_mailed($b), 'importStats' => fn() => import_stats($b),
    ];
    $a = (string)($b['action'] ?? '');
    if (!isset($map[$a])) throw new HttpError('unknown action');
    out($map[$a]());
} catch (HttpError $e) {
    out(['ok' => false, 'error' => $e->getMessage()], $e->status >= 500 ? $e->status : 200);
} catch (Throwable $e) {
    error_log('[bonyan-hr] ' . $e);
    try { audit_log('', 'خطأ', mb_substr($e->getMessage() . ' @' . basename($e->getFile()) . ':' . $e->getLine(), 0, 500)); } catch (Throwable $e2) { }
    out(['ok' => false, 'error' => 'server_error'], 500);
}
