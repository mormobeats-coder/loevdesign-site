export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/api/loev-bot' && request.method === 'POST') {
      try {
        const { prompt } = await request.json();
        if (!prompt || typeof prompt !== 'string') {
          return new Response(JSON.stringify({ error: 'prompt required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors } });
        }

        // Rate limit disabled per request
        const provider = (env.PROVIDER || 'groq').toLowerCase();
        const apiKey = env.PROVIDER_API_KEY;
        const model = env.MODEL_ID || 'llama-3.1-70b-instruct';

        async function callGroq(userPrompt){
          const system = [
            'Ты — опытный SMM-специалист и копирайтер студии дизайна Loev. Создавай качественный контент-план на неделю.',
            '',
            'ТРЕБОВАНИЯ К КОНТЕНТУ:',
            '• Каждый пост: 1000-1500 знаков, 3-4 абзаца',
            '• Уникальные темы без повторений',
            '• Живой, человеческий тон без канцеляризмов',
            '• Конкретные примеры, кейсы, инсайты, цифры',
            '• Ссылки на успешные кейсы крупных компаний (Apple, Nike, Coca-Cola, Starbucks)',
            '• Вопросы к аудитории для вовлечения',
            '• Мягкие призывы к действию',
            '• Разнообразные форматы контента',
            '• Детальные визуальные идеи с конкретными элементами',
            '• Советы для SMM-специалистов по продвижению контента',
            '',
            'ТЕМАТИКИ ДЛЯ РОТАЦИИ:',
            '• Кейсы и результаты проектов',
            '• Процесс работы и лайфхаки',
            '• Тренды в дизайне и брендинге',
            '• Ошибки клиентов и как их избежать',
            '• Инструменты и технологии',
            '• Психология восприятия дизайна',
            '• За кулисами студии',
            '• Советы по визуальному контенту',
            '',
            'СТРУКТУРА ОТВЕТА (только JSON-массив из 6 объектов):',
            '{',
            '  "day":"Пн|Вт|Ср|Чт|Пт|Сб",',
            '  "topic":"уникальная тема поста",',
            '  "format":"VK пост|Карусель|TG пост|Stories|Shorts/Reels|Пост",',
            '  "post":"полный текст 1000-1500 знаков с примерами, цифрами и вопросами",',
            '  "cta":"конкретный призыв к действию",',
            '  "tips":"3-5 уникальных советов для SMM-специалистов по продвижению этого контента",',
            '  "visual_idea":"конкретный дизайн баннера: текст на баннере, цвета, шрифты, элементы, композиция"',
            '}',
            '',
            'ТРЕБОВАНИЯ К ВИЗУАЛАМ:',
            '• Конкретный текст для баннера (заголовок, подзаголовок)',
            '• Цветовая схема и шрифты',
            '• Расположение элементов и композиция',
            '• Стиль и настроение',
            '',
            'ИЗБЕГАЙ: штампов, общих фраз, эмодзи в тексте, хэштегов внутри поста.'
          ].join('\n');

          const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: `Контекст: ${userPrompt}. Верни только JSON.` }
              ],
              temperature: 0.7
            })
          });
          if(!r.ok){ 
            const errorText = await r.text();
            throw new Error('groq_error: ' + errorText); 
          }
          const data = await r.json();
          const content = data?.choices?.[0]?.message?.content || '';
          
          console.log('Groq response:', content);
          
          // try parse as object with key plan or as array
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) return parsed;
            if (Array.isArray(parsed.plan)) return parsed.plan;
          } catch(e) {
            console.log('JSON parse error:', e.message);
          }
          
          // Fallback: try to find JSON array in string
          const match = content.match(/\[([\s\S]*)\]/);
          if (match) {
            try { 
              const result = JSON.parse(match[0]);
              console.log('Fallback parse success:', result);
              return result; 
            } catch(e) {
              console.log('Fallback parse error:', e.message);
            }
          }
          
          // Last resort: create mock data
          console.log('Using fallback mock data');
          return [
            { day:'Пн', topic: 'Позиционирование бренда', format: 'VK пост', post: 'Кто мы и чем отличаемся от конкурентов. Рассказываем о нашем подходе к дизайну и разработке. Показываем реальные кейсы и результаты работы. Делимся опытом и инсайтами из проектов. Что вас больше всего интересует в дизайне?', cta: 'Напишите нам', tips: 'Используйте конкретные примеры, добавляйте вопросы для вовлечения, показывайте результаты с цифрами', visual_idea:'Ключевой визуал с тезисами: белый фон, синий акцент, шрифт Inter' },
            { day:'Вт', topic: 'Кейс клиента', format: 'Карусель', post: 'Показываем реальный кейс: задача, процесс, результат. Клиент пришел с проблемой, мы предложили решение. Пошагово рассказываем, как работали над проектом. Какие метрики улучшились после внедрения. Какой кейс вас заинтересовал больше всего?', cta: 'Посмотреть кейс', tips: 'Создавайте до/после слайды, используйте метрики и цифры, добавляйте интерактивные элементы', visual_idea:'Слайды с метриками: градиентный фон, крупные цифры, минималистичный дизайн' },
            { day:'Ср', topic: 'Процесс работы', format: 'TG пост', post: 'Как мы работаем над проектами: от брифа до сдачи. Первый этап - изучение задачи и аудитории. Второй - создание концепции и прототипов. Третий - детальная проработка и тестирование. Четвертый - финализация и передача материалов. Какой этап кажется вам самым важным?', cta: 'Задать вопрос', tips: 'Визуализируйте процесс схемами, используйте таймлайны, добавляйте интерактивные элементы', visual_idea:'Схема 4 шага: круги с номерами, стрелки, цветовое кодирование этапов' },
            { day:'Чт', topic: 'FAQ', format: 'Stories', post: 'Отвечаем на частые вопросы клиентов. Сколько времени занимает проект? Какие материалы нужны для старта? Можно ли вносить изменения в процессе? Как происходит согласование этапов? Что делать, если результат не понравился? Есть ли у вас другие вопросы?', cta: 'Связаться', tips: 'Используйте стикеры и эмодзи, создавайте короткие видео-ответы, добавляйте интерактивные опросы', visual_idea:'Стикеры вопросов: яркие цвета, крупные знаки вопроса, анимированные элементы' },
            { day:'Пт', topic: 'Советы по визуалу', format: 'Пост', post: 'Три практичных совета для улучшения визуала. Первый - используйте контраст для выделения важного. Второй - соблюдайте единый стиль во всех материалах. Третий - тестируйте на разных устройствах и форматах. Показываем примеры до и после применения советов. Какой совет оказался самым полезным?', cta: 'Сохранить пост', tips: 'Создавайте сравнения до/после, используйте скриншоты, добавляйте практические примеры', visual_idea:'Примеры до/после: разделение на две части, контрастные цвета, крупные заголовки' },
            { day:'Сб', topic: 'За кулисами', format: 'Shorts/Reels', post: 'Показываем, как создается дизайн в реальном времени. Монтаж процесса работы над проектом. Объясняем, почему принимаем те или иные решения. Делимся лайфхаками и секретами мастерства. Показываем инструменты и техники работы. Что бы вы хотели увидеть в следующий раз?', cta: 'Подписаться', tips: 'Используйте таймлапсы, добавляйте субтитры, создавайте серии видео', visual_idea:'Таймлапс работы: динамичная композиция, яркие акценты, минималистичный интерфейс' }
          ];
        }

        async function callOpenRouter(userPrompt){
          const system = [
            'Ты — опытный SMM-специалист и копирайтер студии дизайна Loev. Создавай качественный контент-план на неделю.',
            '',
            'ТРЕБОВАНИЯ К КОНТЕНТУ:',
            '• Каждый пост: 1000-1500 знаков, 3-4 абзаца',
            '• Уникальные темы без повторений',
            '• Живой, человеческий тон без канцеляризмов',
            '• Конкретные примеры, кейсы, инсайты, цифры',
            '• Ссылки на успешные кейсы крупных компаний (Apple, Nike, Coca-Cola, Starbucks)',
            '• Вопросы к аудитории для вовлечения',
            '• Мягкие призывы к действию',
            '• Разнообразные форматы контента',
            '• Детальные визуальные идеи с конкретными элементами',
            '• Советы для SMM-специалистов по продвижению контента',
            '',
            'ТЕМАТИКИ ДЛЯ РОТАЦИИ:',
            '• Кейсы и результаты проектов',
            '• Процесс работы и лайфхаки',
            '• Тренды в дизайне и брендинге',
            '• Ошибки клиентов и как их избежать',
            '• Инструменты и технологии',
            '• Психология восприятия дизайна',
            '• За кулисами студии',
            '• Советы по визуальному контенту',
            '',
            'СТРУКТУРА ОТВЕТА (только JSON-массив из 6 объектов):',
            '{',
            '  "day":"Пн|Вт|Ср|Чт|Пт|Сб",',
            '  "topic":"уникальная тема поста",',
            '  "format":"VK пост|Карусель|TG пост|Stories|Shorts/Reels|Пост",',
            '  "post":"полный текст 1000-1500 знаков с примерами, цифрами и вопросами",',
            '  "cta":"конкретный призыв к действию",',
            '  "tips":"3-5 уникальных советов для SMM-специалистов по продвижению этого контента",',
            '  "visual_idea":"конкретный дизайн баннера: текст на баннере, цвета, шрифты, элементы, композиция"',
            '}',
            '',
            'ТРЕБОВАНИЯ К ВИЗУАЛАМ:',
            '• Конкретный текст для баннера (заголовок, подзаголовок)',
            '• Цветовая схема и шрифты',
            '• Расположение элементов и композиция',
            '• Стиль и настроение',
            '',
            'ИЗБЕГАЙ: штампов, общих фраз, эмодзи в тексте, хэштегов внутри поста.'
          ].join('\n');

          const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://loevdesign.ru',
              'X-Title': 'Loev SMM Bot'
            },
            body: JSON.stringify({
              model: model || 'meta-llama/Meta-Llama-3.1-70B-Instruct',
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: `Контекст: ${userPrompt}. Верни только JSON.` }
              ],
              temperature: 0.7
            })
          });
          if(!r.ok){
            const t = await r.text();
            throw new Error('openrouter_error: ' + t);
          }
          const data = await r.json();
          const content = data?.choices?.[0]?.message?.content || '';
          
          console.log('OpenRouter response:', content);
          
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) return parsed;
            if (Array.isArray(parsed.plan)) return parsed.plan;
          } catch(e) {
            console.log('JSON parse error:', e.message);
          }
          
          const match = content.match(/\[([\s\S]*)\]/);
          if (match) {
            try { 
              const result = JSON.parse(match[0]);
              console.log('Fallback parse success:', result);
              return result; 
            } catch(e) {
              console.log('Fallback parse error:', e.message);
            }
          }
          
          // Last resort: create mock data
          console.log('Using fallback mock data');
          return [
            { day:'Пн', topic: 'Позиционирование бренда', format: 'VK пост', post: 'Кто мы и чем отличаемся от конкурентов. Рассказываем о нашем подходе к дизайну и разработке. Показываем реальные кейсы и результаты работы. Делимся опытом и инсайтами из проектов. Что вас больше всего интересует в дизайне?', cta: 'Напишите нам', tips: 'Используйте конкретные примеры, добавляйте вопросы для вовлечения, показывайте результаты с цифрами', visual_idea:'Ключевой визуал с тезисами: белый фон, синий акцент, шрифт Inter' },
            { day:'Вт', topic: 'Кейс клиента', format: 'Карусель', post: 'Показываем реальный кейс: задача, процесс, результат. Клиент пришел с проблемой, мы предложили решение. Пошагово рассказываем, как работали над проектом. Какие метрики улучшились после внедрения. Какой кейс вас заинтересовал больше всего?', cta: 'Посмотреть кейс', tips: 'Создавайте до/после слайды, используйте метрики и цифры, добавляйте интерактивные элементы', visual_idea:'Слайды с метриками: градиентный фон, крупные цифры, минималистичный дизайн' },
            { day:'Ср', topic: 'Процесс работы', format: 'TG пост', post: 'Как мы работаем над проектами: от брифа до сдачи. Первый этап - изучение задачи и аудитории. Второй - создание концепции и прототипов. Третий - детальная проработка и тестирование. Четвертый - финализация и передача материалов. Какой этап кажется вам самым важным?', cta: 'Задать вопрос', tips: 'Визуализируйте процесс схемами, используйте таймлайны, добавляйте интерактивные элементы', visual_idea:'Схема 4 шага: круги с номерами, стрелки, цветовое кодирование этапов' },
            { day:'Чт', topic: 'FAQ', format: 'Stories', post: 'Отвечаем на частые вопросы клиентов. Сколько времени занимает проект? Какие материалы нужны для старта? Можно ли вносить изменения в процессе? Как происходит согласование этапов? Что делать, если результат не понравился? Есть ли у вас другие вопросы?', cta: 'Связаться', tips: 'Используйте стикеры и эмодзи, создавайте короткие видео-ответы, добавляйте интерактивные опросы', visual_idea:'Стикеры вопросов: яркие цвета, крупные знаки вопроса, анимированные элементы' },
            { day:'Пт', topic: 'Советы по визуалу', format: 'Пост', post: 'Три практичных совета для улучшения визуала. Первый - используйте контраст для выделения важного. Второй - соблюдайте единый стиль во всех материалах. Третий - тестируйте на разных устройствах и форматах. Показываем примеры до и после применения советов. Какой совет оказался самым полезным?', cta: 'Сохранить пост', tips: 'Создавайте сравнения до/после, используйте скриншоты, добавляйте практические примеры', visual_idea:'Примеры до/после: разделение на две части, контрастные цвета, крупные заголовки' },
            { day:'Сб', topic: 'За кулисами', format: 'Shorts/Reels', post: 'Показываем, как создается дизайн в реальном времени. Монтаж процесса работы над проектом. Объясняем, почему принимаем те или иные решения. Делимся лайфхаками и секретами мастерства. Показываем инструменты и техники работы. Что бы вы хотели увидеть в следующий раз?', cta: 'Подписаться', tips: 'Используйте таймлапсы, добавляйте субтитры, создавайте серии видео', visual_idea:'Таймлапс работы: динамичная композиция, яркие акценты, минималистичный интерфейс' }
          ];
        }

        if (apiKey) {
          try{
            // Получаем историю тем для разнообразия
            const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0';
            let usedTopics = [];
            try {
              const historyKeys = await env.KV.list({ prefix: `hist:${ip}:` });
              for (const key of historyKeys.keys.slice(0, 5)) {
                const topics = await env.KV.get(key.name);
                if (topics) usedTopics.push(...topics.split('\n').filter(Boolean));
              }
            } catch(_) {}

            // Добавляем контекст разнообразия в промпт
            const diversityContext = usedTopics.length > 0 
              ? `\n\nИЗБЕГАЙ ПОВТОРЕНИЯ ТЕМ: ${usedTopics.slice(0, 10).join(', ')}`
              : '';

            const enhancedPrompt = `${prompt}${diversityContext}`;
            const plan = provider === 'openrouter' ? await callOpenRouter(enhancedPrompt) : await callGroq(enhancedPrompt);
            
            const days = ['Пн','Вт','Ср','Чт','Пт','Сб'];
            const formats = ['VK пост', 'Карусель', 'TG пост', 'Stories', 'Shorts/Reels', 'Пост'];
            
            const normalized = (plan || []).slice(0,6).map((it, i) => ({
              day: it.day || days[i] || '',
              topic: it.topic || '',
              format: it.format || formats[Math.floor(Math.random() * formats.length)],
              post: it.post || (it.draft||''),
              cta: it.cta || '',
              tips: Array.isArray(it.tips) ? it.tips.join(', ') : (it.tips || it.hashtags || ''),
              visual_idea: Array.isArray(it.visual_idea) ? it.visual_idea.join(', ') : (it.visual_idea || '')
            }));
            while(normalized.length<6){ normalized.push({ day: days[normalized.length]||'', topic:'', format:'', post:'', cta:'', hashtags:[], visual_idea:'' }); }

            // Rate counter disabled

            // Store simple history (topics checksum)
            try{
              const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0';
              const topics = normalized.map(x=>x.topic).filter(Boolean).join('\n');
              const hKey = `hist:${ip}:${Date.now()}`;
              await env.KV.put(hKey, topics, { expirationTtl: 60*60*24*60 }); // 60 дней
            }catch(_){ }

            return new Response(JSON.stringify({ plan: normalized }), { headers: { 'Content-Type': 'application/json', ...cors } });
          }catch(e){
            console.error('provider_failed', e?.message || e);
            return new Response(JSON.stringify({ error: 'provider_failed', message: (e && e.message) || 'unknown' }), { status: 502, headers: { 'Content-Type': 'application/json', ...cors } });
          }
        }

        // Mock fallback
        const mock = [
          { day:'Пн', topic: 'Позиционирование бренда', format: 'VK пост', post: 'Кто мы и чем отличаемся...', cta: 'Напишите нам', tips: 'Используйте конкретные примеры, добавляйте вопросы для вовлечения', visual_idea:'Ключевой визуал с тезисами: белый фон, синий акцент' },
          { day:'Вт', topic: 'Кейс клиента', format: 'Карусель', post: 'До/после, задача, результат...', cta: 'Посмотреть кейс', tips: 'Создавайте до/после слайды, используйте метрики', visual_idea:'Слайды с метриками: градиентный фон, крупные цифры' },
          { day:'Ср', topic: 'Процесс', format: 'TG пост', post: 'Как делаем проекты по шагам...', cta: 'Задать вопрос', tips: 'Визуализируйте процесс схемами, используйте таймлайны', visual_idea:'Схема 4 шага: круги с номерами, стрелки' },
          { day:'Чт', topic: 'FAQ', format: 'Stories', post: 'Ответы на частые вопросы...', cta: 'Связаться', tips: 'Используйте стикеры и эмодзи, создавайте короткие видео', visual_idea:'Стикеры вопросов: яркие цвета, крупные знаки вопроса' },
          { day:'Пт', topic: 'Советы по визуалу', format: 'Пост', post: '3 практичных совета...', cta: 'Сохранить пост', tips: 'Создавайте сравнения до/после, используйте скриншоты', visual_idea:'Примеры до/после: разделение на две части, контрастные цвета' },
          { day:'Сб', topic: 'За кулисами', format: 'Shorts/Reels', post: 'Монтаж таймлапс...', cta: 'Подписаться', tips: 'Используйте таймлапсы, добавляйте субтитры', visual_idea:'Таймлапс работы: динамичная композиция, яркие акценты' }
        ];
        return new Response(JSON.stringify({ plan: mock }), { headers: { 'Content-Type': 'application/json', ...cors } });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors } });
      }
    }

    return new Response('Not Found', { status: 404, headers: cors });
  }
};


