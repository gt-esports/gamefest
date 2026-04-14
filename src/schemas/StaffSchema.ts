// Staff is derived from user_roles (role='staff' or 'admin') joined with users.
// A "staff member" is a user who holds a staff role, with an optional assignment.
export type StaffMember = {
    userId: string;
    name: string;
    assignment: string | null;
};

export type CreateStaffMemberInput = {
    userId: string;
    assignment?: string | null;
};

export type UpdateStaffMemberInput = {
    assignment?: string | null;
};
