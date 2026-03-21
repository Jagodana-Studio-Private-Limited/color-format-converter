export const siteConfig = {
  // ====== CUSTOMIZE THESE FOR EACH TOOL ======
  name: "Color Format Converter",
  title: "Color Format Converter - Convert Colors Between HEX, RGB, HSL, HWB & OKLCH",
  description:
    "Free online color format converter. Convert colors between HEX, RGB, HSL, HWB, and OKLCH formats instantly. Visual color picker, one-click copy, and real-time preview. 100% client-side.",
  url: "https://color-format-converter.tools.jagodana.com",
  ogImage: "/opengraph-image",

  // Header
  headerIcon: "Palette", // lucide-react icon name
  // Brand gradient colors for Tailwind are in globals.css (--brand / --brand-accent)
  // Use text-brand, from-brand, to-brand-accent etc. in components
  brandAccentColor: "#a855f7", // hex accent for OG image gradient (must match --brand-accent in globals.css)

  // SEO
  keywords: [
    "color converter",
    "hex to rgb",
    "rgb to hsl",
    "color format converter",
    "oklch converter",
    "hwb converter",
    "css color converter",
    "color picker tool",
    "hex to hsl",
    "color code converter",
  ],
  applicationCategory: "DeveloperApplication",

  // Theme
  themeColor: "#ec4899", // used in manifest and meta tags

  // Branding
  creator: "Jagodana",
  creatorUrl: "https://jagodana.com",
  twitterHandle: "@jagodana",

  // Social Profiles (for Organization schema sameAs)
  socialProfiles: [
    "https://twitter.com/jagodana",
    // Add more: LinkedIn, YouTube, etc.
  ],

  // Links
  links: {
    github:
      "https://github.com/Jagodana-Studio-Private-Limited/color-format-converter",
    website: "https://jagodana.com",
  },

  // Footer
  footer: {
    about:
      "Color Format Converter is a free tool by Jagodana that converts colors between HEX, RGB, HSL, HWB, and OKLCH formats. 100% client-side processing.",
    featuresTitle: "Features",
    features: [
      "HEX, RGB, HSL, HWB, OKLCH",
      "Visual Color Picker",
      "Real-Time Preview",
      "One-Click Copy",
    ],
  },

  // Hero Section
  hero: {
    badge: "Free Color Format Converter",
    titleLine1: "Convert Colors Between",
    titleGradient: "Any Format Instantly",
    subtitle:
      "Transform colors between HEX, RGB, HSL, HWB, and OKLCH with a visual picker. One-click copy, real-time preview, and zero server processing — everything runs in your browser.",
  },

  // Feature Cards (shown on homepage)
  featureCards: [
    {
      icon: "🎨",
      title: "Visual Color Picker",
      description:
        "Pick any color visually and see all format conversions instantly.",
    },
    {
      icon: "🔄",
      title: "Multi-Format Support",
      description:
        "Convert between HEX, RGB, HSL, HWB, and modern OKLCH formats.",
    },
    {
      icon: "📋",
      title: "One-Click Copy",
      description: "Copy any color format to clipboard with a single click.",
    },
  ],

  // Related Tools (cross-linking to sibling Jagodana tools for internal SEO)
  relatedTools: [
    {
      name: "Favicon Generator",
      url: "https://favicon-generator.jagodana.com",
      icon: "🎨",
      description: "Generate all favicon sizes + manifest from any image.",
    },
    {
      name: "Sitemap Checker",
      url: "https://sitemap-checker.jagodana.com",
      icon: "🔍",
      description: "Discover and validate sitemaps on any website.",
    },
    {
      name: "Regex Playground",
      url: "https://regex-playground.jagodana.com",
      icon: "🧪",
      description: "Build, test & debug regular expressions in real-time.",
    },
    {
      name: "Screenshot Beautifier",
      url: "https://screenshot-beautifier.jagodana.com",
      icon: "📸",
      description: "Transform screenshots into beautiful images.",
    },
    {
      name: "Color Palette Explorer",
      url: "https://color-palette-explorer.jagodana.com",
      icon: "🎭",
      description: "Extract color palettes from any image.",
    },
    {
      name: "Logo Maker",
      url: "https://logo-maker.jagodana.com",
      icon: "✏️",
      description: "Create a professional logo in 60 seconds.",
    },
  ],

  // HowTo Steps (drives HowTo JSON-LD schema for rich results)
  howToSteps: [
    {
      name: "Enter a Color",
      text: "Type a color value in any supported format (HEX, RGB, HSL, HWB, or OKLCH) or use the visual color picker.",
      url: "",
    },
    {
      name: "View Conversions",
      text: "See the color instantly converted to all supported formats with a live preview swatch.",
      url: "",
    },
    {
      name: "Copy the Result",
      text: "Click the copy button next to any format to copy the color value to your clipboard.",
      url: "",
    },
  ],
  howToTotalTime: "PT1M", // ISO 8601 duration

  // FAQ (drives both the FAQ UI section and FAQPage JSON-LD schema)
  faq: [
    {
      question: "What color formats are supported?",
      answer:
        "Color Format Converter supports HEX, RGB, RGBA, HSL, HSLA, HWB, and OKLCH color formats. You can input a color in any format and get conversions to all others.",
    },
    {
      question: "Is my data processed on a server?",
      answer:
        "No. All color conversions happen entirely in your browser. No data is sent to any server.",
    },
    {
      question: "What is OKLCH?",
      answer:
        "OKLCH is a modern CSS color format that provides perceptually uniform colors. It uses Lightness, Chroma, and Hue components, making it easier to create consistent color palettes.",
    },
    {
      question: "Can I use the visual color picker?",
      answer:
        "Yes! Click the color swatch to open a native color picker. The selected color will be automatically converted to all supported formats.",
    },
  ],

  // ====== PAGES (for sitemap + per-page SEO) ======
  // Add every route here. Sitemap and generatePageMetadata() read from this.
  pages: {
    "/": {
      title:
        "Color Format Converter - Convert Colors Between HEX, RGB, HSL, HWB & OKLCH",
      description:
        "Free online color format converter. Convert colors between HEX, RGB, HSL, HWB, and OKLCH formats instantly. Visual color picker, one-click copy, and real-time preview. 100% client-side.",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
