export type StaffAssignment = {
  id: string;
  type: 'game' | 'challenge';
  assignmentId: string;
  assignmentName: string;
  maxPoints: number;
};

export type StaffMember = {
  userId: string;
  role: 'staff' | 'admin';
  name: string;
  username: string | null;
  assignments: StaffAssignment[];
};
