import requests
import os
from dotenv import load_dotenv

load_dotenv()

class DataCollector:
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY')
        if not self.api_key:
            print("XƏTA: OPENWEATHER_API_KEY tapilmadi!")
        else:
            print("API key yuklendi")
        self.base_url = "http://api.openweathermap.org/data/2.5/air_pollution"
    
    def get_aqi_for_location(self, lat, lon):
        try:
            url = f"{self.base_url}?lat={lat}&lon={lon}&appid={self.api_key}"
            print(f"AQI data alinir: {lat}, {lon}")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            aqi_index = data['list'][0]['main']['aqi']
            aqi_mapping = {1: 25, 2: 75, 3: 125, 4: 175, 5: 250}
            aqi = aqi_mapping.get(aqi_index, 100)
            components = data['list'][0]['components']
            result = {
                'aqi': aqi,
                'pm2_5': round(components.get('pm2_5', 0), 2),
                'pm10': round(components.get('pm10', 0), 2),
                'co': round(components.get('co', 0), 2),
                'no2': round(components.get('no2', 0), 2),
                'o3': round(components.get('o3', 0), 2)
            }
            print(f"AQI alindi: {aqi}")
            return result
        except Exception as e:
            print(f"Xeta: {e}")
            return None

if __name__ == "__main__":
    print("Test basladi\n")
    collector = DataCollector()
    print("Test: Baki merkez")
    result = collector.get_aqi_for_location(40.4093, 49.8671)
    if result:
        print(f"\nNeticə:")
        print(f"   AQI: {result['aqi']}")
        print(f"   PM2.5: {result['pm2_5']}")
        print(f"   PM10: {result['pm10']}")
    else:
        print("\nXeta!")