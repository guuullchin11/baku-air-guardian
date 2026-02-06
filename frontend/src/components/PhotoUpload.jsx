import React, { useState } from 'react';
import axios from 'axios';

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

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/analyze-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
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
      overflow: 'hidden',
      animation: 'fadeInUp 0.6s ease-out'
    }}>
      {/* Decorative background elements */}
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
      
      <div style={{
        position: 'relative',
        zIndex: 1
      }}>
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

        {/* Custom file upload */}
        <div style={{ marginBottom: '24px' }}>
          <label 
            htmlFor="photo-upload"
            style={{
              display: 'block',
              padding: '50px 30px',
              border: '3px dashed transparent',
              borderRadius: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '16px',
              animation: 'float 3s ease-in-out infinite'
            }}>
              📁
            </div>
            <div style={{ 
              fontSize: '18px', 
              color: '#334155', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              {language === 'az' 
                ? 'Dosya seçin və ya buraya sürüşdürün' 
                : 'Choose file or drag & drop here'}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#94a3b8',
              fontWeight: '500'
            }}>
              PNG, JPG, JPEG
            </div>
          </label>
          
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {preview && (
          <div style={{ 
            marginBottom: '24px', 
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '350px',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || analyzing}
          style={{
            background: analyzing 
              ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '18px 40px',
            border: 'none',
            borderRadius: '14px',
            fontSize: '17px',
            fontWeight: '700',
            cursor: analyzing ? 'not-allowed' : 'pointer',
            width: '100%',
            marginBottom: '24px',
            boxShadow: analyzing ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            if (!analyzing) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!analyzing) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {analyzing && (
            <span style={{
              display: 'inline-block',
              marginRight: '10px',
              animation: 'spin 1s linear infinite'
            }}>⏳</span>
          )}
          {analyzing ? t.analyzing : t.analyze}
        </button>

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            color: '#dc2626',
            padding: '18px 24px',
            borderRadius: '14px',
            marginBottom: '24px',
            border: '1px solid #fca5a5',
            animation: 'shake 0.5s ease-in-out'
          }}>
            <span style={{ fontSize: '20px', marginRight: '10px' }}>❌</span>
            {error}
          </div>
        )}

        {result && (
          <div style={{
            background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.6s ease-out'
          }}>
            <h3 style={{ 
              color: '#1e293b', 
              marginBottom: '20px',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              ✨ {t.analysisResult}
            </h3>

            <div style={{
              background: `linear-gradient(135deg, ${getAQIColor(result.estimated_aqi)}dd, ${getAQIColor(result.estimated_aqi)})`,
              color: result.estimated_aqi > 150 ? 'white' : '#1e293b',
              padding: '32px',
              borderRadius: '16px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)',
                pointerEvents: 'none'
              }}></div>
              
              <div style={{ 
                fontSize: '56px', 
                fontWeight: '800',
                marginBottom: '8px',
                position: 'relative',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                {result.estimated_aqi}
              </div>
              <div style={{ 
                fontSize: '20px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                position: 'relative'
              }}>
                {result.aqi_category}
              </div>
            </div>

            <div style={{ 
              marginBottom: '20px',
              padding: '20px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <strong style={{ 
                color: '#1e293b',
                fontSize: '16px',
                display: 'block',
                marginBottom: '10px'
              }}>
                📝 {t.description}:
              </strong>
              <p style={{ 
                marginTop: '8px', 
                color: '#475569',
                lineHeight: '1.6',
                fontSize: '15px'
              }}>
                {result.description}
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <strong style={{ 
                color: '#1e293b',
                fontSize: '16px',
                display: 'block',
                marginBottom: '12px'
              }}>
                💡 {t.recommendations}
              </strong>
              <ul style={{ 
                marginTop: '12px', 
                listStyle: 'none', 
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <li style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderRadius: '8px',
                  color: '#166534',
                  fontSize: '14px',
                  borderLeft: '3px solid #22c55e'
                }}>
                  <strong>👥 {t.healthy}</strong> {result.recommendations?.healthy || '—'}
                </li>
                <li style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '8px',
                  color: '#92400e',
                  fontSize: '14px',
                  borderLeft: '3px solid #f59e0b'
                }}>
                  <strong>⚠️ {t.sensitive}</strong> {result.recommendations?.sensitive || '—'}
                </li>
                <li style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  borderRadius: '8px',
                  color: '#1e40af',
                  fontSize: '14px',
                  borderLeft: '3px solid #3b82f6'
                }}>
                  <strong>👶 {t.children}</strong> {result.recommendations?.children || '—'}
                </li>
                <li style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                  borderRadius: '8px',
                  color: '#831843',
                  fontSize: '14px',
                  borderLeft: '3px solid #ec4899'
                }}>
                  <strong>👴 {t.elderly}</strong> {result.recommendations?.elderly || '—'}
                </li>
              </ul>
            </div>
          </div>
        )}
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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

export default PhotoUpload;