# CiviFix - Community Infrastructure Reporting Platform

CiviFix is a citizen-powered platform for reporting and tracking local infrastructure issues like potholes, water leaks, power outages, and waste problems. Built with the Modelence framework.

## Problem Statement

**Globally, billions lack reliable access to water, sanitation, electricity, and basic infrastructure.**

These failures disrupt daily life, health, and economic opportunity for millions of communities. Yet there is no simple, unified way for citizens to report issues or track repairs — leaving problems unresolved and accountability weak.

### The Challenge

- **No unified reporting**: Citizens struggle to report infrastructure problems through fragmented, outdated systems
- **Lack of transparency**: Once reported, issues disappear into bureaucratic black holes with no visibility
- **Weak accountability**: Without tracking, there's no way to measure response times or hold authorities accountable
- **Disconnected stakeholders**: Citizens, administrators, and repair technicians operate in silos

### Our Solution

CiviFix bridges this gap by providing a simple, mobile-friendly platform where:
- Citizens can report issues in under 2 minutes with photos and automatic GPS location
- Administrators can prioritize, assign, and manage all reports from a central dashboard
- Technicians receive clear assignments and can update progress in real-time
- Everyone can track issues from report to resolution

## Overview

CiviFix connects citizens directly with local authorities and technicians. Users can report infrastructure issues with photos and GPS location, administrators can assign technicians, and technicians can track and resolve assigned issues.

### User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Citizen** | Community members who report issues | Report issues, track their own reports, view issue details, add comments |
| **Admin** | Platform administrators | View all issues, assign technicians, update status/priority, access dashboard stats |
| **Technician** | Field workers who fix issues | View assigned issues, mark issues as fixed, update availability/specialty |

## Tech Stack

- **Framework**: [Modelence](https://docs.modelence.com) (full-stack TypeScript)
- **Database**: MongoDB (via Modelence Store SDK)
- **Frontend**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom theme (forest/sage/earth/accent colors)
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router v6
- **Notifications**: react-hot-toast

## File Structure

```
src/
├── client/                     # Frontend code
│   ├── index.tsx              # Client entry point
│   ├── router.tsx             # Route definitions
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button.tsx    # Button component with variants
│   │   │   ├── Card.tsx      # Card container components
│   │   │   ├── Input.tsx     # Form input component
│   │   │   └── Label.tsx     # Form label component
│   │   ├── DashboardLayout.tsx   # Layout wrapper for authenticated pages
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   └── Page.tsx              # Page wrapper component
│   ├── pages/                 # Page components
│   │   ├── HomePage.tsx           # Landing page (public)
│   │   ├── LoginPage.tsx          # User login
│   │   ├── SignupPage.tsx         # User registration
│   │   ├── LogoutPage.tsx         # Logout handler
│   │   ├── CompleteProfilePage.tsx # Profile completion after signup
│   │   ├── CitizenDashboardPage.tsx   # Citizen's issue list
│   │   ├── AdminDashboardPage.tsx     # Admin overview with stats
│   │   ├── AdminIssuesPage.tsx        # Admin issue management
│   │   ├── TechnicianDashboardPage.tsx # Technician's assigned issues
│   │   ├── ReportIssuePage.tsx        # Issue reporting form
│   │   ├── IssueDetailPage.tsx        # Single issue view
│   │   ├── MapViewPage.tsx            # Map visualization
│   │   ├── TermsPage.tsx              # Terms and conditions
│   │   └── NotFoundPage.tsx           # 404 page
│   ├── lib/                   # Utility functions
│   │   ├── utils.ts          # Common utilities (cn for classnames)
│   │   └── autoLogin.ts      # Auto-login helper for demo
│   └── types.d.ts            # TypeScript type declarations
│
├── server/                    # Backend code
│   ├── app.ts                # Server entry point (startApp)
│   ├── fixnet/               # Main application module
│   │   ├── index.ts          # Module definition (queries/mutations)
│   │   └── db.ts             # Database stores and schemas
│   ├── example/              # Example module (can be removed)
│   │   ├── index.ts
│   │   ├── db.ts
│   │   └── cron.ts
│   └── migrations/           # Database migration scripts
│       └── createDemoUser.ts
```

## Database Schema

### Collections

#### `userProfiles`
Stores user profile information linked to auth users.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | Reference to auth user |
| `fullName` | string | User's full name |
| `phone` | string | Phone number |
| `role` | string | "Citizen", "Admin", or "Technician" |
| `createdAt` | Date | Profile creation timestamp |

#### `issues`
Main collection for infrastructure reports.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Issue title |
| `description` | string | Detailed description |
| `category` | string | "Road", "Water", "Power", "Waste", "Other" |
| `photo` | string | Base64 image or URL |
| `latitude` | number | GPS latitude |
| `longitude` | number | GPS longitude |
| `status` | string | "Pending", "Assigned", "Fixed" |
| `priority` | string | "Low", "Medium", "High" |
| `reportedBy` | ObjectId | User who reported |
| `assignedTo` | ObjectId | Assigned technician (optional) |
| `createdAt` | Date | Report timestamp |
| `updatedAt` | Date | Last update timestamp |

#### `technicians`
Stores technician-specific information.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | Reference to auth user |
| `name` | string | Technician name |
| `phone` | string | Phone number |
| `specialty` | string | Area of expertise |
| `available` | boolean | Availability status |
| `createdAt` | Date | Record creation timestamp |

#### `comments`
Stores comments/updates on issues.

| Field | Type | Description |
|-------|------|-------------|
| `issueId` | ObjectId | Reference to issue |
| `userId` | ObjectId | Comment author |
| `message` | string | Comment text |
| `createdAt` | Date | Comment timestamp |

## API Reference

### Queries

| Query | Auth | Role | Description |
|-------|------|------|-------------|
| `fixnet.getPublicStats` | No | - | Get public statistics for landing page |
| `fixnet.getMyProfile` | Yes | Any | Get current user's profile |
| `fixnet.getAllIssues` | Yes | Admin | Get all issues with reporter/technician names |
| `fixnet.getMyIssues` | Yes | Any | Get issues reported by current user |
| `fixnet.getAssignedIssues` | Yes | Technician | Get issues assigned to current technician |
| `fixnet.getIssue` | Yes | Any | Get single issue with comments |
| `fixnet.getMapIssues` | Yes | Any | Get all issues for map view |
| `fixnet.getTechnicians` | Yes | Admin | Get list of all technicians |
| `fixnet.getDashboardStats` | Yes | Admin | Get dashboard statistics |

### Mutations

| Mutation | Auth | Role | Description |
|----------|------|------|-------------|
| `fixnet.createProfile` | Yes | Any | Create/update user profile |
| `fixnet.createIssue` | Yes | Any | Report a new issue |
| `fixnet.assignTechnician` | Yes | Admin | Assign technician to issue |
| `fixnet.updateIssueStatus` | Yes | Admin | Update issue status |
| `fixnet.updateIssuePriority` | Yes | Admin | Update issue priority |
| `fixnet.markIssueFixed` | Yes | Technician | Mark assigned issue as fixed |
| `fixnet.addComment` | Yes | Any | Add comment to issue |
| `fixnet.updateTechnicianAvailability` | Yes | Technician | Update availability status |
| `fixnet.updateTechnicianSpecialty` | Yes | Technician | Update specialty |

## Routes

| Path | Page | Auth Required | Description |
|------|------|---------------|-------------|
| `/` | HomePage | No | Landing page with stats and info |
| `/login` | LoginPage | No | User login |
| `/signup` | SignupPage | No | User registration |
| `/logout` | LogoutPage | Yes | Logout handler |
| `/complete-profile` | CompleteProfilePage | Yes | Profile completion |
| `/citizen` | CitizenDashboardPage | Yes | Citizen dashboard |
| `/admin` | AdminDashboardPage | Yes (Admin) | Admin dashboard |
| `/admin/issues` | AdminIssuesPage | Yes (Admin) | Issue management |
| `/technician` | TechnicianDashboardPage | Yes (Tech) | Technician dashboard |
| `/report` | ReportIssuePage | Yes | Report new issue |
| `/issue/:id` | IssueDetailPage | Yes | Issue details |
| `/map` | MapViewPage | Yes | Map view |
| `/terms` | TermsPage | No | Terms of service |

## Theme Colors

The app uses a sustainable/nature-inspired color palette defined in `tailwind.config.js`:

| Color | Usage | Values |
|-------|-------|--------|
| `forest` | Primary actions, headers | Dark greens (50-950) |
| `sage` | Secondary elements, backgrounds | Muted greens (50-950) |
| `earth` | Road-related elements | Browns (50-950) |
| `accent` | Highlights, notifications | Amber/gold (50-950) |

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Modelence CLI

### Running Locally

The app runs automatically on port 3000 when you start the development environment. Do NOT manually run `npm run dev` - the Modelence sandbox handles this.

### TypeScript Check

```bash
npx tsc --noEmit
```

### Adding New Features

1. **Database changes**: Add stores in `src/server/fixnet/db.ts`
2. **API endpoints**: Add queries/mutations in `src/server/fixnet/index.ts`
3. **Pages**: Create components in `src/client/pages/`
4. **Routes**: Register routes in `src/client/router.tsx`
5. **Register stores**: Add to module's `stores` array in `index.ts`

### Common Patterns

**Calling a query:**
```tsx
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';

const { data, isLoading } = useQuery({
  ...modelenceQuery<ResponseType>('fixnet.queryName', { arg1: 'value' }),
});
```

**Calling a mutation:**
```tsx
import { useMutation } from '@tanstack/react-query';
import { modelenceMutation } from '@modelence/react-query';

const { mutate, isPending } = useMutation({
  ...modelenceMutation('fixnet.mutationName'),
});

// Call it
mutate({ arg1: 'value' });
```

**Protected routes by role:**
```tsx
// In the component, check profile role
const { data: profile } = useQuery({
  ...modelenceQuery<UserProfile>('fixnet.getMyProfile'),
});

if (profile?.role !== 'Admin') {
  return <Navigate to="/citizen" />;
}
```

## Potential Improvements

### High Priority
- [ ] Add image upload service (currently uses base64 which has size limits)
- [ ] Implement real-time updates with WebSockets for issue status changes
- [ ] Add email notifications when issue status changes
- [ ] Implement pagination for issue lists

### Medium Priority
- [ ] Add issue search and filtering
- [ ] Implement issue categories management (admin)
- [ ] Add technician performance metrics
- [ ] Implement issue priority auto-escalation based on age
- [ ] Add offline support for reporting issues

### Low Priority
- [ ] Add dark mode support
- [ ] Implement multi-language support (i18n)
- [ ] Add export functionality for reports
- [ ] Implement issue clustering on map view
- [ ] Add push notifications

## Known Issues

1. **Location services**: If GPS fails, users can manually enter coordinates. Consider adding address lookup.
2. **Large images**: Base64 encoding can cause issues with large photos. Consider implementing file upload.
3. **Map view**: Currently a placeholder - needs Leaflet or Google Maps integration.

## Support

For questions or issues with the Modelence framework:
- Documentation: https://docs.modelence.com
- Email: support@modelence.com

## License

Private - All rights reserved
Build with love by Jesutomi Bamidele with Modelence 