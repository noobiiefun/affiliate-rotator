import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import LandingPageClient from './LandingPageClient'

interface Props { params: { slug: string } }

// Generate metadata untuk SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url, price, marketplace')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) return { title: 'Produk Tidak Ditemukan' }

  const title       = product.name
  const description = product.description || `Dapatkan ${product.name} dengan harga terbaik!`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image_url ? [{ url: product.image_url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductLandingPage({ params }: Props) {
  const supabase = createServerSupabaseClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  return <LandingPageClient product={product} />
}
