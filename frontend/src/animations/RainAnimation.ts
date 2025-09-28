import { BaseAnimation } from './BaseAnimation';
import { Particle } from '../types/AnimationTypes';

export class RainAnimation extends BaseAnimation {
  private windStrength: number = 0;
  private windDirection: number = 0;

  protected initializeParticles(): void {
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = this.createParticle();
      particle.position = {
        x: Math.random() * (this.canvas.width + 200) - 100, // Start from wider area
        y: -Math.random() * this.canvas.height
      };
      particle.velocity = {
        x: Math.random() * 2 - 1, // Slight horizontal movement
        y: Math.random() * 8 + 3   // Downward velocity
      };
      particle.size = this.randomRange(1, 3);
      particle.opacity = this.randomRange(0.2, 0.6);
      particle.color = `rgba(220, 230, 240, ${particle.opacity})`;
      particle.life = particle.maxLife = this.randomRange(5000, 12000);
      
      // Rain-specific data
      particle.data = {
        length: this.randomRange(8, 25),
        thickness: this.randomRange(0.5, 1.5),
        angle: this.randomRange(-0.2, 0.2) // Slight angle variation
      };
      
      this.particles.push(particle);
    }

    // Initialize wind simulation
    this.windStrength = Math.random() * 2 - 1;
    this.windDirection = Math.random() * 0.4 - 0.2;
  }

  protected updateParticle(particle: Particle, deltaTime: number): void {
    const dt = deltaTime * 0.1;
    
    // Update wind (subtle changes over time)
    this.windStrength += (Math.random() - 0.5) * 0.001;
    this.windStrength = Math.max(-2, Math.min(2, this.windStrength));
    
    // Apply gravity and wind
    particle.velocity.y += 0.05 * dt; // Gravity
    particle.velocity.x += this.windStrength * 0.01 * dt; // Wind effect
    
    // Update position
    particle.position.x += particle.velocity.x * dt;
    particle.position.y += particle.velocity.y * dt;

    // Mouse interaction - raindrops are pushed slightly by cursor
    if (this.mouse.isActive && this.config.interactive) {
      const dx = particle.position.x - this.mouse.position.x;
      const dy = particle.position.y - this.mouse.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 80) {
        const force = (80 - distance) / 80 * 0.3;
        particle.velocity.x += (dx / distance) * force * 0.02;
        // Don't affect vertical movement much to maintain rain feeling
      }
    }

    // Reset raindrop if it goes off screen
    if (particle.position.y > this.canvas.height + 50) {
      particle.position.y = -Math.random() * 100;
      particle.position.x = Math.random() * (this.canvas.width + 200) - 100;
      particle.velocity.x = Math.random() * 2 - 1;
      particle.velocity.y = Math.random() * 8 + 3;
    }

    // Wrap horizontally
    if (particle.position.x < -100) {
      particle.position.x = this.canvas.width + 100;
    } else if (particle.position.x > this.canvas.width + 100) {
      particle.position.x = -100;
    }

    // Update opacity based on life (subtle fade)
    const lifeRatio = particle.life / particle.maxLife;
    particle.opacity = lifeRatio * this.randomRange(0.2, 0.6);
    
    // Update life
    particle.life -= deltaTime;
  }

  protected renderParticle(particle: Particle): void {
    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    
    // Draw raindrop as a line with gradient
    const gradient = this.ctx.createLinearGradient(
      particle.position.x,
      particle.position.y,
      particle.position.x + particle.data.angle * particle.data.length,
      particle.position.y + particle.data.length
    );
    
    gradient.addColorStop(0, 'rgba(220, 230, 240, 0)');
    gradient.addColorStop(0.3, particle.color);
    gradient.addColorStop(1, 'rgba(220, 230, 240, 0)');
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = particle.data.thickness;
    this.ctx.lineCap = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(particle.position.x, particle.position.y);
    this.ctx.lineTo(
      particle.position.x + particle.data.angle * particle.data.length,
      particle.position.y + particle.data.length
    );
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  // Override createParticle to prevent unnecessary data being set
  protected createParticle(): Particle {
    return {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      size: 1,
      opacity: 0.5,
      color: '',
      life: 0,
      maxLife: 0,
      rotation: 0,
      rotationSpeed: 0,
      data: {}
    };
  }
}
