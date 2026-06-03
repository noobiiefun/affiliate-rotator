import { supabase } from '@/lib/supabase'
import RotatorForm from '@/components/dashboard/RotatorForm'
import { notFound } from 'next/navigation'

export default async function EditRotatorPage({ params }: { params: { id: string } }) {
  const { data: rotator } = await supabase
    .from('rotators')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!rotator) notFound()

  return <RotatorForm rotator={rotator} />
}
