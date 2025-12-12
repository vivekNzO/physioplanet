'use client';

import { ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyAppointmentOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber = location.state?.mobileNumber;
  const expectedOtp = location.state?.otp as string | undefined;

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      if (!expectedOtp || otpValue === expectedOtp) {
        navigate('/welcome-page', {
          state: {
            mobileNumber,
            type: 'appointment',
            fullName: location.state?.fullName,
          }
        });
      } else {
        toast.error('Invalid OTP');
      }
    }
  };

  const handleResendOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    alert(`Your new OTP is: ${newOtp}`);
    navigate('.', { state: { ...location.state, otp: newOtp }, replace: true });
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

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
        maxWidth:'calc(100% - 496px)',
        width:'100%',
        margin:'0 auto',
      }}>
      <div style={{
        width: '100%',
        maxWidth: '507px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '18px',
      }}>
        {/* Back Button */}
        <div 
          onClick={() => navigate(-1)}
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
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '100px',
            border: '1px solid #E9EAEB',
            background: '#F8F8F8',
          }}>
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
          padding: '60.5px 55px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '10px',
          border: '1px solid #E4E5EB',
          background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
        }}>
          <div style={{
            maxWidth: '397px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
          }}>
            {/* Header Section */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}>
              <h1 className='text-[32px] text-center min-w-[399px]'>Verify Your <span className='font-bold inline text-[#1D5287]'>Appointment</span></h1>
              <p style={{
                color: '#0D0D0D',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                margin: 0,
              }}>
                Enter the 6-digit OTP sent to your mobile
              </p>
            </div>

            {/* OTP Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              justifyContent: 'center',
            }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: '48px',
                    height: '51px',
                    borderRadius: '4px',
                    border: '1px solid #E9EAEB',
                    background: '#FFF',
                    textAlign: 'center',
                    color: '#1D5287',
                    fontFamily: 'DM Sans, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            {/* Form Section */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '20px',
            }}>
              {/* Demo OTP Box */}
              <div style={{
                width: '100%',
                padding: '20px',
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
                  margin: 0,
                }}>
                  💡 <span style={{fontWeight: 700}}>Demo OTP:</span> Use 123456 for testing
                </p>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOTP}
                disabled={!isOtpComplete}
                style={{
                  width: '100%',
                  height: '51px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '7px',
                  borderRadius: '4px',
                  background: isOtpComplete
                    ? 'linear-gradient(90deg, #75B640 0%, #52813C 100%)'
                    : 'linear-gradient(90deg, #a0a0a0 0%, #808080 100%)',
                  border: 'none',
                  cursor: isOtpComplete ? 'pointer' : 'not-allowed',
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
                  Verify OTP
                </span>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M0.781372 7.41249C0.834565 7.42112 0.888397 7.4251 0.942258 7.4244L10.1135 7.42441L9.91352 7.51742C9.71804 7.60994 9.54021 7.73586 9.38799 7.88948L6.81614 10.4613C6.47742 10.7847 6.42051 11.3048 6.68127 11.6938C6.98476 12.1082 7.56677 12.1982 7.98126 11.8947C8.01475 11.8702 8.04657 11.8435 8.07648 11.8147L12.7272 7.16396C13.0907 6.80092 13.091 6.21199 12.7279 5.84854C12.7277 5.84831 12.7274 5.84805 12.7272 5.84781L8.07649 1.1971C7.71274 0.83437 7.12382 0.835184 6.76106 1.19893C6.73252 1.22756 6.70586 1.25802 6.68127 1.29011C6.42051 1.67906 6.47742 2.19921 6.81614 2.52255L9.38334 5.09905C9.51981 5.23566 9.67671 5.35021 9.84841 5.43855L10.1275 5.56412L0.993445 5.56412C0.518286 5.54647 0.101408 5.87839 0.0121436 6.34544C-0.070087 6.85251 0.274299 7.33023 0.781372 7.41249Z" fill="white"/>
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
            }}>
              <button
                onClick={() => navigate('/appointment-check')}
                style={{
                  flex: 1,
                  height: '51px',
                  padding: '19px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '4px',
                  border: '1px solid #E4E5EB',
                  background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                <span style={{
                  color: '#0D0D0D',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}>
                  Change
                </span>
              </button>
              <button
                onClick={handleResendOTP}
                style={{
                  flex: 1,
                  height: '51px',
                  padding: '19px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '4px',
                  border: '1px solid #E4E5EB',
                  background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: 0.55,
                }}>
                <span style={{
                  color: '#0D0D0D',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}>
                  Resend OTP
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
