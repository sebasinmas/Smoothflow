import type { Role } from "@smoothflow/shared";
import type { UserEntity } from "../entities.js";

export interface NewUser {
  clinicId?: string | null;
  email: string;
  passwordHash: string;
  role: Role;
  givenName: string;
  familyName: string;
}

export interface UserChanges {
  givenName?: string;
  familyName?: string;
  role?: Role;
  active?: boolean;
  revokedAt?: Date | null;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  listStaff(clinicId: string): Promise<UserEntity[]>;
  create(data: NewUser): Promise<UserEntity>;
  update(id: string, changes: UserChanges): Promise<UserEntity>;
  markRevoked(id: string): Promise<void>;
  deleteWithReferences(id: string): Promise<void>;
}
