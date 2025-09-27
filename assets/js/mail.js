;(function(){
  const EMAIL_TO = 'loevstudio@gmail.com';
  const formSelector = '#contact-modal form.contact-form';

  function serialize(obj){
    return Object.keys(obj).map(k=> encodeURIComponent(k)+'='+encodeURIComponent(obj[k]||'')).join('&');
  }

  function buildMailto(data){
    const subject = `Заявка с сайта — ${data.name||''}`.trim();
    const body = [
      `Имя: ${data.name||''}`,
      `Email: ${data.email||''}`,
      data.phone?`Телефон: ${data.phone}`:'',
      '',
      (data.message||'')
    ].filter(Boolean).join('%0D%0A');
    return `mailto:${EMAIL_TO}?subject=${encodeURIComponent(subject)}&body=${body}`;
  }

  async function sendEmailJS(data){
    if(!(window.emailjs && emailjs.send)) return false;
    try{
      const serviceId = window.EMAILJS_SERVICE_ID || '';
      const templateId = window.EMAILJS_TEMPLATE_ID || '';
      const publicKey = window.EMAILJS_PUBLIC_KEY || '';
      if(!serviceId || !templateId || !publicKey) return false;
      emailjs.init(publicKey);
      await emailjs.send(serviceId, templateId, data);
      return true;
    }catch(e){ return false }
  }

  function attach(){
    const form = document.querySelector(formSelector);
    if(!form) return;
    const status = form.querySelector('.contact-form-status');
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      form.classList.add('is-loading');
      if(status){ status.textContent = ''; status.classList.remove('is-error','is-success') }
      // Try EmailJS first
      const ok = await sendEmailJS(data);
      form.classList.remove('is-loading');
      if(ok){
        if(status){ status.textContent = 'Сообщение отправлено!'; status.classList.add('is-success') }
        form.reset();
      }else{
        // Fallback: mailto
        const href = buildMailto(data);
        window.location.href = href;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', attach);
})();













