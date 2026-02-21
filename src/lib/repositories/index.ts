import type { BeansRepository } from './types'
import { LocalStorageBeansRepository } from './localStorage'

// Phase 2: swap this for SupabaseBeansRepository when NEXT_PUBLIC_PHASE=2
let _repository: BeansRepository | null = null

export function getRepository(): BeansRepository {
  if (!_repository) {
    _repository = new LocalStorageBeansRepository()
  }
  return _repository
}

export type { BeansRepository }
export type { Bean, RoastLevel } from './types'
