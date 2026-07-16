import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anushthanam.vercel.app';

// AI crawlers to opt out of. These are separate user-agents from the search
// crawlers (Googlebot, Bingbot, DuckDuckBot), so blocking them does NOT affect
// search-engine indexing / ranking. Honor-system — respected by the major AI
// vendors; enforced blocking of bad actors is handled at the Vercel Firewall.
const AI_CRAWLERS = [
  // Training / dataset collection
  'GPTBot',              // OpenAI training
  'Google-Extended',     // Google Gemini training (NOT Googlebot — search is unaffected)
  'CCBot',               // Common Crawl (feeds many training sets)
  'ClaudeBot',           // Anthropic
  'anthropic-ai',        // Anthropic (legacy)
  'Claude-Web',          // Anthropic (legacy)
  'Applebot-Extended',   // Apple Intelligence training
  'Meta-ExternalAgent',  // Meta AI training
  'FacebookBot',         // Meta
  'Bytespider',          // ByteDance / TikTok
  'Amazonbot',           // Amazon
  'Diffbot',
  'Omgilibot',
  'Omgili',
  'cohere-ai',
  'cohere-training-data-crawler',
  'PanguBot',
  'Timpibot',
  'Webzio-Extended',
  'ImagesiftBot',
  'AI2Bot',
  // AI answer engines / on-demand retrieval
  'OAI-SearchBot',       // OpenAI search
  'ChatGPT-User',        // ChatGPT browsing on user request
  'PerplexityBot',       // Perplexity
  'Perplexity-User',
  'YouBot',              // You.com
  'DuckAssistBot',       // DuckDuckGo AI
  'Meta-ExternalFetcher',
  'Google-CloudVertexBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, disallow: '/' },
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
