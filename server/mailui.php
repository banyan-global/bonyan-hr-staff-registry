<?php
/**
 * نظام تصميم موحّد لرسائل البريد: رأس بهوية بنيان، أيقونة حالة، بطاقة بيانات، مسار اعتماد، وأزرار واضحة.
 * مبني بجداول وأنماط سطرية ليظهر سليمًا في Gmail وOutlook وتطبيقات الجوال.
 */
declare(strict_types=1);

const MX = ['navy' => '#14284B', 'navy2' => '#0B1A33', 'navy3' => '#1F3866', 'gold' => '#D4B176', 'goldD' => '#A9823E', 'goldL' => '#F0DDB0',
    'ink' => '#1B2638', 'mut' => '#69768C', 'line' => '#E6EAF1', 'bg' => '#EEF1F6', 'soft' => '#F7F8FB'];
/* الحالة: خلفية الأيقونة، لونها، حدّها، الرمز */
const MX_TONES = [
    'navy' => ['#EEF2F9', '#14284B', '#CCD6E8', '✉'], 'green' => ['#EAF7F0', '#147A4E', '#BCE2CD', '✓'], 'red' => ['#FDEFED', '#B42318', '#F4C7C0', '✕'],
    'gold' => ['#FBF4E3', '#8A6A1F', '#EAD39B', '✎'], 'amber' => ['#FFF5E3', '#A35A00', '#F2D29A', '⏳'], 'blue' => ['#EDF3FD', '#2456B5', '#C9D8F5', 'ℹ'],
    'violet' => ['#F3EEFC', '#5B3AA6', '#D9CCF2', '★'], 'teal' => ['#E8F6F5', '#0E7068', '#BDE3E0', '✦'],
];
function mx_font(bool $rtl = true): string { return $rtl ? "'Tajawal','IBM Plex Sans Arabic','Segoe UI',Tahoma,Arial,sans-serif" : "'Segoe UI',Roboto,Helvetica,Arial,sans-serif"; }
function mx_tone(string $t): array { return MX_TONES[$t] ?? MX_TONES['navy']; }
/* استنتاج الحالة من العنوان حين لا تُمرَّر صراحة */
function mx_guess_tone(string $s): string {
    if (preg_match('/رُفض|رفض|لم يُعتمد|تعذّر|ملغى|إلغاء/u', $s)) return 'red';
    if (preg_match('/بانتظار|اعتمادك|تنبيه|تنتهي|منتهية/u', $s)) return 'amber';
    if (preg_match('/تعديل|عُدّل/u', $s)) return 'gold';
    if (preg_match('/اعتُمد|تم اعتماد|معتمد|اكتمل|تم /u', $s)) return 'green';
    if (preg_match('/تقييم/u', $s)) return 'violet';
    return 'navy';
}

/* زر مضاد للكسر: خلية ملوّنة بداخلها رابط كامل العرض */
function mx_btn(string $url, string $label, string $kind = 'primary', bool $rtl = true): string {
    $K = [
        'primary' => ['#14284B', 'linear-gradient(135deg,#24406F 0%,#14284B 55%,#0B1A33 100%)', '#FFFFFF', '#0B1A33'],
        'gold' => ['#D4B176', 'linear-gradient(135deg,#E9CF96 0%,#D4B176 50%,#B8924F 100%)', '#0B1A33', '#B8924F'],
        'success' => ['#147A4E', 'linear-gradient(135deg,#1C9762 0%,#147A4E 60%,#0E5C3A 100%)', '#FFFFFF', '#0E5C3A'],
        'danger' => ['#FFFFFF', '', '#B42318', '#F0B8B0'],
        'ghost' => ['#FFFFFF', '', '#14284B', '#CBD3E1'],
    ][$kind] ?? null;
    $K = $K ?: ['#14284B', '', '#FFFFFF', '#0B1A33'];
    $bgi = $K[1] !== '' ? 'background-image:' . $K[1] . ';' : '';
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr><td align="center" bgcolor="' . $K[0] . '" style="border-radius:14px;background-color:' . $K[0] . ';' . $bgi . 'border:1px solid ' . $K[3] . ';">'
        . '<a href="' . esc_html($url) . '" target="_blank" style="display:block;padding:14px 18px;font-family:' . mx_font($rtl) . ';font-size:15px;line-height:1.4;font-weight:800;color:' . $K[2] . ';text-decoration:none;border-radius:14px;text-align:center;">' . $label . '</a></td></tr></table>';
}
/* مجموعة أزرار: كل عنصر زر [رابط، نص، نوع]، أو ['pair' => [زر، زر]] لزرّين متجاورين */
function mx_buttons(array $btns, bool $rtl = true): string {
    $h = '';
    foreach ($btns as $b) {
        if (!$b) continue;
        if (isset($b['pair'])) {
            [$a, $c] = $b['pair'];
            $h .= '<tr><td style="padding:0 0 10px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
                . '<td width="50%" style="padding-' . ($rtl ? 'left' : 'right') . ':5px;vertical-align:top;">' . mx_btn($a[0], $a[1], $a[2] ?? 'ghost', $rtl) . '</td>'
                . '<td width="50%" style="padding-' . ($rtl ? 'right' : 'left') . ':5px;vertical-align:top;">' . mx_btn($c[0], $c[1], $c[2] ?? 'ghost', $rtl) . '</td></tr></table></td></tr>';
        } else $h .= '<tr><td style="padding:0 0 10px;">' . mx_btn($b[0], $b[1], $b[2] ?? 'primary', $rtl) . '</td></tr>';
    }
    return $h === '' ? '' : '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $h . '</table>';
}
/* بطاقة بيانات: [العنوان، القيمة، اتجاه يسار-يمين؟] */
function mx_rows(array $rows, string $title = '', bool $rtl = true): string {
    $S = $rtl ? 'right' : 'left'; $h = ''; $i = 0;
    foreach ($rows as $r) {
        $v = (string)($r[1] ?? ''); if ($v === '') continue;
        $val = !empty($r[2]) ? '<span dir="ltr" style="unicode-bidi:embed;">' . esc_html($v) . '</span>' : nl2br(esc_html($v));
        $h .= '<tr><td style="padding:11px 16px;' . ($i++ ? 'border-top:1px solid ' . MX['line'] . ';' : '') . 'vertical-align:top;width:32%;font-size:12.5px;line-height:1.7;color:' . MX['mut'] . ';font-weight:700;text-align:' . $S . ';white-space:nowrap;">' . esc_html((string)$r[0]) . '</td>'
            . '<td style="padding:11px 16px;' . ($i > 1 ? 'border-top:1px solid ' . MX['line'] . ';' : '') . 'vertical-align:top;font-size:14px;line-height:1.75;color:' . MX['ink'] . ';font-weight:800;text-align:' . $S . ';word-break:break-word;">' . $val . '</td></tr>';
    }
    if ($h === '') return '';
    return ($title !== '' ? '<div style="margin:18px 2px 8px;font-size:12px;font-weight:800;color:' . MX['goldD'] . ';letter-spacing:.2px;text-align:' . $S . ';">' . esc_html($title) . '</div>' : '<div style="height:14px;line-height:14px;font-size:0;">&nbsp;</div>')
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;background:' . MX['soft'] . ';border:1px solid ' . MX['line'] . ';border-radius:16px;">' . $h . '</table>';
}
/* ملاحظة ملوّنة */
function mx_note(string $text, string $tone = 'navy', string $label = '', bool $rtl = true): string {
    $T = mx_tone($tone); $S = $rtl ? 'right' : 'left';
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-collapse:separate;"><tr><td style="background:' . $T[0] . ';border:1px solid ' . $T[2] . ';border-' . $S . ':4px solid ' . $T[1] . ';border-radius:14px;padding:12px 16px;text-align:' . $S . ';">'
        . ($label !== '' ? '<div style="font-size:12.5px;font-weight:900;color:' . $T[1] . ';margin-bottom:4px;">' . esc_html($label) . '</div>' : '')
        . '<div style="font-size:13.5px;line-height:1.9;color:' . MX['ink'] . ';">' . nl2br(esc_html($text)) . '</div></td></tr></table>';
}
/* رمز كبير (دخول، تحقق) */
function mx_code(string $code): string {
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 6px;border-collapse:separate;"><tr><td align="center" dir="ltr" style="background:' . MX['soft'] . ';border:1px dashed #C9D2E1;border-radius:18px;padding:18px 10px;">'
        . '<div style="font-family:Consolas,\'SF Mono\',\'Courier New\',monospace;font-size:36px;line-height:1.2;font-weight:800;letter-spacing:12px;color:' . MX['navy'] . ';">' . esc_html($code) . '</div></td></tr></table>';
}
/* مسار الاعتماد: [[الخطوة، الحالة done|now|next|bad، سطر صغير]] */
function mx_chain(array $steps, bool $rtl = true): string {
    if (!$steps) return '';
    $S = $rtl ? 'right' : 'left'; $h = ''; $n = count($steps);
    foreach (array_values($steps) as $i => $s) {
        [$lab, $st] = [$s[0], $s[1]]; $sub = (string)($s[2] ?? '');
        $c = ['done' => ['#147A4E', '#EAF7F0', '✓'], 'now' => ['#A35A00', '#FFF5E3', '●'], 'bad' => ['#B42318', '#FDEFED', '✕'], 'next' => ['#9AA5B8', '#F2F4F8', (string)($i + 1)], 'skip' => ['#9AA5B8', '#F2F4F8', '–']][$st] ?? ['#9AA5B8', '#F2F4F8', (string)($i + 1)];
        $h .= '<tr><td width="34" style="vertical-align:top;padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="width:26px;height:26px;line-height:26px;border-radius:13px;background:' . $c[1] . ';border:1.5px solid ' . $c[0] . ';color:' . $c[0] . ';font-size:12px;font-weight:900;font-family:Arial,sans-serif;">' . $c[2] . '</td></tr>'
            . ($i < $n - 1 ? '<tr><td align="center" style="padding:0;"><div style="width:2px;height:18px;background:' . ($st === 'done' ? '#BCE2CD' : MX['line']) . ';margin:0 auto;"></div></td></tr>' : '') . '</table></td>'
            . '<td style="vertical-align:top;padding:3px 10px 0;text-align:' . $S . ';"><div style="font-size:13.5px;font-weight:800;color:' . ($st === 'next' || $st === 'skip' ? MX['mut'] : MX['ink']) . ';line-height:1.5;">' . esc_html($lab) . '</div>'
            . ($sub !== '' ? '<div style="font-size:11.5px;color:' . ($st === 'bad' ? '#B42318' : ($st === 'now' ? '#A35A00' : MX['mut'])) . ';line-height:1.6;">' . esc_html($sub) . '</div>' : '') . '</td></tr>';
    }
    return '<div style="margin:18px 2px 8px;font-size:12px;font-weight:800;color:' . MX['goldD'] . ';text-align:' . $S . ';">' . ($rtl ? 'مسار الطلب' : 'Request path') . '</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;background:#FFFFFF;border:1px solid ' . MX['line'] . ';border-radius:16px;"><tr><td style="padding:14px 14px 10px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $h . '</table></td></tr></table>';
}
/* فقرة نص */
function mx_p(string $html, bool $center = false, bool $rtl = true): string {
    return '<p style="margin:12px 0 0;font-size:14.5px;line-height:2;color:' . MX['ink'] . ';text-align:' . ($center ? 'center' : ($rtl ? 'right' : 'left')) . ';">' . $html . '</p>';
}

/* الصفحة الكاملة
   $o: eyebrow, title, lead (HTML آمن), tone, icon, badge, body (HTML), buttons (مصفوفة mx_buttons)، foot (نص صغير)، pre (نص المعاينة)، rtl، sign (bool) */
function mx_page(array $o): string {
    $rtl = $o['rtl'] ?? true; $dir = $rtl ? 'rtl' : 'ltr'; $S = $rtl ? 'right' : 'left'; $E = $rtl ? 'left' : 'right'; $F = mx_font($rtl);
    $tone = (string)($o['tone'] ?? 'navy'); $T = mx_tone($tone); $icon = (string)($o['icon'] ?? $T[3]);
    $org = $rtl ? 'مجموعة بنيان العالمية' : 'Bonyan International Group';
    $badge = (string)($o['badge'] ?? '');
    $h = '<!doctype html><html lang="' . ($rtl ? 'ar' : 'en') . '" dir="' . $dir . '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">'
        . '<title>' . esc_html((string)($o['title'] ?? '')) . '</title></head>'
        . '<body style="margin:0;padding:0;background:' . MX['bg'] . ';-webkit-text-size-adjust:100%;">'
        . (!empty($o['pre']) ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">' . esc_html((string)$o['pre']) . '&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>' : '')
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' . MX['bg'] . '" style="background:' . MX['bg'] . ';"><tr><td align="center" style="padding:26px 12px 30px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="' . $dir . '" style="max-width:600px;border-collapse:separate;background:#FFFFFF;border:1px solid #E1E6EE;border-radius:26px;overflow:hidden;font-family:' . $F . ';text-align:' . $S . ';box-shadow:0 18px 44px rgba(20,40,75,.14);">'
        /* الرأس */
        . '<tr><td bgcolor="' . MX['navy'] . '" style="background-color:' . MX['navy'] . ';background-image:radial-gradient(120% 140% at ' . ($rtl ? '100%' : '0%') . ' 0%,rgba(212,177,118,.22) 0%,rgba(212,177,118,0) 46%),linear-gradient(135deg,' . MX['navy3'] . ' 0%,' . MX['navy'] . ' 52%,' . MX['navy2'] . ' 100%);padding:22px 26px 20px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        . '<td style="vertical-align:middle;text-align:' . $S . ';"><div style="font-size:17px;line-height:1.4;font-weight:900;color:#FFFFFF;">' . esc_html($org) . '</div>'
        . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:7px;"><tr><td style="background:rgba(212,177,118,.16);border:1px solid rgba(212,177,118,.5);border-radius:999px;padding:3px 11px;font-size:11.5px;line-height:1.6;font-weight:800;color:#EED6A2;white-space:nowrap;">' . esc_html((string)($o['eyebrow'] ?? '')) . '</td></tr></table></td>'
        . '<td align="' . $E . '" width="64" style="vertical-align:middle;"><img src="cid:logo" width="58" alt="Bonyan" style="display:block;width:58px;height:auto;border:0;"></td></tr></table></td></tr>'
        . '<tr><td style="height:3px;line-height:3px;font-size:0;background:' . MX['gold'] . ';background-image:linear-gradient(90deg,#B8924F,' . MX['gold'] . ',' . MX['goldL'] . ',' . MX['gold'] . ',#B8924F);">&nbsp;</td></tr>'
        /* البطل: أيقونة الحالة والعنوان */
        . '<tr><td align="center" style="padding:30px 26px 6px;">'
        . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" style="width:64px;height:64px;line-height:64px;border-radius:32px;background:' . $T[0] . ';border:2px solid ' . $T[2] . ';color:' . $T[1] . ';font-size:28px;font-weight:900;font-family:Arial,\'Segoe UI Symbol\',sans-serif;text-align:center;">' . $icon . '</td></tr></table>'
        . ($badge !== '' ? '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:12px;"><tr><td style="background:' . $T[0] . ';border:1px solid ' . $T[2] . ';border-radius:999px;padding:4px 13px;font-size:12px;font-weight:800;color:' . $T[1] . ';white-space:nowrap;">' . esc_html($badge) . '</td></tr></table>' : '')
        . '<h1 style="margin:14px 0 0;font-size:22px;line-height:1.55;color:' . MX['navy'] . ';font-weight:900;text-align:center;">' . esc_html((string)($o['title'] ?? '')) . '</h1>'
        . (!empty($o['lead']) ? '<p style="margin:8px auto 0;max-width:470px;font-size:14.5px;line-height:2;color:#3A475C;text-align:center;">' . $o['lead'] . '</p>' : '')
        . '</td></tr>'
        /* المحتوى */
        . (!empty($o['body']) ? '<tr><td style="padding:6px 26px 0;">' . $o['body'] . '</td></tr>' : '')
        . (!empty($o['buttons']) ? '<tr><td style="padding:22px 26px 0;">' . mx_buttons($o['buttons'], $rtl) . '</td></tr>' : '')
        . (!empty($o['foot']) ? '<tr><td style="padding:6px 30px 0;"><p style="margin:0;font-size:12px;line-height:1.9;color:' . MX['mut'] . ';text-align:center;">' . esc_html((string)$o['foot']) . '</p></td></tr>' : '')
        . '<tr><td style="height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>'
        . (($o['sign'] ?? true) ? '<tr><td style="background:#F6F7FA;border-top:1px solid ' . MX['line'] . ';padding:4px 18px 16px;">' . mail_signature($rtl) . '</td></tr>' : '')
        . '</table></td></tr></table></body></html>';
    return $h;
}
/* رابط في المنصة */
function mx_url(string $hash = ''): string { $b = (string)cfg('site_url'); return $hash === '' ? $b : (strpos($hash, '.html') !== false ? $b . $hash : $b . '#' . ltrim($hash, '#')); }
