from bs4 import BeautifulSoup
import requests

def get_images_alt(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    images = []
    for img in soup.find_all('img'):
        images.append({
            'src': img.get('src', ''),
            'alt': img.get('alt', '')
        })
    return images
