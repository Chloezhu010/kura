import type { Metadata } from 'next'
import { AddFormScreen } from '@/components/screens/AddFormScreen'

export const metadata: Metadata = {
  title: 'Kura — Bean Details',
}

export default function AddFormPage() {
  return <AddFormScreen />
}
