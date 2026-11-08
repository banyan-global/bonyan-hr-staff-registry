/* عامل الخدمة: يجعل المنصة تطبيقًا قابلًا للتثبيت، ويستقبل تنبيهات الحضور ويفتح الصفحة المطلوبة عند الضغط */
var OFFLINE = '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>لا اتصال</title>' +
  '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0a172e;color:#eef2fa;font-family:Tajawal,Tahoma,sans-serif;text-align:center;padding:24px">' +
  '<div><h1 style="color:#fbefd2;font-size:22px">لا يوجد اتصال بالإنترنت</h1><p style="color:#a9b7cf">تحتاج البصمة إلى اتصال. تحقق من الإنترنت ثم أعد المحاولة.</p>' +
  '<button onclick="location.reload()" style="font:inherit;font-weight:800;border:0;border-radius:12px;padding:10px 22px;background:#e3c485;color:#2c1d05">إعادة المحاولة</button></div></body></html>';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
/* الصفحات من الشبكة دائمًا (البيانات حية)، وصفحة بديلة واضحة عند انقطاع الاتصال */
self.addEventListener('fetch', function (e) {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(function () { return new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }));
});
self.addEventListener('push', function (e) {
  var d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'بنيان للموارد البشرية', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'بنيان للموارد البشرية', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', dir: 'rtl', lang: 'ar', tag: d.tag || 'bhr', renotify: true, requireInteraction: !!d.sticky,
    data: { url: d.url || '#myatt' }, actions: d.actions || []
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var h = (e.notification.data && e.notification.data.url) || '#myatt';
  if (e.action === 'perm') h = '#myatt-perm'; else if (e.action === 'out') h = '#myatt-out';
  var url = new URL('./' + h, self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if (cs[i].url.indexOf(self.registration.scope) === 0 && 'focus' in cs[i]) { cs[i].navigate(url).catch(function () { }); return cs[i].focus(); } }
    return self.clients.openWindow(url);
  }));
});
