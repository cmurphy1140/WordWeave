import { BaseAnimation } from './BaseAnimation';
import { Particle } from '../types/AnimationTypes';

export class GeometricAnimation extends BaseAnimation {
  private time: number = 0;

  protected initializeParticles(): void {
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = this.createParticle();
      
      particle.position = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height
      };
      
      particle.velocity = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      };
      
      particle.size = this.randomRange(6, 14);
      particle.opacity = this.randomRange(0.15, 0.35);
      particle.color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
      particle.life = particle.maxLife = this.randomRange(8000, 15000);
      particle.rotationSpeed = (Math.random() - 0.5) * 0.05; // Slower, more elegant rotation
      
    // Store shape type - fewer shapes for minimalism
    particle.data = {
      shape: ['triangle', 'square', 'diamond'][Math.floor(Math.random() * 3)],
      sides: [3, 4, 6][Math.floor(Math.random() * 3)], // Stick to clean geometric numbers
      strokeOnly: Math.random() > 0.5 // Some shapes are stroke-only for minimalism
    };
      
      this.particles.push(particle);
    }
  }

  protected updateParticle(particle: Particle, deltaTime: number): void {
    this.time += deltaTime * 0.001;

    // Update position
    particle.position.x += particle.velocity.x * deltaTime * 0.1;
    particle.position.y += particle.velocity.y * deltaTime * 0.1;

    // Add wave motion
    particle.velocity.x += Math.sin(particle.position.y * 0.01 + this.time) * 0.001;
    particle.velocity.y += Math.cos(particle.position.x * 0.01 + this.time) * 0.001;

    // Mouse interaction - geometric shapes align to cursor
    if (this.mouse.isActive) {
      const dx = particle.position.x - this.mouse.position.x;
      const dy = particle.position.y - this.mouse.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        const angle = Math.atan2(dy, dx);
        
        // Create geometric patterns around cursor
        const patternAngle = Math.floor(angle / (Math.PI / 3)) * (Math.PI / 3);
        particle.velocity.x += Math.cos(patternAngle) * force * 0.01;
        particle.velocity.y += Math.sin(patternAngle) * force * 0.01;
      }
    }

    // Bounce off edges
    if (particle.position.x < particle.size || particle.position.x > this.canvas.width - particle.size) {
      particle.velocity.x *= -1;
      particle.position.x = Math.max(particle.size, Math.min(this.canvas.width - particle.size, particle.position.x));
    }

    if (particle.position.y < particle.size || particle.position.y > this.canvas.height - particle.size) {
      particle.velocity.y *= -1;
      particle.position.y = Math.max(particle.size, Math.min(this.canvas.height - particle.size, particle.position.y));
    }

    // Update rotation
    particle.rotation += particle.rotationSpeed * deltaTime * 0.1;

    // Update life with subtle fade
    particle.life -= deltaTime;
    const lifeRatio = particle.life / particle.maxLife;
    particle.opacity = lifeRatio * this.randomRange(0.15, 0.35);
  }

  protected renderParticle(particle: Particle): void {
    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.translate(particle.position.x, particle.position.y);
    this.ctx.rotate(particle.rotation);

    const shape = particle.data?.shape || 'square';
    const sides = particle.data?.sides || 4;

    // Minimalist styling
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = 0.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();

    switch (shape) {
      case 'triangle':
        this.drawTriangle(particle.size);
        break;
      case 'square':
        this.drawSquare(particle.size);
        break;
      case 'diamond':
        this.drawDiamond(particle.size);
        break;
      default:
        this.drawPolygon(particle.size, sides);
    }

    // Only fill if not stroke-only
    if (!particle.data?.strokeOnly) {
      this.ctx.fillStyle = `${particle.color}20`; // Very transparent fill
      this.ctx.fill();
    }
    
    this.ctx.stroke();

    // Minimal inner accent (only for larger particles)
    if (particle.size > 10) {
      this.ctx.globalAlpha = particle.opacity * 0.3;
      this.ctx.lineWidth = 0.25;
      this.ctx.beginPath();
      this.drawPolygon(particle.size * 0.6, sides);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawTriangle(size: number): void {
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(-size * 0.866, size * 0.5);
    this.ctx.lineTo(size * 0.866, size * 0.5);
    this.ctx.closePath();
  }

  private drawSquare(size: number): void {
    this.ctx.rect(-size, -size, size * 2, size * 2);
  }

  private drawDiamond(size: number): void {
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(size, 0);
    this.ctx.lineTo(0, size);
    this.ctx.lineTo(-size, 0);
    this.ctx.closePath();
  }

  private drawPolygon(size: number, sides: number): void {
    const angle = (Math.PI * 2) / sides;
    this.ctx.moveTo(size, 0);
    
    for (let i = 1; i <= sides; i++) {
      const x = Math.cos(angle * i) * size;
      const y = Math.sin(angle * i) * size;
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.closePath();
  }
}
