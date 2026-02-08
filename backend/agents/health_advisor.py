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
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        self.collector = DataCollector()
        self.conversation_history = []

    def get_health_advice(self, user_message, user_profile=None, language='az'):
        try:
            print(f'Sual: {user_message}')

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
            if language == 'en':
                system_prompt = f'''You are a MEDICAL AIR QUALITY ADVISOR AI in Azerbaijan (Google Gemini 3).

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
1. Answer in ENGLISH
2. Give SPECIFIC advice based on real AQI data
3. If user has medical condition, give SPECIAL attention
4. Write concise (5-10 sentences)
5. Use emojis (✅❌⚠️🏥💊🌤️)
6. If AQI is high, give CLEAR warning
7. Give concrete steps

User question: {user_message}

Answer in ENGLISH:'''
            else:
                system_prompt = f'''Sən Azərbaycanda hava keyfiyyəti üzrə TİBBİ MƏSLƏHƏTÇİ AI-san (Google Gemini 3).

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
1. Azərbaycan dilində cavab ver
2. Real AQI data-sına əsasən KONKRET məsləhət ver
3. Xəstəlik varsa XÜSUSİ diqqət göstər
4. Qısa yaz (5-10 cümlə)
5. Emoji istifadə et (✅❌⚠️🏥💊🌤️)
6. AQI yüksəkdirsə AÇIQ xəbərdarlıq ver
7. Konkret addımlar ver

İstifadəçi sualı: {user_message}

Cavab ver:'''

            # Gemini 3 çağır
            response = self.model.generate_content(system_prompt)
            ai_response = response.text

            print('✅ Gemini 3 cavab verdi')

            return {
                'response': ai_response,
                'current_aqi': aqi_data
            }

        except Exception as e:
            print(f'Xeta: {e}')
            if language == 'en':
                if avg_aqi <= 50:
                    fallback = f'✅ Air is clean (AQI {int(avg_aqi)}). You can go outside.'
                elif avg_aqi <= 100:
                    fallback = f'⚠️ Moderate (AQI {int(avg_aqi)}). Generally safe.'
                elif avg_aqi <= 150:
                    fallback = f'🟠 Unhealthy for sensitive (AQI {int(avg_aqi)}). Be cautious.'
                else:
                    fallback = f'❌ BAD AIR! (AQI {int(avg_aqi)}). Stay indoors!'
                if user_condition and 'asthma' in user_condition.lower():
                    fallback += ' Be extra careful with asthma.'
            else:
                if avg_aqi <= 50:
                    fallback = f'✅ Hava təmizdir (AQI {int(avg_aqi)}). Çölə çıxa bilərsiniz.'
                elif avg_aqi <= 100:
                    fallback = f'⚠️ Orta səviyyə (AQI {int(avg_aqi)}). Ümumiyyətlə təhlükəsizdir.'
                elif avg_aqi <= 150:
                    fallback = f'🟠 Həssaslar üçün pis (AQI {int(avg_aqi)}). Ehtiyatlı olun.'
                else:
                    fallback = f'❌ PİS HAVA! (AQI {int(avg_aqi)}). Evdə qalın!'
                if user_condition and 'astma' in user_condition.lower():
                    fallback += ' Astmanız olduğu üçün xüsusilə diqqətli olun.'
            
            return {
                'response': fallback,
                'current_aqi': aqi_data
            }

    def reset_conversation(self):
        self.conversation_history = []
        print('Sohbet tarixcesi silindi')