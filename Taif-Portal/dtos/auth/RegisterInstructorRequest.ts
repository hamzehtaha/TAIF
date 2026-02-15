export interface RegisterInstructorRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  yearsOfExperience?: number;
}
