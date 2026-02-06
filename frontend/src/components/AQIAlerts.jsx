import React, { useState, useEffect } from 'react';

function AQIAlerts({ aqiData, language = 'az' }) {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [permission, setPermission] = useState('default');

  const translations = {
    az: {
      title: '🔔 AQI Xəbərdarlıqları',
      subtitle: 'AQI 150+ olduqda bildiriş alın',
      enableBtn: 'Bildirişləri Aktivləşdir',
      disableBtn: 'Söndür',
      granted: '✅ Bildirişlər aktivdir',
      denied: '❌ Bildirişlər bloklanıb (brauzer ayarlarından açın)',
      default: 'Bildirişləri aktivləşdirin və təhlükəli AQI səviyyələri haqqında xəbərdarlıq alın',
      testBtn: 'Test'
    },
    en: {
      title: '🔔 AQI Alerts',
      subtitle: 'Get notified when AQI exceeds 150',
      enableBtn: 'Enable Notifications',
      disableBtn: 'Disable',
      granted: '✅ Notifications enabled',
      denied: '❌ Notifications blocked (enable in browser settings)',
      default: 'Enable notifications to get alerts about dangerous AQI levels',
      testBtn: 'Test'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert(language === 'az' ? 'Brauzeriniz bildirişləri dəstəkləmir' : 'Your browser does not support notifications');
      return;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === 'granted') {
      setAlertsEnabled(true);
      new Notification(language === 'az' ? '🌍 AQI Xəbərdarlıqları Aktivdir!' : '🌍 AQI Alerts Enabled!', {
        body: language === 'az' ? 'AQI 150+ olduqda bildiriş alacaqsınız' : 'You will receive notifications when AQI ≥ 150',
        icon: '/logo192.png'
      });
    }
  };

  const sendNotification = (location, aqi) => {
    if (permission !== 'granted') return;

    const title = language === 'az' ? `⚠️ DİQQƏT! ${location}` : `⚠️ WARNING! ${location}`;
    const body = language === 'az' 
      ? `AQI ${aqi} – Pis hava keyfiyyəti! Çöldə uzun müddət qalmayın.` 
      : `AQI ${aqi} – Poor air quality! Avoid prolonged outdoor activities.`;

    new Notification(title, {
      body,
      icon: '/logo192.png',
      requireInteraction: true,
      tag: `aqi-${location}`
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15), 0 0 0 1px rgba(102, 126, 234, 0.1)',
      maxWidth: '900px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
      animation: 'fadeInUp 0.6s ease-out'
    }}>
      {/* Decorative background */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        opacity: '0.1',
        filter: 'blur(40px)'
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ 
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem',
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>
          {t.title}
        </h3>
        <p style={{ 
          color: '#64748b', 
          fontSize: '15px',
          marginBottom: '30px'
        }}>
          {t.subtitle}
        </p>

        {permission === 'default' && (
          <div style={{ 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
            padding: '24px', 
            borderRadius: '16px', 
            margin: '24px 0', 
            borderLeft: '4px solid #3b82f6',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)',
            animation: 'slideIn 0.5s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>ℹ️</span>
              <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.6', fontSize: '15px' }}>
                {t.default}
              </p>
            </div>
          </div>
        )}

        {permission === 'granted' && alertsEnabled && (
          <div style={{ 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
            padding: '24px', 
            borderRadius: '16px', 
            margin: '24px 0', 
            borderLeft: '4px solid #10b981',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)',
            animation: 'slideIn 0.5s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>✅</span>
              <p style={{ margin: 0, color: '#065f46', lineHeight: '1.6', fontSize: '15px', fontWeight: '600' }}>
                {t.granted}
              </p>
            </div>
          </div>
        )}

        {permission === 'denied' && (
          <div style={{ 
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
            padding: '24px', 
            borderRadius: '16px', 
            margin: '24px 0', 
            borderLeft: '4px solid #ef4444',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)',
            animation: 'shake 0.5s ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>❌</span>
              <p style={{ margin: 0, color: '#991b1b', lineHeight: '1.6', fontSize: '15px', fontWeight: '600' }}>
                {t.denied}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          {!alertsEnabled ? (
            <button
              onClick={requestPermission}
              style={{
                flex: 1,
                padding: '20px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '17px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '10px' }}>🔔</span>
              {t.enableBtn}
            </button>
          ) : (
            <button
              onClick={() => setAlertsEnabled(false)}
              style={{
                flex: 1,
                padding: '20px 40px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '17px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(239, 68, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(239, 68, 68, 0.3)';
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '10px' }}>🔕</span>
              {t.disableBtn}
            </button>
          )}

          {alertsEnabled && (
            <button
              onClick={() => sendNotification('Test', 175)}
              style={{
                padding: '20px 32px',
                background: 'white',
                color: '#1e293b',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '17px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {t.testBtn} <span style={{ fontSize: '20px' }}>🔔</span>
            </button>
          )}
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

export default AQIAlerts;