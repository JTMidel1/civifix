import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import DashboardLayout from '@/client/components/DashboardLayout';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent } from '@/client/components/ui/Card';
import { cn } from '@/client/lib/utils';

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
  assignedTo: string | null;
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

export default function CitizenDashboardPage() {
  const { data: issues, isLoading } = useQuery({
    ...modelenceQuery<Issue[]>('fixnet.getMyIssues'),
  });

  return (
    <DashboardLayout title="My Reports" isLoading={isLoading}>
      {/* Report Button */}
      <div className="mb-6">
        <Link to="/report">
          <Button className="bg-forest-600 hover:bg-forest-700 text-white">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Issues List */}
      {issues && issues.length > 0 ? (
        <div className="space-y-4">
          {issues.map((issue) => (
            <Link key={issue._id} to={`/issue/${issue._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                        <h3 className="font-semibold text-gray-900 truncate">{issue.title}</h3>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[issue.status])}>
                          {issue.status}
                        </span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", priorityColors[issue.priority])}>
                          {issue.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {issue.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Photo thumbnail */}
                    {issue.photo && (
                      <div className="flex-shrink-0">
                        <img
                          src={issue.photo}
                          alt="Issue"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-600 mb-4">You haven't reported any infrastructure issues yet.</p>
            <Link to="/report">
              <Button className="bg-forest-600 hover:bg-forest-700 text-white">
                Report Your First Issue
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
