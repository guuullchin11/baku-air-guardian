import google.generativeai as genai
import os
from dotenv import load_dotenv
from agents.data_collector import DataCollector

load_dotenv()

class HealthAdvisor:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print('XETA: GEMINI_API_KEY tapilmadi!')
        else:
            print('Gemini Health Advisor yuklendi')

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.collector = DataCollector()
        self.conversation_history = []

    def get_health_advice(self, user_message, user_profile=None):
        try:
            print(f'Sual: {user_message}')

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

            system_prompt = f'''
Sen Azərbaycanda hava keyfiyyəti üzrə tibbi məsləhətçi AI-san.

HAZıRKı REAL-TIME AQI DATA (Bakı rayonları):
{aqi_data}

AQI KATEQORİYALARı:
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

            response = self.model.generate_content(
                f"{system_prompt}\n\nİstifadəçi sualı: {user_message}"
            )

            ai_response = response.text

            self.conversation_history.append({'role': 'user', 'content': user_message})
            self.conversation_history.append({'role': 'assistant', 'content': ai_response})

            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]

            print('Cavab hazir')

            return {
                'response': ai_response,
                'current_aqi': aqi_data
            }

        except Exception as e:
            print(f'Xeta: {e}')
            return {
                'response': 'Texniki problem yaşandı. Zəhmət olmasa yenidən cəhd edin.',
                'current_aqi': {}
            }

    def reset_conversation(self):
        self.conversation_history = []
        print('Sohbet tarixcesi silinib')