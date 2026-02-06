import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AQIForecast({ language = 'az' }) {
  const [forecastData, setForecastData] = useState(null);

  const translations = {
    az: {
      title: '📈 7 Günlük AQI Trendi',
      subtitle: 'Bakı - Nəsimi rayonu üçün keçmiş və gələcək AQI proqnozu',
      today: 'Bu gün',
      yesterday: 'Dünən',
      tomorrow: 'Sabah',
      trend: 'Trend Analizi:',
      increasing: '📈 AQI artır – ehtiyatlı olun',
      decreasing: '📉 AQI azalır – hava yaxşılaşır',
      stable: '➡️ AQI sabitdir',
      avgAqi: 'Orta AQI:',
      maxAqi: 'Maksimum:',
      minAqi: 'Minimum:'
    },
    en: {
      title: '📈 7-Day AQI Trend',
      subtitle: 'Past and future AQI forecast for Baku - Nesimi district',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      trend: 'Trend Analysis:',
      increasing: '📈 AQI increasing – be cautious',
      decreasing: '📉 AQI decreasing – air improving',
      stable: '➡️ AQI stable',
      avgAqi: 'Average AQI:',
      maxAqi: 'Maximum:',
      minAqi: 'Minimum:'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const generateForecast = () => {
      const today = new Date();
      const labels = [];
      const aqiValues = [];

      for (let i = -4; i <= 2; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        let label;
        if (i === -1) label = t.yesterday;
        else if (i === 0) label = t.today;
        else if (i === 1) label = t.tomorrow;
        else label = date.toLocaleDateString(language === 'az' ? 'az-AZ' : 'en-US', { month: 'short', day: 'numeric' });
        
        labels.push(label);

        const baseAqi = 75;
        const variation = Math.random() * 30 - 15;
        const trendEffect = i * -5;
        const aqi = Math.max(20, Math.min(200, baseAqi + variation + trendEffect));
        
        aqiValues.push(Math.round(aqi));
      }

      return { labels, aqiValues };
    };

    const data = generateForecast();
    setForecastData(data);
  }, [language, t.yesterday, t.today, t.tomorrow]);

  if (!forecastData) return <div>Yüklənir...</div>;

  const { labels, aqiValues } = forecastData;

  const firstHalf = aqiValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = aqiValues.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const trendDirection = secondHalf > firstHalf + 10 ? 'increasing' 
                       : secondHalf < firstHalf - 10 ? 'decreasing' 
                       : 'stable';

  const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const maxAqi = Math.max(...aqiValues);
  const minAqi = Math.min(...aqiValues);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'AQI',
        data: aqiValues,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
          gradient.addColorStop(1, 'rgba(102, 126, 234, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: aqiValues.map(aqi => {
          if (aqi <= 50) return '#00e400';
          if (aqi <= 100) return '#ffff00';
          if (aqi <= 150) return '#ff7e00';
          return '#ff0000';
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            const aqi = context.parsed.y;
            let category = language === 'az' 
              ? (aqi <= 50 ? 'Yaxşı' : aqi <= 100 ? 'Orta' : aqi <= 150 ? 'Həssaslar üçün pis' : 'Pis')
              : (aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy');
            return `AQI: ${aqi} (${category})`;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, max: 200, ticks: { stepSize: 50, color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { color: '#666', font: { weight: ctx => ctx.tick.label === t.today ? 'bold' : 'normal' } }, grid: { display: false } }
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '10px' }}>{t.title}</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>{t.subtitle}</p>

      <div style={{ height: '350px', marginBottom: '30px' }}>
        <Line data={chartData} options={options} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{t.avgAqi}</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{avgAqi}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{t.maxAqi}</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6b6b' }}>{maxAqi}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{t.minAqi}</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#51cf66' }}>{minAqi}</div>
        </div>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: trendDirection === 'increasing' ? '#fff3cd' : trendDirection === 'decreasing' ? '#d1ecf1' : '#e7e7e7',
        borderRadius: '15px',
        borderLeft: `4px solid ${trendDirection === 'increasing' ? '#ff9800' : trendDirection === 'decreasing' ? '#00bcd4' : '#999'}`
      }}>
        <strong>{t.trend}</strong> <span style={{ marginLeft: '10px' }}>{t[trendDirection]}</span>
      </div>
    </div>
  );
}

export default AQIForecast;