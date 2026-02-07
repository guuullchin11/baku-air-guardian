import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
import requests
import json
import re

load_dotenv()

class ImageAnalyzer:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print('XƏTA: GEMINI_API_KEY tapılmadı!')
            self.api_key = None
        else:
            print('Gemini Vision API yükləndi')
            self.api_key = api_key
        
        # Model adını DƏYİŞ - Vision üçün
        self.model_name = "gemini-1.5-flash"  # Gemini 1.5 Flash həm text, həm də vision dəstəkləyir

    def analyze_sky_image(self, image_path):
        try:
            print(f'Foto analiz edilir: {image_path}')
            
            if not self.api_key:
                return self._get_fallback_result("API açarı yoxdur")

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
YALNIZ JSON formatında cavab ver.
'''

            img = Image.open(image_path)
            
            try:
                # ÜSUL 1: SDK ilə
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content([prompt, img])
                text = response.text
                
            except Exception as sdk_error:
                print(f"SDK xətası: {str(sdk_error)}")
                
                # ÜSUL 2: Direct API
                text = self._call_vision_api(image_path, prompt)
            
            # JSON-u tap və parse et
            result = self._parse_json_response(text)
            
            print('Foto analiz edildi')
            return result

        except Exception as e:
            print(f'Foto analiz xətası: {str(e)}')
            return self._get_fallback_result(str(e))

    def _call_vision_api(self, image_path, prompt):
        """Direct Vision API çağırışı"""
        import base64
        
        # Şəkili base64-ə çevir
        with open(image_path, "rb") as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        
        headers = {"Content-Type": "application/json"}
        
        data = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": encoded_image
                        }
                    }
                ]
            }]
        }
        
        full_url = f"{url}?key={self.api_key}"
        
        response = requests.post(full_url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            raise Exception(f"Vision API xətası: {response.status_code}")

    def _parse_json_response(self, text):
        """Cavabdan JSON çıxar"""
        try:
            # JSON hissəsini tap
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
            else:
                # JSON yoxdursa, manual parse et
                return self._extract_info_from_text(text)
        except Exception as e:
            print(f"JSON parse xətası: {str(e)}")
            return self._get_fallback_result("JSON parse xətası")

    def _extract_info_from_text(self, text):
        """Mətndən məlumat çıxar"""
        description = "Göy üzü təhlil edilir"
        estimated_aqi = 75
        
        # Mətndən AQI rəqəmini tapmağa cəhd et
        numbers = re.findall(r'\b\d{1,3}\b', text)
        if numbers:
            for num in numbers:
                n = int(num)
                if 0 <= n <= 500:
                    estimated_aqi = n
                    break
        
        # Kateqoriyanı təyin et
        if estimated_aqi <= 50:
            category = "Yaxşı"
        elif estimated_aqi <= 100:
            category = "Orta"
        elif estimated_aqi <= 150:
            category = "Pis"
        else:
            category = "Çox pis"
        
        return {
            "description": description,
            "estimated_aqi": estimated_aqi,
            "aqi_category": category,
            "recommendations": {
                "healthy": "Hava normaldır, aktiv olun",
                "sensitive": "Ehtiyatlı olun",
                "children": "Uşaqlar üçün təhlükəsiz",
                "elderly": "Yaşlılar ehtiyatlı olmalıdır"
            }
        }

    def _get_fallback_result(self, error_msg=""):
        """Fallback nəticə"""
        return {
            'description': f'Foto analiz edilə bilmədi. Xəta: {error_msg}',
            'estimated_aqi': 75,
            'aqi_category': 'Məlum deyil',
            'recommendations': {
                'healthy': 'Ümumi tövsiyə: Hava normaldır',
                'sensitive': 'Həssas qruplar ehtiyatlı olmalıdır',
                'children': 'Uşaqlar üçün təhlükəsiz',
                'elderly': 'Yaşlılar üçün normal şərait'
            }
        }