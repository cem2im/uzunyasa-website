import re, os

os.chdir('/data/workspace/uzunyasa-website')

# CSS link to add after main.css
HUB_CSS = '    <link rel="stylesheet" href="../styles/hub-upgrade.css">\n'

# Breadcrumb configs for each page
BREADCRUMBS = {
    'beslenme.html': ('Beslenme Rehberi', 'beslenme.html'),
    'egzersiz.html': ('Egzersiz Rehberi', 'egzersiz.html'),
    'tedavi.html': ('Tedavi Seçenekleri', 'tedavi.html'),
    'uyku-stres.html': ('Uyku & Stres', 'uyku-stres.html'),
    'hikayeler.html': ('Başarı Hikayeleri', 'hikayeler.html'),
    'blog.html': ('Blog', 'blog.html'),
    'bilim.html': ('Bilimsel Yaklaşım', 'bilim.html'),
    'hakkimizda.html': ('Hakkımızda', 'hakkimizda.html'),
    'araclar.html': ('Sağlık Araçları', 'araclar.html'),
    'rehberler.html': ('Rehberler', 'rehberler.html'),
}

# Related content for each page
RELATED = {
    'beslenme.html': [
        ('egzersiz.html', 'Egzersiz Rehberi', 'Hareket programları'),
        ('rehberler/akdeniz-diyeti.html', 'Akdeniz Diyeti', 'Başlangıç rehberi'),
        ('araclar.html', 'Kalori Hesaplayıcı', 'Günlük ihtiyacınız'),
    ],
    'egzersiz.html': [
        ('beslenme.html', 'Beslenme Rehberi', 'Doğru beslenme'),
        ('rehberler/evde-egzersiz.html', 'Evde Egzersiz', 'Ekipmansız antrenman'),
        ('uyku-stres.html', 'Uyku & Stres', 'Toparlanma'),
    ],
    'tedavi.html': [
        ('beslenme.html', 'Beslenme', 'İlk basamak tedavi'),
        ('egzersiz.html', 'Egzersiz', 'Hareket programları'),
        ('bilim.html', 'Bilimsel Yaklaşım', 'Kanıt seviyeleri'),
    ],
    'uyku-stres.html': [
        ('egzersiz.html', 'Egzersiz', 'Stres azaltır'),
        ('rehberler/uyku-kalitesi.html', 'Uyku Rehberi', 'Detaylı rehber'),
        ('beslenme.html', 'Beslenme', 'Uyku destekleyen besinler'),
    ],
    'hikayeler.html': [
        ('tedavi.html', 'Tedavi Seçenekleri', 'Yöntemleri keşfedin'),
        ('rehberler.html', 'Rehberler', 'Adım adım kılavuzlar'),
        ('beslenme.html', 'Beslenme', 'Sağlıklı beslenme'),
    ],
    'blog.html': [
        ('rehberler.html', 'Rehberler', 'Detaylı kılavuzlar'),
        ('bilim.html', 'Bilim', 'Kanıta dayalı yaklaşım'),
        ('hikayeler.html', 'Hikayeler', 'İlham veren hikayeler'),
    ],
    'bilim.html': [
        ('blog.html', 'Blog', 'Güncel yazılar'),
        ('tedavi.html', 'Tedavi', 'Tedavi seçenekleri'),
        ('hakkimizda.html', 'Hakkımızda', 'Ekibimiz'),
    ],
    'hakkimizda.html': [
        ('bilim.html', 'Bilimsel Yaklaşım', 'Metodolojimiz'),
        ('blog.html', 'Blog', 'Son yazılar'),
        ('hikayeler.html', 'Hikayeler', 'Başarı hikayeleri'),
    ],
    'araclar.html': [
        ('beslenme.html', 'Beslenme', 'Beslenme rehberi'),
        ('egzersiz.html', 'Egzersiz', 'Egzersiz planları'),
        ('rehberler.html', 'Rehberler', 'Tüm rehberler'),
    ],
    'rehberler.html': [
        ('blog.html', 'Blog', 'Güncel yazılar'),
        ('araclar.html', 'Araçlar', 'Hesaplayıcılar'),
        ('hikayeler.html', 'Hikayeler', 'Başarı hikayeleri'),
    ],
}

NEWSLETTER_HTML = '''
    <!-- NEWSLETTER -->
    <section class="hub-newsletter">
        <h2>📬 Haftalık Sağlık Bülteni</h2>
        <p>Bilimsel araştırmalara dayalı sağlık önerileri, yeni içerikler ve ipuçları için abone olun.</p>
        <form class="hub-newsletter-form" onsubmit="handleHubNewsletter(event, this)">
            <input type="email" name="email" placeholder="E-posta adresiniz" required>
            <button type="submit">Abone Ol</button>
        </form>
        <p class="hub-newsletter-success" id="hub-nl-success">✅ Teşekkürler! Bültenimize kaydoldunuz.</p>
    </section>'''

SOCIAL_HTML = '''
    <!-- SOCIAL SHARING -->
    <div class="hub-social-share">
        <span>Paylaş:</span>
        <a href="javascript:void(0)" onclick="window.open('https://twitter.com/intent/tweet?url='+encodeURIComponent(location.href)+'&text='+encodeURIComponent(document.title),'_blank')" class="hub-share-btn twitter" aria-label="Twitter'da Paylaş">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="javascript:void(0)" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(location.href),'_blank')" class="hub-share-btn facebook" aria-label="Facebook'ta Paylaş">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a href="javascript:void(0)" onclick="window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(document.title+' '+location.href),'_blank')" class="hub-share-btn whatsapp" aria-label="WhatsApp'ta Paylaş">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
    </div>'''

HUB_JS = '''
    <!-- HUB UPGRADE JS -->
    <script>
    // Staggered fade-in on scroll
    const hubObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                hubObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll(".hub-fade-in").forEach(el => hubObserver.observe(el));

    // Active sub-nav highlighting on scroll
    if (document.querySelector(".hub-subnav")) {
        const sections = document.querySelectorAll("section[id]");
        window.addEventListener("scroll", () => {
            let current = "";
            sections.forEach(section => {
                const top = section.offsetTop - 200;
                if (pageYOffset >= top) current = section.getAttribute("id");
            });
            document.querySelectorAll(".hub-subnav-link").forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href") === "#" + current) link.classList.add("active");
            });
        });
    }

    // Newsletter handler
    function handleHubNewsletter(e, form) {
        e.preventDefault();
        const email = form.email.value;
        localStorage.setItem("uzunyasa_subscriber", email);
        form.style.display = "none";
        document.getElementById("hub-nl-success").style.display = "block";
    }
    </script>'''

def make_breadcrumb(page_name):
    title = BREADCRUMBS[page_name][0]
    return f'''            <nav class="hero-breadcrumb">
                <a href="../index.html">Ana Sayfa</a>
                <span>›</span>
                <span class="current">{title}</span>
            </nav>'''

def make_related(page_name):
    items = RELATED[page_name]
    cards = ''
    for href, title, desc in items:
        cards += f'''
            <a href="{href}" class="hub-related-card">
                <div class="hub-related-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
                <div class="hub-related-text">
                    <h4>{title}</h4>
                    <p>{desc}</p>
                </div>
            </a>'''
    return f'''
    <!-- RELATED CONTENT -->
    <section class="hub-related">
        <h2>İlgili İçerikler</h2>
        <div class="hub-related-grid">{cards}
        </div>
    </section>'''


def process_page(filename):
    filepath = f'pages/{filename}'
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Add hub-upgrade.css if not present
    if 'hub-upgrade.css' not in content:
        content = content.replace(
            '<link rel="stylesheet" href="../styles/main.css">',
            '<link rel="stylesheet" href="../styles/main.css">\n    <link rel="stylesheet" href="../styles/hub-upgrade.css">'
        )
    
    # 2. Fix nav href="#" for "Keşfet ▾" → make it a dropdown-like link to index
    content = content.replace(
        'href="#" class="nav-link active">Keşfet ▾</a>',
        'href="rehberler.html" class="nav-link active">Keşfet ▾</a>'
    )
    content = content.replace(
        'href="#" class="nav-link">Keşfet ▾</a>',
        'href="rehberler.html" class="nav-link">Keşfet ▾</a>'
    )
    
    # Fix hakkimizda nav links
    if filename == 'hakkimizda.html':
        # Fix Araçlar and Bilim links
        content = content.replace(
            'href="#" class="nav-link">Araçlar</a>',
            'href="araclar.html" class="nav-link">Araçlar</a>'
        )
        content = content.replace(
            'href="#" class="nav-link">Bilim</a>',
            'href="bilim.html" class="nav-link">Bilim</a>'
        )
    
    # 3. Add breadcrumb to hero section
    breadcrumb = make_breadcrumb(filename)
    
    # For pages with page-hero-content
    if '<div class="page-hero-content">' in content and 'hero-breadcrumb' not in content:
        content = content.replace(
            '<div class="page-hero-content">',
            f'<div class="page-hero-content">\n{breadcrumb}'
        )
    
    # For blog.html with blog-hero-content
    if filename == 'blog.html' and 'hero-breadcrumb' not in content:
        content = content.replace(
            '<div class="blog-hero-content">',
            f'<div class="blog-hero-content">\n{breadcrumb}'
        )
    
    # 4. Add hub-fade-in class to card grids (topic-card, guide-card, etc.)
    # Add class to individual cards in grids
    for card_class in ['topic-card', 'guide-card', 'story-card', 'post-card', 'method-card', 'value-card', 'program-card', 'treatment-card']:
        content = content.replace(
            f'class="{card_class}"',
            f'class="{card_class} hub-fade-in"'
        )
        # Also for cards that start with the class (e.g. with additional classes)
    
    # 5. Add newsletter, related content, social share before footer
    if 'hub-newsletter' not in content:
        # Find the footer and insert before it
        footer_marker = '    <!-- FOOTER -->' if '    <!-- FOOTER -->' in content else '    <footer class="footer">'
        if footer_marker in content:
            insert = make_related(filename) + NEWSLETTER_HTML + SOCIAL_HTML + '\n\n'
            content = content.replace(footer_marker, insert + footer_marker)
    
    # 6. Add JS before </body>
    if 'hubObserver' not in content:
        content = content.replace('</body>', HUB_JS + '\n</body>')
    
    # 7. Fix remaining href="#" links per page
    if filename == 'egzersiz.html':
        # Fix exercise type cards - map to actual subpages
        replacements = [
            ('href="#" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <circle cx="12" cy="12" r="10"/>\n                        <path d="M12 6v6l4 2"/>\n                    </svg>\n                </div>\n                <h3>Kardiyovasküler Egzersiz</h3>',
             'href="egzersiz/kardiyovaskular.html" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <circle cx="12" cy="12" r="10"/>\n                        <path d="M12 6v6l4 2"/>\n                    </svg>\n                </div>\n                <h3>Kardiyovasküler Egzersiz</h3>'),
            ('href="#" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M6.5 6.5L17.5 17.5"/>\n                        <path d="M6.5 17.5L17.5 6.5"/>\n                        <circle cx="12" cy="12" r="9"/>\n                    </svg>\n                </div>\n                <h3>Kuvvet Antrenmanı</h3>',
             'href="egzersiz/kuvvet-antrenman.html" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M6.5 6.5L17.5 17.5"/>\n                        <path d="M6.5 17.5L17.5 6.5"/>\n                        <circle cx="12" cy="12" r="9"/>\n                    </svg>\n                </div>\n                <h3>Kuvvet Antrenmanı</h3>'),
            ('href="#" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>\n                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>\n                    </svg>\n                </div>\n                <h3>Esneklik & Mobilite</h3>',
             'href="egzersiz/esneklik-mobilite.html" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>\n                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>\n                    </svg>\n                </div>\n                <h3>Esneklik & Mobilite</h3>'),
            ('href="#" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>\n                    </svg>\n                </div>\n                <h3>HIIT & Tabata</h3>',
             'href="egzersiz/hiit-tabata.html" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>\n                    </svg>\n                </div>\n                <h3>HIIT & Tabata</h3>'),
            ('href="#" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>\n                        <circle cx="9" cy="7" r="4"/>\n                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>\n                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>\n                    </svg>\n                </div>\n                <h3>Grup Egzersizleri</h3>',
             'href="egzersiz/grup-egzersizleri.html" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>\n                        <circle cx="9" cy="7" r="4"/>\n                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>\n                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>\n                    </svg>\n                </div>\n                <h3>Grup Egzersizleri</h3>'),
        ]
        for old, new in replacements:
            content = content.replace(old, new)
        
        # Rehabilitasyon - no subpage, make coming soon
        content = content.replace(
            'href="#" class="topic-card hub-fade-in">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>\n                    </svg>\n                </div>\n                <h3>Rehabilitasyon</h3>',
            'href="javascript:void(0)" class="topic-card hub-fade-in hub-coming-soon-card">\n                <div class="topic-icon">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>\n                    </svg>\n                </div>\n                <h3>Rehabilitasyon</h3>'
        )
    
    if filename == 'tedavi.html':
        content = content.replace('href="#">Davranışsal Terapi', 'href="tedavi/davranissal-terapi.html">Davranışsal Terapi')
        content = content.replace('href="#">Orlistat', 'href="tedavi/orlistat.html">Orlistat')
        content = content.replace('href="#">Naltrexone/Bupropion', 'href="tedavi/naltrexone-bupropion.html">Naltrexone/Bupropion')
        content = content.replace('href="#">Kombinasyon Tedavileri', 'href="tedavi/kombinasyon-tedavileri.html">Kombinasyon Tedavileri')
        content = content.replace('href="#">Yan Etkiler & Riskler', 'href="tedavi/yan-etkiler-riskler.html">Yan Etkiler & Riskler')
        content = content.replace('href="#">Ameliyat Öncesi Hazırlık', 'href="tedavi/ameliyat-oncesi-hazirlik.html">Ameliyat Öncesi Hazırlık')
        content = content.replace('href="#">Uzun Vadeli Takip', 'href="tedavi/uzun-vadeli-takip.html">Uzun Vadeli Takip')
    
    if filename == 'hikayeler.html':
        # Story links - no individual story pages exist, make coming soon
        content = content.replace(
            '<a href="#" class="story-link">Devamını oku →</a>',
            '<span class="hub-coming-soon">🔜 Yakında</span>'
        )
        content = content.replace(
            '<a href="#" class="btn-white">Hikayemi Paylaş</a>',
            '<a href="hakkimizda.html#iletisim" class="btn-white">Hikayemi Paylaş</a>'
        )
        content = content.replace(
            '<a href="#" class="btn-outline-white">Teste Başla</a>',
            '<a href="test.html" class="btn-outline-white">Teste Başla</a>'
        )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f'  ✅ {filename}')


# Process all pages
pages = ['beslenme.html', 'egzersiz.html', 'tedavi.html', 'uyku-stres.html', 
         'hikayeler.html', 'blog.html', 'bilim.html', 'hakkimizda.html', 
         'araclar.html', 'rehberler.html']

print('Upgrading hub pages...')
for page in pages:
    try:
        process_page(page)
    except Exception as e:
        print(f'  ❌ {page}: {e}')

print('Done!')
