import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../utils/validation';
import { LoginCredentials } from '../types';
import { useRef, useEffect, useCallback } from 'react';
import { Mail, Lock } from 'lucide-react';
import './LoginPage.css';

/* ------------------------------------------------------------------ */
/*  Particle Network Background                                        */
/* ------------------------------------------------------------------ */

interface NetworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

function createParticles(width: number, height: number, count: number): NetworkParticle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    size: 1.2 + Math.random() * 2.4,
    opacity: 0.35 + Math.random() * 0.45,
  }));
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: NetworkParticle,
) {
  ctx.save();
  ctx.globalAlpha = particle.opacity;
  ctx.fillStyle = 'rgba(191, 219, 254, 0.95)';
  ctx.shadowColor = 'rgba(96, 165, 250, 0.5)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawConnection(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  distance: number,
  maxDistance: number,
) {
  const alpha = (1 - distance / maxDistance) * 0.35;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(96, 165, 250, 0.9)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/*  Login Page Component                                               */
/* ------------------------------------------------------------------ */

const LoginPage = () => {
  /* ---- auth & form logic (UNCHANGED) ---- */
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    await login(data);
  };

  /* ---- particle canvas refs ---- */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<NetworkParticle[]>([]);
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    smoothX: window.innerWidth / 2,
    smoothY: window.innerHeight / 2,
    active: false,
  });
  const animFrameRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
    mouseRef.current.active = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const particleCount = window.innerWidth < 768 ? 36 : 72;
      particlesRef.current = createParticles(window.innerWidth, window.innerHeight, particleCount);
      mouseRef.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        smoothX: window.innerWidth / 2,
        smoothY: window.innerHeight / 2,
        active: false,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const particleLinkDistance = window.innerWidth < 768 ? 112 : 152;
      const mouseLinkDistance = window.innerWidth < 768 ? 132 : 184;

      ctx.clearRect(0, 0, w, h);

      const m = mouseRef.current;
      const targetX = m.active ? m.x : w / 2;
      const targetY = m.active ? m.y : h / 2;
      m.smoothX += (targetX - m.smoothX) * 0.06;
      m.smoothY += (targetY - m.smoothY) * 0.06;

      for (const particle of particlesRef.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = w + 20;
        if (particle.x > w + 20) particle.x = -20;
        if (particle.y < -20) particle.y = h + 20;
        if (particle.y > h + 20) particle.y = -20;
      }

      for (let i = 0; i < particlesRef.current.length; i += 1) {
        const particle = particlesRef.current[i];

        for (let j = i + 1; j < particlesRef.current.length; j += 1) {
          const nextParticle = particlesRef.current[j];
          const dx = particle.x - nextParticle.x;
          const dy = particle.y - nextParticle.y;
          const distance = Math.hypot(dx, dy);

          if (distance < particleLinkDistance) {
            drawConnection(ctx, particle, nextParticle, distance, particleLinkDistance);
          }
        }

        if (m.active) {
          const mouseDistance = Math.hypot(particle.x - m.smoothX, particle.y - m.smoothY);
          if (mouseDistance < mouseLinkDistance) {
            drawConnection(
              ctx,
              particle,
              { x: m.smoothX, y: m.smoothY },
              mouseDistance,
              mouseLinkDistance,
            );
          }
        }

        drawParticle(ctx, particle);
      }

      if (m.active) {
        ctx.save();
        ctx.fillStyle = 'rgba(147, 197, 253, 0.18)';
        ctx.shadowColor = 'rgba(96, 165, 250, 0.45)';
        ctx.shadowBlur = 26;
        ctx.beginPath();
        ctx.arc(m.smoothX, m.smoothY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleMouseMove]);

  /* ---- render ---- */
  return (
    <div className="login-page">
      {/* Particle background */}
      <canvas ref={canvasRef} className="login-particles-canvas" />

      {/* Glass card */}
      <div className="login-content">
        <div className="login-card">
          {/* Logo & brand */}
          <div className="login-logo-wrapper">
            <div className="login-logo-glow">
              <img
                src="/logo.png"
                alt="Karabacak Gıda"
                className="login-logo"
              />
            </div>
            <h1 className="login-brand-title">KARABACAK GIDA</h1>
            <p className="login-brand-subtitle">Hesabınıza giriş yapın</p>
          </div>

          <hr className="login-divider" />

          {/* Form — all bindings preserved exactly */}
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {/* Email */}
            <div className="login-input-group">
              <label className="login-input-label" htmlFor="login-email">
                E-posta
              </label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="ornek@email.com"
                  className={`login-input ${errors.email ? 'input-error' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="login-error-text">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="login-input-group">
              <label className="login-input-label" htmlFor="login-password">
                Şifre
              </label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className={`login-input ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="login-error-text">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-submit-btn"
            >
              <span className="login-submit-btn-content">
                {isSubmitting ? (
                  <>
                    <span className="login-spinner" />
                    İşleniyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            Stok & Müşteri Takip
            <span className="login-footer-dot" />
            Kurumsal Yönetim
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
