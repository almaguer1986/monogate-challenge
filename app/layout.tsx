import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

const siteUrl = "https://monogate.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "monogate.dev — The EML Challenge Board",
    template: "%s — monogate.dev",
  },
  description:
    "Canonical validator and leaderboard for open problems in the EML operator. " +
    "eml(x,y) = exp(x) − ln(y) · arXiv:2603.21852 · Odrzywołek 2026. " +
    "Submit a construction for sin, cos, π, or i. Get credited permanently.",
  keywords: [
    "EML operator", "elementary functions", "exp minus log", "arXiv:2603.21852",
    "mathematics", "open problems", "monogate", "sin cos pi i",
  ],
  authors: [{ name: "monogate.dev" }],
  openGraph: {
    type: "website",
    siteName: "monogate.dev",
    title: "monogate.dev — The EML Challenge Board",
    description:
      "Open problems in the EML operator: construct sin, cos, π, i from eml(x,y) = exp(x) − ln(y). Submit a construction. Get credited permanently.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Monogate — One Operator for All Elementary Functions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "monogate.dev — The EML Challenge Board",
    description:
      "Open problems in eml(x,y) = exp(x) − ln(y). Construct sin, cos, π, or i from a single binary operator. arXiv:2603.21852",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
  robots: { index: true, follow: true },
};

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #191b2e", padding: "24px", textAlign: "center",
      fontFamily: "monospace", fontSize: 11, color: "#4e5168",
      maxWidth: 900, margin: "0 auto",
    }}>
      Monogate Research ·{" "}
      <a href="https://arxiv.org/abs/2603.21852" style={{ color: "#4facfe" }}>arXiv:2603.21852</a>
      {" "}· 50 Lean theorems · 265 equations · EML Cost Conjecture (in development) ·{" "}
      <a href="https://monogate.org" style={{ color: "#4facfe" }}>monogate.org</a> ·{" "}
      <a href="https://monogate.dev" style={{ color: "#4facfe" }}>monogate.dev</a> ·{" "}
      <a href="https://github.com/almaguer1986/monogate" style={{ color: "#4facfe" }}>GitHub</a> ·{" "}
      <a href="https://pypi.org/project/monogate/" style={{ color: "#4facfe" }}>PyPI</a>
    </footer>
  );
}

const projectLd = {
  "@context": "https://schema.org",
  "@type": "ResearchProject",
  name: "Monogate",
  alternateName: "monogate.dev — The EML Challenge Board",
  description:
    "Open problems in the EML operator: construct sin, cos, π, i from eml(x,y) = exp(x) − ln(y). Interactive lab, leaderboard, and symbolic tools.",
  url: siteUrl,
  sameAs: [
    "https://monogate.org",
    "https://github.com/almaguer1986/monogate",
    "https://github.com/almaguer1986/monogate-lean",
    "https://pypi.org/project/monogate/",
    "https://arxiv.org/abs/2603.21852",
  ],
  codeRepository: "https://github.com/almaguer1986/monogate",
  author: { "@type": "Organization", name: "Monogate Research" },
  license: "https://opensource.org/licenses/MIT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(projectLd) }}
        />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
