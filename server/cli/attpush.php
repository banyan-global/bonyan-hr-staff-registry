<?php
/**
 * تنبيهات الحضور على الجوال (اختيارية لدقة أعلى؛ تعمل المنصة بدونها مع كل زيارة):
 *   كل ٥ دقائق: /usr/bin/php /home/<المستخدم>/domains/bonyanglobal.com/public_html/hr/server/cli/attpush.php
 */
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../auth.php';
require __DIR__ . '/../files.php';
require __DIR__ . '/../mail.php';
require __DIR__ . '/../staff.php';
require __DIR__ . '/../requests.php';
require __DIR__ . '/../hrx.php';
require __DIR__ . '/../hrplus.php';
echo json_encode(att_push_tick(true)), "\n";
