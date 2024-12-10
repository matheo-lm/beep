import json
import feedparser
from bs4 import BeautifulSoup
import time
import os

# URL of the Atom feed
feed_url = "https://googleprojectzero.blogspot.com/feeds/posts/default"

# Output file path
output_file = "feeds/gpz.json"

# Function to clean and truncate HTML content
def clean_and_truncate_html(raw_html, char_limit=240):
    soup = BeautifulSoup(raw_html, "html.parser")
    clean_text = soup.get_text()
    return clean_text[:char_limit] + "[...]" if len(clean_text) > char_limit else clean_text

# Fetch and parse the feed
feed = feedparser.parse(feed_url)

# Load existing data if the file exists
if os.path.exists(output_file):
    with open(output_file, "r", encoding="utf-8") as file:
        existing_data = json.load(file)
else:
    existing_data = {"items": []}

# Process entries and structure them
formatted_feed = {"items": []}

# Append new entries to existing data
existing_guids = {item["guid"] for item in existing_data["items"]}
for entry in feed.entries:
    if entry.link not in existing_guids:
        formatted_entry = {
            "creator": entry.author if "author" in entry else "Unknown",
            "title": entry.title,
            "link": entry.link,
            "pubDate": entry.published,
            "dc:creator": entry.author if "author" in entry else "Unknown",
            "content": clean_and_truncate_html(entry.content[0].value) if "content" in entry else "",
            "contentSnippet": clean_and_truncate_html(entry.summary) if "summary" in entry else "",
            "guid": entry.link,
            "categories": [tag.term for tag in entry.tags] if "tags" in entry else [],
            "isoDate": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", entry.published_parsed) if entry.published_parsed else "",
            "tag": "exploits"
        }
        existing_data["items"].append(formatted_entry)

# Save the updated JSON file
with open(output_file, "w", encoding="utf-8") as file:
    json.dump(existing_data, file, ensure_ascii=False, indent=2)

print(f"Formatted feed saved to {output_file}")
