import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Filter } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import { useClients } from '../../hooks/useClients'
import ClientsTable from '../../components/clients/ClientsTable'
import AddClientModal from '../../components/clients/AddClientModal'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import { US_STATES } from '../../constants/states'
import type { Client } from '../../types/database'

const PAGE_SIZE = 25

export default function ClientsList() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading } = useProfile()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [sortField, setSortField] = useState<keyof Client>('business_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
  }

  const {
    clients,
    loading: clientsLoading,
    totalCount,
    addClient,
  } = useClients({
    orgId: profile?.org_id ?? null,
    search: debouncedSearch,
    stateFilter,
    sortField,
    sortDirection,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setPage(1)
  }

  const handleRowClick = (client: Client) => {
    navigate(`/dashboard/clients/${client.id}`)
  }

  const handleStateFilterChange = (value: string) => {
    setStateFilter(value)
    setPage(1)
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-600">Please complete your profile setup</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Clients</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-md hover:bg-gold-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by business name, contact, or state..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={stateFilter}
              onChange={(e) => handleStateFilterChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="">All States</option>
              {US_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {clientsLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No clients yet. Add your first client.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-md hover:bg-gold-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>
        ) : (
          <>
            <ClientsTable
              clients={clients}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
            />
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} clients
              </span>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addClient}
      />
    </div>
  )
}
