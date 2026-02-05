import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Lucyn',
  description: 'Privacy Policy for Lucyn',
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: February 4, 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Lucyn, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and 
                safeguard your information when you use our AI-powered product engineering platform ("Service").
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using the Service, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-foreground mt-6">2.1 Information You Provide</h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">Account Information:</strong> Name, email address, password, organization name</li>
                <li><strong className="text-foreground">Profile Information:</strong> Job title, team role, avatar, preferences</li>
                <li><strong className="text-foreground">Payment Information:</strong> Billing address, payment method (processed securely through third-party providers)</li>
                <li><strong className="text-foreground">Communications:</strong> Feedback, support requests, survey responses</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">2.2 Information Collected Automatically</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you use the Service, we automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">Usage Data:</strong> Pages viewed, features used, time spent, click patterns</li>
                <li><strong className="text-foreground">Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong className="text-foreground">Log Data:</strong> Access times, error logs, system activity</li>
                <li><strong className="text-foreground">Cookies and Tracking:</strong> Session cookies, analytics cookies, preference cookies</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6">2.3 Information from Third-Party Services</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you connect third-party services (GitHub, Discord, Google), we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">GitHub:</strong> Repository data, commit history, pull requests, code reviews, contributor information</li>
                <li><strong className="text-foreground">Discord:</strong> Server information, channel data, user messages (with consent), bot interactions</li>
                <li><strong className="text-foreground">Google:</strong> Profile information, email address, calendar data (with consent), authentication tokens</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>To provide, maintain, and improve the Service</li>
                <li>To process transactions and send related information</li>
                <li>To send technical notices, updates, and security alerts</li>
                <li>To respond to your comments, questions, and customer service requests</li>
                <li>To generate AI-powered insights and recommendations</li>
                <li>To monitor usage patterns and analyze trends</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To personalize your experience and provide relevant content</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Data Processing and AI</h2>
              <p className="text-muted-foreground leading-relaxed">
                Lucyn uses artificial intelligence and machine learning to analyze your engineering data and provide insights. 
                This processing includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Analyzing code commits, pull requests, and reviews to identify patterns</li>
                <li>Processing team communication data to generate productivity insights</li>
                <li>Creating predictive models for team health and project outcomes</li>
                <li>Generating automated recommendations and alerts</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Your data is processed within secure, isolated environments. We do not use your data to train models that 
                benefit other customers or share your proprietary information with third parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">With Your Consent:</strong> When you explicitly authorize us to share information</li>
                <li><strong className="text-foreground">Service Providers:</strong> With vendors who perform services on our behalf (hosting, analytics, payment processing)</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> To comply with laws, regulations, legal processes, or government requests</li>
                <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong className="text-foreground">Protection:</strong> To protect the rights, property, or safety of Lucyn, our users, or others</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Encryption of data in transit (TLS/SSL) and at rest (AES-256)</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers with physical security measures</li>
                <li>Employee training on data protection and privacy</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                While we strive to protect your information, no security system is impenetrable. We cannot guarantee the 
                absolute security of your data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information for as long as necessary to provide the Service and fulfill the purposes outlined 
                in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information 
                within 90 days, except where we are required to retain it for legal, accounting, or security purposes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Aggregated or anonymized data that cannot identify you may be retained indefinitely for analytics and 
                improvement purposes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">Access:</strong> Request a copy of your personal information</li>
                <li><strong className="text-foreground">Correction:</strong> Update or correct inaccurate information</li>
                <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal information</li>
                <li><strong className="text-foreground">Portability:</strong> Request your data in a portable format</li>
                <li><strong className="text-foreground">Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong className="text-foreground">Restriction:</strong> Request limitation of processing</li>
                <li><strong className="text-foreground">Objection:</strong> Object to certain types of processing</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@lucyn.dev. We will respond to your request within 
                30 days.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to collect and track information about your use of the Service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">Essential Cookies:</strong> Required for the Service to function (authentication, security)</li>
                <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how you use the Service</li>
                <li><strong className="text-foreground">Preference Cookies:</strong> Remember your settings and choices</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookies through your browser settings. Note that disabling certain cookies may limit your 
                ability to use some features of the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                These countries may have data protection laws that differ from those of your country.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When we transfer your information internationally, we take steps to ensure appropriate safeguards are in 
                place, such as standard contractual clauses approved by regulatory authorities.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">11. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal 
                information from children. If you are a parent or guardian and believe your child has provided us with 
                personal information, please contact us so we can delete it.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We encourage you to review this Privacy Policy periodically. Your continued use of the Service after changes 
                are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                <p className="text-foreground">Email: privacy@lucyn.dev</p>
                <p className="text-foreground">Data Protection Officer: dpo@lucyn.dev</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">14. Additional Information for EU Users</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the European Economic Area (EEA), you have additional rights under the General Data 
                Protection Regulation (GDPR), including the right to lodge a complaint with a supervisory authority.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our lawful basis for processing your personal information includes: performance of a contract, legitimate 
                interests, consent, and compliance with legal obligations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">15. California Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), 
                including the right to know what personal information we collect, use, and share, and the right to request 
                deletion of your personal information.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information and will not discriminate against you for exercising your privacy rights.
              </p>
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
