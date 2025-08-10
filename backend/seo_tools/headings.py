from bs4 import BeautifulSoup
import requests

def get_headings(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    headings = {}
    for level in range(1, 7):
        tag = f'h{level}'
        headings[tag] = [h.get_text(strip=True) for h in soup.find_all(tag)]
    return headings
