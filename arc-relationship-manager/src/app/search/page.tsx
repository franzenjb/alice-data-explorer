'use client'

import { useState } from 'react'
import { OrganizationService } from '@/lib/organizations'
import { PersonService } from '@/lib/people'
import { MeetingService } from '@/lib/meetings'
import { Organization, Person, Meeting } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Building2, User, Calendar, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<{
    organizations: Organization[]
    people: Person[]
    meetings: Meeting[]
  }>({
    organizations: [],
    people: [],
    meetings: []
  })

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const [orgs, people, meetings] = await Promise.all([
        OrganizationService.getAll({ query }),
        PersonService.getAll({ query }),
        MeetingService.getAll({ query })
      ])

      setResults({
        organizations: orgs,
        people: people,
        meetings: meetings
      })
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const totalResults = results.organizations.length + results.people.length + results.meetings.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-600">Find organizations, people, and meetings across your network</p>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search organizations, people, meetings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {query && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            {isSearching ? (
              'Searching...'
            ) : (
              `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
            )}
          </div>

          {/* Organizations */}
          {results.organizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Organizations ({results.organizations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.organizations.map((org) => (
                    <div key={org.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{org.name}</h3>
                          {org.mission_area && (
                            <p className="text-sm text-gray-600 capitalize">
                              {org.mission_area.replace('_', ' ')}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            {org.city && org.state && (
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {org.city}, {org.state}
                              </div>
                            )}
                            {org.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {org.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/organizations/${org.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* People */}
          {results.people.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  People ({results.people.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.people.map((person) => (
                    <div key={person.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {person.first_name} {person.last_name}
                          </h3>
                          {person.title && (
                            <p className="text-sm text-gray-600">{person.title}</p>
                          )}
                          {person.organization && (
                            <p className="text-sm text-gray-500">
                              {person.organization.name}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            {person.email && (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {person.email}
                              </div>
                            )}
                            {person.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {person.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/people/${person.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meetings */}
          {results.meetings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Meetings ({results.meetings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.meetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {new Date(meeting.date).toLocaleDateString()}
                            </span>
                            {meeting.organization && (
                              <span className="text-sm text-gray-600">
                                with {meeting.organization.name}
                              </span>
                            )}
                          </div>
                          {meeting.location && (
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {meeting.location}
                            </p>
                          )}
                          {meeting.summary && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              {meeting.summary}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/meetings/${meeting.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {!isSearching && totalResults === 0 && query && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">
                  No organizations, people, or meetings match your search for "{query}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!query && (
        <Card>
          <CardHeader>
            <CardTitle>Search Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Search for organization names, people names, or meeting summaries</li>
              <li>• Use partial words - "Red Cross" will find "American Red Cross"</li>
              <li>• Search by email addresses or phone numbers</li>
              <li>• Look for meeting locations or notes</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}