import { supabase } from '@/lib/supabase'
import type { Equipment } from '@/types/database'

/**
 * Servicio para gestionar operaciones relacionadas con equipos (equipment)
 */

/**
 * Obtiene todos los equipos ordenados por modelo
 * @returns Array de equipos o null si hay error
 */
export async function getAllEquipment(): Promise<Equipment[] | null> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('model', { ascending: true })

    if (error) {
      console.error('Error fetching equipment:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching equipment:', error)
    return null
  }
}

/**
 * Obtiene un equipo por su ID
 * @param id - UUID del equipo
 * @returns Equipo encontrado o null
 */
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching equipment with id ${id}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching equipment by id:', error)
    return null
  }
}

/**
 * Obtiene equipos por marca (brand_id)
 * @param brandId - UUID de la marca
 * @returns Array de equipos de la marca o null
 */
export async function getEquipmentByBrand(brandId: string): Promise<Equipment[] | null> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('brand_id', brandId)
      .order('model', { ascending: true })

    if (error) {
      console.error(`Error fetching equipment for brand ${brandId}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching equipment by brand:', error)
    return null
  }
}

/**
 * Obtiene equipos por tipo
 * @param type - Tipo de equipo (ej. 'compresor', 'evaporador', etc.)
 * @returns Array de equipos del tipo especificado o null
 */
export async function getEquipmentByType(type: string): Promise<Equipment[] | null> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('type', type)
      .order('model', { ascending: true })

    if (error) {
      console.error(`Error fetching equipment of type ${type}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching equipment by type:', error)
    return null
  }
}

/**
 * Obtiene equipos con información de la marca (JOIN)
 * @returns Array de equipos con datos de marca incluidos o null
 */
export async function getEquipmentWithBrand(): Promise<(Equipment & { brands: any })[] | null> {
  try {
    const { data, error } = await supabase
      .from('equipment')
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
      .order('model', { ascending: true })

    if (error) {
      console.error('Error fetching equipment with brand:', error)
      return null
    }

    return data as any
  } catch (error) {
    console.error('Unexpected error fetching equipment with brand:', error)
    return null
  }
}
