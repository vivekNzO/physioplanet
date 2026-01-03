import { Button } from '@/components/ui/button';
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axiosInstance from '@/lib/axios';

function WelcomePage() {
  const navigate = useNavigate();
  const {state} = useLocation()
  const mobileNumber = state?.mobileNumber as string | undefined;
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const fallbackPhoto = '/placeholderImage.png';

  useEffect(() => {
    let active = true;
    const fetchPhoto = async () => {
      if (!mobileNumber) {
        setPhotoUrl(fallbackPhoto);
        return;
      }
      try {
        setLoadingPhoto(true);
        const res = await axiosInstance.get('/customers/public', {
          params: { phone: mobileNumber },
        });
        const customer = res?.data?.[0];
        
        // Use photoUrl from database (file path)
        if (customer?.photoUrl) {
          // Construct full URL - with /api prefix
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          const fullPhotoUrl = `${apiBase}/api${customer.photoUrl}`;
          if (active) setPhotoUrl(fullPhotoUrl);
        } else if (active) {
          setPhotoUrl(fallbackPhoto);
        }
      } catch (err) {
        if (active) setPhotoUrl(fallbackPhoto);
      } finally {
        if (active) setLoadingPhoto(false);
      }
    };
    fetchPhoto();
    return () => { active = false; };
  }, [mobileNumber]);

  const fullName = state?.fullName || 'Customer';
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
        maxWidth:'calc(100% - 252px)',
        width:'100%',
        margin:'0 auto',
      }}>
      <div style={{
        width: '100%',
        maxWidth: '588px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '18px',
      }}>
        {/* Main Card */}
        <div style={{
          width: '100%',
          padding: '60.5px 80.5px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          border: '1px solid #E4E5EB',
          background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
        }}
        className='flex flex-col gap-10'>
          <div>
            <img
              src={photoUrl || fallbackPhoto}
              alt='profile'
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                objectFit: 'cover',
                border: '2px solid #E4E5EB',
              }}
            />
          </div>
          <div>
            <h1 className='text-[32px] text-center mb-[20px]' style={{lineHeight:"130%"}}>Welcome ,<br/><span className='font-bold text-[#1D5287]'>{fullName}</span></h1>
            <p className='text-center text-sm max-w-[420px]'>Welcome , {fullName} - this is your personalized Physiotherapy Dashboard, designed to help you track your recovery, manage sessions, and stay motivated on your wellness journey.</p>
          </div>
          <div className='w-full flex flex-col gap-4'>
              <button
                // onClick={handleYesAppointment}
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
              <button
                // onClick={handleYesAppointment}
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
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage