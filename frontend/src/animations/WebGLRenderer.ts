export class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private timeUniform: WebGLUniformLocation | null = null;
  private resolutionUniform: WebGLUniformLocation | null = null;
  private mouseUniform: WebGLUniformLocation | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }

    this.initShaders();
    this.initBuffers();
  }

  private initShaders(): void {
    const vertexShaderSource = `
      attribute vec2 a_position;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      
      void main() {
        vec2 position = a_position;
        
        // Convert from pixels to clip space
        vec2 clipSpace = ((position / u_resolution) * 2.0) - 1.0;
        
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = 10.0;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      
      uniform float u_time;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // Create circular particle with soft edges
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        
        // Add pulsing effect
        float pulse = sin(u_time * 2.0) * 0.1 + 0.9;
        alpha *= pulse;
        
        // Simple color
        vec3 color = vec3(0.3, 0.6, 1.0);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }

    this.program = this.createProgram(vertexShader, fragmentShader);
    
    if (!this.program) {
      throw new Error('Failed to create WebGL program');
    }

    this.gl.useProgram(this.program);

    // Get uniform locations
    this.timeUniform = this.gl.getUniformLocation(this.program, 'u_time');
    this.resolutionUniform = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.mouseUniform = this.gl.getUniformLocation(this.program, 'u_mouse');
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  private initBuffers(): void {
    // Create simple point vertices
    const vertices = new Float32Array([
      0, 0
    ]);

    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  }

  public render(particles: any[], mouse: { x: number; y: number }, time: number): void {
    if (!this.program || !this.vertexBuffer) return;

    this.gl.useProgram(this.program);

    // Set uniforms
    this.gl.uniform1f(this.timeUniform, time);
    this.gl.uniform2f(this.resolutionUniform, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform2f(this.mouseUniform, mouse.x, mouse.y);

    // Set up attributes
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');

    // Vertex positions
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Enable blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // Draw particles as points
    this.gl.drawArrays(this.gl.POINTS, 0, particles.length);

    // Disable blending
    this.gl.disable(this.gl.BLEND);
  }

  public destroy(): void {
    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer);
    }
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
  }
}
