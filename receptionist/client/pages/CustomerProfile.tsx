"use client"

import React, { useState, useEffect } from 'react'
import { ChevronDown, Filter } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Navbar from '@/components/NavBar'
import axiosInstance from '@/lib/axios'
import CustomerProfileSkeleton from '@/skeletons/CustomerProfileSkeleton'

interface CustomerData {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
  gender?: string
  dateOfBirth?: string
  notes?: string
  age?: number
  weight?: number
  bloodGroup?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  metadata?: {
    photo?: {
      name: string
      type: string
      size: number
      data: string
    }
  }
}

interface Appointment {
  id: string
  serviceId: string | null
  staffId: string
  startAt: string
  endAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  price: number
  service: { id: string; name: string } | null
  staff: { id: string; displayName: string }
}

export default function CustomerProfile() {
  const location = useLocation()
  
  // Parse query params from URL
  const queryParams = new URLSearchParams(location.search)
  const customerId = queryParams.get('id')
  
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('future')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<CustomerData>>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  useEffect(() => {
    if (!customerId) {
      setError('No customer ID provided')
      setLoading(false)
      return
    }

    const fetchCustomerData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch customer data from backend
        const { data: customerRes } = await axiosInstance.get(`/customers/${customerId}`)
        if (customerRes?.data) {
          setCustomer(customerRes.data)
        }

        // Fetch appointments for this customer
        const { data: appointmentsRes } = await axiosInstance.get('/appointments', {
          params: {
            customerId,
            limit: 100,
          },
        })
        if (appointmentsRes?.data) {
          setAppointments(appointmentsRes.data)
        }
      } catch (err: any) {
        console.error('Error fetching customer data:', err)
        setError(err.message || 'Failed to load customer profile')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [customerId])

  const handleOpenEditModal = () => {
    if (customer) {
      setEditFormData({
        firstName: customer.firstName,
        lastName: customer.lastName || undefined,
        phone: customer.phone || undefined,
        email: customer.email || undefined,
        gender: customer.gender,
        dateOfBirth: customer.dateOfBirth,
        age: customer.age,
        weight: customer.weight,
        bloodGroup: customer.bloodGroup,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        notes: customer.notes,
      })
      setPhotoPreview(
        customer.metadata?.photo?.data
          ? `data:${customer.metadata.photo.type};base64,${customer.metadata.photo.data}`
          : null
      )
      setPhotoFile(null)
      setEditError(null)
      setShowEditModal(true)
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditFormData({})
    setPhotoPreview(null)
    setPhotoFile(null)
    setEditError(null)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    // Type coerce age and weight to numbers
    const parsedValue = (name === 'age' || name === 'weight') && value ? parseInt(value, 10) : value
    setEditFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : parsedValue,
    }))
  }

  const handleSaveChanges = async () => {
    if (!customer) return

    try {
      setEditLoading(true)
      setEditError(null)

      // Validate required fields
      if (!editFormData.firstName || editFormData.firstName.trim() === '') {
        setEditError('First Name is required')
        return
      }

      const formData = new FormData()
      
      // Add all fields except photo
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value))
        }
      })

      // Add photo file if exists
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      // Send PUT request with multipart/form-data
      const { data: updatedCustomer } = await axiosInstance.put(
        `/customers/${customer.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (updatedCustomer?.data) {
        setCustomer(updatedCustomer.data)
        handleCloseEditModal()
      }
    } catch (err: any) {
      console.error('Error saving customer:', err)
      setEditError(err.response?.data?.message || err.message || 'Failed to save changes')
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) {
    return <CustomerProfileSkeleton />
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100">
        <Navbar />
        <div className="pt-20 px-6 flex items-center justify-center">
          <p className="text-lg text-red-600">{error || 'Customer not found'}</p>
        </div>
      </div>
    )
  }

  const fullName = customer.lastName 
    ? `${customer.firstName} ${customer.lastName}` 
    : customer.firstName
  const futureAppointments = appointments.filter(
    (a) => new Date(a.startAt) > new Date() && a.status !== 'CANCELLED'
  )
  const pastAppointments = appointments.filter(
    (a) => new Date(a.startAt) <= new Date() || a.status === 'COMPLETED'
  )
  pastAppointments.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100">
      <Navbar />
      
      <div className="pt-[44px] px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Customer Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 mb-4 flex items-center justify-center overflow-hidden">
                {customer.metadata?.photo?.data ? (
                  <img
                    src={`data:${customer.metadata.photo.type};base64,${customer.metadata.photo.data}`}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {customer.firstName[0]}{customer.lastName?.[0] || ''}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-center">{fullName}</h3>
              {customer.phone && <p className="text-sm text-gray-600 mt-1">{customer.phone}</p>}
              {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
            </div>

            {/* General Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">General <span className="text-blue-600">Information</span></h3>
                <button
                  onClick={handleOpenEditModal}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-3 text-sm">
                {customer.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{customer.gender}</span>
                  </div>
                )}
                {customer.dateOfBirth && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Of Birth:</span>
                    <span className="font-medium">{new Date(customer.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                {(customer.age || customer.weight) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age & Weight:</span>
                    <span className="font-medium">
                      {customer.age ? `${customer.age} Year` : ''}{customer.age && customer.weight ? ' & ' : ''}{customer.weight ? `${customer.weight}kg` : ''}
                    </span>
                  </div>
                )}
                {customer.bloodGroup && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blood Group:</span>
                    <span className="font-medium">{customer.bloodGroup}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right text-xs">{customer.address}</span>
                  </div>
                )}
                {(customer.city || customer.state || customer.zipCode) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-right text-xs">
                      {[customer.city, customer.state, customer.zipCode].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {customer.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notes:</span>
                    <span className="font-medium text-right text-xs">{customer.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Feedback/Info */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Customer <span className="font-bold">Info</span></h3>
              <p className="text-sm leading-relaxed">
                Total Appointments: <span className="font-bold">{appointments.length}</span>
                <br />
                Upcoming Visits: <span className="font-bold">{futureAppointments.length}</span>
                <br />
                Completed Visits: <span className="font-bold">{pastAppointments.length}</span>
              </p>
            </div>
          </div>

          {/* Analytics & Prescription Buttons */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <button className="bg-white rounded-lg shadow-md p-4 text-center font-semibold text-gray-700 hover:shadow-lg transition">
              Analytics <ChevronDown className="inline ml-2" size={18} />
            </button>
            <button className="bg-green-500 rounded-lg shadow-md p-4 text-center font-semibold text-white hover:bg-green-600 transition">
              Prescription
            </button>
          </div>

          {/* Tabs & Filters */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('future')}
                  className={`pb-2 px-2 font-semibold transition ${activeTab === 'future' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                >
                  Future Visits ({futureAppointments.length})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`pb-2 px-2 font-semibold transition ${activeTab === 'past' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                >
                  Past Visits ({pastAppointments.length})
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition">
                <Filter size={18} />
                Advanced Filters
              </button>
            </div>

            {/* Appointments Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Staff</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'future' ? futureAppointments : pastAppointments).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No {activeTab === 'future' ? 'upcoming' : 'past'} appointments
                      </td>
                    </tr>
                  ) : (
                    (activeTab === 'future' ? futureAppointments : pastAppointments).map((appt) => (
                      <tr key={appt.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-800">{appt.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{appt.service?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{appt.staff.displayName}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                            appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            appt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {new Date(appt.startAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">₹{appt.price}</td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-gray-600 hover:text-gray-800">⋮</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Customer Information</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {editError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Upload */}
                <div className="md:col-span-2 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-gray-400">
                        {editFormData.firstName?.[0]}{editFormData.lastName?.[0] || ''}
                      </span>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <span className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition inline-block">
                      Choose Photo
                    </span>
                  </label>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName || ''}
                    onChange={handleEditInputChange}
                    placeholder="First Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName || ''}
                    onChange={handleEditInputChange}
                    placeholder="Last Name (Optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email || ''}
                    onChange={handleEditInputChange}
                    placeholder="Email (Optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone || ''}
                    onChange={handleEditInputChange}
                    placeholder="Phone (Optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={editFormData.gender || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editFormData.dateOfBirth?.toString().split('T')[0] || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={editFormData.age || ''}
                    onChange={handleEditInputChange}
                    placeholder="Age"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={editFormData.weight || ''}
                    onChange={handleEditInputChange}
                    placeholder="Weight"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={editFormData.bloodGroup || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address || ''}
                    onChange={handleEditInputChange}
                    placeholder="Street Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={editFormData.city || ''}
                    onChange={handleEditInputChange}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={editFormData.state || ''}
                    onChange={handleEditInputChange}
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={editFormData.zipCode || ''}
                    onChange={handleEditInputChange}
                    placeholder="Zip Code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={editFormData.notes || ''}
                    onChange={handleEditInputChange}
                    placeholder="Additional Notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleCloseEditModal}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}