(function(){
  'use strict';
  
  // Ждем загрузки DOM
  document.addEventListener('DOMContentLoaded', function() {
    initBot();
  });
  
  function initBot() {
    var form = document.getElementById('loev-bot-form');
    var promptEl = document.getElementById('prompt');
    var genBtn = document.getElementById('gen-btn');
    var clearBtn = document.getElementById('clear-btn');
    var statusEl = document.getElementById('status');
    var cardsHost = document.getElementById('bot-cards');
    var loadingEl = document.getElementById('loading');
    
    console.log('Bot elements found:', {
      form: !!form,
      promptEl: !!promptEl,
      genBtn: !!genBtn,
      clearBtn: !!clearBtn,
      statusEl: !!statusEl,
      cardsHost: !!cardsHost,
      loadingEl: !!loadingEl
    });
    
    if (!form || !promptEl || !genBtn || !clearBtn || !statusEl || !cardsHost || !loadingEl) {
      console.error('Some bot elements not found!');
      return;
    }
    
    function setStatus(msg, type = 'info'){ 
      if(statusEl){ 
        statusEl.textContent = msg || ''; 
        statusEl.className = 'status ' + type;
        statusEl.style.display = msg ? 'block' : 'none';
      } 
    }

    function showLoading(show) {
      if(loadingEl) {
        if(show) {
          loadingEl.style.display = 'block';
          // Принудительно пересчитываем стили для анимации
          loadingEl.offsetHeight;
          loadingEl.classList.add('show');
          // Убеждаемся, что спиннер крутится
          var spinner = loadingEl.querySelector('.loading-spinner');
          if(spinner) {
            spinner.style.animation = 'spin 1s linear infinite';
          }
        } else {
          loadingEl.classList.remove('show');
          // Скрываем после завершения анимации
          setTimeout(() => {
            if(!loadingEl.classList.contains('show')) {
              loadingEl.style.display = 'none';
            }
          }, 300);
        }
      }
    }

    function escapeHtml(s){ if(typeof s!=='string') return s; return s.replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]);}); }
    function loadSnippets(){ return fetch('../assets/data/post_examples.json',{cache:'no-store'}).then(function(r){return r.json();}).catch(function(){return null;}); }

    function detectNiche(prompt){
      var p=(prompt||'').toLowerCase();
      if(p.indexOf('кофе')>=0||p.indexOf('кофей')>=0||p.indexOf('coffee')>=0) return 'кофейня';
      if(p.indexOf('банк')>=0||p.indexOf('финанс')>=0) return 'банк';
      if(p.indexOf('секонд')>=0||p.indexOf('second')>=0) return 'секонд‑хенд';
      if(p.indexOf('шоу')>=0||p.indexOf('showroom')>=0||p.indexOf('шоурум')>=0) return 'шоурум';
      if(p.indexOf('дизайн')>=0||p.indexOf('бренд')>=0) return 'студия дизайна';
      return null;
    }

    function pickSnippets(data, prompt){ var key=detectNiche(prompt); var arr=(key && data && data.niches && data.niches[key])? data.niches[key] : []; return arr.slice(0,2).map(function(x){return JSON.stringify(x);}).join('\n'); }

    function buildPrompt(userPrompt, snippets){
      var niche=detectNiche(userPrompt)||'указанная ниша';
      var exemplarsHeader='ЭТАЛОНЫ (для ориентира по стилю/плотности, не копируй):\n';
      var rules=[
        'НИША: '+niche+'. Строго пишем только про эту нишу.',
        'Если ниша не «студия дизайна», запрещено упоминать «студию дизайна», «дизайн-студию» и аналогичные формулировки.',
        'Заголовок явно отражает нишу: включи слово «'+niche+'».',
        '1000–1200 знаков. Живой, практичный текст без воды.',
        'Структура: введение → основная часть → вывод → CTA.',
        'Запрет: FAQ-списки, общие «советы по визуалу», пустые вопросы без ответов.',
        'Без кейсов/компаний; только общие принципы, год — 2025.'
      ].join('\n- ');
      return (
        'Ты пишешь посты для бизнеса. Тон: профессиональный, дружелюбный.\n' +
        '- ' + rules + '\n\n' +
        exemplarsHeader + (snippets||'') + '\n\n' +
        'Ответ строго JSON. Поля: structured{title,annotation,intro,body[],outro,cta}, post (string) — цельный готовый текст без ключей и пометок.\n' +
        'Верни JSON с полями structured и post без пояснений вне JSON.'
      );
    }

    function composeFromStructured(obj){ if(!obj||typeof obj!=='object') return ''; var parts=[]; if(obj.title){ parts.push((obj.title||'').toString().trim()); } if(obj.annotation){ parts.push((obj.annotation||'').toString().trim()); } if(obj.intro){ parts.push((obj.intro||'').toString().trim()); } if(Array.isArray(obj.body)&&obj.body.length){ parts.push(obj.body.map(function(p){ return p&&p.toString?p.toString().trim():''; }).filter(Boolean).join('\n\n')); } if(obj.outro){ parts.push((obj.outro||'').toString().trim()); } if(obj.cta){ parts.push((obj.cta||'').toString().trim()); } return parts.filter(Boolean).join('\n\n'); }

    function looksLikeStructuredString(s){ if(typeof s!=='string') return false; return /\{\s*"(title|intro|annotation|body|outro|cta)"/i.test(s); }

    function renderCards(plan){
      if(!cardsHost) return;
      var days = ['Пн','Вт','Ср','Чт','Пт','Сб'];
      cardsHost.innerHTML = '';
      
      console.log('Rendering cards with plan:', plan);
      
      // Принудительно создаем 6 карточек
      for(var i=0;i<6;i++){
        var item = plan && plan[i] ? plan[i] : {};
        var day = item.day || days[i];
        var topic = item.topic || 'Тема не указана';
        var format = item.format || 'Пост';
        var post = item.post || item.draft || '';
        var structured = item.structured || null;
        var cta = item.cta || '';
        var tips = item.tips || '';
        // Если tips - объект, преобразуем в строку
        if (typeof tips === 'object' && tips !== null) {
          if (Array.isArray(tips)) {
            tips = tips.join(', ');
          } else {
            tips = JSON.stringify(tips);
          }
        }
        var visual = item.visual_idea || '';
        // Если visual_idea - объект, форматируем красиво
        if (typeof visual === 'object' && visual !== null) {
          if (Array.isArray(visual)) {
            visual = visual.join(', ');
          } else {
            // Парсим JSON объект и форматируем красиво
            try {
              var parsed = JSON.parse(visual);
              var formatted = '';
              if (parsed.text) formatted += 'Текст: ' + parsed.text + '\n\n';
              if (parsed.colors) formatted += 'Цвет: ' + parsed.colors.join(', ') + '\n\n';
              if (parsed.fonts) formatted += 'Шрифт: ' + parsed.fonts.join(', ') + '\n\n';
              if (parsed.elements) formatted += 'Элементы: ' + parsed.elements.join(', ') + '\n\n';
              if (parsed.composition) formatted += 'Композиция: ' + parsed.composition;
              visual = formatted || visual;
            } catch(e) {
              visual = JSON.stringify(visual);
            }
          }
        }
        
        // Безопасное превью для логов
        var previewSrc = (typeof post === 'string') ? post : JSON.stringify(post||'');
        var preview = (previewSrc || '').toString().substring(0, 50) + '...';
        console.log('Day', i+1, ':', {day: day, topic: topic, format: format, post: preview});

        var card = document.createElement('div');
        card.className = 'content-card';
        
        var cardHTML = ''+
          '<div class="card-header">'+
            '<div class="day-badge">'+day+'</div>'+
            '<div class="format-badge">'+format+'</div>'+
          '</div>'+
          '<h3 class="card-title">'+escapeHtml(topic)+'</h3>'+
          '<div class="card-content">';
          
        if(structured && typeof structured === 'object'){
          cardHTML += '<div class="post-text">'+ escapeHtml(composeFromStructured(structured)) +'</div>';
        } else {
          cardHTML += '<div class="post-text"></div>';
        }
        cardHTML += '</div>';
        
        // Убираем блок с визуальными идеями
        // if(visual) {
        //   cardHTML += '<div class="visual-section">'+
        //     '<div class="visual-label">🎨 Дизайн баннера</div>'+
        //     '<div class="visual-text">'+visual+'</div>'+
        //   '</div>';
        // }
        
        if(tips) {
          cardHTML += '<div class="tips-section">'+
            '<div class="tips-label">💡 Советы для SMM</div>'+
            '<div class="tips-text">'+tips+'</div>'+
          '</div>';
        }
        
        cardHTML += '<div class="card-actions">'+
          '<button class="copy-btn" data-copy>📋 Копировать пост</button>'+
          '</div>';
        
        card.innerHTML = cardHTML;
        cardsHost.appendChild(card);
        
        // Устанавливаем текст поста
        var textEl = card.querySelector('.post-text');
        if(textEl && !structured){
          var finalText='';
          if(typeof post==='object' && post){
            finalText=composeFromStructured(post);
          } else if(looksLikeStructuredString(post)){
            try{
              var parsed=JSON.parse(post);
              finalText=composeFromStructured(parsed);
            }catch(_){
              finalText=(post||'').toString();
            }
          } else {
            finalText=(typeof post==='string')?post:'';
          }
          textEl.textContent=finalText;
        }
        
        // Обработчик копирования с замыканием
        var copyBtn = card.querySelector('[data-copy]');
        if(copyBtn) {
          (function(buttonElement, textElement) {
            buttonElement.addEventListener('click', function(){
              var textToCopy = textElement ? textElement.textContent : '';
              if(textToCopy && textToCopy !== 'Контент не сгенерирован') {
                navigator.clipboard.writeText(textToCopy).then(function(){
                  var originalText = buttonElement.innerHTML;
                  buttonElement.innerHTML = '✅ Скопировано!';
                  buttonElement.disabled = true;
                  setTimeout(function(){
                    buttonElement.innerHTML = originalText;
                    buttonElement.disabled = false;
                  }, 2000);
                }).catch(function(){
                  setStatus('Ошибка копирования', 'error');
                });
              } else {
                setStatus('Нет контента для копирования', 'error');
              }
            });
          })(copyBtn, textEl);
        }
      }
    }

    function validatePlan(plan){
      if(!Array.isArray(plan)) return false;
      var ok=false;
      for(var i=0;i<plan.length;i++){
        var it=plan[i]||{};
        if(it.structured && typeof it.structured==='object'){
          var s=it.structured;
          if(s.title && s.annotation && s.intro && Array.isArray(s.body) && s.body.length>=3 && s.outro){
            ok=true;
            break;
          }
        } else if(it.post){
          ok=true;
        }
      }
      return ok;
    }

    function generate(){
      if(!promptEl || !promptEl.value.trim()) {
        setStatus('Введите описание задачи', 'error');
        return;
      }
      
      setStatus('Генерируем контент-план...', 'info');
      showLoading(true);
      genBtn.disabled = true;
      
      console.log('Sending request to API...');
      // Таймаут и контроллер прерывания, чтобы не висло бесконечно
      var controller = new AbortController();
      var timeoutId = setTimeout(function(){ controller.abort(); }, 25000);
      
      loadSnippets().then(function(db){
        var snippets=pickSnippets(db,promptEl.value.trim());
        var composedPrompt=buildPrompt(promptEl.value.trim(),snippets);
        return fetch('https://loev-bot.loevdesign.workers.dev/api/loev-bot', {
          method: 'POST',
          mode: 'cors',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: composedPrompt
          }),
          signal: controller.signal
        });
      })
      .then(function(response) {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        console.log('Response data:', data);
        
        if(data.error) {
          throw new Error(data.message || 'Ошибка генерации');
        }
        
        var plan=Array.isArray(data.plan)?data.plan:null;
        if(!plan || !validatePlan(plan)) throw new Error('Слабая структура ответа');

        if(plan && Array.isArray(plan)) {
          renderCards(plan);
          setStatus('Контент-план готов!', 'success');
        } else {
          throw new Error('Неверный формат ответа');
        }
      })
      .catch(function(error) {
        console.error('Generation error:', error);
        var message = 'Ошибка: ' + (error && error.message ? error.message : 'Failed to fetch');
        // Более понятные подсказки для типичных случаев
        if(String(error).includes('Failed to fetch') || String(error.name) === 'AbortError'){
          message = 'Не удалось обратиться к сервису. Проверьте интернет или откройте страницу по адресу http/https (не file://). Возможна блокировка CORS/сетевые ограничения. Попробуйте ещё раз чуть позже.';
        }
        setStatus(message, 'error');
      })
      .finally(function(){
        clearTimeout(timeoutId);
        showLoading(false);
        genBtn.disabled = false;
      });
    }

    // Авторазмер textarea
    function autoResizeTextarea(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
    }

    if(promptEl) {
      promptEl.addEventListener('input', function() {
        autoResizeTextarea(this);
      });
      
      // Инициализация
      autoResizeTextarea(promptEl);
    }

    if(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        generate();
      });
    }

    if(clearBtn) {
      clearBtn.addEventListener('click', function() {
        if(promptEl) promptEl.value = '';
        if(cardsHost) cardsHost.innerHTML = '';
        setStatus('');
        showLoading(false);
      });
    }

    // Инициализация
    setStatus('');
    showLoading(false);
  }
})();