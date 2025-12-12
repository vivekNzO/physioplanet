'use client';

import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AppointmentCheck() {
  const [selectedOption, setSelectedOption] = useState<'appointment' | 'walkin' | null>(null);
  const navigate = useNavigate();
  const {state} = useLocation()


  const handleYesAppointment = () => {
      navigate('/welcome-page', { state: { ...state} });
  };

  const handleWalkIn = () => {
    // Navigate to walk-in check-in (mobile entry)
    navigate('/verification-success', { state: { ...state, type: 'walk-in' } });
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'url("/bg-2.jpg") center center / cover no-repeat',
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
        {/* Back Button */}
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
            // padding: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '100px',
            border: '1px solid #E9EAEB',
            background: '#F8F8F8',
          }}>
            {/* <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.408 5.92548C11.7253 6.24278 11.7253 6.75722 11.408 7.07452L6.29504 12.1875H21.6668C22.1156 12.1875 22.4793 12.5513 22.4793 13C22.4793 13.4487 22.1156 13.8125 21.6668 13.8125H6.29504L11.408 18.9255C11.7253 19.2428 11.7253 19.7572 11.408 20.0745C11.0907 20.3918 10.5763 20.3918 10.259 20.0745L3.75897 13.5745C3.44167 13.2572 3.44167 12.7428 3.75897 12.4255L10.259 5.92548C10.5763 5.60817 11.0907 5.60817 11.408 5.92548Z" fill="black"/>
            </svg> */}
            <ArrowLeft width={26} height={26}/>
          </div>
          <div style={{
            color: '#0D0D0D',
            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
          }}>
            Back
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          width: '100%',
          padding: '51px 52px',
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
                fontSize: '32px',
                fontWeight: 700,
                lineHeight: '1',
                margin: 0,
              }}>
                <span style={{fontWeight: 400, color: '#0D0D0D'}}>Appointment </span>
                <span style={{fontWeight: 700, color: '#1D5287'}}>Check</span>
              </h1>
              <p style={{
                color: '#0D0D0D',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                margin: 0,
              }}>
                Do you have an appointment with us?
              </p>
            </div>


            {/* Form Section */}
            
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '20px',
            }}>
              
            {/* Customer badge */}

            {state?.fullName && (
              <div className='bg-white border border-[#E9EAEB] text-left w-full pl-[14px] py-[20.5px]'>
                <p className='font-semibold text-sm mb-1 leading-none'>{state.fullName}</p>
                <p className='text-sm text-[#65758B] leading-none'>{state?.mobileNumber}</p>
              </div>
            )}
              {/* Yes Button */}
              <button
                onClick={handleYesAppointment}
                style={{
                  width: '100%',
                  height: '51px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #75B640 0%, #52813C 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                <span style={{
                  color: '#FFF',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}>
                  Yes, I have an appointment
                </span>
              </button>

              {/* Walk-in Button */}
              <button
                onClick={handleWalkIn}
                style={{
                  width: '100%',
                  height: '51px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '4px',
                  border: '1px solid #74B540',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                <span style={{
                  color: '#52813C',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}>
                  No, I'm a walk-in
                </span>
              </button>

              {/* Note Box */}
              <div style={{
                width: '100%',
                padding: '14.5px 15.5px',
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
                  lineHeight: '1.5',
                }}>
                  📌 Note: If you have an appointment, you'll need to verify using the OTP sent to your registered mobile number.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
