#!/usr/bin/env python3
"""Add canonical, og:image, og:url, twitter:card, twitter:image to all site HTML files."""
import re, os, sys

BASE = "https://uzunyasa.com"
OG_IMAGE = f"{BASE}/images/og-default.png"
ROOT = "/data/workspace/uzunyasa-website"

# Only process site pages, not node_modules/social/scripts
DIRS = [ROOT, f"{ROOT}/pages", f"{ROOT}/pages/blog", f"{ROOT}/pages/rehberler", f"{ROOT}/pages/tedavi"]

files = []
for d in DIRS:
    if os.path.isdir(d):
        for f in sorted(os.listdir(d)):
            if f.endswith(".html"):
                files.append(os.path.join(d, f))

def get_canonical_path(filepath):
    rel = os.path.relpath(filepath, ROOT)
    if rel == "index.html":
        return "/"
    return "/" + rel

def extract_meta(html, name_attr, name_val):
    """Extract content from <meta name/property="X" content="Y">"""
    pat = rf'<meta\s+(?:name|property)="{re.escape(name_val)}"\s+content="([^"]*)"'
    m = re.search(pat, html)
    if m: return m.group(1)
    pat2 = rf'<meta\s+content="([^"]*)"\s+(?:name|property)="{re.escape(name_val)}"'
    m2 = re.search(pat2, html)
    if m2: return m2.group(1)
    return None

def extract_title(html):
    m = re.search(r'<title>([^<]+)</title>', html)
    return m.group(1) if m else ""

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    canonical_url = BASE + get_canonical_path(filepath)
    title = extract_title(html)
    desc = extract_meta(html, "name", "description") or ""
    
    additions = []
    
    # Canonical
    if 'rel="canonical"' not in html:
        additions.append(f'    <link rel="canonical" href="{canonical_url}">')
    
    # og:url
    if 'og:url' not in html:
        additions.append(f'    <meta property="og:url" content="{canonical_url}">')
    
    # og:image
    if 'og:image' not in html:
        additions.append(f'    <meta property="og:image" content="{OG_IMAGE}">')
    
    # og:title - add if missing
    if 'og:title' not in html:
        additions.append(f'    <meta property="og:title" content="{title}">')
    
    # og:description - add if missing
    if 'og:description' not in html:
        additions.append(f'    <meta property="og:description" content="{desc}">')
    
    # og:type - add if missing
    if 'og:type' not in html:
        additions.append(f'    <meta property="og:type" content="website">')
    
    # og:locale
    if 'og:locale' not in html:
        additions.append(f'    <meta property="og:locale" content="tr_TR">')
    
    # twitter:card
    if 'twitter:card' not in html:
        additions.append(f'    <meta name="twitter:card" content="summary_large_image">')
    
    # twitter:image
    if 'twitter:image' not in html:
        additions.append(f'    <meta name="twitter:image" content="{OG_IMAGE}">')
    
    # twitter:title
    if 'twitter:title' not in html:
        additions.append(f'    <meta name="twitter:title" content="{title}">')
    
    # twitter:description
    if 'twitter:description' not in html:
        additions.append(f'    <meta name="twitter:description" content="{desc}">')
    
    if not additions:
        print(f"SKIP (already complete): {os.path.relpath(filepath, ROOT)}")
        continue
    
    # Insert after the last <meta> or after <title> in <head>
    insert_text = "\n".join(additions)
    
    # Find a good insertion point: after og:locale or after last existing meta/title before <style>/<link>
    # Strategy: insert before the first <link rel="preconnect"> or <link rel="stylesheet"> or <style>
    # or before </head>
    
    # Try to insert after the last existing og: or meta description line
    patterns = [
        r'(<meta[^>]*og:locale[^>]*>)',
        r'(<meta[^>]*og:type[^>]*>)',
        r'(<meta[^>]*og:description[^>]*>)',
        r'(<meta[^>]*og:title[^>]*>)',
        r'(<meta[^>]*name="author"[^>]*>)',
        r'(<meta[^>]*name="keywords"[^>]*>)',
        r'(<meta[^>]*name="description"[^>]*>)',
        r'(<title>[^<]*</title>)',
    ]
    
    inserted = False
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            insert_pos = m.end()
            html = html[:insert_pos] + "\n" + insert_text + html[insert_pos:]
            inserted = True
            break
    
    if not inserted:
        # Fallback: insert before </head>
        html = html.replace('</head>', insert_text + "\n</head>")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    rel = os.path.relpath(filepath, ROOT)
    print(f"UPDATED: {rel} (+{len(additions)} tags)")

print("\nDone!")
