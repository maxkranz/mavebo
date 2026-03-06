import { redirect } from 'next/navigation'

// /add is handled by the AddModal in AppNav — redirect to feed
export default function AddPage() {
  redirect('/feed')
}
