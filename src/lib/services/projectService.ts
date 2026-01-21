import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/database'

/**
 * Servicio para gestionar operaciones relacionadas con proyectos
 */

interface ProjectFilters {
  industry?: string
  application?: string
  refrigerant?: string
  capacity?: 'small' | 'medium' | 'large' | 'xlarge'
  featured?: boolean
  published?: boolean
}

/**
 * Obtiene todos los proyectos publicados ordenados por año descendente
 * @returns Array de proyectos o null si hay error
 */
export async function getAllProjects(): Promise<Project[] | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching projects:', error)
    return null
  }
}

/**
 * Obtiene un proyecto por su slug
 * @param slug - Slug único del proyecto
 * @returns Proyecto encontrado o null
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) {
      console.error(`Error fetching project with slug ${slug}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching project by slug:', error)
    return null
  }
}

/**
 * Obtiene proyectos destacados
 * @param limit - Límite de resultados (por defecto 6)
 * @returns Array de proyectos destacados o null
 */
export async function getFeaturedProjects(limit: number = 6): Promise<Project[] | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .eq('published', true)
      .order('year', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured projects:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching featured projects:', error)
    return null
  }
}

/**
 * Obtiene proyectos por industria
 * @param industry - Tipo de industria
 * @returns Array de proyectos o null
 */
export async function getProjectsByIndustry(industry: string): Promise<Project[] | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('industry', industry)
      .eq('published', true)
      .order('year', { ascending: false })

    if (error) {
      console.error(`Error fetching projects for industry ${industry}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching projects by industry:', error)
    return null
  }
}

/**
 * Obtiene proyectos por aplicación
 * @param application - Tipo de aplicación
 * @returns Array de proyectos o null
 */
export async function getProjectsByApplication(application: string): Promise<Project[] | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('application', application)
      .eq('published', true)
      .order('year', { ascending: false })

    if (error) {
      console.error(`Error fetching projects for application ${application}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching projects by application:', error)
    return null
  }
}

/**
 * Obtiene proyectos con filtros múltiples
 * @param filters - Objeto con filtros opcionales
 * @returns Array de proyectos filtrados o null
 */
export async function getFilteredProjects(filters: ProjectFilters): Promise<Project[] | null> {
  try {
    let query = supabase.from('projects').select('*')

    // Siempre filtrar solo publicados
    query = query.eq('published', filters.published ?? true)

    // Aplicar filtros si están presentes
    if (filters.industry) {
      query = query.eq('industry', filters.industry)
    }

    if (filters.application) {
      query = query.eq('application', filters.application)
    }

    if (filters.refrigerant) {
      query = query.eq('refrigerant', filters.refrigerant)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    // Filtro por capacidad (rango de TR)
    if (filters.capacity) {
      switch (filters.capacity) {
        case 'small':
          query = query.lt('capacity_tr', 50)
          break
        case 'medium':
          query = query.gte('capacity_tr', 50).lt('capacity_tr', 150)
          break
        case 'large':
          query = query.gte('capacity_tr', 150).lt('capacity_tr', 500)
          break
        case 'xlarge':
          query = query.gte('capacity_tr', 500)
          break
      }
    }

    const { data, error } = await query.order('year', { ascending: false })

    if (error) {
      console.error('Error fetching filtered projects:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching filtered projects:', error)
    return null
  }
}

/**
 * Obtiene proyectos recientes
 * @param limit - Límite de resultados (por defecto 3)
 * @returns Array de proyectos recientes o null
 */
export async function getRecentProjects(limit: number = 3): Promise<Project[] | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent projects:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching recent projects:', error)
    return null
  }
}

/**
 * Obtiene un proyecto por su ID
 * @param id - UUID del proyecto
 * @returns Proyecto encontrado o null
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching project with id ${id}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching project by id:', error)
    return null
  }
}
