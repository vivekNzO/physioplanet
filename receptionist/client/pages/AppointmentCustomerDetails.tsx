'use client';

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AppointmentCustomerDetails() {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber = location.state?.mobileNumber || '9988776655';

  const handleContinue = () => {
    if (fullName) {
      navigate('/book-appointment', { state: { mobileNumber, fullName, age, gender } });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '14px',
      paddingBottom: '70px',
      paddingLeft: '40px',
      paddingRight: '40px',
      gap: '59px',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)',
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '63px',
      }}>
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/c93f8aeef4212f434a06a6d43c7754a60ac0b1f6?width=412"
          alt="PhysioPlanet Logo"
          style={{
            width: '206px',
            height: '63px',
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
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            />
            <div style={{
              width: '21px',
              height: '22px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #75B640 0%, #52813C 100%)',
              position: 'absolute',
              left: '1px',
              top: 0,
            }}></div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '978px',
        padding: '16px 68px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
        border: '1px solid #E4E5EB',
        background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '841px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          {/* Title Section */}
          <div style={{
            width: '100%',
            maxWidth: '503px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '20px',
          }}>
            <h1 style={{
              alignSelf: 'stretch',
              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: 'normal',
              margin: 0,
            }}>
              <span style={{fontWeight: 400, color: '#0D0D0D'}}>New Customer </span>
              <span style={{fontWeight: 700, color: '#1D5287'}}>Registration</span>
            </h1>
            <p style={{
              alignSelf: 'stretch',
              color: '#0D0D0D',
              textAlign: 'center',
              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              margin: 0,
            }}>
              Please provide your details
            </p>
          </div>

          {/* User Badge */}
          <div style={{
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderRadius: '10px',
            border: '1px dashed #E5E5E5',
            background: '#FFF',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '17px',
            }}>
              <div style={{
                width: '59px',
                height: '59px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '29.5px',
                background: 'linear-gradient(180deg, #0557A8 0%, #1BB7E9 100%)',
                flexShrink: 0,
              }}>
                <span style={{
                  color: '#FFF',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                }}>
                  NE
                </span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '11px',
              }}>
                <div style={{
                  color: '#0D0D0D',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                }}>
                  Not entered
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <g clipPath="url(#clip0_369_505)">
                      <path d="M11.2631 8.47275C11.2432 8.45625 8.99475 6.8565 8.38762 6.95438C8.09475 7.00612 7.9275 7.206 7.59188 7.60575C7.53788 7.67025 7.40775 7.82438 7.30725 7.93425C7.09512 7.86514 6.88822 7.78093 6.68812 7.68225C5.6552 7.17938 4.82062 6.3448 4.31775 5.31187C4.21907 5.11178 4.13486 4.90488 4.06575 4.69275C4.176 4.59188 4.3305 4.46175 4.3965 4.40625C4.79437 4.0725 4.99388 3.90487 5.04562 3.61162C5.15175 3.0045 3.54375 0.75675 3.52725 0.7365C3.45402 0.632646 3.35865 0.546347 3.24801 0.483831C3.13738 0.421316 3.01425 0.384144 2.8875 0.375C2.23575 0.375 0.375 2.7885 0.375 3.19537C0.375 3.219 0.409125 5.6205 3.3705 8.63288C6.3795 11.5909 8.781 11.625 8.80462 11.625C9.21113 11.625 11.625 9.76425 11.625 9.1125C11.6158 8.98573 11.5785 8.8626 11.5159 8.75197C11.4534 8.64134 11.367 8.54598 11.2631 8.47275ZM8.763 10.8727C8.4375 10.845 6.42 10.5791 3.9 8.10375C1.41262 5.57138 1.1535 3.5505 1.12762 3.23738C1.61917 2.46587 2.2128 1.76438 2.89237 1.152C2.90737 1.167 2.92725 1.1895 2.95275 1.21875C3.47393 1.93021 3.9229 2.69185 4.293 3.49237C4.17265 3.61345 4.04544 3.72752 3.912 3.834C3.70507 3.99167 3.51506 4.17038 3.345 4.36725C3.31623 4.40762 3.29574 4.4533 3.28474 4.50164C3.27373 4.54998 3.27242 4.60002 3.28087 4.64888C3.36024 4.99265 3.48178 5.32529 3.64275 5.63925C4.21946 6.82351 5.17641 7.78033 6.36075 8.35687C6.67464 8.51807 7.0073 8.63975 7.35113 8.71912C7.39997 8.72777 7.45005 8.72655 7.49842 8.71554C7.54679 8.70453 7.59246 8.68394 7.63275 8.655C7.83032 8.48425 8.00965 8.29348 8.16788 8.08575C8.28562 7.9455 8.44275 7.75838 8.50237 7.7055C9.30493 8.07524 10.0683 8.52475 10.7809 9.04725C10.812 9.0735 10.8341 9.09375 10.8488 9.10687C10.2363 9.78667 9.53471 10.3804 8.763 10.8727Z" fill="#1D5287"/>
                      <path d="M8.625 5.625H9.375C9.37411 4.82962 9.05775 4.06708 8.49533 3.50467C7.93292 2.94225 7.17038 2.62589 6.375 2.625V3.375C6.97155 3.3756 7.5435 3.61284 7.96533 4.03467C8.38716 4.4565 8.6244 5.02845 8.625 5.625Z" fill="#1D5287"/>
                      <path d="M10.5 5.625H11.25C11.2485 4.33253 10.7344 3.09342 9.8205 2.1795C8.90658 1.26558 7.66747 0.751489 6.375 0.75V1.5C7.46862 1.50129 8.51708 1.9363 9.29039 2.70961C10.0637 3.48292 10.4987 4.53138 10.5 5.625Z" fill="#1D5287"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_369_505">
                        <rect width="12" height="12" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <span style={{
                    color: '#0D0D0D',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                  }}>
                    {mobileNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '20px',
          }}>
            <div style={{
              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              color: '#0D0D0D',
            }}>
              Complete Your Registration
            </div>

            {/* Form Fields */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '19px',
            }}>
              {/* Row with Full Name, Age, Gender */}
              <div style={{
                width: '100%',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                {/* Full Name */}
                <div style={{
                  flex: '1 1 273px',
                  minWidth: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <label style={{
                    color: '#0D0D0D',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter Your Full Name"
                    style={{
                      width: '100%',
                      height: '51px',
                      padding: '0 11px',
                      borderRadius: '4px',
                      border: '1px solid #E9EAEB',
                      background: '#FFF',
                      color: '#0D0D0D',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Age */}
                <div style={{
                  flex: '1 1 273px',
                  minWidth: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <label style={{
                    color: '#0D0D0D',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                  }}>
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your Age"
                    style={{
                      width: '100%',
                      height: '51px',
                      padding: '0 21px',
                      borderRadius: '4px',
                      border: '1px solid #E9EAEB',
                      background: '#FFF',
                      color: '#0D0D0D',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Gender */}
                <div style={{
                  flex: '1 1 273px',
                  minWidth: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <label style={{
                    color: '#0D0D0D',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                  }}>
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      width: '100%',
                      height: '51px',
                      padding: '0 21px',
                      borderRadius: '4px',
                      border: '1px solid #E9EAEB',
                      background: '#FFF',
                      color: gender ? '#0D0D0D' : '#697079',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '14px',
                      outline: 'none',
                      opacity: gender ? 1 : 0.66,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Profile Photo */}
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <label style={{
                  color: '#0D0D0D',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                }}>
                  Profile Photo (Optional)
                </label>
                <label style={{
                  width: '100%',
                  height: '51px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '7px',
                  borderRadius: '4px',
                  border: '1px solid #E9EAEB',
                  background: '#FFF',
                  cursor: 'pointer',
                }}>
                  <svg width="21" height="17" viewBox="0 0 21 17" fill="none">
                    <path d="M18.4891 2.92174C17.1212 2.92174 15.8435 2.23602 15.088 1.09565C14.6315 0.41087 13.8326 0 13.0109 0H7.98913C7.16739 0 6.36848 0.41087 5.91196 1.09565C5.15646 2.23602 3.87879 2.92174 2.51087 2.92174C1.11848 2.92174 0 4.04022 0 5.43261V14.2891C0 15.6815 1.11848 16.8 2.51087 16.8H18.4891C19.8815 16.8 21 15.6815 21 14.2891V5.43261C21 4.04022 19.8815 2.92174 18.4891 2.92174ZM10.5 14.7457C7.37283 14.7457 4.83913 12.212 4.83913 9.08478C4.83913 5.95761 7.37283 3.44674 10.5 3.44674C13.6272 3.44674 16.1609 5.98043 16.1609 9.10761C16.1609 12.212 13.6272 14.7457 10.5 14.7457ZM18.1696 6.45978C18.1467 6.45978 18.1239 6.45978 18.0783 6.45978H17.1652C16.7543 6.43696 16.4348 6.09456 16.4576 5.68369C16.4804 5.29565 16.7772 4.99891 17.1652 4.97609H18.0783C18.4891 4.95326 18.8315 5.27283 18.8543 5.68369C18.8772 6.09456 18.5804 6.43696 18.1696 6.45978Z" fill="url(#paint0_linear_369_190)"/>
                    <defs>
                      <linearGradient id="paint0_linear_369_190" x1="10.5" y1="0" x2="10.5" y2="16.8" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0557A8"/>
                        <stop offset="1" stopColor="#1BB7E9"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span style={{
                    color: '#0D0D0D',
                    fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    opacity: 0.66,
                  }}>
                    {profilePhoto ? profilePhoto.name : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '17px',
            flexWrap: 'wrap',
            marginTop: '10px',
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '264px',
                height: '51px',
                padding: '19px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '7px',
                borderRadius: '4px',
                border: '1px solid #E4E5EB',
                background: 'linear-gradient(135deg, #FAFAFC 0%, rgba(250, 250, 252, 0.7) 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M12.2186 5.58751C12.1654 5.57888 12.1116 5.5749 12.0577 5.57559L2.8865 5.57559L3.08648 5.48258C3.28196 5.39006 3.45979 5.26414 3.61201 5.11052L6.18386 2.53868C6.52258 2.21534 6.57949 1.69518 6.31873 1.30624C6.01524 0.891772 5.43324 0.801781 5.01874 1.10527C4.98526 1.1298 4.95343 1.15654 4.92352 1.18532L0.272801 5.83604C-0.0906525 6.19908 -0.0909722 6.78801 0.272074 7.15146C0.272307 7.15169 0.272568 7.15196 0.272801 7.15219L4.92352 11.8029C5.28726 12.1656 5.87619 12.1648 6.23894 11.8011C6.26749 11.7724 6.29414 11.742 6.31873 11.7099C6.57949 11.3209 6.52258 10.8008 6.18386 10.4774L3.61667 7.90095C3.4802 7.76434 3.32329 7.64979 3.15159 7.56145L2.87255 7.43588L12.0066 7.43588C12.4817 7.45353 12.8986 7.12161 12.9879 6.65456C13.0701 6.14749 12.7257 5.66977 12.2186 5.58751Z" fill="#0D0D0D"/>
              </svg>
              <span style={{
                color: '#0D0D0D',
                textAlign: 'center',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                textTransform: 'capitalize',
              }}>
                Back
              </span>
            </button>
            <button
              onClick={handleContinue}
              disabled={!fullName}
              style={{
                width: '264px',
                height: '51px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '7px',
                borderRadius: '4px',
                background: fullName
                  ? 'linear-gradient(90deg, #75B640 0%, #52813C 100%)'
                  : 'linear-gradient(90deg, #a0a0a0 0%, #808080 100%)',
                border: 'none',
                cursor: fullName ? 'pointer' : 'not-allowed',
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
  );
}
