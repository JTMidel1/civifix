import { Store, schema } from 'modelence/server';

// Issue categories
export type IssueCategory = 'Road' | 'Water' | 'Power' | 'Waste' | 'Other';
export const ISSUE_CATEGORIES: IssueCategory[] = ['Road', 'Water', 'Power', 'Waste', 'Other'];

// Issue statuses
export type IssueStatus = 'Pending' | 'Assigned' | 'Fixed';

// Issue priorities
export type IssuePriority = 'Low' | 'Medium' | 'High';

// User roles
export type UserRole = 'Citizen' | 'Admin' | 'Technician' | 'SuperAdmin';

// Admin approval status
export type AdminStatus = 'pending' | 'approved' | 'rejected';

// User profile store (extends auth user)
export const dbUserProfiles = new Store('userProfiles', {
  schema: {
    userId: schema.userId(),
    fullName: schema.string(),
    phone: schema.string(),
    role: schema.string(), // UserRole
    adminStatus: schema.string(), // AdminStatus - only for Admin role (pending/approved/rejected)
    createdAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 }, unique: true },
    { key: { role: 1 } },
    { key: { adminStatus: 1 } }
  ]
});

// Technician store
export const dbTechnicians = new Store('technicians', {
  schema: {
    userId: schema.userId(),
    name: schema.string(),
    phone: schema.string(),
    specialty: schema.string(),
    available: schema.boolean(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 }, unique: true },
    { key: { available: 1 } },
    { key: { specialty: 1 } }
  ]
});

// Issue store
export const dbIssues = new Store('issues', {
  schema: {
    title: schema.string(),
    description: schema.string(),
    category: schema.string(), // IssueCategory
    photo: schema.string(), // Base64 image or URL
    latitude: schema.number(),
    longitude: schema.number(),
    status: schema.string(), // IssueStatus
    priority: schema.string(), // IssuePriority
    reportedBy: schema.userId(),
    assignedTo: schema.objectId(), // Optional - technician ID
    createdAt: schema.date(),
    updatedAt: schema.date(),
  },
  indexes: [
    { key: { status: 1 } },
    { key: { reportedBy: 1 } },
    { key: { assignedTo: 1 } },
    { key: { category: 1 } },
    { key: { priority: 1 } },
    { key: { latitude: 1, longitude: 1 } }
  ]
});

// Comment store
export const dbComments = new Store('comments', {
  schema: {
    issueId: schema.objectId(),
    userId: schema.userId(),
    message: schema.string(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { issueId: 1 } },
    { key: { userId: 1 } }
  ]
});
