<?php
/**
 * البريد — يُرسل من بريد الدومين الرسمي عبر SMTP هوستنجر (بدل حصة Gmail اليومية)
 * mail_mode = 'file' (للتجربة): تُكتب الرسائل في <التخزين>/outbox بدل إرسالها
 */
declare(strict_types=1);

require_once __DIR__ . '/vendor/PHPMailer/Exception.php';
require_once __DIR__ . '/vendor/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/vendor/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;

const NAVY = '#16294A';

/* $inline: [cid => [bytes, mime, filename]] */
function send_mail(string $to, string $subject, string $html, string $text, string $fromName = '', array $inline = [], string $replyTo = ''): void {
    $s = (array)cfg('smtp', []);
    $only = (string)cfg('mail_only_to');
    if ($only !== '') $to = $only;
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) throw new HttpError('bad_recipient');
    $m = new PHPMailer(true);
    $m->CharSet = 'UTF-8';
    $m->Encoding = 'base64';
    $from = (string)($s['from'] ?? ($s['user'] ?? 'noreply@bonyanglobal.com'));
    $m->setFrom($from, $fromName !== '' ? $fromName : (string)($s['from_name'] ?? 'Bonyan HR'));
    $m->addAddress($to);
    $rt = $replyTo !== '' ? $replyTo : (string)($s['reply_to'] ?? '');
    if ($rt !== '' && filter_var($rt, FILTER_VALIDATE_EMAIL)) $m->addReplyTo($rt);
    $m->Subject = $subject;
    $m->isHTML(true);
    $m->Body = $html;
    $m->AltBody = $text;
    foreach ($inline as $cid => $f) $m->addStringEmbeddedImage($f[0], $cid, $f[2], 'base64', $f[1]);
    if (($s['mode'] ?? cfg('mail_mode', 'smtp')) === 'file') {
        $m->preSend();
        $dir = storage_dir('outbox');
        file_put_contents($dir . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.eml', $m->getSentMIMEMessage());
        file_put_contents($dir . '/last.json', json_encode(['to' => $to, 'subject' => $subject, 'text' => $text], JSON_UNESCAPED_UNICODE));
        return;
    }
    $m->isSMTP();
    $m->Host = (string)($s['host'] ?? 'smtp.hostinger.com');
    $m->Port = (int)($s['port'] ?? 465);
    $m->SMTPSecure = ($s['secure'] ?? 'ssl') === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    $m->SMTPAuth = true;
    $m->Username = (string)($s['user'] ?? '');
    $m->Password = (string)($s['pass'] ?? '');
    $m->Timeout = 20;
    $m->send();
}
function logo_png(): string { static $b = null; return $b ??= base64_decode((string)file_get_contents(__DIR__ . '/logo.b64')); }

/* إطار موحّد للرسائل القصيرة (رمز الدخول، التنبيهات، رسائل الموارد البشرية) */
function mail_frame(string $eyebrow, string $title, string $inner, bool $rtl = true): string {
    $dir = $rtl ? 'rtl' : 'ltr'; $al = $rtl ? 'right' : 'left';
    $font = $rtl ? "'Tajawal','IBM Plex Sans Arabic',Tahoma,Arial,sans-serif" : "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
    $dev = esc_html((string)cfg('dev_email'));
    return '<!doctype html><html lang="' . ($rtl ? 'ar' : 'en') . '" dir="' . $dir . '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>'
        . '<body style="margin:0;padding:0;background:#EDF0F5;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDF0F5;"><tr><td align="center" style="padding:24px 10px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="' . $dir . '" style="max-width:520px;background:#FFFFFF;border-radius:20px;overflow:hidden;font-family:' . $font . ';text-align:' . $al . ';box-shadow:0 12px 34px rgba(22,41,74,.13);">'
        . '<tr><td style="background:' . NAVY . ';background-image:linear-gradient(135deg,#1C335A 0%,' . NAVY . ' 45%,#0E1C33 100%);padding:18px 22px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
        . '<td style="vertical-align:middle;"><div style="font-size:11.5px;color:#D2B074;font-weight:800;">' . esc_html($eyebrow) . '</div><div style="font-size:16px;font-weight:900;color:#FFFFFF;margin-top:2px;">' . esc_html($rtl ? 'مجموعة بنيان العالمية' : 'Bonyan International Group') . '</div></td>'
        . '<td align="' . ($rtl ? 'left' : 'right') . '" style="vertical-align:middle;"><img src="cid:logo" width="56" alt="Bonyan" style="display:block;width:56px;height:auto;border:0;"></td></tr></table></td></tr>'
        . '<tr><td style="height:3px;line-height:3px;font-size:0;background:#D2B074;">&nbsp;</td></tr>'
        . '<tr><td style="padding:24px 24px 8px;"><h1 style="margin:0 0 10px;font-size:19px;color:' . NAVY . ';font-weight:900;">' . esc_html($title) . '</h1>' . $inner . '</td></tr>'
        . '<tr><td align="center" style="background:#F6F7FA;border-top:1px solid #E8EBF1;padding:14px 24px 16px;">'
        . '<a href="mailto:' . $dev . '" style="display:inline-block;padding:4px 11px;border-radius:999px;background:#FFF1E6;border:1px solid #F5C9A3;color:#B4570F;font-size:11.5px;font-weight:800;text-decoration:none;white-space:nowrap;">' . ($rtl ? 'تطوير وتنفيذ أسامة جنيدي' : 'Developed by Osama Junaydi') . '</a>'
        . '<div style="margin-top:8px;font-size:11px;color:#9AA5B6;">© ' . date('Y') . ' ' . ($rtl ? 'مجموعة بنيان العالمية' : 'Bonyan International Group') . '</div></td></tr>'
        . '</table></td></tr></table></body></html>';
}
function logo_inline(): array { return ['logo' => [logo_png(), 'image/png', 'bonyan.png']]; }

function send_login_code(array $u, string $code): void {
    $big = '<div dir="ltr" style="margin:14px 0;text-align:center;font-family:Consolas,\'SF Mono\',monospace;font-size:34px;font-weight:800;letter-spacing:10px;color:' . NAVY . ';background:#F4F6FA;border:1px solid #E3E8F0;border-radius:14px;padding:14px 0;">' . esc_html($code) . '</div>';
    $inner = '<p style="margin:0;font-size:14px;line-height:1.9;color:#1D2A3B;">' . esc_html(($u['name'] ? $u['name'] . '، ' : '') . 'هذا رمز الدخول إلى منصة الموارد البشرية:') . '</p>' . $big
        . '<p style="margin:0;font-size:12.5px;line-height:1.9;color:#6B778A;">صالح لمدة ١٠ دقائق ولمرة واحدة. لا تشاركه مع أحد — فريق الموارد البشرية لن يطلبه منك أبدًا. إن لم تطلب الدخول فتجاهل هذه الرسالة.</p>';
    send_mail($u['email'], 'رمز الدخول: ' . $code . ' · بنيان للموارد البشرية', mail_frame('الموارد البشرية · دخول آمن', 'رمز الدخول إلى المنصة', $inner),
        "رمز الدخول: $code\nصالح لمدة 10 دقائق ولمرة واحدة. لا تشاركه مع أحد.", 'Bonyan HR', logo_inline());
}
/* رمز التحقق للمنسوب في صفحة «تحديث بياناتي» */
function send_self_code(string $to, string $name, string $ref, string $code, string $L): void {
    $T = [
        'ar' => ['t' => 'رمز التحقق لتحديث بياناتك', 'p' => 'رمز التحقق لفتح صفحة «تحديث بياناتي» للرقم المرجعي', 'n' => 'صالح لمدة ١٠ دقائق ولمرة واحدة. إن لم تطلبه فتجاهل الرسالة.', 'e' => 'الموارد البشرية · سجل المنسوبين', 's' => 'رمز التحقق'],
        'en' => ['t' => 'Your verification code', 'p' => 'Use this code to open “Update my details” for reference', 'n' => 'Valid for 10 minutes, one use only. If you did not request it, ignore this email.', 'e' => 'Human Resources · Staff Registry', 's' => 'Verification code'],
        'id' => ['t' => 'Kode verifikasi Anda', 'p' => 'Gunakan kode ini untuk membuka “Perbarui data saya” untuk nomor referensi', 'n' => 'Berlaku 10 menit, sekali pakai. Jika Anda tidak memintanya, abaikan email ini.', 'e' => 'SDM · Registri Staf', 's' => 'Kode verifikasi'],
    ][$L] ?? null;
    $T = $T ?: ['t' => 'رمز التحقق لتحديث بياناتك', 'p' => 'رمز التحقق للرقم المرجعي', 'n' => 'صالح لمدة ١٠ دقائق.', 'e' => 'الموارد البشرية', 's' => 'رمز التحقق'];
    $rtl = $L === 'ar' || !in_array($L, ['en', 'id'], true);
    $inner = '<p style="margin:0;font-size:14px;line-height:1.9;color:#1D2A3B;">' . esc_html($T['p']) . ' <b dir="ltr">' . esc_html($ref) . '</b></p>'
        . '<div dir="ltr" style="margin:14px 0;text-align:center;font-family:Consolas,monospace;font-size:34px;font-weight:800;letter-spacing:10px;color:' . NAVY . ';background:#F4F6FA;border:1px solid #E3E8F0;border-radius:14px;padding:14px 0;">' . esc_html($code) . '</div>'
        . '<p style="margin:0;font-size:12.5px;line-height:1.9;color:#6B778A;">' . esc_html($T['n']) . '</p>';
    send_mail($to, $T['s'] . ': ' . $code . ' · ' . $ref, mail_frame($T['e'], $T['t'], $inner, $rtl), $T['s'] . ": $code", 'Bonyan HR', logo_inline());
}

/* ============================================================ رسالة تأكيد التسجيل (منقولة من Code.gs بنفس التصميم واللغات) */
function mail_tx(): array { static $t = null; return $t ??= json_decode((string)file_get_contents(__DIR__ . '/mail_tx.json'), true); }
function mail_lang($v): string { $v = strtolower((string)$v); return isset(mail_tx()[$v]) ? $v : 'ar'; }
function self_sig(string $ref): string { return substr(b64url(hash_hmac('sha256', strtoupper($ref), self_secret(), true)), 0, 22); }
function update_url(string $ref, string $L): string { return cfg('site_url') . 'update.html?k=' . self_sig($ref) . '&lang=' . $L; }

function send_confirm(array $row, bool $updated, ?array $info = null): string {
    $d = $row['data'];
    $get = function (string $k) use ($d) { return trim((string)($d[$k] ?? '')); };
    $ref = $row['ref'];
    if (!$info) { $c = kv_get('mailinfo_' . $ref); $info = $c ? json_decode($c, true) : []; }
    $info = is_array($info) ? $info : [];
    $L = mail_lang($info['lang'] ?? $get('lang')); $T = mail_tx()[$L];
    $fill = function ($s, $o) { return preg_replace_callback('/\{(\w+)\}/', function ($m) use ($o) { return (string)($o[$m[1]] ?? ''); }, (string)$s); };
    $staffMail = $get('officialEmail') ?: $get('personalEmail');
    if ($staffMail === '') return '';
    $female = (bool)preg_match('/أنثى|female|perempuan/iu', $get('gender'));
    $pass = preg_replace('/\s+/', '', $get('passportNo'));
    $today = strtotime(date('Y-m-d') . ' 12:00:00');
    $alerts = [];
    foreach (['passportExpiry', 'permitExpiry', 'nationalIdExpiry', 'workPermitExpiry'] as $k) {
        $v = $get($k); if (!preg_match('/^\d{4}-\d{2}-\d{2}/', $v)) continue;
        $days = (int)round((strtotime(substr($v, 0, 10) . ' 12:00:00') - $today) / 86400);
        if ($days < 0) $alerts[] = $fill($T['expired'], ['doc' => $T['docs'][$k], 'd' => substr($v, 0, 10)]);
        elseif ($days <= 90) $alerts[] = $fill($T['soon'], ['doc' => $T['docs'][$k], 'd' => substr($v, 0, 10)]);
    }
    $fl = (array)($info['fileLabels'] ?? []); $files = []; $have = [];
    foreach (files_of($ref) as $f) $have[$f['kind']] = 1;
    foreach (staff_cols() as $c) if ($c[2] === 'f' && isset($have[$c[0]])) $files[] = $fl[$c[0]] ?? $c[1];
    $gif = null; foreach (files_of($ref, '_card_gif') as $f) $gif = $f;
    $nameMain = $L === 'ar' ? ($get('fullNameAr') ?: $get('fullNameLatin')) : ($get('fullNameLatin') ?: $get('fullNameAr'));
    $m = [
        'L' => $L, 'T' => $T, 'subject' => ($updated ? $T['subjUpd'] : $T['subjNew']) . ' · ' . $ref . ' · ' . $T['org'],
        'preheader' => $fill($updated ? $T['preUpd'] : $T['preNew'], ['ref' => $ref]), 'logo' => 'cid:logo', 'cardImg' => $gif ? 'cid:card' : '',
        'updated' => $updated, 'female' => $female, 'name' => $nameMain, 'nameAr' => $get('fullNameAr'), 'nameLatin' => $get('fullNameLatin'), 'ref' => $ref,
        'date' => substr((string)$row['created_at'], 0, 16), 'entity' => $info['entity'] ?? $get('entity'), 'jobTitle' => $get('jobTitle'),
        'workCountry' => $info['workCountry'] ?? $get('workCountry'), 'nationality' => $info['nationality'] ?? $get('nationality'),
        'passportMasked' => $pass !== '' ? '••••' . substr($pass, -4) : '', 'passportExpiry' => $get('passportExpiry'), 'permitExpiry' => $get('permitExpiry'),
        'mobile' => $get('mobile'), 'email' => $staffMail, 'files' => $files, 'alerts' => $alerts, 'formUrl' => update_url($ref, $L),
        'devEmail' => (string)cfg('dev_email'), 'year' => date('Y'),
    ];
    $inline = logo_inline();
    if ($gif) $inline['card'] = [file_bytes($gif), 'image/gif', 'card.gif'];
    send_mail($staffMail, $m['subject'], confirm_mail_html($m), $m['preheader'] . "\n\n" . $m['formUrl'] . "\n\n" . $T['regards'] . "\n" . $T['sign'], $T['sender'], $inline, (string)cfg('hr_notify'));
    audit_log($ref, 'إرسال رسالة التأكيد', $staffMail . ' · ' . $L);
    $mm = json_decode(setting('mailed', '{}'), true) ?: []; $mm[$ref] = now_min(); setting_set('mailed', json_encode($mm));
    return $staffMail;
}

function confirm_mail_html(array $m): string {
    $T = $m['T']; $RTL = $m['L'] === 'ar'; $S = $RTL ? 'right' : 'left'; $E = $RTL ? 'left' : 'right'; $DIR = $RTL ? 'rtl' : 'ltr';
    $e = 'esc_html';
    $NAVY = '#16294A'; $NAVY2 = '#0E1C33'; $GOLD = '#D2B074'; $GOLD2 = '#9C7432'; $INK = '#1D2A3B'; $MUTED = '#6B778A'; $LINE = '#E8EBF1';
    $FONT = $RTL ? "'Tajawal','IBM Plex Sans Arabic',Tahoma,Arial,sans-serif" : "'Segoe UI',Roboto,Helvetica,Arial,sans-serif"; $MONO = "Consolas,'SF Mono','Courier New',monospace";
    $cell = function ($k, $v, $ltr = false, $span = false) use ($e, $LINE, $MUTED, $INK, $S) {
        return '<td' . ($span ? ' colspan="2"' : '') . ' width="' . ($span ? '100%' : '50%') . '" style="padding:6px;vertical-align:top;"><div style="background:#F7F8FB;border:1px solid ' . $LINE . ';border-radius:12px;padding:10px 14px;">'
            . '<div style="font-size:11.5px;color:' . $MUTED . ';font-weight:700;">' . $e($k) . '</div>'
            . '<div' . ($ltr ? ' dir="ltr" style="text-align:' . $S . ';' : ' style="') . 'font-size:14px;color:' . $INK . ';font-weight:800;margin-top:3px;word-break:break-word;">' . ($v !== '' && $v !== null ? $e($v) : '—') . '</div></div></td>';
    };
    $pairs = $m['cardImg'] ? [[$T['nationality'], $m['nationality']], [$T['passport'], $m['passportMasked'], 1]]
        : [[$T['workCountry'], $m['workCountry']], [$T['nationality'], $m['nationality']], [$T['passport'], $m['passportMasked'], 1], [$T['passportExpiry'], $m['passportExpiry'], 1]];
    if ($m['permitExpiry']) $pairs[] = [$T['permitExpiry'], $m['permitExpiry'], 1];
    $pairs[] = [$T['mobile'], $m['mobile'], 1];
    $grid = '';
    for ($i = 0; $i < count($pairs); $i += 2) $grid .= '<tr>' . $cell($pairs[$i][0], $pairs[$i][1], !empty($pairs[$i][2])) . (isset($pairs[$i + 1]) ? $cell($pairs[$i + 1][0], $pairs[$i + 1][1], !empty($pairs[$i + 1][2])) : '<td></td>') . '</tr>';
    $grid .= '<tr>' . $cell($T['email'], $m['email'], true, true) . '</tr>';
    $chips = implode('', array_map(function ($f) use ($e) { return '<span style="display:inline-block;margin:0 0 6px 6px;padding:6px 11px;border-radius:999px;background:#EEF7F1;border:1px solid #CFE7D8;color:#1E6B49;font-size:12.5px;font-weight:700;white-space:nowrap;">✓ ' . $e($f) . '</span>'; }, $m['files']));
    $alerts = implode('', array_map(function ($a) use ($e, $S) { return '<div style="margin-top:12px;padding:10px 14px;border-radius:12px;background:#FFF6E5;border:1px solid #F1D49B;color:#7A5410;font-size:13px;line-height:1.8;text-align:' . $S . ';">⚠️ ' . $e($a) . '</div>'; }, $m['alerts']));
    $greet = str_replace('{name}', $e($m['name'] ?: ($m['nameAr'] ?: $m['nameLatin'])), $m['female'] ? $T['greetF'] : $T['greetM']);
    $nameBig = $RTL ? ($m['nameAr'] ?: $m['nameLatin']) : ($m['nameLatin'] ?: $m['nameAr']);
    $nameSmall = $RTL ? ($m['nameAr'] ? $m['nameLatin'] : '') : ($m['nameLatin'] ? $m['nameAr'] : '');
    $h = '<!doctype html><html lang="' . $m['L'] . '" dir="' . $DIR . '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>' . $e($m['subject']) . '</title>'
        . '<style>details>summary{list-style:none;cursor:pointer}details>summary::-webkit-details-marker{display:none}details[open] .chev{transform:rotate(180deg)}</style></head>'
        . '<body style="margin:0;padding:0;background:#EDF0F5;"><div style="display:none;max-height:0;overflow:hidden;">' . $e($m['preheader']) . '</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDF0F5;"><tr><td align="center" style="padding:24px 10px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="' . $DIR . '" style="max-width:560px;background:#FFFFFF;border-radius:22px;overflow:hidden;font-family:' . $FONT . ';text-align:' . $S . ';box-shadow:0 12px 34px rgba(22,41,74,.13);">'
        . '<tr><td style="background:' . $NAVY . ';background-image:linear-gradient(135deg,#1C335A 0%,' . $NAVY . ' 45%,' . $NAVY2 . ' 100%);padding:20px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
        . '<td style="vertical-align:middle;text-align:' . $S . ';"><div style="font-size:11.5px;color:' . $GOLD . ';font-weight:800;letter-spacing:.3px;">' . $e($T['hr']) . '</div><div style="font-size:17px;font-weight:900;color:#FFFFFF;margin-top:2px;">' . $e($T['org']) . '</div></td>'
        . '<td align="' . $E . '" style="vertical-align:middle;"><img src="' . $e($m['logo']) . '" width="64" alt="' . $e($T['logoAlt']) . '" style="display:block;width:64px;height:auto;border:0;"></td></tr></table></td></tr>'
        . '<tr><td style="height:3px;line-height:3px;font-size:0;background:' . $GOLD . ';background-image:linear-gradient(90deg,#B8924F,' . $GOLD . ',#F0D9A8,' . $GOLD . ',#B8924F);">&nbsp;</td></tr>'
        . '<tr><td align="center" style="padding:26px 24px 4px;"><div style="width:54px;height:54px;line-height:54px;border-radius:50%;background:#EEF7F1;border:2px solid #BFE0CC;color:#1E7A52;font-size:26px;font-weight:900;text-align:center;margin:0 auto;">✓</div>'
        . '<h1 style="margin:14px 0 4px;font-size:21px;line-height:1.5;color:' . $NAVY . ';font-weight:900;text-align:center;">' . $e($m['updated'] ? $T['titleUpd'] : $T['titleNew']) . '</h1>'
        . '<p style="margin:0;font-size:14px;line-height:1.95;color:' . $INK . ';text-align:center;">' . $greet . '<br>' . $e($m['updated'] ? $T['bodyUpd'] : $T['bodyNew']) . '</p></td></tr>';
    if ($m['cardImg']) {
        $h .= '<tr><td align="center" style="padding:14px 10px 0;"><img src="' . $e($m['cardImg']) . '" width="540" alt="' . $e($T['card']) . '" style="display:block;width:100%;max-width:540px;height:auto;border:0;margin:0 auto;"></td></tr>'
            . '<tr><td align="center" style="padding:2px 24px 0;font-size:12.5px;color:' . $MUTED . ';">' . $e($T['ref']) . ' <b dir="ltr" style="font-family:' . $MONO . ';color:' . $NAVY . ';letter-spacing:.5px;">' . $e($m['ref']) . '</b> &nbsp;·&nbsp; ' . $e($T['date']) . ' <b dir="ltr" style="color:' . $INK . ';">' . $e($m['date']) . '</b>' . $alerts . '</td></tr>';
    } else {
        $h .= '<tr><td style="padding:18px 24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;background:' . $NAVY . ';background-image:linear-gradient(135deg,#21396A,' . $NAVY . ' 55%,' . $NAVY2 . ');"><tr>'
            . '<td style="padding:18px 20px;vertical-align:top;text-align:' . $S . ';"><div style="font-size:17px;font-weight:900;color:#FFFFFF;line-height:1.5;">' . $e($nameBig) . '</div>'
            . ($nameSmall ? '<div style="font-size:11px;letter-spacing:' . ($RTL ? '1px' : '0') . ';color:rgba(255,255,255,.7);font-weight:700;margin-top:1px;">' . $e($nameSmall) . '</div>' : '')
            . '<div style="font-size:13.5px;color:' . $GOLD . ';font-weight:800;margin-top:8px;">' . $e($m['jobTitle']) . '</div><div style="font-size:12.5px;color:rgba(255,255,255,.78);margin-top:1px;">' . $e($m['entity']) . '</div></td></tr>'
            . '<tr><td style="padding:0 20px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(210,176,116,.35);"><tr>'
            . '<td style="padding-top:12px;text-align:' . $S . ';"><div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;">' . $e($T['ref']) . '</div><div dir="ltr" style="text-align:' . $S . ';font-family:' . $MONO . ';font-size:16px;font-weight:700;letter-spacing:1px;color:' . $GOLD . ';white-space:nowrap;">' . $e($m['ref']) . '</div></td>'
            . '<td align="' . $E . '" style="padding-top:12px;"><div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;">' . $e($T['date']) . '</div><div dir="ltr" style="font-size:13px;font-weight:700;color:#FFFFFF;">' . $e($m['date']) . '</div></td>'
            . '</tr></table></td></tr></table>' . $alerts . '</td></tr>';
    }
    $h .= '<tr><td style="padding:12px 18px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $grid . '</table></td></tr>';
    if ($chips) $h .= '<tr><td style="padding:8px 24px 0;"><details style="border:1px solid ' . $LINE . ';border-radius:14px;background:#FBFCFD;">'
        . '<summary style="padding:12px 16px;font-size:14px;font-weight:800;color:' . $NAVY . ';text-align:' . $S . ';"><span style="display:inline-block;min-width:22px;height:22px;line-height:22px;text-align:center;border-radius:999px;background:#EEF7F1;color:#1E7A52;font-size:12px;margin-' . $E . ':8px;">' . count($m['files']) . '</span>' . $e($T['files']) . '<span class="chev" style="float:' . $E . ';color:' . $GOLD2 . ';font-size:12px;line-height:22px;display:inline-block;">▼</span></summary>'
        . '<div style="padding:4px 16px 10px;text-align:' . $S . ';">' . $chips . '</div></details></td></tr>';
    $h .= '<tr><td align="center" style="padding:20px 24px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="border-radius:12px;background:' . $NAVY . ';background-image:linear-gradient(135deg,#21396A,' . $NAVY2 . ');"><a href="' . $e($m['formUrl']) . '" style="display:inline-block;padding:12px 28px;font-family:' . $FONT . ';font-size:14.5px;font-weight:800;color:#FFFFFF;text-decoration:none;">' . $e($T['btn']) . '</a></td></tr></table>'
        . '<p style="margin:10px 0 0;font-size:12px;line-height:1.8;color:' . $MUTED . ';text-align:center;">' . $e($T['note']) . '</p></td></tr>'
        . '<tr><td align="center" style="padding:18px 24px 22px;"><div style="font-size:13.5px;color:' . $INK . ';line-height:1.8;">' . $e($T['regards']) . '</div><div style="font-size:14.5px;font-weight:900;color:' . $NAVY . ';">' . $e($T['sign']) . '</div></td></tr>'
        . '<tr><td align="center" style="background:#F6F7FA;border-top:1px solid ' . $LINE . ';padding:14px 24px 16px;"><p style="margin:0 0 8px;font-size:11.5px;line-height:1.8;color:' . $MUTED . ';">' . $e($T['auto']) . '</p>'
        . '<a href="mailto:' . $e($m['devEmail']) . '" style="display:inline-block;padding:4px 11px;border-radius:999px;background:#FFF1E6;border:1px solid #F5C9A3;color:#B4570F;font-size:11.5px;font-weight:800;text-decoration:none;white-space:nowrap;">' . $e($T['dev']) . ' · <span dir="ltr">' . $e($m['devEmail']) . '</span></a>'
        . '<div style="margin-top:8px;font-size:11px;color:#9AA5B6;">' . $e(str_replace('{y}', $m['year'], $T['copy'])) . '</div></td></tr></table></td></tr></table></body></html>';
    return $h;
}

/* تنبيه مختصر للموارد البشرية عند كل تسجيل جديد */
/* مستلمو تنبيهات الموارد البشرية: البريد الرسمي في الإعدادات + كل حساب نشط مفعّل له التنبيه — كلٌّ يصله نسخته */
function hr_recipients(): array {
    $out = [];
    foreach (preg_split('/[\s,;]+/', (string)cfg('hr_notify')) as $e) if (filter_var($e, FILTER_VALIDATE_EMAIL)) $out[strtolower($e)] = 1;
    try { foreach (q('SELECT * FROM users WHERE active=1')->fetchAll() as $u) if (user_notify($u)) $out[strtolower($u['email'])] = 1; } catch (Throwable $e) { }
    return array_keys($out);
}
function notify_hr(array $row): void {
    $list = hr_recipients(); if (!$list) return;
    $d = $row['data']; $g = function ($k) use ($d) { return trim((string)($d[$k] ?? '')); };
    $name = $g('fullNameAr') ?: $g('fullNameLatin');
    $line = function ($k, $v) { return $v !== '' ? '<tr><td style="padding:5px 0;color:#6B778A;font-size:13px;width:110px;">' . esc_html($k) . '</td><td style="padding:5px 0;color:#1D2A3B;font-size:14px;font-weight:700;">' . esc_html($v) . '</td></tr>' : ''; };
    $inner = '<table style="border-collapse:collapse;width:100%;">' . $line('الرقم المرجعي', $row['ref']) . $line('الجهة', $g('entity')) . $line('المسمى', $g('jobTitle'))
        . $line('دولة العمل', $g('workCountry')) . $line('الجنسية', $g('nationality')) . $line('البريد', $g('officialEmail') ?: $g('personalEmail')) . '</table>'
        . '<div style="margin:14px 0 6px;"><a href="' . esc_html(cfg('site_url') . 'admin.html') . '" style="display:inline-block;padding:9px 18px;border-radius:10px;background:#16294A;color:#fff;font-weight:700;font-size:13px;text-decoration:none;">فتح لوحة الموارد البشرية</a></div>';
    foreach ($list as $to) {
        try { send_mail($to, 'تسجيل جديد: ' . $name . ' · ' . $row['ref'], mail_frame('Bonyan HR · تسجيل جديد', $name, $inner), 'تسجيل جديد: ' . $name . ' · ' . $row['ref'], 'Bonyan HR', logo_inline()); }
        catch (Throwable $e) { audit_log($row['ref'], 'تعذّر إرسال التنبيه', mask_email($to) . ' · ' . $e->getMessage()); }
    }
    audit_log($row['ref'], 'تنبيه الموارد البشرية بتسجيل جديد', implode('، ', array_map('mask_email', $list)), 'النظام');
}
