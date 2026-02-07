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
        
        # GEMINI 3 FLASH
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        
        self.collector = DataCollector()
        self.conversation_history = []

    def get_health_advice(self, user_message, user_profile=None):
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

            # İstifadəçi profili
            user_condition = user_profile.get('condition', '') if user_profile else ''
            user_location = user_profile.get('location', '') if user_profile else ''

            # SYSTEM PROMPT
            system_prompt = f'''Sən Azərbaycanda hava keyfiyyəti üzrə TİBBİ MƏSLƏHƏTÇİ AI-san (Google Gemini 3).

HAZıRKı REAL-TIME AQI DATA (Bakı, bu gün):
{chr(10).join([f"• {loc}: AQI {aqi}" for loc, aqi in aqi_data.items()])}
- Ortalama AQI: {int(avg_aqi)}

AQI KATEQORİYALARI:
- 0-50: Yaxşı ✅ (hamı üçün təhlükəsiz)
- 51-100: Orta ⚠️ (həssas insanlar ehtiyatlı olsun)
- 101-150: Həssaslar üçün pis 🟠 (astmalılar, uşaqlar, yaşlılar risk altında)
- 151-200: Pis ❌ (hamı üçün təhlükəlidir)
- 201+: Çox pis 🚫 (evdə qalın, maska taxın)

İSTİFADƏÇİ PROFİLİ:
- Xəstəlik: {user_condition if user_condition else 'məlum deyil'}
- Rayon: {user_location if user_location else 'bütün Bakı'}

TAPŞıRIQ:
1. İstifadəçinin sualına Azərbaycan dilində cavab ver
2. Real AQI data-sına əsasən KONKRET məsləhət ver
3. Əgər xəstəlik varsa (astma, hamilə, uşaq və s.) XÜSUSİ diqqət göstər
4. Qısa və praktik yaz (5-10 cümlə)
5. Emoji istifadə et (✅❌⚠️🏥💊🌤️)
6. AQI yüksəkdirsə AÇIQ xəbərdarlıq ver
7. Konkret addımlar ver (nə etməli, nə etməməli)

İstifadəçi sualı: {user_message}

Cavab ver (Azərbaycan dilində):'''

            # GEMINI 3 API ÇAĞIRIŞI
            response = self.model.generate_content(system_prompt)

            ai_response = response.text

            print('✅ Gemini 3 cavab verdi')

            return {
                'response': ai_response,
                'current_aqi': aqi_data
            }

        except Exception as e:
            print(f'Xeta: {e}')
            # Fallback cavab
            if avg_aqi <= 50:
                fallback = f'✅ Hava təmizdir (AQI {int(avg_aqi)}). Çölə çıxa bilərsiniz.'
            elif avg_aqi <= 100:
                fallback = f'⚠️ Orta səviyyə (AQI {int(avg_aqi)}). Ümumiyyətlə təhlükəsizdir, amma həssas insanlar ehtiyatlı olsun.'
            elif avg_aqi <= 150:
                fallback = f'🟠 Həssaslar üçün pis (AQI {int(avg_aqi)}). Astmalılar, uşaqlar və yaşlılar uzun müddət çöldə qalmasın.'
            else:
                fallback = f'❌ PİS HAVA! (AQI {int(avg_aqi)}). Evdə qalın, çölə çıxmayın!'
            
            if user_condition and 'astma' in user_condition.lower():
                fallback += ' Astmanız olduğu üçün xüsusilə diqqətli olun, inhaler yanınızda olsun.'
            
            return {
                'response': fallback,
                'current_aqi': aqi_data
            }

    def reset_conversation(self):
        self.conversation_history = []
        print('Sohbet tarixcesi silindi')