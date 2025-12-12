'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  // const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const navigate = useNavigate();

  // const handleContinue = () => {
  //   if (selectedBox === 0) {
  //     // Customer/Staff flow → Appointment Check
  //     navigate('/appointment-check');
  //   } else if (selectedBox === 1) {
  //     // Book Appointment flow
  //     navigate('/check-in', { state: { flowType: 'appointment' } });
  //   } else if (selectedBox === 2) {
  //     // Services flow (to be implemented later)
  //     console.log('Services flow - to be implemented');
  //   }
  // };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      background: 'url("/bg-1.jpg") center/cover no-repeat fixed',
    }}>
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '780px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '50px',
      }}>
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/435986e1ad6235e7d271e91178b87b2f2a53f084?width=576" 
          alt="PhysioPlanet"
          style={{
            width: '100%',
            maxWidth: '288px',
            height: 'auto',
          }}
        />

        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}>
          <h1 style={{
            fontSize: '46px',
            lineHeight: 1.2,
            fontWeight: 700,
            textAlign: 'center',
          }} className='uppercase'>
            <span style={{fontWeight: 400, color: '#1a1a1a'}}>Welcome to </span>
            <span style={{fontWeight: 700, color: '#1D5287'}}>PhysioPlanet</span>
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#0D0D0D',
            textAlign: 'center',
            fontWeight: 400,
          }}>
            Advanced Physiotherapy &amp; Sports Injury Clinic
          </p>
        </div>

        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '30px',
        }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '34.5px 29.5px',
              gap: '15px',
              borderRadius: '4px',
              border: '1px solid #E4E5EB',
              background:'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
              minHeight: '178px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <g clipPath="url(#clip0)">
                <path d="M22.808 19.8456C21.8279 18.878 20.6043 18.878 19.6305 19.8456C18.8876 20.5823 18.1447 21.3189 17.4143 22.068C17.2146 22.274 17.046 22.3177 16.8025 22.1804C16.3218 21.9182 15.8099 21.7059 15.348 21.4188C13.1942 20.0641 11.3901 18.3224 9.79196 16.3622C8.99913 15.3883 8.29371 14.3458 7.80053 13.1722C7.70065 12.9349 7.71938 12.7789 7.9129 12.5853C8.65578 11.8674 9.37994 11.1308 10.1103 10.3941C11.1279 9.37034 11.1279 8.17173 10.1041 7.14169C9.52352 6.55487 8.94295 5.98054 8.36238 5.39373C7.76308 4.79442 7.17002 4.18888 6.56447 3.59582C5.58437 2.64069 4.3608 2.64069 3.38693 3.60207C2.63781 4.33871 1.91989 5.09407 1.15828 5.81823C0.452855 6.4862 0.0970199 7.304 0.0221072 8.25913C-0.0965044 9.81357 0.284301 11.2806 0.821175 12.7102C1.91989 15.6692 3.59294 18.2974 5.62182 20.7071C8.36238 23.9658 11.6336 26.5441 15.4603 28.4044C17.1833 29.2409 18.9688 29.8839 20.9102 29.99C22.2462 30.0649 23.4073 29.7278 24.3375 28.6853C24.9742 27.9736 25.6922 27.3244 26.3664 26.6439C27.3652 25.6326 27.3714 24.409 26.3789 23.4102C25.1927 22.2178 24.0004 21.0317 22.808 19.8456Z" fill="url(#paint0_linear)"/>
                <path d="M21.6156 14.8701L23.9192 14.4768C23.5571 12.3606 22.5583 10.444 21.0413 8.92081C19.4369 7.31644 17.4081 6.30512 15.1732 5.99298L14.8485 8.30903C16.5778 8.5525 18.1509 9.33283 19.3932 10.5751C20.5669 11.7488 21.3347 13.2345 21.6156 14.8701Z" fill="url(#paint1_linear)"/>
                <path d="M25.2177 4.85683C22.5583 2.19744 19.1935 0.518146 15.4791 0L15.1544 2.31605C18.3632 2.76552 21.2723 4.22008 23.5696 6.51115C25.7483 8.68986 27.1779 11.4429 27.6961 14.4706L29.9996 14.0773C29.3941 10.5689 27.7398 7.38513 25.2177 4.85683Z" fill="url(#paint2_linear)"/>
              </g>
              <defs>
                <linearGradient id="paint0_linear" x1="13.5599" y1="2.88025" x2="13.5599" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0558A5"/><stop offset="1" stopColor="#20B9EE"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="19.3839" y1="5.99298" x2="19.3839" y2="14.8701" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0558A5"/><stop offset="1" stopColor="#20B9EE"/>
                </linearGradient>
                <linearGradient id="paint2_linear" x1="22.577" y1="0" x2="22.577" y2="14.4706" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0558A5"/><stop offset="1" stopColor="#20B9EE"/>
                </linearGradient>
                <clipPath id="clip0"><rect width="30" height="30" fill="white"/></clipPath>
              </defs>
            </svg>
            <h3 style={{fontSize: '18px',lineHeight:'100%', fontWeight: 500, color: '#0D0D0D', textAlign: 'center'}}>Quick Check-In</h3>
            <p style={{fontSize: '14px',lineHeight:'1.2', fontWeight: 400, color: '#0D0D0D', textAlign: 'center'}}>Register with your mobile number in seconds</p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '34.5px 29.5px',
              gap: '15px',
              borderRadius: '4px',
              border: '1px solid #E4E5EB',
              background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
              minHeight: '178px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 0C12.0333 0 9.13319 0.879734 6.66645 2.52796C4.19971 4.17618 2.27713 6.51886 1.14181 9.25975C0.00649929 12.0006 -0.290551 15.0166 0.288227 17.9264C0.867006 20.8361 2.29562 23.5088 4.3934 25.6066C6.49119 27.7044 9.16393 29.133 12.0736 29.7118C14.9834 30.2906 17.9994 29.9935 20.7403 28.8582C23.4811 27.7229 25.8238 25.8003 27.472 23.3335C29.1203 20.8668 30 17.9667 30 15C29.9953 11.0232 28.4134 7.21061 25.6014 4.39858C22.7894 1.58655 18.9768 0.00469155 15 0ZM20.055 20.055C19.7993 20.3106 19.4525 20.4543 19.0909 20.4543C18.7293 20.4543 18.3825 20.3106 18.1268 20.055L14.0359 15.9641C13.7802 15.7084 13.6364 15.3616 13.6364 15V6.81818C13.6364 6.45652 13.78 6.10968 14.0358 5.85394C14.2915 5.59821 14.6383 5.45454 15 5.45454C15.3617 5.45454 15.7085 5.59821 15.9642 5.85394C16.22 6.10968 16.3636 6.45652 16.3636 6.81818V14.4355L20.055 18.1268C20.3106 18.3825 20.4543 18.7293 20.4543 19.0909C20.4543 19.4525 20.3106 19.7993 20.055 20.055Z" fill="url(#paint3_linear)"/>
              <defs>
                <linearGradient id="paint3_linear" x1="15" y1="0" x2="15" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0557A8"/><stop offset="1" stopColor="#1BB7E9"/>
                </linearGradient>
              </defs>
            </svg>
            <h3 style={{fontSize: '18px',lineHeight:'100%', fontWeight: 500, color:  '#0D0D0D', textAlign: 'center'}}>Real Time Tracking </h3>
            <p style={{fontSize: '14px',lineHeight:'1.2', fontWeight: 400, color: '#0D0D0D', textAlign: 'center'}}>Monitor your queue position and wait time</p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '34.5px 29.5px',
              gap: '15px',
              borderRadius: '4px',
              border: '1px solid #E4E5EB',
              background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
              minHeight: '178px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '-0.3px',
            }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <g clipPath="url(#clip1)">
                <path d="M15.3125 2.5H13.9375C13.525 1.0625 12.2 0 10.625 0C9.05 0 7.725 1.0625 7.3125 2.5H5.9375C5.425 2.5 5 2.925 5 3.4375V5.3125C5 6.5125 5.9875 7.5 7.1875 7.5H14.0625C15.2625 7.5 16.25 6.5125 16.25 5.3125V3.4375C16.25 2.925 15.825 2.5 15.3125 2.5Z" fill="url(#paint4_linear)"/>
                <path d="M17.8125 3.75H17.5V5.3125C17.5 7.2125 15.9625 8.75 14.0625 8.75H7.1875C5.2875 8.75 3.75 7.2125 3.75 5.3125V3.75H3.4375C1.5375 3.75 0 5.2875 0 7.1875V22.8125C0 24.7125 1.5375 26.25 3.4375 26.25H12.6625L12.9375 24.7125C13.0625 24.0125 13.3875 23.3875 13.8875 22.875L14.8875 21.875H4.6875C4.175 21.875 3.75 21.45 3.75 20.9375C3.75 20.425 4.175 20 4.6875 20H16.5625C16.625 20 16.675 20 16.7375 20.025H16.75L21.25 15.525V7.1875C21.25 5.2875 19.7125 3.75 17.8125 3.75ZM16.5625 17.8125H4.6875C4.175 17.8125 3.75 17.3875 3.75 16.875C3.75 16.3625 4.175 15.9375 4.6875 15.9375H16.5625C17.075 15.9375 17.5 16.3625 17.5 16.875C17.5 17.3875 17.075 17.8125 16.5625 17.8125ZM16.5625 13.75H4.6875C4.175 13.75 3.75 13.325 3.75 12.8125C3.75 12.3 4.175 11.875 4.6875 11.875H16.5625C17.075 11.875 17.5 12.3 17.5 12.8125C17.5 13.325 17.075 13.75 16.5625 13.75Z" fill="url(#paint5_linear)"/>
                <path d="M15.6588 30C15.4125 30 15.1725 29.9025 14.9963 29.725C14.78 29.5087 14.6825 29.2012 14.7363 28.8987L15.3988 25.1425C15.4313 24.9537 15.5238 24.7787 15.6588 24.6425L24.94 15.3625C26.08 14.22 27.2 14.5287 27.8125 15.1412L29.3588 16.6875C30.2125 17.54 30.2125 18.9275 29.3588 19.7812L20.0775 29.0625C19.9425 29.1987 19.7675 29.29 19.5775 29.3225L15.8213 29.985C15.7675 29.995 15.7125 30 15.6588 30Z" fill="url(#paint6_linear)"/>
              </g>
              <defs>
                <linearGradient id="paint4_linear" x1="10.625" y1="0" x2="10.625" y2="7.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0658A1"/><stop offset="1" stopColor="#24BAF4"/>
                </linearGradient>
                <linearGradient id="paint5_linear" x1="10.625" y1="3.75" x2="10.625" y2="26.25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0658A1"/><stop offset="1" stopColor="#24BAF4"/>
                </linearGradient>
                <linearGradient id="paint6_linear" x1="22.3604" y1="14.5933" x2="22.3604" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0658A1"/><stop offset="1" stopColor="#24BAF4"/>
                </linearGradient>
                <clipPath id="clip1"><rect width="30" height="30" fill="white"/></clipPath>
              </defs>
            </svg>
            <h3 style={{fontSize: '18px',lineHeight:'100%', fontWeight: 500, color: '#0D0D0D', textAlign: 'center'}}>Digital Records</h3>
            <p style={{fontSize: '14px', lineHeight:'1.2', fontWeight: 400, color: '#0D0D0D', textAlign: 'center'}}>Access your complete treatment history instantly</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/check-in', { state: { flowType: 'appointment' } })}
          style={{
            width: '230px',
            height: '54px',
            borderRadius: '4px',
            background:'linear-gradient(90deg, #75B640 0%, #52813C 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}>
          <span style={{color: 'white', fontSize: '18px', fontWeight: 600}}>Start Check-In</span>
        </button>
      </div>
    </div>
  );
}
