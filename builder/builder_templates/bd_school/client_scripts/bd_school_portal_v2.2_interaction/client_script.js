/* BD School Portal v2.1 — original accessible, progressive motion controller.
   Works on a published Builder Page; static contents still work without JavaScript.
   Animation references: see ANIMATION_RESEARCH.md. No third-party runtime. */
(()=>{
  'use strict';
  const root = document.querySelector('.school-portal-body');
  if (!root) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = root.querySelector('.school-motion-toggle');
  const progress = root.querySelector('.school-progress-bar');
  const reveals = [...root.querySelectorAll('.school-reveal')];
  const staggerGroups = [...root.querySelectorAll('.school-stagger-group')];
  const masthead = root.querySelector('.school-masthead');
  const hero = root.querySelector('.school-hero-entrance');
  const ticker = root.querySelector('.ticker-track');
  const campus = root.querySelector('.school-campus-ambient');
  let userPaused = false;
  const canMove = () => !reduced.matches && !userPaused;
  const allRevealed = () => reveals.forEach(el=>{
    el.classList.remove('can-reveal'); el.classList.add('is-shown');
  });
  function renderToggle() {
    root.classList.toggle('school-motion-paused',!canMove());
    if (!toggle) return;
    const paused=!canMove();
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.setAttribute('aria-label',paused ? 'অ্যানিমেশন চালু করুন' : 'অ্যানিমেশন বন্ধ করুন');
    toggle.textContent=paused ? 'অ্যানিমেশন চালু' : 'অ্যানিমেশন বন্ধ';
    if(paused)allRevealed();
  }
  if(toggle)toggle.addEventListener('click',()=>{userPaused=!userPaused;renderToggle();});
  if (reduced.addEventListener) reduced.addEventListener('change',renderToggle);
  else if (reduced.addListener) reduced.addListener(renderToggle);
  renderToggle();

  // Notices always exist as regular editable Frappe blocks; no AJAX dependency.
  const board=root.querySelector('.notice-board');
  if(board){
    const items=[...board.querySelectorAll('.notice-item')];
    board.querySelectorAll('.notice-filter').forEach(button=>button.addEventListener('click',()=>{
      const selected=button.dataset.filter||'all';
      board.querySelectorAll('.notice-filter').forEach(b=>{
        const active=b===button;
        b.classList.toggle('is-active',active);
        b.setAttribute('aria-pressed',String(active));
      });
      items.forEach((item,i)=>{
        item.hidden=selected!=='all' && item.dataset.category!==selected;
        item.classList.remove('notice-enter');
        if(!item.hidden&&canMove()){
          // Restart only the short transition, not the user's notice scroll position.
          void item.offsetWidth;
          item.style.animationDelay=Math.min(i,4)*32+'ms';
          item.classList.add('notice-enter');
        }
      });
    }));
  }

  // Wrap original ticker links into a cycle and make one inert visual copy.
  // This guarantees the scroll repeats without a blank reset at different widths.
  if(ticker && ticker.children.length){
    const cycle=document.createElement('div');
    cycle.className='ticker-cycle';
    while(ticker.firstChild)cycle.appendChild(ticker.firstChild);
    ticker.appendChild(cycle);
    const duplicate=cycle.cloneNode(true);
    duplicate.setAttribute('aria-hidden','true');
    duplicate.querySelectorAll('a,button,[tabindex]').forEach(el=>el.setAttribute('tabindex','-1'));
    ticker.appendChild(duplicate);
    ticker.classList.add('is-looping');
    function tickerDuration(){
      // Use the real rendered content width so Bangla text stays comfortably readable.
      ticker.style.setProperty('--school-ticker-duration',Math.max(21,Math.ceil(cycle.scrollWidth/44))+'s');
    }
    tickerDuration();
    window.addEventListener('resize',tickerDuration,{passive:true});
  }

  // Scroll progress: runs only on scroll, never changes the content layout.
  let scheduled=false;
  function updateProgress(){
    scheduled=false;
    if(!progress)return;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const ratio=max>0?Math.max(0,Math.min(1,window.scrollY/max)):0;
    progress.style.transform='scaleX('+ratio.toFixed(4)+')';
  }
  function scheduleProgress(){
    if(scheduled)return;
    scheduled=true;
    window.requestAnimationFrame(updateProgress);
  }
  window.addEventListener('scroll',scheduleProgress,{passive:true});
  window.addEventListener('resize',scheduleProgress,{passive:true});
  updateProgress();

  if(!('IntersectionObserver' in window)){allRevealed();return;}
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-shown');
      revealObserver.unobserve(entry.target);
    }
  }),{threshold:.06,rootMargin:'0px 0px 48px 0px'});
  reveals.forEach(el=>{
    if(canMove()&&el.getBoundingClientRect().top>window.innerHeight*.97){
      el.classList.add('can-reveal');
      revealObserver.observe(el);
    }else el.classList.add('is-shown');
  });
  root.addEventListener('focusin',event=>{
    const section=event.target.closest('.school-reveal.can-reveal');
    if(section){section.classList.add('is-shown');revealObserver.unobserve(section);}
  });

  const entranceObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const el=entry.target;
    if(entry.isIntersecting){
      if(canMove())el.classList.add('is-inview');
      else el.classList.remove('is-inview');
      if(el!==campus)entranceObserver.unobserve(el);
    }
    if(el===campus)el.classList.toggle('is-offscreen',!entry.isIntersecting);
  }),{threshold:.04,rootMargin:'0px 0px 50px 0px'});
  [...staggerGroups,masthead,hero,campus].filter(Boolean).forEach(el=>{
    const targets=[...el.children].filter(x=>x.matches('.service-tile,.feature-card,.news-card,.gallery-photo-placeholder,.gov-card'));
    targets.forEach((c,i)=>c.style.setProperty('--school-stagger-delay',Math.min(i,9)*70+'ms'));
    entranceObserver.observe(el);
  });
  if(ticker){
    const tickerObserver=new IntersectionObserver(([entry])=>{
      ticker.classList.toggle('is-offscreen',!entry.isIntersecting);
    },{threshold:0});
    tickerObserver.observe(ticker);
  }
  document.addEventListener('visibilitychange',()=>{
    if(ticker)ticker.classList.toggle('is-offscreen',document.hidden);
  });
})();

// v2.2: active navigation item is derived from the current route.
(()=>{const path=(location.pathname||'').replace(/\/$/,'');document.querySelectorAll('.school-portal-body .nav-link').forEach(a=>{const target=(a.getAttribute('href')||'').split('#')[0].replace(/\/$/,'');if(target&&target===path){a.classList.add('is-current');a.setAttribute('aria-current','page')}})})();
