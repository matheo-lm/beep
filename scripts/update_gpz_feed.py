import json
import feedparser
from bs4 import BeautifulSoup
import time

# URL of the Atom feed
feed_url = "https://googleprojectzero.blogspot.com/feeds/posts/default"

# Output file path
output_file = "gpz.json"

# Function to clean and truncate HTML content
def clean_and_truncate_html(raw_html, char_limit=240):
    soup = BeautifulSoup(raw_html, "html.parser")
    clean_text = soup.get_text()
    return clean_text[:char_limit] + "..." if len(clean_text) > char_limit else clean_text

# Fetch and parse the feed
feed = feedparser.parse(feed_url)

# Process entries and structure them
formatted_feed = {"items": []}

for entry in feed.entries:
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
    formatted_feed["items"].append(formatted_entry)

# Save the formatted JSON file
with open(output_file, "w", encoding="utf-8") as file:
    json.dump(formatted_feed, file, ensure_ascii=False, indent=2)

print(f"Formatted feed saved to {output_file}")
