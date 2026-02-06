import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function InteractiveMap({ aqiData, language = 'az' }) {
  const translations = {
    az: {
      title: '🗺️ İnteraktiv Xəritə',
      subtitle: 'Rayonların üzərinə klikləyin',
      aqiLabel: 'AQI',
      legendGood: '0-50: Yaxşı',
      legendModerate: '51-100: Orta',
      legendUnhealthySensitive: '101-150: Həssaslar üçün pis',
      legendUnhealthy: '151-200: Pis'
    },
    en: {
      title: '🗺️ Interactive Map',
      subtitle: 'Click on districts',
      aqiLabel: 'AQI',
      legendGood: '0-50: Good',
      legendModerate: '51-100: Moderate',
      legendUnhealthySensitive: '101-150: Unhealthy for Sensitive',
      legendUnhealthy: '151-200: Unhealthy'
    }
  };

  const t = translations[language];

  const bakuCenter = [40.4093, 49.8671];

  const locations = {
    'Bakı - Nəsimi': { lat: 40.3947, lon: 49.8822 },
    'Bakı - Nərimanov': { lat: 40.4015, lon: 49.8539 },
    'Bakı - Səbail': { lat: 40.3656, lon: 49.8354 },
    'Bakı - Yasamal': { lat: 40.3917, lon: 49.8064 },
    'Bakı - Binəqədi': { lat: 40.4550, lon: 49.8203 },
  };

  const getMarkerColor = (aqi) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    return '#8f3f97';
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15), 0 0 0 1px rgba(102, 126, 234, 0.1)',
      maxWidth: '1100px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
      animation: 'fadeInUp 0.6s ease-out'
    }}>
      {/* Decorative background */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        opacity: '0.08',
        filter: 'blur(60px)'
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ 
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2rem',
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>
          {t.title}
        </h2>
        <p style={{ 
          color: '#64748b', 
          marginBottom: '30px',
          fontSize: '1rem'
        }}>
          {t.subtitle}
        </p>

        <div style={{ 
          height: '550px', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative'
        }}>
          <MapContainer
            center={bakuCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {Object.entries(locations).map(([name, coords]) => {
              const locationData = aqiData[name];
              const aqi = locationData ? locationData.aqi : 0;

              return (
                <CircleMarker
                  key={name}
                  center={[coords.lat, coords.lon]}
                  radius={24}
                  fillColor={getMarkerColor(aqi)}
                  color="white"
                  weight={3}
                  opacity={1}
                  fillOpacity={0.9}
                >
                  <Popup>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '16px',
                      minWidth: '180px'
                    }}>
                      <h3 style={{ 
                        margin: '0 0 14px 0', 
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}>
                        📍 {name.replace('Bakı - ', '')}
                      </h3>
                      <div style={{
                        fontSize: '48px',
                        fontWeight: '800',
                        background: `linear-gradient(135deg, ${getMarkerColor(aqi)}, ${getMarkerColor(aqi)}dd)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: '12px 0',
                        textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}>
                        {aqi}
                      </div>
                      <div style={{ 
                        fontSize: '15px', 
                        color: '#64748b',
                        fontWeight: '600',
                        padding: '8px 16px',
                        background: '#f1f5f9',
                        borderRadius: '8px',
                        display: 'inline-block'
                      }}>
                        {t.aqiLabel}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '30px',
          flexWrap: 'wrap',
          padding: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}>
          {[
            { color: '#00e400', label: t.legendGood, emoji: '😊' },
            { color: '#ffff00', label: t.legendModerate, emoji: '😐' },
            { color: '#ff7e00', label: t.legendUnhealthySensitive, emoji: '😷' },
            { color: '#ff0000', label: t.legendUnhealthy, emoji: '😰' },
          ].map(item => (
            <div 
              key={item.color} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '10px 16px',
                background: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                border: '3px solid white',
                boxShadow: `0 3px 10px ${item.color}60`
              }}></div>
              <span style={{ 
                fontSize: '14px', 
                color: '#334155',
                fontWeight: '600'
              }}>
                {item.emoji} {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
        }

        .leaflet-popup-tip {
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
        }
      `}</style>
    </div>
  );
}

export default InteractiveMap;