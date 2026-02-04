'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AsciiBackground } from '@/components/background';
import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  'Real-time engineering insights',
  'Automated code review feedback',
  'Team velocity tracking',
  'GitHub & Discord integration',
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Animated cursor path for dashboard demo
const cursorPath = [
  { x: 100, y: 50, delay: 0 },
  { x: 200, y: 80, delay: 0.8 },
  { x: 350, y: 120, delay: 1.6 },
  { x: 280, y: 200, delay: 2.4 },
  { x: 150, y: 280, delay: 3.2 },
  { x: 400, y: 250, delay: 4.0 },
  { x: 300, y: 320, delay: 4.8 },
  { x: 100, y: 50, delay: 5.6 },
];

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <AsciiBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-display text-2xl tracking-tight text-foreground">Lucyn.</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center space-y-8"
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.div variants={fadeIn}>
              <span className="inline-flex items-center rounded-full border border-border/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
                Built for engineering leaders
              </span>
            </motion.div>
            
            <motion.h1
              variants={fadeIn}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-balance leading-[1.1]"
            >
              The AI Product Engineer
              <br />
              <span className="text-muted-foreground">inside your company</span>
            </motion.h1>
            
            <motion.p
              variants={fadeIn}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed"
            >
              Lucyn transforms engineering activity into actionable insights.
              Understand your team, your code, and your progress—automatically.
            </motion.p>
            
            {/* Bigger, more prominent buttons */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="h-14 px-10 text-lg gap-3 group rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  Start free trial
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 px-10 text-lg rounded-full border-border/50 hover:bg-muted"
                >
                  Sign in
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-20 grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
          >
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-muted-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview with animated cursor */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-28 px-6"
        >
          <div className="max-w-5xl mx-auto">
            <div className="relative surface-elevated rounded-2xl p-2 bg-gradient-to-b from-muted/30 to-background border border-border/50">
              <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                {/* Browser chrome */}
                <div className="h-10 bg-muted/30 flex items-center gap-2 px-4 border-b border-border/50">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500/60" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-6 w-64 rounded-md bg-muted/50 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground font-mono">app.lucyn.dev/dashboard</span>
                    </div>
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="relative p-6 min-h-[420px] bg-background">
                  {/* Sidebar */}
                  <div className="absolute left-0 top-0 bottom-0 w-48 border-r border-border/30 p-4">
                    <div className="font-display text-lg mb-6 text-foreground">Lucyn.</div>
                    <div className="space-y-1">
                      {['Overview', 'Team', 'Repositories', 'Insights'].map((item, i) => (
                        <div 
                          key={item} 
                          className={`h-8 px-3 rounded-md flex items-center text-sm ${
                            i === 0 ? 'bg-muted text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Main content */}
                  <div className="ml-52 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Good morning, Sarah</h3>
                        <p className="text-sm text-muted-foreground">Here's what's happening with your team</p>
                      </div>
                      <div className="h-9 px-4 rounded-md bg-foreground text-background text-sm flex items-center">
                        View Report
                      </div>
                    </div>
                    
                    {/* Stats cards */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Team Health', value: '94%', trend: '+5%' },
                        { label: 'Sprint Progress', value: '67%', trend: 'On track' },
                        { label: 'Active PRs', value: '12', trend: '3 need review' },
                      ].map((stat) => (
                        <div key={stat.label} className="p-4 rounded-lg border border-border/50 bg-card">
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Team activity */}
                    <div className="p-4 rounded-lg border border-border/50 bg-card">
                      <h4 className="text-sm font-medium text-foreground mb-4">Recent Activity</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Marcus J.', action: 'merged PR #342', time: '2m ago' },
                          { name: 'Elena R.', action: 'completed code review', time: '15m ago' },
                          { name: 'James P.', action: 'opened issue #89', time: '1h ago' },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-foreground">
                              {activity.name.split(' ')[0][0]}{activity.name.split(' ')[1][0]}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">
                                <span className="font-medium">{activity.name}</span>{' '}
                                <span className="text-muted-foreground">{activity.action}</span>
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Animated cursor */}
                  <motion.div
                    className="absolute z-20 pointer-events-none"
                    initial={{ x: cursorPath[0].x, y: cursorPath[0].y, opacity: 0 }}
                    animate={{
                      x: cursorPath.map(p => p.x),
                      y: cursorPath.map(p => p.y),
                      opacity: [0, 1, 1, 1, 1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      times: cursorPath.map((_, i) => i / (cursorPath.length - 1)),
                    }}
                  >
                    {/* Cursor SVG */}
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      className="drop-shadow-lg"
                    >
                      <path 
                        d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z" 
                        fill="white"
                        stroke="black"
                        strokeWidth="1.5"
                      />
                    </svg>
                    {/* Click effect */}
                    <motion.div
                      className="absolute -inset-2 rounded-full bg-foreground/20"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg text-foreground">Lucyn.</span>
            <span className="text-sm text-muted-foreground">© 2026 All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
