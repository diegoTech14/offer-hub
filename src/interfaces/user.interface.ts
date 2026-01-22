/**
 * Legacy User interface for backward compatibility with existing components
 * This interface represents a user in the legacy system format
 */
export interface User {
    /** Unique identifier for the user */
    id: number,
    /** Full name of the user */
    name: string,
    /** Email address of the user */
    email: string,
    /** Whether the user's email has been validated */
    emailValidated: boolean,
    /** Identity card number or identifier */
    identityCard: string,
    /** Current status of the user (e.g., 'Active', 'Inactive') */
    status: string,
    /** Date when the user submitted their application */
    submissionDate: string,
    /** Geographic location of the user */
    location: string,
    /** Role of the user in the system (e.g., 'Freelancer', 'Client') */
    role: string,
    /** Analytics data for the user's performance metrics */
    analytics: {
        /** Total number of clients the user has worked with */
        totalClients: number
        /** Change in client count compared to previous period */
        clientsChange: number
        /** Total number of jobs completed by the user */
        completedJobs: number
        /** Change in completed jobs compared to previous period */
        jobsChange: number
        /** Total amount of payments received by the user */
        totalPayments: number
        /** Change in payments compared to previous period */
        paymentsChange: number
        /** Total number of profile views */
        profileViews: number
        /** Change in profile views compared to previous period */
        viewsChange: number
      }
}

/**
 * Admin User interface representing a user in the admin system
 * This interface contains the core user data from the admin database
 */
export interface AdminUser {
    /** Unique identifier for the user */
    id: string;                    
    /** Blockchain wallet address associated with the user */
    wallet_address: string;       
    /** Username chosen by the user */
    username: string;            
    /** Optional full name of the user */
    name?: string;
    /** Optional biographical information about the user */
    bio?: string;
    /** Optional email address of the user */
    email?: string;
    /** Whether the user is a freelancer (true), client (false), or unknown (undefined) */
    is_freelancer?: boolean;
    /** Timestamp when the user account was created */
    created_at?: string;
}

/**
 * Maps an AdminUser to the legacy User interface format
 * This function converts the admin user data structure to the legacy format
 * for backward compatibility with existing components
 * 
 * @param adminUser - The admin user object to convert
 * @returns A User object in the legacy format
 */
export const mapAdminUserToLegacy = (adminUser: AdminUser): User => ({
    id: parseInt(adminUser.id.replace(/-/g, '').substring(0, 8), 16),
    name: adminUser.name || adminUser.username,
    email: adminUser.email || '',
    emailValidated: !!adminUser.email,
    identityCard: '',
    status: 'Active',
    submissionDate: adminUser.created_at ? new Date(adminUser.created_at).toISOString().split('T')[0] : '',
    location: '',
    role: adminUser.is_freelancer === true ? 'Freelancer' : adminUser.is_freelancer === false ? 'Client' : 'Unknown',
    analytics: {
        totalClients: 0,
        clientsChange: 0,
        completedJobs: 0,
        jobsChange: 0,
        totalPayments: 0,
        paymentsChange: 0,
        profileViews: 0,
        viewsChange: 0,
    }
});

/**
 * Determines the role of an admin user based on their freelancer status
 * 
 * @param user - The admin user object to check
 * @returns A string representing the user's role: 'Freelancer', 'Client', or 'Unknown'
 */
export const getUserRole = (user: AdminUser): string => {
    if (user.is_freelancer === true) return 'Freelancer';
    if (user.is_freelancer === false) return 'Client';
    return 'Unknown';
};

// export interface AnalyticsUser {
//     id: number
//     name: string
//     email: string
//     location: string
//     userId: string
//     role: string
//     status: string
//     dateJoined: string
//     analytics: {
//       totalClients: number
//       clientsChange: number
//       completedJobs: number
//       jobsChange: number
//       totalPayments: number
//       paymentsChange: number
//       profileViews: number
//       viewsChange: number
//     }
//   }