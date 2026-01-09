import { Button } from '@/components/ui/button';
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axiosInstance from '@/lib/axios';
import Navbar from '@/components/NavBar';

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
        const res = await axiosInstance.get('/customers', {
          params: { phone: mobileNumber, limit: 1 },
        });
        const customer = res?.data?.data?.[0];
        if (customer?.photoUrl) {
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
      background: 'url("/bg-2.jpg") center center / cover no-repeat',
    }}>
      <Navbar/>
    <div className="max-w-[calc(100%-252px)] max-[1023px]:max-w-full w-full mx-auto">
      <div className="w-full max-w-[588px] max-[1023px]:max-w-full flex flex-col items-start gap-[18px] max-[1023px]:gap-3 mt-[60px] max-[1023px]:mt-8 px-4 max-[1023px]:px-3">
        {/* Main Card */}
        <div className="w-full py-[60.5px] max-[1023px]:py-8 px-[80.5px] max-[1023px]:px-6 flex items-center rounded-[10px] border border-[#E4E5EB] bg-[linear-gradient(135deg,#FAFAFC_0%,rgba(250,250,252,0.7)_100%)] flex flex-col gap-10 max-[1023px]:gap-6">
          <div>
            <img
              src={photoUrl || fallbackPhoto}
              alt='profile'
              className="w-[120px] h-[120px] max-[1023px]:w-[100px] max-[1023px]:h-[100px] rounded-[60px] max-[1023px]:rounded-[50px] object-cover border-2 border-[#E4E5EB]"
            />
          </div>
          <div>
            <h1 className='text-[32px] max-[1023px]:text-2xl text-center mb-[20px] max-[1023px]:mb-4' style={{lineHeight:"130%"}}>Welcome back,<br/><span className='font-bold text-[#1D5287]'>{fullName}</span></h1>
            <p className='text-center text-sm max-[1023px]:text-xs max-w-[420px] max-[1023px]:max-w-full'>Welcome back, {fullName} - this is your personalized Physiotherapy Dashboard, designed to help you track your recovery, manage sessions, and stay motivated on your wellness journey.</p>
          </div>
          <div className='w-full flex flex-col gap-4 max-[1023px]:gap-3'>
              <button
                className="w-full h-[51px] max-[1023px]:h-[44px] px-[14px] max-[1023px]:px-3 flex justify-center items-center rounded-[4px] bg-[linear-gradient(90deg,#75B640_0%,#52813C_100%)] border-none cursor-pointer transition-all duration-300"
                style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                }}>
                <span className="text-white text-center text-base max-[1023px]:text-sm font-semibold capitalize">
                  Yes, I have an appointment
                </span>
              </button>
              <button
                className="w-full h-[51px] max-[1023px]:h-[44px] px-[14px] max-[1023px]:px-3 flex justify-center items-center rounded-[4px] border border-[#E9EAEB] bg-white cursor-pointer transition-all duration-300"
                style={{
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                }}>
                <span className="text-[#52813C] text-center text-base max-[1023px]:text-sm font-semibold capitalize">
                  No, I am a walk-in
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