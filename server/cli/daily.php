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
    $docs = ['passportExpiry' => 'الجواز', 'permitExpiry' => 'الإقامة', 'nationalIdExpiry' => 'الهوية', 'contractEnd' => 'العقد'];
    $items = [];
    $priv = private_refs();
    foreach (q('SELECT ref, data FROM staff ORDER BY id') as $s) {
        if (in_array($s['ref'], $priv, true)) continue;
        $d = json_decode($s['data'], true) ?: [];
        foreach ($docs as $k => $lbl) {
            $v = valid_date($d[$k] ?? ''); if ($v === '') continue;
            $days = (int)floor((strtotime($v) - strtotime(date('Y-m-d'))) / 86400);
            if ($days <= 60) $items[] = [$days, ($d['fullNameAr'] ?? '') ?: ($d['fullNameLatin'] ?? ''), $s['ref'], $lbl, $v];
        }
    }
    usort($items, fn($a, $b) => $a[0] <=> $b[0]);
    if ($list && $items) {
        $exp = count(array_filter($items, fn($i) => $i[0] < 0));
        $rows = implode('', array_map(function ($i, $n) {
            $late = $i[0] < 0; $chip = $late ? ['#FDEFED', '#B42318', '#F4C7C0', 'منتهية منذ ' . abs($i[0]) . ' يومًا'] : ['#FFF5E3', '#A35A00', '#F2D29A', $i[0] === 0 ? 'تنتهي اليوم' : 'تنتهي خلال ' . $i[0] . ' يومًا'];
            return '<tr><td style="padding:12px 16px;' . ($n ? 'border-top:1px solid ' . MX['line'] . ';' : '') . 'vertical-align:top;"><div style="font-size:14px;font-weight:800;color:' . MX['ink'] . ';">' . esc_html($i[1]) . '</div>'
                . '<div style="font-size:12px;color:' . MX['mut'] . ';margin-top:2px;">' . esc_html($i[3]) . ' · <span dir="ltr">' . esc_html($i[4]) . '</span> · <span dir="ltr">' . esc_html($i[2]) . '</span></div></td>'
                . '<td align="left" style="padding:12px 16px;' . ($n ? 'border-top:1px solid ' . MX['line'] . ';' : '') . 'vertical-align:middle;white-space:nowrap;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:' . $chip[0] . ';border:1px solid ' . $chip[2] . ';color:' . $chip[1] . ';font-size:11.5px;font-weight:800;">' . $chip[3] . '</span></td></tr>';
        }, $items, array_keys($items)));
        $html = mx_page(['eyebrow' => 'Bonyan HR · تنبيه أسبوعي', 'title' => count($items) . ' وثيقة تحتاج متابعة', 'tone' => $exp ? 'red' : 'amber', 'icon' => '📄', 'badge' => $exp ? $exp . ' منتهية' : 'خلال ٦٠ يومًا',
            'pre' => 'وثائق منتهية أو تنتهي خلال ٦٠ يومًا: ' . count($items), 'lead' => 'هذه الوثائق انتهت صلاحيتها أو تنتهي خلال ٦٠ يومًا، مرتّبة من الأقرب.',
            'body' => '<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;background:' . MX['soft'] . ';border:1px solid ' . MX['line'] . ';border-radius:16px;">' . $rows . '</table>',
            'buttons' => [[mx_url('documents'), 'مراجعة الوثائق في المنصة', 'primary']]]);
        foreach ($list as $to) send_mail($to, 'تنبيه أسبوعي: ' . count($items) . ' وثيقة تحتاج متابعة', $html, 'وثائق تحتاج متابعة: ' . count($items), 'Bonyan HR', logo_inline());
        echo 'digest: ', count($items), "\n";
    }
}
