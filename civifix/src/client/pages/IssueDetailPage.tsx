import React, { useCallback, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import DashboardLayout from '@/client/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { cn } from '@/client/lib/utils';
import { toast } from 'react-hot-toast';

type Comment = {
  _id: string;
  message: string;
  authorName: string;
  createdAt: Date;
};

type IssueDetail = {
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
  comments: Comment[];
};

type UserProfile = {
  _id: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: Date;
};

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  Fixed: 'bg-green-100 text-green-800 border-green-200',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-orange-100 text-orange-800',
  High: 'bg-red-100 text-red-800',
};

const categoryInfo: Record<string, { icon: React.ReactNode; color: string }> = {
  Road: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    color: 'bg-gray-100 text-gray-600',
  },
  Water: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-600',
  },
  Power: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'bg-yellow-100 text-yellow-600',
  },
  Waste: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    color: 'bg-green-100 text-green-600',
  },
  Other: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    color: 'bg-purple-100 text-purple-600',
  },
};

export default function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: issue, isLoading } = useQuery({
    ...modelenceQuery<IssueDetail>('fixnet.getIssue', { issueId }),
    enabled: !!issueId,
  });

  const { data: profile } = useQuery({
    ...modelenceQuery<UserProfile | null>('fixnet.getMyProfile'),
    enabled: !!user,
  });

  const { mutateAsync: addComment } = useMutation({
    ...modelenceMutation('fixnet.addComment'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getIssue', { issueId }) });
      setNewComment('');
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const { mutate: markFixed, isPending: isMarkingFixed } = useMutation({
    ...modelenceMutation('fixnet.markIssueFixed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getIssue', { issueId }) });
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getAssignedIssues') });
      toast.success('Issue marked as fixed!');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const { mutate: deleteIssue, isPending: isDeleting } = useMutation({
    ...modelenceMutation('fixnet.deleteIssue'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getAllIssues') });
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getDashboardStats') });
      toast.success('Issue deleted successfully');
      navigate('/admin/issues');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const handleDeleteIssue = useCallback(() => {
    if (!issueId || !issue) return;
    if (window.confirm(`Are you sure you want to delete "${issue.title}"? This action cannot be undone.`)) {
      deleteIssue({ issueId });
    }
  }, [issueId, issue, deleteIssue]);

  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !issueId) return;

    setIsSubmittingComment(true);
    try {
      await addComment({ issueId, message: newComment.trim() });
    } finally {
      setIsSubmittingComment(false);
    }
  }, [addComment, issueId, newComment]);

  const handleMarkFixed = useCallback(() => {
    if (!issueId) return;
    markFixed({ issueId });
  }, [issueId, markFixed]);

  const catInfo = categoryInfo[issue?.category || 'Other'];

  return (
    <DashboardLayout title="Issue Details" isLoading={isLoading}>
      {issue && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Issue Card */}
          <Card>
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0", catInfo.color)}>
                  {catInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{issue.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-sm px-3 py-1 rounded-full border", statusColors[issue.status])}>
                      {issue.status}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", priorityColors[issue.priority])}>
                      {issue.priority} Priority
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {issue.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
              </div>

              {/* Photo */}
              {issue.photo && (
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Photo</h2>
                  <img
                    src={issue.photo}
                    alt="Issue"
                    className="max-w-full sm:max-w-md rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Reported By</h3>
                  <p className="text-gray-900">{issue.reporterName}</p>
                  <p className="text-sm text-gray-500">{new Date(issue.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Assigned To</h3>
                  {issue.technicianName ? (
                    <p className="text-gray-900">{issue.technicianName}</p>
                  ) : (
                    <p className="text-gray-500 italic">Not assigned yet</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Location</h3>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-900">
                      {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technician Actions */}
              {profile?.role === 'Technician' && issue.status === 'Assigned' && (
                <div className="border-t border-gray-200 pt-6">
                  <Button
                    onClick={handleMarkFixed}
                    disabled={isMarkingFixed}
                    className="bg-forest-600 hover:bg-forest-700 text-white"
                  >
                    {isMarkingFixed ? 'Marking as Fixed...' : 'Mark as Fixed'}
                  </Button>
                </div>
              )}

              {/* Admin Actions */}
              {profile?.role === 'Admin' && (
                <div className="border-t border-gray-200 pt-6">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteIssue}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Issue'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments ({issue.comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Comment List */}
              {issue.comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {issue.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary-600">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-6">No comments yet.</p>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="bg-forest-600 hover:bg-forest-700 text-white"
                >
                  {isSubmittingComment ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Back Link */}
          <div className="text-center">
            <Link
              to={profile?.role === 'Admin' ? '/admin/issues' : profile?.role === 'Technician' ? '/technician' : '/citizen'}
              className="text-forest-600 hover:text-forest-700 hover:underline text-sm"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
