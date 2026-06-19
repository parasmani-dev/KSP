import random
areas = ['Adyar', 'Whitefield', 'Koramangala', 'Andheri', 'Madhapur', 'Kurla', 'Lajpat Nagar', 'Worli', 'Anna Nagar', 'Saket', 'Karol Bagh', 'Indiranagar', 'Hebbal', 'Dharavi', 'Goregaon', 'Chandni Chowk', 'Rohini', 'Connaught Place', 'Bandra', 'Anand Vihar', 'Borivali', 'JP Nagar', 'Charminar', 'Dwarka', 'Dadar', 'KR Puram', 'T Nagar', 'Secunderabad', 'BTM', 'Jayanagar', 'Electronic City', 'Marathahalli']
out = 'AREA_CENTROIDS = {\n'
for a in sorted(set(areas)):
    lat = 12.9 + (random.random() * 0.1 - 0.05)
    lon = 77.5 + (random.random() * 0.1 - 0.05)
    out += f'    "{a}": ({lat:.4f}, {lon:.4f}),\n'
out += '}'
print(out)
