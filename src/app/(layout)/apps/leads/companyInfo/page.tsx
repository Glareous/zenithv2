'use client'

import React, { useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { Building2, Save } from 'lucide-react'
import { toast } from 'react-toastify'

const CompanyInfoPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    shortDescription: '',
    mainServices: '',
    targetAudience: '',
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      console.log('Company Info to save:', formData)
      toast.success('Company information saved successfully!')
      setIsSaving(false)
    }, 500)
  }

  return (
    <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
      <BreadCrumb title="Company Information" subTitle="Leads" />

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="card-title">About Your Company</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Provide information about your company
              </p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block mb-2 text-sm font-medium">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="form-input"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="shortDescription" className="block mb-2 text-sm font-medium">
                Short Description
              </label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                className="form-input"
                rows={4}
                placeholder="Brief description of your company..."
                value={formData.shortDescription}
                onChange={handleChange}
              />
            </div>

            {/* Main Services */}
            <div>
              <label htmlFor="mainServices" className="block mb-2 text-sm font-medium">
                Main Services
              </label>
              <textarea
                id="mainServices"
                name="mainServices"
                className="form-input"
                rows={4}
                placeholder="List your main services or products..."
                value={formData.mainServices}
                onChange={handleChange}
              />
            </div>

            {/* Target Audience */}
            <div>
              <label htmlFor="targetAudience" className="block mb-2 text-sm font-medium">
                Target Audience
              </label>
              <textarea
                id="targetAudience"
                name="targetAudience"
                className="form-input"
                rows={4}
                placeholder="Describe your target audience..."
                value={formData.targetAudience}
                onChange={handleChange}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving || !formData.companyName}>
                <Save className="inline-block size-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyInfoPage