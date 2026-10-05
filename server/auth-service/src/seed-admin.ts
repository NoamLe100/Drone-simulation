import { ConflictException } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedAdminUser(
  prisma: PrismaClient,
  username: string,
  password: string,
) {
  const normalizedUsername = username.trim();
  if (
    !normalizedUsername ||
    normalizedUsername.length > 64 ||
    password.length < 8 ||
    Buffer.byteLength(password) > 72
  ) {
    throw new Error('Admin username or password does not meet the length requirements');
  }

  const existing = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });
  if (existing) {
    if (existing.role !== Role.ADMIN) {
      throw new ConflictException(
        `User "${normalizedUsername}" already exists and is not an admin`,
      );
    }
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { username: normalizedUsername, passwordHash, role: Role.ADMIN },
    select: { id: true, username: true, role: true },
  });
}