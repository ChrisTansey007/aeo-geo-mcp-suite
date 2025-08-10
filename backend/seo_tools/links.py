from bs4 import BeautifulSoup
import requests

def get_links(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    links = []
    for a in soup.find_all('a', href=True):
        links.append(a['href'])
    return links
