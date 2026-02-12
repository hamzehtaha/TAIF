import { UserDto } from "@/dtos/user.dto";
import { User } from "@/models/user.model";

export class UserMapper {
    static map(dto: UserDto): User {
        return {
            id: dto.id,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            isActive: dto.isActive,
            interests: dto.interests || [],
        };
    }
}