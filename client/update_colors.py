import os
import glob

files = glob.glob('src/**/*.tsx', recursive=True)
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    new_content = content.replace('text-foreground/50', 'text-muted-foreground')
    new_content = new_content.replace('text-foreground/70', 'text-muted-foreground')
    new_content = new_content.replace('text-foreground/80', 'text-muted-foreground')
    
    if content != new_content:
        with open(f, 'w') as file:
            file.write(new_content)
        print(f"Updated {f}")
