import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: string;
}

const SITE = "https://detectx.app";
const SITE_NAME = "DetectX";
const OG_IMAGE = `${SITE}/og-image.png`;

// hreflang alternates — emitted only on the localized landing roots so Google
// treats the 8 language versions as alternates (not duplicates). x-default -> /.
const HREFLANGS = [
  { code: "x-default", path: "/" },
  { code: "en", path: "/en/" },
  { code: "ko", path: "/ko/" },
  { code: "ja", path: "/ja/" },
  { code: "es", path: "/es/" },
  { code: "de", path: "/de/" },
  { code: "fr", path: "/fr/" },
  { code: "pt", path: "/pt/" },
  { code: "zh", path: "/zh/" },
] as const;
const LANG_ROOTS = new Set(HREFLANGS.map((h) => h.path)); // "/", "/en/", ...

export default function SEO({ title, description, path, type = "website" }: SEOProps) {
  const url = `${SITE}${path}`;
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;
  const showHreflang = LANG_ROOTS.has(path);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {showHreflang &&
        HREFLANGS.map((h) => (
          <link key={h.code} rel="alternate" hrefLang={h.code} href={`${SITE}${h.path}`} />
        ))}

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
}
