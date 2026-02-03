import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, MessageSquare, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization and integrations
        </p>
      </div>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" defaultValue="Acme Inc" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" defaultValue="acme.com" />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect external services to enhance Lucyn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrationRow
            icon={<Github className="w-5 h-5" />}
            name="GitHub"
            description="Connect repositories for code analysis"
            isConnected={true}
          />
          <IntegrationRow
            icon={<MessageSquare className="w-5 h-5" />}
            name="Discord"
            description="Enable developer feedback and notifications"
            isConnected={false}
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive updates from Lucyn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationRow
            title="Daily Digest"
            description="Receive a daily summary of team activity"
            defaultChecked={true}
          />
          <NotificationRow
            title="Risk Alerts"
            description="Get notified about potential burnout or blockers"
            defaultChecked={true}
          />
          <NotificationRow
            title="Weekly Reports"
            description="Receive weekly engineering health reports"
            defaultChecked={false}
          />
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage security settings and access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">API Keys</p>
              <p className="text-sm text-muted-foreground">
                Manage API keys for external integrations
              </p>
            </div>
            <Button variant="outline">Manage</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div>
              <p className="font-medium">Delete Organization</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your organization and all data
              </p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationRow({
  icon,
  name,
  description,
  isConnected,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  isConnected: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-lg">{icon}</div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-500">Connected</span>
          <Button variant="outline" size="sm">
            Disconnect
          </Button>
        </div>
      ) : (
        <Button size="sm">Connect</Button>
      )}
    </div>
  );
}

function NotificationRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-5 rounded border-gray-300"
      />
    </div>
  );
}
