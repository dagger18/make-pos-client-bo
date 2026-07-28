import { createMongoAbility } from '@casl/ability'

export const ability = createMongoAbility()
export const initialAbility = [
    {
      action: 'GET',
      subject: 'Auth',
    },
  ]
