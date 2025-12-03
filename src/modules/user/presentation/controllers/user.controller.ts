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
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
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
@ApiTags("users")
@Controller("users")
export class UserController {
  private readonly logger = new Logger(UserController.name);

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
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    schema: {
      example: {
        userId: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResult> {
    this.logger.log(
      "Creating user with DTO:",
      JSON.stringify({ ...createUserDto, password: "***" }),
    );
    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.name,
      createUserDto.password,
    );
    const result = await this.commandBus.execute<
      CreateUserCommand,
      CreateUserResult
    >(command);
    this.logger.log("User created successfully:", result.userId);
    return result;
  }

  /**
   * Gets a user by ID
   * GET /users/:id
   */
  @Get(":id")
  @ApiOperation({ summary: "Get a user by ID" })
  @ApiParam({
    name: "id",
    description: "User ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "User found",
    type: UserDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async findById(@Param("id") id: string): Promise<UserDto> {
    const query = new GetUserByIdQuery(id);
    return await this.queryBus.execute<GetUserByIdQuery, UserDto>(query);
  }

  /**
   * Gets a user by email
   * GET /users/email/:email
   */
  @Get("email/:email")
  @ApiOperation({ summary: "Get a user by email" })
  @ApiParam({
    name: "email",
    description: "User email address",
    example: "john.doe@example.com",
  })
  @ApiResponse({
    status: 200,
    description: "User found",
    type: UserDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async findByEmail(@Param("email") email: string): Promise<UserDto> {
    const query = new GetUserByEmailQuery(email);
    return await this.queryBus.execute<GetUserByEmailQuery, UserDto>(query);
  }

  /**
   * Updates user email
   * PUT /users/:id/email
   */
  @Put(":id/email")
  @ApiOperation({ summary: "Update user email" })
  @ApiParam({
    name: "id",
    description: "User ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({ type: UpdateUserEmailDto })
  @ApiResponse({ status: 200, description: "Email updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
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
  @ApiOperation({ summary: "Update user name" })
  @ApiParam({
    name: "id",
    description: "User ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({ type: UpdateUserNameDto })
  @ApiResponse({ status: 200, description: "Name updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
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
  @ApiOperation({ summary: "Update user password" })
  @ApiParam({
    name: "id",
    description: "User ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({ type: UpdateUserPasswordDto })
  @ApiResponse({ status: 200, description: "Password updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
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
  @ApiOperation({ summary: "Delete a user" })
  @ApiParam({
    name: "id",
    description: "User ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 204, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(@Param("id") id: string): Promise<void> {
    const command = new DeleteUserCommand(id);
    await this.commandBus.execute<DeleteUserCommand, void>(command);
  }
}
