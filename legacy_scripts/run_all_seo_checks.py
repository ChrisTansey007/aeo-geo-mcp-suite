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


import sys
import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="Run all SEO checks on a given URL.")
    parser.add_argument("url", help="The URL to analyze.")
    return parser.parse_args()


def main():
    args = parse_args()
    url = args.url
    results = {}
    results['title_meta'] = seo_get_title_meta.get_title_meta(url)
    results['robots_canonical'] = seo_get_robots_canonical.get_robots_canonical(url)
    results['headings'] = seo_get_headings.get_headings(url)
    results['images_alt'] = seo_get_images_alt.get_images_alt(url)
    results['links'] = seo_get_links.get_links(url)
    results['structured_data'] = seo_get_structured_data.get_structured_data(url)
    results['open_graph_twitter'] = seo_get_open_graph_twitter.get_open_graph_twitter(url)
    results['wordcount_keywords'] = seo_get_wordcount_keywords.get_wordcount_keywords(url)
    results['favicon_apple'] = seo_get_favicon_apple.get_favicon_apple(url)
    results['lang_charset'] = seo_get_lang_charset.get_lang_charset(url)
    results['sitemap_robots'] = seo_get_sitemap_robots.get_sitemap_robots(url)

    import json
    with open("seo_report.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("SEO analysis complete. Results saved to seo_report.json")

if __name__ == "__main__":
    main()
