import requests
from bs4 import BeautifulSoup

def get_robots_canonical(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    robots = ''
    canonical = ''
    meta = soup.find('meta', attrs={'name': 'robots'})
    if meta and meta.get('content'):
        robots = meta['content'].strip()
    link = soup.find('link', rel='canonical')
    if link and link.get('href'):
        canonical = link['href'].strip()
    return {'robots': robots, 'canonical': canonical}

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_robots_canonical(url)
    print(result)
