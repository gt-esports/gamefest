export type AdmissionType = 'BYOC' | 'GA';

export type Registration = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  admission_type: AdmissionType;
  school: string | null;
  heard_from: string | null;
  created_at: string;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
};

export type CreateRegistrationInput = {
  first_name: string;
  last_name: string;
  email: string;
  admission_type: AdmissionType;
  school?: string | null;
  heard_from?: string | null;
};
