import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/users/entities/user.entity";

type AllowdRoles = keyof typeof UserRole | "Any";

export const Role = (roles:AllowdRoles[]) => SetMetadata("roles", roles);