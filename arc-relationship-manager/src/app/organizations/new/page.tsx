'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrganizationForm } from '@/components/organizations/organization-form'
import { Organization } from '@/lib/types'

export default function NewOrganizationPage() {
  const router = useRouter()

  const handleSuccess = (organization: Organization) => {
    // Redirect to organizations list (we'll create this later)
    router.push('/organizations')
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Organization</h1>
        <p className="text-gray-600">Register a new partner organization in the system.</p>
      </div>

      <OrganizationForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}