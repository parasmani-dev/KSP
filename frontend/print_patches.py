import json
with open('diff_dump.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)
for i, d in enumerate(data):
    print(str(i) + ': ' + str(d.get('Description', 'No desc'))[:100])
