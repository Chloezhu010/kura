import type { BeansRepository } from './types'
import { LocalStorageBeansRepository } from './localStorage'

let _repository: BeansRepository | undefined

export function getRepository(): BeansRepository {
  if (!_repository) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { SupabaseBeansRepository } = require('./supabase')
      _repository = new SupabaseBeansRepository() as BeansRepository
    } else {
      _repository = new LocalStorageBeansRepository()
    }
  }
  return _repository
}

export type { BeansRepository }
export type { Bean, RoastLevel } from './types'
