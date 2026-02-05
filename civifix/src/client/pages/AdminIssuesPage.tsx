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
  reportedBy: string;
  reporterName: string;
  assignedTo: string | null;
  technicianName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Technician = {
  _id: string;
  name: string;
  phone: string;
  specialty: string;
  available: boolean;
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

export default function AdminIssuesPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { data: issues, isLoading } = useQuery({
    ...modelenceQuery<Issue[]>('fixnet.getAllIssues'),
  });

  const { data: technicians } = useQuery({
    ...modelenceQuery<Technician[]>('fixnet.getTechnicians'),
  });

  const { mutate: assignTechnician } = useMutation({
    ...modelenceMutation('fixnet.assignTechnician'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getAllIssues') });
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getDashboardStats') });
      toast.success('Technician assigned successfully');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const { mutate: updateStatus } = useMutation({
    ...modelenceMutation('fixnet.updateIssueStatus'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getAllIssues') });
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getDashboardStats') });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const { mutate: updatePriority } = useMutation({
    ...modelenceMutation('fixnet.updateIssuePriority'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getAllIssues') });
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getDashboardStats') });
      toast.success('Priority updated successfully');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const { mutate: deleteIssue } = useMutation({
    ...modelenceMutation('fixnet.deleteIssue'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getAllIssues') });
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getDashboardStats') });
      toast.success('Issue deleted successfully');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const handleDeleteIssue = (issueId: string, issueTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${issueTitle}"? This action cannot be undone.`)) {
      deleteIssue({ issueId });
    }
  };

  const filteredIssues = issues?.filter((issue) => {
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    return true;
  });

  return (
    <DashboardLayout title="All Issues" isLoading={isLoading}>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Fixed">Fixed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="Road">Road</option>
            <option value="Water">Water</option>
            <option value="Power">Power</option>
            <option value="Waste">Waste</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      {filteredIssues && filteredIssues.length > 0 ? (
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <Card key={issue._id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link to={`/issue/${issue._id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                        {issue.title}
                      </Link>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[issue.status])}>
                        {issue.status}
                      </span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", priorityColors[issue.priority])}>
                        {issue.priority}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-2">{issue.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span>Reported by: {issue.reporterName}</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      {issue.technicianName && (
                        <span className="text-blue-600">Assigned to: {issue.technicianName}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
                    {/* Assign Technician */}
                    {issue.status !== 'Fixed' && (
                      <select
                        value={issue.assignedTo || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            assignTechnician({ issueId: issue._id, technicianId: e.target.value });
                          }
                        }}
                        className="text-sm rounded-md border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Assign Technician</option>
                        {technicians?.filter((t) => t.available).map((tech) => (
                          <option key={tech._id} value={tech._id}>
                            {tech.name} ({tech.specialty})
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Change Status */}
                    <select
                      value={issue.status}
                      onChange={(e) => updateStatus({ issueId: issue._id, status: e.target.value })}
                      className="text-sm rounded-md border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Fixed">Fixed</option>
                    </select>

                    {/* Change Priority */}
                    <select
                      value={issue.priority}
                      onChange={(e) => updatePriority({ issueId: issue._id, priority: e.target.value })}
                      className="text-sm rounded-md border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    <Link to={`/issue/${issue._id}`}>
                      <Button variant="outline" size="sm" className="text-forest-700 border-forest-300 hover:bg-forest-50">
                        View
                      </Button>
                    </Link>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteIssue(issue._id, issue.title)}
                    >
                      Delete
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
            <p className="text-gray-600">No issues found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
