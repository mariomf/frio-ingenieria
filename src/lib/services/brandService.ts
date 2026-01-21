import { supabase } from '@/lib/supabase'
import type { Brand } from '@/types/database'

/**
 * Servicio para gestionar operaciones relacionadas con marcas (brands)
 */

/**
 * Obtiene todas las marcas ordenadas por nombre
 * @returns Array de marcas o null si hay error
 */
export async function getAllBrands(): Promise<Brand[] | null> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching brands:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching brands:', error)
    return null
  }
}

/**
 * Obtiene una marca por su slug
 * @param slug - Slug único de la marca
 * @returns Marca encontrada o null
 */
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error(`Error fetching brand with slug ${slug}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching brand by slug:', error)
    return null
  }
}

/**
 * Obtiene todas las marcas que son distribuidores directos
 * @returns Array de marcas distribuidoras directas o null
 */
export async function getDirectDistributorBrands(): Promise<Brand[] | null> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_direct_distributor', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching direct distributor brands:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching direct distributor brands:', error)
    return null
  }
}

/**
 * Obtiene una marca por su ID
 * @param id - UUID de la marca
 * @returns Marca encontrada o null
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching brand with id ${id}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching brand by id:', error)
    return null
  }
}
