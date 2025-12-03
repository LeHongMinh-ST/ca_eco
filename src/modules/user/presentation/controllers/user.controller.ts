import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "../../application/commands/create-user/create-user.command";
import { CreateUserResult } from "../../application/commands/create-user/create-user.result";
import { UpdateUserEmailCommand } from "../../application/commands/update-user-email/update-user-email.command";
import { UpdateUserNameCommand } from "../../application/commands/update-user-name/update-user-name.command";
import { UpdateUserPasswordCommand } from "../../application/commands/update-user-password/update-user-password.command";
import { DeleteUserCommand } from "../../application/commands/delete-user/delete-user.command";
import { GetUserByIdQuery } from "../../application/queries/get-user-by-id/get-user-by-id.query";
import { GetUserByEmailQuery } from "../../application/queries/get-user-by-email/get-user-by-email.query";
import { UserDto } from "../../application/queries/dtos/user.dto";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserEmailDto } from "../dtos/update-user-email.dto";
import { UpdateUserNameDto } from "../dtos/update-user-name.dto";
import { UpdateUserPasswordDto } from "../dtos/update-user-password.dto";

/**
 * UserController handles HTTP requests for user operations
 */
@Controller("users")
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Creates a new user
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResult> {
    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.name,
      createUserDto.password,
    );
    return await this.commandBus.execute<CreateUserCommand, CreateUserResult>(
      command,
    );
  }

  /**
   * Gets a user by ID
   * GET /users/:id
   */
  @Get(":id")
  async findById(@Param("id") id: string): Promise<UserDto> {
    const query = new GetUserByIdQuery(id);
    return await this.queryBus.execute<GetUserByIdQuery, UserDto>(query);
  }

  /**
   * Gets a user by email
   * GET /users/email/:email
   */
  @Get("email/:email")
  async findByEmail(@Param("email") email: string): Promise<UserDto> {
    const query = new GetUserByEmailQuery(email);
    return await this.queryBus.execute<GetUserByEmailQuery, UserDto>(query);
  }

  /**
   * Updates user email
   * PUT /users/:id/email
   */
  @Put(":id/email")
  async updateEmail(
    @Param("id") id: string,
    @Body() updateEmailDto: UpdateUserEmailDto,
  ): Promise<void> {
    const command = new UpdateUserEmailCommand(id, updateEmailDto.email);
    await this.commandBus.execute<UpdateUserEmailCommand, void>(command);
  }

  /**
   * Updates user name
   * PUT /users/:id/name
   */
  @Put(":id/name")
  async updateName(
    @Param("id") id: string,
    @Body() updateNameDto: UpdateUserNameDto,
  ): Promise<void> {
    const command = new UpdateUserNameCommand(id, updateNameDto.name);
    await this.commandBus.execute<UpdateUserNameCommand, void>(command);
  }

  /**
   * Updates user password
   * PUT /users/:id/password
   * Note: Password should be hashed before saving
   */
  @Put(":id/password")
  async updatePassword(
    @Param("id") id: string,
    @Body() updatePasswordDto: UpdateUserPasswordDto,
  ): Promise<void> {
    const command = new UpdateUserPasswordCommand(
      id,
      updatePasswordDto.password,
    );
    await this.commandBus.execute<UpdateUserPasswordCommand, void>(command);
  }

  /**
   * Deletes a user
   * DELETE /users/:id
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    const command = new DeleteUserCommand(id);
    await this.commandBus.execute<DeleteUserCommand, void>(command);
  }
}

