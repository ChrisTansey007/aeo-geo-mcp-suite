import requests
from bs4 import BeautifulSoup

def get_open_graph_twitter(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    og_tags = {}
    tw_tags = {}
    for meta in soup.find_all('meta'):
        if meta.get('property', '').startswith('og:'):
            og_tags[meta['property']] = meta.get('content', '')
        if meta.get('name', '').startswith('twitter:'):
            tw_tags[meta['name']] = meta.get('content', '')
    return {'open_graph': og_tags, 'twitter': tw_tags}

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_open_graph_twitter(url)
    print(result)
