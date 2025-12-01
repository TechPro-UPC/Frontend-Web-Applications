import { AccountEntity } from '../model/account.entity';
import { AccountResponse } from './account.reponse';

export class AccountAssembler {
  static toEntityFromResource(resource: AccountResponse): AccountEntity {
    return {
      id: resource.id,
      email: resource.email,
      passwordHash: resource.passwordHash,
      role: resource.role,
      isActive: resource.isActive
    };
  }

  static toEntitiesFromResponse(resources: AccountResponse[]): AccountEntity[] {
    return resources.map(this.toEntityFromResource);
  }
}
