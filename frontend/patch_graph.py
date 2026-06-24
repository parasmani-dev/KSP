import sys

with open('src/app/network/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Insert import
import_line = 'import CrimeNetworkGraphClient from "@/components/graph/CrimeNetworkGraphClient";\n'
lines.insert(9, import_line)

# Now find the SVG block to replace
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'THE GRAPH CANVAS (SVG Rendering)' in line:
        start_idx = i + 2  # The div after the comment
    if start_idx != -1 and i >= start_idx and '</svg>' in line:
        end_idx = i + 2 # the </div> after </svg>
        break

if start_idx != -1 and end_idx != -1:
    replacement = [
        '               <div className="absolute inset-0 z-0 overflow-hidden">\n',
        '                 <CrimeNetworkGraphClient />\n',
        '               </div>\n'
    ]
    new_lines = lines[:start_idx] + replacement + lines[end_idx:]
    with open('src/app/network/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print('Successfully patched page.tsx')
else:
    print('Could not find SVG block bounds')
