from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
from agents.health_advisor import HealthAdvisor
from werkzeug.utils import secure_filename

# Layihənin kök qovluğunu (backend) tap və sys.path-ə əlavə et
# Bu sətir agents qovluğunu tapa bilməsi üçün lazımdır
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

# ======================================================
# ✅ YENİ CHAT ENDPOINT-LƏRİ (SONA ƏLAVƏ EDİLDİ)
# ======================================================

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
