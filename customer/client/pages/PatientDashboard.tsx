'use client';

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientName = location.state?.name || 'Harmanpreet Kaur';
  const mobileNumber = location.state?.mobileNumber || '9988776655';
  
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPastPaymentModalOpen, setIsPastPaymentModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<string[]>(['rehab-package']);
  const [selectedJoint1Prices, setSelectedJoint1Prices] = useState<string[]>([]);
  const [selectedJoint2Prices, setSelectedJoint2Prices] = useState<string[]>([]);
  const [editableAmount, setEditableAmount] = useState<string>('');
  const [finalAmount, setFinalAmount] = useState<string>('');

  const queuePatients = [
    {
      id: 1,
      name: 'Harman Kaur',
      status: 'In Exercise',
      amount: '₹4K Pending',
      amountType: 'pending',
      mobileNumber: '9876543210',
      email: 'harman.kaur@gmail.com',
      ticketNo: 'AB001',
      planName: 'Rehab Package for 1 Month',
      sessionsUsed: 8,
      totalSessions: 20,
      amountPaid: '₹10,000.00',
      amountPending: '₹4,000.00',
      addedTime: '09:30 AM',
      services: [
        { name: 'Rehab Package', staff: 'Dr. Sahil Bahl', visit: '11/15/2025', status: 'Completed' },
        { name: 'Shockwave Therapy', staff: 'Dr. Priya Singh', visit: '11/18/2025', status: 'Completed' },
        { name: 'Follow-up Consultation', staff: 'Dr. Sahil Bahl', visit: '11/22/2025', status: 'Scheduled' }
      ]
    },
    {
      id: 2,
      name: 'Yogesh Joshi',
      status: 'Waiting',
      amount: 'Full Paid',
      amountType: 'paid',
      mobileNumber: '9876543211',
      email: 'yogesh.joshi@gmail.com',
      ticketNo: 'AB002',
      planName: 'Advanced Therapy for 2 Months',
      sessionsUsed: 15,
      totalSessions: 30,
      amountPaid: '₹18,000.00',
      amountPending: '₹0.00',
      addedTime: '09:45 AM',
      services: [
        { name: 'Advanced Therapy', staff: 'Dr. Rajesh Kumar', visit: '11/20/2025', status: 'Scheduled' },
        { name: 'Laser Treatment', staff: 'Dr. Arjuja Bahl', visit: '11/25/2025', status: 'Scheduled' },
        { name: 'Manual Release', staff: 'Dr. Rajesh Kumar', visit: '12/02/2025', status: 'Pending' }
      ]
    },
    {
      id: 3,
      name: 'Manoj Khan',
      status: 'In Exercise',
      amount: '₹2K Pending',
      amountType: 'pending',
      mobileNumber: '9876543212',
      email: 'manoj.khan@gmail.com',
      ticketNo: 'AB003',
      planName: 'Sports Recovery Package for 6 Weeks',
      sessionsUsed: 5,
      totalSessions: 15,
      amountPaid: '₹8,000.00',
      amountPending: '₹2,000.00',
      addedTime: '10:15 AM',
      services: [
        { name: 'Sports Recovery', staff: 'Dr. Vikram Patel', visit: '11/16/2025', status: 'Completed' },
        { name: 'Kinesiotaping', staff: 'Dr. Priya Singh', visit: '11/21/2025', status: 'Completed' }
      ]
    },
    {
      id: 4,
      name: 'Armaan Malik',
      status: 'Waiting',
      amount: '',
      amountType: '',
      mobileNumber: '9876543213',
      email: 'armaan.malik@gmail.com',
      ticketNo: 'AB004',
      planName: 'Consultation Only',
      sessionsUsed: 0,
      totalSessions: 1,
      amountPaid: '₹500.00',
      amountPending: '₹0.00',
      addedTime: '10:30 AM',
      services: [
        { name: 'Initial Consultation', staff: 'Dr. Sahil Bahl', visit: '11/24/2025', status: 'Scheduled' }
      ]
    },
    {
      id: 5,
      name: 'Suresh Sharma',
      status: 'Waiting',
      amount: '',
      amountType: '',
      mobileNumber: '9876543214',
      email: 'suresh.sharma@gmail.com',
      ticketNo: 'AB005',
      planName: 'Post-Surgery Rehab for 3 Months',
      sessionsUsed: 12,
      totalSessions: 24,
      amountPaid: '₹15,000.00',
      amountPending: '₹5,000.00',
      addedTime: '10:50 AM',
      services: [
        { name: 'Post-Surgery Rehab', staff: 'Dr. Rajesh Kumar', visit: '11/17/2025', status: 'Completed' },
        { name: 'Laser Treatment', staff: 'Dr. Vikram Patel', visit: '11/23/2025', status: 'Completed' },
        { name: 'Therapy Session', staff: 'Dr. Arjuja Bahl', visit: '12/01/2025', status: 'Scheduled' }
      ]
    },
    {
      id: 6,
      name: 'Bakshi Sur',
      status: 'Waiting',
      amount: 'Full Paid',
      amountType: 'paid',
      mobileNumber: '9876543215',
      email: 'bakshi.sur@gmail.com',
      ticketNo: 'AB006',
      planName: 'Wellness Package for 3 Months',
      sessionsUsed: 20,
      totalSessions: 25,
      amountPaid: '₹12,000.00',
      amountPending: '���0.00',
      addedTime: '11:10 AM',
      services: [
        { name: 'Wellness Package', staff: 'Dr. Priya Singh', visit: '11/19/2025', status: 'Completed' },
        { name: 'Dry Needling', staff: 'Dr. Vikram Patel', visit: '11/26/2025', status: 'Scheduled' }
      ]
    },
    {
      id: 7,
      name: 'Amod Sinha',
      status: 'Waiting',
      amount: '',
      amountType: '',
      mobileNumber: location.state?.mobileNumber || '9998887766',
      email: 'amod.sinha@gmail.com',
      ticketNo: 'AB007',
      planName: 'Initial Consultation',
      sessionsUsed: 0,
      totalSessions: 1,
      amountPaid: '₹0.00',
      amountPending: '₹0.00',
      addedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      services: [
        { name: 'Initial Consultation', staff: 'Dr. Sahil Bahl', visit: new Date().toLocaleDateString(), status: 'Pending' }
      ]
    },
  ];

  const services = [
    {
      name: 'Rehab Package',
      staff: 'Dr. Sahil Bahl',
      visit: '11/15/2025',
      status: 'Scheduled'
    },
    {
      name: 'Rehab Package',
      staff: 'Dr. Arjuja Bahl',
      visit: '12/15/2025',
      status: 'Scheduled'
    },
  ];

  const treatments = [
    { id: 'cupping', name: 'Cupping', price: '₹800/-' },
    { id: 'kinesiotaping', name: 'Kinesiotaping', price: '₹500/-' },
    { id: 'dry-needling', name: 'Dry Needling', price: '₹800/-' },
    { id: 'manual-release', name: 'Manual Release', price: '₹1200/-' },
    { id: 'shockwave', name: 'Shockwave', price: '₹1200/-' },
    { id: 'laser', name: 'Laser Treatment', price: '₹1200/-' },
  ];

  const togglePackage = (packageId: string) => {
    if (selectedPackages.includes(packageId)) {
      setSelectedPackages(selectedPackages.filter(p => p !== packageId));
    } else {
      setSelectedPackages([...selectedPackages, packageId]);
    }
  };

  const calculateTotalAmount = (): number => {
    let total = 0;

    // Joint Treatment 1
    if (selectedJoint1Prices.length > 0) {
      if (selectedJoint1Prices.includes('joint-1-price-0')) {
        total += 600; // ₹600/Day
      }
      if (selectedJoint1Prices.includes('joint-1-price-1')) {
        total += 5000; // ₹5000/10 Days
      }
    }

    // Joint Treatment 2
    if (selectedJoint2Prices.length > 0) {
      if (selectedJoint2Prices.includes('joint-2-price-0')) {
        total += 800; // ₹800/Day
      }
      if (selectedJoint2Prices.includes('joint-2-price-1')) {
        total += 7500; // ₹7500/10 Days
      }
    }

    // Individual Treatments
    const treatmentPrices: { [key: string]: number } = {
      'cupping': 800,
      'kinesiotaping': 500,
      'dry-needling': 800,
      'manual-release': 1200,
      'shockwave': 1200,
      'laser': 1200,
    };

    selectedPackages.forEach(pkg => {
      if (treatmentPrices[pkg]) {
        total += treatmentPrices[pkg];
      }
    });

    // Rehab Package
    if (selectedPackages.includes('rehab-package')) {
      total += 14000;
    }

    return total;
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)',
      padding: '14px 40px 40px',
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '63px',
        marginBottom: '30px',
      }}>
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/c93f8aeef4212f434a06a6d43c7754a60ac0b1f6?width=412"
          alt="PhysioPlanet Logo"
          onClick={() => navigate('/')}
          style={{
            width: '206px',
            height: '63px',
            cursor: 'pointer',
          }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}>
          <div style={{
            color: '#0D0D0D',
            fontFamily: 'Mona Sans, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}>
            ACCOUNT
          </div>
          <div style={{
            width: '22px',
            height: '22px',
            position: 'relative',
          }}>
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=44"
              alt="Account"
              style={{
                width: '22px',
                height: '22px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        {/* Left Sidebar - Today's Queue */}
        <div style={{
          width: '260px',
          minWidth: '260px',
          borderRadius: '10px',
          background: '#FFF',
          padding: '30px',
        }}>
          <h2 style={{
            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '18px',
            fontWeight: 700,
            color: '#0D0D0D',
            margin: '0 0 20px 0',
            letterSpacing: '-0.6px',
          }}>
            <span style={{fontWeight: 500, color: '#65758B'}}>Today's </span>
            <span style={{fontWeight: 700, color: '#1D5287'}}>Queue</span>
          </h2>

          {/* Filter & New Appointment Buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <button style={{
              display: 'flex',
              padding: '6px 12px',
              alignItems: 'center',
              gap: '4px',
              borderRadius: '4px',
              border: '1px solid #D8DAEB',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: '#344256',
            }}>
              📊 Filter
            </button>
            <button 
              onClick={() => navigate('/appointment-check')}
              style={{
              flex: 1,
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              borderRadius: '4px',
              background: 'linear-gradient(180deg, #0557A8 0%, #1BB7E9 100%)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFF',
            }}>
              + New
            </button>
          </div>

          {/* Patient List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {queuePatients.map((patient, index) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatientIndex(index)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: selectedPatientIndex === index ? '2px solid #0557A8' : '1px solid #E4E5EB',
                  background: selectedPatientIndex === index ? '#F0F8FF' : '#FAFAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `hsl(${index * 50}, 70%, 60%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0D0D0D',
                    }}>
                      {patient.name}
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: patient.status === 'In Exercise' ? '#F97316' : '#65758B',
                      marginTop: '2px',
                    }}>
                      {patient.status}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '6px',
                }}>
                  {patient.amount && (
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: patient.amountType === 'pending' ? '#DC2626' : '#21C45D',
                    }}>
                      {patient.amount}
                    </div>
                  )}
                  <div style={{
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#DC2626',
                  }}>
                    {patient.addedTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{
          flex: 1,
          minWidth: '650px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Patient Info Card */}
          <div style={{
            borderRadius: '10px',
            background: '#FFF',
            border: '1px solid #E4E5EB',
            overflow: 'hidden',
          }}>
            {/* Patient Header */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #E4E5EB',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}>
              <div>
                <div style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1D5287',
                  marginBottom: '8px',
                }}>
                  Ticket No. {queuePatients[selectedPatientIndex].ticketNo}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: `hsl(${selectedPatientIndex * 50}, 70%, 60%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {queuePatients[selectedPatientIndex].name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#0D0D0D',
                    }}>
                      {queuePatients[selectedPatientIndex].name}
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#65758B',
                      marginTop: '4px',
                    }}>
                      +91 {queuePatients[selectedPatientIndex].mobileNumber}
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#65758B',
                      marginTop: '2px',
                    }}>
                      {queuePatients[selectedPatientIndex].email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab buttons on top right */}
              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}>
                <button style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #D8DAEB',
                  background: '#FAFAFC',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#344256',
                  cursor: 'pointer',
                }}>
                  Analytics
                </button>
                <button style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #D8DAEB',
                  background: '#FAFAFC',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#344256',
                  cursor: 'pointer',
                }}>
                  General Information
                </button>
                <button style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #D8DAEB',
                  background: '#FAFAFC',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#344256',
                  cursor: 'pointer',
                }}>
                  Last Feedbacks
                </button>
              </div>
            </div>

            {/* Cards Grid - Prescriptions, Plans, Payment */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              padding: '30px',
            }}>
              {/* Prescriptions Card */}
              <div style={{
                borderRadius: '10px',
                background: '#F0F8FF',
                border: '1px solid #E4E5EB',
                padding: '20px',
              }}>
                <h3 style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0D0D0D',
                  margin: '0 0 15px 0',
                }}>
                  Prescriptions <span style={{ fontWeight: 700, color: '#1D5287' }}>Photos</span>
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '15px',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '4px',
                    border: '1px solid #D8DAEB',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFF',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '24px',
                    cursor: 'pointer',
                  }}>
                    📷
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 500,
                      color: '#344256',
                      marginTop: '4px',
                    }}>
                      Click
                    </span>
                  </div>
                  <div
                    onClick={() => setIsPrescriptionModalOpen(true)}
                    style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '4px',
                    border: '1px solid #D8DAEB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFF',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0557A8';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 87, 168, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#D8DAEB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
                    }} />
                  </div>
                  <div
                    onClick={() => setIsPrescriptionModalOpen(true)}
                    style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '4px',
                    border: '1px solid #D8DAEB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFF',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0557A8';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 87, 168, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#D8DAEB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #d0d0d0 0%, #e5e5e5 100%)',
                    }} />
                  </div>
                </div>
                <div style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '11px',
                  fontWeight: 400,
                  color: '#65758B',
                  lineHeight: '1.5',
                  textAlign: 'center',
                }}>
                  Note:- Always click a clean photos of your Prescription for getting better results.
                </div>
              </div>

              {/* Plans Card */}
              <div style={{
                borderRadius: '10px',
                background: '#FFF',
                border: '1px solid #E4E5EB',
                padding: '20px',
              }}>
                <h3 style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0D0D0D',
                  margin: '0 0 15px 0',
                }}>
                  Plans <span style={{ fontWeight: 700, color: '#1D5287' }}>Details</span>
                </h3>
                <div style={{
                  marginBottom: '15px',
                }}>
                  <div style={{
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#65758B',
                    marginBottom: '8px',
                  }}>
                    {queuePatients[selectedPatientIndex].planName}
                  </div>
                  <div style={{
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#1D5287',
                  }}>
                    {queuePatients[selectedPatientIndex].sessionsUsed}
                  </div>
                  <div style={{
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#65758B',
                    marginBottom: '15px',
                  }}>
                    Sessions Used ({queuePatients[selectedPatientIndex].totalSessions} Total)
                  </div>
                </div>
                <button 
                  onClick={() => setIsPackageModalOpen(true)}
                  style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #21C45D 0%, #16A34A 100%)',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFF',
                  cursor: 'pointer',
                }}>
                  Sell New Plan
                </button>
              </div>

              {/* Payment Card */}
              <div style={{
                borderRadius: '10px',
                background: '#FFF',
                border: '1px solid #E4E5EB',
                padding: '20px',
              }}>
                <h3 style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0D0D0D',
                  margin: '0 0 15px 0',
                }}>
                  Payment <span style={{ fontWeight: 700, color: '#1D5287' }}>Summary</span>
                </h3>
                <div style={{
                  marginBottom: '15px',
                }}>
                  <div style={{
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#65758B',
                    marginBottom: '8px',
                  }}>
                    {queuePatients[selectedPatientIndex].planName}
                  </div>
                  <div style={{
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: queuePatients[selectedPatientIndex].amountPending === '₹0.00' ? '#21C45D' : '#DC2626',
                    marginBottom: '5px',
                  }}>
                    {queuePatients[selectedPatientIndex].amountPaid} PAID
                  </div>
                  <div style={{
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#65758B',
                    marginBottom: '15px',
                  }}>
                    {queuePatients[selectedPatientIndex].amountPending} Pending
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <button style={{
                    padding: '10px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'linear-gradient(180deg, #21C45D 0%, #16A34A 100%)',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#FFF',
                    cursor: 'pointer',
                  }}>
                    Record Payment
                  </button>
                  <button
                    onClick={() => setIsPastPaymentModalOpen(true)}
                    style={{
                    padding: '10px 16px',
                    borderRadius: '4px',
                    border: '1px solid #D8DAEB',
                    background: '#FAFAFC',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#344256',
                    cursor: 'pointer',
                  }}>
                    View Past Payment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div style={{
            borderRadius: '10px',
            background: '#FFF',
            border: '1px solid #E4E5EB',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #E4E5EB',
            }}>
              <h3 style={{
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0D0D0D',
                margin: 0,
              }}>
                Services
              </h3>
            </div>

            <div style={{
              overflowX: 'auto',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid #E4E5EB',
                    background: '#FAFAFC',
                  }}>
                    <th style={{
                      padding: '15px 30px',
                      textAlign: 'left',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1D5287',
                    }}>
                      Services
                    </th>
                    <th style={{
                      padding: '15px 30px',
                      textAlign: 'left',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1D5287',
                    }}>
                      Staff
                    </th>
                    <th style={{
                      padding: '15px 30px',
                      textAlign: 'left',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1D5287',
                    }}>
                      Visit
                    </th>
                    <th style={{
                      padding: '15px 30px',
                      textAlign: 'left',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1D5287',
                    }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queuePatients[selectedPatientIndex].services.map((service, index) => (
                    <tr key={index} style={{
                      borderBottom: index < queuePatients[selectedPatientIndex].services.length - 1 ? '1px solid #E4E5EB' : 'none',
                    }}>
                      <td style={{
                        padding: '15px 30px',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#344256',
                      }}>
                        {service.name}
                      </td>
                      <td style={{
                        padding: '15px 30px',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#344256',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}>
                          {service.staff}
                          <span style={{ fontSize: '10px' }}>▼</span>
                        </div>
                      </td>
                      <td style={{
                        padding: '15px 30px',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#344256',
                      }}>
                        {service.visit}
                      </td>
                      <td style={{
                        padding: '15px 30px',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '12px',
                        fontWeight: 600,
                        color:
                          service.status === 'Completed' ? '#21C45D' :
                          service.status === 'Scheduled' ? '#0557A8' :
                          service.status === 'Pending' ? '#F97316' : '#65758B'
                      }}>
                        {service.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              padding: '0',
            }}>
              <button style={{
                width: '100%',
                padding: '15px',
                borderRadius: '0 0 10px 10px',
                border: 'none',
                background: 'linear-gradient(180deg, #0557A8 0%, #1BB7E9 100%)',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                + Add/Edit Exercises
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Package Details Modal */}
      {isPackageModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Backdrop */}
          <div 
            onClick={() => setIsPackageModalOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          
          {/* Modal Content */}
          <div
            style={{
              borderRadius: '10px',
              border: '1px solid #E4E5EB',
              background: '#FAFAFC',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '40px',
              zIndex: 51,
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPackageModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                width: '30px',
                height: '30px',
              }}
            >
              ✕
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}>
              {/* Title */}
              <div
                style={{
                  color: '#1D5287',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '36px',
                  fontWeight: 700,
                  lineHeight: 'normal',
                  margin: 0,
                }}
              >
                <span style={{ fontWeight: 400, color: '#0D0D0D' }}>Package </span>
                <span style={{ fontWeight: 700, color: '#1D5287' }}>Details</span>
              </div>

              {/* Joint Treatment Options Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '21px',
                width: '100%',
              }}>
                {[
                  { id: 'joint-1', label: '1. Joint Treatment', prices: ['₹600/Day', '₹5000/10 Days'] },
                  { id: 'joint-2', label: '2. Joint Treatment', prices: ['₹800/Day', '₹7500/10 Days'] },
                ].map((joint) => (
                  <div
                    key={joint.id}
                    onClick={() => {
                      if (selectedPackages.includes(joint.id)) {
                        setSelectedPackages(selectedPackages.filter(p => p !== joint.id));
                        if (joint.id === 'joint-1') {
                          setSelectedJoint1Prices([]);
                        } else {
                          setSelectedJoint2Prices([]);
                        }
                      } else {
                        setSelectedPackages([...selectedPackages, joint.id]);
                        if (joint.id === 'joint-1') {
                          setSelectedJoint1Prices(['joint-1-price-0']);
                        } else {
                          setSelectedJoint2Prices(['joint-2-price-0']);
                        }
                      }
                    }}
                    style={{
                      display: 'flex',
                      padding: '12px',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ABD28C',
                      background: '#E3F0D9',
                      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '1.5px solid #1D5287',
                        background: (joint.id === 'joint-1' && selectedJoint1Prices.length > 0) || (joint.id === 'joint-2' && selectedJoint2Prices.length > 0) ? '#1D5287' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {(joint.id === 'joint-1' && selectedJoint1Prices.length > 0) || (joint.id === 'joint-2' && selectedJoint2Prices.length > 0) ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M9.5 3L5 10L2.5 6.8182" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : null}
                      </div>
                      <div style={{
                        color: '#101111',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500,
                      }}>
                        {joint.label}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '30px',
                    }}>
                      {joint.prices.map((price, idx) => {
                        const priceId = `${joint.id}-price-${idx}`;
                        const isSelected = joint.id === 'joint-1'
                          ? selectedJoint1Prices.includes(priceId)
                          : selectedJoint2Prices.includes(priceId);

                        return (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (joint.id === 'joint-1') {
                                if (selectedJoint1Prices.includes(priceId)) {
                                  const newPrices = selectedJoint1Prices.filter(p => p !== priceId);
                                  setSelectedJoint1Prices(newPrices);
                                  if (newPrices.length === 0) {
                                    setSelectedPackages(selectedPackages.filter(p => p !== 'joint-1'));
                                  }
                                } else {
                                  // Only allow one price option at a time (mutually exclusive)
                                  setSelectedJoint1Prices([priceId]);
                                  if (!selectedPackages.includes('joint-1')) {
                                    setSelectedPackages([...selectedPackages, 'joint-1']);
                                  }
                                }
                              } else {
                                if (selectedJoint2Prices.includes(priceId)) {
                                  const newPrices = selectedJoint2Prices.filter(p => p !== priceId);
                                  setSelectedJoint2Prices(newPrices);
                                  if (newPrices.length === 0) {
                                    setSelectedPackages(selectedPackages.filter(p => p !== 'joint-2'));
                                  }
                                } else {
                                  // Only allow one price option at a time (mutually exclusive)
                                  setSelectedJoint2Prices([priceId]);
                                  if (!selectedPackages.includes('joint-2')) {
                                    setSelectedPackages([...selectedPackages, 'joint-2']);
                                  }
                                }
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                            }}>
                            <div style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              border: '1px solid #1D5287',
                              background: isSelected ? '#1D5287' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {isSelected && (
                                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                  <path d="M9.5 3L5 10L2.5 6.8182" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <div style={{
                              color: '#23262F',
                              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}>
                              {price}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Individual Treatments Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '21px',
                width: '100%',
              }}>
                {treatments.map((treatment) => (
                  <div
                    key={treatment.id}
                    onClick={() => togglePackage(treatment.id)}
                    style={{
                      display: 'flex',
                      height: '50px',
                      padding: '12px',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: '4px',
                      border: '1px solid #ABD28C',
                      background: '#E3F0D9',
                      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '1.5px solid #1D5287',
                        background: selectedPackages.includes(treatment.id) ? '#1D5287' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {selectedPackages.includes(treatment.id) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M9.5 3L5 10L2.5 6.8182" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div style={{
                        color: '#101111',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}>
                        {treatment.name}
                      </div>
                    </div>
                    <div style={{
                      color: '#23262F',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}>
                      {treatment.price}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rehab Package - Pre-selected */}
              <div
                onClick={() => togglePackage('rehab-package')}
                style={{
                  display: 'flex',
                  padding: '12px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  borderRadius: '4px',
                  border: '1px solid #ABD28C',
                  background: '#E3F0D9',
                  boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    {selectedPackages.includes('rehab-package') ? (
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="21" height="21" rx="10.5" fill="#1D5287"/>
                        <path d="M14.5 7L9 14L6.5 10.8182" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="21" height="21" rx="10.5" fill="none" stroke="#1D5287" strokeWidth="1.5"/>
                      </svg>
                    )}
                    <div style={{
                      color: '#101111',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                    }}>
                      Rehab Package for 1 Month
                    </div>
                  </div>
                  <div style={{
                    color: '#23262F',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                  }}>
                    ₹14000/-
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  width: '100%',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                }}>
                  <div style={{
                    display: 'flex',
                    width: '100%',
                    padding: '2.8px 10.8px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '9999px',
                    background: '#FFF',
                  }}>
                    <div style={{
                      color: '#1D5287',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '10px',
                      fontWeight: 400,
                      letterSpacing: '0.1px',
                    }}>
                      Laser/Shockwave/Manual Release/ Dry Needling Not Included
                    </div>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    gap: '8px',
                  }}>
                    <label style={{
                      color: '#101111',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      margin: 0,
                    }}>
                      Total Amount to be Paid
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <input
                        type="text"
                        value={editableAmount || `₹${calculateTotalAmount().toLocaleString('en-IN')}/-`}
                        onChange={(e) => setEditableAmount(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '4px',
                          border: '1px solid #D8DAEB',
                          background: '#FFF',
                          fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#1D5287',
                          outline: 'none',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0557A8';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D8DAEB';
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Save the final amount and open payment modal
                          setFinalAmount(editableAmount || `₹${calculateTotalAmount().toLocaleString('en-IN')}/-`);
                          setIsPackageModalOpen(false);
                          setIsPaymentModalOpen(true);
                        }}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'linear-gradient(180deg, #0557A8 0%, #1BB7E9 100%)',
                          fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#FFF',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Proceed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment QR Code Modal */}
      {isPaymentModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Backdrop */}
          <div
            onClick={() => setIsPaymentModalOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Modal Content */}
          <div
            style={{
              borderRadius: '10px',
              border: '1px solid #E4E5EB',
              background: '#FAFAFC',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '40px',
              zIndex: 51,
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                width: '30px',
                height: '30px',
              }}
            >
              ✕
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '30px',
            }}>
              {/* Title */}
              <div
                style={{
                  color: '#1D5287',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '28px',
                  fontWeight: 700,
                  lineHeight: 'normal',
                  margin: 0,
                }}
              >
                <span style={{ fontWeight: 400, color: '#0D0D0D' }}>Scan QR Code to </span>
                <span style={{ fontWeight: 700, color: '#1D5287' }}>Pay</span>
              </div>

              {/* QR Code Container */}
              <div style={{
                width: '300px',
                height: '300px',
                borderRadius: '10px',
                border: '2px solid #E4E5EB',
                background: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}>
                <svg
                  width="260"
                  height="260"
                  viewBox="0 0 260 260"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* QR Code Pattern - Placeholder */}
                  <rect width="260" height="260" fill="#FAFAFC" stroke="#1D5287" strokeWidth="2"/>
                  {/* Top-left corner */}
                  <rect x="10" y="10" width="50" height="50" fill="#1D5287"/>
                  <rect x="15" y="15" width="40" height="40" fill="#FAFAFC"/>
                  <rect x="20" y="20" width="30" height="30" fill="#1D5287"/>
                  {/* Top-right corner */}
                  <rect x="200" y="10" width="50" height="50" fill="#1D5287"/>
                  <rect x="205" y="15" width="40" height="40" fill="#FAFAFC"/>
                  <rect x="210" y="20" width="30" height="30" fill="#1D5287"/>
                  {/* Bottom-left corner */}
                  <rect x="10" y="200" width="50" height="50" fill="#1D5287"/>
                  <rect x="15" y="205" width="40" height="40" fill="#FAFAFC"/>
                  <rect x="20" y="210" width="30" height="30" fill="#1D5287"/>
                  {/* QR data pattern */}
                  <rect x="70" y="30" width="10" height="10" fill="#1D5287"/>
                  <rect x="85" y="30" width="10" height="10" fill="#1D5287"/>
                  <rect x="100" y="30" width="10" height="10" fill="#1D5287"/>
                  <rect x="115" y="30" width="10" height="10" fill="#1D5287"/>
                  <rect x="130" y="30" width="10" height="10" fill="#1D5287"/>
                  <rect x="70" y="50" width="10" height="10" fill="#1D5287"/>
                  <rect x="100" y="50" width="10" height="10" fill="#1D5287"/>
                  <rect x="130" y="50" width="10" height="10" fill="#1D5287"/>
                  <rect x="70" y="70" width="10" height="10" fill="#1D5287"/>
                  <rect x="85" y="70" width="10" height="10" fill="#1D5287"/>
                  <rect x="100" y="70" width="10" height="10" fill="#1D5287"/>
                  <rect x="130" y="70" width="10" height="10" fill="#1D5287"/>
                  {/* Additional pattern for realistic QR code look */}
                  <rect x="70" y="90" width="80" height="80" fill="none" stroke="#1D5287" strokeWidth="1" opacity="0.3"/>
                </svg>
              </div>

              {/* Amount Info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
              }}>
                <div style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#65758B',
                }}>
                  Amount to Pay
                </div>
                <div style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#1D5287',
                }}>
                  {finalAmount}
                </div>
              </div>

              {/* Instructions */}
              <div style={{
                padding: '15px',
                borderRadius: '8px',
                background: '#F0F8FF',
                border: '1px solid #D8DAEB',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1D5287',
                  lineHeight: '1.6',
                }}>
                  Use any UPI app to scan this QR code and complete your payment
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #21C45D 0%, #16A34A 100%)',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFF',
                  cursor: 'pointer',
                }}
              >
                Payment Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {isPrescriptionModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Backdrop */}
          <div
            onClick={() => setIsPrescriptionModalOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Modal Content */}
          <div
            style={{
              borderRadius: '10px',
              border: '1px solid #E4E5EB',
              background: '#FAFAFC',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '0',
              zIndex: 51,
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPrescriptionModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                width: '30px',
                height: '30px',
                color: '#344256',
                zIndex: 52,
              }}
            >
              ✕
            </button>

            {/* Prescription Cards Container */}
            <div style={{
              padding: '30px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              {/* Title */}
              <h2 style={{
                color: '#0D0D0D',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                margin: '0 0 10px 0',
              }}>
                Uploaded <span style={{ color: '#1D5287' }}>Prescriptions</span>
              </h2>

              {/* Dummy Prescription Card 1 */}
              <div style={{
                borderRadius: '10px',
                border: '1px solid #E4E5EB',
                background: '#FFF',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}>
                {/* Header with Logo and Dummy Badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '15px',
                }}>
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/c93f8aeef4212f434a06a6d43c7754a60ac0b1f6?width=412"
                    alt="PhysioPlanet Logo"
                    style={{
                      height: '40px',
                      width: 'auto',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    background: '#FFF3CD',
                    border: '1px solid #FFE69C',
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#856404',
                      fontWeight: 600,
                    }}>
                      ⚠️ Dummy Prescription
                    </span>
                  </div>
                </div>

                {/* Prescription Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#65758B',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Uploaded Date & Time
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0D0D0D',
                    }}>
                      Nov 15, 2025
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#65758B',
                      marginTop: '2px',
                    }}>
                      02:30 PM
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#65758B',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Doctor's Package
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1D5287',
                    }}>
                      Rehab Package
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#65758B',
                      marginTop: '2px',
                    }}>
                      For 1 Month
                    </div>
                  </div>
                </div>

                {/* Prescription Image Placeholder */}
                <div style={{
                  width: '100%',
                  height: '250px',
                  borderRadius: '6px',
                  border: '2px dashed #E4E5EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F9FAFB',
                  marginTop: '10px',
                }}>
                  <div style={{
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '8px',
                    }}>
                      📄
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      color: '#65758B',
                      fontWeight: 500,
                    }}>
                      Prescription Image
                    </div>
                  </div>
                </div>
              </div>

              {/* Dummy Prescription Card 2 */}
              <div style={{
                borderRadius: '10px',
                border: '1px solid #E4E5EB',
                background: '#FFF',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}>
                {/* Header with Logo and Dummy Badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '15px',
                }}>
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/c93f8aeef4212f434a06a6d43c7754a60ac0b1f6?width=412"
                    alt="PhysioPlanet Logo"
                    style={{
                      height: '40px',
                      width: 'auto',
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    background: '#FFF3CD',
                    border: '1px solid #FFE69C',
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#856404',
                      fontWeight: 600,
                    }}>
                      ⚠️ Dummy Prescription
                    </span>
                  </div>
                </div>

                {/* Prescription Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#65758B',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Uploaded Date & Time
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0D0D0D',
                    }}>
                      Nov 20, 2025
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#65758B',
                      marginTop: '2px',
                    }}>
                      10:15 AM
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#65758B',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Doctor's Package
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1D5287',
                    }}>
                      Advanced Therapy
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#65758B',
                      marginTop: '2px',
                    }}>
                      For 2 Months
                    </div>
                  </div>
                </div>

                {/* Prescription Image Placeholder */}
                <div style={{
                  width: '100%',
                  height: '250px',
                  borderRadius: '6px',
                  border: '2px dashed #E4E5EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F9FAFB',
                  marginTop: '10px',
                }}>
                  <div style={{
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '8px',
                    }}>
                      📄
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      color: '#65758B',
                      fontWeight: 500,
                    }}>
                      Prescription Image
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past Payment Modal */}
      {isPastPaymentModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Backdrop */}
          <div
            onClick={() => setIsPastPaymentModalOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Modal Content */}
          <div
            style={{
              borderRadius: '10px',
              border: '1px solid #E4E5EB',
              background: '#FAFAFC',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '29px 50px',
              zIndex: 51,
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPastPaymentModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                width: '30px',
                height: '30px',
                color: '#344256',
              }}
            >
              ✕
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              width: '100%',
            }}>
              {/* Title */}
              <h2 style={{
                color: '#1D5287',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: 700,
                lineHeight: 'normal',
                margin: 0,
              }}>
                <span style={{ fontWeight: 400, color: '#0D0D0D' }}>Record </span>
                <span style={{ fontWeight: 700, color: '#1D5287' }}>Payments</span>
              </h2>

              {/* Package Card */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
                width: '100%',
              }}>
                <div style={{
                  display: 'flex',
                  padding: '12px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  borderRadius: '4px',
                  border: '1px solid #ABD28C',
                  background: '#E3F0D9',
                  boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.02)',
                }}>
                  <div style={{
                    display: 'flex',
                    width: '100%',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    {/* Package Header */}
                    <div style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}>
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          <rect width="21" height="21" rx="10.5" fill="#1D5287"/>
                          <path d="M14.5 7L9 14L6.5 10.8182" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div style={{
                          color: '#101111',
                          fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: 'clamp(14px, 3vw, 16px)',
                          fontWeight: 500,
                          lineHeight: '24px',
                        }}>
                          Rehab Package for 1 Month
                        </div>
                      </div>
                      <div style={{
                        color: '#23262F',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: 'clamp(14px, 3vw, 16px)',
                        fontWeight: 500,
                        lineHeight: 'normal',
                      }}>
                        ₹14000/-
                      </div>
                    </div>

                    {/* Tags and Label */}
                    <div style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '14px',
                    }}>
                      <div style={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: '567px',
                        padding: '2.8px 10.8px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '9999px',
                        background: '#FFF',
                      }}>
                        <div style={{
                          color: '#1D5287',
                          textAlign: 'center',
                          fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: 'clamp(9px, 2vw, 10px)',
                          fontWeight: 400,
                          lineHeight: '16px',
                          letterSpacing: '0.1px',
                        }}>
                          Laser/Shockwave/Manual Release/ Dry Needling Not Included
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        color: '#101111',
                        textAlign: 'center',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '10px',
                        fontWeight: 500,
                        lineHeight: '24px',
                        letterSpacing: '0.4px',
                      }}>
                        ONE TIME PAYMENT
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Payment */}
              <div style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <div style={{
                  color: '#101111',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontWeight: 500,
                  lineHeight: '24px',
                }}>
                  Total Payment
                </div>
                <div style={{
                  color: '#23262F',
                  textAlign: 'right',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: 'clamp(16px, 3.5vw, 18px)',
                  fontWeight: 600,
                  lineHeight: 'normal',
                }}>
                  ₹14000/-
                </div>
              </div>

              {/* Payment Now Button */}
              <button
                style={{
                  display: 'flex',
                  width: '100%',
                  padding: '14px 20px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #75B640 0%, #52813C 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: '51px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                }}>
                  <div style={{
                    color: '#FFF',
                    textAlign: 'center',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: 'clamp(14px, 3vw, 16px)',
                    fontWeight: 600,
                    lineHeight: 'normal',
                    textTransform: 'capitalize',
                  }}>
                    pAYMENT nOW
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
