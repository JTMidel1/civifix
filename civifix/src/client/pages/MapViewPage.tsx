import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import DashboardLayout from '@/client/components/DashboardLayout';
import { Card, CardContent } from '@/client/components/ui/Card';
import { cn } from '@/client/lib/utils';

type MapIssue = {
  _id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
};

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  Pending: { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-800' },
  Assigned: { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-800' },
  Fixed: { bg: 'bg-green-500', border: 'border-green-600', text: 'text-green-800' },
};

export default function MapViewPage() {
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: issues, isLoading } = useQuery({
    ...modelenceQuery<MapIssue[]>('fixnet.getMapIssues'),
  });

  const filteredIssues = issues?.filter((issue) => {
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    return true;
  }) || [];

  // Calculate map bounds
  const getBounds = () => {
    if (!filteredIssues.length) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }

    const lats = filteredIssues.map((i) => i.latitude);
    const lngs = filteredIssues.map((i) => i.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  };

  const bounds = getBounds();

  // Convert lat/lng to SVG coordinates
  const toSvgCoords = (lat: number, lng: number) => {
    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;

    const x = ((lng - bounds.minLng) / lngRange) * 100;
    const y = 100 - ((lat - bounds.minLat) / latRange) * 100;

    return { x, y };
  };

  return (
    <DashboardLayout title="Map View" isLoading={isLoading}>
      {/* Legend & Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Fixed">Fixed</option>
          </select>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-xs text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-xs text-gray-600">Assigned</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-600">Fixed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              {filteredIssues.length > 0 ? (
                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ paddingBottom: '75%' }}>
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />

                    {/* Issue markers */}
                    {filteredIssues.map((issue) => {
                      const { x, y } = toSvgCoords(issue.latitude, issue.longitude);
                      const colors = statusColors[issue.status];

                      return (
                        <g
                          key={issue._id}
                          className="cursor-pointer"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          {/* Pin shape */}
                          <circle
                            cx={x}
                            cy={y}
                            r={selectedIssue?._id === issue._id ? 4 : 3}
                            className={cn(
                              colors.bg,
                              "transition-all duration-200",
                              selectedIssue?._id === issue._id && "ring-2 ring-white"
                            )}
                            fill={issue.status === 'Pending' ? '#eab308' : issue.status === 'Assigned' ? '#3b82f6' : '#22c55e'}
                            stroke="#fff"
                            strokeWidth="1"
                          />
                          {/* Priority indicator */}
                          {issue.priority === 'High' && (
                            <circle
                              cx={x}
                              cy={y}
                              r="5"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="0.5"
                              className="animate-ping"
                              opacity="0.5"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Map overlay info */}
                  <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-1 text-xs text-gray-600">
                    {filteredIssues.length} issues shown
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p>No issues to display</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Issue List & Details */}
        <div className="lg:col-span-1">
          {selectedIssue ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{selectedIssue.title}</h3>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    statusColors[selectedIssue.status].bg,
                    "text-white"
                  )}>
                    {selectedIssue.status}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    selectedIssue.priority === 'High' ? 'bg-red-100 text-red-800' :
                    selectedIssue.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {selectedIssue.priority}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {selectedIssue.category}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{selectedIssue.latitude.toFixed(6)}, {selectedIssue.longitude.toFixed(6)}</span>
                  </div>
                </div>

                <Link to={`/issue/${selectedIssue._id}`}>
                  <button className="w-full bg-primary-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-700 transition-colors">
                    View Details
                  </button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Issues</h3>
                {filteredIssues.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredIssues.slice(0, 10).map((issue) => (
                      <button
                        key={issue._id}
                        onClick={() => setSelectedIssue(issue)}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                            statusColors[issue.status].bg
                          )} style={{
                            backgroundColor: issue.status === 'Pending' ? '#eab308' : issue.status === 'Assigned' ? '#3b82f6' : '#22c55e'
                          }} />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{issue.title}</p>
                            <p className="text-xs text-gray-500">{issue.category}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No issues to display</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
