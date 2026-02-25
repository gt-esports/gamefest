export type StaffMember = {
    id: string;
    name: string;
    assignment: string | null;
};

export type CreateStaffMemberInput = {
    name: string;
    assignment?: string | null;
};

export type UpdateStaffMemberInput = {
    name?: string;
    assignment?: string | null;
};
