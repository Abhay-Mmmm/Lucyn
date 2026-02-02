import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Mock team data
const mockTeam = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@company.com',
    role: 'Senior Engineer',
    avatarUrl: null,
    stats: {
      commits: 45,
      prs: 12,
      reviews: 28,
    },
    workload: 85,
    status: 'overloaded',
    skills: ['TypeScript', 'React', 'Node.js'],
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'Engineer',
    avatarUrl: null,
    stats: {
      commits: 32,
      prs: 8,
      reviews: 15,
    },
    workload: 60,
    status: 'balanced',
    skills: ['Python', 'Django', 'PostgreSQL'],
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike@company.com',
    role: 'Engineer',
    avatarUrl: null,
    stats: {
      commits: 28,
      prs: 6,
      reviews: 22,
    },
    workload: 55,
    status: 'balanced',
    skills: ['Go', 'Kubernetes', 'AWS'],
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@company.com',
    role: 'Junior Engineer',
    avatarUrl: null,
    stats: {
      commits: 18,
      prs: 4,
      reviews: 8,
    },
    workload: 35,
    status: 'underutilized',
    skills: ['JavaScript', 'React', 'CSS'],
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground">
          View and manage your engineering team
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{mockTeam.length}</div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">
              {mockTeam.filter((m) => m.status === 'balanced').length}
            </div>
            <div className="text-sm text-muted-foreground">Balanced Workload</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-500">
              {mockTeam.filter((m) => m.status === 'overloaded').length}
            </div>
            <div className="text-sm text-muted-foreground">At Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Click on a member to view their detailed profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeam.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamMemberCard({ member }: { member: typeof mockTeam[0] }) {
  const statusColors = {
    balanced: 'bg-green-500',
    overloaded: 'bg-yellow-500',
    underutilized: 'bg-blue-500',
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
      <Avatar className="w-12 h-12">
        <AvatarImage src={member.avatarUrl || undefined} />
        <AvatarFallback>
          {member.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{member.name}</h4>
          <span className={`w-2 h-2 rounded-full ${statusColors[member.status as keyof typeof statusColors]}`} />
        </div>
        <p className="text-sm text-muted-foreground">{member.role}</p>
        <div className="flex gap-1 mt-1">
          {member.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div className="hidden md:flex gap-6 text-center">
        <div>
          <div className="font-medium">{member.stats.commits}</div>
          <div className="text-xs text-muted-foreground">Commits</div>
        </div>
        <div>
          <div className="font-medium">{member.stats.prs}</div>
          <div className="text-xs text-muted-foreground">PRs</div>
        </div>
        <div>
          <div className="font-medium">{member.stats.reviews}</div>
          <div className="text-xs text-muted-foreground">Reviews</div>
        </div>
      </div>

      <div className="w-32 hidden lg:block">
        <div className="flex justify-between text-sm mb-1">
          <span>Workload</span>
          <span>{member.workload}%</span>
        </div>
        <Progress value={member.workload} className="h-2" />
      </div>
    </div>
  );
}

// Badge component for skills
function Badge({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'secondary'; 
  className?: string;
}) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
