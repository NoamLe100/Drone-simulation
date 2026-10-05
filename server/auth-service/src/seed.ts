import { existsSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { seedAdminUser } from './seed-admin';

async function seedAdmin(): Promise<void> {
  if (existsSync('.env')) {
    process.loadEnvFile();
  }

  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set');
  }
  if (
    username.length > 64 ||
    password.length < 8 ||
    Buffer.byteLength(password) > 72
  ) {
    throw new Error('Admin username or password does not meet the length requirements');
  }

  const prisma = new PrismaClient();
  try {
    const admin = await seedAdminUser(prisma, username, password);
    console.log(`Admin "${admin.username}" is ready (${admin.id}).`);
  } finally {
    await prisma.$disconnect();
  }
}

void seedAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Admin seed failed');
  process.exitCode = 1;
});