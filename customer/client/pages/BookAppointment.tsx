'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookAppointment() {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState(20);
  const [currentMonth, setCurrentMonth] = useState(10); // November (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const navigate = useNavigate();

  // Generate consistent random availability for slots per date using useMemo
  const timeSlots = useMemo(() => {
    // Use date as seed for consistent randomness
    const dateKey = `${currentYear}-${currentMonth}-${selectedDate}`;
    const seed = dateKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Seeded random function for consistent results
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    return [
      { time: '09:00-09:30AM', staff: 'Dr. Sahil Behl • Dr. Anuja Behl', available: seededRandom(0) > 0.3 },
      { time: '09:30-10:00AM', staff: 'Dr. Sahil Behl • Dr. Anuja Behl', available: seededRandom(1) > 0.3 },
      { time: '10:00-10:30AM', staff: 'Dr. Sahil Behl • Dr. Anuja Behl', available: seededRandom(2) > 0.3 },
      { time: '10:30-11:00AM', staff: 'Dr. Sahil Behl • Dr. Anuja Behl', available: seededRandom(3) > 0.3 },
      { time: '11:00-11:30AM', staff: 'Dr. Sahil Behl • Dr. Anuja Behl', available: seededRandom(4) > 0.3 },
      { time: '11:30-12:00PM', staff: 'Dr. Sahil Behl • Dr. Anuja Behl', available: seededRandom(5) > 0.3 },
      { time: '12:00-01:00PM', staff: 'Dr. Sahil Behl • Dr. Anuja Behl', available: seededRandom(6) > 0.3 },
      { time: '02:30-03:00PM', staff: 'Dr. Sahil Behl • Dr. Anuja Behl', available: seededRandom(7) > 0.3 },
    ];
  }, [selectedDate, currentMonth, currentYear]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysArray = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const daysInPrevMonth = getDaysInMonth(currentMonth - 1 < 0 ? 11 : currentMonth - 1, currentMonth - 1 < 0 ? currentYear - 1 : currentYear);

    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const handleContinue = () => {
    if (selectedTimeSlot) {
      console.log({ selectedStaff, selectedDate, selectedTimeSlot });
      navigate('/whatsapp-confirmation');
    }
  };

  const calendarDays = getDaysArray();

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
              }}
            />
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
        {/* Title Row with Back Button */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          marginBottom: '10px',
        }}>
          {/* Back Button */}
          <div
            onClick={() => navigate('/check-in', { state: { flowType: 'appointment' } })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              flexShrink: 0,
              marginTop: '5px',
            }}>
            <div style={{
              display: 'flex',
              width: '42px',
              height: '42px',
              padding: '8px',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '100px',
              border: '1px solid #E9EAEB',
              background: '#F8F8F8',
            }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.4079 5.92548C11.7252 6.24278 11.7252 6.75722 11.4079 7.07452L6.29492 12.1875H21.6667C22.1154 12.1875 22.4792 12.5513 22.4792 13C22.4792 13.4487 22.1154 13.8125 21.6667 13.8125H6.29492L11.4079 18.9255C11.7252 19.2428 11.7252 19.7572 11.4079 20.0745C11.0906 20.3918 10.5762 20.3918 10.2588 20.0745L3.75885 13.5745C3.44155 13.2572 3.44155 12.7428 3.75885 12.4255L10.2588 5.92548C10.5762 5.60817 11.0906 5.60817 11.4079 5.92548Z" fill="black"/>
              </svg>
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

          {/* Title Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
          }}>
            <h1 style={{
              alignSelf: 'stretch',
              fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: 'normal',
              textAlign: 'center',
              margin: 0,
            }}>
              <span style={{fontWeight: 400, color: '#0D0D0D'}}>Book Your </span>
              <span style={{fontWeight: 700, color: '#1D5287'}}>Appointment</span>
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
              Ready to meet with you
            </p>
          </div>
        </div>

        <div style={{
          width: '100%',
          maxWidth: '784px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          {/* Main Content */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {/* Staff Selection */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <label style={{
                color: '#0D0D0D',
                fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
              }}>
                Select Staff
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                style={{
                  width: '100%',
                  height: '51px',
                  padding: '0 32px',
                  borderRadius: '4px',
                  border: '1px solid #E9EAEB',
                  background: '#FFF',
                  color: selectedStaff ? '#0D0D0D' : '#697079',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '14px',
                  outline: 'none',
                  opacity: selectedStaff ? 1 : 0.66,
                  cursor: 'pointer',
                }}
              >
                <option value="">Select Staff</option>
                <option value="dr-sahil">Dr. Sahil Behl</option>
                <option value="dr-anuja">Dr. Anuja Behl</option>
              </select>
            </div>

            {/* Calendar and Time Slots */}
            <div style={{
              width: '100%',
              display: 'flex',
              gap: '45px',
              flexWrap: 'wrap',
            }}>
              {/* Calendar */}
              <div style={{
                flex: '1 1 393px',
                minWidth: '300px',
                padding: '23px 34px',
                borderRadius: '9px',
                background: '#FFF',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '25px',
                }}>
                  {/* Calendar Header */}
                  <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <button
                      onClick={handlePrevMonth}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '21px',
                        height: '21px',
                        borderRadius: '50%',
                        backgroundColor: '#1D5287',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}>
                      &lt;
                    </button>
                    <div style={{
                      color: '#1D5287',
                      textAlign: 'center',
                      fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '20px',
                      fontWeight: 700,
                      lineHeight: '24px',
                      minWidth: '200px',
                    }}>
                      <span style={{fontWeight: 400, color: '#000'}}>{monthNames[currentMonth]}</span> <span style={{color: '#1D5287'}}>{currentYear}</span>
                    </div>
                    <button
                      onClick={handleNextMonth}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '21px',
                        height: '21px',
                        borderRadius: '50%',
                        backgroundColor: '#1D5287',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}>
                      &gt;
                    </button>
                  </div>

                  {/* Day Labels */}
                  <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} style={{
                        width: '40px',
                        color: 'rgba(60, 60, 67, 0.6)',
                        textAlign: 'center',
                        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: '16px',
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                  }}>
                    {calendarDays.map((dayObj, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (dayObj.isCurrentMonth && dayObj.day >= 20) {
                            setSelectedDate(dayObj.day);
                          }
                        }}
                        style={{
                          padding: '8px 0',
                          color: dayObj.isCurrentMonth && dayObj.day === selectedDate ? '#FFF' : (dayObj.isCurrentMonth ? '#000' : '#808080'),
                          textAlign: 'center',
                          fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          cursor: dayObj.isCurrentMonth && dayObj.day >= 20 ? 'pointer' : 'default',
                          background: dayObj.isCurrentMonth && dayObj.day === selectedDate ? '#74B446' : (dayObj.isCurrentMonth && dayObj.day >= 20 ? 'rgba(116, 180, 70, 0.2)' : 'transparent'),
                          border: dayObj.isCurrentMonth && dayObj.day > 20 && dayObj.day !== selectedDate ? '1px solid #FFF' : 'none',
                        }}>
                        {dayObj.day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div style={{
                flex: '1 1 346px',
                minWidth: '300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '21px',
              }}>
                <div style={{
                  color: '#1D5287',
                  textAlign: 'center',
                  fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: '24px',
                }}>
                  <span style={{fontWeight: 400, color: '#000'}}>
                    {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', { weekday: 'short' })}, {monthNames[currentMonth]}
                  </span> <span style={{color: '#1D5287'}}>{currentYear}</span>
                </div>

                {/* Time Slots Grid */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  {Array.from({ length: Math.ceil(timeSlots.length / 2) }).map((_, rowIndex) => (
                    <div key={rowIndex} style={{
                      display: 'flex',
                      gap: '10px',
                    }}>
                      {timeSlots.slice(rowIndex * 2, rowIndex * 2 + 2).map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (slot.available) {
                              setSelectedTimeSlot(slot.time);
                            }
                          }}
                          disabled={!slot.available}
                          style={{
                            flex: 1,
                            padding: '8.8px 12.8px',
                            borderRadius: '4px',
                            border: selectedTimeSlot === slot.time ? 'none' : '1px solid #E1E7EF',
                            background: !slot.available
                              ? '#DC2626'
                              : selectedTimeSlot === slot.time
                                ? '#74B446'
                                : '#E3F0DA',
                            cursor: slot.available ? 'pointer' : 'not-allowed',
                            textAlign: 'left',
                            opacity: !slot.available ? 0.8 : 1,
                          }}>
                          <div style={{
                            color: !slot.available
                              ? '#FFF'
                              : selectedTimeSlot === slot.time
                                ? '#FFF'
                                : '#344256',
                            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            marginBottom: '5px',
                          }}>
                            {slot.time}
                            {!slot.available && (
                              <span style={{
                                marginLeft: '8px',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}>
                                BOOKED
                              </span>
                            )}
                          </div>
                          <div style={{
                            color: !slot.available
                              ? '#FFF'
                              : selectedTimeSlot === slot.time
                                ? '#FFF'
                                : '#65758B',
                            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
                            fontSize: '8px',
                            fontWeight: 400,
                          }}>
                            {slot.staff}
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={!selectedTimeSlot}
                  style={{
                    width: '100%',
                    height: '51px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '7px',
                    borderRadius: '4px',
                    background: selectedTimeSlot
                      ? 'linear-gradient(90deg, #75B640 0%, #52813C 100%)'
                      : 'linear-gradient(90deg, #a0a0a0 0%, #808080 100%)',
                    border: 'none',
                    cursor: selectedTimeSlot ? 'pointer' : 'not-allowed',
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
    </div>
  );
}
