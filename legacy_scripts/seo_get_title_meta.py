import requests
from bs4 import BeautifulSoup

def get_title_meta(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    title = soup.title.string.strip() if soup.title else ''
    meta_desc = ''
    meta = soup.find('meta', attrs={'name': 'description'})
    if meta and meta.get('content'):
        meta_desc = meta['content'].strip()
    return {'title': title, 'meta_description': meta_desc}

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_title_meta(url)
    print(result)
