'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Organization } from '@/lib/types'
import { OrganizationService } from '@/lib/organizations'
import { Loader2, AlertCircle } from 'lucide-react'

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  mission_area: z.enum(['disaster_relief', 'health_safety', 'military_families', 'international', 'blood_services', 'other']).optional(),
  organization_type: z.enum(['government', 'nonprofit', 'business', 'faith_based', 'educational', 'healthcare', 'other']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active'),
  region_id: z.string().optional(),
  chapter_id: z.string().optional(),
  county_id: z.string().optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OrganizationFormProps {
  organization?: Organization
  onSuccess?: (organization: Organization) => void
  onCancel?: () => void
}

export function OrganizationForm({ organization, onSuccess, onCancel }: OrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [regions, setRegions] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [counties, setCounties] = useState<any[]>([])
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || '',
      mission_area: organization?.mission_area || undefined,
      organization_type: organization?.organization_type || undefined,
      address: organization?.address || '',
      city: organization?.city || '',
      state: organization?.state || '',
      zip: organization?.zip || '',
      website: organization?.website || '',
      phone: organization?.phone || '',
      notes: organization?.notes || '',
      status: organization?.status || 'active',
      region_id: organization?.region_id || '',
      chapter_id: organization?.chapter_id || '',
      county_id: organization?.county_id || '',
    },
  })

  const watchedName = form.watch('name')
  const watchedRegionId = form.watch('region_id')
  const watchedChapterId = form.watch('chapter_id')

  // Load regions on mount
  useEffect(() => {
    OrganizationService.getRegions().then(setRegions)
  }, [])

  // Load chapters when region changes
  useEffect(() => {
    if (watchedRegionId) {
      OrganizationService.getChaptersByRegion(watchedRegionId).then(setChapters)
      form.setValue('chapter_id', '')
      form.setValue('county_id', '')
    } else {
      setChapters([])
      setCounties([])
    }
  }, [watchedRegionId, form])

  // Load counties when chapter changes
  useEffect(() => {
    if (watchedChapterId) {
      OrganizationService.getCountiesByChapter(watchedChapterId).then(setCounties)
      form.setValue('county_id', '')
    } else {
      setCounties([])
    }
  }, [watchedChapterId, form])

  // Check for duplicates when name changes
  useEffect(() => {
    if (watchedName && watchedName.length > 2 && !organization) {
      setIsCheckingDuplicates(true)
      const timeoutId = setTimeout(async () => {
        try {
          const similar = await OrganizationService.searchSimilar(watchedName, watchedRegionId)
          setDuplicates(similar)
        } catch (error) {
          console.error('Error checking duplicates:', error)
        } finally {
          setIsCheckingDuplicates(false)
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      setDuplicates([])
      setIsCheckingDuplicates(false)
    }
  }, [watchedName, watchedRegionId, organization])

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true)
    try {
      const result = organization
        ? await OrganizationService.update(organization.id, data)
        : await OrganizationService.create(data)
      
      onSuccess?.(result)
    } catch (error: any) {
      console.error('Error saving organization:', error)
      form.setError('root', { message: error.message || 'Failed to save organization' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Potential Duplicates Found
            </CardTitle>
            <CardDescription className="text-amber-700">
              These organizations have similar names. Please verify this isn't a duplicate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {duplicates.map((dup: any) => (
                <div key={dup.id} className="text-sm">
                  <span className="font-medium">{dup.name}</span>
                  <span className="text-gray-500 ml-2">
                    (Similarity: {Math.round(dup.similarity_score * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{organization ? 'Edit Organization' : 'Add New Organization'}</CardTitle>
          <CardDescription>
            {organization 
              ? 'Update the organization information below.'
              : 'Enter the details for the new organization.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {form.formState.errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                  {isCheckingDuplicates && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
                </label>
                <Input
                  {...form.register('name')}
                  placeholder="Organization name"
                  error={form.formState.errors.name?.message}
                />
              </div>

              <div>
                <label htmlFor="mission_area" className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Area
                </label>
                <select
                  {...form.register('mission_area')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select mission area</option>
                  <option value="disaster_relief">Disaster Relief</option>
                  <option value="health_safety">Health & Safety</option>
                  <option value="military_families">Military Families</option>
                  <option value="international">International</option>
                  <option value="blood_services">Blood Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="organization_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Type
                </label>
                <select
                  {...form.register('organization_type')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select type</option>
                  <option value="government">Government</option>
                  <option value="nonprofit">Nonprofit</option>
                  <option value="business">Business</option>
                  <option value="faith_based">Faith-based</option>
                  <option value="educational">Educational</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...form.register('status')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
            </div>

            {/* Geographic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    {...form.register('region_id')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="chapter_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter
                  </label>
                  <select
                    {...form.register('chapter_id')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    disabled={!watchedRegionId}
                  >
                    <option value="">Select chapter</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="county_id" className="block text-sm font-medium text-gray-700 mb-2">
                    County
                  </label>
                  <select
                    {...form.register('county_id')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    disabled={!watchedChapterId}
                  >
                    <option value="">Select county</option>
                    {counties.map((county) => (
                      <option key={county.id} value={county.id}>
                        {county.name}, {county.state_code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    {...form.register('address')}
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    {...form.register('city')}
                    placeholder="City"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <Input
                      {...form.register('state')}
                      placeholder="State"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <Input
                      {...form.register('zip')}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    {...form.register('website')}
                    placeholder="https://example.com"
                    error={form.formState.errors.website?.message}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    {...form.register('phone')}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...form.register('notes')}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  rows={3}
                  placeholder="Additional notes about this organization"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {organization ? 'Update Organization' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}