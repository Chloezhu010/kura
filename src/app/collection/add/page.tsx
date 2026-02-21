import type { Metadata } from 'next'
import { AddPhotoScreen } from '@/components/screens/AddPhotoScreen'

export const metadata: Metadata = {
  title: 'Kura — Add Bean',
}

export default function AddPhotoPage() {
  return <AddPhotoScreen />
}
