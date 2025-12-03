import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

/**
 * PasswordHasherService handles password hashing and verification
 * Uses bcryptjs for secure password hashing (pure JavaScript, no native bindings)
 */
@Injectable()
export class PasswordHasherService {
  private readonly SALT_ROUNDS = 10;

  /**
   * Hashes a plain text password
   * @param plainPassword - Plain text password to hash
   * @returns Promise that resolves to hashed password
   */
  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }

  /**
   * Verifies a plain text password against a hashed password
   * @param plainPassword - Plain text password to verify
   * @param hashedPassword - Hashed password to compare against
   * @returns Promise that resolves to true if passwords match, false otherwise
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
