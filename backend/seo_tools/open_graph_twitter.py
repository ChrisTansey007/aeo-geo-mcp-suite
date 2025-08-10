from bs4 import BeautifulSoup
import requests

def get_open_graph_twitter(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    og = {}
    twitter = {}
    for tag in soup.find_all('meta'):
        prop = tag.get('property')
        name = tag.get('name')
        content = tag.get('content', '')
        if prop and prop.startswith('og:'):
            og[prop] = content
        if name and name.startswith('twitter:'):
            twitter[name] = content
    return {'open_graph': og, 'twitter': twitter}
