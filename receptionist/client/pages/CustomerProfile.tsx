"use client"

import React, { useState, useEffect } from 'react'
import { ChevronDown, Filter } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Navbar from '@/components/NavBar'
import axiosInstance from '@/lib/axios'

interface CustomerData {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
  gender?: string
  dateOfBirth?: string
  notes?: string
}

interface Appointment {
  id: string
  serviceId: string
  staffId: string
  startAt: string
  endAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  price: number
  service: { id: string; name: string }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100">
        <Navbar />
        <div className="pt-20 px-6 flex items-center justify-center">
          <p className="text-lg text-gray-600">Loading customer profile...</p>
        </div>
      </div>
    )
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

  const fullName = `${customer.firstName} ${customer.lastName || ''}`
  const futureAppointments = appointments.filter(
    (a) => new Date(a.startAt) > new Date() && a.status !== 'CANCELLED'
  )
  const pastAppointments = appointments.filter(
    (a) => new Date(a.startAt) <= new Date() || a.status === 'COMPLETED'
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100">
      <Navbar />
      
      <div className="pt-[44px] px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Customer Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-300 mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-600">
                  {customer.firstName[0]}{customer.lastName?.[0] || ''}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-center">{fullName}</h3>
              {customer.phone && <p className="text-sm text-gray-600 mt-1">{customer.phone}</p>}
              {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
            </div>

            {/* General Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">General <span className="text-blue-600">Information</span></h3>
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
                        <td className="px-6 py-4 text-sm text-gray-800">{appt.service.name}</td>
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
    </div>
  )
}