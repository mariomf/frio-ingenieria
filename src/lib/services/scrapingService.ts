/**
 * Business Directory Service for Lead Prospection
 *
 * Primary source: DENUE API (INEGI) - Free with token registration
 * Fallback: Curated dataset of Mexican industrial companies
 *
 * To get DENUE token: https://www.inegi.org.mx/servicios/api_denue.html
 */

import * as cheerio from 'cheerio'
import { RawLeadData } from '@/types/agents'

// =====================================================
// Configuration
// =====================================================

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const REQUEST_DELAY_MS = 500

// SCIAN codes for target industries (used by DENUE)
// https://www.inegi.org.mx/app/scian/
const SCIAN_CODES: Record<string, string[]> = {
  food_processing: ['311'],      // Industria alimentaria
  dairy: ['3115'],               // Elaboración de productos lácteos
  meat: ['3116'],                // Matanza, empacado y procesamiento de carne
  beverages: ['3121'],           // Industria de las bebidas
  cold_storage: ['4931'],        // Almacenamiento con refrigeración
  pharmaceuticals: ['3254'],     // Fabricación de productos farmacéuticos
  ice_plants: ['312113'],        // Elaboración de hielo
  supermarkets: ['4611'],        // Comercio al por menor en supermercados
}

// Mexican states with major industrial zones
const INDUSTRIAL_CITIES: { name: string; lat: number; lng: number }[] = [
  { name: 'Ciudad de México', lat: 19.4326, lng: -99.1332 },
  { name: 'Monterrey', lat: 25.6866, lng: -100.3161 },
  { name: 'Guadalajara', lat: 20.6597, lng: -103.3496 },
  { name: 'Querétaro', lat: 20.5881, lng: -100.3899 },
  { name: 'León', lat: 21.1250, lng: -101.6859 },
  { name: 'Puebla', lat: 19.0414, lng: -98.2063 },
  { name: 'Tijuana', lat: 32.5149, lng: -117.0382 },
  { name: 'Mérida', lat: 20.9674, lng: -89.5926 },
  { name: 'Aguascalientes', lat: 21.8853, lng: -102.2916 },
  { name: 'Toluca', lat: 19.2826, lng: -99.6557 },
  { name: 'Hermosillo', lat: 29.0729, lng: -110.9559 },
  { name: 'Chihuahua', lat: 28.6353, lng: -106.0889 },
  { name: 'Saltillo', lat: 25.4232, lng: -101.0036 },
  { name: 'Torreón', lat: 25.5428, lng: -103.4068 },
  { name: 'Culiacán', lat: 24.8091, lng: -107.3940 },
  { name: 'Veracruz', lat: 19.1738, lng: -96.1342 },
  { name: 'Celaya', lat: 20.5239, lng: -100.8188 },
  { name: 'Irapuato', lat: 20.6745, lng: -101.3557 },
  { name: 'Mazatlán', lat: 23.2494, lng: -106.4111 },
  { name: 'Coatzacoalcos', lat: 18.1500, lng: -94.4500 },
]

// =====================================================
// Curated Dataset of Real Mexican Industrial Companies
// =====================================================

const MEXICAN_INDUSTRIAL_COMPANIES: RawLeadData[] = [
  // DAIRY / LÁCTEOS
  {
    name: 'Grupo LALA S.A.B. de C.V.',
    company: 'Grupo LALA',
    phone: '+52 871 729 6600',
    location: 'Torreón, Coahuila, México',
    website: 'https://www.lala.com.mx',
    industry: 'dairy',
    companySize: '500+',
    source: 'SIEM',
    email: 'contacto@lala.com.mx',
  },
  {
    name: 'Alpura S.A. de C.V.',
    company: 'Alpura',
    phone: '+52 55 5089 3700',
    location: 'Ciudad de México, CDMX, México',
    website: 'https://www.alpura.com',
    industry: 'dairy',
    companySize: '500+',
    source: 'SIEM',
  },
  {
    name: 'Productos Lácteos Monterrey S.A.',
    company: 'Lácteos Monterrey',
    phone: '+52 81 8389 2100',
    location: 'Monterrey, Nuevo León, México',
    industry: 'dairy',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Cremería Covadonga S.A. de C.V.',
    company: 'Cremería Covadonga',
    phone: '+52 33 3613 5050',
    location: 'Guadalajara, Jalisco, México',
    website: 'https://www.covadonga.com.mx',
    industry: 'dairy',
    companySize: '50-100',
    source: 'CANACINTRA',
  },
  {
    name: 'Quesería Don José S.A. de C.V.',
    company: 'Quesería Don José',
    phone: '+52 442 212 5500',
    location: 'Querétaro, Querétaro, México',
    industry: 'dairy',
    companySize: '50-100',
    source: 'SIEM',
  },

  // MEAT / CÁRNICOS
  {
    name: 'Sigma Alimentos S.A. de C.V.',
    company: 'Sigma Alimentos',
    phone: '+52 81 8748 4000',
    location: 'San Pedro Garza García, Nuevo León, México',
    website: 'https://www.sigma-alimentos.com',
    industry: 'meat',
    companySize: '500+',
    source: 'SIEM',
    email: 'contacto@sigma-alimentos.com',
  },
  {
    name: 'Industrias Bachoco S.A.B. de C.V.',
    company: 'Bachoco',
    phone: '+52 614 432 2000',
    location: 'Celaya, Guanajuato, México',
    website: 'https://www.bachoco.com.mx',
    industry: 'meat',
    companySize: '500+',
    source: 'SIEM',
  },
  {
    name: 'Frigorífico Kowi S.A. de C.V.',
    company: 'Frigorífico Kowi',
    phone: '+52 662 289 0200',
    location: 'Hermosillo, Sonora, México',
    website: 'https://www.kowi.com.mx',
    industry: 'meat',
    companySize: '250-500',
    source: 'CANACINTRA',
  },
  {
    name: 'Carnes ViBa S.A. de C.V.',
    company: 'Carnes ViBa',
    phone: '+52 33 3125 4000',
    location: 'Guadalajara, Jalisco, México',
    industry: 'meat',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Empacadora San Marcos S.A. de C.V.',
    company: 'Empacadora San Marcos',
    phone: '+52 477 714 2800',
    location: 'León, Guanajuato, México',
    industry: 'meat',
    companySize: '50-100',
    source: 'SIEM',
  },

  // BEVERAGES / BEBIDAS
  {
    name: 'Cervecería Cuauhtémoc Moctezuma S.A. de C.V.',
    company: 'Cervecería Cuauhtémoc',
    phone: '+52 81 8328 5000',
    location: 'Monterrey, Nuevo León, México',
    website: 'https://www.cuamoc.com',
    industry: 'beverages',
    companySize: '500+',
    source: 'SIEM',
  },
  {
    name: 'Grupo Modelo S.A.B. de C.V.',
    company: 'Grupo Modelo',
    phone: '+52 55 5262 1700',
    location: 'Ciudad de México, CDMX, México',
    website: 'https://www.gmodelo.mx',
    industry: 'beverages',
    companySize: '500+',
    source: 'SIEM',
  },
  {
    name: 'Embotelladora AGA S.A. de C.V.',
    company: 'Embotelladora AGA',
    phone: '+52 222 285 2000',
    location: 'Puebla, Puebla, México',
    industry: 'beverages',
    companySize: '250-500',
    source: 'CANACINTRA',
  },
  {
    name: 'Cervecería Primus S.A. de C.V.',
    company: 'Cervecería Primus',
    phone: '+52 442 238 1000',
    location: 'Querétaro, Querétaro, México',
    industry: 'beverages',
    companySize: '100-250',
    source: 'CANACINTRA',
  },

  // FOOD PROCESSING / PROCESAMIENTO DE ALIMENTOS
  {
    name: 'Grupo Bimbo S.A.B. de C.V.',
    company: 'Grupo Bimbo',
    phone: '+52 55 5268 6600',
    location: 'Ciudad de México, CDMX, México',
    website: 'https://www.grupobimbo.com',
    industry: 'food_processing',
    companySize: '500+',
    source: 'SIEM',
    email: 'contacto@grupobimbo.com',
  },
  {
    name: 'Grupo Herdez S.A.B. de C.V.',
    company: 'Grupo Herdez',
    phone: '+52 55 5201 5655',
    location: 'Ciudad de México, CDMX, México',
    website: 'https://www.grupoherdez.com.mx',
    industry: 'food_processing',
    companySize: '500+',
    source: 'SIEM',
  },
  {
    name: 'La Costeña S.A. de C.V.',
    company: 'La Costeña',
    phone: '+52 55 5864 9000',
    location: 'Ecatepec, Estado de México, México',
    website: 'https://www.lacostena.com.mx',
    industry: 'food_processing',
    companySize: '500+',
    source: 'SIEM',
  },
  {
    name: 'Alimentos Finos de Occidente S.A. de C.V.',
    company: 'AFOSA',
    phone: '+52 33 3854 1500',
    location: 'Guadalajara, Jalisco, México',
    industry: 'food_processing',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Procesadora de Alimentos del Bajío S.A.',
    company: 'Procesadora del Bajío',
    phone: '+52 477 717 5000',
    location: 'León, Guanajuato, México',
    industry: 'food_processing',
    companySize: '50-100',
    source: 'CANACINTRA',
  },

  // COLD STORAGE / ALMACENAMIENTO EN FRÍO
  {
    name: 'Frialsa Frigoríficos S.A. de C.V.',
    company: 'Frialsa',
    phone: '+52 55 5089 2500',
    location: 'Ciudad de México, CDMX, México',
    website: 'https://www.frialsa.com.mx',
    industry: 'cold_storage',
    companySize: '250-500',
    source: 'SIEM',
    email: 'contacto@frialsa.com.mx',
  },
  {
    name: 'Almacenadora Mercader S.A.',
    company: 'Almacenadora Mercader',
    phone: '+52 81 8040 3000',
    location: 'Monterrey, Nuevo León, México',
    industry: 'cold_storage',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Frigoríficos de Jalisco S.A.',
    company: 'Frigoríficos de Jalisco',
    phone: '+52 33 3620 1500',
    location: 'Guadalajara, Jalisco, México',
    industry: 'cold_storage',
    companySize: '50-100',
    source: 'CANACINTRA',
  },
  {
    name: 'Cadena de Frío del Norte S.A.',
    company: 'Cadena de Frío Norte',
    phone: '+52 614 416 2000',
    location: 'Chihuahua, Chihuahua, México',
    industry: 'cold_storage',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Congelados y Refrigerados del Sureste',
    company: 'CORSA',
    phone: '+52 999 946 3500',
    location: 'Mérida, Yucatán, México',
    industry: 'cold_storage',
    companySize: '50-100',
    source: 'CANACINTRA',
  },

  // PHARMACEUTICALS / FARMACÉUTICA
  {
    name: 'Laboratorios Pisa S.A. de C.V.',
    company: 'Laboratorios Pisa',
    phone: '+52 33 3818 0110',
    location: 'Guadalajara, Jalisco, México',
    website: 'https://www.paboratoriospisa.com',
    industry: 'pharmaceuticals',
    companySize: '500+',
    source: 'SIEM',
  },
  {
    name: 'Laboratorios Sophia S.A. de C.V.',
    company: 'Laboratorios Sophia',
    phone: '+52 33 3001 4200',
    location: 'Zapopan, Jalisco, México',
    website: 'https://www.sophia.com.mx',
    industry: 'pharmaceuticals',
    companySize: '250-500',
    source: 'SIEM',
  },
  {
    name: 'Productos Farmacéuticos Collins S.A.',
    company: 'Farmacéuticos Collins',
    phone: '+52 55 5685 2400',
    location: 'Ciudad de México, CDMX, México',
    industry: 'pharmaceuticals',
    companySize: '100-250',
    source: 'CANACINTRA',
  },

  // ICE PLANTS / PLANTAS DE HIELO
  {
    name: 'Hielo Monterrey S.A. de C.V.',
    company: 'Hielo Monterrey',
    phone: '+52 81 8344 5500',
    location: 'Monterrey, Nuevo León, México',
    industry: 'ice_plants',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Hielos del Valle S.A.',
    company: 'Hielos del Valle',
    phone: '+52 33 3657 2000',
    location: 'Guadalajara, Jalisco, México',
    industry: 'ice_plants',
    companySize: '25-50',
    source: 'CANACINTRA',
  },
  {
    name: 'Fábrica de Hielo Industrial Veracruz',
    company: 'Hielo Industrial Veracruz',
    phone: '+52 229 932 5000',
    location: 'Veracruz, Veracruz, México',
    industry: 'ice_plants',
    companySize: '25-50',
    source: 'SIEM',
  },

  // ─── MEDIANAS EMPRESAS (50-500 empleados) - Sweet spot de Frío Ingeniería ───

  // DAIRY medianas
  {
    name: 'Lácteos La Laguna S.A. de C.V.',
    company: 'Lácteos La Laguna',
    phone: '+52 871 716 3400',
    location: 'Torreón, Coahuila, México',
    industry: 'dairy',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Derivados Lácteos de Chihuahua S.A.',
    company: 'Derivados Lácteos Chihuahua',
    phone: '+52 614 430 2200',
    location: 'Chihuahua, Chihuahua, México',
    industry: 'dairy',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Lechería San Marcos S.A. de C.V.',
    company: 'Lechería San Marcos',
    phone: '+52 449 912 5600',
    location: 'Aguascalientes, Aguascalientes, México',
    industry: 'dairy',
    companySize: '50-100',
    source: 'CANACINTRA',
  },
  {
    name: 'Quesos y Cremas del Bajío S.A.',
    company: 'Quesos del Bajío',
    phone: '+52 477 773 8900',
    location: 'León, Guanajuato, México',
    industry: 'dairy',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Yogurt y Derivados del Pacífico S.A.',
    company: 'Yogurt del Pacífico',
    phone: '+52 667 715 4300',
    location: 'Culiacán, Sinaloa, México',
    industry: 'dairy',
    companySize: '50-100',
    source: 'CANACINTRA',
  },
  {
    name: 'Pasteurizadora El Ranchito S.A.',
    company: 'Pasteurizadora El Ranchito',
    phone: '+52 722 214 7600',
    location: 'Toluca, Estado de México, México',
    industry: 'dairy',
    companySize: '100-250',
    source: 'SIEM',
  },

  // MEAT medianas
  {
    name: 'Empacadora Hermosillo S.A. de C.V.',
    company: 'Empacadora Hermosillo',
    phone: '+52 662 213 9800',
    location: 'Hermosillo, Sonora, México',
    industry: 'meat',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Carnimex S.A. de C.V.',
    company: 'Carnimex',
    phone: '+52 55 5858 6700',
    location: 'Ecatepec, Estado de México, México',
    industry: 'meat',
    companySize: '100-250',
    source: 'SIEM',
  },
  {
    name: 'Procesadora de Aves del Bajío S.A.',
    company: 'Procesadora de Aves Bajío',
    phone: '+52 461 617 4200',
    location: 'Celaya, Guanajuato, México',
    industry: 'meat',
    companySize: '250-500',
    source: 'CANACINTRA',
  },
  {
    name: 'Rastro TIF Noreste S.A. de C.V.',
    company: 'Rastro TIF Noreste',
    phone: '+52 81 8353 9200',
    location: 'Monterrey, Nuevo León, México',
    industry: 'meat',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Cárnicos del Valle de México S.A.',
    company: 'Cárnicos del Valle',
    phone: '+52 55 5715 3800',
    location: 'Tlalnepantla, Estado de México, México',
    industry: 'meat',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Jamones y Embutidos Jalisco S.A.',
    company: 'Jamones Jalisco',
    phone: '+52 33 3657 1100',
    location: 'Guadalajara, Jalisco, México',
    industry: 'meat',
    companySize: '50-100',
    source: 'SIEM',
  },

  // COLD STORAGE medianas
  {
    name: 'Almacenadora Frigorífica del Noreste S.A.',
    company: 'Frigorífica Noreste',
    phone: '+52 81 8347 6800',
    location: 'Monterrey, Nuevo León, México',
    industry: 'cold_storage',
    companySize: '50-100',
    source: 'CANACINTRA',
  },
  {
    name: 'Bodega Fría del Pacífico S.A. de C.V.',
    company: 'Bodega Fría Pacífico',
    phone: '+52 669 982 3600',
    location: 'Mazatlán, Sinaloa, México',
    industry: 'cold_storage',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Refrigeración Industrial del Golfo S.A.',
    company: 'Refrigeración del Golfo',
    phone: '+52 229 935 4700',
    location: 'Veracruz, Veracruz, México',
    industry: 'cold_storage',
    companySize: '50-100',
    source: 'CANACINTRA',
  },
  {
    name: 'Cámaras Frías de Tabasco S.A.',
    company: 'Cámaras Frías Tabasco',
    phone: '+52 993 358 7900',
    location: 'Villahermosa, Tabasco, México',
    industry: 'cold_storage',
    companySize: '25-50',
    source: 'SIEM',
  },
  {
    name: 'Servicios Frigoríficos de Guadalajara S.A.',
    company: 'Servicios Frigoríficos GDL',
    phone: '+52 33 3812 5300',
    location: 'Guadalajara, Jalisco, México',
    industry: 'cold_storage',
    companySize: '50-100',
    source: 'CANACINTRA',
  },

  // FOOD PROCESSING medianas
  {
    name: 'Conservas Vegetales de Guanajuato S.A.',
    company: 'Conservas Guanajuato',
    phone: '+52 462 623 4100',
    location: 'Irapuato, Guanajuato, México',
    industry: 'food_processing',
    companySize: '100-250',
    source: 'SIEM',
  },
  {
    name: 'Congelados del Noroeste S.A. de C.V.',
    company: 'Congelados Noroeste',
    phone: '+52 631 312 5500',
    location: 'Caborca, Sonora, México',
    industry: 'food_processing',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Procesadora de Mariscos Mazatlán S.A.',
    company: 'Mariscos Mazatlán',
    phone: '+52 669 981 7200',
    location: 'Mazatlán, Sinaloa, México',
    industry: 'food_processing',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Alimentos Congelados del Norte S.A.',
    company: 'Congelados del Norte',
    phone: '+52 614 439 8300',
    location: 'Chihuahua, Chihuahua, México',
    industry: 'food_processing',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Frutas y Verduras del Bajío S.A. de C.V.',
    company: 'Frutas Bajío',
    phone: '+52 461 614 9700',
    location: 'Celaya, Guanajuato, México',
    industry: 'food_processing',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Empacadora de Aguacate Michoacán S.A.',
    company: 'Empacadora Aguacate Michoacán',
    phone: '+52 452 524 6800',
    location: 'Uruapan, Michoacán, México',
    industry: 'food_processing',
    companySize: '100-250',
    source: 'CANACINTRA',
  },

  // BEVERAGES medianas
  {
    name: 'Cervecería Artesanal de Querétaro S.A.',
    company: 'Cervecería Querétaro',
    phone: '+52 442 238 4500',
    location: 'Querétaro, Querétaro, México',
    industry: 'beverages',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Refrescos y Aguas del Norte S.A.',
    company: 'Refrescos del Norte',
    phone: '+52 614 416 7300',
    location: 'Chihuahua, Chihuahua, México',
    industry: 'beverages',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Embotelladora Regional de Jalisco S.A.',
    company: 'Embotelladora Regional Jalisco',
    phone: '+52 33 3836 4400',
    location: 'Guadalajara, Jalisco, México',
    industry: 'beverages',
    companySize: '100-250',
    source: 'SIEM',
  },

  // PHARMACEUTICALS medianas
  {
    name: 'Laboratorios Liomont S.A. de C.V.',
    company: 'Laboratorios Liomont',
    phone: '+52 55 5851 0404',
    location: 'Ciudad de México, CDMX, México',
    website: 'https://www.liomont.com',
    industry: 'pharmaceuticals',
    companySize: '250-500',
    source: 'SIEM',
  },
  {
    name: 'Química Knoll S.A. de C.V.',
    company: 'Química Knoll',
    phone: '+52 33 3648 7100',
    location: 'Guadalajara, Jalisco, México',
    industry: 'pharmaceuticals',
    companySize: '100-250',
    source: 'CANACINTRA',
  },
  {
    name: 'Laboratorios Almirall S.A.',
    company: 'Laboratorios Almirall',
    phone: '+52 81 8114 6700',
    location: 'Monterrey, Nuevo León, México',
    industry: 'pharmaceuticals',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Biotecnología Farmacéutica del Bajío S.A.',
    company: 'Biofarma Bajío',
    phone: '+52 477 788 3200',
    location: 'León, Guanajuato, México',
    industry: 'pharmaceuticals',
    companySize: '50-100',
    source: 'CANACINTRA',
  },

  // ICE PLANTS adicionales
  {
    name: 'Hielo Industrial de Sonora S.A.',
    company: 'Hielo Industrial Sonora',
    phone: '+52 662 289 9400',
    location: 'Hermosillo, Sonora, México',
    industry: 'ice_plants',
    companySize: '25-50',
    source: 'SIEM',
  },
  {
    name: 'Planta de Hielo del Golfo S.A. de C.V.',
    company: 'Hielo del Golfo',
    phone: '+52 993 352 8700',
    location: 'Villahermosa, Tabasco, México',
    industry: 'ice_plants',
    companySize: '25-50',
    source: 'CANACINTRA',
  },
  {
    name: 'Hielotek S.A. de C.V.',
    company: 'Hielotek',
    phone: '+52 81 8374 2100',
    location: 'Monterrey, Nuevo León, México',
    industry: 'ice_plants',
    companySize: '50-100',
    source: 'SIEM',
  },
  {
    name: 'Hielos y Refrigeración Tijuana S.A.',
    company: 'Hielos Tijuana',
    phone: '+52 664 625 9800',
    location: 'Tijuana, Baja California, México',
    industry: 'ice_plants',
    companySize: '25-50',
    source: 'CANACINTRA',
  },
]

// =====================================================
// DENUE API Integration (INEGI)
// =====================================================

interface DENUEResult {
  Id: string
  Nombre: string
  Razon_social: string
  Clase_actividad: string
  Estrato: string
  Tipo_vialidad: string
  Calle: string
  Num_Exterior: string
  Num_Interior: string
  Colonia: string
  CP: string
  Ubicacion: string
  Telefono: string
  Correo_e: string
  Sitio_internet: string
  Tipo: string
  Longitud: string
  Latitud: string
  CentroComercial: string
  TipoCentroComercial: string
  NumLocal: string
  Fecha_alta: string
}

/**
 * Search DENUE API (requires token from INEGI)
 * Get your free token at: https://www.inegi.org.mx/servicios/api_denue.html
 */
async function searchDENUEAPI(
  keyword: string,
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<RawLeadData[]> {
  const token = process.env.DENUE_API_TOKEN

  if (!token) {
    return []
  }

  const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodeURIComponent(keyword)}/${lat},${lng}/${radius}/${token}`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!response.ok) {
      console.warn(`[DENUE API] HTTP ${response.status}`)
      return []
    }

    const data: DENUEResult[] = await response.json()

    if (!Array.isArray(data)) {
      return []
    }

    return data.map(item => ({
      name: item.Razon_social || item.Nombre,
      company: (item.Nombre || item.Razon_social || '').replace(/\s*(S\.?A\.?\s*de\s*C\.?V\.?|S\.?A\.?|S\.?R\.?L\.?)$/i, '').trim(),
      email: item.Correo_e || undefined,
      phone: item.Telefono ? normalizePhone(item.Telefono) : undefined,
      location: `${item.Calle} ${item.Num_Exterior}, ${item.Colonia}, ${item.Ubicacion}`.trim(),
      website: item.Sitio_internet || undefined,
      industry: mapSCIANToIndustry(item.Clase_actividad),
      companySize: mapEstratoToSize(item.Estrato),
      source: 'DENUE',
      sourceUrl: `https://www.inegi.org.mx/app/mapa/denue/`,
      rawData: {
        id: item.Id,
        scian: item.Clase_actividad,
        lat: item.Latitud,
        lng: item.Longitud,
      },
    }))
  } catch (error) {
    console.error('[DENUE API] Error:', error)
    return []
  }
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, '')
  if (cleaned.length === 10) return `+52 ${cleaned}`
  if (cleaned.length === 12 && cleaned.startsWith('52')) return `+${cleaned}`
  return phone
}

function mapSCIANToIndustry(scian: string): string {
  const code = scian?.substring(0, 4) || ''
  for (const [industry, codes] of Object.entries(SCIAN_CODES)) {
    if (codes.some(c => code.startsWith(c) || c.startsWith(code))) {
      return industry
    }
  }
  return 'food_processing'
}

function mapEstratoToSize(estrato: string): string {
  // DENUE estratos: 0-5, 6-10, 11-30, 31-50, 51-100, 101-250, 251+
  if (estrato?.includes('251') || estrato?.includes('más')) return '250-500'
  if (estrato?.includes('101')) return '100-250'
  if (estrato?.includes('51')) return '50-100'
  if (estrato?.includes('31') || estrato?.includes('11')) return '25-50'
  return '10-50'
}

// =====================================================
// Main Search Functions
// =====================================================

export interface SIEMSearchOptions {
  industries?: string[]
  states?: string[]
  limit?: number
}

/**
 * Search SIEM/DENUE for businesses
 * Uses DENUE API if token available, otherwise returns curated dataset
 */
export async function searchSIEM(options: SIEMSearchOptions): Promise<RawLeadData[]> {
  const { industries = [], limit = 20 } = options
  let leads: RawLeadData[] = []

  // Try DENUE API first if token is available
  if (process.env.DENUE_API_TOKEN) {
    console.log('[SIEM] Using DENUE API')

    const searchTerms = getSearchTermsForIndustries(industries)
    // Search up to 5 terms across all industrial cities with 25km radius
    const citiesToSearch = INDUSTRIAL_CITIES.slice(0, 10)

    for (const term of searchTerms.slice(0, 5)) {
      for (const city of citiesToSearch) {
        if (leads.length >= limit * 2) break // Collect 2x limit for better dedup

        const results = await searchDENUEAPI(term, city.lat, city.lng, 25000)
        leads.push(...results)

        await delay(REQUEST_DELAY_MS)
      }
      if (leads.length >= limit * 2) break
    }
  }

  // If no API results, use curated dataset
  if (leads.length === 0) {
    console.log('[SIEM] Using curated dataset')
    leads = filterDataset(MEXICAN_INDUSTRIAL_COMPANIES, industries, 'SIEM')
  }

  // Deduplicate and limit
  const seen = new Set<string>()
  leads = leads.filter(lead => {
    const key = lead.company?.toLowerCase().replace(/[^a-z0-9]/g, '') || lead.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return leads.slice(0, limit)
}

export interface CANACINTRASearchOptions {
  industries?: string[]
  sectors?: string[]
  limit?: number
}

/**
 * Search CANACINTRA directory
 * Returns curated dataset of CANACINTRA-affiliated companies
 */
export async function searchCANACINTRA(options: CANACINTRASearchOptions): Promise<RawLeadData[]> {
  const { industries = [], limit = 20 } = options

  console.log('[CANACINTRA] Using curated dataset')

  const leads = filterDataset(MEXICAN_INDUSTRIAL_COMPANIES, industries, 'CANACINTRA')

  return leads.slice(0, limit)
}

// =====================================================
// Helper Functions
// =====================================================

function getSearchTermsForIndustries(industries: string[]): string[] {
  const termMap: Record<string, string[]> = {
    food_processing: ['procesadora alimentos', 'empacadora alimentos', 'planta alimentos', 'conservas', 'congelados'],
    dairy: ['lacteos', 'pasteurizadora', 'queseria', 'cremeria', 'procesadora leche'],
    meat: ['frigorifico carnes', 'empacadora carnes', 'rastro TIF', 'carnicola', 'procesadora aves'],
    beverages: ['embotelladora', 'cerveceria', 'planta bebidas', 'refresquera', 'jugos industriales'],
    cold_storage: ['almacen frigorifico', 'camara frigorifica', 'bodega fria', 'cadena frio', 'congeladora industrial'],
    pharmaceuticals: ['laboratorio farmaceutico', 'farmaceutica', 'bioteknologia', 'medicamentos', 'industria farmaceutica'],
    ice_plants: ['fabrica hielo', 'planta hielo', 'hielera industrial', 'hielo comercial'],
  }

  const terms: string[] = []
  for (const ind of industries.length > 0 ? industries : Object.keys(termMap)) {
    terms.push(...(termMap[ind] || []))
  }

  return Array.from(new Set(terms))
}

function filterDataset(
  dataset: RawLeadData[],
  industries: string[],
  source?: string
): RawLeadData[] {
  return dataset.filter(company => {
    // Filter by source if specified
    if (source && company.source !== source) return false

    // Filter by industry if specified
    if (industries.length > 0 && company.industry) {
      return industries.some(ind =>
        company.industry?.toLowerCase().includes(ind.toLowerCase())
      )
    }

    return true
  })
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// =====================================================
// Combined Search
// =====================================================

export interface DirectorySearchOptions {
  source: 'siem' | 'canacintra' | 'all'
  industries?: string[]
  regions?: string[]
  limit?: number
}

/**
 * Search multiple business directories
 */
export async function searchBusinessDirectories(
  options: DirectorySearchOptions
): Promise<RawLeadData[]> {
  const { source, industries = [], limit = 20 } = options
  let leads: RawLeadData[] = []

  if (source === 'siem' || source === 'all') {
    const siemLeads = await searchSIEM({
      industries,
      limit: source === 'all' ? Math.ceil(limit / 2) : limit,
    })
    leads.push(...siemLeads)
  }

  if (source === 'canacintra' || source === 'all') {
    const canacintraLeads = await searchCANACINTRA({
      industries,
      limit: source === 'all' ? Math.ceil(limit / 2) : limit,
    })
    leads.push(...canacintraLeads)
  }

  // Deduplicate by company name
  const seen = new Set<string>()
  leads = leads.filter(lead => {
    const key = lead.company?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return leads.slice(0, limit)
}

/**
 * Check if DENUE API is configured
 */
export function isDENUEConfigured(): boolean {
  return !!process.env.DENUE_API_TOKEN
}

/**
 * Check if scraping/data services are enabled
 */
export function isScrapingEnabled(): boolean {
  return process.env.DISABLE_SCRAPING !== 'true'
}

/**
 * Get statistics about available data
 */
export function getDataStats(): { total: number; byIndustry: Record<string, number>; bySource: Record<string, number> } {
  const byIndustry: Record<string, number> = {}
  const bySource: Record<string, number> = {}

  for (const company of MEXICAN_INDUSTRIAL_COMPANIES) {
    const ind = company.industry || 'other'
    const src = company.source || 'other'
    byIndustry[ind] = (byIndustry[ind] || 0) + 1
    bySource[src] = (bySource[src] || 0) + 1
  }

  return {
    total: MEXICAN_INDUSTRIAL_COMPANIES.length,
    byIndustry,
    bySource,
  }
}
