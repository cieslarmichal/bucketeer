import { StatusCodes } from 'http-status-codes';

export enum HttpStatusCode {
  ok = StatusCodes.OK,
  accepted = StatusCodes.ACCEPTED,
  created = StatusCodes.CREATED,
  noContent = StatusCodes.NO_CONTENT,
  badRequest = StatusCodes.BAD_REQUEST,
  unauthorized = StatusCodes.UNAUTHORIZED,
  forbidden = StatusCodes.FORBIDDEN,
  notFound = StatusCodes.NOT_FOUND,
  conflict = StatusCodes.CONFLICT,
  unprocessableEntity = StatusCodes.UNPROCESSABLE_ENTITY,
  internalServerError = StatusCodes.INTERNAL_SERVER_ERROR,
}
