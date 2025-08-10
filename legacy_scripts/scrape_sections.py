import requests
from bs4 import BeautifulSoup

URL = "https://portcityfenceofwilmington.com/"

# Helper to clean up section titles

def clean_title(text):
    return ' '.join(text.strip().split())

def scrape_sections(url):
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'html.parser')
    sections = []
    # Try to find all main section headers (h1, h2, h3, h4, h5, h6)
    for header in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
        title = clean_title(header.get_text())
        # Get all content until the next header of same or higher level
        content = []
        for sib in header.find_next_siblings():
            if sib.name and sib.name.startswith('h') and int(sib.name[1]) <= int(header.name[1]):
                break
            content.append(sib.get_text(" ", strip=True))
        section_text = '\n'.join([c for c in content if c])
        sections.append({'title': title, 'level': header.name, 'content': section_text})
    return sections

def main():
    sections = scrape_sections(URL)
    with open("webpage_sections.md", "w", encoding="utf-8") as f:
        f.write(f"# Sections for {URL}\n\n")
        for sec in sections:
            f.write(f"## {sec['title']}\n")
            if sec['content']:
                f.write(f"{sec['content']}\n\n")
    print(f"Saved {len(sections)} sections to webpage_sections.md")

if __name__ == "__main__":
    main()
