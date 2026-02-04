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

// Leads Service
export {
  getAllLeads,
  getLeadsByCategory,
  getLeadsByStatus,
  getLeadById,
  getFilteredLeads,
  getLeadStats,
  updateLeadStatus,
  updateLead,
  getHotLeadsForAction,
  getRecentLeads,
} from './leadsService'

// Google Maps Service (Lead Prospection)
export {
  searchGoogleMapsLeads,
  searchBusinessInCity,
  isGoogleMapsConfigured,
} from './googleMapsService'

// Web Scraping Service (SIEM, CANACINTRA)
export {
  searchSIEM,
  searchCANACINTRA,
  searchBusinessDirectories,
  isScrapingEnabled,
} from './scrapingService'

// LinkedIn Service (MCP Docker integration)
export {
  searchLinkedIn,
  searchCompany as searchLinkedInCompany,
  getProfile as getLinkedInProfile,
  batchSearchLinkedIn,
  isLinkedInConfigured,
  filterRelevantEmployees,
  clearCache as clearLinkedInCache,
} from './linkedinService'
