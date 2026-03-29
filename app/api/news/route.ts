import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://economictimes.indiatimes.com/newslist.cms?catcode=104&catname=India",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          AcceptLanguage: "en-US,en;q=0.5",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Parse headlines from the HTML
    const news: { title: string; excerpt: string; time: string; category: string; link: string }[] = [];

    // Pattern 1: data-script-title attributes
    const titleMatches = html.match(/data-script-title="([^"]+)"/g) || [];
    // Pattern 2: data-article-title attributes  
    const articleMatches = html.match(/data-article-title="([^"]+)"/g) || [];
    // Pattern 3: Simple title tags
    const simpleTitleMatches = html.match(/<a[^>]*title="([^"]+)"[^>]*class="[^"]*fl[^"]*"[^>]*>/gi) || [];
    // Pattern 4: div with story title
    const storyMatches = html.match(/<div[^>]*class="[^"]*storytitle[^"]*"[^>]*>([^<]+)<\/div>/gi) || [];
    // Pattern 5: anchor tags with headlines
    const anchorMatches = html.match(/<a[^>]+class="[^"]*headline[^"]*"[^>]*>([^<]+)<\/a>/gi) || [];
    // Pattern 6: et-ta-anchor elements
    const etaMatches = html.match(/<et-ta-anchor[^>]*title="([^"]+)"[^>]*>/gi) || [];

    const allTitles = [
      ...titleMatches.map(m => m.replace(/data-script-title="/, '').replace(/"/, '')),
      ...articleMatches.map(m => m.replace(/data-article-title="/, '').replace(/"/, '')),
    ];

    // Extract headlines from various patterns in HTML
    const headlinePatterns = [
      /<a[^>]*class="[^"]*fl[^"]*"[^>]*title="([^"]+)"[^>]*>/gi,
      /<et-ta-anchor[^>]*title="([^"]+)"[^>]*>/gi,
      /data-script-title="([^"]+)"/gi,
      /"headline"\s*:\s*"([^"]+)"/gi,
      /<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/gi,
    ];

    const extractedTitles = new Set<string>();

    for (const pattern of headlinePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const title = match[1]?.trim();
        if (title && title.length > 10 && title.length < 200) {
          extractedTitles.add(title);
        }
      }
    }

    // Also try to get from any JSON-like structure
    const jsonMatches = html.match(/"headlines"\s*:\s*\[([^\]]+)\]/gi) || [];
    for (const jsonMatch of jsonMatches) {
      const titles = jsonMatch.match(/"([^"]+)"/g) || [];
      titles.forEach(t => {
        const clean = t.replace(/"/g, '').trim();
        if (clean.length > 10) extractedTitles.add(clean);
      });
    }

    // Convert to news items
    const titles = Array.from(extractedTitles).slice(0, 20);
    
    titles.forEach((title, i) => {
      news.push({
        title: title,
        excerpt: `Latest news update from Economic Times - ${title.substring(0, 80)}...`,
        time: `${Math.floor(Math.random() * 12) + 1} hours ago`,
        category: getCategory(title),
        link: `https://economictimes.indiatimes.com/${title.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}`
      });
    });

    // If no news found, return fallback
    if (news.length === 0) {
      return NextResponse.json({
        news: getFallbackNews(),
        source: "fallback"
      });
    }

    return NextResponse.json({
      news,
      source: "economictimes",
      count: news.length
    });

  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json({
      news: getFallbackNews(),
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

function getCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('stock') || t.includes('sensex') || t.includes('nifty') || t.includes('market') || t.includes('share')) return 'Markets';
  if (t.includes(' RBI') || t.includes('bank') || t.includes('interest') || t.includes('loan')) return 'Banking';
  if (t.includes('govt') || t.includes('government') || t.includes('ministry') || t.includes('minister')) return 'Politics';
  if (t.includes('tech') || t.includes('ai') || t.includes('google') || t.includes('meta') || t.includes('startup')) return 'Tech';
  if (t.includes('auto') || t.includes('electric') || t.includes('tata') || t.includes('maruti')) return 'Auto';
  if (t.includes('real estate') || t.includes('property') || t.includes('housing')) return 'Real Estate';
  if (t.includes('oil') || t.includes('petrol') || t.includes('gas') || t.includes('reliance')) return 'Energy';
  if (t.includes('budget') || t.includes('tax') || t.includes('gst') || t.includes('finance')) return 'Finance';
  return 'General';
}

function getFallbackNews() {
  return [
    { title: "Sensex surges 500 points amid strong foreign investor inflows", excerpt: "Indian equity markets rally on positive global cues...", time: "2 hours ago", category: "Markets", link: "#" },
    { title: "RBI keeps repo rate unchanged at 6.5%", excerpt: "Central bank maintains status quo on interest rates...", time: "4 hours ago", category: "Banking", link: "#" },
    { title: "Tech stocks lead market rally, IT sector gains 3%", excerpt: "Information Technology stocks outperform...", time: "5 hours ago", category: "Tech", link: "#" },
    { title: "Government announces new startup fund of Rs 10,000 crore", excerpt: "Startup ecosystem gets a boost from government...", time: "6 hours ago", category: "Tech", link: "#" },
    { title: "Auto sales see double-digit growth in December", excerpt: "Automobile sector reports strong numbers...", time: "7 hours ago", category: "Auto", link: "#" },
    { title: "Oil prices stabilize amid Middle East tensions", excerpt: "Crude oil prices find support...", time: "8 hours ago", category: "Energy", link: "#" },
    { title: "Real estate market shows signs of recovery in Tier 2 cities", excerpt: "Property sector sees renewed interest...", time: "9 hours ago", category: "Real Estate", link: "#" },
    { title: "India's GDP growth forecast upgraded by Moody's", excerpt: "Credit rating agency sees strong economic momentum...", time: "10 hours ago", category: "Finance", link: "#" },
  ];
}
