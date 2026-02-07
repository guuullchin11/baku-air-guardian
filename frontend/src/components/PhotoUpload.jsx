import React, { useState } from 'react';
import axios from 'axios';

// --- API_URL ƏLAVƏ EDİLDİ ---
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PhotoUpload({ language = 'az' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const translations = {
    az: {
      title: '📸 Göy Üzü Foto Analizi (Gemini Vision)',
      subtitle: 'Göy üzünün fotosunu yükləyin, AI təxmini AQI təyin etsin',
      dragDropOrBrowse: 'Foto sürüşdürün və ya seçin',
      analyze: 'Analiz Et',
      analyzing: 'Analiz edilir...',
      selectPhotoError: 'Zəhmət olmasa foto seçin',
      analysisResult: 'Analiz Nəticəsi',
      description: 'Təsvir',
      recommendations: 'Tövsiyələr',
      healthy: 'Sağlam insanlar üçün:',
      sensitive: 'Həssas qruplar üçün:',
      children: 'Uşaqlar üçün:',
      elderly: 'Yaşlılar üçün:'
    },
    en: {
      title: '📸 Sky Photo Analysis (Gemini Vision)',
      subtitle: 'Upload a sky photo, AI will estimate AQI',
      dragDropOrBrowse: 'Drag & drop or browse photo',
      analyze: 'Analyze',
      analyzing: 'Analyzing...',
      selectPhotoError: 'Please select a photo',
      analysisResult: 'Analysis Result',
      description: 'Description',
      recommendations: 'Recommendations',
      healthy: 'For healthy people:',
      sensitive: 'For sensitive groups:',
      children: 'For children:',
      elderly: 'For elderly:'
    }
  };

  const t = translations[language];

  // Faylı Base64-ə çevirmək üçün köməkçi funksiya
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError(t.selectPhotoError);
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Şəkli base64-ə çeviririk (Backend-in gözlədiyi format)
      const base64Image = await convertToBase64(selectedFile);

      // --- DƏYİŞDİRİLDİ ---
      // Backend request.get_json() istifadə etdiyi üçün JSON göndəririk
      const response = await axios.post(
        `${API_URL}/api/analyze-image`,
        { image: base64Image }, 
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setResult(response.data);
    } catch (err) {
      setError('Foto analiz edilə bilmədi. Server işləyirmi yoxlayın.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
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
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ 
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          {t.title}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>{t.subtitle}</p>

        <div style={{ marginBottom: '24px' }}>
          <label 
            htmlFor="photo-upload"
            style={{
              display: 'block',
              padding: '50px 30px',
              border: '3px dashed #cbd5e1',
              borderRadius: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#f8fafc',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
            <div style={{ fontWeight: '600', color: '#334155' }}>{t.dragDropOrBrowse}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>PNG, JPG, JPEG</div>
          </label>
          <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        {preview && (
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px' }} />
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || analyzing}
          style={{
            background: analyzing ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            border: 'none',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: '700',
            cursor: analyzing ? 'not-allowed' : 'pointer',
            width: '100%',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
        >
          {analyzing ? t.analyzing : t.analyze}
        </button>

        {error && (
          <div style={{ color: '#dc2626', background: '#fee2e2', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: 'white', padding: '25px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '20px' }}>✨ {t.analysisResult}</h3>
            
            <div style={{
              backgroundColor: getAQIColor(result.estimated_aqi),
              color: result.estimated_aqi > 150 ? 'white' : '#1e293b',
              padding: '25px',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '48px', fontWeight: '800' }}>{result.estimated_aqi}</div>
              <div style={{ fontSize: '20px', fontWeight: '600' }}>{result.aqi_category}</div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>📝 {t.description}:</strong>
              <p>{result.description}</p>
            </div>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
              <strong>💡 {t.recommendations}</strong>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                <li><strong>{t.healthy}</strong> {result.recommendations?.healthy}</li>
                <li><strong>{t.sensitive}</strong> {result.recommendations?.sensitive}</li>
                <li><strong>{t.children}</strong> {result.recommendations?.children}</li>
                <li><strong>{t.elderly}</strong> {result.recommendations?.elderly}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhotoUpload;