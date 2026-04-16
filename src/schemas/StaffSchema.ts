// Staff assignment is now tied to a specific game or challenge via FK.
// assignmentType: which kind of entity they're assigned to (null = floater, no award privilege).
// assignmentId: the game/challenge UUID.
// assignmentName: display name of the game/challenge.
// pointsPerAward / maxPoints: inherited from the assigned game/challenge.
export type StaffMember = {
    userId: string;
    role: 'staff' | 'admin';
    name: string;
    assignmentType: 'game' | 'challenge' | null;
    assignmentId: string | null;
    assignmentName: string | null;
    pointsPerAward: number | null;
    maxPoints: number | null;
};

export type CreateStaffMemberInput = {
    userId: string;
    gameAssignmentId?: string | null;
    challengeAssignmentId?: string | null;
};

export type UpdateStaffMemberInput = {
    gameAssignmentId?: string | null;
    challengeAssignmentId?: string | null;
};
