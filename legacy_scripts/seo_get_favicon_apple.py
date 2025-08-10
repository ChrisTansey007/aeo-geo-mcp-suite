import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_favicon_apple(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    icons = []
    for link in soup.find_all('link', rel=True):
        rel = link['rel']
        if isinstance(rel, list):
            rel = [r.lower() for r in rel]
        else:
            rel = [rel.lower()]
        if 'icon' in rel or 'apple-touch-icon' in rel:
            href = urljoin(url, link.get('href', ''))
            icons.append({'rel': ','.join(rel), 'href': href})
    return icons

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_favicon_apple(url)
    print(result)
