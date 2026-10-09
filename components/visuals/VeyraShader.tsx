"use client";

import React, { useEffect, useRef, useState } from "react";

interface VeyraShaderProps {
  className?: string;
  interactive?: boolean;
}

export function VeyraShader({ className = "", interactive = true }: VeyraShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Try WebGL2 first, then WebGL with extension
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const isWebGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
    if (!isWebGL2) {
      gl.getExtension("OES_standard_derivatives");
    }

    const vsSource = isWebGL2
      ? `#version 300 es
in vec2 a_position;
out vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`
      : `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fsSource = isWebGL2
      ? `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
in vec2 v_texCoord;
out vec4 fragColor;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = (st - 0.5) * aspect;

    vec2 center = vec2(0.2, 0.0);
    float d = length(p - center);

    vec3 col = vec3(0.035, 0.035, 0.035);

    vec2 grid = abs(fract(p * 24.0 - 0.5) - 0.5) / fwidth(p * 24.0);
    float line = min(grid.x, grid.y);
    float gridVal = 1.0 - min(line, 1.0);
    col += vec3(0.08, 0.08, 0.075) * gridVal * 0.18 * smoothstep(1.2, 0.2, d);

    float rings = sin(d * 42.0 - u_time * 0.85);
    rings = smoothstep(0.88, 0.98, rings);
    col += vec3(0.776, 0.655, 0.416) * rings * 0.12 * smoothstep(0.9, 0.1, d);

    float scan = abs(p.y - sin(u_time * 0.6) * 0.45);
    float scanLine = smoothstep(0.004, 0.0, scan);
    col += vec3(0.83, 0.73, 0.51) * scanLine * 0.22 * smoothstep(0.8, 0.0, abs(p.x - center.x));

    vec2 ptCoord = floor(p * 48.0);
    float ptNoise = hash(ptCoord);
    if (ptNoise > 0.88 && d < 0.65) {
        vec2 ptFrac = fract(p * 48.0) - 0.5;
        float ptDist = length(ptFrac);
        float ptAlpha = smoothstep(0.18, 0.05, ptDist);
        float pulse = 0.5 + 0.5 * sin(u_time * 2.5 + ptNoise * 12.0);
        col += mix(vec3(0.95, 0.94, 0.91), vec3(0.776, 0.655, 0.416), ptNoise) * ptAlpha * pulse * 0.75;
    }

    col *= smoothstep(1.3, 0.2, length(p));
    fragColor = vec4(col, 1.0);
}`
      : `#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = (st - 0.5) * aspect;

    vec2 center = vec2(0.2, 0.0);
    float d = length(p - center);

    vec3 col = vec3(0.035, 0.035, 0.035);

#ifdef GL_OES_standard_derivatives
    vec2 grid = abs(fract(p * 24.0 - 0.5) - 0.5) / fwidth(p * 24.0);
    float line = min(grid.x, grid.y);
    float gridVal = 1.0 - min(line, 1.0);
    col += vec3(0.08, 0.08, 0.075) * gridVal * 0.18 * smoothstep(1.2, 0.2, d);
#endif

    float rings = sin(d * 42.0 - u_time * 0.85);
    rings = smoothstep(0.88, 0.98, rings);
    col += vec3(0.776, 0.655, 0.416) * rings * 0.12 * smoothstep(0.9, 0.1, d);

    float scan = abs(p.y - sin(u_time * 0.6) * 0.45);
    float scanLine = smoothstep(0.004, 0.0, scan);
    col += vec3(0.83, 0.73, 0.51) * scanLine * 0.22 * smoothstep(0.8, 0.0, abs(p.x - center.x));

    vec2 ptCoord = floor(p * 48.0);
    float ptNoise = hash(ptCoord);
    if (ptNoise > 0.88 && d < 0.65) {
        vec2 ptFrac = fract(p * 48.0) - 0.5;
        float ptDist = length(ptFrac);
        float ptAlpha = smoothstep(0.18, 0.05, ptDist);
        float pulse = 0.5 + 0.5 * sin(u_time * 2.5 + ptNoise * 12.0);
        col += mix(vec3(0.95, 0.94, 0.91), vec3(0.776, 0.655, 0.416), ptNoise) * ptAlpha * pulse * 0.75;
    }

    col *= smoothstep(1.3, 0.2, length(p));
    gl_FragColor = vec4(col, 1.0);
}`;

    function createShader(type: number, src: string): WebGLShader | null {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("Shader compile error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) {
      setWebglSupported(false);
      return;
    }

    const prog = gl.createProgram();
    if (!prog) {
      setWebglSupported(false);
      return;
    }

    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(prog));
      setWebglSupported(false);
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    function syncSize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round((canvas.clientWidth || 1280) * dpr);
      const h = Math.round((canvas.clientHeight || 720) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    let animFrameId: number;
    let isDisposed = false;

    function render(timeMs: number) {
      if (isDisposed || !gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      const timeSec = prefersReducedMotion ? 1.0 : timeMs * 0.001;
      if (uTime) gl.uniform1f(uTime, timeSec);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!prefersReducedMotion) {
        animFrameId = requestAnimationFrame(render);
      }
    }

    animFrameId = requestAnimationFrame(render);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (gl) {
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, [interactive]);

  if (!webglSupported) {
    return (
      <div
        className={`w-full h-full bg-[#0E0E0E] flex items-center justify-center border border-[#222220] bg-architectural-grid ${className}`}
      >
        <div className="font-mono text-xs text-[#9A9A94] uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283]" />
          VEYRA OPTICAL SENSOR MATRIX
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-none select-none ${className}`}
      style={{ display: "block" }}
    />
  );
}
