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

require_once __DIR__ . '/mailui.php';

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
    $m->AltBody = $text . (strpos($text, (string)cfg('dev_email')) === false ? mail_signature_text() : '');
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

/* إطار موحّد لكل الرسائل: يحوّل إلى نظام التصميم في mailui.php
   $o اختياري: tone, icon, badge, lead, buttons, foot, pre */
function mail_frame(string $eyebrow, string $title, string $inner, bool $rtl = true, array $o = []): string {
    return mx_page($o + ['eyebrow' => $eyebrow, 'title' => $title, 'body' => $inner, 'rtl' => $rtl, 'tone' => mx_guess_tone($title)]);
}
/* توقيع المطوّر الموحد في رسائل الأنظمة (نفس توقيع أنظمة بنيان الأخرى) */
function mail_signature(bool $rtl = true): string {
    $mail = (string)cfg('dev_email'); $system = 'منصة بنيان للموارد البشرية';
    $href = esc_html('mailto:' . $mail . '?subject=' . rawurlencode('استفسار تقني — ' . $system));
    $F = "font-family:'IBM Plex Sans Arabic',Tajawal,Tahoma,Arial,sans-serif;";
    $line = $rtl ? 'رسالة آلية من <b style="color:#14213d">' . $system . '</b>، ولأي استفسار تقني يسعدنا تواصلك عبر البريد أدناه.'
        : 'Automated message from <b style="color:#14213d">Bonyan HR Platform</b>. For any technical question, reach us at the email below.';
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="' . ($rtl ? 'rtl' : 'ltr') . '" style="border-collapse:collapse;">'
        . '<tr><td align="center" style="' . $F . 'padding:12px 12px 8px;font-size:12px;line-height:1.9;color:#7a8499">' . $line . '</td></tr>'
        . '<tr><td align="center" style="padding:0 12px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;background:#fff4ec;border:1px solid #fcd9bf;border-radius:14px">'
        . '<tr><td align="center" style="' . $F . 'padding:6px 14px;font-size:12.5px;line-height:1.7;text-align:center"><span style="color:#f97415;font-size:8px;vertical-align:2px">&#9679;</span>&nbsp; '
        . '<a href="' . $href . '" style="color:#ea580c;font-weight:bold;text-decoration:none;white-space:nowrap">' . ($rtl ? 'م. أسامة جنيدي' : 'Eng. Osama Junaydi') . '</a>'
        . '<span style="color:#fcd9bf">&nbsp;&nbsp;|&nbsp;&nbsp;</span><a href="' . $href . '" dir="ltr" style="color:#7a8499;font-size:12px;text-decoration:none;white-space:nowrap">' . esc_html($mail) . '</a></td></tr></table></td></tr>'
        . '<tr><td align="center" style="' . $F . 'padding:9px 12px 0;font-size:11px;color:#a3abba">&copy; ' . date('Y') . ' ' . ($rtl ? 'مجموعة بنيان العالمية' : 'Bonyan International Group') . '</td></tr></table>';
}
function mail_signature_text(): string { return "\n\n—\nرسالة آلية من منصة بنيان للموارد البشرية، ولأي استفسار تقني يسعدنا تواصلك عبر البريد أدناه.\nم. أسامة جنيدي | " . cfg('dev_email') . "\n© " . date('Y') . ' مجموعة بنيان العالمية'; }
function logo_inline(): array { return ['logo' => [logo_png(), 'image/png', 'bonyan.png']]; }

function send_login_code(array $u, string $code): void {
    $html = mx_page(['eyebrow' => 'الموارد البشرية · دخول آمن', 'title' => 'رمز الدخول إلى المنصة', 'tone' => 'navy', 'icon' => '🔐', 'pre' => 'رمز الدخول: ' . $code . ' — صالح ١٠ دقائق',
        'lead' => esc_html(($u['name'] ? $u['name'] . '، ' : '') . 'هذا رمز الدخول إلى منصة الموارد البشرية. اكتبه في صفحة الدخول:'),
        'body' => mx_code($code) . mx_note('صالح لمدة ١٠ دقائق ولمرة واحدة. لا تشاركه مع أحد؛ فريق الموارد البشرية لن يطلبه منك أبدًا. وإن لم تطلب الدخول فتجاهل هذه الرسالة.', 'amber', 'للأمان'),
        'buttons' => [[mx_url(), 'فتح منصة الموارد البشرية', 'primary']]]);
    send_mail($u['email'], 'رمز الدخول: ' . $code . ' · بنيان للموارد البشرية', $html, "رمز الدخول: $code\nصالح لمدة 10 دقائق ولمرة واحدة. لا تشاركه مع أحد.", 'Bonyan HR', logo_inline());
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
    $btn = ['ar' => 'فتح صفحة «تحديث بياناتي»', 'en' => 'Open “Update my details”', 'id' => 'Buka “Perbarui data saya”'][$L] ?? 'فتح صفحة «تحديث بياناتي»';
    $html = mx_page(['eyebrow' => $T['e'], 'title' => $T['t'], 'tone' => 'navy', 'icon' => '🔐', 'rtl' => $rtl, 'pre' => $T['s'] . ': ' . $code,
        'lead' => esc_html($T['p']) . ' <b dir="ltr">' . esc_html($ref) . '</b>', 'body' => mx_code($code) . mx_note($T['n'], 'amber', '', $rtl),
        'buttons' => [[update_url($ref, $L), $btn, 'primary']]]);
    send_mail($to, $T['s'] . ': ' . $code . ' · ' . $ref, $html, $T['s'] . ": $code", 'Bonyan HR', logo_inline());
}

/* ============================================================ رسالة تأكيد التسجيل (منقولة من Code.gs بنفس التصميم واللغات) */
function mail_tx(): array { static $t = null; return $t ??= json_decode((string)file_get_contents(__DIR__ . '/mail_tx.json'), true); }
function mail_lang($v): string { $v = strtolower((string)$v); return isset(mail_tx()[$v]) ? $v : 'ar'; }
/* رابط «تحديث بياناتي»: موقّع بالرقم المرجعي وتاريخ انتهاء (٣٠ يومًا) ونسخة تُرفع عند تغيّر البيانات الحساسة فتُبطل الروابط السابقة */
const SELF_LINK_DAYS = 30;
function self_ver(string $ref): string { return (string)(kv_get('selfver_' . strtoupper($ref)) ?? '0'); }
function self_ver_bump(string $ref): void { kv_put('selfver_' . strtoupper($ref), (string)(((int)self_ver($ref)) + 1)); }
function self_sig(string $ref, ?int $exp = null): string {
    $exp = $exp ?? (time() + SELF_LINK_DAYS * 86400);
    return dechex($exp) . '.' . substr(b64url(hash_hmac('sha256', strtoupper($ref) . '|' . $exp . '|' . self_ver($ref), self_secret(), true)), 0, 27);
}
/* 'ok' صالح، 'expired' منتهٍ أو مُبطل، 'bad' غير مطابق */
function self_sig_check(string $ref, string $k): string {
    if (!preg_match('/^([0-9a-f]{7,10})\.([A-Za-z0-9_-]{27})$/', $k, $m)) return strlen($k) === 22 ? 'expired' : 'bad'; /* الروابط القديمة بلا تاريخ لم تعد تُقبل */
    $exp = (int)hexdec($m[1]);
    if (!hash_equals(self_sig($ref, $exp), $k)) return 'bad';
    return $exp < time() ? 'expired' : 'ok';
}
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
    foreach (['passportExpiry', 'permitExpiry', 'nationalIdExpiry'] as $k) {
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
    $T = $m['T']; $RTL = $m['L'] === 'ar'; $S = $RTL ? 'right' : 'left'; $E = $RTL ? 'left' : 'right';
    $e = 'esc_html'; $MONO = "Consolas,'SF Mono','Courier New',monospace";
    $cell = function ($k, $v, $ltr = false, $span = false) use ($e, $S) {
        return '<td' . ($span ? ' colspan="2"' : '') . ' width="' . ($span ? '100%' : '50%') . '" style="padding:5px;vertical-align:top;"><div style="background:' . MX['soft'] . ';border:1px solid ' . MX['line'] . ';border-radius:14px;padding:11px 14px;">'
            . '<div style="font-size:11.5px;color:' . MX['mut'] . ';font-weight:700;">' . $e($k) . '</div>'
            . '<div' . ($ltr ? ' dir="ltr" style="text-align:' . $S . ';' : ' style="') . 'font-size:14px;color:' . MX['ink'] . ';font-weight:800;margin-top:3px;word-break:break-word;">' . ($v !== '' && $v !== null ? $e($v) : '—') . '</div></div></td>';
    };
    $pairs = $m['cardImg'] ? [[$T['nationality'], $m['nationality']], [$T['passport'], $m['passportMasked'], 1]]
        : [[$T['workCountry'], $m['workCountry']], [$T['nationality'], $m['nationality']], [$T['passport'], $m['passportMasked'], 1], [$T['passportExpiry'], $m['passportExpiry'], 1]];
    if ($m['permitExpiry']) $pairs[] = [$T['permitExpiry'], $m['permitExpiry'], 1];
    $pairs[] = [$T['mobile'], $m['mobile'], 1];
    $grid = '';
    for ($i = 0; $i < count($pairs); $i += 2) $grid .= '<tr>' . $cell($pairs[$i][0], $pairs[$i][1], !empty($pairs[$i][2])) . (isset($pairs[$i + 1]) ? $cell($pairs[$i + 1][0], $pairs[$i + 1][1], !empty($pairs[$i + 1][2])) : '<td></td>') . '</tr>';
    $grid .= '<tr>' . $cell($T['email'], $m['email'], true, true) . '</tr>';
    $chips = implode('', array_map(function ($f) use ($e) { return '<span style="display:inline-block;margin:0 0 6px 6px;padding:6px 12px;border-radius:999px;background:#EAF7F0;border:1px solid #BCE2CD;color:#147A4E;font-size:12.5px;font-weight:800;white-space:nowrap;">✓ ' . $e($f) . '</span>'; }, $m['files']));
    $alerts = implode('', array_map(fn($a) => mx_note($a, 'amber', '', $RTL), $m['alerts']));
    $greet = str_replace('{name}', $e($m['name'] ?: ($m['nameAr'] ?: $m['nameLatin'])), $m['female'] ? $T['greetF'] : $T['greetM']);
    $nameBig = $RTL ? ($m['nameAr'] ?: $m['nameLatin']) : ($m['nameLatin'] ?: $m['nameAr']);
    $nameSmall = $RTL ? ($m['nameAr'] ? $m['nameLatin'] : '') : ($m['nameLatin'] ? $m['nameAr'] : '');
    $body = '';
    if ($m['cardImg']) {
        $body .= '<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div><img src="' . $e($m['cardImg']) . '" width="548" alt="' . $e($T['card']) . '" style="display:block;width:100%;max-width:548px;height:auto;border:0;margin:0 auto;border-radius:16px;">'
            . '<p style="margin:8px 0 0;font-size:12.5px;color:' . MX['mut'] . ';text-align:center;">' . $e($T['ref']) . ' <b dir="ltr" style="font-family:' . $MONO . ';color:' . MX['navy'] . ';letter-spacing:.5px;">' . $e($m['ref']) . '</b> &nbsp;·&nbsp; ' . $e($T['date']) . ' <b dir="ltr" style="color:' . MX['navy'] . ';">' . $e($m['date']) . '</b></p>';
    } else {
        $body .= '<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' . MX['navy'] . '" style="border-collapse:separate;border-radius:18px;background-color:' . MX['navy'] . ';background-image:linear-gradient(135deg,#24406F,' . MX['navy'] . ' 55%,' . MX['navy2'] . ');"><tr>'
            . '<td style="padding:18px 20px 6px;vertical-align:top;text-align:' . $S . ';"><div style="font-size:18px;font-weight:900;color:#FFFFFF;line-height:1.5;">' . $e($nameBig) . '</div>'
            . ($nameSmall ? '<div style="font-size:11.5px;color:rgba(255,255,255,.72);font-weight:700;margin-top:1px;">' . $e($nameSmall) . '</div>' : '')
            . '<div style="font-size:13.5px;color:' . MX['gold'] . ';font-weight:800;margin-top:8px;">' . $e($m['jobTitle']) . '</div><div style="font-size:12.5px;color:rgba(255,255,255,.8);margin-top:1px;">' . $e($m['entity']) . '</div></td></tr>'
            . '<tr><td style="padding:0 20px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(212,177,118,.35);"><tr>'
            . '<td style="padding-top:12px;text-align:' . $S . ';"><div style="font-size:11px;color:rgba(255,255,255,.62);font-weight:700;">' . $e($T['ref']) . '</div><div dir="ltr" style="text-align:' . $S . ';font-family:' . $MONO . ';font-size:14px;font-weight:700;letter-spacing:.3px;white-space:nowrap;color:' . MX['gold'] . ';">' . $e($m['ref']) . '</div></td>'
            . '<td align="' . $E . '" style="padding-top:12px;"><div style="font-size:11px;color:rgba(255,255,255,.62);font-weight:700;">' . $e($T['date']) . '</div><div dir="ltr" style="font-size:13px;font-weight:700;color:#FFFFFF;">' . $e($m['date']) . '</div></td>'
            . '</tr></table></td></tr></table>';
    }
    $body .= $alerts . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">' . $grid . '</table>';
    if ($chips) $body .= '<div style="margin:16px 2px 8px;font-size:12px;font-weight:800;color:' . MX['goldD'] . ';text-align:' . $S . ';">' . $e($T['files']) . ' (' . count($m['files']) . ')</div><div style="text-align:' . $S . ';">' . $chips . '</div>';
    $body .= '<p style="margin:18px 0 0;font-size:13.5px;line-height:1.8;color:' . MX['ink'] . ';text-align:center;">' . $e($T['regards']) . '<br><b style="font-size:14.5px;color:' . MX['navy'] . ';">' . $e($T['sign']) . '</b></p>';
    $portal = ['ar' => 'الدخول إلى منصة الموارد البشرية', 'en' => 'Open the HR portal', 'id' => 'Buka portal SDM'][$m['L']] ?? 'الدخول إلى منصة الموارد البشرية';
    return mx_page(['eyebrow' => $T['hr'], 'title' => $m['updated'] ? $T['titleUpd'] : $T['titleNew'], 'tone' => 'green', 'rtl' => $RTL, 'pre' => $m['preheader'],
        'lead' => $greet . '<br>' . $e($m['updated'] ? $T['bodyUpd'] : $T['bodyNew']), 'body' => $body,
        'buttons' => [[$m['formUrl'], '✎ ' . $e($T['btn']), 'gold'], [mx_url(), $e($portal), 'ghost']], 'foot' => $T['note']]);
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
    if (rate_hit('hralert', 15, 3600)) { audit_log($row['ref'], 'تسجيل جديد (لم يُرسل تنبيه: تجاوز الحد الساعي)', '', 'النظام'); return; }
    $d = $row['data']; $g = function ($k) use ($d) { return trim((string)($d[$k] ?? '')); };
    $name = $g('fullNameAr') ?: $g('fullNameLatin');
    $html = mx_page(['eyebrow' => 'سجل المنسوبين · تسجيل جديد', 'title' => 'تسجيل جديد في سجل المنسوبين', 'tone' => 'teal', 'icon' => '👤', 'badge' => 'بانتظار المراجعة',
        'pre' => $name . ' · ' . $row['ref'], 'lead' => 'سجّل <b>' . esc_html($name) . '</b> بياناته ومرفقاته في سجل المنسوبين.',
        'body' => mx_rows([['الرقم المرجعي', $row['ref'], 1], ['الجهة', $g('entity')], ['المسمى الوظيفي', $g('jobTitle')], ['دولة العمل', $g('workCountry')], ['الجنسية', $g('nationality')], ['البريد الإلكتروني', $g('officialEmail') ?: $g('personalEmail'), 1]], 'بيانات المسجّل'),
        'buttons' => [[mx_url('people'), 'مراجعة الملف في المنصة', 'primary']]]);
    foreach ($list as $to) {
        try { send_mail($to, 'تسجيل جديد: ' . $name . ' · ' . $row['ref'], $html, 'تسجيل جديد: ' . $name . ' · ' . $row['ref'] . "\n" . mx_url('people'), 'Bonyan HR', logo_inline()); }
        catch (Throwable $e) { audit_log($row['ref'], 'تعذّر إرسال التنبيه', mask_email($to) . ' · ' . $e->getMessage()); }
    }
    audit_log($row['ref'], 'تنبيه الموارد البشرية بتسجيل جديد', implode('، ', array_map('mask_email', $list)), 'النظام');
}
