import { Type } from "class-transformer";
import { IsInt, Matches, Max, Min } from "class-validator";

export class AvailabilityRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "date must use YYYY-MM-DD format"
  })
  date!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(16)
  guestCount!: number;
}
