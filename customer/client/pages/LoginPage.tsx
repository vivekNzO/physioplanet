import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const auth = useAuth()

  const handleContinue = async () => {
    setError(null)
    setLoading(true)
    try {
      await auth.login(username.trim(), password)
      navigate('/')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
        <div style={{
        background: "url(/bg-1.jpg) 100% center no-repeat",
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
    <div style={{
      width: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
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
                Sign in with your username and password
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
              {/* Username Input */}
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
                    Username
                  </div>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
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
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                />
                {error && (
                  <div className='text-sm text-red-600'>{error}</div>
                )}
              </div>

              {/* Password Input */}
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
                    Password
                  </div>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                />
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
                disabled={!username || !password || loading}
                style={{
                  width: '100%',
                  height: '51px',
                  padding: '14px 116px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '7px',
                  borderRadius: '4px',
                  background: (!username || !password)
                    ? 'linear-gradient(90deg, #a0a0a0 0%, #808080 100%)'
                    : 'linear-gradient(90deg, #75B640 0%, #52813C 100%)',
                  border: 'none',
                  cursor: (!username || !password) ? 'not-allowed' : 'pointer',
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
                      Sign in
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
             </div>
           </div>
         </div>
         </div>
       </div>
       </div>
   )
 }
 
 export default LoginPage