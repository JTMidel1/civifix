import z from 'zod';
import { AuthError } from 'modelence';
import { Module, ObjectId, UserInfo } from 'modelence/server';
import {
  dbUserProfiles,
  dbTechnicians,
  dbIssues,
  dbComments,
  ISSUE_CATEGORIES,
} from './db';

// Helper to get user profile with role check
async function getUserProfile(user: UserInfo | null) {
  if (!user) {
    throw new AuthError('Not authenticated');
  }
  const profile = await dbUserProfiles.findOne({ userId: new ObjectId(user.id) });
  return profile;
}

// Helper to require specific role
async function requireRole(user: UserInfo | null, allowedRoles: string[]) {
  const profile = await getUserProfile(user);
  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new AuthError('Not authorized for this action');
  }
  return profile;
}

// Helper to check for nearby issues (within ~100 meters)
async function checkNearbyIssues(lat: number, lng: number): Promise<boolean> {
  const threshold = 0.001; // Roughly 100 meters
  const nearbyIssues = await dbIssues.fetch({
    latitude: { $gte: lat - threshold, $lte: lat + threshold },
    longitude: { $gte: lng - threshold, $lte: lng + threshold },
    status: { $ne: 'Fixed' }
  });
  return nearbyIssues.length > 0;
}

export default new Module('fixnet', {
  stores: [dbUserProfiles, dbTechnicians, dbIssues, dbComments],

  queries: {
    // Get public stats for landing page (no auth required)
    getPublicStats: async () => {
      const allIssues = await dbIssues.fetch({});
      const totalIssues = allIssues.length;
      const pendingIssues = allIssues.filter(i => i.status === 'Pending').length;
      const assignedIssues = allIssues.filter(i => i.status === 'Assigned').length;
      const fixedIssues = allIssues.filter(i => i.status === 'Fixed').length;

      // Category breakdown
      const byCategory: Record<string, number> = {};
      for (const cat of ISSUE_CATEGORIES) {
        byCategory[cat] = allIssues.filter(i => i.category === cat).length;
      }

      // Get recent issues (last 5, limited info for public view)
      const recentIssues = allIssues
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(issue => ({
          _id: issue._id.toString(),
          title: issue.title,
          category: issue.category,
          status: issue.status,
          createdAt: issue.createdAt,
        }));

      return {
        totalIssues,
        pendingIssues,
        assignedIssues,
        fixedIssues,
        byCategory,
        recentIssues,
      };
    },

    // Get current user's profile
    getMyProfile: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) return null;
      const profile = await dbUserProfiles.findOne({ userId: new ObjectId(user.id) });
      if (!profile) return null;
      return {
        _id: profile._id.toString(),
        fullName: profile.fullName,
        phone: profile.phone,
        role: profile.role,
        adminStatus: profile.adminStatus || null,
        createdAt: profile.createdAt,
      };
    },

    // Get pending admin requests (for superadmin)
    getPendingAdmins: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['SuperAdmin']);

      const pendingAdmins = await dbUserProfiles.fetch({
        role: 'Admin',
        adminStatus: 'pending'
      }, { sort: { createdAt: -1 } });

      return pendingAdmins.map(admin => ({
        _id: admin._id.toString(),
        userId: admin.userId.toString(),
        fullName: admin.fullName,
        phone: admin.phone,
        createdAt: admin.createdAt,
      }));
    },

    // Get all admins (for superadmin)
    getAllAdmins: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['SuperAdmin']);

      const admins = await dbUserProfiles.fetch({
        role: 'Admin'
      }, { sort: { createdAt: -1 } });

      return admins.map(admin => ({
        _id: admin._id.toString(),
        userId: admin.userId.toString(),
        fullName: admin.fullName,
        phone: admin.phone,
        adminStatus: admin.adminStatus,
        createdAt: admin.createdAt,
      }));
    },

    // Get superadmin dashboard stats
    getSuperAdminStats: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['SuperAdmin']);

      const allProfiles = await dbUserProfiles.fetch({});
      const allIssues = await dbIssues.fetch({});

      const totalUsers = allProfiles.length;
      const totalCitizens = allProfiles.filter(p => p.role === 'Citizen').length;
      const totalAdmins = allProfiles.filter(p => p.role === 'Admin').length;
      const pendingAdmins = allProfiles.filter(p => p.role === 'Admin' && p.adminStatus === 'pending').length;
      const approvedAdmins = allProfiles.filter(p => p.role === 'Admin' && p.adminStatus === 'approved').length;
      const totalTechnicians = allProfiles.filter(p => p.role === 'Technician').length;
      const totalIssues = allIssues.length;
      const resolvedIssues = allIssues.filter(i => i.status === 'Fixed').length;

      return {
        totalUsers,
        totalCitizens,
        totalAdmins,
        pendingAdmins,
        approvedAdmins,
        totalTechnicians,
        totalIssues,
        resolvedIssues,
      };
    },

    // Get all issues (for admin)
    getAllIssues: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      const profile = await requireRole(user, ['Admin', 'SuperAdmin']);

      // If Admin, check if approved
      if (profile.role === 'Admin' && profile.adminStatus !== 'approved') {
        throw new AuthError('Your admin account is pending approval');
      }
      const issues = await dbIssues.fetch({}, { sort: { createdAt: -1 } });

      // Get reporter names
      const reporterIds = [...new Set(issues.map(i => i.reportedBy.toString()))];
      const reporters = await dbUserProfiles.fetch({
        userId: { $in: reporterIds.map(id => new ObjectId(id)) }
      });
      const reporterMap = new Map(reporters.map(r => [r.userId.toString(), r.fullName]));

      // Get technician names
      const techIds = issues
        .filter(i => i.assignedTo)
        .map(i => i.assignedTo!.toString());
      const technicians = await dbTechnicians.fetch({
        _id: { $in: techIds.map(id => new ObjectId(id)) }
      });
      const techMap = new Map(technicians.map(t => [t._id.toString(), t.name]));

      return issues.map(issue => ({
        _id: issue._id.toString(),
        title: issue.title,
        description: issue.description,
        category: issue.category,
        photo: issue.photo,
        latitude: issue.latitude,
        longitude: issue.longitude,
        status: issue.status,
        priority: issue.priority,
        reportedBy: issue.reportedBy.toString(),
        reporterName: reporterMap.get(issue.reportedBy.toString()) || 'Unknown',
        assignedTo: issue.assignedTo?.toString() || null,
        technicianName: issue.assignedTo ? techMap.get(issue.assignedTo.toString()) || null : null,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      }));
    },

    // Get issues reported by current user (for citizen)
    getMyIssues: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const issues = await dbIssues.fetch(
        { reportedBy: new ObjectId(user.id) },
        { sort: { createdAt: -1 } }
      );

      return issues.map(issue => ({
        _id: issue._id.toString(),
        title: issue.title,
        description: issue.description,
        category: issue.category,
        photo: issue.photo,
        latitude: issue.latitude,
        longitude: issue.longitude,
        status: issue.status,
        priority: issue.priority,
        assignedTo: issue.assignedTo?.toString() || null,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      }));
    },

    // Get issues assigned to technician
    getAssignedIssues: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      const profile = await requireRole(user, ['Technician']);

      // Find technician record
      const technician = await dbTechnicians.findOne({ userId: profile.userId });
      if (!technician) {
        throw new Error('Technician profile not found');
      }

      const issues = await dbIssues.fetch(
        { assignedTo: technician._id },
        { sort: { priority: -1, createdAt: -1 } }
      );

      // Get reporter names
      const reporterIds = [...new Set(issues.map(i => i.reportedBy.toString()))];
      const reporters = await dbUserProfiles.fetch({
        userId: { $in: reporterIds.map(id => new ObjectId(id)) }
      });
      const reporterMap = new Map(reporters.map(r => [r.userId.toString(), r.fullName]));

      return issues.map(issue => ({
        _id: issue._id.toString(),
        title: issue.title,
        description: issue.description,
        category: issue.category,
        photo: issue.photo,
        latitude: issue.latitude,
        longitude: issue.longitude,
        status: issue.status,
        priority: issue.priority,
        reporterName: reporterMap.get(issue.reportedBy.toString()) || 'Unknown',
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      }));
    },

    // Get single issue details
    getIssue: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { issueId } = z.object({ issueId: z.string() }).parse(args);
      const issue = await dbIssues.requireOne({ _id: new ObjectId(issueId) });

      // Get reporter info
      const reporter = await dbUserProfiles.findOne({ userId: issue.reportedBy });

      // Get technician info if assigned
      let technicianName = null;
      if (issue.assignedTo) {
        const tech = await dbTechnicians.findOne({ _id: issue.assignedTo });
        technicianName = tech?.name || null;
      }

      // Get comments
      const comments = await dbComments.fetch(
        { issueId: issue._id },
        { sort: { createdAt: 1 } }
      );

      // Get comment authors
      const authorIds = [...new Set(comments.map(c => c.userId.toString()))];
      const authors = await dbUserProfiles.fetch({
        userId: { $in: authorIds.map(id => new ObjectId(id)) }
      });
      const authorMap = new Map(authors.map(a => [a.userId.toString(), a.fullName]));

      return {
        _id: issue._id.toString(),
        title: issue.title,
        description: issue.description,
        category: issue.category,
        photo: issue.photo,
        latitude: issue.latitude,
        longitude: issue.longitude,
        status: issue.status,
        priority: issue.priority,
        reportedBy: issue.reportedBy.toString(),
        reporterName: reporter?.fullName || 'Unknown',
        assignedTo: issue.assignedTo?.toString() || null,
        technicianName,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        comments: comments.map(c => ({
          _id: c._id.toString(),
          message: c.message,
          authorName: authorMap.get(c.userId.toString()) || 'Unknown',
          createdAt: c.createdAt,
        })),
      };
    },

    // Get all issues for map view
    getMapIssues: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const issues = await dbIssues.fetch({});

      return issues.map(issue => ({
        _id: issue._id.toString(),
        title: issue.title,
        category: issue.category,
        latitude: issue.latitude,
        longitude: issue.longitude,
        status: issue.status,
        priority: issue.priority,
      }));
    },

    // Get all available technicians (for admin)
    getTechnicians: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['Admin']);

      const technicians = await dbTechnicians.fetch({}, { sort: { name: 1 } });

      return technicians.map(tech => ({
        _id: tech._id.toString(),
        name: tech.name,
        phone: tech.phone,
        specialty: tech.specialty,
        available: tech.available,
      }));
    },

    // Get dashboard stats (for admin)
    getDashboardStats: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      const profile = await requireRole(user, ['Admin', 'SuperAdmin']);

      // If Admin, check if approved
      if (profile.role === 'Admin' && profile.adminStatus !== 'approved') {
        throw new AuthError('Your admin account is pending approval');
      }

      const allIssues = await dbIssues.fetch({});
      const totalIssues = allIssues.length;
      const pendingIssues = allIssues.filter(i => i.status === 'Pending').length;
      const assignedIssues = allIssues.filter(i => i.status === 'Assigned').length;
      const fixedIssues = allIssues.filter(i => i.status === 'Fixed').length;
      const highPriority = allIssues.filter(i => i.priority === 'High' && i.status !== 'Fixed').length;

      // Category breakdown
      const byCategory: Record<string, number> = {};
      for (const cat of ISSUE_CATEGORIES) {
        byCategory[cat] = allIssues.filter(i => i.category === cat).length;
      }

      return {
        totalIssues,
        pendingIssues,
        assignedIssues,
        fixedIssues,
        highPriority,
        byCategory,
      };
    },
  },

  mutations: {
    // Create or update user profile
    createProfile: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { fullName, phone, role } = z.object({
        fullName: z.string().min(1),
        phone: z.string().min(1),
        role: z.enum(['Citizen', 'Admin', 'Technician']),
      }).parse(args);

      // Check if profile exists
      const existingProfile = await dbUserProfiles.findOne({ userId: new ObjectId(user.id) });

      // Determine admin status for Admin role
      const adminStatus = role === 'Admin' ? 'pending' : undefined;

      if (existingProfile) {
        // Update existing profile
        await dbUserProfiles.updateOne(
          { _id: existingProfile._id },
          { $set: { fullName, phone, role, ...(adminStatus && { adminStatus }) } }
        );
      } else {
        // Create new profile
        await dbUserProfiles.insertOne({
          userId: new ObjectId(user.id),
          fullName,
          phone,
          role,
          adminStatus: adminStatus || '',
          createdAt: new Date(),
        });
      }

      // If role is Technician, create technician record
      if (role === 'Technician') {
        const existingTech = await dbTechnicians.findOne({ userId: new ObjectId(user.id) });
        if (!existingTech) {
          await dbTechnicians.insertOne({
            userId: new ObjectId(user.id),
            name: fullName,
            phone,
            specialty: 'General',
            available: true,
            createdAt: new Date(),
          });
        }
      }

      return { success: true };
    },

    // Create new issue
    createIssue: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { title, description, category, photo, latitude, longitude } = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.enum(['Road', 'Water', 'Power', 'Waste', 'Other']),
        photo: z.string().optional().default(''),
        latitude: z.number(),
        longitude: z.number(),
      }).parse(args);

      // Check for nearby issues to determine priority
      const hasNearbyIssues = await checkNearbyIssues(latitude, longitude);
      const priority = hasNearbyIssues ? 'High' : 'Medium';

      const now = new Date();
      const result = await dbIssues.insertOne({
        title,
        description,
        category,
        photo,
        latitude,
        longitude,
        status: 'Pending',
        priority,
        reportedBy: new ObjectId(user.id),
        assignedTo: undefined as unknown as ObjectId,
        createdAt: now,
        updatedAt: now,
      });

      return { issueId: result.insertedId.toString(), priority };
    },

    // Assign technician to issue (admin only)
    assignTechnician: async (args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['Admin']);

      const { issueId, technicianId } = z.object({
        issueId: z.string(),
        technicianId: z.string(),
      }).parse(args);

      await dbIssues.updateOne(
        { _id: new ObjectId(issueId) },
        {
          $set: {
            assignedTo: new ObjectId(technicianId),
            status: 'Assigned',
            updatedAt: new Date(),
          }
        }
      );

      return { success: true };
    },

    // Update issue status (admin)
    updateIssueStatus: async (args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['Admin']);

      const { issueId, status } = z.object({
        issueId: z.string(),
        status: z.enum(['Pending', 'Assigned', 'Fixed']),
      }).parse(args);

      await dbIssues.updateOne(
        { _id: new ObjectId(issueId) },
        { $set: { status, updatedAt: new Date() } }
      );

      return { success: true };
    },

    // Update issue priority (admin)
    updateIssuePriority: async (args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['Admin']);

      const { issueId, priority } = z.object({
        issueId: z.string(),
        priority: z.enum(['Low', 'Medium', 'High']),
      }).parse(args);

      await dbIssues.updateOne(
        { _id: new ObjectId(issueId) },
        { $set: { priority, updatedAt: new Date() } }
      );

      return { success: true };
    },

    // Mark issue as fixed (technician)
    markIssueFixed: async (args: unknown, { user }: { user: UserInfo | null }) => {
      const profile = await requireRole(user, ['Technician']);

      const { issueId, proofPhoto } = z.object({
        issueId: z.string(),
        proofPhoto: z.string().optional(),
      }).parse(args);

      // Verify technician is assigned to this issue
      const technician = await dbTechnicians.findOne({ userId: profile.userId });
      if (!technician) throw new Error('Technician profile not found');

      const issue = await dbIssues.requireOne({ _id: new ObjectId(issueId) });
      if (!issue.assignedTo || issue.assignedTo.toString() !== technician._id.toString()) {
        throw new AuthError('You are not assigned to this issue');
      }

      await dbIssues.updateOne(
        { _id: new ObjectId(issueId) },
        { $set: { status: 'Fixed', updatedAt: new Date() } }
      );

      // Add completion comment
      if (proofPhoto) {
        await dbComments.insertOne({
          issueId: new ObjectId(issueId),
          userId: new ObjectId(user!.id),
          message: `Issue marked as fixed. Proof photo attached.`,
          createdAt: new Date(),
        });
      }

      return { success: true };
    },

    // Add comment to issue
    addComment: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { issueId, message } = z.object({
        issueId: z.string(),
        message: z.string().min(1),
      }).parse(args);

      await dbComments.insertOne({
        issueId: new ObjectId(issueId),
        userId: new ObjectId(user.id),
        message,
        createdAt: new Date(),
      });

      return { success: true };
    },

    // Update technician availability
    updateTechnicianAvailability: async (args: unknown, { user }: { user: UserInfo | null }) => {
      const profile = await requireRole(user, ['Technician']);

      const { available } = z.object({
        available: z.boolean(),
      }).parse(args);

      await dbTechnicians.updateOne(
        { userId: profile.userId },
        { $set: { available } }
      );

      return { success: true };
    },

    // Update technician specialty
    updateTechnicianSpecialty: async (args: unknown, { user }: { user: UserInfo | null }) => {
      const profile = await requireRole(user, ['Technician']);

      const { specialty } = z.object({
        specialty: z.string().min(1),
      }).parse(args);

      await dbTechnicians.updateOne(
        { userId: profile.userId },
        { $set: { specialty } }
      );

      return { success: true };
    },

    // Delete issue (admin only)
    deleteIssue: async (args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['Admin', 'SuperAdmin']);

      const { issueId } = z.object({
        issueId: z.string(),
      }).parse(args);

      // Delete all comments associated with the issue
      await dbComments.deleteMany({ issueId: new ObjectId(issueId) });

      // Delete the issue
      const result = await dbIssues.deleteOne({ _id: new ObjectId(issueId) });

      if (result.deletedCount === 0) {
        throw new Error('Issue not found');
      }

      return { success: true };
    },

    // Approve admin (superadmin only)
    approveAdmin: async (args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['SuperAdmin']);

      const { adminId } = z.object({
        adminId: z.string(),
      }).parse(args);

      const result = await dbUserProfiles.updateOne(
        { _id: new ObjectId(adminId), role: 'Admin' },
        { $set: { adminStatus: 'approved' } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Admin not found');
      }

      return { success: true };
    },

    // Reject admin (superadmin only)
    rejectAdmin: async (args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['SuperAdmin']);

      const { adminId } = z.object({
        adminId: z.string(),
      }).parse(args);

      const result = await dbUserProfiles.updateOne(
        { _id: new ObjectId(adminId), role: 'Admin' },
        { $set: { adminStatus: 'rejected' } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Admin not found');
      }

      return { success: true };
    },

    // Revoke admin access (superadmin only)
    revokeAdmin: async (args: unknown, { user }: { user: UserInfo | null }) => {
      await requireRole(user, ['SuperAdmin']);

      const { adminId } = z.object({
        adminId: z.string(),
      }).parse(args);

      const result = await dbUserProfiles.updateOne(
        { _id: new ObjectId(adminId), role: 'Admin' },
        { $set: { adminStatus: 'rejected' } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Admin not found');
      }

      return { success: true };
    },
  },
});
