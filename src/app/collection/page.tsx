import type { Metadata } from 'next'
import { CollectionScreen } from '@/components/screens/CollectionScreen'

export const metadata: Metadata = {
  title: 'Kura — Collection',
}

export default function CollectionPage() {
  return <CollectionScreen />
}
