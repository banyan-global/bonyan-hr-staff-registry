/* الانتقال إلى الدومين الرسمي: أي رابط قديم على GitHub Pages يفتح الصفحة نفسها على hr.bonyanglobal.com (مع الرابط الخاص ورقم المرجع) */
(function () {
  if (/\.github\.io$/i.test(location.hostname)) {
    /* الرابط القديم كان نموذج التسجيل نفسه، فيفتح صفحة التسجيل على المنصة الجديدة */
    var p = location.pathname.replace(/^\/bonyan-hr-staff-registry/i, '');
    if (p === '' || p === '/' || /^\/index\.html$/i.test(p)) p = '/register.html';
    location.replace('https://hr.bonyanglobal.com' + p + location.search + location.hash);
  }
})();
(function(){var t="light";try{t=localStorage.getItem("bonyan-hr-theme")||"light"}catch(e){}document.documentElement.setAttribute("data-theme",t)})();
