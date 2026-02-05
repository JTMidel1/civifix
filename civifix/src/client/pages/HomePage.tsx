import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from 'modelence/client';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { Button } from '@/client/components/ui/Button';
import { cn } from '@/client/lib/utils';

type UserProfile = {
  _id: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: Date;
};

type PublicStats = {
  totalIssues: number;
  pendingIssues: number;
  assignedIssues: number;
  fixedIssues: number;
  byCategory: Record<string, number>;
  recentIssues: {
    _id: string;
    title: string;
    category: string;
    status: string;
    createdAt: Date;
  }[];
};

// Sample infrastructure issue images using placeholder services
const sampleIssues = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    category: 'Road',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
    status: 'Pending',
  },
  {
    id: 2,
    title: 'Broken Street Light',
    category: 'Power',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Water Leak on Oak Avenue',
    category: 'Water',
    image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&h=300&fit=crop',
    status: 'Resolved',
  },
  {
    id: 4,
    title: 'Illegal Dumping Site',
    category: 'Waste',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
    status: 'Pending',
  },
  {
    id: 5,
    title: 'Cracked Sidewalk',
    category: 'Road',
    image: 'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?w=400&h=300&fit=crop',
    status: 'In Progress',
  },
  {
    id: 6,
    title: 'Flooded Drainage',
    category: 'Water',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&h=300&fit=crop',
    status: 'Resolved',
  },
];

const categoryColors: Record<string, string> = {
  Road: 'bg-earth-100 text-earth-700',
  Water: 'bg-blue-100 text-blue-700',
  Power: 'bg-accent-100 text-accent-700',
  Waste: 'bg-sage-100 text-sage-700',
  Other: 'bg-slate-100 text-slate-700',
};

const statusColors: Record<string, string> = {
  'Pending': 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Resolved': 'bg-forest-100 text-forest-700',
};

export default function HomePage() {
  const { user } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    ...modelenceQuery<UserProfile | null>('fixnet.getMyProfile'),
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    ...modelenceQuery<PublicStats>('fixnet.getPublicStats'),
  });

  // If user is logged in and has profile, redirect to appropriate dashboard
  if (user && profile && !profileLoading) {
    const dashboardPath =
      profile.role === 'Admin' ? '/admin' :
      profile.role === 'Technician' ? '/technician' :
      '/citizen';

    window.location.href = dashboardPath;
    return null;
  }

  // If user is logged in but no profile, redirect to complete profile
  if (user && !profile && !profileLoading) {
    window.location.href = '/complete-profile';
    return null;
  }

  const resolutionRate = stats && stats.totalIssues > 0
    ? Math.round((stats.fixedIssues / stats.totalIssues) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sage-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-forest-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sage-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 backdrop-blur-md bg-white/80 border-b border-sage-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-xl text-forest-900 tracking-tight">CiviFix</span>
                <p className="text-xs text-sage-600 -mt-0.5 hidden sm:block">Community Infrastructure Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sage-700 hover:text-forest-700 font-medium transition-colors">About</a>
              <a href="#issues" className="text-sage-700 hover:text-forest-700 font-medium transition-colors">Issues</a>
              <a href="#how-it-works" className="text-sage-700 hover:text-forest-700 font-medium transition-colors">How It Works</a>
              <a href="#stats" className="text-sage-700 hover:text-forest-700 font-medium transition-colors">Statistics</a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-forest-700 hover:text-forest-900 hover:bg-forest-50">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white shadow-soft hover:shadow-elevated transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-sage-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6 text-forest-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-sage-100">
              <nav className="flex flex-col gap-2">
                <a href="#about" className="px-4 py-2 text-sage-700 hover:bg-forest-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
                <a href="#issues" className="px-4 py-2 text-sage-700 hover:bg-forest-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Issues</a>
                <a href="#how-it-works" className="px-4 py-2 text-sage-700 hover:bg-forest-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <a href="#stats" className="px-4 py-2 text-sage-700 hover:bg-forest-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Statistics</a>
                <div className="flex gap-2 mt-2 px-4">
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" className="w-full border-forest-300 text-forest-700">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="flex-1">
                    <Button className="w-full bg-forest-600 hover:bg-forest-700 text-white">Get Started</Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative z-10 py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-forest-100/80 backdrop-blur-sm rounded-full text-forest-700 text-sm font-medium mb-6 border border-forest-200/50">
                <span className="w-2 h-2 bg-forest-500 rounded-full animate-pulse" />
                Community-Powered Infrastructure Reporting
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-forest-950 mb-6 leading-tight">
                Report Local Issues,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-600 to-accent-500">
                  Build Better Communities
                </span>
              </h1>

              <p className="text-lg md:text-xl text-sage-700 mb-8 leading-relaxed">
                Billions lack reliable infrastructure, yet reporting issues remains fragmented and accountability weak.
                CiviFix connects citizens directly with local authorities to report potholes, water leaks, power outages, and waste problems — and track their resolution in real-time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white px-8 py-4 text-lg shadow-glow hover:shadow-glow-lg transition-all duration-300 rounded-xl">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report an Issue
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-forest-300 text-forest-700 hover:bg-forest-50 hover:border-forest-400 px-8 py-4 text-lg rounded-xl transition-all duration-300">
                    View Dashboard
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-forest-900">{stats?.fixedIssues || 0}</p>
                    <p className="text-xs text-sage-600">Issues Resolved</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-forest-900">{resolutionRate}%</p>
                    <p className="text-xs text-sage-600">Resolution Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
                title="Roads"
                description="Potholes, cracks, damaged signs"
                color="bg-earth-50 border-earth-200 text-earth-700"
              />
              <FeatureCard
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                }
                title="Water"
                description="Leaks, flooding, contamination"
                color="bg-blue-50 border-blue-200 text-blue-700"
              />
              <FeatureCard
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Power"
                description="Outages, damaged lines, lights"
                color="bg-accent-50 border-accent-200 text-accent-700"
              />
              <FeatureCard
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
                title="Waste"
                description="Garbage, illegal dumping"
                color="bg-sage-50 border-sage-200 text-sage-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sample Issues Gallery */}
      <section id="issues" className="relative z-10 py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-950 mb-3">Common Infrastructure Issues</h2>
            <p className="text-sage-600 text-lg max-w-2xl mx-auto">
              These are the types of problems citizens report daily. Spot something similar in your area? Help us fix it!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleIssues.map((issue) => (
              <div
                key={issue.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-soft border border-sage-100 hover:shadow-elevated transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={issue.image}
                    alt={issue.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to a gradient placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.classList.add('bg-gradient-to-br', 'from-sage-200', 'to-sage-300');
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", categoryColors[issue.category])}>
                      {issue.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", statusColors[issue.status])}>
                      {issue.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-forest-900 mb-2">{issue.title}</h3>
                  <p className="text-sm text-sage-600">Sample report - Sign up to report issues like this in your community</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white shadow-soft hover:shadow-glow transition-all duration-300 rounded-xl">
                Report an Issue in Your Area
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-950 mb-3">How CiviFix Works</h2>
            <p className="text-sage-600 text-lg">Three simple steps to improve your community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessCard
              step="1"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Report Issues"
              description="Take a photo, add GPS location automatically, and describe the problem. It takes less than 2 minutes."
            />
            <ProcessCard
              step="2"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              title="Track Progress"
              description="Admins review and assign technicians. Watch your report move from 'Pending' to 'In Progress' to 'Resolved'."
            />
            <ProcessCard
              step="3"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              }
              title="Issue Fixed"
              description="Qualified technicians address the problem. Get notified when your reported issue is resolved."
            />
          </div>
        </div>
      </section>

      {/* Stats Dashboard Section */}
      <section id="stats" className="relative z-10 py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-950 mb-3">Community Impact</h2>
            <p className="text-sage-600 text-lg">Real-time statistics from our platform</p>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Total Reports"
              value={stats?.totalIssues || 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              gradient="from-forest-500 to-forest-600"
            />
            <StatCard
              label="Pending"
              value={stats?.pendingIssues || 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              gradient="from-accent-400 to-accent-500"
            />
            <StatCard
              label="In Progress"
              value={stats?.assignedIssues || 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              gradient="from-blue-400 to-blue-500"
            />
            <StatCard
              label="Resolved"
              value={stats?.fixedIssues || 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              gradient="from-forest-400 to-forest-500"
            />
          </div>

          {/* Resolution Rate Visual */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-sage-100 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-forest-900 mb-6 text-center">Resolution Rate</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e3e7dd"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="3"
                    strokeDasharray={`${resolutionRate}, 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-forest-900">{resolutionRate}%</span>
                  <span className="text-sm text-sage-500 font-medium">Complete</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-sage-600 mt-6">
              <span className="font-semibold text-forest-700">{stats?.fixedIssues || 0}</span> of{' '}
              <span className="font-semibold text-forest-700">{stats?.totalIssues || 0}</span> issues resolved
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-forest-600 via-forest-700 to-forest-800 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-forest-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/20 rounded-full blur-2xl" />

            <div className="relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
              <p className="text-forest-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of citizens building cleaner, safer, and more sustainable communities. Your report could fix the problem others walk past every day.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-forest-700 hover:bg-forest-50 px-10 py-4 text-lg font-semibold rounded-xl shadow-elevated hover:shadow-xl transition-all duration-300">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto bg-forest-500 text-white hover:bg-forest-400 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/30">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-sage-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-forest-900">CiviFix</span>
                <p className="text-xs text-sage-600">Community Infrastructure Platform</p>
              </div>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <a href="#about" className="text-sage-600 hover:text-forest-700 transition-colors">About</a>
              <a href="#how-it-works" className="text-sage-600 hover:text-forest-700 transition-colors">How It Works</a>
              <Link to="/terms" className="text-sage-600 hover:text-forest-700 transition-colors">Terms</Link>
            </nav>
            <p className="text-sm text-sage-600">Building sustainable communities together</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-soft hover:scale-105",
      color
    )}>
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}

function StatCard({ label, value, icon, gradient }: { label: string; value: number; icon: React.ReactNode; gradient: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-sage-100 hover:shadow-elevated transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
          gradient
        )}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-forest-900">{value}</p>
          <p className="text-sm text-sage-600 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ProcessCard({ step, icon, title, description }: { step: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-sage-100 hover:shadow-elevated transition-all duration-300 h-full">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-forest-100 to-sage-100 rounded-2xl flex items-center justify-center text-forest-600 transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-glow-accent">
            {step}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-forest-900 mb-3">{title}</h3>
        <p className="text-sage-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
