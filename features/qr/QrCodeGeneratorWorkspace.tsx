'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Copy,
  Check,
  Link as LinkIcon,
  CreditCard,
  MessageSquare,
  Wifi,
  Phone,
  Sparkles,
  Printer,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Button } from '@/components/common/Button/Button';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { generateDownloadFilename } from '@/lib/file/fileUtils';
import { siteConfig } from '@/config/site';
import styles from './QrCodeGenerator.module.scss';

export interface QrCodeGeneratorWorkspaceProps {
  tool: ToolMetadata;
}

type QrType = 'url' | 'upi' | 'whatsapp' | 'wifi' | 'phone';

type PresetLogoId = 'none' | 'rupee' | 'whatsapp' | 'shop' | 'wifi' | 'custom';

// Preset high-contrast center logo SVGs as data URIs
const PRESET_LOGOS: Record<string, { label: string; iconUri: string }> = {
  rupee: {
    label: '₹ Rupee / UPI',
    iconUri:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230f172a"/><text x="50" y="67" font-size="52" font-weight="900" fill="%23ffffff" text-anchor="middle" font-family="sans-serif">₹</text></svg>',
  },
  whatsapp: {
    label: 'WhatsApp',
    iconUri:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2325D366"/><path fill="%23ffffff" d="M50 20C33.4 20 20 33.4 20 50c0 5.3 1.4 10.4 4 14.8L20 80l15.6-4.1C40 78.4 44.9 80 50 80c16.6 0 30-13.4 30-30S66.6 20 50 20zm14.7 42.1c-.6 1.8-3.6 3.4-5 3.6-1.3.2-3 .3-8.8-2.1-7.4-3.1-12.2-10.7-12.6-11.2-.4-.5-3.1-4.1-3.1-7.9s2-5.6 2.7-6.4c.7-.8 1.6-1 2.1-1 .5 0 1.1 0 1.6 0 .5 0 1.2-.2 1.9 1.5.7 1.7 2.4 5.9 2.6 6.3.2.4.4.9.1 1.5-.3.6-.5.9-.9 1.4-.4.5-.9 1-1.3 1.4-.4.4-.8.9-.4 1.7.5.8 2.1 3.5 4.5 5.7 3.1 2.8 5.7 3.6 6.6 4 .8.4 1.3.4 1.8-.2.5-.6 2.1-2.5 2.7-3.4.6-.9 1.2-.7 2-.4.8.3 5.3 2.5 6.2 3 .9.4 1.5.7 1.7 1.1.2.4.2 2.3-.4 4.1z"/></svg>',
  },
  shop: {
    label: 'Store / Shop',
    iconUri:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234f46e5"/><path fill="%23ffffff" d="M26 38l4-14h40l4 14v6H26v-6zm0 10h48v26a4 4 0 01-4 4H30a4 4 0 01-4-4V48zm12 6v14h24V54H38z"/></svg>',
  },
  wifi: {
    label: 'WiFi',
    iconUri:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230ea5e9"/><path fill="%23ffffff" d="M50 68a6 6 0 100-12 6 6 0 000 12zm-18-16c4.8-4.8 11.4-7.8 18-7.8s13.2 3 18 7.8l4.2-4.2C65.8 41.4 58.2 38 50 38s-15.8 3.4-22.2 9.8L32 52zm-9.8-9.8C30 34.4 39.6 30 50 30s20 4.4 27.8 12.2l4.2-4.2C73 29 61.8 24 50 24S27 29 18 38l4.2 4.2z"/></svg>',
  },
};

export const QrCodeGeneratorWorkspace: React.FC<QrCodeGeneratorWorkspaceProps> = ({ tool }) => {
  const [qrType, setQrType] = useState<QrType>('url');

  // Fields for URL / Text
  const [textContent, setTextContent] = useState<string>(siteConfig.url);

  // Fields for UPI Payment
  const [upiId, setUpiId] = useState<string>('shopname@upi');
  const [payeeName, setPayeeName] = useState<string>('My Shop Counter');
  const [upiAmount, setUpiAmount] = useState<string>('');

  // Fields for WhatsApp
  const [waPhone, setWaPhone] = useState<string>('919876543210');
  const [waMessage, setWaMessage] = useState<string>(
    'Hello! I would like to inquire about your services.'
  );

  // Fields for WiFi
  const [wifiSsid, setWifiSsid] = useState<string>('Shop_Customer_WiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('Welcome123');

  // Fields for Phone
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98765 43210');

  // Color & Size Customization
  const [darkColor, setDarkColor] = useState<string>('#0f172a');
  const [lightColor, setLightColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(500);

  // Center Image / Logo Option
  const [selectedPresetLogo, setSelectedPresetLogo] = useState<PresetLogoId>('none');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(22); // percent of QR width (15% to 26%)

  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically pick suitable default center logo based on type tab
  useEffect(() => {
    if (selectedPresetLogo === 'custom' && customLogoUrl) return;

    if (qrType === 'upi') {
      setSelectedPresetLogo('rupee');
    } else if (qrType === 'whatsapp') {
      setSelectedPresetLogo('whatsapp');
    } else if (qrType === 'wifi') {
      setSelectedPresetLogo('wifi');
    }
  }, [qrType, selectedPresetLogo, customLogoUrl]);

  // Compute actual payload string based on active tab
  const getComputedPayload = useCallback((): string => {
    switch (qrType) {
      case 'upi': {
        const cleanVpa = upiId.trim();
        const cleanName = encodeURIComponent(payeeName.trim() || 'Merchant');
        let upiUri = `upi://pay?pa=${cleanVpa}&pn=${cleanName}&cu=INR`;
        if (upiAmount && parseFloat(upiAmount) > 0) {
          upiUri += `&am=${parseFloat(upiAmount).toFixed(2)}`;
        }
        return upiUri;
      }
      case 'whatsapp': {
        const cleanPhone = waPhone.replace(/[^\d]/g, '');
        const cleanMsg = encodeURIComponent(waMessage.trim());
        return `https://wa.me/${cleanPhone}${cleanMsg ? `?text=${cleanMsg}` : ''}`;
      }
      case 'wifi': {
        return `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`;
      }
      case 'phone': {
        return `tel:${phoneNumber.replace(/[^\d+]/g, '')}`;
      }
      case 'url':
      default:
        return textContent || siteConfig.url;
    }
  }, [
    qrType,
    textContent,
    upiId,
    payeeName,
    upiAmount,
    waPhone,
    waMessage,
    wifiSsid,
    wifiPassword,
    phoneNumber,
  ]);

  // Get active logo data URL
  const getActiveLogoUri = useCallback((): string | null => {
    if (selectedPresetLogo === 'custom' && customLogoUrl) {
      return customLogoUrl;
    }
    if (selectedPresetLogo !== 'none' && PRESET_LOGOS[selectedPresetLogo]) {
      return PRESET_LOGOS[selectedPresetLogo].iconUri;
    }
    return null;
  }, [selectedPresetLogo, customLogoUrl]);

  // Generate QR Canvas with Center Logo whenever inputs change
  useEffect(() => {
    const payload = getComputedPayload();
    if (!payload || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const activeLogo = getActiveLogoUri();

    QRCode.toCanvas(
      canvas,
      payload,
      {
        width: size,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'H', // High error correction (allows center logo)
      },
      (err) => {
        if (err || !canvas) return;

        if (!activeLogo) {
          setDataUrl(canvas.toDataURL('image/png'));
          return;
        }

        // Draw center logo over the QR code
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = activeLogo;
        img.onload = () => {
          const logoPixelSize = Math.floor(canvas.width * (logoScale / 100));
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const x = cx - logoPixelSize / 2;
          const y = cy - logoPixelSize / 2;
          const padding = Math.max(4, Math.floor(logoPixelSize * 0.14));

          // Draw white shield badge background for contrast
          ctx.save();
          ctx.fillStyle = lightColor || '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, cy, logoPixelSize / 2 + padding, 0, Math.PI * 2);
          ctx.fill();

          // Clip image to clean circle
          ctx.beginPath();
          ctx.arc(cx, cy, logoPixelSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x, y, logoPixelSize, logoPixelSize);
          ctx.restore();

          setDataUrl(canvas.toDataURL('image/png'));
        };
      }
    );
  }, [getComputedPayload, darkColor, lightColor, size, getActiveLogoUri, logoScale]);

  // Handle custom logo image file upload
  const handleCustomLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomLogoUrl(reader.result as string);
      setSelectedPresetLogo('custom');
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = generateDownloadFilename(`qrcode-${qrType}`, 'qr', 'png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (!dataUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${siteConfig.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; margin: 0; }
            .card { border: 2px dashed #000; padding: 28px; border-radius: 16px; text-align: center; max-width: 380px; }
            h2 { margin-top: 0; margin-bottom: 8px; font-size: 22px; }
            p { margin: 4px 0 18px 0; color: #444; font-size: 14px; }
            img { width: 280px; height: 280px; object-fit: contain; }
            .footer { margin-top: 14px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>${qrType === 'upi' ? payeeName || 'Scan & Pay via UPI' : qrType === 'wifi' ? `WiFi: ${wifiSsid}` : 'Scan QR Code'}</h2>
            <p>${qrType === 'upi' ? `UPI ID: ${upiId}` : 'Scan with your camera or payment app'}</p>
            <img src="${dataUrl}" alt="QR Code" />
            <div class="footer">${siteConfig.name} • Fast & Free QR</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2000);
        } else {
          handleCopyPayload();
        }
      }, 'image/png');
    } catch {
      handleCopyPayload();
    }
  };

  const handleCopyPayload = async () => {
    const payload = getComputedPayload();
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={styles.qrWrapper}>
      <ToolHeader tool={tool} />

      <div className={styles.grid}>
        {/* Left: Input Form and Tabs */}
        <div className={styles.formCol}>
          <Card variant="glass" padding="lg" className={styles.card}>
            {/* Category Type Pills */}
            <div className={styles.typeNav}>
              <button
                type="button"
                className={`${styles.typeBtn} ${qrType === 'url' ? styles.typeBtnActive : ''}`}
                onClick={() => setQrType('url')}
              >
                <LinkIcon size={16} />
                <span>Link / Text</span>
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${qrType === 'upi' ? styles.typeBtnActive : ''}`}
                onClick={() => setQrType('upi')}
              >
                <CreditCard size={16} />
                <span>UPI Payment</span>
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${qrType === 'whatsapp' ? styles.typeBtnActive : ''}`}
                onClick={() => setQrType('whatsapp')}
              >
                <MessageSquare size={16} />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${qrType === 'wifi' ? styles.typeBtnActive : ''}`}
                onClick={() => setQrType('wifi')}
              >
                <Wifi size={16} />
                <span>Shop WiFi</span>
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${qrType === 'phone' ? styles.typeBtnActive : ''}`}
                onClick={() => setQrType('phone')}
              >
                <Phone size={16} />
                <span>Phone Call</span>
              </button>
            </div>

            {/* Dynamic Form Content */}
            <div className={styles.inputsSection}>
              {qrType === 'url' && (
                <div className={styles.fieldGroup}>
                  <label htmlFor="url-content" className={styles.label}>
                    Website URL or Any Text
                  </label>
                  <textarea
                    id="url-content"
                    className={styles.textarea}
                    rows={3}
                    placeholder="Enter website link (e.g. https://yourshop.com) or text..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>
              )}

              {qrType === 'upi' && (
                <div className={styles.fieldStack}>
                  <Input
                    label="Your Shop UPI ID (VPA) *"
                    placeholder="e.g. yourshop@okhdfcbank or 9876543210@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    helperText="Customers can scan with Google Pay, PhonePe, Paytm, or BHIM"
                  />
                  <Input
                    label="Shop / Payee Name *"
                    placeholder="e.g. Sharma Cyber Cafe & Xerox"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                  />
                  <Input
                    label="Fixed Amount in ₹ (Optional)"
                    type="number"
                    placeholder="Leave empty for customer to enter amount"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                  />
                </div>
              )}

              {qrType === 'whatsapp' && (
                <div className={styles.fieldStack}>
                  <Input
                    label="WhatsApp Mobile Number (With country code) *"
                    placeholder="e.g. 919876543210"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    helperText="Do not include + or spaces (e.g. 919876543210 for India)"
                  />
                  <div className={styles.fieldGroup}>
                    <label htmlFor="wa-message" className={styles.label}>
                      Pre-filled Message (Optional)
                    </label>
                    <textarea
                      id="wa-message"
                      className={styles.textarea}
                      rows={2}
                      placeholder="e.g. Hi, I need printing/xerox service..."
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {qrType === 'wifi' && (
                <div className={styles.fieldStack}>
                  <Input
                    label="WiFi Network Name (SSID) *"
                    placeholder="e.g. Shop_Guest_WiFi"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                  />
                  <Input
                    label="WiFi Password *"
                    type="text"
                    placeholder="Enter WiFi password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    helperText="Customers can connect instantly by scanning"
                  />
                </div>
              )}

              {qrType === 'phone' && (
                <div className={styles.fieldStack}>
                  <Input
                    label="Phone Number to Call *"
                    placeholder="e.g. +91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Center Logo Option Section */}
            <div className={styles.logoSection}>
              <div className={styles.sectionTitleRow}>
                <ImageIcon size={15} className={styles.sectionIcon} />
                <h4 className={styles.styleTitle}>Center Logo / Image in QR</h4>
              </div>

              <div className={styles.logoPillsRow}>
                <button
                  type="button"
                  className={`${styles.logoPill} ${selectedPresetLogo === 'none' ? styles.logoPillActive : ''}`}
                  onClick={() => setSelectedPresetLogo('none')}
                >
                  None
                </button>

                {Object.entries(PRESET_LOGOS).map(([key, data]) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.logoPill} ${selectedPresetLogo === key ? styles.logoPillActive : ''}`}
                    onClick={() => setSelectedPresetLogo(key as PresetLogoId)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.iconUri} alt={data.label} className={styles.logoPillIcon} />
                    <span>{data.label}</span>
                  </button>
                ))}

                <button
                  type="button"
                  className={`${styles.logoPill} ${selectedPresetLogo === 'custom' ? styles.logoPillActive : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} />
                  <span>{customLogoUrl ? 'Change Custom Logo' : 'Upload Custom Image'}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={handleCustomLogoSelected}
                />
              </div>

              {selectedPresetLogo === 'custom' && customLogoUrl && (
                <div className={styles.customLogoPreviewRow}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={customLogoUrl} alt="Custom Logo" className={styles.customPreviewImg} />
                  <span className={styles.customLogoName}>Custom Shop Image Active</span>
                  <button
                    type="button"
                    className={styles.removeLogoBtn}
                    onClick={() => {
                      setCustomLogoUrl(null);
                      setSelectedPresetLogo('none');
                    }}
                    title="Remove custom logo"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {selectedPresetLogo !== 'none' && (
                <div className={styles.logoScaleRow}>
                  <div className={styles.sliderHeader}>
                    <label className={styles.subLabel}>Center Logo Size</label>
                    <span className={styles.valueBadge}>{logoScale}%</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={26}
                    step={1}
                    value={logoScale}
                    onChange={(e) => setLogoScale(parseInt(e.target.value, 10))}
                    className={styles.rangeInput}
                  />
                </div>
              )}
            </div>

            {/* Visual Styling Accordion */}
            <div className={styles.styleOptions}>
              <h4 className={styles.styleTitle}>Color & Size Customization</h4>
              <div className={styles.colorRow}>
                <div className={styles.colorItem}>
                  <label className={styles.subLabel}>QR Pattern Color</label>
                  <div className={styles.pickerBox}>
                    <input
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className={styles.colorInput}
                    />
                    <span className={styles.colorHex}>{darkColor}</span>
                  </div>
                </div>

                <div className={styles.colorItem}>
                  <label className={styles.subLabel}>Background Color</label>
                  <div className={styles.pickerBox}>
                    <input
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className={styles.colorInput}
                    />
                    <span className={styles.colorHex}>{lightColor}</span>
                  </div>
                </div>

                <div className={styles.colorItem}>
                  <label className={styles.subLabel}>Resolution Size</label>
                  <select
                    className={styles.select}
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value, 10))}
                  >
                    <option value={350}>Standard (350px)</option>
                    <option value={500}>High Quality (500px)</option>
                    <option value={800}>Print Ready (800px)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Live Preview & Action Downloads */}
        <div className={styles.previewCol}>
          <Card variant="glass" padding="lg" className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Live QR Preview</h3>
              <span className={styles.liveBadge}>
                <Sparkles size={13} />
                Square Preview
              </span>
            </div>

            {/* Perfect Square QR Canvas Container */}
            <div className={styles.canvasContainer} style={{ background: lightColor }}>
              <canvas ref={canvasRef} className={styles.qrCanvas} />
            </div>

            <p className={styles.captionText}>
              {qrType === 'upi'
                ? `UPI Payee: ${payeeName || 'Merchant'} (${upiId || 'No UPI ID'})`
                : qrType === 'wifi'
                  ? `Network: ${wifiSsid}`
                  : 'Ready for instant scanning and printing'}
            </p>

            <div className={styles.actionBtnStack}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Download size={18} />}
                onClick={handleDownloadPng}
              >
                Download PNG Image
              </Button>

              <div className={styles.secondaryActions}>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  leftIcon={<Printer size={16} />}
                  onClick={handlePrint}
                >
                  Print Standee
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  leftIcon={copiedImage || copied ? <Check size={16} /> : <Copy size={16} />}
                  onClick={handleCopyImage}
                  title="Copy QR Code image to clipboard (paste into Word, Photoshop, WhatsApp)"
                >
                  {copiedImage || copied ? 'Copied Image!' : 'Copy Image'}
                </Button>
              </div>
            </div>

            <div className={styles.freeBadge}>
              <span>✨ 100% Free • No Sign-up • No Watermark</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
