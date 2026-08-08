const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const heroCanvas = document.getElementById('hero-network');
if (heroCanvas && window.matchMedia('(min-width: 761px)').matches) {
  const ctx = heroCanvas.getContext('2d');
  const container = heroCanvas.parentElement;
  let width, height, points, centerX, centerY, maxRadius;

  const NAVY = '35, 63, 103';
  const MAROON = '164, 16, 22';
  const POINT_COUNT = 28;
  const LINK_DISTANCE = 110;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = heroCanvas.width = container.clientWidth;
    height = heroCanvas.height = container.clientHeight;
    centerX = width / 2;
    centerY = height / 2;
  }

  function createPoints() {
    maxRadius = Math.min(width, height) / 2 * 0.82;
    points = Array.from({ length: POINT_COUNT }, () => {
      const size = (() => {
        const r = Math.random();
        if (r < 0.15) return 'tiny';
        if (r < 0.75) return 'medium';
        return 'large';
      })();
      const maroon = Math.random() < 0.15;
      const startAngle = Math.random() * Math.PI * 2;
      const startDist = Math.random() * maxRadius;
      const moveAngle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.3;
      return {
        x: centerX + Math.cos(startAngle) * startDist,
        y: centerY + Math.sin(startAngle) * startDist,
        vx: Math.cos(moveAngle) * speed,
        vy: Math.sin(moveAngle) * speed,
        turnTimer: 60 + Math.random() * 120,
        maroon,
        size
      };
    });
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    points.forEach((p) => {
      p.turnTimer -= 1;
      if (p.turnTimer <= 0) {
        const currentAngle = Math.atan2(p.vy, p.vx);
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const newAngle = currentAngle + (Math.random() - 0.5) * 1.4;
        p.vx = Math.cos(newAngle) * currentSpeed;
        p.vy = Math.sin(newAngle) * currentSpeed;
        p.turnTimer = 60 + Math.random() * 120;
      }

      p.x += p.vx;
      p.y += p.vy;

      const dx = p.x - centerX, dy = p.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxRadius) {
        const nx = dx / dist, ny = dy / dist;
        const dot = p.vx * nx + p.vy * ny;
        p.vx -= 2 * dot * nx;
        p.vy -= 2 * dot * ny;
        p.x = centerX + nx * maxRadius;
        p.y = centerY + ny * maxRadius;
      }
    });

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          const opacity = (1 - dist / LINK_DISTANCE) * 0.35;
          ctx.strokeStyle = `rgba(${NAVY}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    points.forEach((p) => {
      ctx.fillStyle = p.maroon ? `rgba(${MAROON}, 0.55)` : `rgba(${NAVY}, 0.45)`;
      let baseRadius = p.maroon ? 3.5 : 2.5;
      if (p.size === 'tiny') baseRadius *= 0.55;
      if (p.size === 'large') baseRadius *= 1.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, baseRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!prefersReducedMotion) {
      requestAnimationFrame(step);
    }
  }

  resize();
  createPoints();
  step();

  window.addEventListener('resize', () => {
    resize();
  });
}
