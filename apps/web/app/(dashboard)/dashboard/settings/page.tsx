'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Settings,
  Building2,
  Link2,
  Bell,
  Shield,
  Key,
  Users,
  CreditCard,
  ChevronRight,
  Check,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

// GitHub SVG Icon
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

// Google SVG Icon  
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Discord SVG Icon
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </svg>
);

const settingsSections = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'team', label: 'Team & Access', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories for code analysis and insights',
    icon: GitHubIcon,
    status: 'connected',
    connectedAs: 'acme-corp',
    lastSync: '2 minutes ago',
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Sign in with Google and sync calendar events',
    icon: GoogleIcon,
    status: 'connected',
    connectedAs: 'team@acme.com',
    lastSync: '5 minutes ago',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Collect developer feedback and run async standups',
    icon: DiscordIcon,
    status: 'disconnected',
    connectedAs: null,
    lastSync: null,
  },
];

const notifications = [
  {
    id: 'daily-digest',
    title: 'Daily Digest',
    description: 'Receive a morning summary of team activity and key metrics',
    enabled: true,
  },
  {
    id: 'risk-alerts',
    title: 'Risk Alerts',
    description: 'Immediate notifications for burnout risk or critical blockers',
    enabled: true,
  },
  {
    id: 'weekly-report',
    title: 'Weekly Report',
    description: 'Comprehensive engineering health report every Monday',
    enabled: false,
  },
  {
    id: 'pr-insights',
    title: 'PR Insights',
    description: 'Get notified about large PRs or stale reviews',
    enabled: true,
  },
  {
    id: 'velocity-updates',
    title: 'Velocity Updates',
    description: 'Weekly velocity trends and sprint performance',
    enabled: false,
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('organization');
  const [notificationState, setNotificationState] = useState(
    notifications.reduce((acc, n) => ({ ...acc, [n.id]: n.enabled }), {} as Record<string, boolean>)
  );

  const toggleNotification = (id: string) => {
    setNotificationState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization, integrations, and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Organization Section */}
          {activeSection === 'organization' && (
            <>
              <Card className="surface-elevated">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">Organization Details</h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Organization Name</label>
                      <Input defaultValue="Acme Corporation" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Domain</label>
                      <Input defaultValue="acme.com" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">Organization ID</label>
                      <div className="flex items-center gap-2">
                        <Input value="org_kf92hd7s8dhj" disabled className="font-mono text-sm" />
                        <Button variant="outline" size="sm">Copy</Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t flex justify-end">
                    <Button className="bg-foreground text-background hover:bg-foreground/90">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface-elevated">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">Sprint Configuration</h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sprint Duration</label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                        <option>1 week</option>
                        <option selected>2 weeks</option>
                        <option>3 weeks</option>
                        <option>4 weeks</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sprint Start Day</label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                        <option selected>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <Card className="surface-elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold text-lg">Connected Services</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your external integrations
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    const isConnected = integration.status === 'connected';
                    
                    return (
                      <div 
                        key={integration.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          isConnected ? 'border-border' : 'border-dashed border-border/60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-lg ${isConnected ? 'bg-foreground text-background' : 'bg-muted'}`}>
                            <Icon />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{integration.name}</h3>
                              {isConnected && (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" />
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                            {isConnected && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Connected as <span className="font-medium">{integration.connectedAs}</span> · Last sync {integration.lastSync}
                              </p>
                            )}
                          </div>
                          {isConnected ? (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                Configure
                              </Button>
                              <Button variant="ghost" size="sm" className="text-muted-foreground">
                                Disconnect
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <Card className="surface-elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold text-lg">Notification Preferences</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose how and when you want to be notified
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(notification.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                          notificationState[notification.id] 
                            ? 'bg-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <span 
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${
                            notificationState[notification.id] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team & Access Section */}
          {activeSection === 'team' && (
            <Card className="surface-elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold text-lg">Team Members</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage who has access to this organization
                    </p>
                  </div>
                  <Button className="bg-foreground text-background hover:bg-foreground/90">
                    Invite Member
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Owner', avatar: 'SC' },
                    { name: 'Marcus Johnson', email: 'marcus@acme.com', role: 'Admin', avatar: 'MJ' },
                    { name: 'Elena Rodriguez', email: 'elena@acme.com', role: 'Member', avatar: 'ER' },
                  ].map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {member.avatar}
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          member.role === 'Owner' ? 'bg-foreground text-background' :
                          member.role === 'Admin' ? 'bg-muted' : 'bg-muted/50'
                        }`}>
                          {member.role}
                        </span>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <>
              <Card className="surface-elevated">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">Security Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-1 rounded">
                          Enabled
                        </span>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Key className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">API Keys</h3>
                          <p className="text-sm text-muted-foreground">
                            Manage API keys for external integrations
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        Manage
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-200 dark:border-rose-900">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg text-rose-600 mb-4">Danger Zone</h2>
                  <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Delete Organization</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your organization and all data. This action cannot be undone.
                        </p>
                      </div>
                      <Button variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950">
                        Delete Organization
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Billing Section */}
          {activeSection === 'billing' && (
            <Card className="surface-elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold text-lg">Billing & Subscription</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your subscription and payment methods
                    </p>
                  </div>
                </div>
                <div className="p-6 rounded-lg border bg-gradient-to-br from-foreground/5 to-foreground/10 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Plan</span>
                      <h3 className="text-2xl font-semibold mt-1">Pro</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        $49/month · Up to 20 team members
                      </p>
                    </div>
                    <Button variant="outline">Upgrade Plan</Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next billing date</span>
                      <span className="font-medium">January 15, 2025</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Payment Method</h3>
                        <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h3 className="font-medium">Billing History</h3>
                      <p className="text-sm text-muted-foreground">View and download past invoices</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
