import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Lucyn',
  description: 'Terms of Service for Lucyn',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-display text-2xl tracking-tight text-foreground">Lucyn.</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: February 4, 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Lucyn ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Lucyn is an AI-powered product engineering platform that provides insights, analytics, and automation 
                for software development teams. The Service includes but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Engineering metrics and analytics</li>
                <li>Team productivity insights</li>
                <li>GitHub and Discord integrations</li>
                <li>AI-generated recommendations</li>
                <li>Automated code review feedback</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account with us, you must provide accurate, complete, and current information. 
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of 
                your account.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for safeguarding the password and for all activities that occur under your account. 
                You agree not to disclose your password to any third party and to notify us immediately upon becoming 
                aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the intellectual property rights of others</li>
                <li>Transmit any malicious code, viruses, or harmful components</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service to compete with or create a similar product</li>
                <li>Scrape, copy, or misuse data from the Service</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are owned by Lucyn and are protected 
                by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You retain all rights to your data and content that you upload, submit, or display on or through the Service 
                ("User Content"). By providing User Content, you grant us a worldwide, non-exclusive, royalty-free license 
                to use, reproduce, and process such content solely for the purpose of providing the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Data Privacy and Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We take data privacy and security seriously. Our collection and use of personal information is described in 
                our <Link href="/privacy" className="text-foreground underline hover:text-foreground/80">Privacy Policy</Link>. 
                By using the Service, you acknowledge that you have read and understood our Privacy Policy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data. However, no method of transmission 
                over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Subscription and Payment</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring 
                basis (monthly, annually, etc.) depending on your subscription plan.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All fees are exclusive of taxes, and you are responsible for payment of all applicable taxes. We reserve 
                the right to change our subscription fees upon reasonable notice.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your subscription at any time. Upon cancellation, you will continue to have access to the 
                Service until the end of your current billing period. No refunds will be provided for partial billing periods.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Third-Party Integrations</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service may contain links to third-party websites or services (such as GitHub, Discord, Google) that are 
                not owned or controlled by Lucyn. We have no control over, and assume no responsibility for, the content, 
                privacy policies, or practices of any third-party services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by your 
                use of any third-party services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by applicable law, in no event shall Lucyn, its directors, employees, 
                partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible 
                losses, resulting from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either 
                express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free, or that 
                any defects will be corrected.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or 
                liability, for any reason, including if you breach these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which 
                by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, 
                indemnity, and limitations of liability.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without 
                regard to its conflict of law provisions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is 
                material, we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By continuing to access or use the Service after those revisions become effective, you agree to be bound by 
                the revised terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <p className="text-foreground">Email: legal@lucyn.dev</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
