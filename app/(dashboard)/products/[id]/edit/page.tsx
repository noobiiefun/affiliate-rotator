import { supabase } from '@/lib/supabase'
import * as offlineDb from '@/lib/offline-db'
import ProductForm from '@/components/dashboard/ProductForm'
import { notFound } from 'next/navigation'

const OFFLINE = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = OFFLINE
    ? offlineDb.getProduct(params.id)
    : (await supabase.from('products').select('*').eq('id', params.id).single()).data

  if (!product) notFound()

  return <ProductForm product={product} />
}
