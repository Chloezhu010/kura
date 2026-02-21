import type { Metadata } from 'next'
import { BeanDetailScreen } from '@/components/screens/BeanDetailScreen'

export const metadata: Metadata = {
  title: 'Kura — Bean',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function BeanDetailPage({ params }: Props) {
  const { id } = await params
  return <BeanDetailScreen id={id} />
}
