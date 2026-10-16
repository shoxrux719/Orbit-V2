export function mountMotion() {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timeout;
  let timerFrame;
  let lastFocused;
  let currentDialog;
  let started = false;
  const reduced = () => media.matches || root.dataset.motion === 'off';
  const remember = () => { try { sessionStorage.setItem('orbit-intro-seen', 'yes'); } catch {} };
  const close = () => {
    clearTimeout(timeout);
    currentDialog?.close();
    currentDialog?.classList.remove('is-playing');
    root.classList.remove('orbit-film-open');
    remember();
    if (lastFocused?.isConnected) lastFocused.focus({ preventScroll: true });
  };
  const play = () => {
    const dialog = document.querySelector('#orbit-intro');
    if (!dialog || dialog.open) return;
    lastFocused = document.activeElement;
    currentDialog = dialog;
    dialog.classList.remove('is-playing');
    dialog.showModal();
    root.classList.add('orbit-film-open');
    // Restart the sequence when the visitor explicitly replays it.
    void dialog.offsetWidth;
    dialog.classList.add('is-playing');
    dialog.querySelector('.orbit-intro-skip')?.focus({ preventScroll: true });
    dialog.addEventListener('close', close, { once: true });
    timeout = setTimeout(close, reduced() ? 1300 : 4700);
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('orbit-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  const scan = () => {
    document.querySelectorAll('[data-orbit-reveal]:not([data-orbit-observed])').forEach(element => {
      element.dataset.orbitObserved = 'yes';
      if (reduced()) element.classList.add('orbit-visible');
      else observer.observe(element);
    });
    if (!started && document.querySelector('#orbit-intro')) {
      started = true;
      let seen = false;
      try { seen = sessionStorage.getItem('orbit-intro-seen') === 'yes'; } catch {}
      if (!seen && !reduced()) timerFrame = requestAnimationFrame(play);
    }
  };
  const mutation = new MutationObserver(scan);
  mutation.observe(document.querySelector('.app-main') || document.body, { childList: true, subtree: true });
  const onClick = event => {
    const action = event.target.closest('[data-orbit-action]')?.dataset.orbitAction;
    if (action === 'intro') play();
    if (action === 'skip') close();
    if (action === 'hello' && window.speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Hello.');
      utterance.lang = 'en-GB';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
    const open = document.querySelector('.orbit-nav-menu[open]');
    if (open && !open.contains(event.target)) open.removeAttribute('open');
  };
  const onKey = event => {
    if (event.key === 'Escape') {
      document.querySelector('.orbit-nav-menu[open]')?.removeAttribute('open');
      if (currentDialog?.open) close();
    }
  };
  const onScroll = () => root.classList.toggle('orbit-scrolled', window.scrollY > 20);
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  scan();
  onScroll();
  return () => {
    close();
    cancelAnimationFrame(timerFrame);
    observer.disconnect();
    mutation.disconnect();
    document.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll);
  };
}
