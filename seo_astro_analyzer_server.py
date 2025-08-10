
from fastmcp import FastMCP
import seo_get_title_meta
import seo_get_robots_canonical
import seo_get_headings
import seo_get_images_alt
import seo_get_links
import seo_get_structured_data
import seo_get_open_graph_twitter
import seo_get_wordcount_keywords
import seo_get_favicon_apple
import seo_get_lang_charset
import seo_get_sitemap_robots
import hashlib
import json

def url_to_slug(url: str) -> str:
    # Use a short hash for uniqueness and brevity
    h = hashlib.sha1(url.encode()).hexdigest()[:8]
    # Take the domain and add the hash
    from urllib.parse import urlparse
    netloc = urlparse(url).netloc.replace('.', '_')
    return f"{netloc}_{h}"

mcp = FastMCP("SEO Astro Analyzer 🚀")

def save_result(result, url, check_name):
    slug = url_to_slug(url)
    filename = f"seo_{check_name}_{slug}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    return {"result": result, "saved_to": filename}

@mcp.tool
def get_title_meta(url: str):
    """Get title and meta tags from a URL."""
    result = seo_get_title_meta.get_title_meta(url)
    return save_result(result, url, "title_meta")

@mcp.tool
def get_robots_canonical(url: str):
    """Get robots and canonical info from a URL."""
    result = seo_get_robots_canonical.get_robots_canonical(url)
    return save_result(result, url, "robots_canonical")

@mcp.tool
def get_headings(url: str):
    """Get all headings from a URL."""
    result = seo_get_headings.get_headings(url)
    return save_result(result, url, "headings")

@mcp.tool
def get_images_alt(url: str):
    """Get images and alt text from a URL."""
    result = seo_get_images_alt.get_images_alt(url)
    return save_result(result, url, "images_alt")

@mcp.tool
def get_links(url: str):
    """Get all links from a URL."""
    result = seo_get_links.get_links(url)
    return save_result(result, url, "links")

@mcp.tool
def get_structured_data(url: str):
    """Get structured data from a URL."""
    result = seo_get_structured_data.get_structured_data(url)
    return save_result(result, url, "structured_data")

@mcp.tool
def get_open_graph_twitter(url: str):
    """Get Open Graph and Twitter card data from a URL."""
    result = seo_get_open_graph_twitter.get_open_graph_twitter(url)
    return save_result(result, url, "open_graph_twitter")

@mcp.tool
def get_wordcount_keywords(url: str):
    """Get word count and keywords from a URL."""
    result = seo_get_wordcount_keywords.get_wordcount_keywords(url)
    return save_result(result, url, "wordcount_keywords")

@mcp.tool
def get_favicon_apple(url: str):
    """Get favicon and Apple touch icons from a URL."""
    result = seo_get_favicon_apple.get_favicon_apple(url)
    return save_result(result, url, "favicon_apple")

@mcp.tool
def get_lang_charset(url: str):
    """Get language and charset from a URL."""
    result = seo_get_lang_charset.get_lang_charset(url)
    return save_result(result, url, "lang_charset")

@mcp.tool
def get_sitemap_robots(url: str):
    """Get sitemap and robots.txt info from a URL."""
    result = seo_get_sitemap_robots.get_sitemap_robots(url)
    return save_result(result, url, "sitemap_robots")

if __name__ == "__main__":
    mcp.run()
