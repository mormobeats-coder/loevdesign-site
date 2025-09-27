;(function(){
  if (!window.DirectusCMS) {
    // Directus SDK не подключён — выходим тихо, оставляем статический контент
    return;
  }
  function formatDate(iso){
    try{ return new Date(iso).toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year:'numeric' }) }catch(e){ return '' }
  }

  function renderCard(post){
    const coverUrl = post.cover ? DirectusCMS.getAssetUrl(post.cover, { width: 1200, quality: 80, format: 'webp' }) : '';
    const a = document.createElement('article');
    a.className = 'post-card';
    a.setAttribute('data-cat', (post.category||'').toLowerCase());
    a.innerHTML = `
      <a href="./blog-post.html?slug=${encodeURIComponent(post.slug)}" class="post-link" aria-label="${post.title}">
        <div class="post-cover">${coverUrl?`<img src="${coverUrl}" alt="${post.title}" loading="lazy" decoding="async">`:''}</div>
      </a>
      <div class="post-body">
        <div class="post-kicker">${post.category||''}</div>
        <h3 class="post-title">${post.title}</h3>
        ${post.excerpt?`<p class="post-excerpt">${post.excerpt}</p>`:''}
        <div class="post-meta"><span class="post-date">${formatDate(post.date)}</span>${post.read_time?`<span class="dot"></span><span class="read-time">${post.read_time}</span>`:''}</div>
      </div>`;
    return a;
  }

  async function initList(){
    const grid = document.getElementById('blogGrid');
    if(!grid) return;
    try{
      const resp = await DirectusCMS.fetchPosts();
      const posts = (resp&&resp.data)||[];
      if(posts.length){
        // Clear static items after the first two featured remain intact
        grid.innerHTML = '';
        posts.forEach(p=> grid.appendChild(renderCard(p)));
      }
    }catch(e){
      console.warn('Directus list failed, keeping static content');
    }
  }

  async function initSingle(){
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    if(!slug) return;
    const titleEl = document.querySelector('.article-title');
    const leadEl = document.querySelector('.article-lead');
    const metaCatEl = document.querySelector('.article-category');
    const timeEl = document.querySelector('time[datetime]');
    const bodyEl = document.querySelector('.article-body');
    const coverWrap = document.querySelector('.article-cover');
    try{
      const post = await DirectusCMS.fetchPostBySlug(slug);
      if(!post) return;
      if(titleEl) titleEl.textContent = post.title||'';
      if(leadEl) leadEl.textContent = post.excerpt||'';
      if(metaCatEl) metaCatEl.textContent = post.category||'';
      if(timeEl){ timeEl.setAttribute('datetime', post.date||''); timeEl.textContent = formatDate(post.date) }
      if(coverWrap && post.cover){
        coverWrap.innerHTML = `<img src="${DirectusCMS.getAssetUrl(post.cover, { width: 1600, quality: 85, format: 'webp' })}" alt="${post.title}">`;
      }
      if(bodyEl){ bodyEl.innerHTML = post.content||''; }
      document.title = (post.title||'') + ' — Loev Design';
    }catch(e){
      console.warn('Directus single failed, keeping static article');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    initList();
    initSingle();
  });
})();


