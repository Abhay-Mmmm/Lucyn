'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MoreHorizontal,
  GitCommit,
  GitPullRequest,
  Eye,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// Realistic team data
const teamMembers = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@acme.com',
    role: 'Senior Engineer',
    avatar: null,
    commits: 23,
    prs: 5,
    reviews: 12,
    trend: 15,
    workload: 75,
    status: 'active',
    skills: ['TypeScript', 'React', 'Node.js'],
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus@acme.com',
    role: 'Engineer',
    avatar: null,
    commits: 18,
    prs: 4,
    reviews: 8,
    trend: 8,
    workload: 85,
    status: 'busy',
    skills: ['Python', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena@acme.com',
    role: 'Engineer',
    avatar: null,
    commits: 15,
    prs: 3,
    reviews: 15,
    trend: -5,
    workload: 45,
    status: 'active',
    skills: ['Go', 'Kubernetes', 'AWS'],
  },
  {
    id: '4',
    name: 'James Park',
    email: 'james@acme.com',
    role: 'Junior Engineer',
    avatar: null,
    commits: 12,
    prs: 2,
    reviews: 6,
    trend: 25,
    workload: 55,
    status: 'active',
    skills: ['JavaScript', 'Vue.js', 'MongoDB'],
  },
  {
    id: '5',
    name: 'Aisha Patel',
    email: 'aisha@acme.com',
    role: 'Senior Engineer',
    avatar: null,
    commits: 21,
    prs: 6,
    reviews: 18,
    trend: 10,
    workload: 70,
    status: 'active',
    skills: ['Rust', 'WebAssembly', 'C++'],
  },
];

const teamStats = {
  totalMembers: 5,
  activeThisWeek: 5,
  avgCommits: 17.8,
  avgReviews: 11.8,
};

export default function TeamPage() {
  const [search, setSearch] = useState('');

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Monitor individual contributions and workload
          </p>
        </div>
        <Button>Invite member</Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Members" value={teamStats.totalMembers} />
        <StatCard label="Active This Week" value={teamStats.activeThisWeek} />
        <StatCard label="Avg Commits" value={teamStats.avgCommits.toFixed(1)} />
        <StatCard label="Avg Reviews" value={teamStats.avgReviews.toFixed(1)} />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team list */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <div className="flex items-center p-6 gap-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar || undefined} />
                <AvatarFallback>
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{member.name}</h3>
                  <Badge 
                    variant={member.status === 'busy' ? 'warning' : 'success'}
                    className="capitalize"
                  >
                    {member.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <div className="flex gap-2 mt-2">
                  {member.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-8">
                <MetricItem 
                  icon={<GitCommit className="h-4 w-4" />}
                  value={member.commits}
                  label="commits"
                />
                <MetricItem 
                  icon={<GitPullRequest className="h-4 w-4" />}
                  value={member.prs}
                  label="PRs"
                />
                <MetricItem 
                  icon={<Eye className="h-4 w-4" />}
                  value={member.reviews}
                  label="reviews"
                />
              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm">
                {member.trend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={member.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {member.trend >= 0 ? '+' : ''}{member.trend}%
                </span>
              </div>

              <div className="hidden md:block w-32">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Workload</span>
                  <span>{member.workload}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      member.workload > 80 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${member.workload}%` }}
                  />
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No team members found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricItem({ 
  icon, 
  value, 
  label 
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
