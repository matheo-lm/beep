import requests
from bs4 import BeautifulSoup
import json
import os

def scrape_google_scholar(query, pages=10):
    base_url = "https://scholar.google.com/scholar"
    items = []
    
    for page in range(pages):
        params = {
            "q": query,
            "hl": "en",
            "as_sdt": "7,47",
            "start": page * 10  # Results pagination
        }

        response = requests.get(base_url, params=params)
        if response.status_code != 200:
            print(f"Failed to fetch page {page + 1}: {response.status_code}")
            continue

        soup = BeautifulSoup(response.text, "html.parser")

        # Parse search results on the current page
        for result in soup.select(".gs_ri"):
            title_tag = result.select_one(".gs_rt a")
            snippet_tag = result.select_one(".gs_rs")
            author_year_tag = result.select_one(".gs_a")
            link = title_tag["href"] if title_tag else None

            item = {
                "title": title_tag.get_text(strip=True) if title_tag else "No title",
                "link": link,
                "snippet": snippet_tag.get_text(strip=True) if snippet_tag else "No snippet",
                "authors_year": author_year_tag.get_text(strip=True) if author_year_tag else "No author/year info",
            }
            items.append(item)
    
    return items

def save_to_json(data, filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
        existing_items = {item["guid"]: item for item in existing_data["items"]}
    else:
        existing_items = {}

    for item in data["items"]:
        guid = item["guid"]
        if guid in existing_items:
            existing_item = existing_items[guid]
            for key, value in item.items():
                if key not in existing_item or not existing_item[key]:
                    existing_item[key] = value
        else:
            existing_items[guid] = item

    updated_data = {"items": list(existing_items.values())}

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=4, ensure_ascii=False)

# Query for search
query = '"cybersecurity" AND ("geopolitics" OR "incident*" OR "intel" OR "exploits" OR "warfare" OR "coercion")'
results = scrape_google_scholar(query, pages=10)

# Convert to the desired format
json_data = {
    "items": [
        {
            "creator": item.get("authors_year", "Unknown"),
            "title": item.get("title"),
            "link": item.get("link"),
            "pubDate": "Unknown",
            "dc:creator": item.get("authors_year", "Unknown"),
            "content": item.get("snippet", "No content"),
            "contentSnippet": item.get("snippet", "No content"),
            "guid": item.get("link"),
            "categories": [],
            "isoDate": "Unknown",
            "tag": "scholarly"
        }
        for item in results
    ]
}

# Save results to JSON
save_to_json(json_data, "feeds/gsr.json")
print("Results saved to feeds/gsr.json")
