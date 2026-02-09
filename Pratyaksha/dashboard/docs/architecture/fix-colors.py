import os
import re

# Read the existing script
with open('generate-html-docs.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: Make body text white instead of gray
content = content.replace("color: #e5e5e5;", "color: #ffffff;")

# Fix: Make list items white
content = content.replace("color: #e5e5e5;", "color: #ffffff;")

# Fix: Make all text elements more readable
content = re.sub(r"color: #e5e5e5", "color: #ffffff", content)

# Save the fixed version
with open('generate-html-docs.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed text colors to be more readable")
