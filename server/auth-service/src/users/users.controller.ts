import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UsersService } from './users.service';

@Controller('users')
@Roles('ADMIN')
@ApiTags('users')
@ApiCookieAuth('accessToken')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ description: 'Returns users without password hashes.' })
  @ApiResponse({ status: 401, description: 'Authentication cookie is missing or invalid.' })
  @ApiResponse({ status: 403, description: 'The authenticated user is not an admin.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a user with the USER role' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'User created.' })
  @ApiResponse({ status: 409, description: 'A user with this username already exists.' })
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body.username, body.password);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change a user role' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({ description: 'User role updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.usersService.updateRole(id, body.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiOkResponse({ description: 'User deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}