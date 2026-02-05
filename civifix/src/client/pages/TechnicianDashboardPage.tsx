import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import DashboardLayout from '@/client/components/DashboardLayout';
import { Card, CardContent } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { cn } from '@/client/lib/utils';
import { toast } from 'react-hot-toast';

type Issue = {
  _id: string;
  title: string;
  description: string;
  category: string;
  photo: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
  reporterName: string;
  createdAt: Date;
  updatedAt: Date;
};

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Assigned: 'bg-blue-100 text-blue-800',
  Fixed: 'bg-green-100 text-green-800',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-orange-100 text-orange-800',
  High: 'bg-red-100 text-red-800',
};

const categoryIcons: Record<string, React.ReactNode> = {
  Road: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  Water: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  Power: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Waste: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Other: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
};

export default function TechnicianDashboardPage() {
  const queryClient = useQueryClient();
  const [markingFixed, setMarkingFixed] = useState<string | null>(null);

  const { data: issues, isLoading } = useQuery({
    ...modelenceQuery<Issue[]>('fixnet.getAssignedIssues'),
  });

  const { mutate: markFixed, isPending: isMarkingFixed } = useMutation({
    ...modelenceMutation('fixnet.markIssueFixed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getAssignedIssues') });
      toast.success('Issue marked as fixed!');
      setMarkingFixed(null);
    },
    onError: (error) => {
      toast.error((error as Error).message);
      setMarkingFixed(null);
    },
  });

  const activeIssues = issues?.filter((i) => i.status !== 'Fixed') || [];
  const completedIssues = issues?.filter((i) => i.status === 'Fixed') || [];

  const handleMarkFixed = (issueId: string) => {
    setMarkingFixed(issueId);
    markFixed({ issueId });
  };

  return (
    <DashboardLayout title="My Assigned Issues" isLoading={isLoading}>
      {/* Active Issues */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Active ({activeIssues.length})
        </h2>

        {activeIssues.length > 0 ? (
          <div className="space-y-4">
            {activeIssues.map((issue) => (
              <Card key={issue._id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Category Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        {categoryIcons[issue.category] || categoryIcons['Other']}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link to={`/issue/${issue._id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                          {issue.title}
                        </Link>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", priorityColors[issue.priority])}>
                          {issue.priority}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>Reported by: {issue.reporterName}</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 sm:flex-shrink-0">
                      <Link to={`/issue/${issue._id}`}>
                        <Button variant="outline" size="sm" className="w-full text-forest-700 border-forest-300 hover:bg-forest-50">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="bg-forest-600 hover:bg-forest-700 text-white"
                        onClick={() => handleMarkFixed(issue._id)}
                        disabled={isMarkingFixed && markingFixed === issue._id}
                      >
                        {isMarkingFixed && markingFixed === issue._id ? 'Marking...' : 'Mark as Fixed'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">You have no active issues assigned to you.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Issues */}
      {completedIssues.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Completed ({completedIssues.length})
          </h2>

          <div className="space-y-4 opacity-75">
            {completedIssues.map((issue) => (
              <Card key={issue._id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link to={`/issue/${issue._id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                          {issue.title}
                        </Link>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors['Fixed'])}>
                          Fixed
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {issue.category}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Completed on {new Date(issue.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Link to={`/issue/${issue._id}`}>
                      <Button variant="ghost" size="sm" className="text-forest-700 hover:text-forest-900 hover:bg-forest-50">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
