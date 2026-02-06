import React, { useState } from 'react';
import axios from 'axios';

function ChatBot({ language = 'az' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    condition: '',
    location: ''
  });

  const translations = {
    az: {
      title: '💬 AI Sağlamlıq Məsləhətçisi',
      subtitle: 'Hava keyfiyyəti haqqında sual verin',
      condition: 'Xəstəlik (məs: astma)',
      location: 'Rayon (məs: Nəsimi)',
      placeholder: 'Sual yazın...',
      messagePlaceholder: 'Məsələn: Astmalıyam, bu gün çölə çıxa bilərəmmi?',
      send: 'Göndər',
      reset: 'Yenilə',
      you: 'Siz',
      ai: 'AI Məsləhətçi',
      emptyChat: 'Sual verin...',
      errorMessage: 'Xəta baş verdi. Backend işləyirmi yoxlayın.'
    },
    en: {
      title: '💬 AI Health Advisor',
      subtitle: 'Ask questions about air quality',
      condition: 'Condition (e.g.: asthma)',
      location: 'District (e.g.: Nesimi)',
      placeholder: 'Type your question...',
      messagePlaceholder: 'E.g.: I have asthma, can I go outside today?',
      send: 'Send',
      reset: 'Reset',
      you: 'You',
      ai: 'AI Advisor',
      emptyChat: 'Ask a question...',
      errorMessage: 'Error occurred. Check if backend is running.'
    }
  };

  const t = translations[language];

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        profile: userProfile.condition || userProfile.location ? userProfile : null
      });

      const aiMessage = {
        role: 'ai',
        content: response.data.response,
        aqi_data: response.data.current_aqi
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg = { role: 'ai', content: t.errorMessage };
      setMessages(prev => [...prev, errorMsg]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    try {
      await axios.post('http://localhost:5000/api/chat/reset');
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Profile Inputs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px'
      }}>
        <input
          type="text"
          placeholder={t.condition}
          value={userProfile.condition}
          onChange={(e) => setUserProfile({...userProfile, condition: e.target.value})}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <input
          type="text"
          placeholder={t.location}
          value={userProfile.location}
          onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Messages */}
      <div style={{
        height: '400px',
        overflowY: 'auto',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '10px'
      }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '150px' }}>
            {t.emptyChat}
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '15px',
              textAlign: msg.role === 'user' ? 'right' : 'left'
            }}
          >
            <div style={{
              display: 'inline-block',
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '15px',
              backgroundColor: msg.role === 'user' ? '#667eea' : '#fff',
              color: msg.role === 'user' ? 'white' : '#333',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              textAlign: 'left'
            }}>
              <strong style={{ fontSize: '12px', opacity: 0.8 }}>
                {msg.role === 'user' ? t.you : t.ai}
              </strong>
              <p style={{ margin: '5px 0 0 0' }}>{msg.content}</p>

              {msg.aqi_data && Object.keys(msg.aqi_data).length > 0 && (
                <div style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  opacity: 0.8,
                  borderTop: '1px solid #eee',
                  paddingTop: '8px'
                }}>
                  <strong>Real-time AQI:</strong>
                  {Object.entries(msg.aqi_data).slice(0, 3).map(([loc, aqi]) => (
                    <div key={loc}>{loc}: {aqi}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: '12px 16px',
              borderRadius: '15px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#667eea' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#667eea' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#667eea' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={t.messagePlaceholder}
          style={{
            flex: 1,
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '10px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {t.send}
        </button>
        <button
          onClick={resetChat}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
}

export default ChatBot;