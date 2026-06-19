import os

replacements = {
    "Delhi": "Bengaluru",
    "Mumbai": "Bengaluru",
    "Hyderabad": "Bengaluru",
    "Chennai": "Bengaluru",
    "Nagpur": "Bengaluru",
    "Connaught Place": "Whitefield",
    "Lajpat Nagar": "KR Puram",
    "Saket": "Koramangala",
    "Rohini": "BTM",
    "Dwarka": "Jayanagar",
    "Chandni Chowk": "Electronic City",
    "Karol Bagh": "Marathahalli",
    "Anand Vihar": "Whitefield",
    "Dharavi": "Whitefield",
    "Andheri": "KR Puram",
    "Bandra": "Koramangala",
    "Kurla": "BTM",
    "Worli": "Jayanagar",
    "Dadar": "Electronic City",
    "Goregaon": "Marathahalli",
    "Borivali": "Whitefield",
    "Banjara Hills": "Whitefield",
    "Secunderabad": "KR Puram",
    "Charminar": "Koramangala",
    "Madhapur": "BTM",
    "T Nagar": "Whitefield",
    "Adyar": "KR Puram",
    "Velachery": "Koramangala",
    "Anna Nagar": "BTM",
    "Hebbal": "Whitefield",
    "JP Nagar": "KR Puram",
    "Indiranagar": "Koramangala",
    "HSR Layout": "BTM",
}

for root, dirs, files in os.walk("Dataset"):
    for file in files:
        if file.endswith(".csv"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for old, new in replacements.items():
                content = content.replace(old, new)
                
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
                
print("Replaced all cities and areas in CSVs.")
