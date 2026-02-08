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
            print('✅ Gemini 3 Flash yuklendi')

        genai.configure(api_key=api_key)
        # Qeyd: 3-flash-preview stabil deyilse 'gemini-1.5-flash' istifadə edə bilərsən
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.collector = DataCollector()
        self.conversation_history = []

    def get_health_advice(self, user_message, user_profile=None, language='az'):
        try:
            # Dil seçimini daha dözümlü edirik (məs: 'en-US' gəlsə də 'en' kimi tanısın)
            target_lang = 'en' if language.lower().startswith('en') else 'az'
            print(f'Sual: {user_message} | Seçilən Dil: {target_lang}')

            # AQI data al
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

            avg_aqi = sum(aqi_data.values()) / len(aqi_data) if aqi_data else 75
            user_condition = user_profile.get('condition', '') if user_profile else ''
            user_location = user_profile.get('location', '') if user_profile else ''

            # SYSTEM PROMPT
            if target_lang == 'en':
                system_prompt = f'''STRICT RULE: YOU MUST ANSWER EVERYTHING IN ENGLISH ONLY.
You are a MEDICAL AIR QUALITY ADVISOR AI in Azerbaijan.

CURRENT REAL-TIME AQI DATA (Baku, today):
{chr(10).join([f"• {loc}: AQI {aqi}" for loc, aqi in aqi_data.items()])}
- Average AQI: {int(avg_aqi)}

AQI CATEGORIES:
- 0-50: Good ✅
- 51-100: Moderate ⚠️
- 101-150: Unhealthy for Sensitive Groups 🟠
- 151-200: Unhealthy ❌
- 201+: Very Unhealthy 🚫

USER PROFILE:
- Condition: {user_condition if user_condition else 'none'}
- Location: {user_location if user_location else 'all Baku'}

TASK:
1. MANDATORY: Answer in ENGLISH. Do not use Azerbaijani.
2. Give SPECIFIC medical advice based on real AQI data above.
3. If user has medical condition, give SPECIAL attention.
4. Write concise (5-10 sentences).
5. Use emojis (✅❌⚠️🏥💊🌤️).

User question: {user_message}
Answer (in ENGLISH):'''
            else:
                system_prompt = f'''QAYDA: YALNIZ AZƏRBAYCAN DİLİNDƏ CAVAB VER.
Sən Azərbaycanda hava keyfiyyəti üzrə TİBBİ MƏSLƏHƏTÇİ AI-san.

HAZıRKı REAL-TIME AQI DATA (Bakı, bu gün):
{chr(10).join([f"• {loc}: AQI {aqi}" for loc, aqi in aqi_data.items()])}
- Ortalama AQI: {int(avg_aqi)}

AQI KATEQORİYALARI:
- 0-50: Yaxşı ✅
- 51-100: Orta ⚠️
- 101-150: Həssaslar üçün pis 🟠
- 151-200: Pis ❌
- 201+: Çox pis 🚫

İSTİFADƏÇİ PROFİLİ:
- Xəstəlik: {user_condition if user_condition else 'məlum deyil'}
- Rayon: {user_location if user_location else 'bütün Bakı'}

TAPŞıRIQ:
1. Azərbaycan dilində cavab ver.
2. Real AQI data-sına əsasən KONKRET məsləhət ver.
3. Xəstəlik varsa XÜSUSİ diqqət göstər.
4. Qısa yaz (5-10 cümlə).
5. Emoji istifadə et.

İstifadəçi sualı: {user_message}
Cavab ver:'''

            # Gemini çağır
            response = self.model.generate_content(system_prompt)
            ai_response = response.text

            print('✅ Gemini cavab verdi')

            return {
                'response': ai_response,
                'current_aqi': aqi_data
            }

        except Exception as e:
            print(f'Xeta: {e}')
            # Fallback (Xəta baş verərsə sadə cavab)
            if target_lang == 'en':
                fallback = f"The current average AQI is {int(avg_aqi)}. Please be careful."
            else:
                fallback = f"Hazırkı ortalama AQI {int(avg_aqi)} səviyyəsindədir. Ehtiyatlı olun."
            
            return {
                'response': fallback,
                'current_aqi': aqi_data
            }

    def reset_conversation(self):
        self.conversation_history = []
        print('Sohbet tarixcesi silindi')