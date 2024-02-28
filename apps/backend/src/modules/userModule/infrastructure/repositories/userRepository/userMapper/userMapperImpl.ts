import { type UserMapper } from './userMapper.js';
import { User } from '../../../../domain/entities/user/user.js';
import { type UserRawEntity } from '../../../databases/userDatabase/tables/userTable/userRawEntity.js';

export class UserMapperImpl implements UserMapper {
  public mapToDomain(entity: UserRawEntity): User {
    const { id, email, password, role } = entity;

    return new User({
      id,
      email,
      password,
      role,
    });
  }
}
