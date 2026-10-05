import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';
import { PrismaService } from './../src/prisma/prisma.service';
import { seedAdminUser } from './../src/seed-admin';
import { Test } from '@nestjs/testing';

describe('Auth service e2e', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const suffix = randomUUID();
  const adminUsername = `e2e-admin-${suffix}`;
  const userUsername = `e2e-user-${suffix}`;
  const password = 'E2E-Only-Password-2026!';

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'test-only-jwt-secret-for-auth-service-e2e';

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    await seedAdminUser(prisma, adminUsername, password);
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({
        where: { username: { in: [adminUsername, userUsername] } },
      });
    }
    await app?.close();
  });

  it('seeds an admin, logs in with an HttpOnly cookie, creates a user, and lists users', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: adminUsername, password })
      .expect(201);

    expect(loginResponse.body).toEqual({ message: 'Login successful' });
    expect(loginResponse.body.accessToken).toBeUndefined();

    const setCookie = loginResponse.headers['set-cookie'] as string[];
    expect(setCookie[0]).toMatch(/HttpOnly/i);
    expect(setCookie[0]).toMatch(/SameSite=Lax/i);
    const cookie = setCookie[0].split(';')[0];

    await request(app.getHttpServer())
      .post('/users')
      .set('Cookie', cookie)
      .send({ username: userUsername, password: 'Valid-user-password-2026!' })
      .expect(201);

    const usersResponse = await request(app.getHttpServer())
      .get('/users')
      .set('Cookie', cookie)
      .expect(200);

    expect(usersResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: adminUsername, role: 'ADMIN' }),
        expect.objectContaining({ username: userUsername, role: 'USER' }),
      ]),
    );
    expect(usersResponse.body[0].passwordHash).toBeUndefined();
  });

  it('documents endpoints and formats validation errors consistently', async () => {
    const docsResponse = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);
    expect(docsResponse.body.paths['/auth/login']).toBeDefined();
    expect(docsResponse.body.paths['/users']).toBeDefined();

    const errorResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ password })
      .expect(400);
    expect(errorResponse.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: expect.any(Array),
        timestamp: expect.any(String),
        path: '/auth/login',
      }),
    );
  });

  it('clears the access cookie on logout without requiring authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(201);

    expect(response.body).toEqual({ message: 'Logged out' });
    expect(response.headers['set-cookie'][0]).toMatch(/accessToken=;/);
    expect(response.headers['set-cookie'][0]).toMatch(/Path=\//i);
  });
});