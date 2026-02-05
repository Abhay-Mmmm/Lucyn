'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Use Cases', href: '#use-cases' },
  { name: 'Contact', href: '#contact' },
];

export function DynamicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Smooth scroll progress for animation
  const scrollProgress = useMotionValue(0);
  const springProgress = useSpring(scrollProgress, { stiffness: 100, damping: 30, mass: 1 });
  
  // Transform values based on scroll
  const navPadding = useTransform(springProgress, [0, 1], [24, 16]);
  const navHeight = useTransform(springProgress, [0, 1], [64, 56]);
  const navRadius = useTransform(springProgress, [0, 1], [0, 9999]);
  const navMarginTop = useTransform(springProgress, [0, 1], [0, 16]);
  const navBlur = useTransform(springProgress, [0, 1], [4, 24]);
  const navOpacity = useTransform(springProgress, [0, 1], [0.8, 0.85]);
  
  // Derived transform values for style properties
  const navBackdrop = useTransform(navBlur, (v) => `blur(${v}px)`);
  const navBg = useTransform(navOpacity, (v) => `hsl(var(--background) / ${v})`);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newIsScrolled = scrollY > 50;
      setIsScrolled(newIsScrolled);
      scrollProgress.set(newIsScrolled ? 1 : 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgress]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const element = document.querySelector(href);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.nav
          className="flex items-center justify-between pointer-events-auto border border-transparent w-full max-w-7xl"
          style={{
            height: navHeight,
            paddingLeft: navPadding,
            paddingRight: navPadding,
            borderRadius: navRadius,
            marginTop: navMarginTop,
            backdropFilter: navBackdrop,
            backgroundColor: navBg,
            borderColor: isScrolled ? 'hsl(var(--border) / 0.4)' : 'transparent',
            borderBottomColor: 'hsl(var(--border) / 0.3)',
            boxShadow: isScrolled ? '0 10px 40px -10px rgba(0, 0, 0, 0.1)' : 'none',
          }}
          animate={{
            maxWidth: isScrolled ? 600 : 1280,
          }}
          transition={{
            duration: 0.7,
            ease: [0.33, 1, 0.68, 1],
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0"
            onClick={(e) => handleNavClick(e, '#home')}
          >
            <span
              className={`font-display tracking-tight text-foreground transition-[font-size] duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                isScrolled ? 'text-xl' : 'text-2xl'
              }`}
            >
              Lucyn.
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-full hover:bg-muted/50 ${
                    isScrolled ? 'px-3 py-1.5' : ''
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center shrink-0">
            <Link href="/signup">
              <Button
                size={isScrolled ? 'sm' : 'default'}
                className={`rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-500 ${
                  isScrolled ? 'h-9 px-5 text-sm' : 'h-10 px-6'
                }`}
              >
                Get started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-muted/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </motion.nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-20 z-40 md:hidden"
          >
            <div className="mx-4 p-4 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/40 shadow-xl">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-2 border-t border-border/40 mt-2">
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                      Get started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
