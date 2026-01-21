import { supabase } from '@/lib/supabase'
import type { Part } from '@/types/database'

/**
 * Servicio para gestionar operaciones relacionadas con refacciones (parts)
 */

interface PartFilters {
  brandId?: string
  category?: string
  subcategory?: string
  inStock?: boolean
  searchTerm?: string
}

/**
 * Obtiene todas las refacciones ordenadas por descripción
 * @returns Array de refacciones o null si hay error
 */
export async function getAllParts(): Promise<Part[] | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('description', { ascending: true })

    if (error) {
      console.error('Error fetching parts:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching parts:', error)
    return null
  }
}

/**
 * Obtiene una refacción por su ID
 * @param id - UUID de la refacción
 * @returns Refacción encontrada o null
 */
export async function getPartById(id: string): Promise<Part | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching part with id ${id}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching part by id:', error)
    return null
  }
}

/**
 * Obtiene refacciones por número de parte
 * @param partNumber - Número de parte
 * @returns Refacción encontrada o null
 */
export async function getPartByPartNumber(partNumber: string): Promise<Part | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('part_number', partNumber)
      .single()

    if (error) {
      console.error(`Error fetching part with part_number ${partNumber}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching part by part number:', error)
    return null
  }
}

/**
 * Obtiene refacciones por marca
 * @param brandId - UUID de la marca
 * @returns Array de refacciones de la marca o null
 */
export async function getPartsByBrand(brandId: string): Promise<Part[] | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('brand_id', brandId)
      .order('part_number', { ascending: true })

    if (error) {
      console.error(`Error fetching parts for brand ${brandId}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching parts by brand:', error)
    return null
  }
}

/**
 * Obtiene refacciones por categoría
 * @param category - Categoría de la refacción
 * @returns Array de refacciones de la categoría o null
 */
export async function getPartsByCategory(category: string): Promise<Part[] | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('category', category)
      .order('description', { ascending: true })

    if (error) {
      console.error(`Error fetching parts for category ${category}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching parts by category:', error)
    return null
  }
}

/**
 * Obtiene refacciones en stock
 * @returns Array de refacciones disponibles o null
 */
export async function getInStockParts(): Promise<Part[] | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('in_stock', true)
      .order('part_number', { ascending: true })

    if (error) {
      console.error('Error fetching in-stock parts:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching in-stock parts:', error)
    return null
  }
}

/**
 * Busca refacciones por término de búsqueda (part_number o description)
 * @param searchTerm - Término a buscar
 * @returns Array de refacciones que coinciden o null
 */
export async function searchParts(searchTerm: string): Promise<Part[] | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .or(`part_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('part_number', { ascending: true })

    if (error) {
      console.error(`Error searching parts with term "${searchTerm}":`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error searching parts:', error)
    return null
  }
}

/**
 * Obtiene refacciones con filtros múltiples
 * @param filters - Objeto con filtros opcionales
 * @returns Array de refacciones filtradas o null
 */
export async function getFilteredParts(filters: PartFilters): Promise<Part[] | null> {
  try {
    let query = supabase.from('parts').select('*')

    // Aplicar filtros si están presentes
    if (filters.brandId) {
      query = query.eq('brand_id', filters.brandId)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.subcategory) {
      query = query.eq('subcategory', filters.subcategory)
    }

    if (filters.inStock !== undefined) {
      query = query.eq('in_stock', filters.inStock)
    }

    if (filters.searchTerm) {
      query = query.or(`part_number.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`)
    }

    const { data, error } = await query.order('part_number', { ascending: true })

    if (error) {
      console.error('Error fetching filtered parts:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching filtered parts:', error)
    return null
  }
}

/**
 * Obtiene refacciones con información de la marca (JOIN)
 * @param limit - Límite de resultados (opcional)
 * @returns Array de refacciones con datos de marca incluidos o null
 */
export async function getPartsWithBrand(limit?: number): Promise<(Part & { brands: any })[] | null> {
  try {
    let query = supabase
      .from('parts')
      .select(`
        *,
        brands (
          id,
          name,
          slug,
          logo_url,
          is_direct_distributor
        )
      `)
      .order('part_number', { ascending: true })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching parts with brand:', error)
      return null
    }

    return data as any
  } catch (error) {
    console.error('Unexpected error fetching parts with brand:', error)
    return null
  }
}

/**
 * Obtiene refacciones destacadas (en stock y con imagen)
 * @param limit - Límite de resultados (por defecto 8)
 * @returns Array de refacciones destacadas o null
 */
export async function getFeaturedParts(limit: number = 8): Promise<Part[] | null> {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('in_stock', true)
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured parts:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching featured parts:', error)
    return null
  }
}
