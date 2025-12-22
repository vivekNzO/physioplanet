import React from 'react'

export default function IndexSkeleton() {
  const shimmer = {
    background:
      'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 37%, #e5e7eb 63%)',
    backgroundSize: '400% 100%',
    animation: 'shimmer 1.4s ease infinite',
  };

  const darkShimmer = {
    background:
      'linear-gradient(90deg, #d1d5db 25%, #e5e7eb 37%, #d1d5db 63%)',
    backgroundSize: '400% 100%',
    animation: 'shimmer 1.4s ease infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `}
      </style>

      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background:
            'linear-gradient(135deg, #eef2f7 0%, #e6ebf2 100%)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '780px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '50px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: '260px',
              height: '72px',
              borderRadius: '10px',
              ...darkShimmer,
            }}
          />

          {/* Heading */}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div
              style={{
                height: '50px',
                maxWidth: '560px',
                margin: '0 auto 14px',
                borderRadius: '8px',
                ...darkShimmer,
              }}
            />
            <div
              style={{
                height: '24px',
                maxWidth: '420px',
                margin: '0 auto',
                borderRadius: '6px',
                ...shimmer,
              }}
            />
          </div>

          {/* Feature Cards */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '30px',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  padding: '34.5px 29.5px',
                  minHeight: '178px',
                  borderRadius: '6px',
                  border: '1px solid #dfe3ea',
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    ...darkShimmer,
                  }}
                />
                <div
                  style={{
                    width: '150px',
                    height: '18px',
                    borderRadius: '6px',
                    ...darkShimmer,
                  }}
                />
                <div
                  style={{
                    width: '190px',
                    height: '14px',
                    borderRadius: '6px',
                    ...shimmer,
                  }}
                />
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div
            style={{
              width: '230px',
              height: '54px',
              borderRadius: '6px',
              background:
                'linear-gradient(90deg, #c7e3b2 25%, #d8ebc7 37%, #c7e3b2 63%)',
              backgroundSize: '400% 100%',
              animation: 'shimmer 1.4s ease infinite',
            }}
          />
        </div>
      </div>
    </>
  );
}

