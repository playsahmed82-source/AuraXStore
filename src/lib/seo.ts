import { useEffect } from 'react';

// SEO utility functions
export function updateSeo(options: {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}) {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
  } = options;

  // Update document title
  if (title) {
    document.title = `${title} | AuraxStore`;
  }

  // Update meta tags
  updateMetaTag('description', description);
  updateMetaTag('keywords', keywords);

  // Update Open Graph tags
  updateMetaTag('og:title', title, true);
  updateMetaTag('og:description', description, true);
  updateMetaTag('og:image', image, true);
  updateMetaTag('og:url', url || window.location.href, true);
  updateMetaTag('og:type', type, true);

  // Update Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image', true);
  updateMetaTag('twitter:title', title, true);
  updateMetaTag('twitter:description', description, true);
  updateMetaTag('twitter:image', image, true);
}

function updateMetaTag(name: string, content: string | undefined, isProperty = false) {
  if (!content) return;

  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    if (isProperty) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
}

// React hook for SEO
export function useSeo(options: Parameters<typeof updateSeo>[0]) {
  useEffect(() => {
    updateSeo(options);
  }, [options.title, options.description, options.keywords, options.image, options.type]);
}

// Generate product structured data (JSON-LD)
export function generateProductSchema(product: {
  name: string;
  description?: string;
  price: number;
  images?: string[];
  slug: string;
  product_type?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.images || [],
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://auraxstore.com/products/${product.slug}`,
    },
    category: product.product_type || 'Gaming',
  };
}

// Generate organization structured data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AuraxStore',
    url: 'https://auraxstore.com',
    logo: 'https://auraxstore.com/logo.png',
    description: 'Premium gaming marketplace for accounts, top-ups, and boosting services',
    sameAs: [
      'https://discord.gg/auraxstore',
      'https://twitter.com/auraxstore',
    ],
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Insert JSON-LD script tag
export function insertJsonLd(data: object) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);

  return () => {
    document.head.removeChild(script);
  };
}

// Sitemap generation (for backend)
export function generateSitemap(pages: { url: string; lastmod?: string; priority?: number }[]): string {
  const baseUrl = 'https://auraxstore.com';

  const urls = pages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <priority>${page.priority || 0.5}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
