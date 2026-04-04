import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../utils/validation';
import { LoginCredentials } from '../types';
import { useRef, useEffect, useCallback } from 'react';
import { Mail, Lock } from 'lucide-react';
import './LoginPage.css';

/* ------------------------------------------------------------------ */
/*  Floating Triangle Particle System                                  */
/* ------------------------------------------------------------------ */

interface Triangle {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  vx: number;
  vy: number;
  opacity: number;
  color: string;
  parallaxFactor: number;
}

function createTriangles(width: number, height: number, count: number): Triangle[] {
  const colors = [
    'rgba(30, 64, 175, 0.12)',
    'rgba(30, 64, 175, 0.08)',
    'rgba(19, 34, 56, 0.18)',
    'rgba(59, 130, 246, 0.06)',
    'rgba(148, 163, 184, 0.05)',
  ];

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 8 + Math.random() * 28,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.008,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    opacity: 0.15 + Math.random() * 0.35,
    color: colors[Math.floor(Math.random() * colors.length)],
    parallaxFactor: 0.02 + Math.random() * 0.05,
  }));
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  t: Triangle,
  mouseOffsetX: number,
  mouseOffsetY: number
) {
  const px = t.x + mouseOffsetX * t.parallaxFactor;
  const py = t.y + mouseOffsetY * t.parallaxFactor;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(t.rotation);
  ctx.globalAlpha = t.opacity;

  ctx.beginPath();
  const h = t.size * 0.866;
  ctx.moveTo(0, -h * 0.67);
  ctx.lineTo(-t.size / 2, h * 0.33);
  ctx.lineTo(t.size / 2, h * 0.33);
  ctx.closePath();

  ctx.strokeStyle = t.color;
  ctx.lineWidth = 1;
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
  const trianglesRef = useRef<Triangle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, smoothX: 0, smoothY: 0 });
  const animFrameRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX - window.innerWidth / 2;
    mouseRef.current.y = e.clientY - window.innerHeight / 2;
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
      trianglesRef.current = createTriangles(window.innerWidth, window.innerHeight, 35);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // smooth inertia
      const m = mouseRef.current;
      m.smoothX += (m.x - m.smoothX) * 0.04;
      m.smoothY += (m.y - m.smoothY) * 0.04;

      for (const t of trianglesRef.current) {
        t.x += t.vx;
        t.y += t.vy;
        t.rotation += t.rotationSpeed;

        // wrap around edges
        if (t.x < -60) t.x = w + 60;
        if (t.x > w + 60) t.x = -60;
        if (t.y < -60) t.y = h + 60;
        if (t.y > h + 60) t.y = -60;

        drawTriangle(ctx, t, m.smoothX, m.smoothY);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
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
