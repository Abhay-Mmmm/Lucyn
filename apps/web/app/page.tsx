import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github, MessageSquare, BarChart3, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">L</span>
            </div>
            <span className="font-bold text-xl">Lucyn</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            The AI Product Engineer
            <br />
            <span className="text-primary">that works inside your company</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform engineering activity into actionable business insights. 
            Lucyn understands your code, your people, and your goals.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything you need to understand your engineering team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Github className="w-10 h-10" />}
                title="GitHub Integration"
                description="Automatically analyze commits, PRs, and code quality without manual reporting."
              />
              <FeatureCard
                icon={<MessageSquare className="w-10 h-10" />}
                title="Slack Feedback"
                description="Personalized tips and guidance delivered directly to developers."
              />
              <FeatureCard
                icon={<BarChart3 className="w-10 h-10" />}
                title="CEO Dashboard"
                description="Business-level insights into engineering health and velocity."
              />
              <FeatureCard
                icon={<Users className="w-10 h-10" />}
                title="Smart Assignments"
                description="AI-powered task suggestions based on skills and workload."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to transform your engineering team?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join forward-thinking companies using Lucyn to build better software.
            </p>
            <Link href="/signup">
              <Button size="lg">Get Started for Free</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 Lucyn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background rounded-lg p-6 border">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
