'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MeetingService } from '@/lib/meetings'
import { Meeting } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, MapPin, Building2, Clock, AlertCircle } from 'lucide-react'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [followUps, setFollowUps] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meetingsData, followUpsData] = await Promise.all([
          MeetingService.getAll(),
          MeetingService.getFollowUps()
        ])
        setMeetings(meetingsData)
        setFollowUps(followUpsData)
      } catch (error: any) {
        setError(error.message || 'Failed to load meetings')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Track meetings and follow-up actions</p>
        </div>
        <Button asChild>
          <Link href="/meetings/new">
            <Plus className="h-4 w-4 mr-2" />
            Log Meeting
          </Link>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Follow-ups Alert */}
      {followUps.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Follow-ups Due ({followUps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followUps.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{meeting.organization?.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isOverdue(meeting.follow_up_date!) ? "destructive" : "secondary"}>
                      {formatDate(meeting.follow_up_date!)}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/meetings/${meeting.id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {followUps.length > 3 && (
                <p className="text-sm text-orange-600">...and {followUps.length - 3} more</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meetings Grid */}
      {meetings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your relationship meetings and interactions.</p>
            <Button asChild>
              <Link href="/meetings/new">
                <Plus className="h-4 w-4 mr-2" />
                Log First Meeting
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-sm font-medium">
                      {formatDate(meeting.date)}
                    </span>
                  </div>
                  {meeting.follow_up_date && (
                    <Badge variant={isOverdue(meeting.follow_up_date) ? "destructive" : "secondary"} className="text-xs">
                      Follow-up Due
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {meeting.organization && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="truncate">{meeting.organization.name}</span>
                    </div>
                  )}
                  {meeting.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{meeting.location}</span>
                    </div>
                  )}
                  {meeting.follow_up_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Follow-up: {formatDate(meeting.follow_up_date)}</span>
                    </div>
                  )}
                  {meeting.summary && (
                    <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                      {meeting.summary}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {meeting.attendees?.length || 0} attendees
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/meetings/${meeting.id}`}>
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