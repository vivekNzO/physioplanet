'use client';

import { useNavigate } from 'react-router-dom';

export default function WhatsAppConfirmation() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '14px',
      paddingBottom: '40px',
      paddingLeft: '20px',
      paddingRight: '20px',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '63px',
        marginBottom: '40px',
      }}>
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/c93f8aeef4212f434a06a6d43c7754a60ac0b1f6?width=412"
          alt="PhysioPlanet Logo"
          style={{
            width: '206px',
            height: '63px',
            maxWidth: '100%',
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        position: 'relative',
      }}>
        {/* Phone Mockup Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '570px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Phone Image */}
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/38efcc92aed53648844db4c208959797d8e0332b?width=1140"
            alt="WhatsApp Message Preview"
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '570px',
              objectFit: 'contain',
            }}
          />

          {/* WhatsApp Icon */}
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '61px',
            height: '61px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/bc35446f167e59800943d4e798e267771d3c930c?width=122"
              alt="WhatsApp"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* Success Message */}
        <div style={{
          marginTop: '40px',
          width: '100%',
          maxWidth: '600px',
          padding: '30px',
          borderRadius: '10px',
          border: '1px solid #E4E5EB',
          background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.9) 100%)',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            color: '#1D5287',
            margin: '0 0 15px 0',
          }}>
            Appointment Confirmed!
          </h2>
          <p style={{
            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: '#0D0D0D',
            margin: '0 0 25px 0',
            lineHeight: '1.6',
          }}>
            Thank you for booking your appointment at <strong>PhysioPlanet</strong>. You will receive a confirmation message on WhatsApp shortly with all the details.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '30px',
          }}>
            <button
              onClick={() => navigate('/')}
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
              }}>
                Back to Home
              </span>
            </button>

            <button
              onClick={() => navigate('/check-in', { state: { flowType: 'appointment' } })}
              style={{
                width: '100%',
                height: '51px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '7px',
                borderRadius: '4px',
                background: 'transparent',
                border: '1px solid #75B640',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}>
              <span style={{
                color: '#52813C',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
              }}>
                Book Another Appointment
              </span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
          }
          50% {
            transform: translateX(-50%) scale(1.1);
          }
        }

        @media (max-width: 768px) {
          h2 {
            font-size: 24px !important;
          }
          p {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
