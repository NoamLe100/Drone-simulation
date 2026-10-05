import { ConflictException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

describe('UsersService', () => {
  const findMany = jest.fn();
  const create = jest.fn();
  const findUnique = jest.fn();
  const update = jest.fn();
  const deleteUser = jest.fn();
  const service = new UsersService(
    {
      user: { findMany, create, findUnique, update, delete: deleteUser },
    } as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with a bcrypt hash and omits the hash from its response', async () => {
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password');
    create.mockResolvedValue({ id: 'user-id', username: 'noam', role: Role.USER });

    await expect(service.create('noam', 'valid-password')).resolves.toEqual({
      id: 'user-id',
      username: 'noam',
      role: Role.USER,
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { username: 'noam', passwordHash: 'hashed-password' },
      }),
    );
  });

  it('maps a duplicate username P2002 error to ConflictException', async () => {
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password');
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['username'] },
      }),
    );

    await expect(service.create('noam', 'valid-password')).rejects.toThrow(
      new ConflictException('A user with this username already exists'),
    );
  });

  it('updates an existing user role', async () => {
    findUnique.mockResolvedValue({ id: 'user-id' });
    update.mockResolvedValue({ id: 'user-id', username: 'noam', role: Role.ADMIN });

    await expect(service.updateRole('user-id', Role.ADMIN)).resolves.toMatchObject({
      role: Role.ADMIN,
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-id' }, data: { role: Role.ADMIN } }),
    );
  });

  it('deletes an existing user', async () => {
    findUnique.mockResolvedValue({ id: 'user-id' });
    deleteUser.mockResolvedValue({ id: 'user-id' });

    await expect(service.remove('user-id')).resolves.toEqual({ id: 'user-id' });
    expect(deleteUser).toHaveBeenCalledWith({ where: { id: 'user-id' } });
  });
});