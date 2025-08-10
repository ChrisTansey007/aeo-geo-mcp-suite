from bs4 import BeautifulSoup
import requests

def get_favicon_apple(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    favicon = ''
    apple_icons = []
    for link in soup.find_all('link'):
        rel = link.get('rel', [])
        if 'icon' in rel or 'shortcut icon' in rel:
            favicon = link.get('href', '')
        if 'apple-touch-icon' in rel:
            apple_icons.append(link.get('href', ''))
    return {'favicon': favicon, 'apple_touch_icons': apple_icons}
