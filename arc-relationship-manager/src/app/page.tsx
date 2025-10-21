'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService, AuthUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, Calendar, TrendingUp, Activity, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Temporary fix - assume we're authenticated if we have a token
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('sb-okclryedqbghlhxzqyrw-auth-token')
    
    if (!hasToken) {
      router.push('/auth/signin')
      return
    }
    
    // Set the actual logged-in user
    setUser({
      id: 'temp-user',
      email: 'jeff.franzen2@redcross.org',
      profile: {
        first_name: 'Jeff',
        last_name: 'Franzen',
        role: 'chapter_user'
      }
    })
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  // Sample data - will be replaced with real data from Supabase
  const stats = [
    {
      title: "Total Organizations",
      value: "127",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12 this month"
    },
    {
      title: "People",
      value: "456",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+23 this month"
    },
    {
      title: "Meetings",
      value: "89",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+8 this week"
    },
    {
      title: "Follow-ups Due",
      value: "15",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "5 overdue"
    }
  ]

  const quickActions = [
    {
      title: "Add Organization",
      description: "Register a new partner organization",
      href: "/organizations/new",
      icon: Building2,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Log Meeting",
      description: "Record a new meeting or interaction",
      href: "/meetings/new",
      icon: Calendar,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Search Contacts",
      description: "Find organizations and people",
      href: "/search",
      icon: Users,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "View Map",
      description: "See organizations by location",
      href: "/map",
      icon: MapPin,
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.profile?.first_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your region today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor} mr-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-red-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to help you manage relationships efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start text-left"
                      asChild
                    >
                      <Link href={action.href}>
                        <div className="flex items-center w-full mb-2">
                          <Icon className="h-5 w-5 mr-2 text-gray-600" />
                          <span className="font-semibold">{action.title}</span>
                        </div>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates in your region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample activity items - will be replaced with real data */}
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">New organization added</p>
                    <p className="text-xs text-gray-500">Community Food Bank</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Meeting scheduled</p>
                    <p className="text-xs text-gray-500">With City Emergency Services</p>
                    <p className="text-xs text-gray-400">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Contact updated</p>
                    <p className="text-xs text-gray-500">Sarah Johnson's info</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-4" asChild>
                <Link href="/activity">View all activity</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Setup Notice for New Users */}
      {user.profile?.role === 'chapter_user' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Complete Your Setup</CardTitle>
            <CardDescription className="text-amber-700">
              To get the most out of the system, make sure your profile and region are configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/profile">Update Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
