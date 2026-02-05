import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import DashboardLayout from '@/client/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/Card';

type DashboardStats = {
  totalIssues: number;
  pendingIssues: number;
  assignedIssues: number;
  fixedIssues: number;
  highPriority: number;
  byCategory: Record<string, number>;
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    ...modelenceQuery<DashboardStats>('fixnet.getDashboardStats'),
  });

  return (
    <DashboardLayout title="Admin Dashboard" isLoading={isLoading}>
      {stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Issues"
              value={stats.totalIssues}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              bgColor="bg-primary-100"
              textColor="text-primary-600"
            />
            <StatCard
              title="Pending"
              value={stats.pendingIssues}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              bgColor="bg-yellow-100"
              textColor="text-yellow-600"
            />
            <StatCard
              title="In Progress"
              value={stats.assignedIssues}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              bgColor="bg-blue-100"
              textColor="text-blue-600"
            />
            <StatCard
              title="Resolved"
              value={stats.fixedIssues}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              bgColor="bg-green-100"
              textColor="text-green-600"
            />
          </div>

          {/* High Priority Alert */}
          {stats.highPriority > 0 && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">High Priority Issues</h3>
                    <p className="text-sm text-red-600">
                      {stats.highPriority} issue{stats.highPriority !== 1 ? 's' : ''} require{stats.highPriority === 1 ? 's' : ''} immediate attention
                    </p>
                  </div>
                  <Link to="/admin/issues" className="ml-auto">
                    <button className="text-sm text-red-700 font-medium hover:underline">
                      View All
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issues by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{category}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/admin/issues">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manage Issues</h3>
                    <p className="text-sm text-gray-600">View, assign, and update all issues</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/map">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Map View</h3>
                    <p className="text-sm text-gray-600">See all issues on the map</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center ${textColor}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
