import requests
from bs4 import BeautifulSoup
import re
from collections import Counter

def get_wordcount_keywords(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    text = soup.get_text(" ", strip=True)
    words = re.findall(r'\b\w+\b', text.lower())
    word_count = len(words)
    common = Counter(words).most_common(20)
    return {'word_count': word_count, 'top_keywords': common}

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_wordcount_keywords(url)
    print(result)
