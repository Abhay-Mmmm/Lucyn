'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InteractiveBackground } from '@/components/background';
import { Check, ArrowRight, Github, MessageSquare, Users, Building2 } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Lucyn',
    subtitle: 'Let\'s get you set up in a few quick steps.',
  },
  {
    id: 'team',
    title: 'Tell us about your team',
    subtitle: 'This helps us personalize your experience.',
  },
  {
    id: 'integrations',
    title: 'Connect your tools',
    subtitle: 'Lucyn works best when connected to your workflow.',
  },
  {
    id: 'invite',
    title: 'Invite your team',
    subtitle: 'Collaboration is better together.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [teamSize, setTeamSize] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [connectedApps, setConnectedApps] = useState<string[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const toggleApp = (app: string) => {
    setConnectedApps((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
    );
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <InteractiveBackground />

      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center">
          <span className="font-display text-2xl tracking-tight text-foreground">Lucyn.</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleSkip}>
          Skip setup
        </Button>
      </header>

      {/* Progress bar */}
      <div className="px-6">
        <div className="max-w-md mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Step title */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-display font-semibold tracking-tight">
                  {steps[currentStep].title}
                </h1>
                <p className="text-muted-foreground">
                  {steps[currentStep].subtitle}
                </p>
              </div>

              {/* Step content */}
              <div className="surface-elevated rounded-xl p-8">
                {currentStep === 0 && (
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Check className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Your account is ready</h3>
                      <p className="text-sm text-muted-foreground">
                        Let's configure Lucyn to work perfectly for your team.
                      </p>
                    </div>
                    <div className="grid gap-3 text-left">
                      {[
                        'Real-time engineering insights',
                        'Automated code review feedback',
                        'Team velocity tracking',
                      ].map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Team size</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['1-5', '6-20', '21-50', '50+'].map((size) => (
                          <button
                            key={size}
                            onClick={() => setTeamSize(size)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                              teamSize === size
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-input hover:border-primary/50'
                            }`}
                          >
                            {size} people
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Your role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['CEO / Founder', 'CTO / VP Eng', 'Engineering Manager', 'Developer'].map((r) => (
                          <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                              role === r
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-input hover:border-primary/50'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    {[
                      { id: 'github', name: 'GitHub', icon: Github, description: 'Connect repositories' },
                      { id: 'discord', name: 'Discord', icon: MessageSquare, description: 'Send notifications' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        onClick={() => toggleApp(app.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          connectedApps.includes(app.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-input hover:border-primary/50'
                        }`}
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <app.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{app.name}</p>
                          <p className="text-sm text-muted-foreground">{app.description}</p>
                        </div>
                        {connectedApps.includes(app.id) && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Invite by email
                      </label>
                      <Input
                        type="text"
                        placeholder="colleague@company.com, another@company.com"
                        value={inviteEmails}
                        onChange={(e) => setInviteEmails(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple emails with commas
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button onClick={handleNext} className="flex-1 gap-2 group">
                  {currentStep === steps.length - 1 ? 'Go to dashboard' : 'Continue'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
