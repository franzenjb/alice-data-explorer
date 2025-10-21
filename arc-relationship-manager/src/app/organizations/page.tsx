'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OrganizationService } from '@/lib/organizations'
import { Organization } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Plus, MapPin, Globe, Phone } from 'lucide-react'

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await OrganizationService.getAll()
        setOrganizations(data)
      } catch (error: any) {
        setError(error.message || 'Failed to load organizations')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrganizations()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600">Manage partner organizations and stakeholders</p>
        </div>
        <Button asChild>
          <Link href="/organizations/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Link>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first partner organization.</p>
            <Button asChild>
              <Link href="/organizations/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="truncate">{org.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    org.status === 'active' ? 'bg-green-100 text-green-800' :
                    org.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {org.status}
                  </span>
                </CardTitle>
                {org.mission_area && (
                  <p className="text-sm text-gray-500 capitalize">
                    {org.mission_area.replace('_', ' ')}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {org.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{org.city}, {org.state}</span>
                    </div>
                  )}
                  {org.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <span className="truncate">{org.website}</span>
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-4 text-xs text-gray-500">
                    <span>{org.people?.length || 0} people</span>
                    <span>{org.meetings?.length || 0} meetings</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/organizations/${org.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}