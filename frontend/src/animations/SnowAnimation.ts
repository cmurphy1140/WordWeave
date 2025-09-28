import { BaseAnimation } from './BaseAnimation';
import { Particle } from '../types/AnimationTypes';

export class SnowAnimation extends BaseAnimation {
  protected initializeParticles(): void {
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = this.createParticle();
      particle.position = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height
      };
      particle.velocity = {
        x: (Math.random() - 0.5) * 0.5,
        y: Math.random() * 1 + 0.5
      };
      particle.size = this.randomRange(1, 4);
      particle.opacity = this.randomRange(0.4, 0.9);
      particle.color = '#ffffff';
      particle.life = particle.maxLife = this.randomRange(5000, 15000);
      particle.rotationSpeed = (Math.random() - 0.5) * 0.05;
      
      this.particles.push(particle);
    }
  }

  protected updateParticle(particle: Particle, deltaTime: number): void {
    // Update position
    particle.position.x += particle.velocity.x * deltaTime * 0.1;
    particle.position.y += particle.velocity.y * deltaTime * 0.1;

    // Add wind effect
    particle.velocity.x += Math.sin(particle.position.y * 0.01) * 0.001;

    // Mouse interaction - snow swirls around cursor
    if (this.mouse.isActive) {
      const dx = particle.position.x - this.mouse.position.x;
      const dy = particle.position.y - this.mouse.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 80) {
        const force = (80 - distance) / 80;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        particle.velocity.x += Math.cos(angle) * force * 0.02;
        particle.velocity.y += Math.sin(angle) * force * 0.02;
      }
    }

    // Reset snowflake if it goes off screen
    if (particle.position.y > this.canvas.height + particle.size) {
      particle.position.y = -particle.size;
      particle.position.x = Math.random() * this.canvas.width;
      particle.velocity.y = Math.random() * 1 + 0.5;
    }

    if (particle.position.x < -particle.size) {
      particle.position.x = this.canvas.width + particle.size;
    } else if (particle.position.x > this.canvas.width + particle.size) {
      particle.position.x = -particle.size;
    }

    // Update rotation
    particle.rotation += particle.rotationSpeed * deltaTime * 0.1;

    // Update life
    particle.life -= deltaTime;
    particle.opacity = (particle.life / particle.maxLife) * this.randomRange(0.4, 0.9);
  }

  protected renderParticle(particle: Particle): void {
    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.translate(particle.position.x, particle.position.y);
    this.ctx.rotate(particle.rotation);

    // Draw snowflake
    this.ctx.fillStyle = particle.color;
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = 0.5;

    // Main body
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    this.ctx.fill();

    // Snowflake arms
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(
        Math.cos(angle) * particle.size * 2,
        Math.sin(angle) * particle.size * 2
      );
      this.ctx.stroke();

      // Side branches
      const branchAngle1 = angle + Math.PI / 6;
      const branchAngle2 = angle - Math.PI / 6;
      const branchLength = particle.size * 1.5;

      this.ctx.beginPath();
      this.ctx.moveTo(
        Math.cos(angle) * particle.size,
        Math.sin(angle) * particle.size
      );
      this.ctx.lineTo(
        Math.cos(branchAngle1) * branchLength,
        Math.sin(branchAngle1) * branchLength
      );
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(
        Math.cos(angle) * particle.size,
        Math.sin(angle) * particle.size
      );
      this.ctx.lineTo(
        Math.cos(branchAngle2) * branchLength,
        Math.sin(branchAngle2) * branchLength
      );
      this.ctx.stroke();
    }

    this.ctx.restore();
  }
}
