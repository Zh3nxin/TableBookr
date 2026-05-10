import { Body, Controller, Post } from "@nestjs/common";

import { AdminLoginDto } from "./dtos/admin-login.dto";
import { AdminAuthService } from "./admin-auth.service";

@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post("login")
  login(@Body() input: AdminLoginDto) {
    return this.adminAuthService.login(input.email, input.password);
  }
}
