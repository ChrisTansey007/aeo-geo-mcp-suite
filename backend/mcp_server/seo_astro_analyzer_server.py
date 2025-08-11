from fastmcp import FastMCP
from backend.seo_tools import title_meta, robots_canonical, headings, images_alt, links, structured_data, open_graph_twitter, wordcount_keywords, favicon_apple, lang_charset, sitemap_robots
import hashlib
import json
import logging
import sys

def url_to_slug(url: str) -> str:
    h = hashlib.sha1(url.encode()).hexdigest()[:8]
    from urllib.parse import urlparse
    netloc = urlparse(url).netloc.replace('.', '_')
    return f"{netloc}_{h}"

def save_result(result, url, check_name):
    slug = url_to_slug(url)
    filename = f"seo_{check_name}_{slug}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    logging.info(f"Saved result for {check_name} on {url} to {filename}")
    return {"result": result, "saved_to": filename}

def log_request(tool_name, url, extra=None):
    msg = f"Tool called: {tool_name} for URL: {url}"
    if extra:
        msg += f" | Extra: {extra}"
    logging.info(msg)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("backend.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
mcp = FastMCP("SEO Astro Analyzer 🚀")
logging.info("=== Backend server starting with deep logging ===")

# Add /api/analyze endpoint
def analyze(request):
    try:
        data = request.json
        url = data.get("url")
        tools = data.get("tools", [])
        engines = data.get("engines", [])
        logging.info(f"/api/analyze called: url={url}, tools={tools}, engines={engines}")
        if not url or not tools:
            logging.warning("Missing url or tools in /api/analyze request")
            return {"error": "Missing url or tools"}, 400
        results = []
        for tool in tools:
            try:
                func = globals().get(f"get_{tool}")
                if not func:
                    logging.warning(f"Tool not found: {tool}")
                    results.append({"tool": tool, "error": "Tool not found"})
                    continue
                result = func(url)
                results.append({"tool": tool, "result": result})
            except Exception as e:
                logging.exception(f"Error running tool {tool} on {url}: {e}")
                results.append({"tool": tool, "error": str(e)})
        run_id = url_to_slug(url)
        return {"run_id": run_id, "results": results}
    except Exception as e:
        logging.exception(f"/api/analyze failed: {e}")
        return {"error": str(e)}, 500
@mcp.tool()
def get_title_meta(url: str):
    log_request("title_meta", url)
    logging.debug(f"Input to get_title_meta: url={url}")
    try:
        raw = title_meta.get_title_meta(url)
        logging.debug(f"Result from title_meta.get_title_meta: {raw}")
        # Compose standard result
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"title_length": len(raw.get("title", "")), "meta_count": len(raw.get("meta", {}))},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "title_meta")
        logging.debug(f"Output from get_title_meta: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_title_meta: {e}")
        raise

@mcp.tool()
def get_robots_canonical(url: str):
    log_request("robots_canonical", url)
    logging.debug(f"Input to get_robots_canonical: url={url}")
    try:
        raw = robots_canonical.get_robots_canonical(url)
        logging.debug(f"Result from robots_canonical.get_robots_canonical: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"robots_count": len(raw.get("robots", [])), "has_canonical": bool(raw.get("canonical"))},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "robots_canonical")
        logging.debug(f"Output from get_robots_canonical: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_robots_canonical: {e}")
        raise

@mcp.tool()
def get_headings(url: str):
    log_request("headings", url)
    logging.debug(f"Input to get_headings: url={url}")
    try:
        raw = headings.get_headings(url)
        logging.debug(f"Result from headings.get_headings: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {k: len(v) for k, v in raw.items()},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "headings")
        logging.debug(f"Output from get_headings: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_headings: {e}")
        raise

@mcp.tool()
def get_images_alt(url: str):
    log_request("images_alt", url)
    logging.debug(f"Input to get_images_alt: url={url}")
    try:
        raw = images_alt.get_images_alt(url)
        logging.debug(f"Result from images_alt.get_images_alt: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"image_count": len(raw)},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "images_alt")
        logging.debug(f"Output from get_images_alt: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_images_alt: {e}")
        raise

@mcp.tool()
def get_links(url: str):
    log_request("links", url)
    logging.debug(f"Input to get_links: url={url}")
    try:
        raw = links.get_links(url)
        logging.debug(f"Result from links.get_links: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"link_count": len(raw)},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "links")
        logging.debug(f"Output from get_links: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_links: {e}")
        raise

@mcp.tool()
def get_structured_data(url: str):
    log_request("structured_data", url)
    logging.debug(f"Input to get_structured_data: url={url}")
    try:
        raw = structured_data.get_structured_data(url)
        logging.debug(f"Result from structured_data.get_structured_data: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"structured_data_count": len(raw)},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "structured_data")
        logging.debug(f"Output from get_structured_data: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_structured_data: {e}")
        raise

@mcp.tool()
def get_open_graph_twitter(url: str):
    log_request("open_graph_twitter", url)
    logging.debug(f"Input to get_open_graph_twitter: url={url}")
    try:
        raw = open_graph_twitter.get_open_graph_twitter(url)
        logging.debug(f"Result from open_graph_twitter.get_open_graph_twitter: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"og_count": len(raw.get("open_graph", {})), "twitter_count": len(raw.get("twitter", {}))},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "open_graph_twitter")
        logging.debug(f"Output from get_open_graph_twitter: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_open_graph_twitter: {e}")
        raise

@mcp.tool()
def get_wordcount_keywords(url: str):
    log_request("wordcount_keywords", url)
    logging.debug(f"Input to get_wordcount_keywords: url={url}")
    try:
        raw = wordcount_keywords.get_wordcount_keywords(url)
        logging.debug(f"Result from wordcount_keywords.get_wordcount_keywords: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"wordcount": raw.get("wordcount", 0), "keywords_count": len(raw.get("keywords", []))},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "wordcount_keywords")
        logging.debug(f"Output from get_wordcount_keywords: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_wordcount_keywords: {e}")
        raise

@mcp.tool()
def get_favicon_apple(url: str):
    log_request("favicon_apple", url)
    logging.debug(f"Input to get_favicon_apple: url={url}")
    try:
        raw = favicon_apple.get_favicon_apple(url)
        logging.debug(f"Result from favicon_apple.get_favicon_apple: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"favicon_found": bool(raw.get("favicon")), "apple_icons_count": len(raw.get("apple_touch_icons", []))},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "favicon_apple")
        logging.debug(f"Output from get_favicon_apple: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_favicon_apple: {e}")
        raise

@mcp.tool()
def get_lang_charset(url: str):
    log_request("lang_charset", url)
    logging.debug(f"Input to get_lang_charset: url={url}")
    try:
        raw = lang_charset.get_lang_charset(url)
        logging.debug(f"Result from lang_charset.get_lang_charset: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"lang_found": bool(raw.get("lang")), "charset": raw.get("charset", "")},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "lang_charset")
        logging.debug(f"Output from get_lang_charset: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_lang_charset: {e}")
        raise

@mcp.tool()
def get_sitemap_robots(url: str):
    log_request("sitemap_robots", url)
    logging.debug(f"Input to get_sitemap_robots: url={url}")
    try:
        raw = sitemap_robots.get_sitemap_robots(url)
        logging.debug(f"Result from sitemap_robots.get_sitemap_robots: {raw}")
        result = {
            "summary": {"score": 100, "grade": "A"},
            "metrics": {"has_sitemap": bool(raw.get("sitemap")), "has_robots": bool(raw.get("robots"))},
            "details": [],
            "evidence": raw,
        }
        out = save_result(result, url, "sitemap_robots")
        logging.debug(f"Output from get_sitemap_robots: {out}")
        return out
    except Exception as e:
        logging.exception(f"Error in get_sitemap_robots: {e}")
        raise

if __name__ == "__main__":
    try:
        logging.info("Server main entrypoint starting...")
        mcp.run()
    except Exception as e:
        logging.exception(f"Server crashed: {e}")
