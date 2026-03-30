import { ChevronUp, ChevronDown } from 'lucide-react'
import type { Client } from '../../types/database'

interface ClientsTableProps {
  clients: Client[]
  sortField: keyof Client
  sortDirection: 'asc' | 'desc'
  onSort: (field: keyof Client) => void
  onRowClick: (client: Client) => void
}

export default function ClientsTable({
  clients,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
}: ClientsTableProps) {
  const SortIcon = ({ field }: { field: keyof Client }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  const headerClass =
    'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none'

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className={headerClass} onClick={() => onSort('business_name')}>
              <div className="flex items-center gap-1">
                Business Name
                <SortIcon field="business_name" />
              </div>
            </th>
            <th className={headerClass} onClick={() => onSort('primary_contact_name')}>
              <div className="flex items-center gap-1">
                Contact Name
                <SortIcon field="primary_contact_name" />
              </div>
            </th>
            <th className={headerClass} onClick={() => onSort('state')}>
              <div className="flex items-center gap-1">
                State
                <SortIcon field="state" />
              </div>
            </th>
            <th className={headerClass} onClick={() => onSort('sic_code')}>
              <div className="flex items-center gap-1">
                Class Code
                <SortIcon field="sic_code" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Producer
            </th>
            <th className={headerClass} onClick={() => onSort('status')}>
              <div className="flex items-center gap-1">
                Status
                <SortIcon field="status" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, idx) => (
            <tr
              key={client.id}
              onClick={() => onRowClick(client)}
              className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-4 py-3 text-sm text-navy font-medium">{client.business_name}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {client.primary_contact_name || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{client.state || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{client.sic_code || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {client.producer
                  ? `${client.producer.first_name} ${client.producer.last_name}`.trim() || '-'
                  : '-'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {client.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
