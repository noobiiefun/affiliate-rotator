import { supabase } from '@/lib/supabase'
import * as offlineDb from '@/lib/offline-db'
import RotatorForm from '@/components/dashboard/RotatorForm'
import { notFound } from 'next/navigation'

const OFFLINE = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

export default async function EditRotatorPage({ params }: { params: { id: string } }) {
  const rotator = OFFLINE
    ? offlineDb.findRotator(params.id)
    : (await supabase.from('rotators').select('*').eq('id', params.id).single()).data

  if (!rotator) notFound()

  return <RotatorForm rotator={rotator} />
}
