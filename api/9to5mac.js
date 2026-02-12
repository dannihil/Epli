import Parser from "rss-parser";

const parser = new Parser();

function cleanExcerpt(text) {
  if (!text) return "";
  return text.replace(/\n?more…$/i, "").trim();
}

async function fetchOgImage(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const match = html.match(/<meta property="og:image" content="([^"]+)"/i);

    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const feed = await parser.parseURL("https://9to5mac.com/feed/");

    const items = feed.items.slice(0, 3);

    const articles = await Promise.all(
      items.map(async (item) => ({
        title: item.title,
        link: item.link,
        excerpt: cleanExcerpt(item.contentSnippet),
        image: await fetchOgImage(item.link),
      })),
    );

    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
