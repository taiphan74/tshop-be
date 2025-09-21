import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiResponse({ status: 201, type: UserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(createUserDto);
    return plainToInstance(UserDto, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, type: [UserDto] })
  async findAll(): Promise<UserDto[]> {
    const users = await this.usersService.findAll();
    return users.map(user => plainToInstance(UserDto, user));
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserDto })
  async getProfile(@Req() req: any): Promise<UserDto> {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(UserDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserDto })
  async updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.usersService.update(req.user.userId, updateUserDto);
    return plainToInstance(UserDto, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, type: UserDto })
  async findOne(@Param('id') id: string): Promise<UserDto> {
    const user = await this.usersService.findOne(id);
    return plainToInstance(UserDto, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  @ApiResponse({ status: 200, type: UserDto })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return plainToInstance(UserDto, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}