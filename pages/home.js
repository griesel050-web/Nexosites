/* home.js — counter animation + particles */
spawnParticles('hero-p', 30);

/* Animated counters */
const counters = document.querySelectorAll('.hstat-n[data-to]');
if (counters.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.to;
      let cur = 0;
      const step = target / (1600 / 16);
      const tick = () => {
        cur += step;
        if (cur < target) { el.textContent = Math.floor(cur); requestAnimationFrame(tick); }
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}
