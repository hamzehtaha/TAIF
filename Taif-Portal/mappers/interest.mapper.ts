import { Interest } from "@/models/interest.model";
import { InterestDto } from "@/dtos/interest.dto";

export class InterestMapper {
    static map(dto: InterestDto): Interest {
    return {
      id: dto.id,
      name: dto.name,
    };
  }
}