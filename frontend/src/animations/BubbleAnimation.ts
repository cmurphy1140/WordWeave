import { BaseAnimation } from './BaseAnimation';
import { Particle } from '../types/AnimationTypes';

export class BubbleAnimation extends BaseAnimation {
  protected initializeParticles(): void {
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = this.createParticle();
      particle.position = {
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + Math.random() * 100
      };
      particle.velocity = {
        x: (Math.random() - 0.5) * 0.5,
        y: -Math.random() * 2 - 0.5
      };
      particle.size = this.randomRange(4, 18);
      particle.opacity = this.randomRange(0.1, 0.4);
      particle.color = `hsl(${200 + Math.random() * 60}, 50%, 70%)`;
      particle.life = particle.maxLife = this.randomRange(3000, 8000);
      particle.rotationSpeed = (Math.random() - 0.5) * 0.02;
      
      this.particles.push(particle);
    }
  }

  protected updateParticle(particle: Particle, deltaTime: number): void {
    // Update position
    particle.position.x += particle.velocity.x * deltaTime * 0.1;
    particle.position.y += particle.velocity.y * deltaTime * 0.1;

    // Add slight horizontal drift
    particle.velocity.x += (Math.random() - 0.5) * 0.001;

    // Mouse interaction - bubbles float away from cursor
    if (this.mouse.isActive) {
      const dx = particle.position.x - this.mouse.position.x;
      const dy = particle.position.y - this.mouse.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.velocity.x += (dx / distance) * force * 0.01;
        particle.velocity.y += (dy / distance) * force * 0.01;
      }
    }

    // Reset bubble if it goes off screen
    if (particle.position.y < -particle.size) {
      particle.position.y = this.canvas.height + particle.size;
      particle.position.x = Math.random() * this.canvas.width;
      particle.velocity.y = -Math.random() * 2 - 0.5;
    }

    if (particle.position.x < -particle.size) {
      particle.position.x = this.canvas.width + particle.size;
    } else if (particle.position.x > this.canvas.width + particle.size) {
      particle.position.x = -particle.size;
    }

    // Update rotation
    particle.rotation += particle.rotationSpeed * deltaTime * 0.1;

    // Update life with subtle fade
    particle.life -= deltaTime;
    const lifeRatio = particle.life / particle.maxLife;
    particle.opacity = lifeRatio * this.randomRange(0.1, 0.4);
  }

  protected renderParticle(particle: Particle): void {
    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.translate(particle.position.x, particle.position.y);
    this.ctx.rotate(particle.rotation);

    // Draw minimalist bubble with subtle gradient
    const gradient = this.ctx.createRadialGradient(
      -particle.size * 0.2, -particle.size * 0.2, 0,
      0, 0, particle.size * 0.8
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.6, particle.color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    // Draw subtle outer ring
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${particle.opacity * 0.5})`;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size * 0.9, 0, Math.PI * 2);
    this.ctx.stroke();

    // Fill with gradient
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size * 0.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Add minimal highlight
    this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.6})`;
    this.ctx.beginPath();
    this.ctx.arc(-particle.size * 0.25, -particle.size * 0.25, particle.size * 0.15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
