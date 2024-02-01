import { findMyUserResponseBodyDTOSchema } from './schemas/findMyUserSchema.js';
import {
  type LoginUserBodyDTO,
  type LoginUserResponseBodyDTO,
  loginUserBodyDTOSchema,
  loginUserResponseBodyDTOSchema,
} from './schemas/loginUserSchema.js';
import {
  logoutUserPathParamsDTOSchema,
  type LogoutUserBodyDTO,
  type LogoutUserPathParamsDTO,
  type LogoutUserResponseBodyDTO,
  logoutUserBodyDTOSchema,
  logoutUserResponseBodyDTOSchema,
} from './schemas/logoutUserSchema.js';
import {
  refreshUserTokensBodyDTOSchema,
  refreshUserTokensResponseBodyDTOSchema,
  type RefreshUserTokensBodyDTO,
  type RefreshUserTokensResponseBodyDTO,
} from './schemas/refreshUserTokensSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type LoginUserCommandHandler } from '../../../application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler.js';
import { type LogoutUserCommandHandler } from '../../../application/commandHandlers/logoutUserCommandHandler/logoutUserCommandHandler.js';
import { type RefreshUserTokensCommandHandler } from '../../../application/commandHandlers/refreshUserTokensCommandHandler/refreshUserTokensCommandHandler.js';
import { type FindUserQueryHandler } from '../../../application/queryHandlers/findUserQueryHandler/findUserQueryHandler.js';
import { type User } from '../../../domain/entities/user/user.js';
import { type FindUserResponseBodyDTO } from '../adminUserHttpController/schemas/findUserSchema.js';
import { type UserDTO } from '../common/userDTO.js';

export class UserHttpController implements HttpController {
  public readonly basePath = '/api/users';

  public constructor(
    private readonly loginUserCommandHandler: LoginUserCommandHandler,
    private readonly findUserQueryHandler: FindUserQueryHandler,
    private readonly accessControlService: AccessControlService,
    private readonly logoutUserCommandHandler: LogoutUserCommandHandler,
    private readonly refreshUserTokensCommandHandler: RefreshUserTokensCommandHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'login',
        handler: this.loginUser.bind(this),
        schema: {
          request: {
            body: loginUserBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: loginUserResponseBodyDTOSchema,
              description: 'User logged in.',
            },
          },
        },
        tags: ['User'],
        description: 'Login user.',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: 'me',
        handler: this.findMyUser.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              schema: findMyUserResponseBodyDTOSchema,
              description: 'User found.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Find user by token.',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':id/logout',
        handler: this.logoutUser.bind(this),
        schema: {
          request: {
            pathParams: logoutUserPathParamsDTOSchema,
            body: logoutUserBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: logoutUserResponseBodyDTOSchema,
              description: `User logged out.`,
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Logout user.',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'token',
        handler: this.refreshUserTokens.bind(this),
        schema: {
          request: {
            body: refreshUserTokensBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: refreshUserTokensResponseBodyDTOSchema,
              description: 'User tokens refreshed.',
            },
          },
        },
        tags: ['User'],
        description: 'Refresh user tokens.',
      }),
    ];
  }

  private async loginUser(request: HttpRequest<LoginUserBodyDTO>): Promise<HttpOkResponse<LoginUserResponseBodyDTO>> {
    const { email, password } = request.body;

    const { accessToken, refreshToken, accessTokenExpiresIn } = await this.loginUserCommandHandler.execute({
      email,
      password,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiresIn,
      },
    };
  }

  private async findMyUser(request: HttpRequest): Promise<HttpOkResponse<FindUserResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { user } = await this.findUserQueryHandler.execute({ userId });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserToUserDTO(user),
    };
  }

  private async logoutUser(
    request: HttpRequest<LogoutUserBodyDTO, undefined, LogoutUserPathParamsDTO>,
  ): Promise<HttpOkResponse<LogoutUserResponseBodyDTO>> {
    const { id } = request.pathParams;

    const { refreshToken } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedUserId: id,
    });

    await this.logoutUserCommandHandler.execute({
      userId: id,
      refreshToken,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async refreshUserTokens(
    request: HttpRequest<RefreshUserTokensBodyDTO>,
  ): Promise<HttpOkResponse<RefreshUserTokensResponseBodyDTO>> {
    const { refreshToken: inputRefreshToken } = request.body;

    const { accessToken, refreshToken, accessTokenExpiresIn } = await this.refreshUserTokensCommandHandler.execute({
      refreshToken: inputRefreshToken,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiresIn,
      },
    };
  }

  private mapUserToUserDTO(user: User): UserDTO {
    return {
      id: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
    };
  }
}
