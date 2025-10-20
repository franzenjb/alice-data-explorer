'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthService, AuthUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Search, Menu, X, LogOut, User } from 'lucide-react'

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get current user
    AuthService.getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false))

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(setUser)

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await AuthService.signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Organizations', href: '/organizations' },
    { name: 'People', href: '/people' },
    { name: 'Meetings', href: '/meetings' },
    { name: 'Search', href: '/search' },
  ]

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">ARC</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Relationship Manager
                </h1>
                <p className="text-xs text-gray-500">American Red Cross</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Search Button */}
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/search">
                    <Search className="h-4 w-4" />
                  </Link>
                </Button>

                {/* User Profile */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.profile?.first_name} {user.profile?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.profile?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user.profile?.first_name} {user.profile?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.profile?.role?.replace('_', ' ')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 mt-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}