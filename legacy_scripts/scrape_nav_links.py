import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

URL = "https://portcityfenceofwilmington.com/"

def scrape_nav_links(url):
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'html.parser')
    links = []
    # Try to find nav, header, or menu elements first
    navs = soup.find_all(['nav', 'header'])
    for nav in navs:
        for a in nav.find_all('a', href=True):
            href = urljoin(url, a['href'])
            text = a.get_text(strip=True)
            links.append({'text': text, 'href': href})
    # Fallback: get all top-level links if no nav/header found
    if not links:
        for a in soup.find_all('a', href=True):
            href = urljoin(url, a['href'])
            text = a.get_text(strip=True)
            links.append({'text': text, 'href': href})
    # Remove duplicates
    seen = set()
    unique_links = []
    for link in links:
        key = (link['text'], link['href'])
        if key not in seen:
            seen.add(key)
            unique_links.append(link)
    return unique_links

def main():
    links = scrape_nav_links(URL)
    with open("navigation_links.md", "w", encoding="utf-8") as f:
        f.write(f"# Navigation Links for {URL}\n\n")
        for i, link in enumerate(links, 1):
            f.write(f"{i}. [{link['text'] or link['href']}]({link['href']})\n")
    print(f"Saved {len(links)} navigation links to navigation_links.md")

if __name__ == "__main__":
    main()
