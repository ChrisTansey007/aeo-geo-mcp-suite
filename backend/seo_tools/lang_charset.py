from bs4 import BeautifulSoup
import requests

def get_lang_charset(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    lang = soup.html.get('lang', '') if soup.html else ''
    charset = ''
    meta = soup.find('meta', charset=True)
    if meta:
        charset = meta.get('charset', '')
    else:
        meta = soup.find('meta', attrs={'http-equiv': 'Content-Type'})
        if meta and 'charset=' in meta.get('content', ''):
            charset = meta.get('content', '').split('charset=')[-1]
    return {'lang': lang, 'charset': charset}
