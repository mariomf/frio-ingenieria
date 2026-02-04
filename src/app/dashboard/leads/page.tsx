import { Suspense } from 'react'
import { getAllLeads, getLeadStats } from '@/lib/services/leadsService'
import type { ExtendedLead, LeadCategory } from '@/types/agents'
import { Building2, Mail, Phone, MapPin, TrendingUp, Users, Flame, ThermometerSun, Snowflake, X } from 'lucide-react'

// Category badge colors and icons
const categoryConfig: Record<LeadCategory, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  HOT: {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <Flame className="w-4 h-4" />,
    label: 'Caliente',
  },
  WARM: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: <ThermometerSun className="w-4 h-4" />,
    label: 'Tibio',
  },
  COLD: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Snowflake className="w-4 h-4" />,
    label: 'Frío',
  },
  DISCARD: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: <X className="w-4 h-4" />,
    label: 'Descartado',
  },
}

// Status badge colors
const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  new: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Nuevo' },
  contacted: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Contactado' },
  qualified: { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'Calificado' },
  converted: { color: 'text-emerald-700', bgColor: 'bg-emerald-100', label: 'Convertido' },
  lost: { color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Perdido' },
}

function StatCard({ title, value, icon, subtext }: {
  title: string
  value: string | number
  icon: React.ReactNode
  subtext?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}

function CategoryBadge({ category }: { category: LeadCategory }) {
  const config = categoryConfig[category] || categoryConfig.COLD
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.new
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  )
}

function ScoreBar({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-red-500'
    if (s >= 60) return 'bg-orange-500'
    if (s >= 40) return 'bg-blue-500'
    return 'bg-gray-400'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-600 w-8">{score}</span>
    </div>
  )
}

function LeadCard({ lead }: { lead: ExtendedLead }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{lead.company || lead.name}</h3>
          {lead.company && lead.name !== lead.company && (
            <p className="text-sm text-gray-500">{lead.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CategoryBadge category={lead.category as LeadCategory} />
          <StatusBadge status={lead.status} />
        </div>
      </div>

      <div className="mb-4">
        <ScoreBar score={lead.score || 0} />
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {lead.industry && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="capitalize">{lead.industry.replace(/_/g, ' ')}</span>
          </div>
        )}
        {lead.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{lead.location}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
              {lead.email}
            </a>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
              {lead.phone}
            </a>
          </div>
        )}
      </div>

      {lead.source && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Fuente: {lead.source.replace('ai_prospector:', '')}
          </p>
          <p className="text-xs text-gray-400">
            Creado: {new Date(lead.created_at).toLocaleDateString('es-MX')}
          </p>
        </div>
      )}
    </div>
  )
}

async function LeadsStats() {
  const stats = await getLeadStats()

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Error cargando estadísticas
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Leads"
        value={stats.total}
        icon={<Users className="w-6 h-6 text-blue-600" />}
        subtext={`Score promedio: ${stats.avgScore}`}
      />
      <StatCard
        title="Leads HOT"
        value={stats.byCategory.HOT}
        icon={<Flame className="w-6 h-6 text-red-500" />}
        subtext="Contactar inmediatamente"
      />
      <StatCard
        title="Leads WARM"
        value={stats.byCategory.WARM}
        icon={<ThermometerSun className="w-6 h-6 text-orange-500" />}
        subtext="Nurturing activo"
      />
      <StatCard
        title="Tasa Conversión"
        value={stats.total > 0 ? `${Math.round((stats.byStatus.converted / stats.total) * 100)}%` : '0%'}
        icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        subtext={`${stats.byStatus.converted} convertidos`}
      />
    </div>
  )
}

async function LeadsList() {
  const leads = await getAllLeads()

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No hay leads aún</h3>
        <p className="text-gray-500 mb-4">
          Ejecuta el ProspectorBot para comenzar a encontrar leads.
        </p>
        <code className="block bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 max-w-md mx-auto">
          curl -X POST http://localhost:3000/api/agents/prospector \<br/>
          -H &quot;Content-Type: application/json&quot; \<br/>
          -d &apos;{`{"industries": ["food_processing"], "maxLeads": 10}`}&apos;
        </code>
      </div>
    )
  }

  // Group leads by category
  const hotLeads = leads.filter(l => l.category === 'HOT')
  const warmLeads = leads.filter(l => l.category === 'WARM')
  const coldLeads = leads.filter(l => l.category === 'COLD')

  return (
    <div className="space-y-8">
      {/* HOT Leads */}
      {hotLeads.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Flame className="w-5 h-5 text-red-500" />
            Leads HOT ({hotLeads.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      )}

      {/* WARM Leads */}
      {warmLeads.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <ThermometerSun className="w-5 h-5 text-orange-500" />
            Leads WARM ({warmLeads.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warmLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      )}

      {/* COLD Leads */}
      {coldLeads.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Snowflake className="w-5 h-5 text-blue-500" />
            Leads COLD ({coldLeads.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coldLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-200 h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-gray-200 h-64 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function LeadsDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Leads
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona y da seguimiento a leads generados por ProspectorBot
          </p>
        </div>

        {/* Stats */}
        <Suspense fallback={<LoadingState />}>
          <LeadsStats />
        </Suspense>

        {/* Leads List */}
        <Suspense fallback={<LoadingState />}>
          <LeadsList />
        </Suspense>
      </div>
    </div>
  )
}
