import { BaseAnimation } from './BaseAnimation';
import { Particle } from '../types/AnimationTypes';

export class GalaxyAnimation extends BaseAnimation {
  private centerX: number = 0;
  private centerY: number = 0;
  private time: number = 0;

  protected initializeParticles(): void {
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;

    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = this.createParticle();
      
      // Create spiral distribution
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.min(this.canvas.width, this.canvas.height) * 0.4;
      
      particle.position = {
        x: this.centerX + Math.cos(angle) * radius,
        y: this.centerY + Math.sin(angle) * radius
      };
      
      // Orbital velocity
      const orbitalSpeed = 0.5 + Math.random() * 0.5;
      particle.velocity = {
        x: -Math.sin(angle) * orbitalSpeed,
        y: Math.cos(angle) * orbitalSpeed
      };
      
      particle.size = this.randomRange(1, 3);
      particle.opacity = this.randomRange(0.3, 0.8);
      
      // Color based on distance from center
      const distance = radius / (Math.min(this.canvas.width, this.canvas.height) * 0.4);
      const hue = 240 + distance * 60; // Blue to purple gradient
      particle.color = `hsl(${hue}, 70%, 60%)`;
      
      particle.life = particle.maxLife = this.randomRange(10000, 20000);
      particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
      
      this.particles.push(particle);
    }
  }

  protected updateParticle(particle: Particle, deltaTime: number): void {
    this.time += deltaTime * 0.001;

    // Update center position (slow drift)
    this.centerX += Math.sin(this.time * 0.1) * 0.1;
    this.centerY += Math.cos(this.time * 0.1) * 0.1;

    // Calculate distance from center
    const dx = particle.position.x - this.centerX;
    const dy = particle.position.y - this.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Orbital motion with spiral effect
    const orbitalSpeed = 0.5 + Math.random() * 0.5;
    const spiralForce = Math.sin(distance * 0.01 + this.time) * 0.1;
    
    particle.velocity.x = -Math.sin(angle) * orbitalSpeed + Math.cos(angle) * spiralForce;
    particle.velocity.y = Math.cos(angle) * orbitalSpeed + Math.sin(angle) * spiralForce;

    // Update position
    particle.position.x += particle.velocity.x * deltaTime * 0.1;
    particle.position.y += particle.velocity.y * deltaTime * 0.1;

    // Mouse interaction - particles are attracted to cursor
    if (this.mouse.isActive) {
      const mouseDx = this.mouse.position.x - particle.position.x;
      const mouseDy = this.mouse.position.y - particle.position.y;
      const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
      
      if (mouseDistance < 120) {
        const force = (120 - mouseDistance) / 120;
        particle.velocity.x += (mouseDx / mouseDistance) * force * 0.02;
        particle.velocity.y += (mouseDy / mouseDistance) * force * 0.02;
      }
    }

    // Wrap around screen
    if (particle.position.x < -particle.size) {
      particle.position.x = this.canvas.width + particle.size;
    } else if (particle.position.x > this.canvas.width + particle.size) {
      particle.position.x = -particle.size;
    }

    if (particle.position.y < -particle.size) {
      particle.position.y = this.canvas.height + particle.size;
    } else if (particle.position.y > this.canvas.height + particle.size) {
      particle.position.y = -particle.size;
    }

    // Update rotation
    particle.rotation += particle.rotationSpeed * deltaTime * 0.1;

    // Update life
    particle.life -= deltaTime;
    particle.opacity = (particle.life / particle.maxLife) * this.randomRange(0.3, 0.8);
  }

  protected renderParticle(particle: Particle): void {
    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.translate(particle.position.x, particle.position.y);
    this.ctx.rotate(particle.rotation);

    // Draw star with glow effect
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.5, particle.color + '80');
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw core star
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, particle.size * 0.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw star points
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = 0.5;
    
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(
        Math.cos(angle) * particle.size * 1.5,
        Math.sin(angle) * particle.size * 1.5
      );
      this.ctx.stroke();
    }

    this.ctx.restore();
  }
}
