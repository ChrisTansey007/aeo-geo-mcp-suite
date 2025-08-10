import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_images_alt(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    images = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src:
            src = urljoin(url, src)
        alt = img.get('alt', '')
        images.append({'src': src, 'alt': alt})
    return images

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_images_alt(url)
    print(result)
