export type RoastLevel = 'Light' | 'Medium' | 'Dark'

export interface Bean {
  id: string
  photo?: string       // base64 in Phase 1, Supabase Storage URL in Phase 2
  tastingNotes: string // required
  rating: number       // 1–5, required
  name?: string
  origin?: string
  roaster?: string
  roastLevel?: RoastLevel
  brewMethod?: string
  price?: number       // in €
  createdAt: string    // ISO timestamp
  updatedAt: string    // ISO timestamp
}

export interface BeansRepository {
  getAll(): Promise<Bean[]>
  getById(id: string): Promise<Bean | null>
  save(bean: Bean): Promise<Bean>   // handles both create and update
  delete(id: string): Promise<void>
  uploadPhoto(file: File): Promise<string>  // returns base64 or Storage URL
}
