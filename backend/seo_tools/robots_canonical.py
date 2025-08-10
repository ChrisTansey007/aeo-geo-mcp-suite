# Example: SEO Robots/Canonical Extraction
from bs4 import BeautifulSoup
import requests

def get_robots_canonical(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    robots = [tag.get('content', '') for tag in soup.find_all('meta', attrs={'name': 'robots'})]
    canonical = ''
    link = soup.find('link', rel='canonical')
    if link:
        canonical = link.get('href', '')
    return {'robots': robots, 'canonical': canonical}
