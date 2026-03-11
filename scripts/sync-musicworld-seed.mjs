import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outputFile = join(rootDir, "src", "data", "musicworld-feed.json");

const sourcePages = [
  {
    id: "heavy-guitars",
    categoryHint: "guitars",
    url: "https://www.musicworld.bg/en/c_364/Heavy_Guitars.html",
  },
  {
    id: "digital-pianos",
    categoryHint: "keyboards",
    url: "https://www.musicworld.bg/en/c_754/pp_9/Digital_Pianos.html",
  },
  {
    id: "audio-interfaces",
    categoryHint: "studio-recording",
    url: "https://www.musicworld.bg/en/c_1091/Audio_Interfaces.html",
  },
  {
    id: "hot-deals",
    categoryHint: "deals",
    url: "https://www.musicworld.bg/en/c_3292/Hot_Deals.html",
  },
];

async function main() {
  const pages = [];
  const feed = [];

  for (const source of sourcePages) {
    const html = await fetchHtml(source.url);
    const products = extractProducts(html, source);

    pages.push({
      id: source.id,
      categoryHint: source.categoryHint,
      url: source.url,
      productCount: products.length,
    });

    feed.push(...products);
  }

  const uniqueFeed = dedupeProducts(feed);
  const payload = {
    generatedAt: new Date().toISOString(),
    source: "musicworld.bg",
    pages,
    products: uniqueFeed,
  };

  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Wrote ${uniqueFeed.length} products to ${outputFile}`);
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; MusicWorldSeedSync/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function extractProducts(html, source) {
  const rows = [
    ...html.matchAll(/<div class="row[01]">([\s\S]*?)<div class="clear0"><\/div><\/div>/g),
  ];

  return rows
    .map((match) => parseRow(match[1], source))
    .filter((product) => product !== null);
}

function parseRow(rowHtml, source) {
  const href = extract(rowHtml, /<a href="([^"]+\.html)"/);
  const image = extract(rowHtml, /<img[^>]+src="([^"]+)"/);
  const model = stripListingFlags(
    cleanText(extract(rowHtml, /<div class="model">([\s\S]*?)<\/div>/)),
  );
  const description = cleanText(
    extract(rowHtml, /<div class="name">([\s\S]*?)<\/div>/),
  );
  const priceMatches = [...rowHtml.matchAll(/(?:€|â‚¬)\s*([0-9.,\s]+)/g)].map(
    (item) => toNumber(item[1]),
  );
  const availability = rowHtml.includes("in_stock.png") ? "in_stock" : "unknown";

  if (!href || !model || priceMatches.length === 0) {
    return null;
  }

  const regularPrice = priceMatches[0] ?? null;
  const salePrice = priceMatches.at(-1) ?? null;
  const currentPrice = salePrice ?? regularPrice;

  return {
    sourcePageId: source.id,
    categoryHint: source.categoryHint,
    name: model,
    description,
    brand: extractBrand(model),
    currentPriceEur: currentPrice,
    oldPriceEur:
      regularPrice && salePrice && regularPrice > salePrice ? regularPrice : null,
    availability,
    productUrl: toAbsoluteUrl(href),
    imageUrl: image ? toAbsoluteUrl(image) : null,
  };
}

function dedupeProducts(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (seen.has(item.productUrl)) {
      return false;
    }

    seen.add(item.productUrl);
    return true;
  });
}

function extract(value, pattern) {
  return value?.match(pattern)?.[1] ?? null;
}

function cleanText(value) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&reg;/g, "")
    .replace(/&deg;/g, " degrees")
    .replace(/\s+/g, " ")
    .trim();
}

function stripListingFlags(value) {
  return value.replace(/^New\s+/i, "").trim();
}

function extractBrand(value) {
  return stripListingFlags(value).split(" ")[0] ?? "Unknown";
}

function toAbsoluteUrl(url) {
  if (url.startsWith("http")) {
    return url;
  }

  return new URL(url, "https://www.musicworld.bg").toString();
}

function toNumber(value) {
  const normalized = value.replace(/\s+/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
