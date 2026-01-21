# Notas de Integración con Supabase

## Resumen de Cambios

Este documento describe las modificaciones realizadas para integrar el proyecto Next.js con Supabase y utilizar datos reales de las tablas `brands`, `equipment` y `parts`.

## Archivos Creados

### Servicios de Datos (`/src/lib/services/`)

1. **brandService.ts**: Servicio para gestionar operaciones con marcas
   - `getAllBrands()`: Obtiene todas las marcas ordenadas por nombre
   - `getBrandBySlug(slug)`: Obtiene una marca por su slug único
   - `getBrandById(id)`: Obtiene una marca por su ID
   - `getDirectDistributorBrands()`: Obtiene marcas que son distribuidores directos

2. **equipmentService.ts**: Servicio para gestionar operaciones con equipos
   - `getAllEquipment()`: Obtiene todos los equipos
   - `getEquipmentById(id)`: Obtiene un equipo por ID
   - `getEquipmentByBrand(brandId)`: Obtiene equipos de una marca específica
   - `getEquipmentByType(type)`: Obtiene equipos por tipo
   - `getEquipmentWithBrand()`: Obtiene equipos con información de marca (JOIN)

3. **partService.ts**: Servicio para gestionar operaciones con refacciones
   - `getAllParts()`: Obtiene todas las refacciones
   - `getPartById(id)`: Obtiene una refacción por ID
   - `getPartByPartNumber(partNumber)`: Obtiene una refacción por número de parte
   - `getPartsByBrand(brandId)`: Obtiene refacciones de una marca
   - `getPartsByCategory(category)`: Obtiene refacciones por categoría
   - `getInStockParts()`: Obtiene refacciones en stock
   - `searchParts(searchTerm)`: Busca refacciones por término
   - `getFilteredParts(filters)`: Obtiene refacciones con múltiples filtros
   - `getPartsWithBrand(limit)`: Obtiene refacciones con información de marca (JOIN)
   - `getFeaturedParts(limit)`: Obtiene refacciones destacadas

4. **projectService.ts**: Servicio para gestionar operaciones con proyectos
   - `getAllProjects()`: Obtiene todos los proyectos publicados
   - `getProjectBySlug(slug)`: Obtiene un proyecto por slug
   - `getFeaturedProjects(limit)`: Obtiene proyectos destacados
   - `getProjectsByIndustry(industry)`: Obtiene proyectos por industria
   - `getProjectsByApplication(application)`: Obtiene proyectos por aplicación
   - `getFilteredProjects(filters)`: Obtiene proyectos con múltiples filtros
   - `getRecentProjects(limit)`: Obtiene proyectos recientes

5. **index.ts**: Exportaciones centralizadas de todos los servicios

### Componentes (`/src/components/`)

1. **BrandCard.tsx** (`/src/components/parts/`): Componente para mostrar tarjetas de marcas
   - Muestra logo o nombre de la marca
   - Indica si es distribuidor directo
   - Enlace a página de refacciones filtrada por marca

2. **PartCard.tsx** (`/src/components/parts/`): Componente para mostrar tarjetas de refacciones
   - Muestra imagen, número de parte y descripción
   - Indica disponibilidad en stock o tiempo de entrega
   - Botón para agregar a cotización

3. **ProjectCard.tsx** (`/src/components/projects/`): Componente para mostrar tarjetas de proyectos
   - Muestra imagen principal del proyecto
   - Tags de industria y aplicación
   - Especificaciones técnicas (capacidad, refrigerante)
   - Enlace a página de detalle del proyecto

## Páginas Modificadas

### 1. `/src/app/refacciones/page.tsx`

**Cambios:**
- Convertida a Server Component (async function)
- Importación de servicios `getAllBrands` y `getPartsWithBrand`
- Importación de componentes `BrandCard` y `PartCard`
- Reemplazo de datos estáticos por datos reales de Supabase
- Sección de marcas ahora usa datos de la tabla `brands`
- Sección de refacciones destacadas usa datos de la tabla `parts`
- Manejo de estados vacíos (sin marcas o refacciones)

**Datos mostrados:**
- Todas las marcas de la tabla `brands`
- 8 refacciones destacadas de la tabla `parts` con información de marca

### 2. `/src/app/proyectos/page.tsx`

**Cambios:**
- Convertida a Server Component (async function)
- Importación de servicio `getAllProjects`
- Importación de componente `ProjectCard`
- Reemplazo de placeholders por datos reales de Supabase
- Grid de proyectos usa datos de la tabla `projects`
- Manejo de estado vacío (sin proyectos)

**Datos mostrados:**
- Todos los proyectos publicados de la tabla `projects`

## Configuración Requerida

### Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cjafhsxegyrkwhoswyhk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**IMPORTANTE:** El archivo `.env.local` está incluido en `.gitignore` y no debe subirse al repositorio.

### Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales reales

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en producción
npm start
```

## Estructura de Datos

### Tabla `brands`
- `id`: UUID
- `name`: Nombre de la marca
- `slug`: Slug único para URLs
- `logo_url`: URL del logo (opcional)
- `is_direct_distributor`: Boolean indicando distribución directa
- `description`: Descripción de la marca (opcional)

### Tabla `equipment`
- `id`: UUID
- `brand_id`: Foreign key a `brands`
- `model`: Modelo del equipo
- `type`: Tipo de equipo
- `description`: Descripción (opcional)
- `specifications`: JSON con especificaciones (opcional)

### Tabla `parts`
- `id`: UUID
- `part_number`: Número de parte único
- `description`: Descripción de la refacción
- `brand_id`: Foreign key a `brands`
- `category`: Categoría de la refacción
- `subcategory`: Subcategoría (opcional)
- `in_stock`: Boolean de disponibilidad
- `lead_time_days`: Días de entrega si no está en stock
- `image_url`: URL de la imagen (opcional)

### Tabla `projects`
- `id`: UUID
- `title`: Título del proyecto
- `slug`: Slug único para URLs
- `client_name`: Nombre del cliente
- `location`: Ubicación
- `year`: Año del proyecto
- `industry`: Industria (lacteos, carnicos, etc.)
- `application`: Aplicación (cuartos-frios, tuneles, etc.)
- `refrigerant`: Refrigerante usado (opcional)
- `capacity_tr`: Capacidad en TR (opcional)
- `images`: Array de URLs de imágenes
- `published`: Boolean indicando si está publicado

## Mejoras Futuras

### Optimizaciones Recomendadas

1. **Imágenes**: Reemplazar `<img>` por `<Image />` de Next.js para optimización automática
2. **Caché**: Implementar ISR (Incremental Static Regeneration) con `revalidate`
3. **Búsqueda**: Implementar búsqueda en tiempo real para refacciones
4. **Filtros**: Hacer filtros interactivos en páginas de proyectos y refacciones
5. **Paginación**: Implementar paginación para grandes volúmenes de datos
6. **Loading States**: Agregar Suspense boundaries y loading skeletons
7. **Error Boundaries**: Implementar manejo de errores más robusto
8. **SEO**: Mejorar metadata dinámica por página

### Funcionalidades Pendientes

1. Página de detalle de proyecto (`/proyectos/[slug]`)
2. Página de detalle de refacción
3. Sistema de cotización (carrito)
4. Búsqueda global
5. Filtros dinámicos con query params
6. Admin panel para gestión de contenido

## Notas Técnicas

### Server Components vs Client Components

- Todas las páginas son Server Components para fetch de datos en el servidor
- `PartCard` es Client Component porque tiene interactividad (botón agregar)
- `BrandCard` y `ProjectCard` son Server Components (solo links)

### Manejo de Errores

- Todos los servicios retornan `null` en caso de error
- Los errores se logean en consola del servidor
- Las páginas manejan el caso de datos null mostrando mensajes apropiados

### TypeScript

- Todos los tipos están definidos en `/src/types/database.ts`
- Los servicios tienen tipado completo con tipos importados
- No hay uso de `any` excepto en JOINs complejos (documentado)

## Testing

Para verificar que todo funciona:

```bash
# 1. Verificar página de test de conexión
http://localhost:3000/test-db

# 2. Verificar página de refacciones
http://localhost:3000/refacciones

# 3. Verificar página de proyectos
http://localhost:3000/proyectos
```

## Contacto y Soporte

Para preguntas sobre esta integración, consulta la documentación de:
- [Next.js 14](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
