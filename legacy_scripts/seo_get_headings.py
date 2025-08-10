import requests
from bs4 import BeautifulSoup

def get_headings(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    headings = []
    for tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
        for h in soup.find_all(tag):
            headings.append({'level': tag, 'text': h.get_text(strip=True)})
    return headings

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_headings(url)
    print(result)
