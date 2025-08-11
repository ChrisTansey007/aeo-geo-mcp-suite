from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .seo_astro_analyzer_server import get_title_meta, get_robots_canonical, get_headings, get_images_alt, get_links, get_structured_data, get_open_graph_twitter, get_wordcount_keywords, get_favicon_apple, get_lang_charset, get_sitemap_robots, url_to_slug
import logging

app = FastAPI()

# Map tool names to functions
tool_map = {
    "title_meta": get_title_meta,
    "robots_canonical": get_robots_canonical,
    "headings": get_headings,
    "images_alt": get_images_alt,
    "links": get_links,
    "structured_data": get_structured_data,
    "open_graph_twitter": get_open_graph_twitter,
    "wordcount_keywords": get_wordcount_keywords,
    "favicon_apple": get_favicon_apple,
    "lang_charset": get_lang_charset,
    "sitemap_robots": get_sitemap_robots,
}

@app.post("/api/analyze")
async def analyze(request: Request):
    try:
        data = await request.json()
        url = data.get("url")
        tools = data.get("tools", [])
        engines = data.get("engines", [])
        logging.info(f"/api/analyze called: url={url}, tools={tools}, engines={engines}")
        if not url or not tools:
            return JSONResponse({"error": "Missing url or tools"}, status_code=400)
        results = []
        for tool in tools:
            func = tool_map.get(tool)
            if not func:
                results.append({"tool": tool, "error": "Tool not found"})
                continue
            try:
                result = func(url)
                results.append({"tool": tool, "result": result})
            except Exception as e:
                logging.exception(f"Error running tool {tool} on {url}: {e}")
                results.append({"tool": tool, "error": str(e)})
        run_id = url_to_slug(url)
        return {"run_id": run_id, "results": results}
    except Exception as e:
        logging.exception(f"/api/analyze failed: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)
