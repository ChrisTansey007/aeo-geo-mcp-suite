import requests

def get_sitemap_robots(url):
    from urllib.parse import urljoin
    from urllib.parse import urlparse
    # Get robots.txt
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    robots_url = urljoin(base, '/robots.txt')
    sitemap_url = urljoin(base, '/sitemap.xml')
    robots_txt = ''
    sitemap_xml = ''
    try:
        robots_resp = requests.get(robots_url)
        if robots_resp.ok:
            robots_txt = robots_resp.text
    except Exception:
        pass
    try:
        sitemap_resp = requests.get(sitemap_url)
        if sitemap_resp.ok:
            sitemap_xml = sitemap_resp.text[:1000]  # Only preview first 1000 chars
    except Exception:
        pass
    return {'robots.txt': robots_txt, 'sitemap.xml': sitemap_xml}

if __name__ == "__main__":
    url = "https://portcityfenceofwilmington.com/"
    result = get_sitemap_robots(url)
    print(result)
