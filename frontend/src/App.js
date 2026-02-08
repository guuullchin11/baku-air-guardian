import React, { useState, useEffect } from 'react';
import './App.css';
import AQICard from './components/AQICard';
import PhotoUpload from './components/PhotoUpload';
import ChatBot from './components/ChatBot';
import InteractiveMap from './components/InteractiveMap';
import AQIForecast from './components/AQIForecast';
import axios from 'axios';
import AQIAlerts from './components/AQIAlerts';
import VoiceAlerts from './components/VoiceAlerts';
import AQICompare from './components/AQICompare';

// --- ƏLAVƏ EDİLDİ ---
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [aqiData, setAqiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('az');

  const translations = {
    az: {
      title: 'Azerbaijan Air Quality Guardian',
      subtitle: 'Azərbaycanın şəhər və rayonlarında real-time hava keyfiyyəti',
      dataSource: 'Data mənbəyi: OpenWeatherMap',
      loading: 'Yüklənir...',
      error: 'Backend-ə qoşulmaq alınmadı. Backend işləyirmi yoxla.',
      locations: 'yer',
      lastUpdate: 'Son yeniləmə:',
      poweredBy: 'Powered by Gemini 3 • Hackathon üçün hazırlanmış prototip'
    },
    en: {
      title: 'Azerbaijan Air Quality Guardian',
      subtitle: 'Real-time air quality monitoring in cities and districts of Azerbaijan',
      dataSource: 'Data source: OpenWeatherMap',
      loading: 'Loading...',
      error: 'Cannot connect to backend. Check if backend is running.',
      locations: 'locations',
      lastUpdate: 'Last update:',
      poweredBy: 'Powered by Gemini 3 • Hackathon prototype'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const fetchAQI = async () => {
      try {
        setLoading(true);
        // --- DƏYİŞDİRİLDİ ---
        const response = await axios.get(`${API_URL}/api/aqi`);
        setAqiData(response.data);
        setLoading(false);
      } catch (err) {
        setError(t.error);
        setLoading(false);
        console.error(err);
      }
    };

    fetchAQI();
    const interval = setInterval(fetchAQI, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [t.error]);

  const groupByCity = (data) => {
    const grouped = {};
    const otherLabel = language === 'az' ? 'Digər' : 'Other';
    Object.entries(data).forEach(([loc, info]) => {
      const city = info.city || otherLabel;
      if (!grouped[city]) grouped[city] = {};
      grouped[city][loc] = info;
    });
    return grouped;
  };

  if (loading) return (
    <div style={{
      padding: '20px', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div>
        <div style={{
          border: '8px solid rgba(255,255,255,0.3)',
          borderTop: '8px solid white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2 style={{color: 'white'}}>{t.loading}</h2>
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>
      <h2>{error}</h2>
      <p>Backend server işə salınıbmı yoxla: {API_URL}/api/health</p>
    </div>
  );

  const groupedData = groupByCity(aqiData);

  return (
    <div className="App gradient-overlay" style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      
      {/* Dil toggle button */}
      <div className="language-toggle">
        <button
          onClick={() => setLanguage('az')}
          style={{
            backgroundColor: language === 'az' ? '#667eea' : 'transparent',
            color: language === 'az' ? 'white' : '#333'
          }}
        >
          🇦🇿 AZ
        </button>
        <button
          onClick={() => setLanguage('en')}
          style={{
            backgroundColor: language === 'en' ? '#667eea' : 'transparent',
            color: language === 'en' ? 'white' : '#333'
          }}
        >
          🇬🇧 EN
        </button>
      </div>

      {/* Başlıq */}
      <h1 className="gradient-title">
        🌍 {t.title}
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '16px' }}>
        {t.subtitle}
      </p>
      
      {/* Foto Upload */}
      <div className="feature-card fade-in">
        <div className="section-header">
          <span className="section-icon">📸</span>
          <div>
            <div className="section-title">
              {language === 'az' ? 'Göy Üzü Foto Analizi' : 'Sky Photo Analysis'}
            </div>
            <div className="section-subtitle">
              Gemini Vision
            </div>
          </div>
        </div>
        <PhotoUpload language={language} />
      </div>

      {/* AI Chat */}
      <div className="feature-card fade-in-delay-1">
        <div className="section-header">
          <span className="section-icon">💬</span>
          <div>
            <div className="section-title">
              {language === 'az' ? 'AI Sağlamlıq Məsləhətçisi' : 'AI Health Advisor'}
            </div>
            <div className="section-subtitle">
              {language === 'az' ? 'Hava keyfiyyəti haqqında sual verin' : 'Ask questions about air quality'}
            </div>
          </div>
        </div>
        <ChatBot language={language} />
      </div>

      {/* Xəritə */}
      <div className="feature-card fade-in-delay-2">
        <div className="section-header">
          <span className="section-icon">🗺️</span>
          <div>
            <div className="section-title">
              {language === 'az' ? 'İnteraktiv Xəritə' : 'Interactive Map'}
            </div>
            <div className="section-subtitle">
              {language === 'az' ? 'Rayonların üzərinə klik edin' : 'Click on districts'}
            </div>
          </div>
        </div>
        <InteractiveMap aqiData={aqiData} language={language} />
      </div>

      {/* Chart */}
      <div className="feature-card fade-in-delay-3">
        <div className="section-header">
          <span className="section-icon">📈</span>
          <div>
            <div className="section-title">
              {language === 'az' ? '7 Günlük AQI Trendi' : '7-Day AQI Trend'}
            </div>
            <div className="section-subtitle">
              {language === 'az' ? 'Bakı - Nəsimi rayonu üçün proqnoz' : 'Forecast for Baku - Nesimi district'}
            </div>
          </div>
        </div>
        <AQIForecast language={language} />
      </div>

      {/* AQI Alerts */}
      <div className="feature-card" style={{ marginBottom: '50px' }}>
        <AQIAlerts aqiData={aqiData} language={language} />
      </div>

      {/* Voice Alerts */}
      <div className="feature-card" style={{ marginBottom: '50px' }}>
        <VoiceAlerts aqiData={aqiData} language={language} />
      </div>

      {/* Rayon Müqayisəsi - YENİ! */}
      <div className="section-header">
        <span className="section-icon">🔍</span>
        <div>
          <h2 className="section-title">
            {language === 'az' ? 'Rayon Müqayisəsi' : 'District Comparison'}
          </h2>
          <p className="section-subtitle">
            {language === 'az' 
              ? 'İki rayonu müqayisə edin və AI tövsiyəsi alın' 
              : 'Compare two districts and get AI recommendations'}
          </p>
        </div>
      </div>
      <div className="feature-card fade-in-delay-3">
        <AQICompare aqiData={aqiData} language={language} />
      </div>
      
      {/* Şəhərlərə görə AQI kartları */}
      {Object.entries(groupedData).map(([city, locations]) => (
        <div key={city} style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            color: '#333', 
            marginBottom: '20px',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            📍 {city}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(locations).map(([locationName, locationData]) => (
              <AQICard 
                key={locationName}
                aqi={locationData.aqi} 
                location={locationName.replace(`${city} - `, '')}
                language={language}
              />
            ))}
          </div>
        </div>
      ))}

      <footer style={{
        marginTop: '60px', 
        textAlign: 'center',
        padding: '30px 20px',
        borderTop: '1px solid #ddd'
      }}>
        <p style={{ fontSize: '13px', color: '#999', marginBottom: '10px' }}>
          {t.dataSource} | {Object.keys(aqiData).length} {t.locations} | {t.lastUpdate} {new Date().toLocaleTimeString('az-AZ')}
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          {t.poweredBy} • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default App;