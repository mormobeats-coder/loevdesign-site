// Оптимизация производительности скроллинга
let scrollTicking = false;
let resizeTicking = false;

// Функция для оптимизированного обновления при скролле
function updateOnScroll() {
  // Здесь можно добавить логику, которая должна выполняться при скролле
  scrollTicking = false;
}

// Функция для оптимизированного обновления при изменении размера окна
function updateOnResize() {
  // Здесь можно добавить логику, которая должна выполняться при изменении размера
  resizeTicking = false;
}

// Оптимизированные обработчики событий
window.addEventListener('scroll', function() {
  if (!scrollTicking) {
    requestAnimationFrame(updateOnScroll);
    scrollTicking = true;
  }
}, { passive: true });

window.addEventListener('resize', function() {
  if (!resizeTicking) {
    requestAnimationFrame(updateOnResize);
    resizeTicking = true;
  }
}, { passive: true });

(function(){
  function onReady(fn){ if(document.readyState !== 'loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  onReady(function(){
    // Smooth anchors local
    document.querySelectorAll('a[href^="#"]').forEach(function(link){
      link.addEventListener('click', function(e){
        var id = this.getAttribute('href');
        if(id.length > 1){ e.preventDefault(); document.querySelector(id)?.scrollIntoView({behavior:'smooth'}); }
      });
    });

    // Minimal lightbox just for case pages
    var gallery = Array.from(document.querySelectorAll('[data-case-gallery] img'));
    if(gallery.length){
      var root = document.createElement('div');
      root.className = 'lb';
      root.innerHTML = '<button class="lb__close" aria-label="Закрыть">✕</button><button class="lb__btn lb__prev" aria-label="Предыдущий">‹</button><img class="lb__img" alt="Слайд"/><button class="lb__btn lb__next" aria-label="Следующий">›</button><div class="lb__counter"></div>';
      document.body.appendChild(root);
      var imgEl = root.querySelector('.lb__img');
      var closeBtn = root.querySelector('.lb__close');
      var prevBtn = root.querySelector('.lb__prev');
      var nextBtn = root.querySelector('.lb__next');
      var counter = root.querySelector('.lb__counter');
      var idx = 0;
      function update(){ counter.textContent = (idx+1)+' / '+gallery.length; imgEl.src = gallery[idx].getAttribute('data-full') || gallery[idx].src; }
      function open(i){ idx = i; update(); root.classList.add('is-open'); }
      function close(){ root.classList.remove('is-open'); }
      function prev(){ idx = (idx-1+gallery.length)%gallery.length; update(); }
      function next(){ idx = (idx+1)%gallery.length; update(); }
      gallery.forEach(function(img, i){ img.style.cursor='zoom-in'; img.addEventListener('click', function(){ open(i); }); });
      closeBtn.addEventListener('click', close);
      prevBtn.addEventListener('click', prev);
      nextBtn.addEventListener('click', next);
      root.addEventListener('click', function(e){ if(e.target === root){ close(); } });
      document.addEventListener('keydown', function(e){ if(!root.classList.contains('is-open')) return; if(e.key==='Escape') close(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });
    }

    // Сохранение и восстановление позиции скролла для основного контейнера main
    try {
      var mainEl = document.querySelector('main');
      if (mainEl) {
        var SCROLL_KEY = 'case_scroll_top';
        // Восстанавливаем при загрузке
        var saved = parseInt(sessionStorage.getItem(SCROLL_KEY) || '0', 10);
        if (!isNaN(saved) && saved > 0) {
          mainEl.scrollTop = saved;
        }
        // Дебаунс сохранения позиции
        var saveTick = false;
        mainEl.addEventListener('scroll', function(){
          if (saveTick) return;
          saveTick = true;
          requestAnimationFrame(function(){
            try { sessionStorage.setItem(SCROLL_KEY, String(mainEl.scrollTop)); } catch(e){}
            saveTick = false;
          });
        }, { passive: true });
        // На уходе со страницы — сохранить финальную позицию
        window.addEventListener('beforeunload', function(){
          try { sessionStorage.setItem(SCROLL_KEY, String(mainEl.scrollTop)); } catch(e){}
        });
      }
    } catch (e) { /* no-op */ }
  });
})();


