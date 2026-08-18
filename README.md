# 📦 DocsWala

> **100% Free • No Sign-Up • Fast In-Browser Utilities**  
> A high-performance suite of client-side browser tools for images, PDFs, QR codes, and everyday form filling. Built for cyber cafes, small xerox & print shops, students, and citizens filling online exam/government portal forms.

---

## 🔒 100% Client-Side Privacy Guarantee

Traditional file conversion websites upload your confidential documents (Aadhaar cards, marksheets, signatures, bank statements) to unknown cloud servers.

**DocsWala executes 100% locally on your computer:**

- **Zero Server Uploads**: Files never leave your browser sandbox.
- **No Sign-Up Required**: Instant unlimited access without creating an account.
- **Local CPU/GPU Computation**: Image cropping, compression, and QR rendering run locally via HTML5 Canvas and WebAssembly.
- **Zero Watermarks & Zero Limits**: Free forever for personal and commercial shop counter usage.

---

## 🚀 Key Features & Implemented Tools

### 1. ✂️ Interactive Passport Photo & Signature Cropper (`/image-cropper`)

- Custom draggable crop box with **4 prominent side grip buttons** and **4 corner grab handles**.
- 1-Click presets for **Passport Photos (35×45mm / 2×2 in)**, **Signatures (3:1)**, **ID Cards (4:3)**, and custom ratios.
- Rotate (90°, 180°, 270°) and flip tools with intermediate canvas projection for 100% mathematical crop precision.
- High-res PNG, JPEG, and WebP downloads.

### 2. 📱 Shop UPI & WhatsApp QR Code Generator (`/qr-code-generator`)

- **Shop UPI Payment QR**: Custom Shop UPI ID (VPA), Payee Name, and optional fixed amount for Google Pay, PhonePe, Paytm, and BHIM.
- **Center Logo & Image Embedding**:
  - Built-in high-contrast icons: **₹ Rupee / UPI**, **WhatsApp**, **Store / Shop**, and **WiFi**.
  - **Upload Custom Image / Shop Logo**: Embed your own shop logo directly into the center with automatic contrast shield badges.
  - Center logo size slider (15% to 26%).
- **WhatsApp Direct Chat QR**: Pre-filled message generator for customer printing/xerox orders.
- **Shop WiFi QR**: Instant WiFi connection QR for cyber cafe customers.
- **Print Standee Button**: Generates a print-ready counter standee card ready for physical shop printing.
- **Copy Image**: 1-Click copy to clipboard for instant pasting (`Ctrl+V`) into MS Word, Photoshop, or WhatsApp Web.

### 3. 📸 Image Compressor (`/image-compressor`)

- Target file size reduction (e.g. Under 50KB / 100KB for government and exam portals).
- Quality adjustment slider with live percentage savings calculator.
- EXIF metadata stripping for privacy protection.

### 4. 💰 Google AdSense Ready

- Responsive ad slot containers (`components/ads/AdSlot.tsx`) supporting Leaderboard (728×90), Sidebar Rectangle (300×250), and In-Feed banners.
- Controlled via `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` environment variables.

---

## 🛠️ Technology Stack

| Layer            | Technology                                                                    |
| ---------------- | ----------------------------------------------------------------------------- |
| **Framework**    | Next.js 15 (App Router, Server Components by default, Dynamic Code-Splitting) |
| **Language**     | TypeScript (Strict Configuration)                                             |
| **Styling**      | SCSS Modules & Structured Design System tokens (No Tailwind CSS)              |
| **Icons**        | Lucide React & Custom Brand Vectors                                           |
| **Testing**      | Jest 30 + React Testing Library (24 suites, 83 tests)                         |
| **SEO & Schema** | Schema.org JSON-LD (`WebApplication`, `FAQPage`, `BreadcrumbList`, `WebSite`) |
| **Code Quality** | ESLint & Prettier                                                             |

---

## 📂 Project Structure

```text
UtilityBox/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout (Header, Footer, Meta, Font, Schema.org)
│   ├── page.tsx                   # Conversion homepage with Cyber Cafe Quick Actions
│   ├── sitemap.ts                 # Dynamic SEO sitemap generator
│   ├── robots.ts                  # Robots.txt generator
│   ├── about/page.tsx             # Privacy guarantee & architecture info
│   ├── privacy/page.tsx           # Privacy Policy
│   ├── terms/page.tsx             # Terms of Service
│   └── tools/                     # Tools routing
│       ├── page.tsx               # All Tools directory with search & category filters
│       ├── ToolsDirectoryClient.tsx
│       └── [slug]/                # Dynamic tool route (SSG with generateStaticParams)
│           ├── page.tsx           # Server component with dynamic SEO (generateMetadata)
│           └── ToolPageClient.tsx # Lazy code-splitting client component
│
├── components/                    # Reusable UI primitives
│   ├── common/                    # Button, Card, Badge, Input, Select, ProgressBar, States
│   ├── common/ToolIcon/           # Shared Lucide icon mapper
│   ├── layout/                    # Header, Footer, Container
│   ├── ads/                       # AdSlot (Google AdSense responsive container)
│   ├── navigation/Breadcrumbs/    # Semantic breadcrumbs with JSON-LD
│   ├── tool/                      # ToolShell, ToolHeader, ToolCard, ToolGuide, ToolFaq
│   ├── seo/                       # JsonLd structured data injector
│   ├── file-upload/               # FileDropzone (Accessible drag & drop, format badges)
│   └── file-preview/              # FileList, FileCard (Thumbnails, savings, progress)
│
├── features/                      # Tool-specific workspaces and options
│   ├── image/                     # ImageCropperWorkspace, ImageCompressorOptions
│   └── qr/                        # QrCodeGeneratorWorkspace (UPI, WiFi, WhatsApp, Center Logo)
│
├── lib/                           # Core utilities, validation, and contracts
│   ├── file/                      # Byte formatting, download triggers, file reading
│   ├── image/                     # canvasCropper (Lossless canvas cropping & rotation projection)
│   ├── seo/                       # Schema.org JSON-LD generators
│   ├── utils/                     # cn, formatting helpers
│   └── validation/                # fileValidation (MIME checks with Windows extension fallbacks)
│
├── config/                        # Declarative configuration
│   ├── site.ts                    # Global site metadata, URLs, creator
│   └── tools/                     # Tool metadata registry and categories
│       ├── categories.ts          # Category definitions (Images, PDFs, Utilities)
│       └── registry.ts            # Central catalog of all tool metadata & search
│
├── hooks/                         # Reusable React hooks
│   ├── useFileUpload.ts           # Memory-safe file management with useRef URL tracking
│   └── useFileProcessor.ts        # Execution lifecycle runner (idle, processing, error, done)
│
├── styles/                        # Structured SCSS Design System
│   ├── variables.scss             # Design tokens (colors, spacing, radii, typography)
│   ├── mixins.scss                # Breakpoints, glassmorphism, flex helpers
│   ├── reset.scss                 # Modern CSS reset
│   └── globals.scss               # Global root variables and layout classes
│
└── tests/                         # Multi-tier test suite
    ├── accessibility.test.tsx     # WCAG a11y, ARIA attributes, keyboard navigation
    ├── memoryLeakCleanup.test.ts  # Object URL revocation on unmount/removal
    ├── seoRoutes.test.ts          # Route registry & canonical URL validation
    └── seoStructuredData.test.ts  # Schema.org JSON-LD validation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18.17+` (Tested on `v22.x`)
- npm `v9+`

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Open in your browser
open http://localhost:3000
```

### Verification & Testing

```bash
# Run all 24 Jest test suites (83 tests)
npm test

# Check types with strict TypeScript
npm run typecheck

# Run ESLint
npm run lint

# Format code
npm run format

# Test production build
npm run build
```

---

## ➕ How to Add a New Tool in 3 Steps

The architecture is fully decoupled: adding new tools requires zero modifications to existing tools.

### Step 1: Register Tool in `config/tools/registry.ts`

```typescript
'pdf-merger': {
  slug: 'pdf-merger',
  name: 'PDF Merger',
  shortDescription: 'Combine multiple PDF files or scanned IDs into 1 single document.',
  description: 'Merge marksheets, front & back of Aadhaar/Voter IDs, or certificates into a clean PDF.',
  category: 'pdf',
  iconName: 'Layers',
  supportedInputFormats: ['application/pdf'],
  supportedOutputFormats: ['application/pdf'],
  maxFiles: 20,
  maxFileSizeMB: 50,
  seoTitle: 'Merge PDF Online Free - Combine PDF Files & Documents',
  seoDescription: 'Merge PDF files and marksheets online for free. 100% in-browser privacy.',
  keywords: ['merge pdf', 'combine pdf', 'join pdf files'],
  isPopular: true,
}
```

### Step 2: Create Tool Workspace in `features/`

Create `features/pdf/PdfMergerWorkspace.tsx` or options component in `features/pdf/`.

### Step 3: Lazy Route in `app/[slug]/ToolPageClient.tsx`

```tsx
const PdfMergerWorkspace = dynamic(
  () => import('@/features/pdf/PdfMergerWorkspace').then((m) => m.PdfMergerWorkspace),
  { loading: () => <LoadingState message="Loading PDF Merger..." /> }
);
```

---

## 📄 License

MIT © [DocsWala](https://docswala.net)
