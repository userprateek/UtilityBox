# DocsWala master test cases

**Status:** expectations refined on 2026-11-07 after review. Execution results are only in `docs/testing/MASTER_TEST_RESULTS.md`. This file does not record passes.  
**Date:** 2026-11-07  
**Sources inspected:** `config/tools/registry.ts` (30 tools), `app/[slug]/ToolPageClient.tsx`, dedicated workspaces under `features/`, `lib/image`, `lib/pdf`, `lib/ai/translation`, `lib/validation/fileValidation.ts`, and the cases already recorded in `docs/testing/TEST_PLAN.md` and `docs/testing/TEST_RESULTS.md`.

This catalogue adds the cases the current programme does not already prove. A one-line “already recorded” note names the existing evidence so those workflows are not written out again.

## How to read a case

| Column | Meaning |
| --- | --- |
| ID | Stable id for a future run. Prefix is the section. |
| Tool / scenario | Registered slug and the behaviour under test. |
| Input | User action and data. |
| Expected output | What the current implementation should do. Where the registry text and the code disagree, the expected column follows the code and says so. |
| Independent check | A check outside the page’s own success message. |
| Automation | Playwright, Jest, a live script, or manual. |
| Fixture | Existing file, or a file that still has to be created. |
| Priority | Critical, High, Medium, or Low. |

Viewports, when a case names one: 375×812, 768×1024, 1280×800.

## Review rules

These rules override any softer wording later in this file.

- A translated page fails if source English remains, if Hindi is clipped, or if a cover paints out background that is not the text itself.
- Raster PDFs are judged by rendering the page and running OCR, plus a look at the page image. Extracted PDF text is not evidence, because reconstruction has no text layer.
- TR-13 is a separate layout from the two-line library notice: a heading, a body paragraph, and a non-text mark that must survive.
- An empty splitter range is invalid. It must not silently extract every page.
- A password-protected PDF must be refused. Opening it because encryption was ignored is a failure.
- The splitter registry text promises a ZIP. The splitter screen promises separate files. That mismatch is a product issue. The functional case expects the files the screen describes.
- Negative money inputs are invalid. A negative MRP, EMI, or payout is a failure.
- A tenure of 0 is invalid. Showing a successful ₹0 calculation without saying the tenure is invalid is a failure.
- A JWT with fewer than three parts is malformed and must be rejected.
- Decoding a JWT does not verify its signature. The screen may show claims for a three-part token, and it must not say the signature was verified or the token is trusted.
- Routing cases use only redirects and rewrites in `next.config.mjs`, plus slug aliases implemented by `getToolBySlug` on `app/[slug]/page.tsx`. There is no `utilities` tool, so `/utilities/:slug` is not a required alias.
- Listing a file because the browser accepts its MIME is not proof the tool can process it. Processing must return a valid output or a clear error.

## Inventory

All 30 registered slugs are in scope: `image-compressor`, `image-resizer`, `image-cropper`, `image-converter`, `document-translator`, `pdf-merger`, `pdf-splitter`, `pdf-to-image`, `image-to-pdf`, `json-formatter`, `qr-code-generator`, `base64-converter`, `compress-image-to-50kb`, `compress-image-to-100kb`, `passport-photo-maker`, `passport-sheet-maker`, `signature-cropper`, `upi-qr-code-generator`, `gst-calculator`, `emi-calculator`, `gratuity-calculator`, `discount-calculator`, `sip-calculator`, `fd-calculator`, `word-counter`, `case-converter`, `remove-duplicates`, `uuid`, `url-encoder`, `jwt-decoder`.

`pdf-compressor` stays out of the tool list. The redirect is a shared-infrastructure case.

## Already recorded — do not duplicate

These workflows already have a browser run plus an independent check in `TEST_RESULTS.md`. New runs should keep them as regression, not as new case design.

| Tool | What is already recorded |
| --- | --- |
| image-compressor | Noisy JPEG shrinks to a valid JPEG; PNG and WebP are accepted; `.txt`, empty, wrong-extension, and 1×1 PNG are handled. |
| image-resizer | 800×600 PNG → 400×300. Original keeps PNG, JPEG, and WebP bytes. Explicit JPEG converts a PNG. |
| image-cropper | Crop downloads a smaller JPEG. Rotate control is clickable. |
| image-converter | PNG → JPEG, magic and dimensions checked. |
| compress-image-to-50kb | Output ≤ 51 200 bytes and still an image. |
| compress-image-to-100kb | Output ≤ 102 400 bytes and still an image. |
| passport-photo-maker | Default crop ratio about 35/45. |
| passport-sheet-maker | 4×6 sheet is 1800×1200 JPEG. |
| signature-cropper | Default crop is 600×200, aspect 3. |
| document-translator | UI, `.txt` rejection, 9 MB rejection, live Hindi on a 2-page digital PDF for direct, extract, and OCR, English markers absent on that fixture. |
| pdf-merger | 1-page + 2-page → 3-page PDF. Corrupt PDF does not succeed. |
| pdf-splitter | 3-page PDF, all-pages mode, produces single-page PDFs. |
| pdf-to-image | 2-page PDF → JPEG that `sharp` reopens. |
| image-to-pdf | Two images → 2-page PDF. |
| qr-code-generator | URL payload decodes with jsQR. |
| upi-qr-code-generator | `upi://pay?pa=qa@upi&pn=QA%20Shop&cu=INR&am=99.00`. |
| gst-calculator | Shopkeeper 1000+200 @18% = 1416. Add GST 500 @18% = 590. |
| emi-calculator | 100000 @10.5% for 5 years matches the reducing-balance formula within ₹1. Rapid clicks do not crash. |
| gratuity-calculator | 7 years @45000 matches `(15×basic×years)/26`. 4 years is not eligible. |
| discount-calculator | 2499 at 25% = 1874.25. |
| sip-calculator | Default monthly SIP matches the future-value formula after rounding. |
| fd-calculator | 100000 @7.5% quarterly for 3 years matches quarterly compound interest after rounding. |
| word-counter | Known 5-word sample, and empty → 0 words. |
| case-converter | `hello WORLD` through UPPER, Title, and lower. |
| remove-duplicates | `a / b / a / c` keeps first occurrences. |
| json-formatter | Beautify and minify parse; invalid JSON errors; empty beautify does not crash. |
| base64-converter | `Hello, DocsWala` → `SGVsbG8sIERvY3NXYWxh` and back. |
| uuid | Five lines match the v4 pattern. |
| url-encoder | `hello world?x=1` round-trips through `encodeURIComponent`. |
| jwt-decoder | Known unsigned token shows `qa-user` and `DocsWala QA`. `not-a-jwt` errors. |
| Shared UI | Dropzone list/reset, unsupported and empty files, keyboard focus and Enter/Space, search, theme, footer, back/forward, homepage mobile overflow, EMI tablet, all 30 routes, sitemap, `llms.txt`. |
| API | `POST /api/image/compress` returns JPEG and 400 without a file. `POST /api/translate-document` 400 without a file. |

The missing-key translator message passed in the first programme and was skipped once a key was configured. It is listed again only as a regression guard.

---

## Image tools

Shared image facts from the code: client processing goes through `compressImageAdvanced` or `cropImageFile`. A target size forces PNG through the JPEG path in `canvasCompressor`. Resizer units are `px`, `%`, `mm`, `cm`, and `inch`, with `mm`/`cm`/`inch` converted at the selected DPI. Passport sheets are JPEG only, despite the registry also listing PDF. Sheet presets are 4×6 (1800×1200, 4×2), A4 12 (2480×3508, 3×4), and A4 16 (2480×3508, 4×4).

| ID | Tool / scenario | Input | Expected output | Independent check | Automation | Fixture | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IMG-01 | image-compressor — quality only | Look for a control that turns the KB target off, then compress `noisy-1200x900.jpg` by quality with dimensions unchanged. | The tool offers a quality-only mode. Output dimensions match the source. A KB target that cannot be disabled means this workflow is unavailable, which fails the case. | `sharp` width and height equal the source. | Playwright | existing noisy JPEG | High |
| IMG-02 | image-compressor — PNG with a KB target | Target 100 KB on `transparent-64x64.png` after scaling it up, or on a large PNG. | Output is JPEG. Alpha is flattened. Bytes ≤ target when the source is larger. | Magic `ffd8ff`; `sharp` reports jpeg and no alpha. | Playwright | generate a PNG > 100 KB | High |
| IMG-03 | image-compressor — batch | Upload PNG and WebP together and compress. | Two completed rows, two downloads, each a valid image. | `sharp` on both downloads. | Playwright | `red-800x600.png`, `green-200x200.webp` | Medium |
| IMG-04 | image-compressor — size and count limits | One file of 50 MB + 1 byte; then 21 small PNGs. | “exceeds the maximum allowed size of 50MB.” Second batch: “maximum of 20 files”. No completed output for the rejected file. | Assert the alert text. No download. | Playwright | generate oversize and 21 tiny PNGs | High |
| IMG-05 | image-compressor — AVIF | Upload a real AVIF. | Acceptance by the file input is only browser format support. Processing must then yield a JPEG, PNG, or WebP that `sharp` can read, or a visible processing error. A listed file with a non-image download fails. | Magic bytes and `sharp` after the process click. | Playwright | generated `sample.avif` | Medium |
| IMG-06 | image-resizer — percentage | 800×600 PNG, unit %, 50, aspect locked. | 400×300, original format PNG. | `sharp` width, height, format. | Playwright | `red-800x600.png` | High |
| IMG-07 | image-resizer — physical units | Separate runs at 300 DPI: 25.4 mm, 2.54 cm, and 1 inch, square, aspect locked. | Each output is 300×300 px. | `sharp` dimensions. Formula is `round((mm/25.4)×dpi)`, `round((cm/2.54)×dpi)`, `round(inches×dpi)`. | Playwright | `red-800x600.png` | High |
| IMG-08 | image-resizer — unlocked aspect | 800×600, aspect lock off, 400×100 px. | Exactly 400×100. | `sharp` dimensions. | Playwright | `red-800x600.png` | High |
| IMG-09 | image-resizer — zero and empty | Width 0, then resize. | The resize is rejected. Substituting a default such as 1080 px and downloading that image is a failure. | No download whose width is a silent default. | Playwright | `red-800x600.png` | High |
| IMG-10 | image-resizer — SVG | Upload a small SVG. | Listed if the MIME map accepts `.svg`. Output is a raster JPEG, PNG, or WebP with finite dimensions, or a visible error. | `sharp` on the download. | Playwright | new `icon.svg` | Medium |
| IMG-11 | image-cropper — preset ratios | Portrait photo. Apply 1:1, 4:3, and 16:9, then crop each. | Downloaded width/height matches the preset ratio within 2%. | `sharp` ratio. | Playwright | `portrait-600x800.jpg` | High |
| IMG-12 | image-cropper — rotate 90 | Rotate once, crop the full oriented frame. | Width and height swap relative to the unrotated crop of the same box. | `sharp` dimensions before and after. | Playwright | `red-800x600.png` | High |
| IMG-13 | image-cropper — format and empty state | No file: Crop stays disabled. With a file, choose PNG and crop. | PNG magic `89504e47`. | `sharp.format === 'png'`. | Playwright | `red-800x600.png` | Medium |
| IMG-14 | image-converter — WebP and transparency | JPEG → WebP. Transparent PNG → PNG. | WebP magic `RIFF`/`WEBP`. PNG keeps an alpha channel. | `sharp` format and `hasAlpha`. | Playwright | noisy JPEG, `transparent-64x64.png` | High |
| IMG-15 | image-converter — GIF, SVG, same format | GIF → JPEG. SVG → PNG. PNG → PNG. | Each download matches the chosen format and has non-zero dimensions. GIF animation may flatten to one frame; record that if so. | `sharp` format and dimensions. | Playwright | new `anim.gif`, new `icon.svg`, existing PNG | Medium |
| IMG-16 | image-converter — batch limit | 26 images. | “maximum of 25 files”. | Alert text. | Playwright | generate 26 tiny PNGs | Low |
| IMG-17 | compress-image-to-50kb — already small | `tiny-1x1.png` and a JPEG already under 50 KB. | Valid image, bytes ≤ 51 200. It must not be reported as meeting the target if `sharp` cannot read it. | Byte length and magic. | Playwright | existing tiny PNG; generate a 20 KB JPEG | Medium |
| IMG-18 | compress-image-to-100kb — PNG source | PNG larger than 100 KB. | Bytes ≤ 102 400 and the file is a readable JPEG, because a target forces the JPEG encoder. | Magic and `sharp`. | Playwright | generate large PNG | High |
| IMG-19 | passport-photo-maker — square preset and size | Use the square preset the screen actually shows (labeled 1:1). Then crop 35×45 with the 50 KB target. | Square output ratio is 1.0 ± 2%. The 50 KB crop is ≤ 51 200 bytes. A missing 2×2 label is recorded; the 1:1 control is the one under test. | `sharp` ratio and byte length. | Playwright | `portrait-600x800.jpg` | High |
| IMG-20 | passport-photo-maker — flip | Flip horizontal, then crop 35×45. | A readable image at about 35:45. Left/right content is mirrored versus the unflipped crop. | Compare a distinctive edge pixel or fixture with a mark on one side. | Playwright | new portrait with a unique left edge | Medium |
| IMG-21 | signature-cropper — 2:1 and 20 KB | Select a 2:1 preset if it exists. The default 20 KB target stays on. | A 2:1 control must exist, because the registry advertises it. Output ratio 2.0 ± 2% and size ≤ 20 480 bytes. A screen that only offers 3:1 fails the 2:1 requirement. The 3:1 default is checked separately and must be ≤ 20 480 bytes. | Button inventory, then `sharp` and byte length. | Playwright | `red-800x600.png` | High |
| IMG-22 | passport-sheet-maker — A4 12 | Upload a portrait and choose the 12-photo A4 preset. | JPEG, 2480×3508. Twelve photo regions, not stretched: a non-35:45 source is letterboxed. | `sharp` exact pixels. Sample grid cells for ink and white gutters. | Playwright | `portrait-600x800.jpg` | Critical |
| IMG-23 | passport-sheet-maker — A4 16 and cut lines | A4 16 with cut lines on, then off. | Both are 2480×3508 JPEG. The cut-line image has dashed border pixels the plain image does not. | `sharp` size. Pixel diff of one photo border. | Playwright | `portrait-600x800.jpg` | High |
| IMG-24 | passport-sheet-maker — PDF claim | Look for a PDF download. | The control is “Download High-Res Sheet (JPG)”. The file is JPEG. A PDF would be extra, not required by the code. | Magic bytes. | Playwright | existing portrait | Medium |
| IMG-25 | passport-sheet-maker — bad file | Upload `notes.txt` and `corrupt` bytes renamed `.jpg`. | Text is rejected at selection. A corrupt image shows a load error and no sheet. | Alert text; no 2480×3508 download. | Playwright | `notes.txt`, new bad JPEG | Medium |
| IMG-26 | all image tools — download reopen | After each new image case, save the browser download. | The saved file opens in `sharp` with the same dimensions as the preview claims. | `sharp`, not the on-page file size label alone. | Playwright | per case | High |

---

## PDF tools

Splitter range syntax on the screen is `1-3, 5`. Out-of-range numbers that leave no pages throw `Invalid page range`. An empty range is invalid even if the parser currently selects every page. There is no ZIP writer. The registry ZIP line is a product issue. Password-protected PDFs must be refused by the merger and the splitter; `ignoreEncryption: true` does not make a bypass correct.

| ID | Tool / scenario | Input | Expected output | Independent check | Automation | Fixture | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PDF-01 | pdf-merger — reorder | Upload `three-page.pdf`, then `one-page.pdf`. Move the one-page file above the three-page file. Merge. | 4 pages. Text order is page one, then the three-page document’s pages. | pdf.js text extraction per page. | Playwright | existing PDFs | Critical |
| PDF-02 | pdf-merger — single file | Upload only `two-page.pdf`. | One PDF, 2 pages, `%PDF-`. | `pdf-lib` page count. | Playwright | `two-page.pdf` | Medium |
| PDF-03 | pdf-merger — limits | 31 PDFs; one PDF over 100 MB. | “maximum of 30 files” and “exceeds the maximum allowed size of 100MB.” | Alert text. | Playwright | generate copies and one oversize PDF | High |
| PDF-04 | pdf-merger — encrypted | A PDF with user password `secret`. | The merger refuses it and names the password protection. A merged PDF, including one produced by ignoring encryption, is a failure. | Visible refusal. No successful download. | Playwright | generated `encrypted.pdf` | Critical |
| PDF-05 | pdf-merger — bookmarks | A PDF with one outline entry, merged with `one-page.pdf`. | Page count is the sum. Bookmark retention is not required by `mergePdfFiles`. Record whether outlines survive. | `pdf-lib` `getPageCount()` and outline lookup. | Playwright | new `bookmarked.pdf` | Low |
| PDF-06 | pdf-splitter — custom range | 3-page PDF, mode range, `1-2`. | One PDF, 2 pages, text of pages 1 and 2 only. | pdf.js text. Filename contains the range label. | Playwright | `three-page.pdf` | Critical |
| PDF-07 | pdf-splitter — interval | 3-page PDF, fixed interval 2. | Two PDFs: 2 pages, then 1 page. | `pdf-lib` page counts and page text. | Playwright | `three-page.pdf` | High |
| PDF-08 | pdf-splitter — bad range | Range `9-12` on a 3-page file. | Error containing “Invalid page range” and the page count. No download. | Visible error; no `%PDF` download. | Playwright | `three-page.pdf` | High |
| PDF-09 | pdf-splitter — empty range | Custom Page Range, clear the field, then split a 3-page PDF. | The run is rejected and asks for a page range. Extracting all 3 pages, or any pages, is a failure. | Visible validation. No PDF download. | Playwright | `three-page.pdf` | High |
| PDF-10 | pdf-splitter — separate files, ZIP promise | All-pages on `three-page.pdf`. Also read the on-screen split description and the registry feature line. | The screen’s “separate PDF” / “batch download” behaviour produces three 1-page PDFs and no `.zip`. The registry sentence “bundled ZIP” disagrees with that screen and with the absence of a ZIP writer. The download case passes only if three PDFs are saved. The ZIP sentence is a product issue either way. | Three `%PDF` files. Search the page for “ZIP”. Compare with `config/tools/registry.ts`. | Playwright | `three-page.pdf` | High |
| PDF-11 | pdf-splitter — corrupt and non-PDF | `corrupt.pdf`, then `notes.txt`. | Text never becomes a listed PDF. Corrupt input shows an error, not a successful split. | Alert; no valid extra pages. | Playwright | existing fixtures | High |
| PDF-12 | pdf-to-image — PNG and page selection | 2-page PDF, PNG, custom pages `1`. | One PNG. Magic `89504e47`. Width and height equal the PDF page size in points × (dpi/72), ±1 px. | `pdf-lib` `getSize()` and `sharp`. | Playwright | `two-page.pdf` | High |
| PDF-13 | pdf-to-image — DPI | Same page at 72, 150, and 300 DPI. | Pixel size scales by 72/72, 150/72, and 300/72. | `sharp` width against `page.getWidth() * dpi / 72`. | Playwright | `one-page.pdf` | High |
| PDF-14 | pdf-to-image — corrupt | `corrupt.pdf`. | Visible error. No JPEG download. | Absence of a decodable image. | Playwright | `corrupt.pdf` | Medium |
| PDF-15 | image-to-pdf — paper sizes | One PNG on A4 portrait, then US Letter, then Fit. | A4 about 595.28×841.89 pt. Letter 612×792 pt. Fit page size equals the embedded image’s point size. | `pdf-lib` `getSize()`, tolerance 1 pt. | Playwright | `red-800x600.png` | Critical |
| PDF-16 | image-to-pdf — orientation and n-up | Two images, landscape, 2 per page. Then four images, 4 per page. | Landscape swaps width and height. 2-up yields 1 page. 4-up of four images yields 1 page. | `pdf-lib` page count and `getSize()`. | Playwright | existing PNG and JPEG | High |
| PDF-17 | image-to-pdf — WebP and reorder | WebP then PNG. Move PNG first. Fit, 1 per page. | 2 pages. Page 1’s aspect matches the PNG, page 2 the WebP. | Page aspect versus source `sharp` aspect. | Playwright | `green-200x200.webp`, `red-800x600.png` | High |
| PDF-18 | image-to-pdf — margins | Same image, margin none vs large, A4. | Both are 1-page A4 PDFs. The drawn image box is smaller with the large margin (45 pt vs 0). | Render both pages and compare non-white bounds. | Playwright | `red-800x600.png` | Medium |
| PDF-19 | image-to-pdf — bad inputs | `.txt`, empty file, 51st image, file over 100 MB. | Type, empty, “maximum of 50 files”, and 100 MB errors. | Alert text. | Playwright | existing text/empty; generate the rest | High |
| PDF-20 | pdf tools — second open | Reopen every new PDF in `pdf-lib` after download. | `%PDF-`, expected page count, no throw. | `PDFDocument.load`. | Playwright | per case | Critical |

---

## AI document translator

Limits in code: 8 MB, 10 PDF pages, PDF/JPEG/PNG/WebP, at most three strategies. Live cases call `translateDocument` with the real provider. Rendered-page OCR and the page image decide whether English remains or Hindi is clipped. A white cover over a colored background fails TR-02.

Live cases use the real Gemini provider. A Jest mock is not a result for this section. Do not print the API key.

| ID | Tool / scenario | Input | Expected output | Independent check | Automation | Fixture | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TR-01 | document-translator — scanned PDF | Image-only 1-page English PDF, no text layer, target Hindi, through `translateDocument`. | Hindi covers the English. Rendered-page OCR finds no source English. Hindi is not clipped. `pdf-lib` text extraction is not used as proof. | Rasterize, OCR `hin+eng`, and inspect the page image. | Live Gemini | generated scanned PDF | Critical |
| TR-02 | document-translator — color behind text | PDF with a red band behind the English paragraph and a red square away from the text. Target Hindi. | Source English is gone. The red band behind the words remains visible around the glyphs. Painting that band white is a failure, not an accepted limitation. The distant red square stays red. | Rendered-page pixels and OCR. | Live Gemini | generated `colored-band.pdf` | Critical |
| TR-03 | document-translator — image input | English JPEG, target Hindi. | Download is an image, not a PDF. OCR reads Hindi. Source English in the paragraph is covered. | `sharp` format; OCR. | Playwright | new `notice.jpg` | Critical |
| TR-04 | document-translator — page cap | 11-page PDF. | Message that PDFs can have at most 10 pages. No download. | Response code `invalid_file` or the visible sentence. | Playwright | generate 11-page PDF | High |
| TR-05 | document-translator — empty | 0-byte `.pdf`. | “empty” message. No Gemini success. | Visible error. Confirm the request does not return a PDF. | Playwright | new empty `.pdf` | High |
| TR-06 | document-translator — encrypted | Password-protected PDF. | “This PDF is password-protected and cannot be translated.” | Visible sentence. | Playwright | new `encrypted.pdf` | Critical |
| TR-07 | document-translator — bad language | Target left at auto, or an unsupported code posted to the API. | “Choose a supported target language.” The UI should not offer auto as a target. | UI option list and, for the API, the JSON error. | Playwright | `two-page.pdf` | Medium |
| TR-08 | document-translator — missing key regression | Start the server without `GEMINI_API_KEY`. Upload a valid PDF and translate. | A visible failure that the provider is unavailable or not configured. The response body contains no key material. | Playwright assertion plus a redaction check on the response. | Playwright | existing PDF; key unset in that process only | High |
| TR-09 | document-translator — abort | Start a translation and leave the page before it finishes. | The in-flight request is aborted. The next visit does not show the previous file’s download. | Network log shows the request cancelled or the new page has no stale blob. | Playwright | existing PDF | Medium |
| TR-10 | document-translator — long translation | A narrow English paragraph whose Hindi is longer than the source line. | The full Hindi sentence is visible. Clipping at the box edge or a cut-off last word fails the visual check. | Rendered-page OCR must contain the closing words of the model translation. Inspect the page image for a cut glyph. | Live Gemini | generated dense paragraph | Critical |
| TR-11 | document-translator — second language | Same two-page notice, target Spanish. | Latin text in Spanish. The English source sentences are not still visible. | OCR `eng`. Look for a known translation of “public library”, and for the absence of the original English sentence. | Live script | existing live PDF generator | Medium |
| TR-12 | document-translator — page geometry | Any successful PDF translation of a known page size. | Output page count and point size match the source. | `pdf-lib` `getPageCount` and `getSize`. | Live script | existing 612×792 PDF | High |
| TR-13 | document-translator — heading, body, and mark | One page with a short heading, a separate body paragraph, and a blue square that is not text. Target Hindi. | Both text regions are Hindi. Rendered OCR shows no source English. The blue square is still blue. This is not a rerun of the two-line library notice. | Raster pixels for the square, plus `hin+eng` OCR. | Live Gemini | generated `heading-body.pdf` | Critical |

UI load, privacy copy, disabled Translate, `.txt` rejection, the 9 MB rejection, and the digital two-page Hindi run are already recorded.

---

## QR tools

Payloads are built in `QrCodeGeneratorWorkspace`. UPI is `upi://pay?pa=&pn=&cu=INR` and appends `&am=` only when the amount is greater than 0. WhatsApp is `https://wa.me/{digits}?text=`. WiFi is `WIFI:T:WPA;S:{ssid};P:{password};;` with `\ ; , : "` escaped. Phone is `tel:` plus digits and a leading `+`. The canvas export used by download is PNG. A centre logo is on by default for UPI, WhatsApp, and WiFi.

| ID | Tool / scenario | Input | Expected output | Independent check | Automation | Fixture | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| QR-01 | qr-code-generator — WhatsApp | Phone `+91 98765 43210`, message `Hello Docs`. Logo left on. | Decoded text is `https://wa.me/919876543210?text=Hello%20Docs`. | jsQR on the PNG. | Playwright | none | Critical |
| QR-02 | qr-code-generator — WiFi | SSID `Cafe:Net`, password `a;b`. | Decoded `WIFI:T:WPA;S:Cafe\:Net;P:a\;b;;`. | jsQR. | Playwright | none | Critical |
| QR-03 | qr-code-generator — phone | `+91-90000-11111`. | Decoded `tel:+919000011111`. | jsQR. | Playwright | none | High |
| QR-04 | qr-code-generator — empty URL | Clear the URL field. | Payload falls back to the site URL from `siteConfig.url`. Decode equals that URL. | jsQR compared with the config value. | Playwright | none | Medium |
| QR-05 | qr-code-generator — logo off | The known URL with the centre logo set to none, then with the default logo. | Both decode to the same URL. If the logo makes jsQR fail, record a failure. | jsQR on both PNGs. | Playwright | none | High |
| QR-06 | upi-qr-code-generator — no amount | VPA `qa@upi`, payee `QA Shop`, amount empty. | `upi://pay?pa=qa@upi&pn=QA%20Shop&cu=INR` and no `am=`. | jsQR. | Playwright | none | High |
| QR-07 | upi-qr-code-generator — custom logo | Upload `tiny-1x1.png` as the centre logo, same UPI payload as the recorded case. | Decode still contains `pa=qa@upi` and `am=99.00`, or the run records that the logo made it unscannable. | jsQR. | Playwright | `tiny-1x1.png` | High |
| QR-08 | both QR tools — PNG download | Download after QR-01 and QR-06. | File magic is PNG. There is no SVG file unless a separate SVG control exists. | Magic `89504e47` and jsQR. | Playwright | none | Medium |
| QR-09 | qr-code-generator — long payload | A 500-character URL. | Either a decodable QR of that exact string, or a visible generation error. A PNG that decodes to a different URL is a failure. | jsQR equality. | Playwright | none | Low |

---

## Calculators

Oracles are the formulas in the workspaces, not the formatted label alone. Money display uses en-IN grouping. Copy-summary text is part of the expected output for one case per calculator.

| ID | Tool / scenario | Input | Expected output | Independent check | Automation | Fixture | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CALC-01 | gst-calculator — remove GST | Inclusive mode, 1180, 18%. | Base 1000.00, GST 180.00, CGST 90.00, SGST 90.00, total 1180.00. | Hand division `1180 / 1.18`. | Playwright | none | Critical |
| CALC-02 | gst-calculator — 28% slab | Add GST, 1000, slab 28. | GST 280.00, total 1280.00, CGST and SGST 140.00 each. | `1000 * 0.28`. | Playwright | none | High |
| CALC-03 | gst-calculator — negative money and a high rate | Shopkeeper cost `-5`, profit `200`, rate 18. Then Add GST amount 1000 with rate 150. | Negative cost is rejected. The screen must not present a negative MRP as a result. Rate 150 may be clamped to 100, which is a valid ceiling, and then the total is 2000.00. | No minus sign on the MRP for the first input. `1000 × 2` for the second. | Playwright | none | Critical |
| CALC-04 | emi-calculator — 0% interest | 120000, 0%, 12 months. | EMI 10000.00, interest 0, total 120000. | `P / N`. | Playwright | none | Critical |
| CALC-05 | emi-calculator — zero tenure | 100000, 10%, tenure 0. | Tenure 0 is invalid. The screen says the tenure must be greater than 0 and does not present ₹0.00 as a successful EMI. | Visible validation. The highlight is not a completed repayment. | Playwright | none | High |
| CALC-06 | emi-calculator — months versus years | 100000, 10.5%, 60 months, compared with 5 years. | Both EMIs match within ₹0.01. | Same formula as the recorded 5-year case. | Playwright | none | High |
| CALC-07 | gratuity-calculator — boundary eligibility | 45000 at 5.0 years, then 4.9 years. | 5.0 is eligible. The highlight is ₹1,29,807.69, from `(15×45000×5)/26`. 4.9 shows ₹0.00 and “Not Eligible”. | Formula and the eligibility sentence. | Playwright | none | Critical |
| CALC-08 | gratuity-calculator — zero salary and tax flag | Salary 0, 10 years. Then salary 200000, 20 years. | Zero salary pays ₹0.00. The large case highlights ₹23,07,692.31, from `(15×200000×20)/26`, and is marked taxable above ₹20 lakh. | Formula and the tax sentence. | Playwright | none | High |
| CALC-09 | discount-calculator — 100% and zero | 2499 at 100%. Then price 0. | Pay 0.00 and save 2499.00. Zero price shows 0, not `NaN`. | Arithmetic. | Playwright | none | High |
| CALC-10 | discount-calculator — fixed amount | Fixed ₹500 off 2499. Then fixed ₹9999 off 2499. | Pay 1999.00. The oversized discount is clamped to the price, so pay 0.00 and the effective rate is 100%. | `min(price, max(0, discount))`. | Playwright | none | Critical |
| CALC-11 | sip-calculator — lumpsum | Lumpsum 100000, 6%, 10 years. | Maturity rounds to 1,79,085. Invested 1,00,000. | `round(100000 × 1.06^10)`. | Playwright | none | Critical |
| CALC-12 | sip-calculator — 0% and 0 years | SIP 10000, 0%, 10 years. Then 10000, 6%, 0 years. | 0% return is valid: maturity equals invested 12,00,000. Zero years is invalid and must not be shown as a successful maturity of ₹0. | `10000 × 120` for the first run. A validation message for the second. | Playwright | none | High |
| CALC-13 | fd-calculator — annual | 100000, 7.5%, 3 years, annually. | Maturity rounds to 1,24,230. Interest rounds to 24,230. | `Math.round(100000 × 1.075^3)` and `Math.round(maturity − principal)`. | Playwright | none | Critical |
| CALC-14 | fd-calculator — monthly, half-yearly, zero years | 100000 at 7.5% for 3 years, monthly and half-yearly. Then tenure 0. | Monthly maturity rounds to 1,25,145. Half-yearly rounds to 1,24,718. Tenure 0 is invalid and must not be presented as a successful maturity equal to the principal. | `Math.round` of `P(1+r/n)^(n t)`. Validation text for tenure 0. | Playwright | none | High |
| CALC-15 | all calculators — copy summary | Press copy on CALC-01, CALC-04, CALC-10, CALC-11, and CALC-13. | Clipboard text contains the same rupee figure as the highlight, including the en-IN commas where the summary uses them. | Read clipboard in Playwright. | Playwright | none | Medium |
| CALC-16 | all calculators — non-numeric | Type `abc` into the principal field of each calculator. | Display treats it as 0. No crash, no `NaN`. | Page text and console. | Playwright | none | Medium |

---

## Text utilities

Word count is `trim().split(/\s+/)`. Characters use the raw string. Sentences match `[^.!?]+`. Paragraphs split on a blank line. Reading time is `ceil(words / 200)` minutes. Case transforms push history only when the text changes. Duplicate removal is case-sensitive and keeps the first line, including one blank line because `Set` sees `""` once.

| ID | Tool / scenario | Input | Expected output | Independent check | Automation | Fixture | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TXT-01 | word-counter — full stats | `Alpha beta gamma.\n\nDelta delta.` | Words 5. Characters equal the raw length. Characters without spaces equal the length after removing whitespace. Sentences 2. Paragraphs 2. Reading time 1. | Recompute in the test from the same rules. | Playwright | existing `known-words.txt` or paste | High |
| TXT-02 | word-counter — extra whitespace | `Alpha   beta\n\n\ngamma.` | Words 3. Paragraphs 2. | Same split rules. | Playwright | none | Medium |
| TXT-03 | case-converter — sentence, camel, kebab | `hello WORLD. next line` then Sentence case. Separate input `Hello world_test` → camelCase and kebab-case. | Sentence: `Hello world. Next line`. camel: `helloWorldTest`. kebab: `hello-world-test`. | Exact textarea value. | Playwright | none | High |
| TXT-04 | case-converter — revert and clear | UPPERCASE, then Revert. Then Clear, then Revert. | Revert restores `hello WORLD` after UPPER. Clear then Revert restores the cleared text. | Exact string. | Playwright | none | Medium |
| TXT-05 | case-converter — empty | Clear, then press each transform. | Stays empty. Revert stays disabled when history is empty. No console error. | Textarea value and disabled state. | Playwright | none | Low |
| TXT-06 | remove-duplicates — sort | `c\na\nb`. Sort A–Z. | `a\nb\nc`. | `localeCompare` order. | Playwright | none | High |
| TXT-07 | remove-duplicates — blanks and case | `a\n\na\nA`. Remove duplicates. | `a`, one blank line, then `A`. `A` is kept. | Exact textarea. | Playwright | `duplicates.txt` if it matches; otherwise paste | High |
| TXT-08 | remove-duplicates — revert | Remove duplicates, then Revert. | Original line list returns. | Exact string. | Playwright | none | Medium |
| TXT-09 | text tools — large paste | 100 000 words of `word `. | Word count 100000. The page stays responsive enough to show the number within 5 seconds. | Timed assertion on the word stat. | Playwright | generate in the test | Medium |

UPPER, Title, lower, the 5-word count, empty word count, and the basic duplicate line are already recorded.

---

## Developer utilities

JSON indent modes are 2 spaces, 4 spaces, and tab. Base64 text uses UTF-8 through `encodeURIComponent`. File base64 is a separate path in `DevToolsWorkspace` with the tool’s 10 MB limit. UUID batches are 1, 5, 10, and 20. JWT decode does not check the signature: any base64url header and payload with a third part, or even two parts, will display if they are JSON.

| ID | Tool / scenario | Input | Expected output | Independent check | Automation | Fixture | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DEV-01 | json-formatter — indent | `{"a":1,"b":{"c":2}}` at 4 spaces, then tab. | Output equals `JSON.stringify(obj, null, 4)` and `JSON.stringify(obj, null, '\t')`. | `JSON.parse` and exact string compare. | Playwright | `valid.json` | High |
| DEV-02 | json-formatter — file and download | Upload `valid.json`. Beautify. Download. | Download parses. Upload of `invalid.json` shows an error and does not replace the buffer with a fake valid document. | `JSON.parse` on the download. Trailing-comma file stays invalid. | Playwright | `valid.json`, `invalid.json` | High |
| DEV-03 | json-formatter — trailing comma | `{ "a": 1, }` | Error that names invalid JSON. Beautify does not emit `{"a":1}`. | Output is unchanged or an error string, and `JSON.parse` of a “success” result would throw. | Playwright | none | High |
| DEV-04 | base64-converter — file round trip | Upload `red-800x600.png`. Encode. Decode the result back to a file if the UI offers that, otherwise decode the text. | Decoded bytes equal the source bytes. A data-URL prefix, if the UI adds one, is stripped before decode. | Byte compare, or PNG magic after decode. | Playwright | `red-800x600.png` | Critical |
| DEV-05 | base64-converter — unicode and garbage | Encode `हिन्दी`. Decode `@@@@`. | Unicode round-trips. Garbage shows an error, not an empty success. | Exact string; visible error. | Playwright | none | High |
| DEV-06 | base64-converter — 10 MB | A file of 10 MB + 1 byte. | “exceeds the 10MB limit” (or the shared 10 MB validation message). No encoded output. | Alert text. | Playwright | generate | Medium |
| DEV-07 | uuid — batch sizes | Generate 1, then 10, then 20. | Line counts are 1, 10, and 20. Every line matches `UUID_V4_PATTERN`. Lines inside one batch are unique. | Regex and `Set` size. | Playwright | none | High |
| DEV-08 | uuid — regenerate | Generate 5, copy the text, generate again. | The second block differs in at least one line. Both blocks still match v4. | String inequality plus regex. | Playwright | none | Medium |
| DEV-09 | url-encoder — broken escape | Decode `%E0%A4`. Also decode `%`. | “Invalid percent-encoded URL string.” The encoder output is not replaced by a partial string. | Visible error. Compare with `decodeURIComponent` throwing. | Playwright | none | High |
| DEV-10 | url-encoder — reserved characters | Encode `a+b&c=d`. | `a%2Bb%26c%3Dd`. Decode returns the original. | Node `encodeURIComponent`. | Playwright | none | Medium |
| DEV-11 | jwt-decoder — empty and two parts | Empty string. Then a header and payload with no signature part. | Empty shows no claims. A two-part token is malformed and is rejected with the structure error. Showing the payload is a failure. | The error text. Claims are absent. | Playwright | token built in the test | Critical |
| DEV-12 | jwt-decoder — signature is not verified | A three-part token whose signature is `aaaa`. | Claims still render, because this tool decodes and does not verify. The screen must not say the signature is valid, verified, or trusted. | Claims visible. Page text has no verification claim. No request carries the token. | Playwright | token built in the test | Critical |
| DEV-13 | jwt-decoder — bad JSON part | Header that is base64url of `not-json`, plus a payload and signature. | “Failed to decode JWT base64 JSON token string.” | Visible error. | Playwright | token built in the test | Medium |
| DEV-14 | developer tools — no network | Encode, generate a UUID, and decode a JWT with the network log open. | No request carries the token, the JSON, or the Base64 payload. | Playwright request listener. | Playwright | none | Critical |

The recorded JSON beautify/minify, Base64 ASCII round trip, five v4 UUIDs, one URL round trip, the known JWT, and `not-a-jwt` stay as they are.

---

## Shared UI and infrastructure

File acceptance lives in `validateFiles`: max count, max bytes, empty file, duplicate name+size+lastModified, and MIME or extension. ToolShell tools pass a real `onProcess`. If that handler were missing, the shell would simulate a 30% size drop; a test must fail if a download is about 70% of the input for a reason other than real compression.

| ID | Tool / scenario | Input | Expected output | Independent check | Automation | Fixture | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SHR-01 | FileDropzone — native drag and drop | Drag `red-800x600.png` onto the compressor dropzone. | The file is listed by name and size. | File row text. This is the gap left by `input[type=file]` uploads. | Playwright | existing PNG | High |
| SHR-02 | File list — remove, duplicate, reorder | Add two PDFs on the merger, move the second up, remove it, add the same file again. | Order follows the move. Remove clears that row. Adding the identical file while it is still listed shows “already been added.” After removal it can be added again. | Row order, then `pdf-lib` page order after merge. | Playwright | `one-page.pdf`, `two-page.pdf` | High |
| SHR-03 | File list — process again | Compress once, reset, compress a different image. | The second download is the second image. The first object URL is not reused as the second file. | `sharp` dimensions differ in the expected direction. | Playwright | PNG then JPEG | High |
| SHR-04 | ToolShell — real processor | On merger, splitter, converter, and both target-KB tools, process a valid file. | Output magic matches the tool. It is not a copy of the input with only the size label changed, except when the operation can legitimately keep bytes. | Magic, page count, or dimensions. | Playwright | existing fixtures | Critical |
| SHR-05 | Errors stay visible | Force a corrupt PDF on the splitter and a thrown image load on the cropper. | An alert or inline error remains until the next successful run or dismiss. The button does not stay on “processing”. | Visible error and an enabled action. | Playwright | `corrupt.pdf`, bad JPEG | High |
| SHR-06 | Download behaviour | For one image tool, one PDF tool, and the translator, click download. | The browser download finishes, the filename extension matches the MIME, and the saved bytes pass the independent check for that tool. | Playwright download path plus `sharp` or `pdf-lib`. | Playwright | per tool | Critical |
| SHR-07 | Keyboard beyond the dropzone | On a calculator and on the JSON formatter, tab from the top of the page through the primary controls. | Each control shows the focus ring. Enter activates the focused button. Labels are tied to inputs (`getByLabel`). | `outline-width` or `:focus-visible`, and accessible name. | Playwright | none | High |
| SHR-08 | Accessibility spot check | Run axe on `/`, `/tools`, `/image-compressor`, `/gst-calculator`, and `/document-translator`. | No critical or serious violations in the tool workspace. Record moderate items instead of ignoring them. | `@axe-core/playwright` or the existing accessibility Jest suite where it mounts real controls. | Playwright | none | High |
| SHR-09 | Mobile layout | 375×812 on one tool from each section: compressor, merger, translator, QR, GST, word counter, JWT. | No horizontal overflow beyond 8 px. Primary action is on screen after scroll. Dropzone text does not cover the button. | `scrollWidth - clientWidth`. Screenshot only as evidence beside the measurement. | Playwright | none | High |
| SHR-10 | Tablet and desktop | 768×1024 on the splitter options, 1280×800 on the passport sheet. | Options remain usable. Sheet preview is visible without a clipped download button. | Bounding boxes of the primary button inside the viewport after scroll. | Playwright | portrait for the sheet | Medium |
| SHR-11 | Theme | Toggle theme on a tool page, navigate to another tool, reload. | `data-theme` stays on the chosen value. Contrast of body text remains readable in both themes. | Attribute assertion. Optional axe pass in both themes. | Playwright | none | Medium |
| SHR-12 | Confirmed routes only | Redirects from `next.config.mjs`: `/tools/image-compressor`, `/pdf-compressor`. Rewrites: `/image/image-compressor`, `/pdf/pdf-merger`, `/qr/qr-code-generator`, `/text/word-counter`, `/calculators/gst-calculator`, `/developer/json-formatter`, `/converters/image-converter`. Page aliases from `getToolBySlug`: `/compress`, `/merge`, `/upi`, `/gst`, `/base64`. | Each confirmed route shows that tool’s H1. `/utilities/image-compressor` is not required: no tool uses category `utilities`. | Final URL and H1. | Playwright | none | High |
| SHR-13 | Directory and unknown slug | `/tools` lists the 30 names. `/not-a-tool` is a 404. Search `uuid` shows the UUID tool and hides GST. | Exact slug set from `getAllTools()`. | DOM list compared with the registry. | Playwright | none | Medium |
| SHR-14 | Analytics absent | Load a tool with no `NEXT_PUBLIC_GA_MEASUREMENT_ID`. | The tool still processes. Console may mention gtag; it must not block the primary action. | A compressor or calculator completes. | Playwright | existing image | Low |
| SHR-15 | Object URLs | Compress, preview, reset, and repeat 10 times. | `URL.revokeObjectURL` runs for previews that were replaced. Heap or blob-URL count does not grow without bound across the 10 cycles. | Performance timeline or a test hook counting create versus revoke. Jest’s mock of `revokeObjectURL` does not satisfy this. | Playwright or a browser unit test | small JPEG | High |
| SHR-16 | Memory and time — images | Batch 20 copies of the noisy JPEG on the compressor. | Completes or shows a clear per-file error. The tab stays alive. Wall time is recorded, not given a fake budget. | 20 readable outputs or a visible error; no renderer crash. | Playwright | 20 copies of noisy JPEG | High |
| SHR-17 | Memory and time — PDFs | Merge 10 copies of `three-page.pdf`. Convert that result to images at 150 DPI. | Page count 30. Image count 30. Record duration. A crash or a multi-minute hang is a failure. | `pdf-lib` and file count. | Playwright | existing 3-page PDF, duplicated | High |
| SHR-18 | `POST /api/image/compress` | PNG, WebP, a `.txt`, and a file over the route’s limit. | PNG and WebP return an image Sharp can read. Text and oversize return 4xx and no image body. | Magic and status codes. | Playwright API | existing fixtures; generate oversize | Medium |
| SHR-19 | `POST /api/translate-document` | Valid PDF with key; valid PDF without key; 11-page PDF; encrypted PDF. | With key, NDJSON ends in `done` and a PDF. Without key, an error event and no secret. The other two match TR-04 and TR-06. | Parse NDJSON. Redact before logging. | Playwright API | per case | Critical |
| SHR-20 | Console and failed requests | Open each section’s representative tool, run its recorded happy path, and collect console errors and HTTP 4xx/5xx except filtered gtag. | No unexpected console error and no failed request caused by the tool. | Playwright console and request listeners. | Playwright | existing happy-path fixtures | Medium |
| SHR-21 | Copy mismatch | Footer label “Photo Compressor (Under 50KB)” points at `/image-compressor`. | The link works. The label does not match the 50 KB tool. This is copy, tracked so it is not rediscovered as a dead link. | Click reaches the compressor H1. | Playwright | none | Low |

Homepage, the 30 route smoke tests, dropzone keyboard, unsupported and empty files, theme toggle, and the single compress API happy path are already recorded.

---

## Fixture work that is still missing

| Fixture | Used by |
| --- | --- |
| PNG larger than 100 KB, JPEG already under 50 KB | IMG-02, IMG-17, IMG-18 |
| `sample.avif`, `anim.gif`, `icon.svg` | IMG-05, IMG-10, IMG-15 |
| Portrait with a unique left edge | IMG-20 |
| `encrypted.pdf`, `bookmarked.pdf` | PDF-04, PDF-05, TR-06 |
| `scanned-english.pdf`, `colored-band.pdf`, `notice.jpg`, dense paragraph PDF, 11-page PDF | TR-01, TR-02, TR-03, TR-04, TR-10 |
| 50 MB + 1 byte image, 100 MB + 1 byte PDF, 21 and 26 tiny images | IMG-04, IMG-16, PDF-03 |

Happy-path files are produced by `tests/e2e/fixtures/generate.mjs` into `.local/testing/fixtures/`. Reuse those. The generator stays in the repository; the generated bytes do not.

## Suggested run order

1. Shared limits, keyboard, and mobile (SHR-01 through SHR-12).
2. Critical image, PDF, calculator, QR, and developer cases.
3. Translator validation cases that do not call Gemini (TR-04 through TR-08).
4. Live Gemini cases (TR-01, TR-02, TR-03, TR-10, TR-11, TR-13) only with a gitignored key.
5. Performance cases SHR-16 and SHR-17 last.

## Counts

| Section | Proposed cases |
| --- | --- |
| Image tools | 26 |
| PDF tools | 20 |
| AI document translator | 13 |
| QR tools | 9 |
| Calculators | 16 |
| Text utilities | 9 |
| Developer utilities | 14 |
| Shared UI and infrastructure | 21 |
| **Total proposed** | **128** |

These 128 cases are not results. The recorded programme remains the only source of passes.
