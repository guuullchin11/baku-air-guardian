from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import sys
from agents.health_advisor import HealthAdvisor
from werkzeug.utils import secure_filename

# Layihənin kök qovluğunu (backend) tap və sys.path-ə əlavə et
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# İndi agents import et
from agents.image_analyzer import ImageAnalyzer
from agents.data_collector import DataCollector

app = Flask(__name__)
CORS(app)

# Upload parametrləri
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

collector = DataCollector()
analyzer = ImageAnalyzer()
advisor = HealthAdvisor()

# Azərbaycanın şəhər və rayonları
AZERBAIJAN_LOCATIONS = {
    # BAKI RAYONLARI
    'Bakı - Nəsimi': {'lat': 40.3947, 'lon': 49.8822, 'city': 'Bakı'},
    'Bakı - Nərimanov': {'lat': 40.4015, 'lon': 49.8539, 'city': 'Bakı'},
    'Bakı - Səbail': {'lat': 40.3656, 'lon': 49.8354, 'city': 'Bakı'},
    'Bakı - Yasamal': {'lat': 40.3917, 'lon': 49.8064, 'city': 'Bakı'},
    'Bakı - Binəqədi': {'lat': 40.4550, 'lon': 49.8203, 'city': 'Bakı'},
    'Bakı - Xətai': {'lat': 40.3800, 'lon': 49.8100, 'city': 'Bakı'},
    'Bakı - Suraxanı': {'lat': 40.4200, 'lon': 50.0100, 'city': 'Bakı'},
    'Bakı - Sabunçu': {'lat': 40.4400, 'lon': 49.9500, 'city': 'Bakı'},
    'Bakı - Xəzər': {'lat': 40.4700, 'lon': 50.0300, 'city': 'Bakı'},
    'Bakı - Qaradağ': {'lat': 40.3500, 'lon': 49.7000, 'city': 'Bakı'},

    # DİGƏR ƏSAS ŞƏHƏRLƏR
    'Gəncə': {'lat': 40.6828, 'lon': 46.3606, 'city': 'Gəncə'},
    'Sumqayıt': {'lat': 40.5897, 'lon': 49.6686, 'city': 'Sumqayıt'},
    'Mingəçevir': {'lat': 40.7703, 'lon': 47.0497, 'city': 'Mingəçevir'},
    'Şirvan': {'lat': 39.9372, 'lon': 48.9208, 'city': 'Şirvan'},
    'Lənkəran': {'lat': 38.7542, 'lon': 48.8508, 'city': 'Lənkəran'},
    'Naxçıvan': {'lat': 39.2090, 'lon': 45.4120, 'city': 'Naxçıvan'},
    'Şəki': {'lat': 41.1919, 'lon': 47.1706, 'city': 'Şəki'},
}

def allowed_file(filename):
    """Yalnız icazə verilən fayl tiplərini yoxlayır"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ===========================================
# ✅ 1. ROOT ENDPOINT - BU ÇOX VACİB!
# ===========================================
@app.route('/')
def home():
    """Ana səhifə"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Baku Air Guardian API</title>
        <meta charset="utf-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            h1 {
                color: #fff;
                text-align: center;
            }
            .endpoint {
                background: rgba(255, 255, 255, 0.2);
                padding: 15px;
                margin: 10px 0;
                border-radius: 10px;
            }
            code {
                background: rgba(0, 0, 0, 0.3);
                padding: 2px 5px;
                border-radius: 4px;
            }
            a {
                color: #4fc3f7;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Baku Air Guardian API</h1>
            <p>Backend server işləyir! Aşağıdakı endpointlərdən istifadə edə bilərsiniz:</p>
            
            <div class="endpoint">
                <h3>📊 AQI Endpointləri</h3>
                <p><code>GET /api/health</code> - Server status</p>
                <p><code>GET /api/aqi</code> - Bütün rayonların AQI məlumatı</p>
                <p><code>GET /api/aqi/{rayon_adı}</code> - Xüsusi rayonun AQI məlumatı</p>
            </div>
            
            <div class="endpoint">
                <h3>🤖 AI Chat Endpointləri</h3>
                <p><code>POST /api/chat</code> - AI ilə söhbət</p>
                <p><code>POST /api/chat/reset</code> - Söhbəti sıfırla</p>
                <p><code>POST /api/analyze-image</code> - Şəkil analizi</p>
            </div>
            
            <div class="endpoint">
                <h3>🔗 Frontend Linkləri</h3>
                <p><a href="https://baku-air-guardian.vercel.app" target="_blank">Frontend Səhifəsi</a></p>
                <p><a href="https://github.com/guullchinin1/baku-air-guardian" target="_blank">GitHub Repo</a></p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <p>🚨 Hackathon proyekti - © 2024 Baku Air Guardian</p>
                <p>🔥 Developed with AI Assistance</p>
            </div>
        </div>
    </body>
    </html>
    '''

# ===========================================
# 2. API ENDPOINTS
# ===========================================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Backend işləyir!'})

@app.route('/api/aqi', methods=['GET'])
def get_all_aqi():
    results = {}
    for district, coords in AZERBAIJAN_LOCATIONS.items():
        aqi_data = collector.get_aqi_for_location(coords['lat'], coords['lon'])
        if aqi_data:
            results[district] = aqi_data
    return jsonify(results)

@app.route('/api/aqi/<district>', methods=['GET'])
def get_district_aqi(district):
    if district not in AZERBAIJAN_LOCATIONS:
        return jsonify({'error': 'Rayon tapılmadı'}), 404
    coords = AZERBAIJAN_LOCATIONS[district]
    aqi_data = collector.get_aqi_for_location(coords['lat'], coords['lon'])
    if aqi_data:
        return jsonify(aqi_data)
    else:
        return jsonify({'error': 'AQI data alınmadı'}), 500

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Foto yüklə və hava keyfiyyətini analiz et"""
    if 'image' not in request.files:
        return jsonify({'error': 'Foto yüklənilmədi'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Fayl seçilmədi'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Yalnız png, jpg, jpeg, gif faylları qəbul olunur'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        result = analyzer.analyze_sky_image(filepath)

        if result:
            return jsonify({
                'success': True,
                'estimated_aqi': result.get('aqi', 'təxmin edilə bilmədi'),
                'description': result.get('description', 'Təhlil nəticəsi'),
                'recommendation': result.get('recommendation', 'Tövsiyə yoxdur')
            })
        else:
            return jsonify({'error': 'Şəkil təhlil edilə bilmədi'}), 500

    except Exception as e:
        return jsonify({'error': f'Təhlil zamanı xəta baş verdi: {str(e)}'}), 500

    finally:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass

# ===========================================
# 3. CHAT ENDPOINTS
# ===========================================
@app.route('/api/chat', methods=['POST'])
def chat():
    '''AI ile sohbet'''
    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({'error': 'Mesaj gonderilmedi'}), 400

    user_message = data['message']
    user_profile = data.get('profile', None)

    # AI-dan cavab al
    result = advisor.get_health_advice(user_message, user_profile)

    return jsonify(result)

@app.route('/api/chat/reset', methods=['POST'])
def reset_chat():
    '''Sohbeti sifirla'''
    advisor.reset_conversation()
    return jsonify({'status': 'ok', 'message': 'Sohbet silinib'})


@app.route('/api/compare', methods=['POST'])
def compare_districts():
    """Rayon müqayisəsi - Gemini 3"""
    try:
        data = request.get_json()
        
        loc1 = data.get('location1')
        loc2 = data.get('location2')
        lang = data.get('language', 'az')
        
        if not loc1 or not loc2:
            return jsonify({'error': 'Rayonlar lazimdir'}), 400
        
        # Gemini 3-dən müqayisə al
        if lang == 'az':
            prompt = f"""İki rayonun hava keyfiyyətini müqayisə et və Azərbaycan dilində cavab ver:

📍 {loc1['name']}: AQI {loc1['aqi']}
📍 {loc2['name']}: AQI {loc2['aqi']}

TAPŞIRIQ:
1. Hansı rayon daha təmizdir açıqla
2. Fərq nə qədərdir (faiz və ya rəqəm)
3. Hər rayon üçün tövsiyə ver
4. Konkret və qısa yaz (5-8 cümlə)
5. Emoji istifadə et

Cavab ver:"""
        else:
            prompt = f"""Compare air quality of two districts and respond in English:

📍 {loc1['name']}: AQI {loc1['aqi']}
📍 {loc2['name']}: AQI {loc2['aqi']}

TASK:
1. Which district has cleaner air?
2. What's the difference (percentage or number)?
3. Give recommendations for each
4. Be concrete and brief (5-8 sentences)
5. Use emojis

Response:"""
        
        # Gemini 3 çağır
        response = health_advisor.model.generate_content(prompt)
        ai_analysis = response.text
        
        return jsonify({
            'ai_analysis': ai_analysis,
            'location1': loc1,
            'location2': loc2
        })
        
    except Exception as e:
        print(f'Compare xetasi: {e}')
        return jsonify({
            'ai_analysis': '⚠️ Texniki problem. Zəhmət olmasa yenidən cəhd edin.'
        }), 500
# ===========================================
# 4. STATIC FAYLLAR (ƏGƏR FRONTEND VARSA)
# ===========================================
@app.route('/test')
def test_page():
    """Test səhifəsi"""
    return '''
    <h1>Test Page</h1>
    <p>Backend işləyir!</p>
    <p><a href="/api/health">Health Check</a></p>
    <p><a href="/api/aqi">AQI Data</a></p>
    '''


from agents.health_advisor import HealthAdvisor
from agents.image_analyzer import ImageAnalyzer
from agents.data_collector import DataCollector

# Instance-ları yarat
health_advisor = HealthAdvisor()
image_analyzer = ImageAnalyzer()
data_collector = DataCollector()

app = Flask(__name__)
CORS(app)
# ===========================================
# RUN SERVER
# ===========================================
if __name__ == '__main__':
    # Render.com üçün portu environment dəyişənindən al
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)