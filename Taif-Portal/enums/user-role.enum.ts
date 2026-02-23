export enum UserRole {
  SystemAdmin = 0,
  OrgAdmin = 1,
  Instructor = 2,
  Student = 3,
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.SystemAdmin]: "System Admin",
  [UserRole.OrgAdmin]: "Organization Admin",
  [UserRole.Instructor]: "Instructor",
  [UserRole.Student]: "Student",
};

export function isInstructor(role: UserRole): boolean {
  return role === UserRole.Instructor;
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.SystemAdmin || role === UserRole.OrgAdmin;
}

export function canCreateCourses(role: UserRole): boolean {
  return role === UserRole.SystemAdmin || role === UserRole.OrgAdmin || role === UserRole.Instructor;
}
