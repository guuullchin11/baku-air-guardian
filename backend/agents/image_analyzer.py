import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

class ImageAnalyzer:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print('XETA: GEMINI_API_KEY tapilmadi!')
        else:
            print('Gemini Vision API yuklendi')

        genai.configure(api_key=api_key)
        
        # Gemini 1.5 Flash vision dəstəkləyir
        self.model = genai.GenerativeModel('gemini-pro-vision')

    def analyze_sky_image(self, image_path):
        try:
            print(f'Foto analiz edilir: {image_path}')

            prompt = '''
Sən Azərbaycanda hava keyfiyyəti ekspertsən.
Göy üzünün fotosuna bax və Azərbaycan dilində JSON formatında cavab ver:

{
  "description": "göy üzünün vəziyyəti (mavi/boz/dumanlı)",
  "estimated_aqi": təxmini AQI rəqəm (0-500),
  "aqi_category": "Yaxşı/Orta/Pis",
  "recommendations": {
    "healthy": "sağlam insanlar üçün məsləhət",
    "sensitive": "həssas qruplar üçün məsləhət",
    "children": "uşaqlar üçün məsləhət",
    "elderly": "yaşlılar üçün məsləhət"
  }
}

Qısa və aydın yaz.
'''

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
                'estimated_aqi': 0,
                'aqi_category': 'Məlum deyil',
                'recommendations': {
                    'healthy': 'Foto analiz xətası',
                    'sensitive': 'Foto analiz xətası',
                    'children': 'Foto analiz xətası',
                    'elderly': 'Foto analiz xətası'
                }
            }