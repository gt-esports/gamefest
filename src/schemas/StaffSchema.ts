export type StaffAssignment = {
  id: string;
  type: 'game' | 'challenge';
  assignmentId: string;
  assignmentName: string;
  pointsPerAward: number;
  maxPoints: number;
};

export type StaffMember = {
  userId: string;
  role: 'staff' | 'admin';
  name: string;
  assignments: StaffAssignment[];
};
