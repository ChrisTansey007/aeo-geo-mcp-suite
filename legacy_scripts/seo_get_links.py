import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_links(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    links = []
    for a in soup.find_all('a', href=True):
        href = urljoin(url, a['href'])
        text = a.get_text(strip=True)
        links.append({'text': text, 'href': href})
    return links

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_links(url)
    print(result)
