'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'SUGGESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  suggestedFor?: {
    name: string;
    avatar?: string;
  };
  estimatedHours?: number;
  dueDate?: string;
  matchReason?: string;
}

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication flow',
    description: 'Add OAuth support for GitHub and Google login',
    priority: 'HIGH',
    status: 'SUGGESTED',
    suggestedFor: { name: 'Alex Chen' },
    estimatedHours: 8,
    matchReason: 'Has experience with auth systems and available capacity',
  },
  {
    id: '2',
    title: 'Fix memory leak in data pipeline',
    description: 'Memory usage increases over time in the ETL process',
    priority: 'HIGH',
    status: 'ASSIGNED',
    suggestedFor: { name: 'Sarah Kim' },
    estimatedHours: 4,
    matchReason: 'Previously fixed similar issues in this codebase',
  },
  {
    id: '3',
    title: 'Add unit tests for payment module',
    description: 'Increase test coverage from 60% to 80%',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    suggestedFor: { name: 'Mike Johnson' },
    estimatedHours: 12,
  },
  {
    id: '4',
    title: 'Update API documentation',
    description: 'Document new endpoints added in v2.0',
    priority: 'LOW',
    status: 'SUGGESTED',
    suggestedFor: { name: 'Emily Davis' },
    estimatedHours: 3,
    matchReason: 'Has written excellent documentation in the past',
  },
  {
    id: '5',
    title: 'Optimize database queries',
    description: 'Reduce average query time for dashboard endpoints',
    priority: 'MEDIUM',
    status: 'SUGGESTED',
    suggestedFor: { name: 'Alex Chen' },
    estimatedHours: 6,
    matchReason: 'Strong database expertise and current bandwidth',
  },
];

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'LOW':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'SUGGESTED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'ASSIGNED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'IN_PROGRESS':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function TasksPage() {
  const [filter, setFilter] = useState<string>('all');

  const filteredTasks =
    filter === 'all'
      ? mockTasks
      : mockTasks.filter((task) => task.status === filter);

  const stats = {
    suggested: mockTasks.filter((t) => t.status === 'SUGGESTED').length,
    assigned: mockTasks.filter((t) => t.status === 'ASSIGNED').length,
    inProgress: mockTasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completed: mockTasks.filter((t) => t.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Assignment</h1>
        <p className="text-muted-foreground">
          AI-powered task suggestions based on developer skills and availability
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suggested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.suggested}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'SUGGESTED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('SUGGESTED')}
        >
          Suggested
        </Button>
        <Button
          variant={filter === 'ASSIGNED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ASSIGNED')}
        >
          Assigned
        </Button>
        <Button
          variant={filter === 'IN_PROGRESS' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('IN_PROGRESS')}
        >
          In Progress
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>

                  {task.suggestedFor && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-sm text-muted-foreground">Suggested for:</span>
                      <span className="text-sm font-medium">{task.suggestedFor.name}</span>
                    </div>
                  )}

                  {task.matchReason && (
                    <p className="text-xs text-muted-foreground italic">
                      💡 {task.matchReason}
                    </p>
                  )}
                </div>

                <div className="text-right space-y-2">
                  {task.estimatedHours && (
                    <p className="text-sm text-muted-foreground">
                      Est. {task.estimatedHours}h
                    </p>
                  )}
                  {task.status === 'SUGGESTED' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Reassign
                      </Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
