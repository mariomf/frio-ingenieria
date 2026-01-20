// Company Information
export const COMPANY = {
  name: 'Frío Ingeniería',
  tagline: 'Refrigeración Industrial que Funciona',
  yearsExperience: 34,
  foundedYear: 1991,
  phone: '+52 1 55 1234 5678', // Replace with actual phone
  emergencyPhone: '+52 1 55 1234 5678', // Replace with actual emergency phone
  email: 'contacto@frioingenieriamx.com',
  address: 'Ciudad de México, México',
  website: 'https://frioingenieriamx.com',
}

// WhatsApp configuration
export const WHATSAPP = {
  phone: '5215512345678', // Replace with actual WhatsApp number
  emergencyMessage: 'Hola, tengo una emergencia de refrigeración y necesito asistencia urgente.',
  quoteMessage: 'Hola, me interesa cotizar un proyecto de refrigeración industrial.',
  partsMessage: 'Hola, me interesa cotizar refacciones.',
}

// Navigation
export const NAV_ITEMS = [
  { label: 'Inicio', href: '/' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Refacciones', href: '/refacciones' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Recursos', href: '/recursos' },
  { label: 'Contacto', href: '/contacto' },
]

// Industries
export const INDUSTRIES = [
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'carnicos', label: 'Cárnicos' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'chocolates', label: 'Chocolates' },
  { value: 'frutas-verduras', label: 'Frutas y Verduras' },
  { value: 'petroquimica', label: 'Petroquímica' },
]

// Applications
export const APPLICATIONS = [
  { value: 'cuartos-frios', label: 'Cuartos Fríos' },
  { value: 'tuneles', label: 'Túneles de Congelación' },
  { value: 'bancos-hielo', label: 'Bancos de Hielo' },
  { value: 'chillers', label: 'Chillers' },
  { value: 'pre-enfriadores', label: 'Pre-enfriadores' },
]

// Refrigerants
export const REFRIGERANTS = [
  { value: 'nh3', label: 'Amoniaco (NH3)' },
  { value: 'r-404a', label: 'R-404A' },
  { value: 'r-134a', label: 'R-134a' },
  { value: 'co2', label: 'CO2' },
]

// Capacity ranges
export const CAPACITIES = [
  { value: 'small', label: '< 50 TR' },
  { value: 'medium', label: '50-150 TR' },
  { value: 'large', label: '150-500 TR' },
  { value: 'xlarge', label: '> 500 TR' },
]

// Brands
export const BRANDS = [
  { name: 'MYCOM', slug: 'mycom', isDirectDistributor: true },
  { name: 'YORK-FRICK', slug: 'york-frick', isDirectDistributor: true },
  { name: 'Danfoss', slug: 'danfoss', isDirectDistributor: false },
  { name: 'Parker', slug: 'parker', isDirectDistributor: false },
]

// Featured clients (logos)
export const FEATURED_CLIENTS = [
  'Ferrero',
  'Coca-Cola',
  'Campbells',
  'Danfoss',
  'MYCOM',
]

// Services
export const SERVICES = [
  {
    title: 'Mantenimiento',
    description: 'Planes de mantenimiento preventivo y correctivo para sistemas de refrigeración industrial.',
    icon: 'Wrench',
  },
  {
    title: 'Diagnóstico',
    description: 'Evaluación técnica completa de sistemas existentes con recomendaciones de optimización.',
    icon: 'Search',
  },
  {
    title: 'Capacitación',
    description: 'Entrenamiento especializado para operadores y personal de mantenimiento.',
    icon: 'GraduationCap',
  },
]

// Value propositions
export const VALUE_PROPS = [
  {
    title: '34 años de experiencia',
    description: 'Desde 1991 en la industria',
    icon: 'Award',
  },
  {
    title: 'Distribución directa',
    description: 'Refacciones MYCOM y Frick sin intermediarios',
    icon: 'Truck',
  },
  {
    title: 'Respuesta 24/7',
    description: 'Emergencias atendidas el mismo día',
    icon: 'Clock',
  },
  {
    title: 'Ingenieros certificados',
    description: 'Experiencia en Baltimore Aircoil, Mayekawa, JCI',
    icon: 'BadgeCheck',
  },
]
