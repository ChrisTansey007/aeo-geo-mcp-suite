import requests
from bs4 import BeautifulSoup
import json

def get_structured_data(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    schemas = []
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string)
            schemas.append(data)
        except Exception:
            continue
    return schemas

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_structured_data(url)
    print(result)
