import json

with open("src/data/articles.json", "r", encoding="utf-8") as f:
    data = json.load(f)

to_remove = ["vignette-slovakia-online", "vignette-romania-price", "fuel-prices-europe"]
new_data = [a for a in data if a.get("id") not in to_remove]

with open("src/data/articles.json", "w", encoding="utf-8") as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

print(f"Removed {len(data) - len(new_data)} articles. Now {len(new_data)} left.")
