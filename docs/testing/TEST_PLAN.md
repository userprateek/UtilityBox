# DocsWala testing plan

**Date:** 2026-11-07  
**Source of truth:** `config/tools/registry.ts` (`TOOL_REGISTRY` / `getAllTools()`), `app/[slug]/dedicatedWorkspaces.tsx`, `app/[slug]/ToolPageClient.tsx`.  
**Rule:** Every registered tool has its own test entry. Rendering a component is not a pass. A pass requires executed UI, processing, and independently inspected output.

## Inventory

### Registered tools (30)

Enumerated from `TOOL_REGISTRY` keys (not assumed):

1. `image-compressor`
2. `image-resizer`
3. `image-cropper`
4. `image-converter`
5. `document-translator`
6. `pdf-merger`
7. `pdf-splitter`
8. `pdf-to-image`
9. `image-to-pdf`
10. `json-formatter`
11. `qr-code-generator`
12. `base64-converter`
13. `compress-image-to-50kb`
14. `compress-image-to-100kb`
15. `passport-photo-maker`
16. `passport-sheet-maker`
17. `signature-cropper`
18. `upi-qr-code-generator`
19. `gst-calculator`
20. `emi-calculator`
21. `gratuity-calculator`
22. `discount-calculator`
23. `sip-calculator`
24. `fd-calculator`
25. `word-counter`
26. `case-converter`
27. `remove-duplicates`
28. `uuid`
29. `url-encoder`
30. `jwt-decoder`

`pdf-compressor` is **not** registered (redirects to `/pdf-merger`). It is not a tool under test.

### Public application routes

| Route | Implementation |
| --- | --- |
| `/` | `app/page.tsx` |
| `/tools` | `app/tools/page.tsx` |
| `/help` | `app/help/page.tsx` |
| `/about` | `app/about/page.tsx` |
| `/privacy` | `app/privacy/page.tsx` |
| `/terms` | `app/terms/page.tsx` |
| `/{slug}` | `app/[slug]/page.tsx` for every registered slug |
| `/tools/{slug}` | permanent redirect → `/{slug}` (`next.config.mjs`) |
| `/pdf-compressor` | temporary redirect → `/pdf-merger` |
| `/{category}/{slug}` | rewrite → `/{slug}` for listed categories |
| Alias slugs | `getToolBySlug` maps `compress`, `resize`, `crop`, `convert`, `merge`, `split`, `jpg-to-pdf`, `pdf-to-jpg`, `upi`, `gst`, `emi`, `sip`, `discount`, `gratuity`, `base64*` |
| `/sitemap.xml` | `app/sitemap.ts` |
| `/llms.txt` | `app/llms.txt/route.ts` |
| 404 | `app/not-found.tsx` |

### API routes

| Route | Runtime | Purpose |
| --- | --- | --- |
| `POST /api/image/compress` | Node | Sharp-based compression (not the primary UI path; UI uses client canvas) |
| `POST /api/translate-document` | Node, `maxDuration` 60s | Gemini document translation NDJSON stream |

### Dedicated workspaces vs ToolShell

**Dedicated** (`hasDedicatedWorkspace`): image-cropper, passport-photo-maker, signature-cropper, qr-code-generator, upi-qr-code-generator, passport-sheet-maker, gst/emi/gratuity/discount/sip/fd calculators, word-counter, case-converter, remove-duplicates, uuid, url-encoder, jwt-decoder, json-formatter, document-translator.

**ToolShell + `handleProcess`:** image-compressor, compress-image-to-50kb, compress-image-to-100kb, image-resizer, image-converter, pdf-merger, pdf-splitter, pdf-to-image, image-to-pdf.

If `onProcess` is missing, ToolShell **simulates** processing (fake 30% size drop). Every ToolShell tool above must be confirmed to pass a real `onProcess`, not the simulator.

### File-processing implementations

| Module | Used by |
| --- | --- |
| `lib/image/clientImageCompressor.ts` | compressor, 50kb, 100kb, resizer, converter, cropper (optional compress) |
| `lib/image/canvasCropper.ts` | cropper, passport-photo-maker, signature-cropper |
| `lib/image/passportSheetGenerator.ts` | passport-sheet-maker |
| `lib/pdf/pdfMerger.ts` | pdf-merger |
| `lib/pdf/pdfSplitter.ts` | pdf-splitter |
| `lib/pdf/pdfToImage.ts` | pdf-to-image |
| `lib/pdf/imageToPdf.ts` | image-to-pdf |
| `lib/ai/translation/*` | document-translator (server) |
| `features/qr/QrCodeGeneratorWorkspace.tsx` (`qrcode`) | QR tools |
| `features/developer/codecs.ts` | uuid, url-encoder, jwt-decoder, base64-converter |
| Calculator workspaces | gst, emi, gratuity, discount, sip, fd |
| `features/text/TextToolsWorkspace.tsx` | word-counter, case-converter, remove-duplicates |

### Shared components (Stage 3)

FileDropzone, FileList/FileCard, ToolShell, ToolHeader, Button, Select, Input, ProgressBar, Alert/Empty/Loading states, ThemeToggle, Header, Footer, Breadcrumbs, ToolCard, RelatedTools, CopyButton, AdSlot.

### Existing automated tests

Jest + Testing Library (`*.test.ts(x)`). Canvas/`URL.createObjectURL` are mocked in `jest.setup.ts`, so those tests **do not** prove real image/PDF bytes. Playwright is the functional layer.

### External integrations / env

| Dependency | Env | Notes |
| --- | --- | --- |
| Google Gemini | `GEMINI_API_KEY`, optional `GEMINI_MODEL`, `TRANSLATION_AI_PROVIDER` | Document translator only |
| Google Analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Must not block tools if absent |

Live Gemini tests are **BLOCKED** when the key is missing. Mocked Gemini is not a live AI pass.

### Status vocabulary

| Status | Meaning |
| --- | --- |
| **PASS** | Executed; expected behaviour and independently verified output |
| **FAIL** | Executed; wrong, broken, or unverifiable output |
| **BLOCKED** | Could not execute (missing key, host limit, crashed runner) |
| **NOT TESTED** | Not executed; must be explained |

---

## Cross-cutting cases (apply to every file tool)

- Valid input → process → inspect bytes (magic, MIME, dimensions, page count).
- Invalid type / wrong extension / empty / oversized.
- Reset / remove / process again.
- Download produces a file that reopens in an independent library (`sharp` / `pdf-lib`).
- Console errors and failed network requests captured.

Viewports for Stage 6: 375×812 (mobile), 768×1024 (tablet), 1280×800 (desktop).

---

## Tool test entries

### T-01 Image Compressor

| Field | Detail |
| --- | --- |
| **Route** | `/image-compressor` |
| **Implementation** | ToolShell → `compressImageAdvanced` (`lib/image/clientImageCompressor.ts`) |
| **Inputs** | JPEG, PNG, WebP, AVIF (registry). Fixtures: PNG, JPEG, WebP. |
| **Workflow** | Upload → set quality / target KB → Compress Images → preview savings → Download |
| **Expected output** | Image blob; JPEG/PNG/WebP per settings; when target size is on and input is larger, output bytes ≤ target (or documented best-effort) |
| **Edge cases** | 1×1 px, transparent PNG, batch of 2, unsupported TXT, empty file |
| **Verify independently** | Magic bytes; `sharp.metadata()` width/height/format; compare file size to original and to target KB |

### T-02 Image Resizer

| Field | Detail |
| --- | --- |
| **Route** | `/image-resizer` |
| **Implementation** | ToolShell → `compressImageAdvanced` with px / % / mm / cm / inch |
| **Inputs** | JPEG, PNG, WebP, SVG (registry). Fixtures: raster PNG/JPEG. SVG if the UI accepts it. |
| **Workflow** | Upload 800×600 PNG → set 400×300 px, aspect lock → Resize Images → download |
| **Expected output** | Width/height match requested pixels (allow 1px rounding). Percentage 50% of 800×600 → 400×300 |
| **Edge cases** | Zero/empty dimensions, unit switch mm@300dpi, unlock aspect |
| **Verify independently** | `sharp.metadata()` dimensions |

### T-03 Image Cropper

| Field | Detail |
| --- | --- |
| **Route** | `/image-cropper` |
| **Implementation** | `ImageCropperWorkspace` → `cropImageFile` |
| **Inputs** | JPEG, PNG, WebP; max 1 file |
| **Workflow** | Upload → optional rotate/flip / aspect preset → Crop Image Now → Download Cropped Image |
| **Expected output** | Cropped image; dimensions smaller than source unless free box is full-frame; rotate 90 swaps w/h |
| **Edge cases** | No file (crop disabled), unsupported type |
| **Verify independently** | Output dimensions vs crop box × natural size; format from picker |

### T-04 Image Converter

| Field | Detail |
| --- | --- |
| **Route** | `/image-converter` |
| **Implementation** | ToolShell → `compressImageAdvanced` with explicit `outputFormat` |
| **Inputs** | JPEG, PNG, WebP, AVIF, GIF, SVG |
| **Workflow** | PNG → JPEG; JPEG → WebP; PNG with transparency → PNG |
| **Expected output** | Magic/MIME matches selected format; JPEG has no alpha |
| **Edge cases** | GIF/SVG if accepted; same-format conversion still produces a downloadable file |
| **Verify independently** | `sharp.metadata().format` |

### T-05 AI Document Translator

| Field | Detail |
| --- | --- |
| **Route** | `/document-translator` |
| **Implementation** | `DocumentTranslatorWorkspace` → `POST /api/translate-document` → orchestrator (direct / extract / OCR) |
| **Inputs** | PDF, JPEG, PNG, WebP; 1 file; 8 MB; 10 PDF pages |
| **Workflow** | Upload → source/target language → Translate → preview PDF/image → download |
| **Expected output** | Valid PDF (`%PDF`) or image, not plain text. Hindi uses Devanagari when target is `hi`. |
| **Strategies** | Direct Gemini; extract+AI; OCR+AI; fallback labels; failure after three strategies |
| **Edge cases** | Empty file, `.txt`, encrypted PDF, missing `GEMINI_API_KEY`, abort |
| **Verify independently** | `pdf-lib` load / `sharp`; page count; **live Gemini BLOCKED without key**. Do not count mocked JSON as live AI. |
| **UI-only if blocked** | Page load, privacy notice, disabled Translate, client/server validation |

### T-06 PDF Merger

| Field | Detail |
| --- | --- |
| **Route** | `/pdf-merger` |
| **Implementation** | `mergePdfFiles` |
| **Inputs** | Multiple PDFs (up to 30) |
| **Workflow** | Upload `one-page.pdf` then `two-page.pdf` → Merge PDF Files → download |
| **Expected output** | Single PDF; page count = sum; order = upload order (A then B → pages of A then B) |
| **Edge cases** | One PDF only; non-PDF; encrypted if fixture exists |
| **Verify independently** | `pdf-lib` page count; extract text “PAGE ONE” / “PAGE TWO” via pdf.js |

### T-07 PDF Splitter

| Field | Detail |
| --- | --- |
| **Route** | `/pdf-splitter` |
| **Implementation** | `splitPdfDocument` (all pages / range / interval) |
| **Inputs** | One PDF |
| **Workflow** | 3-page PDF, mode all pages → 3 files; range `1-2` → 2-page or 2 files per UI |
| **Expected output** | Each output is a valid PDF; pages match selection |
| **Edge cases** | Range beyond page count; empty range |
| **Verify independently** | `pdf-lib` page counts; text of extracted page |

### T-08 PDF to Image

| Field | Detail |
| --- | --- |
| **Route** | `/pdf-to-image` |
| **Implementation** | `convertPdfToImages` |
| **Inputs** | PDF; JPEG or PNG; DPI 72/150/300 |
| **Workflow** | 2-page PDF → JPEG 150 DPI → two images |
| **Expected output** | Image count = selected pages; format matches picker |
| **Edge cases** | Custom page `1`; PNG |
| **Verify independently** | Magic; `sharp` format; non-zero dimensions |

### T-09 Image to PDF

| Field | Detail |
| --- | --- |
| **Route** | `/image-to-pdf` |
| **Implementation** | `convertImagesToPdf` |
| **Inputs** | JPEG, PNG, WebP; up to 50 |
| **Workflow** | Two images → Convert to PDF |
| **Expected output** | Valid PDF; page count = image count (1-up default) |
| **Edge cases** | A4 vs fit; landscape |
| **Verify independently** | `pdf-lib` page count and page sizes |

### T-10 JSON Formatter & Validator

| Field | Detail |
| --- | --- |
| **Route** | `/json-formatter` |
| **Implementation** | `JsonFormatterWorkspace` |
| **Inputs** | Typed JSON / file |
| **Workflow** | Paste valid JSON → Beautify; Minify; invalid JSON shows error |
| **Expected output** | `JSON.stringify(obj, null, 2)` vs minify one-liner; invalid does not export garbage as valid |
| **Edge cases** | Trailing comma, empty, download `.json` |
| **Verify independently** | `JSON.parse` of output; compare to `JSON.stringify` |

### T-11 QR Code Generator

| Field | Detail |
| --- | --- |
| **Route** | `/qr-code-generator` |
| **Implementation** | `qrcode` in `QrCodeGeneratorWorkspace` |
| **Inputs** | URL, UPI, WhatsApp, WiFi, phone (no file required) |
| **Workflow** | Set URL `https://docswala.net/qa-qr` → wait for preview → download PNG |
| **Expected output** | PNG/SVG QR; decoded payload equals input payload |
| **Edge cases** | Empty URL; logo overlay (decode may still work or be BLOCKED if unreadable) |
| **Verify independently** | `jsQR` on downloaded PNG pixels |

### T-12 Base64 Encoder & Decoder

| Field | Detail |
| --- | --- |
| **Route** | `/base64-converter` |
| **Implementation** | `encodeBase64Text` / `decodeBase64Text` |
| **Inputs** | Text and optional file |
| **Workflow** | Encode `Hello, DocsWala` → known Base64; decode that string back |
| **Expected output** | `SGVsbG8sIERvY3NXYWxh` for that ASCII string (UTF-8 via encodeURIComponent path) |
| **Edge cases** | Invalid Base64; file encode |
| **Verify independently** | Node `Buffer.from(s).toString('base64')` / round-trip |

### T-13 Compress Image to 50KB

| Field | Detail |
| --- | --- |
| **Route** | `/compress-image-to-50kb` |
| **Implementation** | Same compressor; default target 50 KB |
| **Inputs** | JPEG/PNG/WebP larger than 50 KB if possible (generate ~200 KB JPEG) |
| **Workflow** | Upload → Compress Images |
| **Expected output** | `size <= 51200` when source > 50 KB, or documented failure to meet target |
| **Edge cases** | Already-tiny PNG |
| **Verify independently** | `fs.statSync` byte length |

### T-14 Compress Image to 100KB

| Field | Detail |
| --- | --- |
| **Route** | `/compress-image-to-100kb` |
| **Implementation** | Same compressor; default target 100 KB |
| **Expected output** | `size <= 102400` when source is larger |
| **Verify independently** | Byte length + still a valid image |

### T-15 Passport Size Photo Maker

| Field | Detail |
| --- | --- |
| **Route** | `/passport-photo-maker` |
| **Implementation** | Cropper workspace, default aspect 35×45 mm (~7:9), default target 50 KB |
| **Workflow** | Upload portrait → Crop & Compress → download |
| **Expected output** | Aspect ≈ 35/45 (±2%); if target on, size ≤ 50 KB |
| **Edge cases** | Flip/rotate before crop |
| **Verify independently** | `width/height` ratio; file size |

### T-16 Passport Photo Sheet Generator

| Field | Detail |
| --- | --- |
| **Route** | `/passport-sheet-maker` |
| **Implementation** | `generatePassportPhotoSheet` — auto-runs on file select |
| **Workflow** | Upload → wait for preview → 4×6 / A4 12 / A4 16 → download |
| **Expected output** | 4×6: 1800×1200 px (6×4 in @ 300 DPI). A4: 2480×3508 |
| **Edge cases** | Toggle cut lines; no file |
| **Verify independently** | `sharp.metadata()` exact pixel size |

### T-17 Online Signature Cropper

| Field | Detail |
| --- | --- |
| **Route** | `/signature-cropper` |
| **Implementation** | Cropper, default 3:1, default target 20 KB |
| **Expected output** | Aspect ≈ 3.0; optional size ≤ 20 KB |
| **Verify independently** | Ratio and bytes |

### T-18 UPI QR Code Generator

| Field | Detail |
| --- | --- |
| **Route** | `/upi-qr-code-generator` |
| **Implementation** | Same QR workspace, default type UPI + rupee logo |
| **Workflow** | UPI id `qa@upi`, payee `QA Shop`, amount `99` → download PNG |
| **Expected output** | Decoded `upi://pay?...pa=qa@upi...` (or documented encoding) |
| **Edge cases** | Logo may reduce scannability — record decode success/fail honestly |
| **Verify independently** | `jsQR` |

### T-19 GST Calculator

| Field | Detail |
| --- | --- |
| **Route** | `/gst-calculator` |
| **Implementation** | `GstCalculatorWorkspace` |
| **Workflow** | Shopkeeper: cost 1000, profit 200, 18% → MRP **₹1,416.00** (base 1200, GST 216). Add GST: 500 → **₹590.00**. Remove GST: 1180 → base 1000 |
| **Edge cases** | 0, negative, 28% slab |
| **Verify independently** | Hand calculation, not “a number appeared” |

### T-20 EMI Calculator

| Field | Detail |
| --- | --- |
| **Route** | `/emi-calculator` |
| **Implementation** | Standard reducing-balance EMI |
| **Independent expected** | P=100000, 10.5% p.a., 5 years: r=0.00875, N=60, EMI = P·r·(1+r)^N / ((1+r)^N−1) ≈ **₹2,149.91**; total payable ≈ ₹128,994.60 |
| **Edge cases** | 0% interest → EMI = P/N; 0 tenure |
| **Verify independently** | Compare displayed EMI to formula within ₹0.01 |

### T-21 Gratuity Calculator

| Field | Detail |
| --- | --- |
| **Route** | `/gratuity-calculator` |
| **Independent expected** | (15 × 45000 × 7) / 26 = **₹181,730.77**. Years 4 → not eligible, 0 |
| **Edge cases** | 5.0 years eligible; 0 salary |
| **Verify independently** | Formula under Payment of Gratuity Act |

### T-22 Discount Calculator

| Field | Detail |
| --- | --- |
| **Route** | `/discount-calculator` |
| **Independent expected** | 2499 at 25% → save 624.75, pay **1874.25**. Fixed ₹500 off 2499 → pay 1999 |
| **Edge cases** | 100% off, discount > price, 0 |
| **Verify independently** | Arithmetic |

### T-23 SIP Calculator

| Field | Detail |
| --- | --- |
| **Route** | `/sip-calculator` |
| **Independent expected** | SIP 10000/mo, 6% p.a., 10y: FV = PMT×((1+r)^n−1)/r×(1+r), r=0.005, n=120 ≈ **₹1,638,790** (UI rounds). Lumpsum 100000 at 6% 10y = 100000×1.06^10 ≈ **₹179,085** |
| **Edge cases** | 0% return → FV = invested; 0 years |
| **Verify independently** | Future-value formula |

### T-24 FD Calculator

| Field | Detail |
| --- | --- |
| **Route** | `/fd-calculator` |
| **Independent expected** | 100000 at 7.5% quarterly 3y: A = P(1+0.075/4)^(12) ≈ **₹24,972** interest, maturity ≈ **₹124,972** (UI rounds) |
| **Edge cases** | Annual compounding; 0 years |
| **Verify independently** | Compound interest formula |

### T-25 Word Counter

| Field | Detail |
| --- | --- |
| **Route** | `/word-counter` |
| **Fixture text** | `Alpha beta gamma.\n\nDelta delta.` |
| **Expected** | Words 5; characters include spaces/newlines; 2 paragraphs; sentences ≥ 2 |
| **Edge cases** | Empty → 0 words; extra whitespace |
| **Verify independently** | Split on `\s+` |

### T-26 Case Converter

| Field | Detail |
| --- | --- |
| **Route** | `/case-converter` |
| **Input** | `hello WORLD` |
| **Expected** | UPPER `HELLO WORLD`; lower `hello world`; Title `Hello World` |
| **Edge cases** | Empty; revert/undo if present |
| **Verify independently** | Exact string in textarea |

### T-27 Remove Duplicates

| Field | Detail |
| --- | --- |
| **Route** | `/remove-duplicates` |
| **Input** | `a\nb\na\nc` |
| **Expected** | Unique lines `a\nb\nc` (order preserved unless Sort clicked) |
| **Edge cases** | All unique; blank lines |
| **Verify independently** | Exact textarea value |

### T-28 UUID Generator

| Field | Detail |
| --- | --- |
| **Route** | `/uuid` |
| **Expected** | Default batch of 5; RFC 4122 v4 `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`; counts 1/5/10/20 |
| **Edge cases** | Regeneration produces a different set (probabilistic) |
| **Verify independently** | Regex on each line |

### T-29 URL Encoder & Decoder

| Field | Detail |
| --- | --- |
| **Route** | `/url-encoder` |
| **Input** | `hello world?x=1` |
| **Expected** | `encodeURIComponent` → `hello%20world%3Fx%3D1`; decode reverses |
| **Edge cases** | Invalid `%` sequence shows error |
| **Verify independently** | Node `encodeURIComponent` / `decodeURIComponent` |

### T-30 JWT Token Decoder

| Field | Detail |
| --- | --- |
| **Route** | `/jwt-decoder` |
| **Known token** | Header `{alg:none,typ:JWT}` payload `{sub:qa-user,name:DocsWala QA}` unsigned |
| **Expected** | Pretty JSON with those claims; malformed token errors |
| **Edge cases** | Empty; two-part token; garbage |
| **Verify independently** | Manual base64url decode of parts |

---

## Stages mapped to artefacts

| Stage | Artefact |
| --- | --- |
| 0 | This file |
| 1 | Playwright config, `tests/e2e/**` specs and helpers, and the fixture generators. Generated bytes go to `.local/testing/fixtures/`. |
| 2 | `.local/testing/evidence/static/` command logs |
| 3–7 | Playwright specs + screenshots + downloaded outputs |
| 8 | `.local/testing/results/TEST_RESULTS.md` |

Jest remains for unit tests. Playwright is the only source of “the tool actually processed a file in a browser.”
