import React, { useEffect, useState } from 'react'

import { Ban, Phone, Search, X } from 'lucide-react'

import WhatsAppIcon from '@/components/common/icons/WhatsAppIcon'

interface PhoneNumber {
  id: string
  phoneNumber: string
  countryCode: string
  friendlyName: string | null
  provider: string
}

interface ModalSelectPhoneNumberProps {
  isOpen: boolean
  onClose: () => void
  phoneNumbers: PhoneNumber[]
  triggerType: 'WHATSAPP_MESSAGE' | 'WHATSAPP_CALL' | 'PHONE_CALL'
  currentPhoneNumberId?: string | null
  onSave: (phoneNumberId: string) => void
  isLoading?: boolean
}

const ModalSelectPhoneNumber: React.FC<ModalSelectPhoneNumberProps> = ({
  isOpen,
  onClose,
  phoneNumbers,
  triggerType,
  currentPhoneNumberId,
  onSave,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<
    string | null
  >(currentPhoneNumberId || null)

  useEffect(() => {
    setSelectedPhoneNumberId(currentPhoneNumberId || null)
  }, [currentPhoneNumberId, triggerType])

  // Filter phone numbers by search query
  const filteredPhoneNumbers = phoneNumbers.filter(
    (phone) =>
      phone.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.friendlyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.countryCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = () => {
    if (selectedPhoneNumberId) {
      onSave(selectedPhoneNumberId)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedPhoneNumberId(currentPhoneNumberId || null)
    onClose()
  }

  const getTriggerTitle = () => {
    switch (triggerType) {
      case 'WHATSAPP_MESSAGE':
        return 'Select Phone Number for WhatsApp Message'
      case 'WHATSAPP_CALL':
        return 'Select Phone Number for WhatsApp Call'
      case 'PHONE_CALL':
        return 'Select Phone Number for Phone Call'
      default:
        return 'Select Phone Number'
    }
  }

  const getTriggerIcon = () => {
    if (triggerType === 'PHONE_CALL') {
      return <Phone className="w-5 h-5 text-primary-500" />
    }
    return <WhatsAppIcon className="w-5 h-5 text-green-500" />
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-overlay backdrop-blur-sm"
      onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {getTriggerIcon()}
            <h2 className="text-lg font-semibold">{getTriggerTitle()}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[500px]">
          {/* Search Section */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by number, name or country code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Phone Numbers List or Empty State */}
          {filteredPhoneNumbers.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Ban className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery
                  ? "Sorry — we couldn't find any results"
                  : 'No phone numbers available'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery
                  ? 'Please try a different search term'
                  : 'Please add phone numbers to this project first'}
              </p>
            </div>
          ) : (
            /* Phone Numbers List */
            <div className="space-y-2">
              {filteredPhoneNumbers.map((phone) => (
                <div
                  key={phone.id}
                  onClick={() => setSelectedPhoneNumberId(phone.id)}
                  className={`p-4 border rounded-md cursor-pointer transition-all ${
                    selectedPhoneNumberId === phone.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  <div className="flex items-center gap-3">
                    {/* Radio Button */}
                    <input
                      type="radio"
                      checked={selectedPhoneNumberId === phone.id}
                      onChange={() => setSelectedPhoneNumberId(phone.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />

                    {/* Phone Number Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {phone.countryCode} {phone.phoneNumber}
                          </p>
                          {phone.friendlyName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {phone.friendlyName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {phone.provider}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedPhoneNumberId
              ? `1 phone number selected`
              : 'No phone number selected'}
          </span>
          <div className="flex gap-3">
            <button onClick={handleClose} className="btn btn-outline-gray">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedPhoneNumberId || isLoading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalSelectPhoneNumber
