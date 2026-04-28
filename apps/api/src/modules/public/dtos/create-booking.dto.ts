import { Transform, Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, Matches, Max, Min } from "class-validator";

function trimString({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(16)
  guestCount!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "date must use YYYY-MM-DD format"
  })
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "time must use HH:mm format"
  })
  time!: string;

  @Transform(trimString)
  @IsNotEmpty()
  name!: string;

  @Transform(trimString)
  @IsEmail()
  email!: string;

  @Transform(trimString)
  @IsNotEmpty()
  phone!: string;
}
