#!/usr/bin/env python3
"""Add ARIA accessibility improvements to all HTML files."""
import re, glob, os

SKIP_LINK_CSS = """.skip-link { position: absolute; top: -40px; left: 0; background: #195157; color: white; padding: 8px 16px; z-index: 10000; font-size: 14px; }
        .skip-link:focus { top: 0; }"""

SKIP_LINK_HTML = '<a href="#main-content" class="skip-link">İçeriğe geç</a>'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Add lang="tr" to <html> if not present
    if '<html>' in content:
        content = content.replace('<html>', '<html lang="tr">')
    
    # 2. Add skip-link CSS at top of first <style> block
    if '.skip-link' not in content and '<style>' in content:
        content = content.replace('<style>', '<style>\n        ' + SKIP_LINK_CSS, 1)
    
    # 3. Add skip-link as first element in <body>
    if SKIP_LINK_HTML not in content and '<body>' in content:
        content = content.replace('<body>', '<body>\n    ' + SKIP_LINK_HTML, 1)
    
    # 4. Add role="navigation" and aria-label to nav
    # Handle <nav class="nav"> pattern
    content = re.sub(
        r'<nav\s+class="nav"(?!\s*role=)',
        '<nav class="nav" role="navigation" aria-label="Ana menü"',
        content
    )
    # Handle bare <nav> without attributes
    content = re.sub(
        r'<nav>(?!.*role=)',
        '<nav role="navigation" aria-label="Ana menü">',
        content
    )
    
    # 5. Add role="contentinfo" to footer
    # <footer class="footer">
    content = re.sub(
        r'<footer\s+class="footer"(?!\s*role=)',
        '<footer class="footer" role="contentinfo"',
        content
    )
    # bare <footer> 
    content = re.sub(
        r'<footer>(?!.*role=)',
        '<footer role="contentinfo">',
        content
    )
    
    # 6. Add id="main-content" to main content area
    if 'id="main-content"' not in content:
        # Try common patterns for main content areas
        # Pattern: first section after header, or article tag, or main tag
        if '<main' in content and 'id="main-content"' not in content:
            content = re.sub(r'<main(?=[\s>])', '<main id="main-content" role="main"', content, count=1)
        elif '<article' in content:
            content = re.sub(r'<article(?=[\s>])', '<article id="main-content" role="main"', content, count=1)
        else:
            # Find the first major section/div after header closing
            # Look for </header> and add id to next section/div
            m = re.search(r'</header>\s*\n?\s*(<(?:section|div)\s)', content)
            if m:
                tag_start = m.start(1)
                tag = m.group(1)
                content = content[:tag_start] + tag.rstrip() + 'id="main-content" role="main" ' + content[tag_start+len(tag):]
    
    # 7. Add aria-hidden="true" to decorative SVGs (inline SVGs that are inside links/buttons with text)
    # Add to SVGs that appear decorative (inside elements with other text)
    content = re.sub(
        r'<svg(?!\s[^>]*aria-)',
        '<svg aria-hidden="true"',
        content
    )
    
    # 8. Add aria-label to hamburger/mobile menu buttons
    content = re.sub(
        r'<button\s+class="hamburger"(?!\s[^>]*aria-label)',
        '<button class="hamburger" aria-label="Menüyü aç"',
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Updated: {filepath}")
    else:
        print(f"⏭️  No changes: {filepath}")

# Find all HTML files excluding node_modules and social
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for pattern in ['*.html', 'pages/**/*.html']:
    for f in glob.glob(os.path.join(base, pattern), recursive=True):
        if 'node_modules' not in f and 'social' not in f:
            process_file(f)
