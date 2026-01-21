// src/app/test-db/page.tsx
import { supabase } from '@/lib/supabase'

export default async function TestConnection() {
  // Intentamos obtener los registros de la tabla 'brands'
  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')

  if (error) {
    return (
      <div className="p-10">
        <h1 className="text-red-500 font-bold">Error de conexión:</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-10">
      <h1 className="text-green-600 font-bold text-2xl mb-4">
        ¡Conexión Exitosa!
      </h1>
      <p className="mb-4">Se encontraron {brands?.length} registros en la tabla 'brands':</p>
      <ul className="list-disc pl-5">
        {brands?.map((brand) => (
          <li key={brand.id}>
            {brand.name} - <span className="text-gray-500">{brand.slug}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}