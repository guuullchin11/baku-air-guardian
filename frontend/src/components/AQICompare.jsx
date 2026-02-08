import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AQICompare({ aqiData, language = 'az' }) {
  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const translations = {
    az: {
      title: '🔍 Rayon Müqayisəsi',
      subtitle: 'İki rayonu müqayisə edin və Gemini 3 AI-dan tövsiyə alın',
      location1: 'Birinci rayon:',
      location2: 'İkinci rayon:',
      compareBtn: 'Müqayisə Et',
      analyzing: 'Gemini 3 analiz edir...',
      select: 'Rayon seçin'
    },
    en: {
      title: '🔍 District Comparison',
      subtitle: 'Compare two districts and get AI recommendations from Gemini 3',
      location1: 'First district:',
      location2: 'Second district:',
      compareBtn: 'Compare',
      analyzing: 'Gemini 3 analyzing...',
      select: 'Select district'
    }
  };

  const t = translations[language];

  const compareDistricts = async () => {
    if (!location1 || !location2) {
      alert(language === 'az' ? 'Zəhmət olmasa 2 rayon seçin' : 'Please select 2 districts');
      return;
    }

    if (location1 === location2) {
      alert(language === 'az' ? 'Fərqli rayonlar seçin' : 'Select different districts');
      return;
    }

    setLoading(true);

    try {
      const aqi1 = aqiData[location1]?.aqi || 0;
      const aqi2 = aqiData[location2]?.aqi || 0;

      // Gemini 3-dən müqayisə al
      const response = await axios.post(`${API_URL}/api/compare`, {
        location1: { name: location1.split(' - ')[1], aqi: aqi1 },
        location2: { name: location2.split(' - ')[1], aqi: aqi2 },
        language: language
      });

      setComparison(response.data);
    } catch (error) {
      console.error('Müqayisə xətası:', error);
      setComparison({
        ai_analysis: language === 'az' 
          ? '⚠️ Texniki problem. Zəhmət olmasa yenidən cəhd edin.'
          : '⚠️ Technical issue. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#fbbf24';
    if (aqi <= 150) return '#f97316';
    return '#ef4444';
  };

  const getAQILabel = (aqi) => {
    if (language === 'az') {
      if (aqi <= 50) return 'Yaxşı';
      if (aqi <= 100) return 'Orta';
      if (aqi <= 150) return 'Pis';
      return 'Çox pis';
    } else {
      if (aqi <= 50) return 'Good';
      if (aqi <= 100) return 'Moderate';
      if (aqi <= 150) return 'Unhealthy';
      return 'Very Unhealthy';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      <h3 style={{ color: '#333', marginBottom: '5px', fontSize: '22px' }}>
        {t.title}
      </h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
        {t.subtitle}
      </p>

      {/* Rayon seçimi */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333'
          }}>
            {t.location1}
          </label>
          <select
            value={location1}
            onChange={(e) => setLocation1(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid #ddd',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            <option value="">{t.select}</option>
            {Object.keys(aqiData).map(loc => (
              <option key={loc} value={loc}>
                {loc.split(' - ')[1]} (AQI: {aqiData[loc].aqi})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333'
          }}>
            {t.location2}
          </label>
          <select
            value={location2}
            onChange={(e) => setLocation2(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid #ddd',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            <option value="">{t.select}</option>
            {Object.keys(aqiData).map(loc => (
              <option key={loc} value={loc}>
                {loc.split(' - ')[1]} (AQI: {aqiData[loc].aqi})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Müqayisə düyməsi */}
      <button
        onClick={compareDistricts}
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: loading ? '#ccc' : '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '25px'
        }}
      >
        {loading ? t.analyzing : t.compareBtn}
      </button>

      {/* Nəticələr */}
      {comparison && (
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '15px',
          padding: '25px'
        }}>
          {/* AQI kartları */}
          {location1 && location2 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: getAQIColor(aqiData[location1]?.aqi),
                borderRadius: '12px',
                padding: '20px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  {location1.split(' - ')[1]}
                </div>
                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                  {aqiData[location1]?.aqi}
                </div>
                <div style={{ fontSize: '14px' }}>
                  {getAQILabel(aqiData[location1]?.aqi)}
                </div>
              </div>

              <div style={{
                backgroundColor: getAQIColor(aqiData[location2]?.aqi),
                borderRadius: '12px',
                padding: '20px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  {location2.split(' - ')[1]}
                </div>
                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                  {aqiData[location2]?.aqi}
                </div>
                <div style={{ fontSize: '14px' }}>
                  {getAQILabel(aqiData[location2]?.aqi)}
                </div>
              </div>
            </div>
          )}

          {/* Gemini 3 AI analiz */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#667eea',
              marginBottom: '12px'
            }}>
              🤖 Gemini 3 AI Analysis
            </div>
            <div style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              color: '#374151'
            }}>
              {comparison.ai_analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AQICompare;