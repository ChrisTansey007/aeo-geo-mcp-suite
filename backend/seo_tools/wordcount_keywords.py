from bs4 import BeautifulSoup
import requests
from collections import Counter
import re

def get_wordcount_keywords(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    text = soup.get_text(separator=' ', strip=True)
    words = re.findall(r'\w+', text.lower())
    wordcount = len(words)
    keywords = Counter(words).most_common(10)
    return {'wordcount': wordcount, 'keywords': keywords}
