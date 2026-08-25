export interface Subject {
  id: string;
  name: string;
}

export interface SubjectsResponse {
  status?: string;
  success?: boolean;
  message?: string;
  data: Subject[];
}