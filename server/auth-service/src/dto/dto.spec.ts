import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { LoginDto } from './login.dto';
import { UpdateRoleDto } from './update-role.dto';

describe('auth request DTOs', () => {
  it('rejects a login without a username', async () => {
    const dto = plainToInstance(LoginDto, { password: 'valid-password' });
    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('username');
  });

  it('rejects user creation without a username or valid password', async () => {
    const dto = plainToInstance(CreateUserDto, { password: 'short' });
    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['username', 'password']),
    );
  });

  it('rejects roles outside the Prisma enum', async () => {
    const dto = plainToInstance(UpdateRoleDto, { role: 'SUPERUSER' });
    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('role');
  });
});