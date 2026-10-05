import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

describe('AuthService', () => {
  const user = {
    id: 'user-id',
    username: 'noam',
    passwordHash: 'bcrypt-hash',
    role: 'ADMIN' as const,
  };
  const findUnique = jest.fn();
  const signAsync = jest.fn();
  const service = new AuthService(
    { user: { findUnique } } as unknown as PrismaService,
    { signAsync } as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a token after valid credentials', async () => {
    findUnique.mockResolvedValue(user);
    jest.mocked(bcrypt.compare).mockResolvedValue(true);
    signAsync.mockResolvedValue('signed-token');

    await expect(service.login('noam', 'valid-password')).resolves.toEqual({
      accessToken: 'signed-token',
    });
    expect(signAsync).toHaveBeenCalledWith({ sub: 'user-id', role: 'ADMIN' });
  });

  it('rejects an incorrect password with a generic error', async () => {
    findUnique.mockResolvedValue(user);
    jest.mocked(bcrypt.compare).mockResolvedValue(false);

    await expect(service.login('noam', 'wrong-password')).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
    expect(signAsync).not.toHaveBeenCalled();
  });

  it('rejects a username that does not exist with the same generic error', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.login('missing', 'any-password')).rejects.toThrow(
      new UnauthorizedException('Invalid credentials'),
    );
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});