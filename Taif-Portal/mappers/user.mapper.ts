import { UserDto } from "@/dtos/user.dto";
import { User } from "@/models/user.model";
import { UserRole } from "@/enums/user-role.enum";

export class UserMapper {
    static map(dto: UserDto): User {
        if (!dto) return null as unknown as User;
        return {
            id: dto.id,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            isActive: dto.isActive,
            interests: dto.interests || [],
            role: dto.role as UserRole,
            organizationId: dto.organizationId,
            organizationName: dto.organizationName,
        };
    }
}