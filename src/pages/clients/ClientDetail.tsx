import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, X, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../hooks/useProfile'
import Spinner from '../../components/ui/Spinner'
import { US_STATES } from '../../constants/states'
import type { Client, ClientFormData } from '../../types/database'

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile, loading: profileLoading } = useProfile()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<ClientFormData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchClient() {
      if (!id || !profile?.org_id) return

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*, producer:profiles!clients_producer_id_fkey(id, first_name, last_name)')
        .eq('id', id)
        .eq('org_id', profile.org_id)
        .maybeSingle()

      if (fetchError) {
        setError(fetchError.message)
      } else if (!data) {
        setError('Client not found')
      } else {
        setClient(data)
      }
      setLoading(false)
    }

    if (profile) {
      fetchClient()
    }
  }, [id, profile])

  const handleEdit = () => {
    if (!client) return
    setEditData({
      business_name: client.business_name,
      dba: client.dba,
      primary_contact_name: client.primary_contact_name,
      contact_email: client.contact_email,
      contact_phone: client.contact_phone,
      address_line1: client.address_line1,
      address_line2: client.address_line2,
      city: client.city,
      state: client.state,
      zip: client.zip,
      sic_code: client.sic_code,
      naics_code: client.naics_code,
      description_of_operations: client.description_of_operations,
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData(null)
  }

  const handleSave = async () => {
    if (!editData || !client) return

    setSaving(true)
    const { error: updateError } = await supabase
      .from('clients')
      .update({ ...editData, updated_at: new Date().toISOString() })
      .eq('id', client.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setClient({ ...client, ...editData })
      setIsEditing(false)
      setEditData(null)
    }
    setSaving(false)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editData) return
    const { name, value } = e.target
    setEditData({ ...editData, [name]: value })
  }

  if (profileLoading || loading) {
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

  if (error || !client) {
    return (
      <div>
        <Link
          to="/dashboard/clients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-navy mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-red-600">{error || 'Client not found'}</p>
        </div>
      </div>
    )
  }

  const InfoField = ({
    label,
    value,
    name,
    type = 'text',
    isTextarea = false,
  }: {
    label: string
    value: string
    name: keyof ClientFormData
    type?: string
    isTextarea?: boolean
  }) => (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      {isEditing && editData ? (
        isTextarea ? (
          <textarea
            name={name}
            value={editData[name]}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
          />
        ) : name === 'state' ? (
          <select
            name={name}
            value={editData[name]}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
          >
            <option value="">Select State</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={editData[name]}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
          />
        )
      ) : (
        <dd className="mt-1 text-sm text-navy">{value || '-'}</dd>
      )}
    </div>
  )

  return (
    <div>
      <Link
        to="/dashboard/clients"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-navy mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy">{client.business_name}</h1>
            {client.dba && <p className="text-sm text-gray-500">DBA: {client.dba}</p>}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-md hover:bg-teal-600 transition-colors font-medium disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField label="Business Name" value={client.business_name} name="business_name" />
            <InfoField label="DBA" value={client.dba} name="dba" />
            <InfoField
              label="Primary Contact"
              value={client.primary_contact_name}
              name="primary_contact_name"
            />
            <InfoField label="Email" value={client.contact_email} name="contact_email" type="email" />
            <InfoField label="Phone" value={client.contact_phone} name="contact_phone" type="tel" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {client.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <InfoField label="Address Line 1" value={client.address_line1} name="address_line1" />
            <InfoField label="Address Line 2" value={client.address_line2} name="address_line2" />
            <InfoField label="City" value={client.city} name="city" />
            <InfoField label="State" value={client.state} name="state" />
            <InfoField label="ZIP Code" value={client.zip} name="zip" />
            <InfoField label="SIC Code" value={client.sic_code} name="sic_code" />
            <InfoField label="NAICS Code" value={client.naics_code} name="naics_code" />
            <div>
              <dt className="text-sm font-medium text-gray-500">Producer</dt>
              <dd className="mt-1 text-sm text-navy">
                {client.producer
                  ? `${client.producer.first_name} ${client.producer.last_name}`.trim() || '-'
                  : '-'}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <InfoField
              label="Description of Operations"
              value={client.description_of_operations}
              name="description_of_operations"
              isTextarea
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-navy mb-4">Policies</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Policy Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Carrier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Effective Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No policies yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-navy mb-4">Submissions</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Submission ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Line of Business
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Carrier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No submissions yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
