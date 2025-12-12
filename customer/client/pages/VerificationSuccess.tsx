'use client';

import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerificationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleContinue = () => {
    // Navigate to check-in or next step
    navigate('/welcome-page', { state: { ...location.state } });
  };

  const {state} = useLocation()

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

        {/* Main Card */}
        <div style={{
          width: '100%',
          padding: '124.5px 43px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '10px',
          border: '1px solid #E4E5EB',
          background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
        }}>
        <div style={{
          width: '100%',
          maxWidth: '363px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Header Section */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '50px',
          }}>
            <h1 style={{
              color: '#1D5287',
              textAlign: 'center',
              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: 'normal',
              margin: 0,
              minWidth:'369px'
            }}>
              <span style={{fontWeight: 400, color: '#0D0D0D'}}>Verification </span>
              <span style={{fontWeight: 700, color: '#1D5287'}}>Successful</span>
            </h1>
            <p style={{
              color: '#0D0D0D',
              textAlign: 'center',
              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              margin: 0,
            }}>
              Welcome! You're registered.
            </p>
          </div>

          {/* Customer badge */}
          {state?.fullName && (
            <div className='bg-white border border-[#E9EAEB] text-left w-full pl-[20px] py-[20px] flex flex-col gap-[9px] mb-[20px]'>
              <p className='text-[12px] text-[#65758B]   leading-none'><span className=' text-[#0D0D0D] font-semibold text-sm'>Patient: </span>{state.fullName}</p>
              <p className='text-[12px]  text-[#65758B] leading-none'><span className='text-[#0D0D0D] font-semibold text-sm'>Phone: </span>{state?.mobileNumber}</p>
              <p className='text-[12px]  text-[#65758B] leading-none'><span className='text-[#0D0D0D] font-semibold text-sm'>Type: </span>{state?.type}</p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              height: '51px',
              padding: '14px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '7px',
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
              Continue
            </span>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M0.781372 7.41249C0.834565 7.42112 0.888397 7.4251 0.942258 7.4244L10.1135 7.42441L9.91352 7.51742C9.71804 7.60994 9.54021 7.73586 9.38799 7.88948L6.81614 10.4613C6.47742 10.7847 6.42051 11.3048 6.68127 11.6938C6.98476 12.1082 7.56677 12.1982 7.98126 11.8947C8.01475 11.8702 8.04657 11.8435 8.07648 11.8147L12.7272 7.16396C13.0907 6.80092 13.091 6.21199 12.7279 5.84854C12.7277 5.84831 12.7274 5.84805 12.7272 5.84781L8.07649 1.1971C7.71274 0.83437 7.12382 0.835184 6.76106 1.19893C6.73252 1.22756 6.70586 1.25802 6.68127 1.29011C6.42051 1.67906 6.47742 2.19921 6.81614 2.52255L9.38334 5.09905C9.51981 5.23566 9.67671 5.35021 9.84841 5.43855L10.1275 5.56412L0.993445 5.56412C0.518286 5.54647 0.101408 5.87839 0.0121436 6.34544C-0.070087 6.85251 0.274299 7.33023 0.781372 7.41249Z" fill="white"/>
            </svg>
          </button>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
}
