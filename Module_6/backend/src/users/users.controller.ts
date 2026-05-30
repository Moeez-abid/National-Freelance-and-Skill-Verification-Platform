import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Returns all users (contacts list for New Message view)
   */
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * GET /users/:id
   * Returns a single user's profile
   */
  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  /**
   * GET /users/:id/online-users
   * Returns list of all users with their basic info
   * Used to populate contacts list
   */
  @Get(':id/contacts')
  getContacts(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getContacts(id);
  }
}
