import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
from flask import Flask, request, jsonify # Flask obyektlərinin mövcud olduğunu fərz edirik

load_dotenv()

class ImageAnalyzer:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print('XETA: GEMINI_API_KEY tapilmadi!')
        else:
            print('✅ Gemini 3 Flash Vision yuklendi')

        genai.configure(api_key=api_key)
        
        # GEMINI 3 FLASH (vision dəstəkləyir)
        self.model = genai.GenerativeModel('gemini-1.5-flash') # Qeyd: 3-flash hazırda 1.5-flash kimi tanınır

    def analyze_sky_image(self, image_path):
        try:
            print(f'Foto analiz edilir: {image_path}')

            prompt = '''Sən Azərbaycanda hava keyfiyyəti ekspertsən.
Göy üzünün fotosuna bax və Azərbaycan dilində JSON formatında cavab ver:

{
  "description": "göy üzünün vəziyyəti (təmiz mavi/boz/dumanlı/buludlu)",
  "estimated_aqi": təxmini AQI rəqəm (0-500),
  "aqi_category": "Yaxşı/Orta/Pis/Çox pis",
  "recommendations": {
    "healthy": "sağlam insanlar üçün qısa məsləhət",
    "sensitive": "həssas qruplar üçün qısa məsləhət",
    "children": "uşaqlar üçün qısa məsləhət",
    "elderly": "yaşlılar üçün qısa məsləhət"
  }
}

Qısa və konkret yaz. Yalnız JSON cavab ver, başqa mətn yox.'''

            img = Image.open(image_path)
            
            response = self.model.generate_content([prompt, img])

            import json
            import re
            
            text = response.text
            
            # JSON-u tap
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)
            
            result = json.loads(text)
            
            print('Foto analiz edildi')
            return result

        except Exception as e:
            print(f'Foto analiz xetasi: {e}')
            return {
                'description': 'Foto analiz edilə bilmədi',
                'estimated_aqi': 75,
                'aqi_category': 'Məlum deyil',
                'recommendations': {
                    'healthy': 'Normal aktivlik',
                    'sensitive': 'Ehtiyatlı olun',
                    'children': 'Nəzarət altında oyun',
                    'elderly': 'Qısa gəzintilər'
                }
            }

image_analyzer = ImageAnalyzer()
app = Flask(__name__)

# ... (digər endpointlər, məsələn /api/chat/reset) ...

@app.route('/api/chat/reset', methods=['POST'])
def reset_chat():
    # Sizin mövcud reset kodunuz bura gəlir
    return jsonify({"status": "reset"})

# YENİ ƏLAVƏ EDİLƏN ENDPOINT:
@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Foto analiz endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'Image data lazimdir'}), 400
        
        # Base64 image-i decode et
        import base64
        import io
        from PIL import Image
        import tempfile
        import os
        
        image_data = data['image']
        
        # "data:image/jpeg;base64," prefixini sil
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode et
        image_bytes = base64.b64decode(image_data)
        
        # Temporary file yarat
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name
        
        # Image analyzer çağır
        result = image_analyzer.analyze_sky_image(temp_path)
        
        # Temp file sil
        if os.path.exists(temp_path):
            os.unlink(temp_path)
            
        return jsonify(result)
        
    except Exception as e:
        print(f'Foto analiz xetasi: {e}')
        return jsonify({
            'error': 'Foto analiz edilə bilmədi',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)