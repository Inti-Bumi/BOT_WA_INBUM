const axios = require('axios');

function cleanText(str) {
    if (!str) return '';
    return str
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<[^>]+>/g, '')
        .trim();
}

function detectSocialPlatform(url, title = '') {
    if (!url) return '🌐 Web';
    if (/x\.com|twitter\.com/i.test(url)) return '📱 X (Twitter)';
    if (/facebook\.com|fb\.com|fb\.watch/i.test(url)) return '📘 Facebook';
    if (/tiktok\.com/i.test(url)) return '🎵 TikTok';
    if (/instagram\.com/i.test(url)) return '📸 Instagram';
    if (/reddit\.com/i.test(url)) return '💬 Reddit';
    if (/youtube\.com|youtu\.be/i.test(url)) return '▶️ YouTube';
    return '🏛️ Media / Portal Web';
}

// 1. Tavily AI Search (AI Summary + Direct Social Media & Web Links)
async function searchWithTavily(query) {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return null;

    try {
        const res = await axios.post('https://api.tavily.com/search', {
            api_key: apiKey,
            query: query,
            search_depth: 'basic',
            include_answer: true,
            max_results: 5
        }, { timeout: 10000 });

        if (res.data && Array.isArray(res.data.results)) {
            return {
                summary: res.data.answer || null,
                items: res.data.results.map(r => ({
                    title: r.title,
                    link: r.url,
                    snippet: r.content,
                    source: detectSocialPlatform(r.url)
                }))
            };
        }
    } catch (e) {
        console.warn('[SEARCH] Tavily search error:', e.message);
    }
    return null;
}

// 2. Serper Google Search
async function searchWithSerper(query) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) return null;

    try {
        const res = await axios.post('https://google.serper.dev/search', {
            q: query,
            gl: 'id',
            hl: 'id',
            num: 5
        }, {
            headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
            timeout: 10000
        });

        if (res.data && Array.isArray(res.data.organic)) {
            return {
                summary: null,
                items: res.data.organic.map(r => ({
                    title: r.title,
                    link: r.link,
                    snippet: r.snippet,
                    source: detectSocialPlatform(r.link)
                }))
            };
        }
    } catch (e) {
        console.warn('[SEARCH] Serper search error:', e.message);
    }
    return null;
}

// 3. Fallback Engine: Google News RSS
async function searchWithGoogleNews(query) {
    try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 });
        const xml = res.data;
        const matches = [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>([\s\S]*?<source[^>]*>(.*?)<\/source>)?[\s\S]*?<\/item>/g)];
        return {
            summary: null,
            items: matches.slice(0, 4).map(m => ({
                title: cleanText(m[1]),
                link: cleanText(m[2]),
                source: `🏛️ Media Resmi (${cleanText(m[5]) || 'Portal Berita'})`
            }))
        };
    } catch {
        return { summary: null, items: [] };
    }
}

async function searchDoksliMultiSource(query) {
    // 1. Cek Tavily AI Search (dengan AI Answer & Direct Social Media links)
    const tavilyData = await searchWithTavily(query);
    if (tavilyData && tavilyData.items.length > 0) {
        return {
            engine: 'Tavily AI (Live Internet & Direct Social Media)',
            summary: tavilyData.summary,
            results: tavilyData.items
        };
    }

    // 2. Cek Serper Google Search
    const serperData = await searchWithSerper(query);
    if (serperData && serperData.items.length > 0) {
        return {
            engine: 'Serper (Direct Google Search)',
            summary: null,
            results: serperData.items
        };
    }

    // 3. Default Fallback ke Google News RSS
    const newsData = await searchWithGoogleNews(query);
    return {
        engine: 'Google News Aggregator (Default)',
        summary: null,
        results: newsData.items,
        isFallback: true
    };
}

module.exports = {
    searchDoksliMultiSource,
    detectSocialPlatform
};
