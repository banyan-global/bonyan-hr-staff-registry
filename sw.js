/* عامل الخدمة: يستقبل تنبيهات الحضور ويفتح المنصة على الصفحة المطلوبة عند الضغط */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
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
