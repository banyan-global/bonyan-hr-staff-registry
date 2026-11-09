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
require __DIR__ . '/../server/hrplus.php';

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
    try { data_fix_entities_2611(); } catch (Throwable $e) { }
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET') {
        $a = (string)($_GET['action'] ?? '');
        if ($a === 'countries') { header('Cache-Control: public, max-age=120'); out(countries()); }
        elseif ($a === 'file') file_serve();
        elseif ($a === 'me') out(auth_me());
        elseif ($a === 'backupDownload') backup_download();
        elseif ($a === 'exportXlsx') export_xlsx();
        elseif ($a === 'zip') staff_zip();
        elseif ($a === 'cv') cv_serve();
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
        'usersList' => fn() => users_list(), 'rolePermsSave' => fn() => role_perms_save($b), 'usersSave' => fn() => users_save($b), 'usersUnlock' => fn() => users_unlock($b), 'sessionsRevoke' => fn() => sessions_revoke($b),
        /* لوحة الموارد البشرية */
        'list' => fn() => admin_list(), 'photo' => fn() => photo($b), 'adminUpdate' => fn() => admin_update($b), 'adminUpload' => fn() => admin_upload($b),
        'adminMail' => fn() => admin_mail($b), 'message' => fn() => admin_message($b), 'messageWa' => fn() => message_wa($b), 'messages' => fn() => messages_list($b), 'audit' => fn() => audit_list($b),
        'fileHistory' => fn() => file_history($b), 'fileRestore' => fn() => file_restore($b), 'fileRemove' => fn() => file_remove($b),
        'backups' => fn() => backups_list(), 'backupNow' => fn() => backup_now(), 'health' => fn() => health(),
        /* طلبات المنسوبين */
        'reqCreate' => fn() => req_create($b), 'reqList' => fn() => req_list($b), 'reqDecide' => fn() => req_decide($b), 'reqCancel' => fn() => req_cancel($b), 'reqDelete' => fn() => req_delete($b), 'payMonth' => fn() => pay_month($b),
        'actList' => fn() => act_list($b), 'actSave' => fn() => act_save($b), 'actDecide' => fn() => act_decide($b), 'actAck' => fn() => act_ack($b), 'actVoid' => fn() => act_void($b),
        'pushSub' => fn() => push_sub($b), 'pushUnsub' => fn() => push_unsub($b), 'attToday' => fn() => att_today($b), 'attCheck' => fn() => att_check($b), 'attFix' => fn() => att_fix($b),
        'evList' => fn() => ev_list($b), 'evSave' => fn() => ev_save($b), 'evAck' => fn() => ev_ack($b), 'evDelete' => fn() => ev_delete($b),
        'jobList' => fn() => job_list($b), 'jobSave' => fn() => job_save($b), 'jobsPublic' => fn() => jobs_public($b), 'jobApply' => fn() => job_apply($b), 'appSet' => fn() => app_set($b),
        'cusList' => fn() => cus_list($b), 'cusSave' => fn() => cus_save($b), 'cusReturn' => fn() => cus_return($b), 'cusAck' => fn() => cus_ack($b), 'reqTrack' => fn() => req_track($b), 'reqForms' => fn() => req_forms(), 'reqSupsSave' => fn() => req_sups_save($b), 'reqAct' => fn() => req_act($b), 'reqActDo' => fn() => req_act_do($b),
        /* الوحدات المتكاملة */
        'siteGet' => fn() => site_get(), 'uiSave' => fn() => ui_save($b), 'siteSave' => fn() => site_save($b), 'geoResolve' => fn() => geo_resolve($b), 'myExtra' => fn() => my_extra(), 'leaveBalances' => fn() => leave_balances(),
        'attUpload' => fn() => att_upload($b), 'attImport' => fn() => att_import($b), 'attMonth' => fn() => att_month($b), 'attMy' => fn() => att_my($b), 'attUndo' => fn() => att_batch_undo($b),
        'newsList' => fn() => news_list($b), 'newsSave' => fn() => news_save($b), 'newsDelete' => fn() => news_delete($b), 'newsRead' => fn() => news_read($b), 'newsReaders' => fn() => news_readers($b), 'reqFormsSave' => fn() => req_forms_save($b),
        /* تحديث المنسوب لبياناته */
        'selfStart' => fn() => self_start($b), 'selfUpdate' => fn() => self_update($b), 'selfUpload' => fn() => self_upload($b), 'selfFinish' => fn() => self_finish($b),
        /* الاستيراد من النظام القديم (بمفتاح مؤقت) */
        'importRow' => fn() => import_row($b), 'importFile' => fn() => import_file($b), 'importAudit' => fn() => import_audit($b), 'importMailed' => fn() => import_mailed($b), 'importStats' => fn() => import_stats($b),
    ];
    $a = (string)($b['action'] ?? '');
    if (!isset($map[$a])) throw new HttpError('unknown action');
    out($map[$a]());
    /* تنبيهات الحضور بلا مهمة مجدولة: تُفحص بعد إرسال الرد، مرة كل ٤ دقائق على الأكثر */
    if (function_exists('litespeed_finish_request')) litespeed_finish_request(); elseif (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    try { att_push_tick(); } catch (Throwable $e) { }
} catch (HttpError $e) {
    out(['ok' => false, 'error' => $e->getMessage()], $e->status >= 500 ? $e->status : 200);
} catch (Throwable $e) {
    error_log('[bonyan-hr] ' . $e);
    try { audit_log('', 'خطأ', mb_substr($e->getMessage() . ' @' . basename($e->getFile()) . ':' . $e->getLine(), 0, 500)); } catch (Throwable $e2) { }
    out(['ok' => false, 'error' => 'server_error'], 500);
}
