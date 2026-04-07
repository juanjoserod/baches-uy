import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'bachesuy.com — Mapa colaborativo de baches en Uruguay'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bachesuy.com'

export default function OpenGraphImage() {
  const logoSrc = `${siteUrl}/baches-wordmark.png`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at top left, rgba(124, 188, 255, 0.32), transparent 28%), linear-gradient(180deg, #f6fbff 0%, #eaf4ff 50%, #f8fafc 100%)',
          color: '#102133',
          padding: '56px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-120px',
            top: '-110px',
            width: '380px',
            height: '380px',
            borderRadius: '9999px',
            background: 'rgba(36, 131, 216, 0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-100px',
            bottom: '-160px',
            width: '420px',
            height: '420px',
            borderRadius: '9999px',
            background: 'rgba(15, 79, 136, 0.08)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            justifyContent: 'space-between',
            borderRadius: '40px',
            border: '1px solid rgba(36, 131, 216, 0.16)',
            background: 'rgba(255,255,255,0.88)',
            boxShadow: '0 24px 60px rgba(16, 33, 51, 0.16)',
            padding: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <img
              src={logoSrc}
              alt="bachesuy.com"
              style={{
                width: '440px',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '9999px',
                background: '#ebf5ff',
                color: '#0f4f88',
                padding: '12px 20px',
                fontSize: '24px',
                fontWeight: 700,
              }}
            >
              Uruguay
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              maxWidth: '820px',
            }}
          >
            <div
              style={{
                fontSize: '66px',
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: '-0.04em',
              }}
            >
              Mapa colaborativo de baches en Uruguay
            </div>
            <div
              style={{
                fontSize: '30px',
                lineHeight: 1.35,
                color: '#48617b',
              }}
            >
              Reportá, visibilizá y compartí evidencia para generar presión pública con datos ciudadanos.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '14px',
              }}
            >
              {['Fotos', 'Mapa', 'Confirmaciones', 'Dashboard'].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    border: '1px solid rgba(36, 131, 216, 0.16)',
                    background: '#ffffff',
                    color: '#176ab6',
                    padding: '10px 18px',
                    fontSize: '22px',
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#176ab6',
              }}
            >
              bachesuy.com
            </div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
