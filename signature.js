(function(){
  // ١) السنة تتحدث تلقائياً
  var y = new Date().getFullYear();
  document.querySelectorAll('.oj2-year').forEach(function(s){ s.textContent = y; });

  // ٢) التقاط اللون الأساسي من هوية الموقع
  function rgb(c){
    if(!c) return null; c = c.trim(); if(!c) return null;
    if(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(c)) c = 'hsl(' + c + ')'; // صيغة shadcn/Tailwind
    var t = document.createElement('i'); t.style.color = c;
    if(!t.style.color) return null;
    document.body.appendChild(t); var v = getComputedStyle(t).color; t.remove();
    var m = v.match(/[\d.]+/g); if(!m || (m[3] !== undefined && +m[3] < .5)) return null;
    return { r:+m[0], g:+m[1], b:+m[2], css:'rgb(' + m[0] + ',' + m[1] + ',' + m[2] + ')' };
  }
  function isBrand(c){ // لون مشبع غير رمادي ولا أبيض ولا أسود
    if(!c) return false;
    var r=c.r/255,g=c.g/255,b=c.b/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;
    var s = d===0 ? 0 : d/(1-Math.abs(2*l-1));
    return s > .35 && l > .18 && l < .80;
  }
  function detect(){
    var root = getComputedStyle(document.documentElement);
    var vars = ['--accent','--brand','--brand-color','--secondary','--primary','--main-color','--primary-color','--color-primary','--theme-color','--gold','--orange'];
    for(var i=0;i<vars.length;i++){ var c = rgb(root.getPropertyValue(vars[i])); if(isBrand(c)) return c.css; }
    var els = document.querySelectorAll('button, .btn, [class*="btn"], [class*="button"], nav a, header a, a');
    for(var j=0;j<els.length && j<60;j++){
      if(els[j].closest('.oj-sign')) continue;
      var st = getComputedStyle(els[j]);
      var bg = rgb(st.backgroundColor); if(isBrand(bg)) return bg.css;
      var fg = rgb(st.color); if(isBrand(fg)) return fg.css;
    }
    return null;
  }
  function apply(){
    var found = detect();
    document.querySelectorAll('.oj-sign').forEach(function(box){
      var manual = box.getAttribute('data-accent');
      if(manual) box.style.setProperty('--oj-accent', manual);
      else if(found) box.style.setProperty('--oj-accent', found);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
