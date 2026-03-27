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
};

export type CreateRegistrationInput = {
  first_name: string;
  last_name: string;
  email: string;
  admission_type: AdmissionType;
  school?: string | null;
  heard_from?: string | null;
};
