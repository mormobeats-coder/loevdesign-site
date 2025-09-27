(function(){
  function onReady(fn){ if(document.readyState !== 'loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  onReady(function(){
    // Scroll lock that preserves scrollbar on case pages
    function lockBodyScroll(){
      // Check if we're on a case page
      const isCasePage = document.body.classList.contains('case-page') || 
                        document.querySelector('link[href*="case.css"]') !== null;
      
      if (isCasePage) {
        // For case pages, keep scrollbar visible but prevent scrolling
        document.body.style.overflow = 'auto'; // Keep scrollbar visible
        document.body.style.paddingRight = '0px';
        // Add event listener to prevent scroll
        document.addEventListener('wheel', preventScroll, { passive: false });
        document.addEventListener('touchmove', preventScroll, { passive: false });
        document.addEventListener('keydown', preventScrollKeys, { passive: false });
        // Also prevent scroll on window
        window.addEventListener('scroll', preventScroll, { passive: false });
      } else {
        // For other pages, use simple overflow hidden
        document.body.style.overflow = 'hidden';
      }
    }
    function unlockBodyScroll(){
      // Check if we're on a case page
      const isCasePage = document.body.classList.contains('case-page') || 
                        document.querySelector('link[href*="case.css"]') !== null;
      
      if (isCasePage) {
        // For case pages, restore scroll and remove event listeners
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('keydown', preventScrollKeys);
        window.removeEventListener('scroll', preventScroll);
      } else {
        // For other pages, simple restore
        document.body.style.overflow = '';
      }
    }
    
    // Helper functions to prevent scrolling while keeping scrollbar
    function preventScroll(e) {
      e.preventDefault();
    }
    
    function preventScrollKeys(e) {
      const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // space, page up/down, home, end, arrows
      if (keys.includes(e.keyCode)) {
        e.preventDefault();
      }
    }
    // Inject shared header/footer into pages that opt-in via data-include
    (function(){
      var hdrHost = document.querySelector('[data-include-header]');
      var ftrHost = document.querySelector('[data-include-footer]');
      function fetchAndInject(sel, url){
        return fetch(url).then(function(r){ return r.text(); }).then(function(html){ sel.innerHTML = html; }).catch(function(){});
      }
      var tasks = [];
      if(hdrHost){ tasks.push(fetchAndInject(hdrHost, './partials/header.html')); }
      if(ftrHost){ tasks.push(fetchAndInject(ftrHost, './partials/footer.html')); }
      if(tasks.length){ Promise.all(tasks).then(function(){ try{ window.dispatchEvent(new Event('DOMContentLoaded')); }catch(e){} }); }
    })();
    // Register Service Worker (ignore errors on file://)
    if ('serviceWorker' in navigator) {
      try {
        navigator.serviceWorker.register('/assets/sw.js');
      } catch (e) { /* no-op */ }
    }
    // Header background always visible - подложка всегда видна
    var header = document.querySelector('.site-header');
    
    // Инициализация - показать шапку с подложкой
    if(header) {
      header.style.opacity = '1';
      header.style.visibility = 'visible';
    }
    
    // Убрана логика скролла - подложка всегда видна
    
    // Work Flow Animation
    (function(){
      const workFlow = document.querySelector('.work-flow');
      if (!workFlow) return;
      
      // Убираем класс скрытия при старте анимации
      workFlow.classList.remove('work-flow--hidden');
      
      const steps = workFlow.querySelectorAll('.work-step');
      const lines = workFlow.querySelectorAll('.work-step-line');
      
      let currentStep = 0;
      let isAnimating = false;
      
      function showStep(stepIndex) {
        if (stepIndex >= steps.length) return;
        
        // Показать этап
        steps[stepIndex].classList.add('active');
        
        // Показать линию после этапа (если не последний)
        if (stepIndex < lines.length) {
          setTimeout(() => {
            lines[stepIndex].classList.add('active');
          }, 400);
        }
      }
      
      function hideStep(stepIndex) {
        if (stepIndex >= steps.length) return;
        
        // Скрыть линию
        if (stepIndex < lines.length) {
          lines[stepIndex].classList.remove('active');
        }
        
        // Скрыть этап
        setTimeout(() => {
          steps[stepIndex].classList.remove('active');
        }, 200);
      }
      
      function animateWorkFlow() {
        if (isAnimating) return;
        isAnimating = true;
        
        // Скрыть все этапы и линии
        steps.forEach(step => step.classList.remove('active'));
        lines.forEach(line => line.classList.remove('active'));
        
        currentStep = 0;
        
        // Показать этапы поочередно
        function showNextStep() {
          if (currentStep < steps.length) {
            showStep(currentStep);
            currentStep++;
            setTimeout(showNextStep, 1200);
          } else {
            // Все этапы показаны, ждем и начинаем заново
            setTimeout(() => {
              // Скрыть последние 3 этапа
              for (let i = steps.length - 3; i < steps.length; i++) {
                hideStep(i);
              }
              setTimeout(() => {
                isAnimating = false;
                animateWorkFlow();
              }, 1000);
            }, 2000);
          }
        }
        
        showNextStep();
      }
      
      // Запустить анимацию через 1 секунду после загрузки
      setTimeout(animateWorkFlow, 1000);
      
      // Перезапускать анимацию при скролле к блоку
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isAnimating) {
            setTimeout(animateWorkFlow, 500);
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(workFlow);
    })();
    
    // Smooth anchors
    document.querySelectorAll('a[href^="#"]').forEach(function(link){
      link.addEventListener('click', function(e){
        var id = this.getAttribute('href');
        if(id.length > 1){ e.preventDefault(); document.querySelector(id)?.scrollIntoView({behavior:'smooth'}); }
      });
    });

    // Mobile menu (off-canvas)
    (function(){
      var toggle = document.querySelector('.menu-toggle');
      var drawer = document.getElementById('mobile-nav');
      if(!toggle || !drawer) return;
      var panel = drawer.querySelector('.mobile-nav-panel');
      var overlay = drawer.querySelector('.mobile-nav-overlay');
      var closeBtn = drawer.querySelector('.mobile-nav-close');
      var previouslyFocused = null;
      var untrap = null;
      function open(){
        previouslyFocused = document.activeElement;
        drawer.classList.add('is-active');
        document.getElementById('main')?.setAttribute('aria-hidden','true');
        toggle.setAttribute('aria-expanded','true');
        untrap = trapFocus(drawer);
        closeBtn?.focus();
      }
      function close(){
        drawer.classList.remove('is-active');
        document.getElementById('main')?.removeAttribute('aria-hidden');
        toggle.setAttribute('aria-expanded','false');
        if(typeof untrap==='function'){ try{ untrap(); }catch(e){} untrap=null; }
        if(previouslyFocused && previouslyFocused.focus){ previouslyFocused.focus(); }
      }
      toggle.addEventListener('click', function(){ drawer.classList.contains('is-active') ? close() : open(); });
      overlay?.addEventListener('click', close);
      closeBtn?.addEventListener('click', close);
      drawer.addEventListener('keydown', function(e){ if(e.key==='Escape'){ close(); } });
      // Close on navigation click
      drawer.querySelectorAll('a[href^="#"]').forEach(function(a){ a.addEventListener('click', close); });
    })();

    // Улучшенные анимации появления при скролле
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          // Добавляем класс с задержкой для более плавного эффекта
          setTimeout(function() {
            entry.target.classList.add('in');
          }, 50);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1, 
      rootMargin: '0px 0px -5%' 
    });
    
    // Применяем анимации с учетом типа элемента
    document.querySelectorAll('.reveal').forEach(function(el, i){
      el.style.transitionDelay = '0ms';
      revealObserver.observe(el);
    });

    // Улучшенная функциональность карточек услуг
    (function(){
      var serviceCards = document.querySelectorAll('.service');
      
      if (!serviceCards.length) return;
      
      // Добавляем современные hover эффекты
      serviceCards.forEach(function(card, index) {
        // Убираем задержку анимации
        card.style.animationDelay = '0s';
        // Добавляем эффект появления
        card.classList.add('loading');
        setTimeout(function() {
          card.classList.remove('loading');
        }, 100); // минимальная задержка для плавности
        
        // Улучшенные hover эффекты
        card.addEventListener('mouseenter', function() {
          // Добавляем эффект свечения
          this.style.filter = 'brightness(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
          // Убираем эффект свечения
          this.style.filter = '';
        });
        
        // Улучшенный click effect с ripple
        card.addEventListener('click', function(e) {
          // Создаем ripple эффект
          var ripple = document.createElement('div');
          ripple.className = 'ripple-effect';
          ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(155,123,255,0.4) 0%, rgba(106,75,217,0.2) 100%);
            transform: scale(0);
            animation: ripple 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(155,123,255,0.3);
          `;
          
          var rect = this.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height) * 1.5;
          var x = e.clientX - rect.left - size / 2;
          var y = e.clientY - rect.top - size / 2;
          
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          
          this.appendChild(ripple);
          
          setTimeout(function() {
            ripple.remove();
          }, 800);
        });
      });
      
      // Добавляем CSS для ripple эффекта и пульсации
      var style = document.createElement('style');
      style.textContent = `
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(155,123,255,0.4) 0%, rgba(106,75,217,0.2) 100%);
          transform: scale(0);
          animation: ripple 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 0 20px rgba(155,123,255,0.3);
        }
        
        .service.loading {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        
        .service:not(.loading) {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `;
      document.head.appendChild(style);
    })();

    // Scrollspy: highlight active nav link
    var sections = ['services','cases','about','contact'];
    var navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
    function setActive(id){
      navLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#'+id); });
    }
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if(entry.isIntersecting){ setActive(entry.target.id); } });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function(id){ var el = document.getElementById(id); if(el) spy.observe(el); });

    // Улучшенные GSAP анимации (respect prefers-reduced-motion)
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(window.gsap && !reduce){
      // Hero анимации с более сложными эффектами
      gsap.from('.display', { 
        y: 50, 
        opacity: 0, 
        scale: 0.9,
        duration: 1.2, 
        ease: 'power3.out',
        delay: 0.2
      });
      
      gsap.from('.lead', { 
        y: 30, 
        opacity: 0, 
        duration: 1, 
        delay: 0.4, 
        ease: 'power2.out' 
      });
      
      gsap.from('.cta', { 
        y: 20, 
        opacity: 0, 
        duration: 0.8, 
        delay: 0.6, 
        ease: 'power2.out' 
      });
      
      // Плавающие элементы с более сложной анимацией
      gsap.to('.hero-blob', { 
        xPercent: 8, 
        yPercent: 6, 
        rotation: 5,
        duration: 8, 
        ease: 'sine.inOut', 
        yoyo: true, 
        repeat: -1 
      });
      
      // Параллакс эффекты для секций
      gsap.utils.toArray('.section').forEach(function(sec, index){
        gsap.from(sec, { 
          opacity: 0, 
          y: 50, 
          scale: 0.95,
          duration: 1, 
          ease: 'power2.out', 
          scrollTrigger: { 
            trigger: sec, 
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          } 
        });
      });
      
      // Анимация плавающих карточек в hero
      gsap.utils.toArray('.floating-cards .card').forEach(function(card, index){
        gsap.from(card, {
          opacity: 0,
          scale: 0.5,
          rotation: 45,
          duration: 1.5,
          delay: 0.8 + (index * 0.2),
          ease: 'back.out(1.7)'
        });
      });
      
      // Анимация заголовков секций
      gsap.utils.toArray('.section-title').forEach(function(title){
        gsap.from(title, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        });
      });
    }

    // Улучшенный cursor-follow glow в hero
    (function(){
      var hero = document.querySelector('.hero');
      if(!hero) return;
      
      var inside = false;
      var glowIntensity = 0;
      
      function setGlowOpacity(val){ 
        hero.style.setProperty('--glow-opacity', val); 
      }
      
      function updateGlowIntensity(target) {
        var current = parseFloat(hero.style.getPropertyValue('--glow-opacity') || '0');
        var diff = target - current;
        if (Math.abs(diff) > 0.01) {
          current += diff * 0.1;
          setGlowOpacity(current);
          requestAnimationFrame(function() {
            updateGlowIntensity(target);
          });
        }
      }
      
      hero.addEventListener('mousemove', function(e){
        var rect = hero.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        
        hero.style.setProperty('--glow-x', x + '%');
        hero.style.setProperty('--glow-y', y + '%');
        
        if(!inside){ 
          inside = true; 
          updateGlowIntensity(1);
        }
      }, { passive: true });
      
      hero.addEventListener('mouseleave', function(){ 
        inside = false; 
        updateGlowIntensity(0);
      }, { passive: true });
    })();
    
    // Добавляем анимации для навигационных элементов
    (function(){
      var navLinks = document.querySelectorAll('.nav a');
      var menuToggle = document.querySelector('.menu-toggle');
      
      // Анимация для навигационных ссылок
      navLinks.forEach(function(link) {
        link.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 12px rgba(155, 123, 255, 0.2)';
        });
        
        link.addEventListener('mouseleave', function() {
          this.style.transform = '';
          this.style.boxShadow = '';
        });
      });
      
      // Анимация для кнопки меню
      if (menuToggle) {
        menuToggle.addEventListener('mouseenter', function() {
          this.style.transform = 'scale(1.05)';
        });
        
        menuToggle.addEventListener('mouseleave', function() {
          this.style.transform = '';
        });
      }
    })();
    
    // Улучшенные анимации для специальных кнопок
    (function(){
      var portfolioBtn = document.querySelector('.btn--portfolio');
      var discussBtn = document.querySelector('.btn--discuss');
      var contactBtn = document.querySelector('.btn--contact');
      
      // Анимация для кнопки "Портфолио"
      if (portfolioBtn) {
        portfolioBtn.addEventListener('mouseenter', function() {
          this.style.filter = 'brightness(1.1)';
        });
        
        portfolioBtn.addEventListener('mouseleave', function() {
          this.style.filter = '';
        });
        
        // Добавляем пульсацию при загрузке
        setTimeout(function() {
          portfolioBtn.style.animation = 'pulse 2s ease-in-out infinite';
          setTimeout(function() {
            portfolioBtn.style.animation = '';
          }, 2000);
        }, 1000);
      }
      
      // Анимация для кнопки "Обсудить задачу"
      if (discussBtn) {
        discussBtn.addEventListener('mouseenter', function() {
          this.style.filter = 'brightness(1.1)';
        });
        
        discussBtn.addEventListener('mouseleave', function() {
          this.style.filter = '';
        });
      }
      
      // Анимация для кнопки "Связаться"
      if (contactBtn) {
        contactBtn.addEventListener('mouseenter', function() {
          this.style.filter = 'brightness(1.1)';
        });
        
        contactBtn.addEventListener('mouseleave', function() {
          this.style.filter = '';
        });
        
        // Добавляем эффект свечения
        contactBtn.style.boxShadow = '0 4px 15px rgba(155, 123, 255, 0.3)';
      }
    })();

    // Parallax on scroll: move background layer slightly - оптимизированная версия
    var parallaxTicking = false;
    
    function updateParallax() {
      var y = window.scrollY || window.pageYOffset || 0;
      document.body.style.setProperty('--bg-parallax', (y/12) + 'px');
      parallaxTicking = false;
    }
    
    window.addEventListener('scroll', function(){
      if (!parallaxTicking) {
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });

    // Dummy submit for static form
    var form = document.querySelector('.contact-form');
    form?.addEventListener('submit', function(e){
      e.preventDefault();
      alert('Спасибо! Форма-демо на статическом сайте. Подключим отправку в Telegram или на email по вашему выбору.');
    });
    // Prefetch case images on hover to reduce modal wait
    document.querySelectorAll('[data-case]').forEach(function(link){
      link.addEventListener('mouseenter', function(){
        var id = link.getAttribute('data-case');
        var imgs = document.querySelectorAll('#case-'+id+' img');
        imgs.forEach(function(img){
          var src = img.currentSrc || img.src || img.getAttribute('src');
          if(src){
            var l = new Image(); l.src = src;
          }
        });
      }, { passive: true });
    });

    // Theme toggle removed: dark theme only
    (function(){
      try{ localStorage.removeItem('theme'); }catch(e){}
      document.documentElement.setAttribute('data-theme', 'dark');
    })();

    // Focus trap utility for modals
    function trapFocus(modal){
      var focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      focusable = Array.prototype.slice.call(focusable);
      if(!focusable.length) return function(){};
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      function onKey(e){
        if(e.key !== 'Tab') return;
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
      modal.addEventListener('keydown', onKey);
      return function untrap(){ modal.removeEventListener('keydown', onKey); };
    }
    // Simple lightbox for case pages
    var galleryRoot = document.querySelector('[data-gallery]');
    var gallery = Array.from(document.querySelectorAll('[data-gallery] img'));
    if(gallery.length){
      var lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = '<button class="lightbox__close" aria-label="Закрыть">✕</button><button class="lightbox__btn lightbox__prev" aria-label="Предыдущий">‹</button><img class="lightbox__img" alt="Слайд"/><button class="lightbox__btn lightbox__next" aria-label="Следующий">›</button><div class="lightbox__counter"></div>';
      document.body.appendChild(lb);
      var imgEl = lb.querySelector('.lightbox__img');
      var closeBtn = lb.querySelector('.lightbox__close');
      var prevBtn = lb.querySelector('.lightbox__prev');
      var nextBtn = lb.querySelector('.lightbox__next');
      var counter = lb.querySelector('.lightbox__counter');
      var idx = 0;
      function open(i){ idx = i; var src = gallery[idx].getAttribute('data-full') || gallery[idx].src; imgEl.src = src; lb.classList.add('open'); updateCounter(); }
      function close(){ lb.classList.remove('open'); }
      function updateCounter(){ counter.textContent = (idx+1)+' / '+gallery.length; }
      function prev(){ idx = (idx-1+gallery.length)%gallery.length; open(idx); }
      function next(){ idx = (idx+1)%gallery.length; open(idx); }
      gallery.forEach(function(img, i){ img.style.cursor='zoom-in'; img.addEventListener('click', function(){ open(i); }); });
      document.querySelector('[data-open-lightbox]')?.addEventListener('click', function(){ open(0); });
      if(galleryRoot){
        gallery.forEach(function(img, i){ if(i>0){ var f = img.closest('figure'); if(f){ f.classList.add('is-hidden'); } else { img.classList.add('is-hidden'); } } });
        var srNote = document.createElement('p'); srNote.className = 'visually-hidden'; srNote.textContent = 'Галерея: остальные изображения доступны по кнопке "Смотреть слайды" или щелчком по картинке'; galleryRoot.prepend(srNote);
      }
      closeBtn.addEventListener('click', close);
      prevBtn.addEventListener('click', function(){ prev(); });
      nextBtn.addEventListener('click', function(){ next(); });
      lb.addEventListener('click', function(e){ if(e.target === lb){ close(); } });
      document.addEventListener('keydown', function(e){ if(!lb.classList.contains('open')) return; if(e.key==='Escape') close(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });
    }

    // Case modals functionality
    // Внешние стрелки для попапа кейсов
    const caseNavPrev = document.querySelector('.case-nav--prev');
    const caseNavNext = document.querySelector('.case-nav--next');
    let currentCaseModal = null;
    let currentCaseGallery = null;
    let currentCaseFigures = null;
    let currentCaseIndex = 0;

    function updateCaseNavVisibility(show) {
      if (caseNavPrev && caseNavNext) {
        caseNavPrev.style.display = show ? 'flex' : 'none';
        caseNavNext.style.display = show ? 'flex' : 'none';
      }
    }

    function showCaseSlide(idx) {
      if (!currentCaseFigures) return;
      currentCaseFigures.forEach((fig, i) => {
        fig.classList.toggle('active', i === idx);
      });
      const counter = currentCaseGallery?.querySelector('.case-modal-current');
      if (counter) counter.textContent = idx + 1;
      currentCaseIndex = idx;
    }

    if (caseNavPrev && caseNavNext) {
      caseNavPrev.addEventListener('click', function() {
        if (!currentCaseFigures) return;
        let prevIdx = (currentCaseIndex - 1 + currentCaseFigures.length) % currentCaseFigures.length;
        showCaseSlide(prevIdx);
      });
      caseNavNext.addEventListener('click', function() {
        if (!currentCaseFigures) return;
        let nextIdx = (currentCaseIndex + 1) % currentCaseFigures.length;
        showCaseSlide(nextIdx);
      });
    }

    // Модифицируем initCaseModals чтобы стрелки работали вне попапа
    function initCaseModals() {
      const caseLinks = document.querySelectorAll('[data-case]');
      const modals = document.querySelectorAll('.case-modal');
      
      caseLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const caseId = link.dataset.case;
          const modal = document.getElementById(`case-${caseId}`);
          if (modal) {
            openCaseModal(modal);
          }
        });
      });
      
      modals.forEach(modal => {
        const closeBtn = modal.querySelector('.case-modal-close');
        const overlay = modal.querySelector('.case-modal-overlay');
        const prevBtn = modal.querySelector('.case-modal-prev');
        const nextBtn = modal.querySelector('.case-modal-next');
        const figures = modal.querySelectorAll('.case-modal-figure');
        const currentSpan = modal.querySelector('.case-modal-current');
        const totalSpan = modal.querySelector('.case-modal-total');
        
        let currentIndex = 0;
        const totalImages = figures.length;
        
        if (totalSpan) {
          totalSpan.textContent = totalImages;
        }
        
        function showImage(index) {
          figures.forEach((fig, i) => {
            fig.classList.toggle('active', i === index);
          });
          if (currentSpan) {
            currentSpan.textContent = index + 1;
          }
          currentIndex = index;
        }
        
        function nextImage() {
          const nextIndex = (currentIndex + 1) % totalImages;
          showImage(nextIndex);
        }
        
        function prevImage() {
          const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
          showImage(prevIndex);
        }
        
        function closeModal() {
          closeCaseModal(modal);
        }
        
        // Делегирование: ловим клики по крестику и фону на всём модале
        closeBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
          const target = e.target;
          if (target.classList?.contains('case-modal-overlay') || target.closest?.('.case-modal-close')) {
            closeModal();
          }
        });
        // Прячем внутренние стрелки (используем внешние)
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
          if (!modal.classList.contains('is-active')) return;
          switch (e.key) {
            case 'Escape': closeModal(); break;
            case 'ArrowRight': nextImage(); break;
            case 'ArrowLeft': prevImage(); break;
          }
        });
      });
    }
    
    var untrapCase = null;
    function openCaseModal(modal) {
      modal.classList.add('is-active');
      document.body.classList.add('case-modal-open');
      lockBodyScroll();
      // ARIA: prevent background from being read
      document.getElementById('main')?.setAttribute('aria-hidden', 'true');
      // Focus management
      const closeBtn = modal.querySelector('.case-modal-close');
      if (closeBtn) {
        closeBtn.focus();
      }
      untrapCase = trapFocus(modal);
      // Показываем стрелки сразу
      const figures = modal.querySelectorAll('.case-modal-figure');
      currentCaseModal = modal;
      currentCaseGallery = modal.querySelector('.case-modal-gallery');
      currentCaseFigures = Array.from(figures);
      currentCaseIndex = 0;
      showCaseSlide(0);
    }

    function closeCaseModal(modal) {
      modal.classList.remove('is-active');
      document.body.classList.remove('case-modal-open');
      unlockBodyScroll();
      document.getElementById('main')?.removeAttribute('aria-hidden');
      if(typeof untrapCase === 'function'){ try{ untrapCase(); }catch(e){} untrapCase = null; }
      currentCaseModal = null;
      currentCaseGallery = null;
      currentCaseFigures = null;
      currentCaseIndex = 0;
    }
    
    // Initialize case modals
    if (document.querySelector('[data-case]')) {
      initCaseModals();
    }
    
    // Contact modal functionality
    function initContactModal() {
      const contactBtns = Array.from(document.querySelectorAll('[data-open-contact]'));
      let contactModal = document.getElementById('contact-modal');

      // Создаём единый попап, если его нет на странице (включая страницы кейсов)
      if (!contactModal) {
        contactModal = document.createElement('div');
        contactModal.id = 'contact-modal';
        contactModal.className = 'contact-modal';
        contactModal.setAttribute('role', 'dialog');
        contactModal.setAttribute('aria-modal', 'true');
        contactModal.setAttribute('aria-labelledby', 'contact-modal-title');
        contactModal.innerHTML = ''+
          '<div class="contact-modal-overlay"></div>'+
          '<div class="contact-modal-content">'+
            '<button class="contact-modal-close" aria-label="Закрыть">'+
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">'+
                '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
              '</svg>'+
            '</button>'+
            '<div class="contact-modal-header">'+
              '<h2 class="contact-modal-title" id="contact-modal-title">Связаться со мной</h2>'+
              '<p class="contact-modal-subtitle">Выберите удобный способ связи</p>'+
            '</div>'+
            '<div class="contact-modal-links">'+
              '<a href="https://t.me/Loev_design" target="_blank" rel="noopener" class="contact-link" data-analytics="contact_telegram">'+
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">'+
                  '<path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
                '</svg>'+
                '<span>Telegram</span>'+
                '<span class="contact-link-detail">@Loev_design</span>'+
              '</a>'+
              '<a href="tel:+79952247076" class="contact-link" data-analytics="contact_phone">'+
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">'+
                  '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
                '</svg>'+
                '<span>Телефон</span>'+
                '<span class="contact-link-detail">+7 995 224-70-76</span>'+
              '</a>'+
              '<a href="mailto:loevstudio@gmail.com" class="contact-link" data-analytics="contact_email">'+
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">'+
                  '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
                  '<polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
                '</svg>'+
                '<span>Email</span>'+
                '<span class="contact-link-detail">loevstudio@gmail.com</span>'+
              '</a>'+
              '<a href="https://wa.me/79952247076" target="_blank" rel="noopener" class="contact-link" data-analytics="contact_whatsapp">'+
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">'+
                  '<path d="M20 3H4a1 1 0 00-1 1v16l4-4h13a1 1 0 001-1V4a1 1 0 00-1-1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
                '</svg>'+
                '<span>WhatsApp</span>'+
                '<span class="contact-link-detail">+7 995 224-70-76</span>'+
              '</a>'+
            '</div>'+
          '</div>';
        document.body.appendChild(contactModal);
      }

      if (contactBtns.length && contactModal) {
        const closeBtn = contactModal.querySelector('.contact-modal-close');
        const overlay = contactModal.querySelector('.contact-modal-overlay');
        var untrapContact = null;
        
        function openContactModal() {
          contactModal.classList.add('is-active');
          lockBodyScroll();
          document.getElementById('main')?.setAttribute('aria-hidden', 'true');
          
          // Focus management
          if (closeBtn) {
            closeBtn.focus();
          }
          untrapContact = trapFocus(contactModal);
        }
        
        function closeContactModal() {
          contactModal.classList.remove('is-active');
          unlockBodyScroll();
          document.getElementById('main')?.removeAttribute('aria-hidden');
          if(typeof untrapContact === 'function'){ try{ untrapContact(); }catch(e){} untrapContact = null; }
        }
        
        contactBtns.forEach(function(btn){
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            openContactModal();
          });
        });
        
        closeBtn?.addEventListener('click', closeContactModal);
        overlay?.addEventListener('click', closeContactModal);
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
          if (!contactModal.classList.contains('is-active')) return;
          
          if (e.key === 'Escape') {
            closeContactModal();
          }
        });
      }
    }
    
    // Initialize contact modal
    initContactModal();

    // Email compose modal for all mailto buttons/links
    (function initEmailModal(){
      // Build modal once and append to body
      var emailModal = document.getElementById('email-modal');
      if(!emailModal){
        emailModal = document.createElement('div');
        emailModal.id = 'email-modal';
        emailModal.className = 'contact-modal';
        emailModal.setAttribute('aria-hidden','true');
        emailModal.innerHTML = '<div class="contact-modal-overlay"></div>'+
          '<div class="contact-modal-content email-compose">'+
            '<button class="contact-modal-close" aria-label="Закрыть">'+
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">'+
                '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
              '</svg>'+
            '</button>'+
            '<div class="email-header">'+
              '<h2 class="email-title">Написать на email</h2>'+
              '<p class="email-subtitle">Укажите вашу почту и сообщение</p>'+
            '</div>'+
            '<form class="contact-form" id="email-compose-form">'+
              '<div class="email-grid email-grid--2">'+
                '<label class="form-field"><span>Ваша почта</span><input type="email" name="from" required placeholder="you@example.com" /></label>'+
                '<label class="form-field"><span>Способ связи</span><input type="text" name="contact" placeholder="Телефон/Telegram" /></label>'+
              '</div>'+
              '<div class="email-grid">'+
                '<label class="form-field"><span>Сообщение</span><textarea name="message" required rows="5" placeholder="Коротко опишите задачу"></textarea></label>'+
              '</div>'+
              '<div class="actions">'+
                '<button type="submit" class="btn btn--primary">Отправить</button>'+
                '<button type="button" class="btn btn--ghost" data-email-cancel>Отмена</button>'+
                '<span class="status" aria-live="polite"></span>'+
              '</div>'+
            '</form>'+
          '</div>';
        document.body.appendChild(emailModal);
      } else {
        // Upgrade existing modal to new visual/layout if needed
        var content = emailModal.querySelector('.contact-modal-content');
        var needsUpgrade = !content || !content.classList.contains('email-compose') || !emailModal.querySelector('#email-compose-form');
        if(needsUpgrade){
          emailModal.innerHTML = '<div class="contact-modal-overlay"></div>'+
            '<div class="contact-modal-content email-compose">'+
              '<button class="contact-modal-close" aria-label="Закрыть">'+
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">'+
                  '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
                '</svg>'+
              '</button>'+
              '<div class="email-header">'+
                '<h2 class="email-title">Написать на email</h2>'+
                '<p class="email-subtitle">Укажите вашу почту и сообщение</p>'+
              '</div>'+
              '<form class="contact-form" id="email-compose-form">'+
                '<div class="email-grid email-grid--2">'+
                  '<label class="form-field"><span>Ваша почта</span><input type="email" name="from" required placeholder="you@example.com" /></label>'+
                  '<label class="form-field"><span>Способ связи</span><input type="text" name="contact" placeholder="Телефон/Telegram" /></label>'+
                '</div>'+
                '<div class="email-grid">'+
                  '<label class="form-field"><span>Сообщение</span><textarea name="message" required rows="5" placeholder="Коротко опишите задачу"></textarea></label>'+
                '</div>'+
                '<div class="actions">'+
                  '<button type="submit" class="btn btn--primary">Отправить</button>'+
                  '<button type="button" class="btn btn--ghost" data-email-cancel>Отмена</button>'+
                  '<span class="status" aria-live="polite"></span>'+
                '</div>'+
              '</form>'+
            '</div>';
        }
      }

      var emailForm = document.getElementById('email-compose-form');
      var closeBtn = emailModal.querySelector('.contact-modal-close');
      var overlay = emailModal.querySelector('.contact-modal-overlay');
      var cancelBtn = emailModal.querySelector('[data-email-cancel]');
      var untrapEmail = null;

      function openEmailModal(e){
        if(e){ e.preventDefault(); }
        emailModal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
        document.getElementById('main')?.setAttribute('aria-hidden', 'true');
        try{ if(closeBtn) closeBtn.focus(); }catch(_){ }
        untrapEmail = trapFocus(emailModal);
      }

      function closeEmailModal(){
        emailModal.classList.remove('is-active');
        document.body.style.overflow = '';
        document.getElementById('main')?.removeAttribute('aria-hidden');
        if(typeof untrapEmail === 'function'){ try{ untrapEmail(); }catch(_){ } untrapEmail = null; }
      }

      closeBtn?.addEventListener('click', function(e){ e.preventDefault(); closeEmailModal(); });
      overlay?.addEventListener('click', closeEmailModal);
      cancelBtn?.addEventListener('click', closeEmailModal);
      document.addEventListener('keydown', function(e){ if(e.key==='Escape' && emailModal.classList.contains('is-active')) closeEmailModal(); });

      // Intercept all mailto links/buttons
      function bindMailtoInterceptors(){
        document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
          if(a.__emailInterceptBound) return; a.__emailInterceptBound = true;
          a.addEventListener('click', openEmailModal);
        });
        // Глобальное делегирование на случай динамических ссылок/кросс-странично
        if(!document.__emailDelegationBound){
          document.addEventListener('click', function(e){
            var link = e.target && e.target.closest && e.target.closest('a[href^="mailto:"]');
            if(!link) return;
            // Не перехватываем с модификаторами
            if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            openEmailModal(e);
          }, true);
          document.__emailDelegationBound = true;
        }
      }
      bindMailtoInterceptors();

      // Handle form submit via EmailJS with mailto fallback (non-blocking)
      emailForm?.addEventListener('submit', async function(e){
        e.preventDefault();
        var fd = new FormData(emailForm);
        var from = (fd.get('from')||'').toString().trim();
        var contact = (fd.get('contact')||'').toString().trim();
        var msg = (fd.get('message')||'').toString().trim();
        if(!from || !msg){ return; }
        var to = 'loevstudio@gmail.com';
        var subject = 'Запрос с сайта Loevdesign.ru';
        // Fast visual feedback
        emailForm.classList.add('is-loading');
        // Initialize EmailJS once (cached flag)
        try{
          if(window.emailjs && window.EMAILJS_PUBLIC_KEY && !window.__emailjsInited){
            emailjs.init(window.EMAILJS_PUBLIC_KEY);
            window.__emailjsInited = true;
          }
        }catch(_){}
        // Try EmailJS with timeout race; fallback to mailto quickly
        var sent = false;
        var timedOut = false;
        var timeoutId = setTimeout(function(){ timedOut = true; }, 1200);
        try{
          if(window.emailjs && window.EMAILJS_SERVICE_ID && window.EMAILJS_TEMPLATE_ID){
            await emailjs.send(window.EMAILJS_SERVICE_ID, window.EMAILJS_TEMPLATE_ID, {
              from_email: from,
              contact: contact,
              message: msg,
              to_email: to,
              subject: subject
            });
            sent = true;
          }
        }catch(_){ sent = false }
        clearTimeout(timeoutId);
        if(!sent){
          var body = encodeURIComponent(msg + '\n\nОт: ' + from + (contact? ('\nКонтакты: ' + contact) : ''));
          var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + body;
          // Do not block; fire-and-close
          try{ window.location.href = href; }catch(_){}
        }
        try{ if(window.ym){ ym(104072618, 'reachGoal', 'contact_click_email_form'); } }catch(_){ }
        // Close quickly and reset UI
        setTimeout(function(){ emailForm.classList.remove('is-loading'); closeEmailModal(); }, 150);
      });
    })();

    // Case gallery lightbox functionality
    function initCaseGallery() {
      const caseItems = document.querySelectorAll('[data-case-gallery]');
      if (!caseItems.length) return;

      // Create lightbox HTML
      const lightbox = document.createElement('div');
      lightbox.className = 'case-lightbox';
      lightbox.innerHTML = `
        <div class="case-lightbox-overlay"></div>
        <div class="case-lightbox-content">
          <button class="case-lightbox-close" aria-label="Закрыть">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <img class="case-lightbox-image" src="" alt="" />
          <div class="case-lightbox-nav">
            <button class="case-lightbox-prev" aria-label="Предыдущее изображение">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="case-lightbox-next" aria-label="Следующее изображение">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="case-lightbox-counter"></div>
        </div>
      `;
      
      document.body.appendChild(lightbox);

      let currentIndex = 0;
      const images = Array.from(caseItems).map(item => item.querySelector('img'));

      function showImage(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        
        currentIndex = index;
        const img = images[currentIndex];
        const lightboxImg = lightbox.querySelector('.case-lightbox-image');
        const counter = lightbox.querySelector('.case-lightbox-counter');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
        
        lightbox.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      }

      function hideLightbox() {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = '';
      }

      function nextImage() {
        showImage(currentIndex + 1);
      }

      function prevImage() {
        showImage(currentIndex - 1);
      }

      // Event listeners
      caseItems.forEach((item, index) => {
        item.addEventListener('click', () => showImage(index));
      });

      lightbox.querySelector('.case-lightbox-overlay').addEventListener('click', hideLightbox);
      lightbox.querySelector('.case-lightbox-close').addEventListener('click', hideLightbox);
      lightbox.querySelector('.case-lightbox-next').addEventListener('click', nextImage);
      lightbox.querySelector('.case-lightbox-prev').addEventListener('click', prevImage);

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-active')) return;
        
        switch(e.key) {
          case 'Escape':
            hideLightbox();
            break;
          case 'ArrowRight':
            nextImage();
            break;
          case 'ArrowLeft':
            prevImage();
            break;
        }
      });
    }

    // Initialize case gallery after partials are loaded
    if (document.querySelector('[data-include-header]') || document.querySelector('[data-include-footer]')) {
      // Wait for partials to load, then initialize gallery
      window.addEventListener('DOMContentLoaded', function() {
        setTimeout(initCaseGallery, 100);
      });
    } else {
      // No partials, initialize immediately
      initCaseGallery();
    }

    // Оптимизированный глобальный параллакс
    var bgParallaxTicking = false;
    var lastScrollY = 0;
    var isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    function updateBgParallax() {
      if (isReducedMotion) return;
      
      const y = window.scrollY || window.pageYOffset;
      const deltaY = y - lastScrollY;
      
      // Более плавный параллакс эффект с ограничениями
      const shift = Math.min(20, y/30);
      const tilt = Math.min(8, Math.abs(deltaY)/3);
      
      document.documentElement.style.setProperty('--bg-parallax-x', shift+'px');
      document.documentElement.style.setProperty('--bg-parallax-y', (y/60)+'px');
      document.documentElement.style.setProperty('--bg-tilt', tilt+'deg');
      
      lastScrollY = y;
      bgParallaxTicking = false;
    }
    
    // Добавляем throttling для лучшей производительности
    var throttleTimer = null;
    window.addEventListener('scroll', function() {
      if (!bgParallaxTicking && !throttleTimer) {
        throttleTimer = setTimeout(function() {
          requestAnimationFrame(updateBgParallax);
          bgParallaxTicking = true;
          throttleTimer = null;
        }, 16); // ~60fps
      }
    }, { passive: true });
    
    // Оптимизация для мобильных устройств
    if (window.innerWidth <= 768) {
      // Упрощаем анимации на мобильных
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }

    // Добавляем плавные переходы при смене темы
    function addThemeTransition() {
      const style = document.createElement('style');
      style.textContent = `
        body, .card, .pair-figure, .section--alt {
          transition: background 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease;
        }
        :root {
          transition: --bg 0.6s ease, --text 0.6s ease, --muted 0.6s ease, --line 0.6s ease, --card 0.6s ease;
        }
      `;
      document.head.appendChild(style);
    }
    
    addThemeTransition();

    // Интерактивные плавающие плашки в hero
    (function(){
      const floatingCards = document.querySelectorAll('.floating-cards .card');
      if (!floatingCards.length) return;

      // Добавляем класс для интерактивности
      floatingCards.forEach(card => {
        card.classList.add('interactive');
        // Добавляем data-атрибут для отладки
        card.setAttribute('data-interactive', 'true');
      });

      console.log('Инициализировано интерактивных карточек:', floatingCards.length);

      // Переменные для drag & drop
      let isDragging = false;
      let currentCard = null;
      let startX = 0;
      let startY = 0;
      let initialX = 0;
      let initialY = 0;
      let currentX = 0;
      let currentY = 0;

      // Функция для получения позиции карточки
      function getCardPosition(card) {
        const rect = card.getBoundingClientRect();
        const container = card.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        return {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top
        };
      }

      // Функция для установки позиции карточки
      function setCardPosition(card, x, y) {
        // Карточка уже имеет position: absolute, просто меняем координаты
        card.style.left = x + 'px';
        card.style.top = y + 'px';
        card.style.transform = 'none';
        card.style.animation = 'none !important';
        card.style.animationPlayState = 'paused !important';
        card.classList.add('dragging');
      }

      // Функция для возврата к анимации
      function resetCardAnimation(card) {
        console.log('Возврат к анимации для карточки:', card);
        
        // Убираем инлайн стили позиционирования
        card.style.left = '';
        card.style.top = '';
        card.style.transform = '';
        card.style.animation = '';
        card.style.animationPlayState = '';
        card.classList.remove('dragging');
        
        // Принудительно перезапускаем анимацию
        card.offsetHeight; // Принудительный reflow
        
        // Проверяем, что анимация запустилась
        setTimeout(() => {
          const computedStyle = window.getComputedStyle(card);
          console.log('Анимация карточки:', {
            animationName: computedStyle.animationName,
            animationPlayState: computedStyle.animationPlayState,
            animationDuration: computedStyle.animationDuration
          });
        }, 100);
      }

      // Обработчики событий для каждой карточки
      floatingCards.forEach(card => {
        // Mouse events - только mousedown на карточке
        card.addEventListener('mousedown', function(e) {
          console.log('Mouse down на карточке:', e.target);
          startDrag(e);
        });
        card.addEventListener('touchstart', function(e) {
          console.log('Touch start на карточке:', e.target);
          startDrag(e);
        }, { passive: false });

        // Hover эффекты
        card.addEventListener('mouseenter', function() {
          if (!isDragging) {
            this.style.animationPlayState = 'paused';
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.zIndex = '10';
          }
        });

        card.addEventListener('mouseleave', function() {
          if (!isDragging) {
            this.style.animationPlayState = 'running';
            this.style.transform = '';
            this.style.zIndex = '';
          }
        });
      });

      // Глобальные обработчики для drag & drop
      document.addEventListener('mousemove', function(e) {
        if (isDragging) {
          drag(e);
        }
      });
      document.addEventListener('mouseup', function(e) {
        if (isDragging) {
          endDrag(e);
        }
      });
      document.addEventListener('touchmove', function(e) {
        if (isDragging) {
          drag(e);
        }
      }, { passive: false });
      document.addEventListener('touchend', function(e) {
        if (isDragging) {
          endDrag(e);
        }
      });

      function startDrag(e) {
        e.preventDefault();
        
        // Находим ближайшую карточку
        currentCard = e.target.closest('.floating-cards .card');
        if (!currentCard) {
          console.log('Карточка не найдена для', e.target);
          return;
        }
        
        // Добавляем класс interactive если его нет
        if (!currentCard.classList.contains('interactive')) {
          currentCard.classList.add('interactive');
        }
        
        console.log('Начало перетаскивания карточки:', currentCard);
        isDragging = true;
        
        // Получаем начальные координаты
        if (e.type === 'touchstart') {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        } else {
          startX = e.clientX;
          startY = e.clientY;
        }

        // Получаем текущую позицию карточки
        const pos = getCardPosition(currentCard);
        initialX = pos.x;
        initialY = pos.y;

        // Останавливаем анимацию и добавляем класс dragging
        currentCard.style.animationPlayState = 'paused';
        currentCard.classList.add('dragging');
        
        // Устанавливаем абсолютное позиционирование
        setCardPosition(currentCard, initialX, initialY);
      }

      function drag(e) {
        if (!isDragging || !currentCard) return;
        
        e.preventDefault();
        console.log('Drag event triggered', { 
          isDragging, 
          currentCard: !!currentCard,
          clientX: e.clientX || e.touches?.[0]?.clientX,
          clientY: e.clientY || e.touches?.[0]?.clientY
        });

        // Получаем текущие координаты
        let clientX, clientY;
        if (e.type === 'touchmove') {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        // Вычисляем смещение
        currentX = initialX + (clientX - startX);
        currentY = initialY + (clientY - startY);

        console.log('Координаты перетаскивания:', {
          clientX, clientY,
          startX, startY,
          initialX, initialY,
          currentX, currentY
        });

        // Ограничиваем перемещение в пределах контейнера
        const container = currentCard.parentElement;
        const containerRect = container.getBoundingClientRect();
        const cardRect = currentCard.getBoundingClientRect();
        
        const maxX = containerRect.width - cardRect.width;
        const maxY = containerRect.height - cardRect.height;
        
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));

        console.log('Ограниченные координаты:', { currentX, currentY, maxX, maxY });

        // Применяем новую позицию
        setCardPosition(currentCard, currentX, currentY);
      }

      function endDrag(e) {
        if (!isDragging || !currentCard) return;
        
        console.log('Завершение перетаскивания');
        isDragging = false;
        currentCard.classList.remove('dragging');
        
        // Возвращаем анимацию сразу, без задержки
        resetCardAnimation(currentCard);
        
        currentCard = null;
      }

      // Двойной клик для сброса позиции
      floatingCards.forEach(card => {
        card.addEventListener('dblclick', function() {
          resetCardAnimation(this);
        });
      });

      // Добавляем индикатор интерактивности и стили для принудительной анимации
      const style = document.createElement('style');
      style.textContent = `
        .floating-cards .card.interactive::after {
          content: '🖱️';
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .floating-cards .card.interactive:hover::after {
          opacity: 1;
        }
        
        .floating-cards .card.dragging::after {
          content: '✋';
          opacity: 1;
        }
        
        .floating-cards .card.force-animation {
          animation: floatCards 15s ease-in-out infinite !important;
          animation-play-state: running !important;
        }
        
        /* Принудительная анимация для всех карточек */
        .floating-cards .c1:not(.dragging) {
          animation: floatCards1 12s ease-in-out infinite !important;
          animation-play-state: running !important;
        }
        .floating-cards .c2:not(.dragging) {
          animation: floatCards2 15s ease-in-out infinite !important;
          animation-play-state: running !important;
        }
        .floating-cards .c3:not(.dragging) {
          animation: floatCards3 10s ease-in-out infinite !important;
          animation-play-state: running !important;
        }
        .floating-cards .c4:not(.dragging) {
          animation: floatCards4 13s ease-in-out infinite !important;
          animation-play-state: running !important;
        }
      `;
      document.head.appendChild(style);
      
      // Периодическая проверка и восстановление анимации
      setInterval(function() {
        floatingCards.forEach(card => {
          if (!card.classList.contains('dragging')) {
            const computedStyle = window.getComputedStyle(card);
            if (computedStyle.animationPlayState === 'paused' || 
                computedStyle.animationName === 'none') {
              console.log('Восстанавливаем анимацию для карточки');
              resetCardAnimation(card);
              
              // Принудительно применяем правильную анимацию
              if (card.classList.contains('c1')) {
                card.style.animation = 'floatCards1 12s ease-in-out infinite';
              } else if (card.classList.contains('c2')) {
                card.style.animation = 'floatCards2 15s ease-in-out infinite';
              } else if (card.classList.contains('c3')) {
                card.style.animation = 'floatCards3 10s ease-in-out infinite';
              } else if (card.classList.contains('c4')) {
                card.style.animation = 'floatCards4 13s ease-in-out infinite';
              }
              card.style.animationPlayState = 'running';
            }
          }
        });
      }, 2000); // Проверяем каждые 2 секунды
    })();

    // Экспериментальный фон на Canvas: созвездия и "орбы"
    // remove experimental canvas background

    // Добавляем reveal-анимации для всех ключевых элементов ниже кейсов
    var revealSelectors = [
      '.value-item', '.skills-column', '.tools-column', '.feature-card', '.stat-item', '.tool-item', '.contact-link', '.work-strip .value-item', '.about-list li', '.about-stats .stat-card', '.section-title', '.section-lead', '.contact-form', '.footer-inner'
    ];
    revealSelectors.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    });

    // Добавляем плавные hover-эффекты для карточек и иконок
    var hoverSelectors = [
      '.value-item', '.feature-card', '.stat-item', '.tool-item', '.contact-link', '.work-strip .value-item', '.about-list li', '.about-stats .stat-card', '.footer-right a', '.footer-cta', '.about-card-gradient'
    ];
    hoverSelectors.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        // Убираем JS-ховер для ссылок контактов — чистый CSS
        if (el.matches && el.matches('.contact-link')) return;
        el.addEventListener('mouseenter', function(){ this.style.transform = 'translateY(-4px)'; this.style.boxShadow = '0 8px 20px rgba(155,123,255,0.08), 0 2px 8px rgba(106,75,217,0.06)'; });
        el.addEventListener('mouseleave', function(){ this.style.transform = ''; this.style.boxShadow = ''; });
      });
    });
    // Для иконок внутри value-item, feature-card, tool-item
    document.querySelectorAll('.value-ico, .feature-icon, .tool-item svg').forEach(function(ico){
      ico.addEventListener('mouseenter', function(){
        this.style.transform = 'scale(1.1)';
        this.style.color = '#9b7bff';
      });
      ico.addEventListener('mouseleave', function(){
        this.style.transform = '';
        this.style.color = '';
      });
    });
    // Для списков — fade-in и translateY
    document.querySelectorAll('.about-list li, .skills-list li').forEach(function(li){
      li.classList.add('reveal');
      revealObserver.observe(li);
    });
    // Для футера — fade-in и hover-underline
    document.querySelectorAll('.footer-inner').forEach(function(footer){
      footer.classList.add('reveal');
      revealObserver.observe(footer);
    });
    document.querySelectorAll('.footer-right a').forEach(function(a){
      a.addEventListener('mouseenter', function(){
        this.style.textDecoration = 'underline';
        this.style.opacity = '0.92';
      });
      a.addEventListener('mouseleave', function(){
        this.style.textDecoration = '';
        this.style.opacity = '';
      });
    });

    // Lead form -> Bitrix24 webhook
    (function(){
      var form = document.getElementById('lead-form');
      if(!form) return;
      var status = document.getElementById('lead-status');
      var webhook = window.B24_WEBHOOK_URL || '';

      function getUTM(){
        var p = new URLSearchParams(location.search);
        return {
          utm_source: p.get('utm_source')||'',
          utm_medium: p.get('utm_medium')||'',
          utm_campaign: p.get('utm_campaign')||'',
          utm_term: p.get('utm_term')||'',
          utm_content: p.get('utm_content')||''
        };
      }

      form.addEventListener('submit', function(e){
        e.preventDefault();
        var fd = new FormData(form);
        var data = {
          name: (fd.get('name')||'').toString().trim(),
          phone: (fd.get('phone')||'').toString().trim(),
          email: (fd.get('email')||'').toString().trim(),
          message: (fd.get('message')||'').toString().trim(),
          budget: (fd.get('budget')||'').toString().trim()
        };
        if(!data.phone && !data.email){
          status.textContent = 'Укажите телефон или email';
          return;
        }
        status.textContent = 'Отправка...';

        var payload = {
          fields: {
            TITLE: 'Заявка с сайта Loevdesign.ru',
            NAME: data.name,
            PHONE: data.phone ? [{VALUE:data.phone, VALUE_TYPE:'WORK'}] : [],
            EMAIL: data.email ? [{VALUE:data.email, VALUE_TYPE:'WORK'}] : [],
            COMMENTS: data.message,
            OPPORTUNITY: data.budget ? Number(data.budget) : null,
            CURRENCY_ID: 'RUB',
            SOURCE_ID: 'WEB',
            PAGE_URL: location.href,
            ...getUTM()
          }
        };

        // Yandex Metrika goal
        try{ if(window.ym){ ym(104072618, 'reachGoal', 'lead_submit'); } }catch(_){ }

        if(!webhook){
          status.textContent = 'Webhook не настроен';
          return;
        }

        fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function(r){ return r.json(); })
        .then(function(json){
          if(json && (json.result || json.result === true)){
            status.textContent = 'Отправлено! Свяжусь с вами.';
            form.reset();
          } else {
            status.textContent = 'Ошибка отправки';
          }
        })
        .catch(function(){ status.textContent = 'Ошибка сети'; });
      });

      // Analytics for contact links inside modal
      document.querySelectorAll('.contact-modal [data-analytics]').forEach(function(el){
        el.addEventListener('click', function(){
          var ev = el.getAttribute('data-analytics');
          try{ if(window.ym){ ym(104072618, 'reachGoal', ev); } }catch(_){ }
        }, { passive:true });
      });
    })();

    
    // Reviews Slider
    (function(){
      var slider = document.querySelector('.reviews-slider');
      if (!slider) return;
      
      var slides = slider.querySelectorAll('.reviews-slider__slide');
      var dots = slider.querySelectorAll('.reviews-slider__dot');
      var prevBtn = slider.querySelector('.reviews-slider__btn--prev');
      var nextBtn = slider.querySelector('.reviews-slider__btn--next');
      var currentSpan = slider.querySelector('.reviews-slider__current');
      var totalSpan = slider.querySelector('.reviews-slider__total');
      
      var currentSlide = 0;
      var totalSlides = slides.length;
      var autoSlideInterval;
      var autoSlideDelay = 4000; // 4 секунды
      
      if (totalSlides === 0) return;
      
      // Update total count
      if (totalSpan) totalSpan.textContent = totalSlides;
      
      function showSlide(index) {
        // Remove active class from all slides
        slides.forEach(function(slide) { slide.classList.remove('active'); });
        
        // Add active class to current slide
        if (slides[index]) slides[index].classList.add('active');
        
        // Update counter
        if (currentSpan) currentSpan.textContent = index + 1;
        
        // Update button states
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === totalSlides - 1;
        
        currentSlide = index;
      }
      
      function nextSlide() {
        if (currentSlide < totalSlides - 1) {
          showSlide(currentSlide + 1);
        } else {
          showSlide(0); // Переход к первому слайду
        }
      }
      
      function prevSlide() {
        if (currentSlide > 0) {
          showSlide(currentSlide - 1);
        } else {
          showSlide(totalSlides - 1); // Переход к последнему слайду
        }
      }
      
      function startAutoSlide() {
        autoSlideInterval = setInterval(function() {
          nextSlide();
        }, autoSlideDelay);
      }
      
      function stopAutoSlide() {
        if (autoSlideInterval) {
          clearInterval(autoSlideInterval);
          autoSlideInterval = null;
        }
      }
      
      // Event listeners
      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          stopAutoSlide();
          nextSlide();
          startAutoSlide();
        });
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          stopAutoSlide();
          prevSlide();
          startAutoSlide();
        });
      }
      
      // Keyboard navigation
      slider.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          stopAutoSlide();
          prevSlide();
          startAutoSlide();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          stopAutoSlide();
          nextSlide();
          startAutoSlide();
        }
      });
      
      // Touch/swipe support
      var startX = 0;
      var startY = 0;
      var endX = 0;
      var endY = 0;
      var minSwipeDistance = 50;
      
      slider.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });
      
      slider.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        
        var deltaX = endX - startX;
        var deltaY = endY - startY;
        
        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
          stopAutoSlide();
          if (deltaX > 0) {
            prevSlide(); // Swipe right
          } else {
            nextSlide(); // Swipe left
          }
          startAutoSlide();
        }
      }, { passive: true });
      
      // Initialize
      showSlide(0);
      startAutoSlide();
      
      // Pause auto-slide when hovering over slider
      slider.addEventListener('mouseenter', stopAutoSlide);
      slider.addEventListener('mouseleave', startAutoSlide);
    })();
    
    // Services showcase animation
    (function(){
      const showcaseImages = document.querySelectorAll('.showcase-image');
      const contentSections = document.querySelectorAll('.content-section');
      const categories = ['branding', 'web', 'ads', 'package', 'print', 'social'];
      
      let currentImageIndex = 0;
      let currentContentIndex = 0;
      
      function switchImage(index) {
        // Remove active class from all images
        showcaseImages.forEach(img => img.classList.remove('active'));
        
        // Add active class to current image
        if (showcaseImages[index]) showcaseImages[index].classList.add('active');
      }
      
      function switchContent(index) {
        // Remove active class from all content sections
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Add active class to current content section
        if (contentSections[index]) contentSections[index].classList.add('active');
      }
      
      function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % showcaseImages.length;
        switchImage(currentImageIndex);
      }
      
      function nextContent() {
        currentContentIndex = (currentContentIndex + 1) % categories.length;
        switchContent(currentContentIndex);
      }
      
      // Start the animations
      if (showcaseImages.length > 0) {
        setInterval(nextImage, 1000); // Images switch every 1 second
        setInterval(nextContent, 5000); // Content switches every 5 seconds
      }
    })();
    
    // Showcase (простая версия): 1s — смена изображения, 10s — смена подписи
    (function(){
      var gallery = document.getElementById('showcase-gallery-slider');
      var dataImgs = document.getElementById('showcase-gallery-data');
      var dataTexts = document.getElementById('showcase-text-data');
      if (!gallery || !dataImgs || !dataTexts) return;
      var imgEl = gallery.querySelector('.showcase-gallery__img');
      var captionEl = document.getElementById('showcase-caption');
      var slides = Array.from(dataImgs.children).map(function(el){ return el.getAttribute('data-img'); });
      var texts = Array.from(dataTexts.children).map(function(el){ return el.getAttribute('data-text'); });
      if (!slides.length) return;
      var imgIdx = 0;
      var textIdx = 0;
      function showImage(i){ imgEl.src = slides[i]; }
      function showText(i){ if(captionEl) captionEl.textContent = texts[i % texts.length]; }
      // init
      showImage(imgIdx);
      showText(textIdx);
      // timers
      setInterval(function(){ imgIdx = (imgIdx + 1) % slides.length; showImage(imgIdx); }, 1000);
      setInterval(function(){ textIdx = (textIdx + 1) % texts.length; showText(textIdx); }, 10000);
    })();
    
    // Интерактивная временная шкала "Мой подход"
    (function(){
      const timelineSteps = document.querySelectorAll('.timeline-step');
      let currentStep = 0;
      
      function activateStep(stepIndex) {
        // Убираем активный класс со всех шагов
        timelineSteps.forEach(step => step.classList.remove('active'));
        
        // Добавляем активный класс к текущему шагу
        if (timelineSteps[stepIndex]) {
          timelineSteps[stepIndex].classList.add('active');
        }
      }
      
      function nextStep() {
        currentStep = (currentStep + 1) % timelineSteps.length;
        activateStep(currentStep);
      }
      
      // Добавляем обработчики кликов
      timelineSteps.forEach((step, index) => {
        step.addEventListener('click', () => {
          currentStep = index;
          activateStep(currentStep);
        });
      });
      
      // Автоматическая смена шагов каждые 3 секунды
      if (timelineSteps.length > 0) {
        setInterval(nextStep, 3000);
      }
    })();

    // Service Details Modal
    const serviceModal = document.getElementById('service-modal');
    // Titles removed per design simplification
    const serviceModalTitle = null;
    const serviceModalSubtitle = null;
    const serviceModalBody = document.getElementById('service-modal-body');
    const serviceModalBanner = document.getElementById('service-modal-banner');

    // Service data
    const serviceData = {
      branding: {
        __contentVersion: 3,
        title: 'Брендинг и айдентика',
        subtitle: 'Создание уникального образа вашего бренда',
        banner: './For site/03_cases/Covers uslugi/Брендинг.png',
        // Fallback legacy content (not used in redesigned flow)
        content: `
          <div class="service-pricing-grid">
            <div class="service-pricing-item">
              <div class="service-pricing-price">15 000 ₽</div>
              <div class="service-pricing-desc">Базовый пакет</div>
            </div>
            <div class="service-pricing-item">
              <div class="service-pricing-price">25 000 ₽</div>
              <div class="service-pricing-desc">Расширенный пакет</div>
            </div>
            <div class="service-pricing-item">
              <div class="service-pricing-price">40 000 ₽</div>
              <div class="service-pricing-desc">Полный пакет</div>
            </div>
          </div>
        `,
        __cachedHtml: '',
        __cachedVersion: 0,
        __bannerPreloaded: false,
        pricing: [
          { price: '15 000 ₽', desc: 'Базовый пакет' },
          { price: '25 000 ₽', desc: 'Расширенный пакет' },
          { price: '40 000 ₽', desc: 'Полный пакет' }
        ],
        tiles: [
          { title: 'Логотип', desc: '3–5 концепций + доработка выбранного варианта' },
          { title: 'Цветовая палитра', desc: 'Основные и дополнительные цвета, варианты на тёмном/светлом' },
          { title: 'Типографика', desc: 'Подбор шрифтов и иерархия заголовков/текста' },
          { title: 'Базовые элементы', desc: 'Паттерны, иконки, модули для соцсетей/презентаций' },
          { title: 'Гайдлайн', desc: 'Правила использования логотипа, цветовые и типографические нормы' },
          { title: 'Файлы', desc: 'Пакет исходников для печати и веба (SVG, PNG, PDF)' }
        ],
        note: 'Сроки: 5–10 дней. Правки: до 2 итераций на этап.'
      },
      'web-design': {
        __contentVersion: 3,
        title: 'Веб‑дизайн и лендинги',
        subtitle: 'Прототипы, визуал, адаптив, подготовка к разработке',
        banner: './For site/03_cases/Covers uslugi/Веб дизайн.png',
        content: '',
        pricing: [
          { price: '25 000 ₽', desc: 'Лендинг' },
          { price: '40 000 ₽', desc: 'Сайт 3–5 стр.' },
          { price: '65 000 ₽', desc: 'Корпоративный' }
        ],
        __cachedHtml: '',
        __cachedVersion: 0,
        tiles: [
          { title: 'Прототипирование', desc: 'Сценарии, карты экранов, низко/средне‑фид прототипы' },
          { title: 'Дизайн экранов', desc: 'Чистые макеты для ключевых страниц' },
          { title: 'Адаптивы', desc: 'Десктоп / планшет / мобильный' },
          { title: 'Дизайн‑система', desc: 'Компоненты, состояния, токены' },
          { title: 'Хэнд‑офф', desc: 'Подготовка к разработке (спеки, экспорты)' },
          { title: 'Файлы', desc: 'Исходники и экспорт для веба' }
        ],
        note: 'Сроки: 7–14 дней (зависит от объёма). Правки: 2–3 итерации.'
      },
      packaging: {
        __contentVersion: 3,
        title: 'Упаковка',
        subtitle: 'Концепции, прототипы, макеты и подготовка к печати',
        banner: './For site/03_cases/Covers uslugi/Дизайн упаковки.png',
        content: '',
        pricing: [
          { price: '20 000 ₽', desc: 'Базовый' },
          { price: '35 000 ₽', desc: 'Расширенный' }
        ],
        __cachedHtml: '',
        __cachedVersion: 0,
        tiles: [
          { title: 'Концепции', desc: '2–3 направления визуальных решений' },
          { title: 'Макеты', desc: 'Развёртки и 3D‑мокапы упаковки' },
          { title: 'Материалы', desc: 'Спецификации, вырубки, фальцовка' },
          { title: 'Типография', desc: 'Подготовка файлов под печать' },
          { title: 'Гайдлайн', desc: 'Правила применения оформления' },
          { title: 'Исходники', desc: 'Печать и веб (PDF, AI, PNG)' }
        ],
        note: 'Сроки: 7–12 дней. Правки: до 2 итераций на ключевые макеты.'
      },
      'ux-design': {
        __contentVersion: 3,
        title: 'UI/UX дизайн',
        subtitle: 'Сценарии, дизайн‑система, компоненты и хэнд‑офф',
        banner: './For site/03_cases/Covers uslugi/UX дизайн.png',
        content: '',
        pricing: [
          { price: '30 000 ₽', desc: 'MVP' },
          { price: '55 000 ₽', desc: 'Приложение' }
        ],
        __cachedHtml: '',
        __cachedVersion: 0,
        tiles: [
          { title: 'Исследование', desc: 'Цели, аудитория, конкуренты, CJM' },
          { title: 'Потоки', desc: 'Сценарии и пользовательские маршруты' },
          { title: 'Прототипы', desc: 'Низко/средне‑фид, интерактив' },
          { title: 'Дизайн‑система', desc: 'Компоненты, состояния, гайды' },
          { title: 'Тестирование', desc: 'UX‑проверки, итерации' },
          { title: 'Хэнд‑офф', desc: 'Спеки, экспорты, взаимодействие с dev' }
        ],
        note: 'Сроки: 10–20 дней (MVP/приложение). Правки: до 3 итераций.'
      },
      'print-design': {
        __contentVersion: 3,
        title: 'Печатная графика',
        subtitle: 'Макеты, подготовка к печати и адаптации',
        banner: './For site/03_cases/Covers uslugi/Печатная продукция.png',
        content: '',
        pricing: [
          { price: '10 000 ₽', desc: 'Базовый' },
          { price: '18 000 ₽', desc: 'Пакет' }
        ],
        __cachedHtml: '',
        __cachedVersion: 0,
        tiles: [
          { title: 'Макеты', desc: 'Постеры, каталоги, листовки' },
          { title: 'Форматы', desc: 'Вылеты, поля, сетки' },
          { title: 'Цвет', desc: 'CMYK/Spot, ICC‑профили' },
          { title: 'Типография', desc: 'Подготовка файлов к печати' },
          { title: 'Адаптации', desc: 'Размеры и носители' },
          { title: 'Исходники', desc: 'PDF для печати + веб‑версии' }
        ],
        note: 'Сроки: 2–5 дней. Правки: до 2 итераций на макет.'
      },
      'design-support': {
        __contentVersion: 3,
        title: 'Дизайн‑поддержка',
        subtitle: 'Регулярные материалы под ваши каналы',
        banner: './For site/03_cases/Covers uslugi/Дизайн поддержка.png',
        content: '',
        pricing: [
          { price: '8 000 ₽/мес', desc: 'Старт' },
          { price: '15 000 ₽/мес', desc: 'Стандарт' },
          { price: '25 000 ₽/мес', desc: 'Премиум' }
        ],
        __cachedHtml: '',
        __cachedVersion: 0,
        tiles: [
          { title: 'Задачи месяца', desc: 'Регулярные материалы под ваши каналы' },
          { title: 'Адаптации', desc: 'Правки и версии под разные форматы' },
          { title: 'Соцсети', desc: 'Посты, сторис, обложки' },
          { title: 'Баннеры', desc: 'Веб‑рекламные форматы' },
          { title: 'Приоритет', desc: 'Быстрый отклик и поддержка' },
          { title: 'Отчётность', desc: 'Итоги месяца и планы' }
        ],
        note: 'Сроки: 1–3 дня на задачу. Правки: до 3 итераций в рамках месяца.'
      }
    };

    // Open service modal
    function openServiceModal(serviceType) {
      const service = serviceData[serviceType];
      if (!service || !serviceModal) return;

      // Ensure containers exist (banner + body)
      const modalContent = serviceModal.querySelector('.service-modal-content');
      if (!modalContent) return;

      // Find or create banner container
      let bannerEl = modalContent.querySelector('#service-modal-banner');
      if (!bannerEl) {
        bannerEl = document.createElement('div');
        bannerEl.className = 'service-modal-banner';
        bannerEl.id = 'service-modal-banner';
        const closeBtnTop = modalContent.querySelector('.service-modal-close');
        if (closeBtnTop && closeBtnTop.parentNode === modalContent) {
          closeBtnTop.insertAdjacentElement('afterend', bannerEl);
        } else {
          modalContent.insertBefore(bannerEl, modalContent.firstChild);
        }
      }

      // Find or create body container
      let bodyEl = modalContent.querySelector('#service-modal-body');
      if (!bodyEl) {
        bodyEl = document.createElement('div');
        bodyEl.className = 'service-modal-body';
        bodyEl.id = 'service-modal-body';
        const actions = modalContent.querySelector('.service-modal-actions');
        if (actions) {
          modalContent.insertBefore(bodyEl, actions);
        } else {
          modalContent.appendChild(bodyEl);
        }
      }

      // Build content: pricing + tiles (if provided), else fallback
      // Always rebuild to avoid stale cached HTML for tiled services
      if (Array.isArray(service.tiles)) {
        service.__cachedHtml = '';
        service.__cachedVersion = 0;
      }

      if (!service.__cachedHtml || service.__cachedVersion !== service.__contentVersion) {
        var tilesHtml = '';
        if (Array.isArray(service.tiles)) {
          tilesHtml = (service.tiles||[]).map(function(t){
            return '<div class="service-pricing-item service-tile">'+
                     '<div class="service-tile-title">'+(t.title||'')+'</div>'+
                     '<div class="service-tile-desc">'+(t.desc||'')+'</div>'+
                   '</div>';
          }).join('');
        }

        var noteHtml = '';
        if (service.note) {
          // Выделяем слово "Сроки" в note
          var formattedNote = service.note.replace(/Сроки:/g, '<strong>Сроки:</strong>');
          noteHtml = '<div class="service-meta-note">'+
            '<strong>Стоимость:</strong> обсуждается по проекту, формирую прозрачную смету после брифа.<br/><br/>' + formattedNote +
          '</div>';
        } else {
          noteHtml = '<div class="service-meta-note"><strong>Стоимость:</strong> обсуждается по проекту, формирую прозрачную смету после брифа.</div>';
        }

        service.__cachedHtml = ''+
          (tilesHtml ? '<div class="service-tiles-grid">'+ tilesHtml +'</div>' : (service.content || ''))+
          noteHtml;
        service.__cachedVersion = service.__contentVersion || 1;
      }

      if (bodyEl.innerHTML !== service.__cachedHtml) {
        bodyEl.innerHTML = service.__cachedHtml;
        try { bodyEl.style.whiteSpace = 'normal'; } catch(_) {}
      }

      // Set banner image with fallbacks for all services
      if (service.banner) {
        var bannerUrl = (function(u){ try{ return encodeURI(u); }catch(e){ return u; } })(service.banner);

        var nameMap = {
          'branding': 'Брендинг.png',
          'web-design': 'Веб дизайн.png',
          'packaging': 'Дизайн упаковки.png',
          'ux-design': 'UX дизайн.png',
          'print-design': 'Печатная продукция.png',
          'design-support': 'Дизайн поддержка.png'
        };

        var candidates = [ bannerUrl ];
        var fileName = nameMap[serviceType];
        if (fileName) {
          candidates.push(
            (function(){ try{ return encodeURI('./For site/03_cases/Covers uslugi/'+fileName); }catch(e){ return './For site/03_cases/Covers uslugi/'+fileName; } })(),
            (function(){ try{ return encodeURI('./For site/05_cover/'+fileName); }catch(e){ return './For site/05_cover/'+fileName; } })(),
            (function(){ try{ return encodeURI('./For site/03_cases/Обложки для услуг (Попап)/'+fileName); }catch(e){ return './For site/03_cases/Обложки для услуг (Попап)/'+fileName; } })()
          );
        }

        (function loadFirst(i){
          if (i >= candidates.length) { bannerEl.innerHTML = ''; return; }
          var testImg = new Image();
          testImg.onload = function(){
            var currentImg = bannerEl.querySelector('img');
            if (!currentImg || currentImg.getAttribute('src') !== candidates[i]) {
              bannerEl.innerHTML = '<img src="'+candidates[i]+'" alt="'+(service.title||'')+'" loading="lazy" />';
            }
          };
          testImg.onerror = function(){ loadFirst(i+1); };
          testImg.src = candidates[i];
        })(0);
      } else {
        bannerEl.innerHTML = '';
      }

      serviceModal.classList.add('active');
      serviceModal.setAttribute('aria-hidden', 'false');
      lockBodyScroll();

      const closeBtn = serviceModal.querySelector('.service-modal-close');
      if (closeBtn && typeof closeBtn.focus === 'function') closeBtn.focus();
    }

    // Close service modal
    function closeServiceModal() {
      serviceModal.classList.remove('active');
      serviceModal.setAttribute('aria-hidden', 'true');
      unlockBodyScroll();
    }

    // Event listeners for service cards
    document.addEventListener('click', (e) => {
      const serviceCard = e.target.closest('.service-clickable');
      if (serviceCard) {
        const serviceType = serviceCard.dataset.service;
        openServiceModal(serviceType);
      }
    });

    // Event listeners for modal close
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('.service-modal-close');
      if (closeBtn || 
          e.target.classList.contains('service-modal-overlay') ||
          e.target.hasAttribute('data-service-close')) {
        closeServiceModal();
      }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && serviceModal.classList.contains('active')) {
        closeServiceModal();
      }
    });
    
  });
})();
