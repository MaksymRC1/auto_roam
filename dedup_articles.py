import json

with open("src/data/articles.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Keep the first occurrence of each article by ID or Title
unique_data = []
seen_ids = set()
seen_titles = set()

for article in data:
    aid = article.get("id")
    title = article.get("title")
    
    # Check if this looks like a duplicate (either same ID, or similar title)
    if aid not in seen_ids and title not in seen_titles:
        unique_data.append(article)
        seen_ids.add(aid)
        seen_titles.add(title)
    else:
        print(f"Removing duplicate: {aid} - {title}")

with open("src/data/articles.json", "w", encoding="utf-8") as f:
    json.dump(unique_data, f, ensure_ascii=False, indent=2)

print(f"Total articles after deduplication: {len(unique_data)}")
