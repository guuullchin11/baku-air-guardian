import google.generativeai as genai
import os
from dotenv import load_dotenv
from agents.data_collector import DataCollector
import requests
import json

load_dotenv()

class HealthAdvisor:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print('XƏTA: GEMINI_API_KEY tapılmadı!')
            self.api_key = None
        else:
            print('Gemini Health Advisor yükləndi')
            self.api_key = api_key
        
        self.collector = DataCollector()
        self.conversation_history = []
        
        # Model adını BURADA dəyiş - ÇOX VACİB!!!
        self.model_name = "gemini-1.5-flash"  # YA "gemini-1.5-flash-latest"
        
        if self.api_key:
            # SDK ilə konfiqurasiya
            genai.configure(api_key=self.api_key)

    def get_health_advice(self, user_message, user_profile=None):
        try:
            print(f'Sual: {user_message}')

            # 1. AQI məlumatlarını al
            locations = {
                'Nesimi': {'lat': 40.3947, 'lon': 49.8822},
                'Nerimanov': {'lat': 40.4015, 'lon': 49.8539},
                'Sebail': {'lat': 40.3656, 'lon': 49.8354},
                'Yasamal': {'lat': 40.3917, 'lon': 49.8064},
                'Binegedi': {'lat': 40.4550, 'lon': 49.8203},
            }

            aqi_data = {}
            for loc, coords in locations.items():
                data = self.collector.get_aqi_for_location(coords['lat'], coords['lon'])
                if data:
                    aqi_data[loc] = data['aqi']
                    print(f'AQI data alındı: {coords["lat"]}, {coords["lon"]}')
                    print(f'AQI alındı: {data["aqi"]}')

            # 2. API açarı yoxla
            if not self.api_key:
                return {
                    'response': 'API açarı yoxdur. Fallback məsləhət: Hava normaldır, lakin məlumat yoxdur.',
                    'current_aqi': aqi_data
                }

            # 3. AI cavabını al - 2 ÜSULLA
            ai_response = self._get_ai_response(user_message, aqi_data, user_profile)

            # 4. Konversasiya tarixçəsi
            self.conversation_history.append({'role': 'user', 'content': user_message})
            self.conversation_history.append({'role': 'assistant', 'content': ai_response})

            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]

            print('Cavab hazır')

            return {
                'response': ai_response,
                'current_aqi': aqi_data
            }

        except Exception as e:
            print(f'Xəta: {str(e)}')
            return {
                'response': 'Texniki problem yaşandı. Zəhmət olmasa yenidən cəhd edin.',
                'current_aqi': {}
            }

    def _get_ai_response(self, user_message, aqi_data, user_profile):
        """AI cavabını al - 2 fərqli üsulla"""
        
        # System prompt hazırla
        system_prompt = f'''
Sen Azərbaycanda hava keyfiyyəti üzrə tibbi məsləhətçi AI-san.

HAZIRKI REAL-TIME AQI DATA (Bakı rayonları):
{aqi_data}

AQI KATEQORİYALARI:
- 0-50: Yaxşı (hamı üçün təhlükəsizdir)
- 51-100: Orta (çox həssas insanlar üçün az risk)
- 101-150: Həssaslar üçün pis (astmalılar, uşaqlar, yaşlılar ehtiyatlı olsun)
- 151-200: Pis (hamı üçün sağlamlıq riski, çölə çıxmaq məsləhət deyil)
- 201-300: Çox pis (ciddi sağlamlıq riski)
- 300+: Təhlükəli (evdə qal, maska tax)

İstifadəçi profili: {user_profile if user_profile else 'məlum deyil'}

İstifadəçinin sualına Azərbaycan dilində cavab ver:
1. Real-time AQI data-sına əsasən cavab ver
2. İstifadəçinin profili varsa (astma, hamilə, uşaq), ona görə personalized məsləhət ver
3. Konkret rayonlar üçün məsləhət ver
4. Dostcasına, empatik tonla yaz
5. Əgər təhlükə varsa, AÇIQ XƏBƏRDARLIQ ver

Qısa və aydın cavab ver (3-5 cümlə).
'''

        full_prompt = f"{system_prompt}\n\nİstifadəçi sualı: {user_message}"
        
        try:
            # ÜSUL 1: SDK ilə cəhd edək
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(full_prompt)
            return response.text
            
        except Exception as sdk_error:
            print(f"SDK xətası: {str(sdk_error)}")
            
            # ÜSUL 2: Direct REST API
            try:
                return self._call_gemini_api(full_prompt)
            except Exception as api_error:
                print(f"API xətası: {str(api_error)}")
                
                # ÜSUL 3: Fallback məsləhət
                return self._get_fallback_advice(aqi_data)

    def _call_gemini_api(self, prompt):
        """Direct REST API çağırışı"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        
        headers = {"Content-Type": "application/json"}
        
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 500
            }
        }
        
        # URL-ə API key əlavə et
        full_url = f"{url}?key={self.api_key}"
        
        response = requests.post(full_url, headers=headers, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            return result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            raise Exception(f"API xətası: {response.status_code} - {response.text}")

    def _get_fallback_advice(self, aqi_data):
        """API işləməyəndə əsas məsləhətlər"""
        if not aqi_data:
            return "Məlumat yoxdur. Ümumi tövsiyə: Həssaslığınız varsa, çöldə maska istifadə edin."
        
        # Ortalama AQI hesabla
        avg_aqi = sum(aqi_data.values()) / len(aqi_data) if aqi_data else 75
        
        if avg_aqi <= 50:
            return "✅ Hava yaxşıdır! Çölə çıxa bilərsiniz. Təbiət gəzintisi üçün mükəmməl şərait."
        elif avg_aqi <= 100:
            return "⚠️ Hava mülayimdir. Həssas qruplar (uşaqlar, yaşlılar, astma xəstələri) ehtiyatlı olmalıdır."
        elif avg_aqi <= 150:
            return "🔶 Hava sağlamlığa zərərlidir. Uzun müddətli xarici fəaliyyətlərdən çəkinin."
        else:
            return "🔴 Hava təhlükəlidir! Çölə çıxmaqdan çəkinin. Pəncərələri bağlı saxlayın."

    def reset_conversation(self):
        self.conversation_history = []
        print('Söhbət tarixçəsi silindi')