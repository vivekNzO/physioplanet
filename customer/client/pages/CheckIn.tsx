'use client';

import { url } from 'inspector';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Loader } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';

export default function CheckIn() {
  const { tenantId } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const flowType = location.state?.flowType || 'customer';

  // Debounce phone input
  const normalizedPhone = useMemo(() => mobileNumber.replace(/\D/g, ''), [mobileNumber]);

  const handleContinue = async () => {
    if (mobileNumber.length !== 10) return;

    try {
      setLoading(true);
      setError(null);

      if (!tenantId) {
        setError('Tenant ID is required');
        setLoading(false);
        return;
      }

      // Check if customer exists
      const res = await axiosInstance.get('/customers/public', {
        params: { phone: mobileNumber },
        headers: { 'x-tenant-id': tenantId },
      });

      const data = res?.data ?? [];
      const customerExists = data.length > 0;

      // Send WhatsApp OTP
      await axiosInstance.post('/twilio/send-otp', { phone: mobileNumber }, {
        headers: { 'x-tenant-id': tenantId },
      });

      if (customerExists) {
        const customer = data[0];
        const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Unknown';
        // Customer exists - navigate to verify OTP then appointment-check
        navigate('/verify-otp', {
          state: {
            mobileNumber: customer.phone || mobileNumber,
            customerExists: true,
            fullName: fullName,
            customerId: customer.id,
          },
        });
      } else {
        // New customer - navigate to verify OTP then new-customer-registration
        navigate('/verify-otp', {
          state: {
            mobileNumber: mobileNumber,
            customerExists: false,
          },
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to check customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      // justifyContent: 'center',
      background: "url('/bg-2.jpg') center center / cover no-repeat",
    }}>

      <div style={{
        maxWidth:'calc(100% - 612px)',
        width:'100%',
        margin:'0 auto',
      }}>

      <div style={{
        width: '100%',
        maxWidth: '449px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '18px',
      }}>
        {/* Back to Welcome Button */}
        <div 
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
          }}>
          <div style={{
            display: 'flex',
            width: '42px',
            height: '42px',
            padding: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '100px',
            border: '1px solid #E9EAEB',
            background: '#F8F8F8',
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.4079 5.92548C11.7252 6.24278 11.7252 6.75722 11.4079 7.07452L6.29492 12.1875H21.6667C22.1154 12.1875 22.4792 12.5513 22.4792 13C22.4792 13.4487 22.1154 13.8125 21.6667 13.8125H6.29492L11.4079 18.9255C11.7252 19.2428 11.7252 19.7572 11.4079 20.0745C11.0906 20.3918 10.5762 20.3918 10.2588 20.0745L3.75885 13.5745C3.44155 13.2572 3.44155 12.7428 3.75885 12.4255L10.2588 5.92548C10.5762 5.60817 11.0906 5.60817 11.4079 5.92548Z" fill="black"/>
            </svg>
          </div>
          <div style={{
            color: '#0D0D0D',
            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
          }}>
            Back to Welcome
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          width: '100%',
          padding: '80px 52px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          border: '1px solid #E4E5EB',
          background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
        }}>
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '50px',
          }}>
            {/* Header Section */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}>
              <h1 style={{
                color: '#1D5287',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '36px',
                fontWeight: 700,
                lineHeight: '100%',
                margin: 0,
              }}>
                <span style={{fontWeight: 400, color: '#0D0D0D'}}>General </span>
                <span style={{fontWeight: 700, color: '#1D5287'}}>Check-In</span>
              </h1>
              <p style={{
                color: '#0D0D0D',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                margin: 0,
              }}>
                Enter your mobile number to get started
              </p>
            </div>

            {/* Form Section */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '25px',
            }}>
              {/* Mobile Number Input */}
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '10px',
                position: 'relative',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <g clipPath="url(#clip0_236_169)">
                      <path d="M16.8947 12.7091C16.8649 12.6844 13.4921 10.2847 12.5814 10.4316C12.1421 10.5092 11.8913 10.809 11.3878 11.4086C11.3068 11.5054 11.1116 11.7366 10.9609 11.9014C10.6427 11.7977 10.3323 11.6714 10.0322 11.5234C8.48279 10.7691 7.23093 9.51721 6.47662 7.96781C6.32861 7.66767 6.20229 7.35732 6.09863 7.03912C6.264 6.88781 6.49575 6.69263 6.59475 6.60938C7.19156 6.10875 7.49081 5.85731 7.56844 5.41744C7.72762 4.50675 5.31563 1.13512 5.29087 1.10475C5.18103 0.948969 5.03797 0.81952 4.87202 0.725747C4.70607 0.631974 4.52137 0.576217 4.33125 0.5625C3.35362 0.5625 0.5625 4.18275 0.5625 4.79306C0.5625 4.8285 0.613688 8.43075 5.05575 12.9493C9.56925 17.3863 13.1715 17.4375 13.2069 17.4375C13.8167 17.4375 17.4375 14.6464 17.4375 13.6687C17.4236 13.4786 17.3678 13.2939 17.2739 13.128C17.18 12.962 17.0505 12.819 16.8947 12.7091ZM13.1445 16.3091C12.6562 16.2675 9.63 15.8687 5.85 12.1556C2.11894 8.35706 1.73025 5.32575 1.69144 4.85606C2.42875 3.6988 3.3192 2.64657 4.33856 1.728C4.36106 1.7505 4.39088 1.78425 4.42913 1.82812C5.2109 2.89532 5.88436 4.03778 6.4395 5.23856C6.25897 5.42018 6.06816 5.59127 5.868 5.751C5.55761 5.9875 5.27258 6.25556 5.0175 6.55087C4.97434 6.61143 4.94361 6.67995 4.9271 6.75246C4.91059 6.82497 4.90862 6.90004 4.92131 6.97331C5.04035 7.48897 5.22267 7.98794 5.46412 8.45888C6.32919 10.2353 7.76462 11.6705 9.54113 12.5353C10.012 12.7771 10.511 12.9596 11.0267 13.0787C11.1 13.0917 11.1751 13.0898 11.2476 13.0733C11.3202 13.0568 11.3887 13.0259 11.4491 12.9825C11.7455 12.7264 12.0145 12.4402 12.2518 12.1286C12.4284 11.9183 12.6641 11.6376 12.7536 11.5583C13.9574 12.1129 15.1024 12.7871 16.1713 13.5709C16.218 13.6102 16.2512 13.6406 16.2731 13.6603C15.3545 14.68 14.3021 15.5707 13.1445 16.308V16.3091Z" fill="#1D5287"/>
                      <path d="M12.9375 8.4375H14.0625C14.0612 7.24444 13.5866 6.10062 12.743 5.257C11.8994 4.41338 10.7556 3.93884 9.5625 3.9375V5.0625C10.4573 5.06339 11.3153 5.41926 11.948 6.052C12.5807 6.68474 12.9366 7.54267 12.9375 8.4375Z" fill="#1D5287"/>
                      <path d="M15.75 8.4375H16.875C16.8728 6.49879 16.1016 4.64012 14.7308 3.26925C13.3599 1.89837 11.5012 1.12723 9.5625 1.125V2.25C11.2029 2.25194 12.7756 2.90445 13.9356 4.06441C15.0955 5.22438 15.7481 6.79707 15.75 8.4375Z" fill="#1D5287"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_236_169">
                        <rect width="18" height="18" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <div style={{
                    color: '#0D0D0D',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight:1
                  }}>
                    Mobile Number (India)
                  </div>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  style={{
                    width: '100%',
                    height: '51px',
                    padding: '0 17px',
                    borderRadius: '4px',
                    border: '1px solid #E9EAEB',
                    background: '#FFF',
                    color: '#0D0D0D',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    outline: 'none',
                  }}
                />
                {error && (
                  <div className='text-sm text-red-600'>{error}</div>
                )}
              </div>

              {/* Tip Box */}
              <div style={{
                width: '100%',
                padding: '20px 15.5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '4px',
                border: '0.5px solid #C0EDFC',
                background: '#E3F6FC',
              }}>
                <p style={{
                  color: '#0D0D0D',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  margin: 0,
                  lineHeight: '1.4',
                }}>
                  <span style={{fontSize: '16px'}}>💡</span> Tip: If you're a new Customer, you'll need to provide some basic information after this step.
                </p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={mobileNumber.length !== 10 || loading}
                style={{
                  width: '100%',
                  height: '51px',
                  padding: '14px 116px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '7px',
                  borderRadius: '4px',
                  background: mobileNumber.length === 10 
                    ? 'linear-gradient(90deg, #75B640 0%, #52813C 100%)'
                    : 'linear-gradient(90deg, #a0a0a0 0%, #808080 100%)',
                  border: 'none',
                  cursor: mobileNumber.length === 10 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                }}>
                {loading ? (
                  <span className='flex items-center justify-center'><Loader className='animate-spin'/></span>
                )
                :
                (
                  <>
                <span style={{
                  color: '#FFF',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}>
                  Continue
                </span>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <g clipPath="url(#clip0_236_183)">
                    <path d="M0.781372 7.41249C0.834565 7.42112 0.888397 7.4251 0.942258 7.4244L10.1135 7.42441L9.91352 7.51742C9.71804 7.60994 9.54021 7.73586 9.38799 7.88948L6.81614 10.4613C6.47742 10.7847 6.42051 11.3048 6.68127 11.6938C6.98476 12.1082 7.56677 12.1982 7.98126 11.8947C8.01475 11.8702 8.04657 11.8435 8.07648 11.8147L12.7272 7.16396C13.0907 6.80092 13.091 6.21199 12.7279 5.84854C12.7277 5.84831 12.7274 5.84805 12.7272 5.84781L8.07649 1.1971C7.71274 0.83437 7.12382 0.835184 6.76106 1.19893C6.73252 1.22756 6.70586 1.25802 6.68127 1.29011C6.42051 1.67906 6.47742 2.19921 6.81614 2.52255L9.38334 5.09905C9.51981 5.23566 9.67671 5.35021 9.84841 5.43855L10.1275 5.56412L0.993445 5.56412C0.518286 5.54647 0.101408 5.87839 0.0121436 6.34544C-0.070087 6.85251 0.274299 7.33023 0.781372 7.41249Z" fill="white"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_236_183">
                      <rect width="13" height="13" fill="white" transform="translate(13 13) rotate(-180)"/>
                    </clipPath>
                  </defs>
                </svg>
                </>
              )
              }
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
