import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import Navbar from '@/components/NavBar'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

function LoginPage() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const auth = useAuth()

  // Focus first input when OTP is sent
  useEffect(() => {
    if (otpSent && otpRefs.current[0]) {
      otpRefs.current[0]?.focus()
    }
  }, [otpSent])

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setError(null)
    setSendingOtp(true)
    try {
      await auth.sendPhoneOtp(phone)
      setOtpSent(true)
      toast.success('OTP sent to your WhatsApp!')
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return // Only allow single digit
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take the last character
    setOtp(newOtp)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are entered
    const otpString = newOtp.join('')
    if (otpString.length === 6) {
      handlePhoneLogin(otpString)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      otpRefs.current[5]?.focus()
      setError(null)
      // Auto-submit after paste
      setTimeout(() => handlePhoneLogin(pastedData), 100)
    }
  }

  const handlePhoneLogin = async (otpValue?: string) => {
    const otpString = otpValue || otp.join('')
    if (!otpString || otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await auth.loginWithPhone(phone, otpString)
      navigate('/')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setOtp(["", "", "", "", "", ""])
    await handleSendOtp()
  }

  return (
    <div style={{
      background: "url(/bg-1.jpg) 100% center no-repeat",
      minHeight: '100vh',
    }}>
      <Navbar/>
      <div style={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '100px',
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
                  <span style={{fontWeight: 400, color: '#0D0D0D'}}>LOG </span>
                  <span style={{fontWeight: 700, color: '#1D5287'}}>IN</span>
                </h1>
                <p style={{
                  color: '#0D0D0D',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  margin: 0,
                }}>
                  Sign in with your phone number and OTP
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
                {/* Phone Input */}
                <div style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '10px',
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      color: '#0D0D0D',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight:1
                    }}>
                      Phone Number
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setPhone(val)
                        setOtpSent(false)
                        setOtp(["", "", "", "", "", ""])
                        setError(null)
                      }}
                      placeholder="Enter 10-digit phone number"
                      disabled={otpSent}
                      style={{
                        flex: 1,
                        height: '51px',
                        padding: '0 17px',
                        borderRadius: '4px',
                        border: '1px solid #E9EAEB',
                        background: otpSent ? '#F5F5F5' : '#FFF',
                        color: '#0D0D0D',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        outline: 'none',
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && !otpSent && phone.length === 10 && handleSendOtp()}
                    />
                    {!otpSent && (
                      <button
                        onClick={handleSendOtp}
                        disabled={phone.length !== 10 || sendingOtp}
                        style={{
                          padding: '0 20px',
                          height: '51px',
                          borderRadius: '4px',
                          border: 'none',
                          background: phone.length === 10 && !sendingOtp
                            ? 'linear-gradient(90deg, #75B640 0%, #52813C 100%)'
                            : '#CCC',
                          color: '#FFF',
                          fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: phone.length === 10 && !sendingOtp ? 'pointer' : 'not-allowed',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sendingOtp ? <Loader className='animate-spin' size={16} /> : 'Send OTP'}
                      </button>
                    )}
                  </div>
                  {error && !otpSent && (
                    <div style={{
                      color: '#DC2626',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                    }}>
                      {error}
                    </div>
                  )}
                </div>

                {/* OTP Input */}
                {otpSent && (
                  <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '10px',
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{
                        color: '#0D0D0D',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight:1
                      }}>
                        Enter the 6-digit OTP sent to {phone}
                      </div>

                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      width: '100%',
                      justifyContent: 'center',
                    }}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '4px',
                            border: '1px solid #E9EAEB',
                            background: '#FFF',
                            color: '#0D0D0D',
                            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                            fontSize: '24px',
                            fontWeight: 600,
                            outline: 'none',
                            textAlign: 'center',
                            padding: 0,
                          }}
                          autoFocus={index === 0 && otpSent}
                        />
                      ))}
                    </div>
                    {error && (
                      <div style={{
                        color: '#DC2626',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '14px',
                        width: '100%',
                        textAlign: 'center',
                      }}>
                        {error}
                      </div>
                    )}
                    <button
                        onClick={handleResendOtp}
                        disabled={sendingOtp}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#1D5287',
                          fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: sendingOtp ? 'not-allowed' : 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {sendingOtp ? 'Sending...' : 'Resend OTP'}
                      </button>
                  </div>
                )}

                {/* Continue Button */}
                {otpSent && (
                  <button
                    onClick={() => handlePhoneLogin()}
                    disabled={otp.join('').length !== 6 || loading}
                    style={{
                      width: '100%',
                      height: '51px',
                      padding: '14px 116px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '7px',
                      borderRadius: '4px',
                      background: otp.join('').length !== 6
                        ? 'linear-gradient(90deg, #a0a0a0 0%, #808080 100%)'
                        : 'linear-gradient(90deg, #75B640 0%, #52813C 100%)',
                      border: 'none',
                      cursor: otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                    }}>
                    {loading ? (
                      <span className='flex items-center justify-center'><Loader className='animate-spin'/></span>
                    ) : (
                      <>
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
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
