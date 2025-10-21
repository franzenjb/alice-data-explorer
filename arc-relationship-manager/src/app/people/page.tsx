'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PersonService } from '@/lib/people'
import { Person } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus, Mail, Phone, Building2, User } from 'lucide-react'

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const data = await PersonService.getAll()
        setPeople(data)
      } catch (error: any) {
        setError(error.message || 'Failed to load people')
      } finally {
        setIsLoading(false)
      }
    }

    loadPeople()
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
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600">Manage contacts and key relationships</p>
        </div>
        <Button asChild>
          <Link href="/people/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Link>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* People Grid */}
      {people.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No people yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first contact.</p>
            <Button asChild>
              <Link href="/people/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Person
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="truncate">
                      {person.first_name} {person.last_name}
                    </span>
                  </div>
                </CardTitle>
                {person.title && (
                  <p className="text-sm text-gray-500 truncate">
                    {person.title}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {person.organization && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="truncate">{person.organization.name}</span>
                    </div>
                  )}
                  {person.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {person.meetings?.length || 0} meetings
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/people/${person.id}`}>
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