/**
 * Exportaciones centralizadas de todos los servicios de datos
 */

// Brand Service
export {
  getAllBrands,
  getBrandBySlug,
  getBrandById,
  getDirectDistributorBrands,
} from './brandService'

// Equipment Service
export {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByBrand,
  getEquipmentByType,
  getEquipmentWithBrand,
} from './equipmentService'

// Part Service
export {
  getAllParts,
  getPartById,
  getPartByPartNumber,
  getPartsByBrand,
  getPartsByCategory,
  getInStockParts,
  searchParts,
  getFilteredParts,
  getPartsWithBrand,
  getFeaturedParts,
} from './partService'

// Project Service
export {
  getAllProjects,
  getProjectBySlug,
  getProjectById,
  getFeaturedProjects,
  getProjectsByIndustry,
  getProjectsByApplication,
  getFilteredProjects,
  getRecentProjects,
} from './projectService'
