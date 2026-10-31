<?php
/**
 * المهمة اليومية (تُضبط من لوحة هوستنجر: «متقدم» ← «مهام Cron»):
 *   /usr/bin/php /home/<المستخدم>/domains/bonyanglobal.com/public_html/hr/server/cli/daily.php
 * - نسخة احتياطية لقاعدة البيانات (تُحفظ آخر ٣٠ نسخة)
 * - تنظيف الجلسات والرموز المنتهية
 * - كل يوم أحد: رسالة للموارد البشرية بالوثائق المنتهية أو التي تنتهي خلال ٦٠ يومًا
 */
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../auth.php';
require __DIR__ . '/../files.php';
require __DIR__ . '/../mail.php';
require __DIR__ . '/../staff.php';
require __DIR__ . '/../admin.php';

$r = make_backup('المهمة اليومية');
echo 'backup: ', $r['name'], "\n";
q('DELETE FROM sessions WHERE expires_at < ?', [now()]);
q('DELETE FROM login_codes WHERE expires_at < ?', [date('Y-m-d H:i:s', time() - 86400)]);
q('DELETE FROM kv WHERE expires_at IS NOT NULL AND expires_at < ?', [now()]);

if (date('w') === '0' || in_array('--digest', $argv, true)) {
    $list = hr_recipients();
    $docs = ['passportExpiry' => 'الجواز', 'permitExpiry' => 'الإقامة', 'nationalIdExpiry' => 'الهوية', 'workPermitExpiry' => 'تصريح العمل', 'contractEnd' => 'العقد'];
    $items = [];
    foreach (q('SELECT ref, data FROM staff ORDER BY id') as $s) {
        $d = json_decode($s['data'], true) ?: [];
        foreach ($docs as $k => $lbl) {
            $v = valid_date($d[$k] ?? ''); if ($v === '') continue;
            $days = (int)floor((strtotime($v) - strtotime(date('Y-m-d'))) / 86400);
            if ($days <= 60) $items[] = [$days, ($d['fullNameAr'] ?? '') ?: ($d['fullNameLatin'] ?? ''), $s['ref'], $lbl, $v];
        }
    }
    usort($items, fn($a, $b) => $a[0] <=> $b[0]);
    if ($list && $items) {
        $rows = implode('', array_map(fn($i) => '<tr><td style="padding:7px 6px;border-bottom:1px solid #EEF1F5;font-weight:700;">' . esc_html($i[1]) . '<div style="font-size:11px;color:#8A96AB;" dir="ltr">' . esc_html($i[2]) . '</div></td><td style="padding:7px 6px;border-bottom:1px solid #EEF1F5;">' . esc_html($i[3]) . '</td><td style="padding:7px 6px;border-bottom:1px solid #EEF1F5;" dir="ltr">' . esc_html($i[4]) . '</td><td style="padding:7px 6px;border-bottom:1px solid #EEF1F5;font-weight:800;color:' . ($i[0] < 0 ? '#B42318' : '#9A6700') . ';">' . ($i[0] < 0 ? 'منتهية' : 'بعد ' . $i[0] . ' يومًا') . '</td></tr>', $items));
        $inner = '<p style="margin:0 0 10px;font-size:13.5px;color:#1D2A3B;">الوثائق المنتهية أو التي تنتهي خلال ٦٠ يومًا (' . count($items) . '):</p><table style="border-collapse:collapse;width:100%;font-size:13px;color:#1D2A3B;">' . $rows . '</table>'
            . '<div style="margin:14px 0 6px;"><a href="' . esc_html(cfg('site_url') . 'admin.html') . '" style="display:inline-block;padding:9px 18px;border-radius:10px;background:#16294A;color:#fff;font-weight:700;font-size:13px;text-decoration:none;">فتح لوحة الموارد البشرية</a></div>';
        foreach ($list as $to) send_mail($to, 'تنبيه أسبوعي: ' . count($items) . ' وثيقة تحتاج متابعة', mail_frame('Bonyan HR · تنبيه أسبوعي', 'وثائق تحتاج متابعة', $inner), 'وثائق تحتاج متابعة: ' . count($items), 'Bonyan HR', logo_inline());
        echo 'digest: ', count($items), "\n";
    }
}
