# Example: SEO Title/Meta Extraction
from bs4 import BeautifulSoup
import requests

def get_title_meta(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    title = soup.title.string if soup.title else ''
    meta = {tag.get('name', tag.get('property', '')): tag.get('content', '') for tag in soup.find_all('meta')}
    return {'title': title, 'meta': meta}
