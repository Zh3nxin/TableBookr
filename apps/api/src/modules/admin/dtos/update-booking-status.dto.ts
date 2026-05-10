import { IsIn } from "class-validator";

export class UpdateBookingStatusDto {
  @IsIn(["accept", "reject", "cancel"])
  action!: "accept" | "reject" | "cancel";
}
