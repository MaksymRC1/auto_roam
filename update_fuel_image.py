import json

with open("src/data/articles.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for a in data:
    if a.get("id") == "fuel-cost-calculator":
        a["image"] = "/images/blog/fuel-calculator.jpg"

with open("src/data/articles.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated image for fuel-cost-calculator")
