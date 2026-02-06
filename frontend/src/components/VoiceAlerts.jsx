import React, { useState, useEffect } from 'react';

function VoiceAlerts({ aqiData, language = 'az' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  const translations = {
    az: {
      title: '🔊 Səsli Xəbərdarlıqlar',
      subtitle: 'AQI məlumatını səslə dinləyin',
      playBtn: 'Səsli Oxu',
      stopBtn: 'Dayandır',
      selectLocation: 'Rayon seçin:',
      noData: 'Məlumat yoxdur',
      alertPrefix: 'Bu gün',
      cleanAir: 'Hava təmizdir. Çöldə vaxt keçirə bilərsiniz.',
      generallySafe: 'Ümumi əhali üçün problem yoxdur. Həssas insanlar ehtiyatlı olsun.',
      sensitiveCaution: 'Astmalılar və uşaqlar ehtiyatlı olsun. Uzun müddət çöldə qalmaq tövsiyə olunmur.',
      highPollution: 'Xəbərdarlıq! Hava çirklənməsi yüksəkdir. Evdə qalın və maska taxın.'
    },
    en: {
      title: '🔊 Voice Alerts',
      subtitle: 'Listen to AQI information',
      playBtn: 'Play Voice Alert',
      stopBtn: 'Stop',
      selectLocation: 'Select district:',
      noData: 'No data available',
      alertPrefix: 'Today in',
      cleanAir: 'Air is clean. Safe for outdoor activities.',
      generallySafe: 'Generally safe. Sensitive individuals should be cautious.',
      sensitiveCaution: 'People with asthma and children should limit prolonged outdoor exposure.',
      highPollution: 'Warning! High air pollution. Stay indoors and wear a mask.'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (!selectedLocation && aqiData && Object.keys(aqiData).length > 0) {
      setSelectedLocation(Object.keys(aqiData)[0]);
    }
  }, [aqiData, selectedLocation]);

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return language === 'az' ? 'Yaxşı' : 'Good';
    if (aqi <= 100) return language === 'az' ? 'Orta' : 'Moderate';
    if (aqi <= 150) return language === 'az' ? 'Həssaslar üçün pis' : 'Unhealthy for Sensitive';
    if (aqi <= 200) return language === 'az' ? 'Pis' : 'Unhealthy';
    return language === 'az' ? 'Çox pis' : 'Very Unhealthy';
  };

  const speakAQI = () => {
    if (!selectedLocation || !aqiData[selectedLocation]) {
      alert(t.noData);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert(language === 'az' ? 'Brauzeriniz səsli oxumağı dəstəkləmir' : 'Your browser does not support speech synthesis');
      return;
    }

    window.speechSynthesis.cancel();

    const aqi = aqiData[selectedLocation].aqi;
    const category = getAQICategory(aqi);
    const locationName = selectedLocation.replace(/^.*? - /, '');

    let text = language === 'az'
      ? `${t.alertPrefix} ${locationName} rayonunda hava keyfiyyəti göstəricisi ${aqi} səviyyəsindədir. ${category}. `
      : `${t.alertPrefix} ${locationName} district, the air quality index is ${aqi}. ${category}. `;

    if (aqi <= 50) text += t.cleanAir;
    else if (aqi <= 100) text += t.generallySafe;
    else if (aqi <= 150) text += t.sensitiveCaution;
    else text += t.highPollution;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (language === 'az') {
      const azVoices = voices.filter(v => v.lang.includes('tr') || v.lang.includes('az'));
      utterance.voice = azVoices.find(v => v.name.includes('Google') || v.name.includes('Microsoft')) || azVoices[0] || voices[0];
      utterance.lang = 'tr-TR';
    } else {
      const enVoices = voices.filter(v => v.lang.includes('en'));
      utterance.voice = enVoices.find(v => v.name.includes('Google') || v.name.includes('Samantha')) || enVoices[0] || voices[0];
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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
        bottom: '-50px',
        left: '-50px',
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

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            color: '#1e293b', 
            fontWeight: '700',
            fontSize: '15px'
          }}>
            📍 {t.selectLocation}
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '18px 20px',
              fontSize: '16px',
              border: '2px solid transparent',
              borderRadius: '14px',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: '#1e293b',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            }}
          >
            {Object.entries(aqiData || {}).map(([loc, data]) => (
              <option key={loc} value={loc}>
                {loc.replace(/^.*? - /, '')} - AQI: {data.aqi}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {!isSpeaking ? (
            <button
              onClick={speakAQI}
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
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
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
              <span style={{ fontSize: '24px', marginRight: '10px' }}>🔊</span>
              {t.playBtn}
            </button>
          ) : (
            <button
              onClick={stopSpeaking}
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
                transition: 'all 0.3s ease',
                animation: 'pulse 2s infinite'
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
              <span style={{ 
                display: 'inline-block',
                fontSize: '24px', 
                marginRight: '10px',
                animation: 'blink 1s infinite'
              }}>🔴</span>
              {t.stopBtn}
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

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}

export default VoiceAlerts;