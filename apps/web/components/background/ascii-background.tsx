'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ASCII art patterns that will rotate
const asciiPatterns = [
  `
    ╭───────────────────────╮
    │  ┌──┐  ╔══╗  ◢◤◥◣   │
    │  │▓▓│  ║▒▒║  ◥◤◢◣   │
    │  └──┘  ╚══╝  ◣◢◤◥   │
    ╰───────────────────────╯
  `,
  `
    ◢◤◥◣◢◤◥◣◢◤◥◣
    ◥◤  ╔══╗  ◢◣
    ◣◢  ║░░║  ◤◥
    ◢◤◥◣◢◤◥◣◢◤◥◣
  `,
  `
    ┌─────────────────┐
    │ ▲   ▲   ▲   ▲  │
    │  ◆   ◆   ◆   ◆ │
    │ ▼   ▼   ▼   ▼  │
    └─────────────────┘
  `,
];

// Floating ASCII elements
const floatingElements = [
  { char: '◢◤', size: 'text-2xl' },
  { char: '◥◣', size: 'text-xl' },
  { char: '╔═╗', size: 'text-lg' },
  { char: '║░║', size: 'text-base' },
  { char: '╚═╝', size: 'text-lg' },
  { char: '┌─┐', size: 'text-base' },
  { char: '└─┘', size: 'text-base' },
  { char: '▓▓▓', size: 'text-sm' },
  { char: '░░░', size: 'text-sm' },
  { char: '◆◆◆', size: 'text-xs' },
  { char: '●○●', size: 'text-sm' },
  { char: '▲▼▲', size: 'text-xs' },
];

interface FloatingItem {
  id: number;
  char: string;
  size: string;
  x: number;
  y: number;
  rotation: number;
  duration: number;
  delay: number;
}

export function AsciiBackground() {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    // Generate random floating items
    const generateItems = () => {
      const count = 20;
      const newItems: FloatingItem[] = [];
      
      for (let i = 0; i < count; i++) {
        const element = floatingElements[Math.floor(Math.random() * floatingElements.length)];
        newItems.push({
          id: i,
          char: element.char,
          size: element.size,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360,
          duration: 20 + Math.random() * 40,
          delay: Math.random() * -20,
        });
      }
      
      setItems(newItems);
    };

    generateItems();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating ASCII elements */}
      {items.map((item) => (
        <motion.div
          key={item.id}
          className={`absolute font-mono ${item.size} text-foreground/[0.03] select-none`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
          }}
          animate={{
            rotate: [item.rotation, item.rotation + 360],
            y: [0, -30, 0, 30, 0],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: item.delay,
          }}
        >
          <pre className="leading-none">{item.char}</pre>
        </motion.div>
      ))}

      {/* Large rotating pattern in center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-foreground/[0.015] text-xs whitespace-pre select-none"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {asciiPatterns[0]}
      </motion.div>

      {/* Additional rotating patterns */}
      <motion.div
        className="absolute top-1/4 left-1/4 font-mono text-foreground/[0.02] text-xs whitespace-pre select-none"
        animate={{
          rotate: [0, -360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {asciiPatterns[1]}
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-1/4 font-mono text-foreground/[0.02] text-xs whitespace-pre select-none"
        animate={{
          rotate: [360, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 90,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {asciiPatterns[2]}
      </motion.div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
