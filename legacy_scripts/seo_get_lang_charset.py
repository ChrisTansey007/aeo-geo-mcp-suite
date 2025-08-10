import requests
from bs4 import BeautifulSoup

def get_lang_charset(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    lang = ''
    charset = ''
    html = soup.find('html')
    if html and html.get('lang'):
        lang = html['lang']
    meta = soup.find('meta', charset=True)
    if meta:
        charset = meta['charset']
    return {'lang': lang, 'charset': charset}

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_lang_charset(url)
    print(result)
