import requests
from bs4 import BeautifulSoup
import json

def get_structured_data(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    scripts = soup.find_all('script', type='application/ld+json')
    data = []
    for script in scripts:
        try:
            data.append(json.loads(script.string))
        except Exception:
            continue
    return data
