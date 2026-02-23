import { UserRole } from "@/enums/user-role.enum";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
  interests?: string[];
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
}