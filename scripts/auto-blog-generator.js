#!/usr/bin/env node
/**
 * UzunYaşa Auto Blog Generator v2.0
 * Research-Driven Evidence-Based Blog Pipeline
 *
 * Pipeline: Discover → Research → Generate → Publish
 *
 * Sources:
 *   - PubMed (scientific papers, NCBI E-utilities)
 *   - ClinicalTrials.gov v2 (clinical trials, free JSON API)
 *   - Google News RSS (health news headlines)
 *   - Brave Search (optional, needs BRAVE_API_KEY)
 *
 * USAGE:
 *   node auto-blog-generator.js                     # Full pipeline
 *   node auto-blog-generator.js --topic "Konu"      # Research specific topic
 *   node auto-blog-generator.js --discover           # Show trending topics only
 *   node auto-blog-generator.js --area glp1          # Focus on one research area
 *   node auto-blog-generator.js --deploy             # Generate + git commit/push
 *   node auto-blog-generator.js --pool               # Legacy mode (static topic pool)
 *   node auto-blog-generator.js --search-only "q"    # Search only, no generation
 *   node auto-blog-generator.js --dry-run            # Full pipeline, don't write files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// =============================================================================
// CONFIGURATION
// =============================================================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const BRAVE_API_KEY = process.env.BRAVE_API_KEY; // Optional

// Determine which LLM provider to use
const LLM_PROVIDER = ANTHROPIC_API_KEY ? 'anthropic' : (XAI_API_KEY ? 'xai' : null);
const LLM_MODEL = ANTHROPIC_API_KEY ? 'claude-sonnet-4-20250514' : 'grok-3-mini';
const OUTPUT_DIR = path.join(__dirname, '../pages/blog');
const BLOG_INDEX = path.join(__dirname, '../data/blog-posts.json');
const HISTORY_FILE = path.join(__dirname, '../data/blog-history.json');

const REQUEST_TIMEOUT = 15000; // 15s per request
const PUBMED_DELAY = 350; // PubMed rate limit: 3 req/s without API key

// =============================================================================
// RESEARCH AREAS (10 areas, all daily scanning)
// =============================================================================

const RESEARCH_AREAS = {
  glp1: {
    name: 'GLP-1 & Obezite İlaçları',
    pubmed: [
      '(GLP-1 receptor agonist) AND (obesity OR weight loss) AND (2025[dp] OR 2026[dp])',
      '(semaglutide OR tirzepatide OR retatrutide OR orforglipron) AND (clinical trial[pt])'
    ],
    news: ['GLP-1 obesity drug study 2025', 'semaglutide tirzepatide weight loss news'],
    trials: ['semaglutide OR tirzepatide OR retatrutide OR orforglipron OR survodutide'],
    category: 'tedavi'
  },
  bariatric: {
    name: 'Bariatrik & Endoskopik Prosedürler',
    pubmed: [
      '(endoscopic sleeve gastroplasty) AND (2024[dp] OR 2025[dp] OR 2026[dp])',
      '(bariatric endoscopy) AND (outcome OR efficacy)'
    ],
    news: ['bariatric endoscopy study results', 'endoscopic sleeve gastroplasty news'],
    trials: ['endoscopic sleeve gastroplasty OR intragastric balloon OR ESG bariatric'],
    category: 'tedavi'
  },
  nutrition: {
    name: 'Beslenme Bilimi',
    pubmed: [
      '(Mediterranean diet OR DASH diet) AND (clinical trial[pt]) AND (2024[dp] OR 2025[dp] OR 2026[dp])',
      '(intermittent fasting OR time-restricted eating) AND (metabolic health OR obesity)'
    ],
    news: ['nutrition science study results 2025', 'Mediterranean diet health research'],
    trials: ['Mediterranean diet OR intermittent fasting OR time-restricted eating'],
    category: 'beslenme'
  },
  longevity: {
    name: 'Uzun Ömür & Yaşlanma Bilimi',
    pubmed: [
      '(longevity OR aging) AND (intervention OR therapy) AND (human) AND (2024[dp] OR 2025[dp] OR 2026[dp])',
      '(rapamycin OR metformin OR senolytics OR NAD+) AND (aging OR longevity) AND (clinical)'
    ],
    news: ['longevity research breakthrough 2025', 'anti-aging science clinical trial'],
    trials: ['metformin aging OR rapamycin longevity OR senolytics OR NAD aging'],
    category: 'bilim'
  },
  sleep_stress: {
    name: 'Uyku, Stres & Yaşam Tarzı',
    pubmed: [
      '(sleep quality OR sleep duration) AND (obesity OR metabolic) AND (2024[dp] OR 2025[dp] OR 2026[dp])',
      '(stress OR cortisol) AND (weight OR obesity) AND (intervention)'
    ],
    news: ['sleep health research study', 'stress weight gain science'],
    trials: ['sleep intervention obesity OR stress reduction metabolic health'],
    category: 'yasam-tarzi'
  },
  turkey_health: {
    name: 'Türkiye Sağlık Verileri',
    pubmed: [
      '(Turkey OR Turkish) AND (obesity OR metabolic syndrome) AND (prevalence OR epidemiology)',
      '(Turkey) AND (diabetes OR cardiovascular) AND (2024[dp] OR 2025[dp] OR 2026[dp])'
    ],
    news: ['Türkiye obezite sağlık istatistik', 'Turkey health obesity statistics'],
    trials: [],
    category: 'bilim'
  },
  cancer_obesity: {
    name: 'Kanser & Obezite',
    pubmed: [
      '(obesity) AND (cancer risk OR oncogenesis) AND (mechanism OR epidemiology) AND (2024[dp] OR 2025[dp] OR 2026[dp])',
      '(GLP-1 OR semaglutide) AND (cancer) AND (2024[dp] OR 2025[dp] OR 2026[dp])'
    ],
    news: ['obesity cancer risk study 2025', 'weight loss cancer prevention research'],
    trials: ['obesity cancer prevention OR GLP-1 cancer OR weight loss malignancy'],
    category: 'bilim'
  },
  mental_health: {
    name: 'Ruh Sağlığı & Kilo',
    pubmed: [
      '(obesity) AND (depression OR anxiety OR mental health) AND (2024[dp] OR 2025[dp] OR 2026[dp])',
      '(GLP-1 OR semaglutide) AND (psychiatric OR depression OR suicidal)'
    ],
    news: ['obesity mental health depression study', 'weight loss psychological wellbeing research'],
    trials: ['semaglutide depression OR obesity mental health intervention'],
    category: 'yasam-tarzi'
  },
  cardiovascular: {
    name: 'Kardiyovasküler Risk',
    pubmed: [
      '(GLP-1 receptor agonist) AND (cardiovascular outcome) AND (2024[dp] OR 2025[dp] OR 2026[dp])',
      '(obesity) AND (heart failure OR atherosclerosis) AND (prevention) AND (2024[dp] OR 2025[dp] OR 2026[dp])'
    ],
    news: ['GLP-1 heart disease study SELECT trial', 'obesity cardiovascular risk reduction'],
    trials: ['semaglutide cardiovascular OR tirzepatide heart OR SELECT trial OR SURMOUNT'],
    category: 'bilim'
  },
  gi_diseases: {
    name: 'Gastrointestinal Hastalıklar',
    pubmed: [
      '(NAFLD OR NASH OR MASLD) AND (treatment OR therapy) AND (2024[dp] OR 2025[dp] OR 2026[dp])',
      '(inflammatory bowel disease OR IBS) AND (obesity OR metabolic) AND (2024[dp] OR 2025[dp] OR 2026[dp])'
    ],
    news: ['fatty liver disease NASH treatment news', 'GI disease obesity study 2025'],
    trials: ['NASH treatment OR MASLD OR GLP-1 liver OR resmetirom'],
    category: 'tedavi'
  }
};

// =============================================================================
// PRIORITY & FILTERING
// =============================================================================

const PRIORITY_TRIGGERS = {
  urgent: [
    'FDA approves', 'EMA approves', 'FDA onayladı',
    'Phase 3 results', 'Phase III results',
    'first-in-class', 'pivotal trial',
    'first oral', 'novel mechanism',
    'guideline update', 'Cochrane review'
  ],
  high: [
    'clinical trial results', 'randomized controlled',
    'meta-analysis', 'systematic review',
    'conference presentation',
    'Phase 2 results', 'Phase II results',
    'large cohort', 'prospective study',
    'landmark trial'
  ],
  normal: [
    'Phase 1', 'observational study', 'review article',
    'lifestyle research', 'cohort study', 'cross-sectional',
    'pilot study', 'case series', 'retrospective'
  ]
};

const EXCLUDE_PATTERNS = [
  /celebrity|influencer|sponsored|advertisement/i,
  /miracle|secret|shocking|clickbait/i,
  /unverified|supplement promotion/i,
  /weight loss hack|belly fat trick|doctors hate/i,
  /buy now|limited offer|discount code/i
];

const TRUSTED_DOMAINS = new Set([
  'nejm.org', 'thelancet.com', 'jamanetwork.com', 'bmj.com',
  'nature.com', 'cell.com', 'science.org', 'ahajournals.org',
  'diabetesjournals.org', 'academic.oup.com',
  'fda.gov', 'ema.europa.eu', 'who.int',
  'statnews.com', 'reuters.com', 'medscape.com',
  'pubmed.ncbi.nlm.nih.gov', 'europepmc.org', 'clinicaltrials.gov',
  'mayoclinic.org', 'clevelandclinic.org', 'health.harvard.edu',
  'medicalnewstoday.com', 'healthline.com',
  'novonordisk.com', 'lilly.com', 'endpts.com',
  'saglik.gov.tr', 'titck.gov.tr', 'tuik.gov.tr'
]);

function detectPriority(text) {
  const lower = text.toLowerCase();
  for (const trigger of PRIORITY_TRIGGERS.urgent) {
    if (lower.includes(trigger.toLowerCase())) return 'urgent';
  }
  for (const trigger of PRIORITY_TRIGGERS.high) {
    if (lower.includes(trigger.toLowerCase())) return 'high';
  }
  return 'normal';
}

function isExcluded(text) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(text));
}

function isTrustedSource(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return [...TRUSTED_DOMAINS].some(domain => hostname.endsWith(domain));
  } catch {
    return false;
  }
}

// Core topics for UzunYasa — these get a relevance bonus
const CORE_KEYWORDS = [
  'obesity', 'obezite', 'weight loss', 'kilo', 'overweight',
  'glp-1', 'semaglutide', 'tirzepatide', 'ozempic', 'wegovy', 'mounjaro', 'zepbound',
  'bariatric', 'endoscopic sleeve', 'gastric', 'mide',
  'longevity', 'aging', 'yaşlanma', 'lifespan',
  'metabolic', 'diabetes', 'diyabet', 'insulin',
  'cardiovascular', 'heart', 'kalp',
  'nafld', 'nash', 'masld', 'liver', 'karaciğer',
  'cancer', 'kanser', 'malignancy',
  'nutrition', 'diet', 'beslenme', 'fasting', 'oruç',
  'exercise', 'egzersiz', 'muscle', 'kas', 'sarcopenia',
  'sleep', 'uyku', 'circadian',
  'mental health', 'depression', 'depresyon', 'anxiety'
];

function scoreFinding(finding) {
  let score = 0;
  // Priority
  if (finding.priority === 'urgent') score += 100;
  else if (finding.priority === 'high') score += 50;
  else score += 10;
  // Source trust
  if (finding.trusted) score += 30;
  // Recency (papers from current year get bonus)
  const currentYear = new Date().getFullYear();
  if (finding.year >= currentYear) score += 20;
  else if (finding.year >= currentYear - 1) score += 10;
  // Has abstract/summary
  if (finding.abstract && finding.abstract.length > 200) score += 15;
  // Journal impact (rough heuristic)
  const highImpact = ['nejm', 'lancet', 'nature', 'jama', 'bmj', 'cell'];
  if (finding.journal && highImpact.some(j => finding.journal.toLowerCase().includes(j))) score += 25;
  // Core topic relevance — UzunYasa is about obesity, longevity, nutrition, GLP-1
  const text = `${finding.title} ${finding.abstract || ''}`.toLowerCase();
  const coreMatches = CORE_KEYWORDS.filter(kw => text.includes(kw)).length;
  score += Math.min(coreMatches * 15, 60); // up to +60 for relevance
  // Penalty for clearly off-topic (no core keyword match at all)
  if (coreMatches === 0) score -= 30;
  return score;
}

// =============================================================================
// SEARCH ENGINES
// =============================================================================

async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error(`Timeout: ${url}`);
    throw err;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search PubMed via NCBI E-utilities
 * Free, no key needed (3 req/s limit)
 * Step 1: esearch → PMIDs
 * Step 2: efetch → full records with abstracts
 * Docs: https://www.ncbi.nlm.nih.gov/books/NBK25499/
 */
async function searchPubMed(query, maxResults = 5) {
  const results = [];
  try {
    // Step 1: Search for PMIDs
    const searchParams = new URLSearchParams({
      db: 'pubmed',
      term: query,
      retmax: String(maxResults),
      sort: 'date',
      retmode: 'json'
    });
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`;
    const searchResponse = await fetchWithTimeout(searchUrl);
    if (!searchResponse.ok) throw new Error(`PubMed esearch ${searchResponse.status}`);
    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];

    if (pmids.length === 0) return results;
    await sleep(PUBMED_DELAY);

    // Step 2: Fetch summaries (JSON)
    const summaryParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'json'
    });
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`;
    const summaryResponse = await fetchWithTimeout(summaryUrl);
    if (!summaryResponse.ok) throw new Error(`PubMed esummary ${summaryResponse.status}`);
    const summaryData = await summaryResponse.json();
    await sleep(PUBMED_DELAY);

    // Step 3: Fetch abstracts (XML — PubMed only returns abstracts in XML)
    const fetchParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      rettype: 'abstract',
      retmode: 'xml'
    });
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${fetchParams}`;
    const fetchResponse = await fetchWithTimeout(fetchUrl);
    const xml = fetchResponse.ok ? await fetchResponse.text() : '';

    // Parse abstracts from XML
    const abstractMap = {};
    const articleBlocks = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
    for (const block of articleBlocks) {
      const pmidMatch = block.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      const abstractParts = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g) || [];
      if (pmidMatch) {
        abstractMap[pmidMatch[1]] = abstractParts
          .map(p => p.replace(/<[^>]+>/g, '').trim())
          .join(' ');
      }
    }

    // Build results
    const uids = summaryData.result?.uids || pmids;
    for (const pmid of uids) {
      const article = summaryData.result?.[pmid];
      if (!article || !article.title) continue;

      const title = article.title.replace(/<[^>]+>/g, '');
      const authors = (article.authors || []).map(a => a.name).join(', ');
      const journal = article.fulljournalname || article.source || '';
      const pubDate = article.pubdate || article.sortpubdate || '';
      const doi = (article.articleids || []).find(a => a.idtype === 'doi')?.value || '';
      const abstract = abstractMap[pmid] || '';
      const year = parseInt(pubDate) || new Date().getFullYear();

      const text = `${title} ${abstract}`;
      if (isExcluded(text)) continue;

      results.push({
        type: 'paper',
        title,
        abstract,
        authors,
        journal,
        year,
        doi,
        pmid,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        source: 'pubmed',
        priority: detectPriority(text),
        trusted: true,
        citedByCount: 0
      });
    }
  } catch (err) {
    console.warn(`⚠️  PubMed arama hatası: ${err.message}`);
  }
  return results;
}

/**
 * Search ClinicalTrials.gov v2 API
 * Free JSON API, no key needed
 * Docs: https://clinicaltrials.gov/data-api/api
 */
async function searchClinicalTrials(query, maxResults = 5) {
  if (!query) return [];
  const results = [];
  try {
    const params = new URLSearchParams({
      'query.term': query,
      pageSize: String(maxResults),
      sort: 'LastUpdatePostDate',
      format: 'json'
    });
    const url = `https://clinicaltrials.gov/api/v2/studies?${params}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`ClinicalTrials.gov ${response.status}`);
    const data = await response.json();

    for (const study of (data.studies || [])) {
      const proto = study.protocolSection || {};
      const id = proto.identificationModule || {};
      const status = proto.statusModule || {};
      const design = proto.designModule || {};
      const desc = proto.descriptionModule || {};
      const enrollment = design.enrollmentInfo?.count || 0;

      const title = id.briefTitle || id.officialTitle || 'Untitled';
      const summary = desc.briefSummary || '';
      const text = `${title} ${summary}`;
      if (isExcluded(text)) continue;

      results.push({
        type: 'trial',
        title: title,
        abstract: summary,
        nctId: id.nctId || '',
        status: status.overallStatus || '',
        phase: (design.phases || []).join(', '),
        enrollment: enrollment,
        url: id.nctId ? `https://clinicaltrials.gov/study/${id.nctId}` : '',
        source: 'clinicaltrials',
        priority: detectPriority(text),
        trusted: true,
        year: new Date().getFullYear()
      });
    }
  } catch (err) {
    console.warn(`⚠️  ClinicalTrials.gov arama hatası: ${err.message}`);
  }
  return results;
}

/**
 * Scrape Medscape latest news
 * Free, no key needed
 */
async function searchMedscape(query, maxResults = 5) {
  const results = [];
  try {
    // Medscape search via Google site: search (more reliable than direct)
    const googleQuery = `site:medscape.com ${query}`;
    const googleNews = await searchGoogleNews(googleQuery, maxResults);
    for (const item of googleNews) {
      item.source = 'medscape';
      item.trusted = true;
      results.push(item);
    }
  } catch (err) {
    console.warn(`⚠️  Medscape arama hatası: ${err.message}`);
  }
  return results;
}

/**
 * Search Harvard Health Publishing
 * Free, no key needed
 */
async function searchHarvardHealth(query, maxResults = 5) {
  const results = [];
  try {
    const googleQuery = `site:health.harvard.edu ${query}`;
    const googleNews = await searchGoogleNews(googleQuery, maxResults);
    for (const item of googleNews) {
      item.source = 'harvard_health';
      item.trusted = true;
      results.push(item);
    }
  } catch (err) {
    console.warn(`⚠️  Harvard Health arama hatası: ${err.message}`);
  }
  return results;
}

/**
 * Search STAT News (health/pharma journalism)
 * Via Google News RSS for reliability
 */
async function searchSTATNews(query, maxResults = 5) {
  const results = [];
  try {
    const googleQuery = `site:statnews.com ${query}`;
    const googleNews = await searchGoogleNews(googleQuery, maxResults);
    for (const item of googleNews) {
      item.source = 'statnews';
      item.trusted = true;
      results.push(item);
    }
  } catch (err) {
    console.warn(`⚠️  STAT News arama hatası: ${err.message}`);
  }
  return results;
}

/**
 * Search Mayo Clinic health articles
 * Via Google News RSS for reliability
 */
async function searchMayoClinic(query, maxResults = 5) {
  const results = [];
  try {
    const googleQuery = `site:mayoclinic.org ${query}`;
    const googleNews = await searchGoogleNews(googleQuery, maxResults);
    for (const item of googleNews) {
      item.source = 'mayo_clinic';
      item.trusted = true;
      results.push(item);
    }
  } catch (err) {
    console.warn(`⚠️  Mayo Clinic arama hatası: ${err.message}`);
  }
  return results;
}

/**
 * Search Cleveland Clinic health articles
 * Via Google News RSS for reliability
 */
async function searchClevelandClinic(query, maxResults = 5) {
  const results = [];
  try {
    const googleQuery = `site:clevelandclinic.org ${query}`;
    const googleNews = await searchGoogleNews(googleQuery, maxResults);
    for (const item of googleNews) {
      item.source = 'cleveland_clinic';
      item.trusted = true;
      results.push(item);
    }
  } catch (err) {
    console.warn(`⚠️  Cleveland Clinic arama hatası: ${err.message}`);
  }
  return results;
}

/**
 * Search FDA Drug Approvals & Safety
 * Free openFDA API, no key needed
 */
async function searchFDA(query, maxResults = 5) {
  const results = [];
  try {
    // Search drug labels for recent changes
    const params = new URLSearchParams({
      search: `openfda.generic_name:"${query}" OR openfda.brand_name:"${query}"`,
      limit: String(maxResults),
      sort: 'effective_time:desc'
    });
    const url = `https://api.fda.gov/drug/label.json?${params}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) return results;
    const data = await response.json();

    for (const item of (data.results || [])) {
      const brandName = item.openfda?.brand_name?.[0] || '';
      const genericName = item.openfda?.generic_name?.[0] || '';
      const purpose = (item.purpose || []).join(', ').substring(0, 200);
      const title = `FDA: ${brandName || genericName} Label Update`;

      results.push({
        type: 'fda',
        title,
        abstract: purpose || `${brandName} (${genericName})`,
        url: `https://www.fda.gov/drugs`,
        source: 'fda',
        priority: detectPriority(title),
        trusted: true,
        year: new Date().getFullYear()
      });
    }
  } catch (err) {
    console.warn(`⚠️  FDA API hatası: ${err.message}`);
  }
  return results;
}

/**
 * Search Google News via RSS
 * Free, no API key needed
 */
async function searchGoogleNews(query, maxResults = 5) {
  const results = [];
  try {
    const params = new URLSearchParams({
      q: query,
      hl: 'en',
      gl: 'US',
      ceid: 'US:en'
    });
    const url = `https://news.google.com/rss/search?${params}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Google News RSS ${response.status}`);
    const xml = await response.text();

    // Simple XML extraction (no external deps)
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    for (const item of items.slice(0, maxResults)) {
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
      const link = (item.match(/<link>(.*?)<\/link>/) || item.match(/<link\/>\s*(.*?)[\s<]/) || [])[1] || '';
      const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
      const description = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/) || [])[1] || '';

      const cleanTitle = title.replace(/<[^>]+>/g, '').trim();
      const cleanDesc = description.replace(/<[^>]+>/g, '').trim();
      const text = `${cleanTitle} ${cleanDesc}`;
      if (isExcluded(text) || !cleanTitle) continue;

      results.push({
        type: 'news',
        title: cleanTitle,
        abstract: cleanDesc,
        url: link,
        pubDate: pubDate,
        source: 'google_news',
        priority: detectPriority(text),
        trusted: isTrustedSource(link),
        year: pubDate ? new Date(pubDate).getFullYear() : new Date().getFullYear()
      });
    }
  } catch (err) {
    console.warn(`⚠️  Google News arama hatası: ${err.message}`);
  }
  return results;
}

/**
 * Search Brave Web Search API (optional)
 * Needs BRAVE_API_KEY environment variable
 */
async function searchBrave(query, maxResults = 5) {
  if (!BRAVE_API_KEY) return [];
  const results = [];
  try {
    const params = new URLSearchParams({
      q: query,
      count: String(maxResults),
      freshness: 'pm' // past month
    });
    const url = `https://api.search.brave.com/res/v1/web/search?${params}`;
    const response = await fetchWithTimeout(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });
    if (!response.ok) throw new Error(`Brave Search ${response.status}`);
    const data = await response.json();

    for (const result of (data.web?.results || [])) {
      const text = `${result.title} ${result.description || ''}`;
      if (isExcluded(text)) continue;

      results.push({
        type: 'web',
        title: result.title,
        abstract: result.description || '',
        url: result.url,
        source: 'brave',
        priority: detectPriority(text),
        trusted: isTrustedSource(result.url),
        year: new Date().getFullYear()
      });
    }
  } catch (err) {
    console.warn(`⚠️  Brave Search hatası: ${err.message}`);
  }
  return results;
}

/**
 * Fetch and extract readable text from a URL
 * Simple HTML → text extraction
 */
async function fetchArticleText(url, maxChars = 3000) {
  try {
    const response = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'UzunYasa-Research-Bot/2.0' }
    });
    if (!response.ok) return '';
    const html = await response.text();

    // Extract text from common article tags
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '');

    // Try to find article body
    const articleMatch = text.match(/<article[\s\S]*?<\/article>/i);
    if (articleMatch) text = articleMatch[0];

    // Strip remaining HTML
    text = text.replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return text.substring(0, maxChars);
  } catch {
    return '';
  }
}

// =============================================================================
// RESEARCH PIPELINE
// =============================================================================

/**
 * Scan all research areas and collect findings
 */
async function discoverTopics(focusArea = null) {
  console.log('\n🔍 Araştırma taraması başlıyor...\n');
  const allFindings = [];
  const areas = focusArea ? { [focusArea]: RESEARCH_AREAS[focusArea] } : RESEARCH_AREAS;

  if (focusArea && !RESEARCH_AREAS[focusArea]) {
    console.error(`❌ Bilinmeyen alan: ${focusArea}`);
    console.log(`   Geçerli alanlar: ${Object.keys(RESEARCH_AREAS).join(', ')}`);
    process.exit(1);
  }

  for (const [areaKey, area] of Object.entries(areas)) {
    console.log(`📡 ${area.name}...`);

    // Search PubMed (scientific papers)
    for (const query of area.pubmed) {
      const papers = await searchPubMed(query, 3);
      for (const p of papers) { p.area = areaKey; p.areaName = area.name; }
      allFindings.push(...papers);
      await sleep(PUBMED_DELAY);
    }

    // Search ClinicalTrials.gov
    for (const query of area.trials) {
      const trials = await searchClinicalTrials(query, 3);
      for (const t of trials) { t.area = areaKey; t.areaName = area.name; }
      allFindings.push(...trials);
      await sleep(200);
    }

    // Search Google News
    for (const query of area.news) {
      const news = await searchGoogleNews(query, 3);
      for (const n of news) { n.area = areaKey; n.areaName = area.name; }
      allFindings.push(...news);
      await sleep(200);
    }

    // Search trusted health sites (parallel per area, top query only)
    if (area.news[0]) {
      const q = area.news[0];
      const [medscape, harvard, stat, mayo, cleveland] = await Promise.all([
        searchMedscape(q, 2),
        searchHarvardHealth(q, 2),
        searchSTATNews(q, 2),
        searchMayoClinic(q, 2),
        searchClevelandClinic(q, 2)
      ]);
      const siteResults = [...medscape, ...harvard, ...stat, ...mayo, ...cleveland];
      for (const r of siteResults) { r.area = areaKey; r.areaName = area.name; }
      allFindings.push(...siteResults);
      await sleep(300);
    }

    // Search Brave (if available)
    if (BRAVE_API_KEY) {
      for (const query of area.news) {
        const web = await searchBrave(query, 3);
        for (const w of web) { w.area = areaKey; w.areaName = area.name; }
        allFindings.push(...web);
        await sleep(200);
      }
    }
  }

  // Score and sort
  for (const f of allFindings) {
    f.score = scoreFinding(f);
  }
  allFindings.sort((a, b) => b.score - a.score);

  // Deduplicate by title similarity
  const seen = new Set();
  const unique = allFindings.filter(f => {
    const key = f.title.toLowerCase().substring(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\n✅ Toplam ${unique.length} benzersiz bulgu (${allFindings.length} ham sonuçtan)\n`);
  return unique;
}

/**
 * Deep research on a specific topic
 * Fetches more papers, trials, and article content
 */
async function conductDeepResearch(topic, area = null) {
  console.log(`\n🔬 Derin araştırma: "${topic}"\n`);
  const findings = { papers: [], trials: [], news: [], articles: [] };

  // Search for papers on this specific topic
  const paperQueries = [
    topic,
    topic.replace(/[^a-zA-Z0-9\s]/g, '').trim() // clean version
  ];

  for (const query of paperQueries) {
    const papers = await searchPubMed(query, 5);
    findings.papers.push(...papers);
    await sleep(PUBMED_DELAY);
  }

  // Search clinical trials
  const trialQuery = topic.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const trials = await searchClinicalTrials(trialQuery, 5);
  findings.trials.push(...trials);

  // Search news from multiple sources in parallel
  const [news, medscape, harvard, stat, mayo, cleveland] = await Promise.all([
    searchGoogleNews(topic, 5),
    searchMedscape(topic, 3),
    searchHarvardHealth(topic, 3),
    searchSTATNews(topic, 3),
    searchMayoClinic(topic, 3),
    searchClevelandClinic(topic, 3)
  ]);
  findings.news.push(...news, ...medscape, ...harvard, ...stat, ...mayo, ...cleveland);

  // Brave search if available
  if (BRAVE_API_KEY) {
    const braveResults = await searchBrave(topic, 5);
    findings.news.push(...braveResults);
  }

  // Fetch article text from top trusted sources (up to 3)
  const trustedUrls = [
    ...findings.papers.filter(p => p.url && p.trusted).map(p => p.url),
    ...findings.news.filter(n => n.url && n.trusted).map(n => n.url)
  ].slice(0, 3);

  for (const url of trustedUrls) {
    console.log(`📄 Makale çekiliyor: ${url.substring(0, 80)}...`);
    const text = await fetchArticleText(url);
    if (text.length > 100) {
      findings.articles.push({ url, text: text.substring(0, 2000) });
    }
    await sleep(500);
  }

  // Deduplicate
  const seenPapers = new Set();
  findings.papers = findings.papers.filter(p => {
    const key = (p.doi || p.title.substring(0, 50)).toLowerCase();
    if (seenPapers.has(key)) return false;
    seenPapers.add(key);
    return true;
  });

  console.log(`   📚 ${findings.papers.length} makale, 🧪 ${findings.trials.length} klinik çalışma, 📰 ${findings.news.length} haber, 📄 ${findings.articles.length} tam metin`);
  return findings;
}

/**
 * Build research context string for Claude
 */
function buildResearchContext(findings) {
  const sections = [];

  if (findings.papers.length > 0) {
    sections.push('## Bilimsel Makaleler (PubMed)\n');
    for (const p of findings.papers.slice(0, 8)) {
      sections.push(`### ${p.title}`);
      if (p.authors) sections.push(`Yazarlar: ${p.authors}`);
      if (p.journal) sections.push(`Dergi: ${p.journal} (${p.year})`);
      if (p.doi) sections.push(`DOI: ${p.doi}`);
      if (p.citedByCount) sections.push(`Atıf: ${p.citedByCount}`);
      if (p.abstract) sections.push(`Özet: ${p.abstract.substring(0, 500)}`);
      sections.push('');
    }
  }

  if (findings.trials.length > 0) {
    sections.push('## Klinik Çalışmalar (ClinicalTrials.gov)\n');
    for (const t of findings.trials.slice(0, 5)) {
      sections.push(`### ${t.title}`);
      if (t.nctId) sections.push(`NCT: ${t.nctId}`);
      if (t.status) sections.push(`Durum: ${t.status}`);
      if (t.phase) sections.push(`Faz: ${t.phase}`);
      if (t.enrollment) sections.push(`Katılımcı: ${t.enrollment}`);
      if (t.abstract) sections.push(`Özet: ${t.abstract.substring(0, 400)}`);
      sections.push('');
    }
  }

  if (findings.news.length > 0) {
    sections.push('## Güncel Haberler\n');
    for (const n of findings.news.slice(0, 5)) {
      sections.push(`- **${n.title}**`);
      if (n.abstract) sections.push(`  ${n.abstract.substring(0, 200)}`);
      if (n.url) sections.push(`  Kaynak: ${n.url}`);
      if (n.trusted) sections.push(`  ✅ Güvenilir kaynak`);
    }
    sections.push('');
  }

  if (findings.articles.length > 0) {
    sections.push('## Makale İçerikleri\n');
    for (const a of findings.articles) {
      sections.push(`Kaynak: ${a.url}`);
      sections.push(a.text.substring(0, 1500));
      sections.push('---\n');
    }
  }

  return sections.join('\n');
}

// =============================================================================
// TOPIC SELECTION
// =============================================================================

function checkBlogHistory(topic) {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return false;
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const entry of history) {
      const entryWords = entry.topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const overlap = topicWords.filter(w => entryWords.includes(w)).length;
      const similarity = overlap / Math.max(topicWords.length, 1);
      // If >60% word overlap, consider it duplicate
      if (similarity > 0.6) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function addToHistory(topic, slug) {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  let history = [];
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch { /* start fresh */ }

  history.unshift({
    topic,
    slug,
    date: new Date().toISOString().split('T')[0]
  });
  // Keep last 200 entries
  history = history.slice(0, 200);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Select best topic from discovered findings
 */
function selectTopicFromFindings(findings) {
  // Group by area and pick the highest-scoring finding per area
  const bestPerArea = {};
  for (const f of findings) {
    if (!bestPerArea[f.area] || f.score > bestPerArea[f.area].score) {
      bestPerArea[f.area] = f;
    }
  }

  // Sort areas by their best finding's score
  const ranked = Object.values(bestPerArea).sort((a, b) => b.score - a.score);

  // Pick the first one that hasn't been written about recently
  for (const finding of ranked) {
    const topicText = finding.title;
    if (!checkBlogHistory(topicText)) {
      return {
        topic: topicText,
        category: RESEARCH_AREAS[finding.area]?.category || 'bilim',
        priority: finding.priority,
        area: finding.area,
        areaName: finding.areaName,
        finding: finding
      };
    }
    console.log(`⏭️  Daha önce yazılmış, atlıyorum: ${topicText.substring(0, 60)}...`);
  }

  // If everything has been covered, pick the overall best
  if (findings.length > 0) {
    const best = findings[0];
    return {
      topic: best.title,
      category: RESEARCH_AREAS[best.area]?.category || 'bilim',
      priority: best.priority,
      area: best.area,
      areaName: best.areaName,
      finding: best
    };
  }

  return null;
}

// Static topic pool (legacy fallback)
const TOPIC_POOL = [
  { topic: "GLP-1 ilaçları: Ozempic, Wegovy ve Mounjaro karşılaştırması", category: "tedavi", priority: "high" },
  { topic: "Tirzepatide (Mounjaro/Zepbound): Yeni nesil kilo ilacı", category: "tedavi", priority: "high" },
  { topic: "Retatrutide: Üçlü hormon agonisti ne vaat ediyor?", category: "bilim", priority: "high" },
  { topic: "GLP-1 ilaçlarının yan etkileri ve güvenliği", category: "tedavi", priority: "high" },
  { topic: "Semaglutide ve kalp sağlığı: SELECT çalışması sonuçları", category: "bilim", priority: "urgent" },
  { topic: "Endoskopik mide küçültme (ESG): Cerrahisiz alternatif", category: "tedavi", priority: "high" },
  { topic: "Akdeniz diyeti ve uzun yaşam: Bilimsel kanıtlar", category: "beslenme", priority: "normal" },
  { topic: "Aralıklı oruç: 16:8 ve 5:2 yöntemleri karşılaştırması", category: "beslenme", priority: "normal" },
  { topic: "Protein alımı ve kas kaybını önleme stratejileri", category: "beslenme", priority: "normal" },
  { topic: "Ultra-işlenmiş gıdalar ve obezite ilişkisi", category: "beslenme", priority: "high" },
  { topic: "İnsülin direnci: Belirtiler, tanı ve tedavi", category: "tedavi", priority: "high" },
  { topic: "Metabolik sendrom: Risk faktörleri ve önleme", category: "bilim", priority: "normal" },
  { topic: "Uzun yaşamın bilimsel sırları: Blue Zones araştırması", category: "yasam-tarzi", priority: "normal" },
  { topic: "Biyolojik yaş ve epigenetik saat", category: "bilim", priority: "normal" },
  { topic: "Uyku eksikliği ve kilo alma mekanizması", category: "yasam-tarzi", priority: "normal" },
  { topic: "Obezite ve kanser riski: Güncel kanıtlar", category: "bilim", priority: "high" },
  { topic: "GLP-1 ilaçları ve ruh sağlığı etkileri", category: "yasam-tarzi", priority: "high" },
  { topic: "Obezite ve kardiyovasküler risk azaltma", category: "bilim", priority: "high" },
  { topic: "Yağlı karaciğer hastalığı: MASLD tedavi yaklaşımları", category: "tedavi", priority: "high" }
];

function selectFromPool() {
  const unused = TOPIC_POOL.filter(t => !checkBlogHistory(t.topic));
  if (unused.length === 0) return TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];

  const urgent = unused.filter(t => t.priority === 'urgent');
  const high = unused.filter(t => t.priority === 'high');
  const normal = unused.filter(t => t.priority === 'normal');

  const rand = Math.random();
  let pool;
  if (rand < 0.3 && urgent.length > 0) pool = urgent;
  else if (rand < 0.8 && high.length > 0) pool = high;
  else pool = normal.length > 0 ? normal : unused;

  return pool[Math.floor(Math.random() * pool.length)];
}

// =============================================================================
// BLOG GENERATION
// =============================================================================

const CATEGORIES = {
  'beslenme': { icon: '🥗', color: '#10B981', name: 'Beslenme' },
  'egzersiz': { icon: '🏃', color: '#3B82F6', name: 'Egzersiz' },
  'kilo-yonetimi': { icon: '⚖️', color: '#F59E0B', name: 'Kilo Yönetimi' },
  'bilim': { icon: '🧬', color: '#8B5CF6', name: 'Bilimsel Araştırmalar' },
  'tedavi': { icon: '💊', color: '#EC4899', name: 'Tedavi' },
  'yasam-tarzi': { icon: '😴', color: '#06B6D4', name: 'Yaşam Tarzı' }
};

const UNSPLASH_IMAGES = {
  'beslenme': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=600&fit=crop',
  'egzersiz': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=600&fit=crop',
  'kilo-yonetimi': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop',
  'bilim': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=600&fit=crop',
  'tedavi': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=600&fit=crop',
  'yasam-tarzi': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1200&h=600&fit=crop',
  'glp1': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&h=600&fit=crop',
  'longevity': 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=1200&h=600&fit=crop'
};

const BLOG_SYSTEM_PROMPT = `Sen UzunYaşa için Türkçe tıbbi blog yazarısın. Prof. Dr. Cem Şimşek'in (Gastroenterolog) editörlük yaptığı, Türkiye'nin kanıta dayalı sağlık platformu için yazıyorsun.

GÖREV:
- Verilen konuyu ve araştırma bağlamını kullanarak bilimsel, kapsamlı bir blog yazısı yaz
- GERÇEK kaynaklara dayanan bilgi ver — araştırma bağlamında sana verilen makaleleri ve çalışmaları referans göster
- Akademik ama erişilebilir bir dil kullan — "akıllı bir hastaya anlatan uzman doktor" tonu

AKADEMİK KALİTE KURALLARI (KRİTİK — ihlal etme):
1. Her zaman Türkçe yaz
2. En az 5 farklı kaynak referans göster — tek çalışmaya dayanan blog YASAK
3. Her kaynak için DOI veya PubMed linki kullan
4. 1500-2500 kelime arası yaz (kapsamlı ama okunabilir)
5. Her tıbbi iddianın yanına kanıt seviyesi etiketi koy (aşağıya bak)
6. Alt başlıklar (## ve ###), listeler ve kalın metin kullan
7. "Bu ne anlama geliyor?" / "Pratikte ne yapmalı?" bölümleri ekle
8. Türkiye bağlamını dahil et (Türkiye obezite oranı: OECD 2024'e göre ~%32)
9. "Doktorunuza danışın" uyarısını doğal şekilde ekle
10. Hayvan çalışması ve in vitro bulgularını AÇIKÇA "insana genellenemez" olarak işaretle
11. Preprint/henüz hakemli değerlendirilmemiş çalışmaları uyar: "⚠️ Preprint — henüz hakemli değerlendirmeden geçmemiştir"
12. İlaç/takviye dozları verirken MUTLAKA klinik bağlam ve yan etki uyarısı ekle

YASAKLI İFADELER (kesinlikle kullanma):
- "çığır açan", "devrim yaratan", "devrim niteliğinde", "mucize"
- "bilim dünyasını heyecanlandıran", "şok eden", "inanılmaz"
- "kesin iyileşme", "garantili sonuç", "%100 etkili"
- "savaş açtı", "bomba etkisi", "tarihi adım"
Bunların yerine nesnel ifadeler kullan: "önemli", "dikkat çekici", "umut verici", "anlamlı"

KANIT SEVİYELERİ — her iddiada belirt:
- 🟢 Güçlü kanıt: Büyük RCT (n>500), meta-analiz, Cochrane derlemesi
- 🟡 Orta kanıt: Küçük RCT, gözlemsel kohort, vaka-kontrol çalışması
- 🔴 Erken/Zayıf kanıt: Hayvan deneyi, in vitro, vaka sunumu, pilot çalışma (n<30), preprint
- Her bulgunun yanına çalışma tipi ve örneklem büyüklüğünü parantez içinde yaz: "(RCT, n=1.961)"

REFERANS STANDARTLARI:
- En az 5 kaynak, tercihen 8-12 arası
- Orijinal çalışma > derleme > haber kaynağı
- Kaynak formatı: "Yazarlar et al. Başlık. Dergi. Yıl;cilt:sayfa." şeklinde
- Press release veya haber sitesi kullanılıyorsa açıkça "basın bülteni" veya "haber kaynağı" olarak etiketle
- Aynı konuda landmark çalışmaları atlamak YASAK (örn: GLP-1 yazısında SELECT, STEP, SURMOUNT; DKD yazısında CREDENCE, DAPA-CKD)

FABRİKE VERİ YASAĞI:
- Kaynak gösterilmeyen yüzde, istatistik veya pasta grafik verisi YAZMA
- "Araştırmalar gösteriyor ki..." gibi belirsiz atıflar YASAK — hangi araştırma, hangi yıl, kaç kişi?
- Tahmini veriler kullanıyorsan "tahmini", "yaklaşık" olarak açıkça etiketle

DIŞLA:
- Ünlü/influencer referansları
- Mucize vaatleri, kesin iyileşme iddiaları
- Reklam dili
- Doğrulanmamış iddialar

MARKDOWN FORMATLAMA (HTML oluşturma için KRİTİK):
- <p> etiketi içine <h2>, <h3>, <ul>, <ol>, <blockquote> KOYMA
- Her paragraf ayrı bir blok olsun
- Liste elemanlarını (- veya *) paragraf içine karıştırma
- Başlık (## veya ###) öncesinde her zaman boş satır bırak

ÇIKTI FORMATI — SADECE JSON:
{
  "title": "Başlık (max 65 karakter, SEO uyumlu, Türkçe, hype yok)",
  "description": "Meta açıklama (max 160 karakter, Türkçe, nesnel dil)",
  "category": "beslenme|egzersiz|kilo-yonetimi|bilim|tedavi|yasam-tarzi",
  "content": "Markdown formatında kapsamlı içerik",
  "keyPoints": ["Önemli nokta 1", "Önemli nokta 2", "Önemli nokta 3", "Önemli nokta 4"],
  "sources": [
    {"title": "Yazarlar et al. Tam kaynak. Dergi. Yıl;cilt:sayfa.", "url": "https://doi.org/... veya PubMed linki"}
  ],
  "readTime": 10,
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

async function generateBlogPost(topic, researchContext = '') {
  console.log(`\n📝 Blog yazısı oluşturuluyor: ${topic}`);
  console.log(`🤖 Model: ${LLM_MODEL} (${LLM_PROVIDER})\n`);

  const userPrompt = `KONU: ${topic}

${researchContext ? `ARAŞTIRMA BAĞLAMI (gerçek ve güncel veriler — bunları kaynak olarak kullan):
${researchContext}

` : ''}Bu konuda kapsamlı, bilimsel ve Türkçe bir blog yazısı yaz.
- Yukarıdaki araştırma verilerini AKTİF OLARAK KULLAN ve referans göster
- Her iddianın yanına kanıt seviyesi koy (🟢/🟡/🔴)
- Türkiye'deki okuyucular için pratik ve uygulanabilir bilgiler ver
- "Bu araştırma ne diyor?" ve "Günlük hayata nasıl uygularım?" bölümlerini dahil et`;

  let content;

  if (LLM_PROVIDER === 'anthropic') {
    // Anthropic Claude API
    const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: 6000,
        system: BLOG_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    }, 180000);

    const data = await response.json();
    if (data.error) throw new Error(`Anthropic API: ${data.error.message}`);
    content = data.content[0].text;

  } else if (LLM_PROVIDER === 'xai') {
    // xAI Grok API (OpenAI-compatible)
    const response = await fetchWithTimeout('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: 6000,
        messages: [
          { role: 'system', content: BLOG_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ]
      })
    }, 180000);

    const data = await response.json();
    if (data.error) throw new Error(`xAI API: ${data.error?.message || JSON.stringify(data.error)}`);
    content = data.choices[0].message.content;

  } else {
    throw new Error('API key bulunamadı. ANTHROPIC_API_KEY veya XAI_API_KEY gerekli.');
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Raw LLM output:', content.substring(0, 500));
    throw new Error('Blog içeriği JSON olarak parse edilemedi');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // === POST-GENERATION QUALITY VALIDATION ===
  const warnings = validateBlogQuality(parsed);
  if (warnings.length > 0) {
    console.warn('\n⚠️  KALİTE UYARILARI:');
    for (const w of warnings) console.warn(`   ❗ ${w}`);
    console.warn('   Blog yine de oluşturulacak, ancak manuel inceleme önerilir.\n');
  }

  return parsed;
}

/**
 * Post-generation quality validation
 * Checks for common issues found during academic reviews
 */
function validateBlogQuality(post) {
  const warnings = [];
  const content = post.content || '';
  const sources = post.sources || [];

  // 1. Minimum reference count
  if (sources.length < 5) {
    warnings.push(`Yetersiz kaynak: ${sources.length}/5 minimum. Tek kaynağa dayanan blog güvenilir değil.`);
  }

  // 2. Check for hype language
  const hypeWords = [
    'çığır açan', 'devrim yaratan', 'devrim niteliğinde', 'mucize',
    'şok eden', 'inanılmaz', 'bomba etkisi', 'tarihi adım',
    'savaş açtı', 'dünyayı heyecanlandıran'
  ];
  const foundHype = hypeWords.filter(hw => content.toLowerCase().includes(hw));
  if (foundHype.length > 0) {
    warnings.push(`Hype dil tespit edildi: "${foundHype.join('", "')}". Nesnel ifadelerle değiştirin.`);
  }

  // 3. Check for evidence level labels
  const hasEvidenceLabels = content.includes('🟢') || content.includes('🟡') || content.includes('🔴') ||
    content.toLowerCase().includes('kanıt düzeyi') || content.toLowerCase().includes('kanıt seviyesi');
  if (!hasEvidenceLabels) {
    warnings.push('Kanıt seviyesi etiketleri (🟢/🟡/🔴) bulunamadı. Her iddiada kanıt düzeyi belirtilmeli.');
  }

  // 4. Check for animal study warnings
  const animalTerms = ['fare model', 'mouse model', 'animal study', 'hayvan deneyi', 'in vitro', 'rat model'];
  const hasAnimalStudy = animalTerms.some(t => content.toLowerCase().includes(t));
  const hasAnimalWarning = content.toLowerCase().includes('insana genellenemez') ||
    content.toLowerCase().includes('insanlarda doğrulanması') ||
    content.toLowerCase().includes('insanlara aktarılamaz');
  if (hasAnimalStudy && !hasAnimalWarning) {
    warnings.push('Hayvan çalışması referansı var ama "insana genellenemez" uyarısı eksik.');
  }

  // 5. Check for preprint warnings
  const hasPreprint = content.toLowerCase().includes('preprint') ||
    content.toLowerCase().includes('biorxiv') || content.toLowerCase().includes('medrxiv');
  const hasPreprintWarning = content.toLowerCase().includes('hakemli değerlendirme') ||
    content.toLowerCase().includes('peer review');
  if (hasPreprint && !hasPreprintWarning) {
    warnings.push('Preprint kaynak var ama hakemli değerlendirme uyarısı eksik.');
  }

  // 6. Check for fabricated-looking statistics without source
  const percentPattern = /%\d+/g;
  const percentMatches = content.match(percentPattern) || [];
  if (percentMatches.length > 5 && sources.length < 3) {
    warnings.push(`${percentMatches.length} yüzde istatistik var ama sadece ${sources.length} kaynak. Fabrike veri riski.`);
  }

  // 7. Check sources have proper format (not just URLs)
  const weakSources = sources.filter(s => !s.title || s.title.length < 20);
  if (weakSources.length > sources.length / 2) {
    warnings.push('Kaynakların çoğu düzgün formatlanmamış. "Yazarlar et al. Başlık. Dergi. Yıl" formatı gerekli.');
  }

  return warnings;
}

// =============================================================================
// HTML GENERATION
// =============================================================================

function markdownToHtml(markdown) {
  // Split into blocks by double newline to avoid nesting issues
  const blocks = markdown.split(/\n{2,}/);
  const htmlBlocks = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Heading h2
    if (trimmed.startsWith('## ')) {
      htmlBlocks.push(`<h2>${trimmed.replace(/^## /, '')}</h2>`);
      continue;
    }
    // Heading h3
    if (trimmed.startsWith('### ')) {
      htmlBlocks.push(`<h3>${trimmed.replace(/^### /, '')}</h3>`);
      continue;
    }
    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.replace(/^> /gm, '').trim();
      htmlBlocks.push(`<blockquote>${quoteText}</blockquote>`);
      continue;
    }
    // List (unordered: - or *)
    const listLines = trimmed.split('\n');
    if (listLines.every(l => /^\s*[-*] /.test(l.trim()) || l.trim() === '')) {
      const items = listLines
        .map(l => l.trim())
        .filter(l => /^[-*] /.test(l))
        .map(l => `<li>${inlineFormat(l.replace(/^[-*] /, ''))}</li>`)
        .join('\n');
      htmlBlocks.push(`<ul>\n${items}\n</ul>`);
      continue;
    }
    // Ordered list (1. 2. etc.)
    if (listLines.every(l => /^\s*\d+\. /.test(l.trim()) || l.trim() === '')) {
      const items = listLines
        .map(l => l.trim())
        .filter(l => /^\d+\. /.test(l))
        .map(l => `<li>${inlineFormat(l.replace(/^\d+\. /, ''))}</li>`)
        .join('\n');
      htmlBlocks.push(`<ol>\n${items}\n</ol>`);
      continue;
    }
    // Regular paragraph
    htmlBlocks.push(`<p>${inlineFormat(trimmed.replace(/\n/g, ' '))}</p>`);
  }

  return htmlBlocks.join('\n\n');
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function generateSlug(title) {
  const turkishMap = {
    'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
    'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'İ': 'i', 'Ö': 'o', 'Ç': 'c'
  };
  return title
    .toLowerCase()
    .replace(/[ğüşıöçĞÜŞİÖÇ]/g, c => turkishMap[c] || c)
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

function getUnsplashImage(category, topic) {
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('glp-1') || topicLower.includes('ozempic') || topicLower.includes('semaglutide') || topicLower.includes('wegovy') || topicLower.includes('mounjaro')) {
    return UNSPLASH_IMAGES['glp1'] || UNSPLASH_IMAGES['tedavi'];
  }
  if (topicLower.includes('longevity') || topicLower.includes('aging') || topicLower.includes('yaşlanma') || topicLower.includes('uzun ömür')) {
    return UNSPLASH_IMAGES['longevity'] || UNSPLASH_IMAGES['yasam-tarzi'];
  }
  return UNSPLASH_IMAGES[category] || UNSPLASH_IMAGES['bilim'];
}

function generateHtml(post, topicInfo) {
  const category = CATEGORIES[post.category] || CATEGORIES['bilim'];
  const date = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const isoDate = new Date().toISOString().split('T')[0];
  const imageUrl = getUnsplashImage(post.category, topicInfo.topic);
  const htmlContent = markdownToHtml(post.content);
  const keyPointsHtml = post.keyPoints.map(p => `<li>${p}</li>`).join('\n');
  const sourcesHtml = post.sources.map(s =>
    `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></li>`
  ).join('\n');
  const slug = generateSlug(post.title);
  const canonicalUrl = `https://uzunyasa.com/pages/blog/${slug}.html`;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} | UzunYaşa Blog</title>
    <meta name="description" content="${post.description}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="UzunYaşa">
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:section" content="${category.name}">
    ${post.tags.map(t => `<meta property="article:tag" content="${t}">`).join('\n    ')}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${post.description}">
    <meta name="twitter:image" content="${imageUrl}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-QBM7E0EHFP"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QBM7E0EHFP');</script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${post.title.replace(/"/g, '\\"')}",
      "description": "${post.description.replace(/"/g, '\\"')}",
      "image": "${imageUrl}",
      "datePublished": "${isoDate}",
      "author": {
        "@type": "Organization",
        "name": "UzunYaşa",
        "url": "https://uzunyasa.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "UzunYaşa",
        "logo": { "@type": "ImageObject", "url": "https://uzunyasa.com/images/logo.svg" }
      },
      "mainEntityOfPage": "${canonicalUrl}"
    }
    </script>
    <style>
        :root {
            --primary: #195157;
            --accent: #E8963E;
            --text: #1a1a1a;
            --gray: #6b7280;
            --bg: #FAF9F7;
            --white: #FFFFFF;
            --border: #e5e7eb;
            --category-color: ${category.color};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: var(--text); line-height: 1.8; background: var(--bg); }
        .header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.97); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
        .header-inner { max-width: 1200px; margin: 0 auto; padding: 0.75rem 2rem; display: flex; align-items: center; justify-content: space-between; }
        .logo-img { height: 60px; }
        .back-link { color: var(--primary); text-decoration: none; font-weight: 500; }
        .back-link:hover { text-decoration: underline; }
        article { max-width: 750px; margin: 0 auto; padding: 7rem 1.5rem 4rem; }
        .post-category { display: inline-block; background: ${category.color}20; color: ${category.color}; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
        h1 { font-size: 2.25rem; font-weight: 700; line-height: 1.3; margin-bottom: 1rem; }
        .post-meta { color: var(--gray); font-size: 0.9rem; display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .featured-image { width: 100%; height: 350px; border-radius: 16px; overflow: hidden; margin-bottom: 2.5rem; }
        .featured-image img { width: 100%; height: 100%; object-fit: cover; }
        .post-content { font-size: 1.1rem; }
        .post-content h2 { font-size: 1.5rem; margin: 2.5rem 0 1rem; color: var(--primary); }
        .post-content h3 { font-size: 1.25rem; margin: 2rem 0 0.75rem; }
        .post-content p { margin-bottom: 1.25rem; }
        .post-content ul, .post-content ol { margin: 1rem 0 1.5rem 1.5rem; }
        .post-content li { margin-bottom: 0.5rem; }
        .post-content blockquote { border-left: 4px solid var(--accent); padding-left: 1.5rem; margin: 1.5rem 0; font-style: italic; color: var(--gray); }
        .post-content strong { color: var(--primary); }
        .key-points { background: var(--white); border: 2px solid var(--border); border-radius: 12px; padding: 1.5rem 1.5rem 1.5rem 2rem; margin: 2.5rem 0; }
        .key-points h4 { color: var(--primary); margin-bottom: 1rem; font-size: 1.1rem; }
        .key-points ul { margin: 0; }
        .key-points li { margin-bottom: 0.5rem; }
        .sources { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border); }
        .sources h4 { font-size: 1rem; margin-bottom: 0.75rem; color: var(--primary); }
        .sources ul { list-style: none; margin: 0; padding: 0; }
        .sources li { font-size: 0.9rem; color: var(--gray); margin-bottom: 0.5rem; }
        .sources a { color: var(--primary); }
        .disclaimer { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 1rem; margin-top: 2rem; font-size: 0.9rem; color: #92400E; }
        .share-section { margin-top: 3rem; padding: 2rem; background: var(--white); border-radius: 12px; text-align: center; border: 1px solid var(--border); }
        .share-buttons { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap; }
        .share-btn { padding: 0.65rem 1.25rem; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 0.9rem; color: white; }
        .share-btn.twitter { background: #1DA1F2; }
        .share-btn.linkedin { background: #0A66C2; }
        .share-btn.whatsapp { background: #25D366; }
        .cta-section { margin-top: 3rem; padding: 2rem; background: linear-gradient(135deg, var(--primary), #2a6b73); border-radius: 12px; text-align: center; color: white; }
        .cta-section h3 { margin-bottom: 0.5rem; }
        .cta-section p { opacity: 0.9; margin-bottom: 1rem; }
        .cta-btn { display: inline-block; background: var(--accent); color: white; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
        footer { background: var(--text); color: white; padding: 2rem; text-align: center; margin-top: 4rem; }
        footer p { opacity: 0.7; font-size: 0.9rem; }
        @media (max-width: 640px) { h1 { font-size: 1.65rem; } article { padding: 5.5rem 1rem 2rem; } .featured-image { height: 220px; } }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-inner">
            <a href="../../index.html"><img src="../../images/logo.svg" alt="UzunYaşa" class="logo-img"></a>
            <a href="../blog.html" class="back-link">← Blog'a Dön</a>
        </div>
    </header>

    <article>
        <span class="post-category">${category.icon} ${category.name}</span>
        <h1>${post.title}</h1>
        <div class="post-meta">
            <span>📅 ${date}</span>
            <span>⏱️ ${post.readTime} dk okuma</span>
            <span>📊 Kanıta Dayalı</span>
        </div>

        <div class="featured-image">
            <img src="${imageUrl}" alt="${post.title}" loading="lazy">
        </div>

        <div class="post-content">
            ${htmlContent}
        </div>

        <div class="key-points">
            <h4>📌 Önemli Noktalar</h4>
            <ul>${keyPointsHtml}</ul>
        </div>

        <div class="disclaimer">
            ⚠️ <strong>Önemli:</strong> Bu içerik sadece bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez. Herhangi bir tedaviye başlamadan önce mutlaka doktorunuza danışın.
        </div>

        <div class="sources">
            <h4>📚 Kaynaklar</h4>
            <ul>${sourcesHtml}</ul>
        </div>

        <div class="share-section">
            <p><strong>Bu yazıyı paylaşın</strong></p>
            <div class="share-buttons">
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + ' | UzunYaşa')}&url=${encodeURIComponent(canonicalUrl)}" class="share-btn twitter" target="_blank" rel="noopener">Twitter</a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}" class="share-btn linkedin" target="_blank" rel="noopener">LinkedIn</a>
                <a href="https://wa.me/?text=${encodeURIComponent(post.title + ' ' + canonicalUrl)}" class="share-btn whatsapp" target="_blank" rel="noopener">WhatsApp</a>
            </div>
        </div>

        <div class="cta-section">
            <h3>Sağlığınızı test edin</h3>
            <p>2 dakikada kişisel sağlık değerlendirmenizi yapın</p>
            <a href="../test.html" class="cta-btn">Teste Başla →</a>
        </div>
    </article>

    <footer><p>© ${new Date().getFullYear()} UzunYaşa. Tüm hakları saklıdır.</p></footer>
</body>
</html>`;
}

// =============================================================================
// INDEX MANAGEMENT
// =============================================================================

function updateBlogIndex(post, slug, topicInfo) {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  let posts = [];
  if (fs.existsSync(BLOG_INDEX)) {
    try { posts = JSON.parse(fs.readFileSync(BLOG_INDEX, 'utf-8')); } catch { posts = []; }
  }

  const category = CATEGORIES[post.category] || CATEGORIES['bilim'];
  posts.unshift({
    slug,
    title: post.title,
    description: post.description,
    category: post.category,
    categoryName: category.name,
    categoryIcon: category.icon,
    categoryColor: category.color,
    date: new Date().toISOString().split('T')[0],
    readTime: post.readTime,
    tags: post.tags || [],
    priority: topicInfo.priority || 'normal',
    area: topicInfo.area || null
  });

  posts = posts.slice(0, 100);
  fs.writeFileSync(BLOG_INDEX, JSON.stringify(posts, null, 2));
  console.log(`📋 Blog index güncellendi (${posts.length} yazı)`);
}

function updateSitemap(slug) {
  const sitemapPath = path.join(__dirname, '../sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return;

  try {
    let sitemap = fs.readFileSync(sitemapPath, 'utf-8');
    const newUrl = `https://uzunyasa.com/pages/blog/${slug}.html`;
    if (sitemap.includes(newUrl)) return;

    const entry = `  <url>
    <loc>${newUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    sitemap = sitemap.replace('</urlset>', `${entry}\n</urlset>`);
    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`🗺️  Sitemap güncellendi`);
  } catch (err) {
    console.warn(`⚠️  Sitemap güncellenemedi: ${err.message}`);
  }
}

// =============================================================================
// DISPLAY
// =============================================================================

function displayFindings(findings, limit = 20) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 ARAŞTIRMA SONUÇLARI');
  console.log('='.repeat(70));

  const grouped = {};
  for (const f of findings.slice(0, limit)) {
    const area = f.areaName || 'Diğer';
    if (!grouped[area]) grouped[area] = [];
    grouped[area].push(f);
  }

  for (const [area, items] of Object.entries(grouped)) {
    console.log(`\n🏷️  ${area}`);
    console.log('-'.repeat(50));
    for (const item of items) {
      const typeEmoji = item.type === 'paper' ? '📚' : item.type === 'trial' ? '🧪' : item.type === 'news' ? '📰' : '🔍';
      const priorityEmoji = item.priority === 'urgent' ? '🔴' : item.priority === 'high' ? '🟡' : '⚪';
      const trustEmoji = item.trusted ? '✅' : '';
      console.log(`  ${typeEmoji} ${priorityEmoji} [${item.score}] ${item.title.substring(0, 70)}`);
      if (item.journal) console.log(`     📖 ${item.journal} (${item.year}) ${trustEmoji}`);
      if (item.url) console.log(`     🔗 ${item.url.substring(0, 70)}`);
    }
  }
  console.log('\n' + '='.repeat(70));
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const isDiscover = args.includes('--discover');
  const isDryRun = args.includes('--dry-run');
  const isDeploy = args.includes('--deploy');
  const isPool = args.includes('--pool');
  const isJson = args.includes('--json');

  const topicIdx = args.indexOf('--topic');
  const providedTopic = topicIdx !== -1 ? args[topicIdx + 1] : null;

  const areaIdx = args.indexOf('--area');
  const focusArea = areaIdx !== -1 ? args[areaIdx + 1] : null;

  const searchIdx = args.indexOf('--search-only');
  const searchQuery = searchIdx !== -1 ? args[searchIdx + 1] : null;

  if (!LLM_PROVIDER && !isDiscover && !searchQuery) {
    console.error('❌ LLM API key gerekli. Ayarlayın: ANTHROPIC_API_KEY veya XAI_API_KEY');
    process.exit(1);
  }

  console.log('🧬 UzunYaşa Auto Blog Generator v2.0');
  console.log(`📅 ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`);
  if (BRAVE_API_KEY) console.log('🔍 Brave Search: aktif');
  else console.log('🔍 Brave Search: yok (BRAVE_API_KEY ekleyin)');

  try {
    // === SEARCH-ONLY MODE ===
    if (searchQuery) {
      console.log(`\n🔎 Arama: "${searchQuery}"\n`);
      const [papers, trials, news, medscape, harvard, stat, mayo, cleveland] = await Promise.all([
        searchPubMed(searchQuery, 5),
        searchClinicalTrials(searchQuery, 5),
        searchGoogleNews(searchQuery, 5),
        searchMedscape(searchQuery, 3),
        searchHarvardHealth(searchQuery, 3),
        searchSTATNews(searchQuery, 3),
        searchMayoClinic(searchQuery, 3),
        searchClevelandClinic(searchQuery, 3)
      ]);
      const all = [...papers, ...trials, ...news, ...medscape, ...harvard, ...stat, ...mayo, ...cleveland].map(f => {
        f.area = 'search'; f.areaName = 'Arama Sonuçları'; f.score = scoreFinding(f); return f;
      });
      all.sort((a, b) => b.score - a.score);
      displayFindings(all, 15);
      return;
    }

    // === LEGACY POOL MODE ===
    if (isPool && !isDiscover) {
      console.log('\n📦 Statik konu havuzundan seçim (legacy mod)...');
      const topicInfo = providedTopic
        ? { topic: providedTopic, category: 'bilim', priority: 'normal' }
        : selectFromPool();
      console.log(`🎯 Seçilen konu: ${topicInfo.topic}`);

      const post = await generateBlogPost(topicInfo.topic);
      const slug = generateSlug(post.title);
      const html = generateHtml(post, topicInfo);

      if (!isDryRun) {
        if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), html);
        updateBlogIndex(post, slug, topicInfo);
        updateSitemap(slug);
        addToHistory(topicInfo.topic, slug);
        console.log(`\n🎉 Blog yazısı hazır: /pages/blog/${slug}.html`);
      } else {
        console.log(`\n🎉 [DRY RUN] Blog: ${post.title}`);
      }
      return;
    }

    // === PHASE 1: DISCOVER ===
    const findings = await discoverTopics(focusArea);
    displayFindings(findings, 20);

    if (isDiscover) {
      if (isJson) {
        // Output top findings as JSON for programmatic use
        const top = findings.slice(0, 20).map((f, i) => ({
          rank: i + 1,
          score: f.score,
          priority: f.priority,
          type: f.type,
          area: f.area,
          areaName: f.areaName,
          title: f.title,
          journal: f.journal || null,
          year: f.year,
          abstract: (f.abstract || '').substring(0, 300),
          url: f.url || null,
          trusted: f.trusted || false,
          source: f.source
        }));
        console.log(JSON.stringify(top, null, 2));
      } else {
        console.log('\n✅ Keşif tamamlandı (--discover modu, blog oluşturulmadı)');
      }
      return;
    }

    if (findings.length === 0) {
      console.log('\n⚠️  Hiç bulgu yok. Statik konu havuzuna geçiliyor...');
      const topicInfo = providedTopic
        ? { topic: providedTopic, category: 'bilim', priority: 'normal' }
        : selectFromPool();
      const post = await generateBlogPost(topicInfo.topic);
      const slug = generateSlug(post.title);
      if (!isDryRun) {
        const html = generateHtml(post, topicInfo);
        if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), html);
        updateBlogIndex(post, slug, topicInfo);
        updateSitemap(slug);
        addToHistory(topicInfo.topic, slug);
      }
      console.log(`\n🎉 Blog: ${post.title}`);
      return;
    }

    // === PHASE 2: SELECT TOPIC ===
    let topicInfo;
    if (providedTopic) {
      topicInfo = { topic: providedTopic, category: 'bilim', priority: 'normal', area: 'custom' };
    } else {
      topicInfo = selectTopicFromFindings(findings);
    }

    console.log(`\n🎯 Seçilen konu: ${topicInfo.topic}`);
    console.log(`📊 Öncelik: ${topicInfo.priority} | Alan: ${topicInfo.areaName || topicInfo.area}`);

    // === PHASE 3: DEEP RESEARCH ===
    const research = await conductDeepResearch(topicInfo.topic, topicInfo.area);
    const researchContext = buildResearchContext(research);

    console.log(`\n📄 Araştırma bağlamı: ${(researchContext.length / 1024).toFixed(1)} KB`);

    // === PHASE 4: GENERATE ===
    const post = await generateBlogPost(topicInfo.topic, researchContext);
    console.log(`✅ İçerik oluşturuldu: ${post.title}`);

    // === PHASE 5: PUBLISH ===
    const slug = generateSlug(post.title);

    if (!isDryRun) {
      const html = generateHtml(post, topicInfo);
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      const filepath = path.join(OUTPUT_DIR, `${slug}.html`);
      fs.writeFileSync(filepath, html);
      console.log(`📄 HTML kaydedildi: ${filepath}`);

      updateBlogIndex(post, slug, topicInfo);
      updateSitemap(slug);
      addToHistory(topicInfo.topic, slug);

      if (isDeploy) {
        console.log('\n🚀 Deploy ediliyor...');
        try {
          execSync(`cd ${path.join(__dirname, '..')} && git add -A && git commit -m "Blog: ${post.title.substring(0, 50)}" && git push origin main`, { stdio: 'inherit' });
          console.log('✅ GitHub Pages deploy başarılı');
        } catch (err) {
          console.error('❌ Deploy hatası:', err.message);
        }
      }

      console.log(`\n🎉 Blog yazısı hazır!`);
      console.log(`   Başlık: ${post.title}`);
      console.log(`   URL: /pages/blog/${slug}.html`);
      console.log(`   Kategori: ${post.category}`);
      console.log(`   Okuma: ${post.readTime} dk`);
      console.log(`   Kaynaklar: ${post.sources.length}`);
    } else {
      console.log(`\n🎉 [DRY RUN] Blog hazır ama yazılmadı`);
      console.log(`   Başlık: ${post.title}`);
      console.log(`   Slug: ${slug}`);
      console.log(`   Kaynaklar: ${post.sources.length}`);
    }

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
