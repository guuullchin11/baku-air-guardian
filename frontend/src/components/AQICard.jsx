import React from 'react';

function AQICard({ aqi, location, language = 'az' }) {
  const translations = {
    az: {
      good: 'Yaxşı',
      moderate: 'Orta',
      unhealthySensitive: 'Həssaslar üçün pis',
      unhealthy: 'Pis',
      veryUnhealthy: 'Çox pis',
      hazardous: 'Təhlükəli'
    },
    en: {
      good: 'Good',
      moderate: 'Moderate',
      unhealthySensitive: 'Unhealthy for Sensitive',
      unhealthy: 'Unhealthy',
      veryUnhealthy: 'Very Unhealthy',
      hazardous: 'Hazardous'
    }
  };

  const t = translations[language];

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return { bg: '#22c55e', shadow: 'rgba(34, 197, 94, 0.4)' };
    if (aqi <= 100) return { bg: '#fbbf24', shadow: 'rgba(251, 191, 36, 0.4)' };
    if (aqi <= 150) return { bg: '#f97316', shadow: 'rgba(249, 115, 22, 0.4)' };
    if (aqi <= 200) return { bg: '#ef4444', shadow: 'rgba(239, 68, 68, 0.4)' };
    if (aqi <= 300) return { bg: '#a855f7', shadow: 'rgba(168, 85, 247, 0.4)' };
    return { bg: '#7f1d1d', shadow: 'rgba(127, 29, 29, 0.4)' };
  };

  const getAQILabel = (aqi) => {
    if (aqi <= 50) return t.good;
    if (aqi <= 100) return t.moderate;
    if (aqi <= 150) return t.unhealthySensitive;
    if (aqi <= 200) return t.unhealthy;
    if (aqi <= 300) return t.veryUnhealthy;
    return t.hazardous;
  };

  const getEmoji = (aqi) => {
    if (aqi <= 50) return '😊';
    if (aqi <= 100) return '😐';
    if (aqi <= 150) return '😷';
    if (aqi <= 200) return '😰';
    return '☠️';
  };

  const colors = getAQIColor(aqi);

  return (
    <div 
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}dd 100%)`,
        color: aqi > 100 ? 'white' : '#111',
        padding: '32px 24px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: `0 10px 40px ${colors.shadow}, 0 0 0 1px ${colors.bg}40`,
        minWidth: '200px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInUp 0.6s ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
        e.currentTarget.style.boxShadow = `0 20px 60px ${colors.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 10px 40px ${colors.shadow}, 0 0 0 1px ${colors.bg}40`;
      }}
    >
      {/* Decorative gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(40px, -40px)',
        pointerEvents: 'none'
      }}></div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          fontSize: '1.3rem', 
          fontWeight: '700', 
          marginBottom: '12px',
          letterSpacing: '0.3px',
          textShadow: aqi > 100 ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
        }}>
          📍 {location}
        </div>
        
        <div style={{ 
          fontSize: '4.5rem', 
          fontWeight: '900', 
          margin: '16px 0',
          lineHeight: '1',
          textShadow: aqi > 100 ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
          animation: 'pulse 3s ease-in-out infinite'
        }}>
          {aqi}
        </div>
        
        <div style={{ 
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '12px',
          opacity: aqi > 100 ? 0.95 : 0.8,
          letterSpacing: '0.5px'
        }}>
          AQI • {getAQILabel(aqi)}
        </div>
        
        <div style={{ 
          fontSize: '2.5rem',
          marginTop: '16px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          {getEmoji(aqi)}
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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}

export default AQICard;