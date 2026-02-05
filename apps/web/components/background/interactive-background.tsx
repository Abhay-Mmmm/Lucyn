'use client';

import { useEffect, useRef, useCallback } from 'react';

interface GridPoint {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<GridPoint[][]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();

  const gridSpacing = 40;
  const warpRadius = 150;
  const warpStrength = 25;

  const initGrid = useCallback((width: number, height: number) => {
    const cols = Math.ceil(width / gridSpacing) + 1;
    const rows = Math.ceil(height / gridSpacing) + 1;
    const grid: GridPoint[][] = [];

    for (let row = 0; row < rows; row++) {
      grid[row] = [];
      for (let col = 0; col < cols; col++) {
        const x = col * gridSpacing;
        const y = row * gridSpacing;
        grid[row][col] = {
          x,
          y,
          originalX: x,
          originalY: y,
        };
      }
    }

    gridRef.current = grid;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const grid = gridRef.current;
    const mouse = mouseRef.current;

    ctx.clearRect(0, 0, width, height);

    // Update grid points based on mouse position
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const point = grid[row][col];
        const dx = point.originalX - mouse.x;
        const dy = point.originalY - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < warpRadius) {
          // Warp effect - push away from mouse with smooth falloff
          const factor = Math.pow(1 - distance / warpRadius, 2) * warpStrength;
          const angle = Math.atan2(dy, dx);
          point.x = point.originalX + Math.cos(angle) * factor;
          point.y = point.originalY + Math.sin(angle) * factor;
        } else {
          // Smooth return to original position
          point.x += (point.originalX - point.x) * 0.1;
          point.y += (point.originalY - point.y) * 0.1;
        }
      }
    }

    // Draw the grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;

    // Draw horizontal lines
    for (let row = 0; row < grid.length; row++) {
      ctx.beginPath();
      for (let col = 0; col < grid[row].length; col++) {
        const point = grid[row][col];
        if (col === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    }

    // Draw vertical lines
    for (let col = 0; col < grid[0].length; col++) {
      ctx.beginPath();
      for (let row = 0; row < grid.length; row++) {
        const point = grid[row][col];
        if (row === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    }

    // Draw intersection points with glow near mouse
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const point = grid[row][col];
        const dx = point.x - mouse.x;
        const dy = point.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < warpRadius * 1.5) {
          const brightness = Math.max(0.1, 1 - distance / (warpRadius * 1.5));
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
          ctx.fill();
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid(canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initGrid, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      aria-hidden="true"
    />
  );
}
