/* الانتقال إلى الدومين الرسمي: أي رابط قديم على GitHub Pages يفتح الصفحة نفسها على hr.bonyanglobal.com (مع الرابط الخاص ورقم المرجع) */
(function () {
  if (/\.github\.io$/i.test(location.hostname)) {
    location.replace('https://hr.bonyanglobal.com' + (location.pathname.replace(/^\/bonyan-hr-staff-registry/i, '') || '/') + location.search + location.hash);
  }
})();
(function(){var t="light";try{t=localStorage.getItem("bonyan-hr-theme")||"light"}catch(e){}document.documentElement.setAttribute("data-theme",t)})();
