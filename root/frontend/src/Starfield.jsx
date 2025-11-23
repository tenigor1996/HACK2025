// root/frontend/src/Starfield.jsx
import { useEffect, useRef } from "react";

const STAR_COUNT = 140;
// ⬆️ More frequent shooting stars (was 0.003)
const SHOOTING_STAR_CHANCE = 0.015;

function Starfield() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const starsRef = useRef([]);
  const shootingRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars();
    }

    function createStars() {
      const stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // optional: slightly larger normal stars too
          size: Math.random() * 1.4 + 0.5, // was 1.2 + 0.3
          speed: Math.random() * 0.3 + 0.05,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.015 + 0.005,
        });
      }
      starsRef.current = stars;
    }

    function spawnShootingStar() {
      const startX = Math.random() * canvas.width * 0.7;
      const startY = Math.random() * canvas.height * 0.4;
      const angle = (Math.random() * 20 + 250) * (Math.PI / 180);
      // ⬆️ Slightly faster for a more obvious streak
      const speed = Math.random() * 12 + 10; // was 10 + 6

      shootingRef.current.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60,
      });
    }

    function draw() {
      const width = canvas.width;
      const height = canvas.height;

      // Slightly transparent fill to create trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      const stars = starsRef.current;
      ctx.save();
      ctx.fillStyle = "#ffffff";

      for (let star of stars) {
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }

        const delta = star.twinkleSpeed * (Math.random() > 0.5 ? 1 : -1);
        star.alpha = Math.min(1, Math.max(0.3, star.alpha + delta));

        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Maybe spawn a shooting star
      if (Math.random() < SHOOTING_STAR_CHANCE) {
        spawnShootingStar();
      }

      // Draw shooting stars
      const shooting = shootingRef.current;
      ctx.save();
      for (let i = shooting.length - 1; i >= 0; i--) {
        const s = shooting[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        if (
          s.life <= 0 ||
          s.x > width + 150 ||
          s.y > height + 150 ||
          s.x < -150 ||
          s.y < -150
        ) {
          shooting.splice(i, 1);
          continue;
        }

        // ⬆️ Longer, thicker trail for "bigger" shooting stars
        const trailLength = 110; // was 80
        const norm = Math.hypot(s.vx, s.vy) || 1;
        const tx = s.x - (s.vx / norm) * trailLength;
        const ty = s.y - (s.vy / norm) * trailLength;

        const grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.5; // was 2
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // bright "head" of the shooting star
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.6, 0, Math.PI * 2); // small glow at the front
        ctx.fill();
      }
      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);

    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield-canvas" />;
}

export default Starfield;
