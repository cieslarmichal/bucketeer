import { UserRole } from '@common/contracts';

import {
  createUserBodyDTOSchema,
  createUserResponseBodyDTOSchema,
  type CreateUserResponseBodyDTO,
  type CreateUserBodyDTO,
} from './schemas/createUserSchema.js';
import {
  deleteUserResponseBodyDTOSchema,
  type DeleteUserResponseBodyDTO,
  type DeleteUserPathParamsDTO,
  deleteUserPathParamsDTOSchema,
} from './schemas/deleteUserSchema.js';
import {
  findUserPathParamsDTOSchema,
  findUserResponseBodyDTOSchema,
  type FindUserPathParamsDTO,
  type FindUserResponseBodyDTO,
} from './schemas/findUserSchema.js';
import {
  type FindUsersQueryParamsDTO,
  findUsersQueryParamsDTOSchema,
  findUsersResponseBodyDTOSchema,
  type FindUsersResponseBodyDTO,
} from './schemas/findUsersSchema.js';
import {
  type GrantBucketAccessResponseBodyDTO,
  type GrantBucketAccessBodyDTO,
  type GrantBucketAccessPathParamsDTO,
  grantBucketAccessResponseBodyDTOSchema,
  grantBucketAccessBodyDTOSchema,
  grantBucketAccessPathParamsDTOSchema,
} from './schemas/grantBucketAccessSchema.js';
import {
  revokeBucketAccessResponseBodyDTOSchema,
  type RevokeBucketAccessBodyDTO,
  type RevokeBucketAccessPathParamsDTO,
  type RevokeBucketAccessResponseBodyDTO,
  revokeBucketAccessPathParamsDTOSchema,
} from './schemas/revokeBucketAccessSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpOkResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateUserCommandHandler } from '../../../application/commandHandlers/createUserCommandHandler/createUserCommandHandler.js';
import { type DeleteUserCommandHandler } from '../../../application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler.js';
import { type GrantBucketAccessCommandHandler } from '../../../application/commandHandlers/grantBucketAccessCommandHandler/grantBucketAccessCommandHandler.js';
import { type RevokeBucketAccessCommandHandler } from '../../../application/commandHandlers/revokeBucketAccessCommandHandler/revokeBucketAccessCommandHandler.js';
import { type FindUserQueryHandler } from '../../../application/queryHandlers/findUserQueryHandler/findUserQueryHandler.js';
import { type FindUsersWithBucketsQueryHandler } from '../../../application/queryHandlers/findUsersWithBucketsQueryHandler/findUsersWithBucketsQueryHandler.js';
import { type UserWithBuckets, type User } from '../../../domain/entities/user/user.js';
import { type UserWithBucketsDTO, type UserDTO } from '../common/userDTO.js';

export class AdminUserHttpController implements HttpController {
  public readonly basePath = '/admin/users';

  public constructor(
    private readonly createUserCommandHandler: CreateUserCommandHandler,
    private readonly deleteUserCommandHandler: DeleteUserCommandHandler,
    private readonly findUserQueryHandler: FindUserQueryHandler,
    private readonly findUsersWithBucketsQueryHandler: FindUsersWithBucketsQueryHandler,
    private readonly grantBucketAccessCommandHandler: GrantBucketAccessCommandHandler,
    private readonly revokeBucketAccessCommandHandler: RevokeBucketAccessCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createUser.bind(this),
        schema: {
          request: {
            body: createUserBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createUserResponseBodyDTOSchema,
              description: 'User created',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Create user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':id/grant-bucket-access',
        handler: this.grantBucketAccess.bind(this),
        schema: {
          request: {
            body: grantBucketAccessBodyDTOSchema,
            pathParams: grantBucketAccessPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: grantBucketAccessResponseBodyDTOSchema,
              description: 'Bucket access granted',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User', 'Bucket'],
        description: 'Grant bucket access',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':id/revoke-bucket-access',
        handler: this.revokeBucketAccess.bind(this),
        schema: {
          request: {
            body: grantBucketAccessBodyDTOSchema,
            pathParams: revokeBucketAccessPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: revokeBucketAccessResponseBodyDTOSchema,
              description: 'Bucket access revoked',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User', 'Bucket'],
        description: 'Revoke bucket access',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findUser.bind(this),
        schema: {
          request: {
            pathParams: findUserPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserResponseBodyDTOSchema,
              description: 'User found',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Find user by id',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findUsers.bind(this),
        schema: {
          request: {
            queryParams: findUsersQueryParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUsersResponseBodyDTOSchema,
              description: 'Users found',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Find users',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteUser.bind(this),
        schema: {
          request: {
            pathParams: deleteUserPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserResponseBodyDTOSchema,
              description: 'User deleted',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Delete user',
      }),
    ];
  }

  private async createUser(
    request: HttpRequest<CreateUserBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateUserResponseBodyDTO>> {
    const { email, password } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { user } = await this.createUserCommandHandler.execute({
      email,
      password,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapUserToUserDTO(user),
    };
  }

  private async grantBucketAccess(
    request: HttpRequest<GrantBucketAccessBodyDTO, undefined, GrantBucketAccessPathParamsDTO>,
  ): Promise<HttpNoContentResponse<GrantBucketAccessResponseBodyDTO>> {
    const { bucketName } = request.body;

    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    await this.grantBucketAccessCommandHandler.execute({
      userId: id,
      bucketName,
    });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private async revokeBucketAccess(
    request: HttpRequest<RevokeBucketAccessBodyDTO, undefined, RevokeBucketAccessPathParamsDTO>,
  ): Promise<HttpNoContentResponse<RevokeBucketAccessResponseBodyDTO>> {
    const { bucketName } = request.body;

    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    await this.revokeBucketAccessCommandHandler.execute({
      userId: id,
      bucketName,
    });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private async findUser(
    request: HttpRequest<undefined, undefined, FindUserPathParamsDTO>,
  ): Promise<HttpOkResponse<FindUserResponseBodyDTO>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { user } = await this.findUserQueryHandler.execute({ userId: id });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserToUserDTO(user),
    };
  }

  private async findUsers(
    request: HttpRequest<undefined, FindUsersQueryParamsDTO, undefined>,
  ): Promise<HttpOkResponse<FindUsersResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const page = request.queryParams.page ?? 1;

    const pageSize = request.queryParams.pageSize ?? 10;

    const { users, totalUsers } = await this.findUsersWithBucketsQueryHandler.execute({
      page,
      pageSize,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: users.map((user) => this.mapUserWithBucketsToUserWithBucketsDto(user)),
        metadata: {
          page,
          pageSize,
          totalPages: Math.ceil(totalUsers / pageSize),
        },
      },
    };
  }

  private async deleteUser(
    request: HttpRequest<undefined, undefined, DeleteUserPathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteUserResponseBodyDTO>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    await this.deleteUserCommandHandler.execute({ userId: id });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapUserToUserDTO(user: User): UserDTO {
    return {
      id: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
    };
  }

  private mapUserWithBucketsToUserWithBucketsDto(user: UserWithBuckets): UserWithBucketsDTO {
    return {
      id: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
      buckets: user.getBuckets(),
    };
  }
}
