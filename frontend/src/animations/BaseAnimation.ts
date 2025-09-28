import { 
  Particle, 
  AnimationConfig, 
  MouseInteraction, 
  PerformanceMetrics
} from '../types/AnimationTypes';
import { PerformanceMonitor } from './PerformanceMonitor';

export abstract class BaseAnimation {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected particles: Particle[] = [];
  protected config: AnimationConfig;
  protected mouse: MouseInteraction;
  protected performance: PerformanceMetrics;
  protected ripples: Array<{x: number, y: number, radius: number, maxRadius: number, opacity: number}> = [];
  protected performanceMonitor: PerformanceMonitor;
  protected animationId: number | null = null;
  protected lastTime: number = 0;
  protected frameCount: number = 0;
  protected fpsUpdateTime: number = 0;

  constructor(canvas: HTMLCanvasElement, config: AnimationConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    this.mouse = {
      position: { x: 0, y: 0 },
      isActive: false,
      strength: 1
    };
    this.performance = {
      fps: 60,
      particleCount: config.particleCount,
      renderTime: 0,
      isLowPerformance: false
    };
    this.performanceMonitor = new PerformanceMonitor();

    // Apply adaptive configuration
    const adaptiveConfig = this.performanceMonitor.getAdaptiveConfig();
    this.config.particleCount = Math.min(this.config.particleCount, adaptiveConfig.maxParticles);
    this.config.webgl = this.config.webgl && adaptiveConfig.enableWebGL;

    this.setupEventListeners();
    this.initializeParticles();
  }

  protected abstract initializeParticles(): void;
  protected abstract updateParticle(particle: Particle, deltaTime: number): void;
  protected abstract renderParticle(particle: Particle): void;

  protected setupEventListeners(): void {
    if (!this.config.interactive) return;

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.position = {
        x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
        y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
      };
      this.mouse.isActive = true;
    });

    this.canvas.addEventListener('click', (e) => {
      if (!this.config.interactive) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      this.createRipple(x, y);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.isActive = false;
    });

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      if (!this.config.interactive) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
      this.mouse.position = { x, y };
      this.mouse.isActive = true;
      this.createRipple(x, y);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.mouse.position = {
        x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
      };
      this.mouse.isActive = true;
    });

    this.canvas.addEventListener('touchend', () => {
      this.mouse.isActive = false;
    });
  }

  protected createParticle(): Particle {
    return {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      size: this.randomRange(this.config.size.min, this.config.size.max),
      opacity: this.randomRange(this.config.opacity.min, this.config.opacity.max),
      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
      life: this.randomRange(this.config.life.min, this.config.life.max),
      maxLife: this.randomRange(this.config.life.min, this.config.life.max),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      data: {}
    };
  }

  protected randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  protected createRipple(x: number, y: number): void {
    if (!this.config.interactive) return;
    this.ripples.push({
      x,
      y,
      radius: 0,
      maxRadius: 100,
      opacity: 0.3
    });
  }

  protected updateRipples(deltaTime: number): void {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const ripple = this.ripples[i];
      ripple.radius += deltaTime * 0.2;
      ripple.opacity -= deltaTime * 0.001;
      
      if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  protected renderRipples(): void {
    if (this.ripples.length === 0) return;
    
    this.ctx.save();
    for (const ripple of this.ripples) {
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  protected updatePerformanceMetrics(currentTime: number): void {
    const fps = this.performanceMonitor.recordFrame(currentTime);
    this.performance.fps = Math.round(fps);
    
    // Use adaptive particle count
    const newParticleCount = this.performanceMonitor.getAdaptiveParticleCount(this.config.particleCount);
    if (newParticleCount !== this.config.particleCount) {
      this.config.particleCount = newParticleCount;
      this.performance.particleCount = newParticleCount;
    }
    
    const avgFPS = this.performanceMonitor.getAverageFPS();
    this.performance.isLowPerformance = avgFPS < 45;
  }

  protected resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  protected animate = (currentTime: number): void => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.updatePerformanceMetrics(currentTime);
    this.resizeCanvas();

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update ripples
    this.updateRipples(deltaTime);

    // Update and render particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      this.updateParticle(particle, deltaTime);
      this.renderParticle(particle);

      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Maintain particle count
    while (this.particles.length < this.config.particleCount) {
      this.particles.push(this.createParticle());
    }

    // Render ripples on top
    this.renderRipples();

    this.animationId = requestAnimationFrame(this.animate);
  };

  public start(): void {
    if (this.animationId === null) {
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame(this.animate);
    }
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performance };
  }

  public destroy(): void {
    this.stop();
    this.particles = [];
  }
}
