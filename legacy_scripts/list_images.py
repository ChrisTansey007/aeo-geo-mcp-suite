import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

URL = "https://portcityfenceofwilmington.com/"

def is_real_image(src):
    if not src:
        return False
    if src.startswith('http'):
        return True  # Allow all http(s) image URLs regardless of extension
    if src.startswith('data:image/'):
        return not src.startswith('data:image/svg+xml')  # Exclude SVGs only
    return False

def get_all_images(url):
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'html.parser')
    images = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src:
            # Handle relative URLs
            src = urljoin(url, src)
        alt = img.get('alt', '')
        if is_real_image(src):
            images.append({'src': src, 'alt': alt})
    return images

def main():
    images = get_all_images(URL)
    with open("image_list.md", "w", encoding="utf-8") as f:
        f.write("# Image List\n\n")
        for i, img in enumerate(images, 1):
            f.write(f"{i}. ![{img['alt'] or 'image'}]({img['src']})\n")
            if img['alt']:
                f.write(f"   - Alt: {img['alt']}\n")
    print(f"Saved {len(images)} images to image_list.md")

if __name__ == "__main__":
    main()
