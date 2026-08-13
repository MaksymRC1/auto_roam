import json
with open("src/data/articles.json") as f:
    data = json.load(f)
for i, a in enumerate(data):
    print(f"[{i}] {a.get(\"id\")} - {a.get(\"title\")} ({a.get(\"date\")})")
