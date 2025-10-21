'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PersonForm } from '@/components/people/person-form'
import { Person } from '@/lib/types'

export default function NewPersonPage() {
  const router = useRouter()

  const handleSuccess = (person: Person) => {
    router.push('/people')
  }

  const handleCancel = () => {
    router.push('/people')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Person</h1>
        <p className="text-gray-600">Add a new contact to the relationship management system.</p>
      </div>

      <PersonForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}