import requests

def get_sitemap_robots(url):
    from urllib.parse import urlparse, urljoin
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    sitemap_url = urljoin(base, '/sitemap.xml')
    robots_url = urljoin(base, '/robots.txt')
    sitemap = ''
    robots = ''
    try:
        sitemap_resp = requests.get(sitemap_url)
        if sitemap_resp.status_code == 200:
            sitemap = sitemap_resp.text
    except Exception:
        pass
    try:
        robots_resp = requests.get(robots_url)
        if robots_resp.status_code == 200:
            robots = robots_resp.text
    except Exception:
        pass
    return {'sitemap': sitemap, 'robots': robots}
