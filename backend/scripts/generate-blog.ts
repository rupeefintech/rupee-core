/**
 * Blog generator — picks the next unpublished topic, generates Markdown via Claude,
 * fetches a cover image from Unsplash, and inserts into the database.
 *
 * Usage:
 *   cd backend && npx ts-node scripts/generate-blog.ts
 *   cd backend && npx ts-node scripts/generate-blog.ts --slug section-80c-guide
 *
 * Required env vars:
 *   DATABASE_URL, ANTHROPIC_API_KEY, UNSPLASH_ACCESS_KEY (optional)
 */
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { blogTopics, BlogTopic } from './blog-topics';

const prisma = new PrismaClient();
const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// ── Unsplash helper ─────────────────────────────────────────────────────────
async function fetchCoverImage(keywords: string[]): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log('  UNSPLASH_ACCESS_KEY not set — skipping cover image');
    return null;
  }

  try {
    const query = keywords.slice(0, 3).join(' ') + ' india rupee';
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1&client_id=${accessKey}`;
    const res = await fetch(url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any as { results?: { urls: { regular: string } }[] };

    if (data.results && data.results.length > 0) {
      // Use regular size (1080px wide) for good quality without being too large
      return data.results[0].urls.regular;
    }
  } catch (err) {
    console.error('  Unsplash fetch error:', err);
  }

  return null;
}

// ── Estimate read time ──────────────────────────────────────────────────────
function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// ── Generate blog content via Claude ────────────────────────────────────────
async function generateContent(topic: BlogTopic): Promise<{ content: string; description: string }> {
  const internalLinksMap = topic.internalLinks
    .map((link) => `- [${link}](${link})`)
    .join('\n');

  const systemPrompt = `You are an expert Indian personal finance writer for Rupeepedia.in.
You write in a clear, approachable style that makes complex financial topics easy to understand.
Your audience is everyday Indians — salaried employees, small business owners, and first-time investors.

Rules:
- Write in Markdown format
- Use Indian Rupee (₹) for all amounts
- Use Indian numbering system (lakhs, crores)
- Include real, practical Indian examples (mention specific banks, govt schemes, etc.)
- Do NOT start with a level-1 heading (# Title) — we add the title separately
- Start directly with the hook introduction paragraph
- Use ## for major sections and ### for subsections
- Include at least one comparison table using Markdown table syntax
- Include at least one blockquote callout (use > 💡 **Pro Tip:** for tips, > ⚠️ **Warning:** for warnings)
- Naturally weave in internal links to Rupeepedia tools using markdown link syntax
- End with a "Frequently Asked Questions" section with 4-5 FAQs as ### headings
- End with a disclaimer line in italics
- Aim for 1500-2500 words
- Be factual, accurate, and up-to-date for Indian financial context
SEO Rules:
- Identify and naturally include primary and secondary keywords related to the topic
- Use the primary keyword in the first 100 words
- Add semantic variations and long-tail keywords throughout the article
- Use clear, SEO-friendly subheadings (H2 and H3 structure)
- Include a short meta description (150–160 characters) at the top of the article
- Maintain keyword density naturally (avoid keyword stuffing)
- Add internal linking suggestions using markdown links for Rupeepedia tools and calculators
- Include a “Key Takeaways” section near the top for featured snippet optimization
- Use bullet points for scannability where appropriate`;


  const userPrompt = `Write a comprehensive financial guide about: "${topic.title}"

Category: ${topic.category}

Internal links to naturally include in the article (use markdown link syntax):
${internalLinksMap}

Remember:
1. Start with a hook intro (2-3 punchy sentences with a stat or question) — NO # heading
2. Include a beginner-friendly explanation section
3. Add comparison tables where relevant
4. Use real Indian examples with ₹ amounts
5. Include a decision guide section
6. Add 4-5 FAQs at the end
7. End with a disclaimer

Write the full article now.`;

  console.log('  Calling Claude API...');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  const content = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('\n');

  // Generate a short description
  const descResponse = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Write a 1-2 sentence SEO meta description (under 160 characters) for this article titled "${topic.title}". Be concise and include the main benefit for the reader. Return ONLY the description text, nothing else.`,
      },
    ],
  });

  const description = descResponse.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('')
    .trim();

  return { content, description };
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  // Check for --slug flag
  const slugArg = process.argv.find((a) => a.startsWith('--slug'));
  const targetSlug = slugArg ? process.argv[process.argv.indexOf(slugArg) + 1] : null;

  let topic: BlogTopic | undefined;

  if (targetSlug) {
    topic = blogTopics.find((t) => t.slug === targetSlug);
    if (!topic) {
      console.error(`Topic with slug "${targetSlug}" not found in blog-topics.ts`);
      process.exit(1);
    }
  } else {
    // Find next unpublished topic
    const existingSlugs = await prisma.blog.findMany({
      select: { slug: true },
    });
    const publishedSlugs = new Set(existingSlugs.map((b) => b.slug));

    topic = blogTopics.find((t) => !publishedSlugs.has(t.slug));
    if (!topic) {
      console.log('All topics have been published! Add more to blog-topics.ts.');
      process.exit(0);
    }
  }

  console.log(`\nGenerating blog: "${topic.title}" [${topic.category}]`);

  // Check if already exists
  const existing = await prisma.blog.findUnique({ where: { slug: topic.slug } });
  if (existing) {
    console.log(`  Blog "${topic.slug}" already exists — skipping.`);
    process.exit(0);
  }

  // Generate content
  const { content, description } = await generateContent(topic);
  console.log(`  Content generated: ${content.split(/\s+/).length} words`);

  // Fetch cover image
  const coverImage = await fetchCoverImage(topic.keywords);
  if (coverImage) console.log('  Cover image fetched from Unsplash');

  // Calculate read time
  const readTime = estimateReadTime(content);

  // Insert into database
  const blog = await prisma.blog.create({
    data: {
      slug: topic.slug,
      title: topic.title,
      description,
      category: topic.category,
      tags: topic.keywords,
      coverImage,
      content,
      readTime,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date(),
    },
  });

  console.log(`  ✓ Blog published: id=${blog.id}, slug=${blog.slug}`);
  console.log(`  Read time: ${readTime}`);
  console.log(`  URL: /money-guides/${blog.slug}\n`);
}

main()
  .catch((e) => {
    console.error('Blog generation failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
