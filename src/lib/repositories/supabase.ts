import type { Bean, BeansRepository, RoastLevel } from './types'
import { compressImage } from '@/lib/compressImage'
import { getSupabaseBrowserClient } from '@/lib/supabase'

interface BeanRow {
  id: string
  name: string | null
  origin: string | null
  roaster: string | null
  roast_level: string | null
  brew_method: string | null
  tasting_notes: string
  rating: number
  price: number | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

function rowToBean(row: BeanRow): Bean {
  return {
    id: row.id,
    photo: row.photo_url ?? undefined,
    tastingNotes: row.tasting_notes,
    rating: row.rating,
    name: row.name ?? undefined,
    origin: row.origin ?? undefined,
    roaster: row.roaster ?? undefined,
    roastLevel: (row.roast_level as RoastLevel) ?? undefined,
    brewMethod: row.brew_method ?? undefined,
    price: row.price ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function beanToRow(bean: Bean) {
  return {
    id: bean.id,
    name: bean.name ?? null,
    origin: bean.origin ?? null,
    roaster: bean.roaster ?? null,
    roast_level: bean.roastLevel ?? null,
    brew_method: bean.brewMethod ?? null,
    tasting_notes: bean.tastingNotes,
    rating: bean.rating,
    price: bean.price ?? null,
    photo_url: bean.photo ?? null,
  }
}

export class SupabaseBeansRepository implements BeansRepository {
  private get client() {
    return getSupabaseBrowserClient()
  }

  async getAll(): Promise<Bean[]> {
    const { data, error } = await this.client
      .from('beans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as BeanRow[]).map(rowToBean)
  }

  async getById(id: string): Promise<Bean | null> {
    const { data, error } = await this.client
      .from('beans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // not found
      throw new Error(error.message)
    }
    return rowToBean(data as BeanRow)
  }

  async save(bean: Bean): Promise<Bean> {
    const { data: { user } } = await this.client.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const row = { ...beanToRow(bean), user_id: user.id }
    const { data, error } = await this.client
      .from('beans')
      .upsert(row)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return rowToBean(data as BeanRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('beans')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async uploadPhoto(file: File): Promise<string> {
    // Compress to JPEG blob
    const base64 = await compressImage(file)
    const res = await fetch(base64)
    const blob = await res.blob()

    const { data: { user } } = await this.client.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const path = `${user.id}/${crypto.randomUUID()}.jpg`
    const { error: uploadError } = await this.client.storage
      .from('bean-photos')
      .upload(path, blob, { contentType: 'image/jpeg' })

    if (uploadError) throw new Error(uploadError.message)

    const { data } = await this.client.storage
      .from('bean-photos')
      .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

    if (!data?.signedUrl) throw new Error('Failed to create signed URL')
    return data.signedUrl
  }
}
