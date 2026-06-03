import { supabase } from '@/lib/supabase'
import ProductForm from '@/components/dashboard/ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  return <ProductForm product={product} />
}
