export const CATEGORY_HI: Record<
  string,
  { label: string; description: string; audience: string }
> = {
  image: {
    label: 'इमेज टूल',
    description: 'फोटो को ब्राउज़र में छोटा करें, साइज़ बदलें, काटें और फॉर्मैट बदलें।',
    audience:
      'परीक्षा या सरकारी फॉर्म भरने वाले, छात्र, साइबर कैफ़े, और जिन्हें फोटो छोटा या काटना हो।',
  },
  pdf: {
    label: 'PDF टूल',
    description: 'PDF जोड़ें, पन्ने अलग करें, और बिना अपलोड किए इमेज बनाएं।',
    audience: 'जो आधार, मार्कशीट या कई पन्नों के दस्तावेज़ एक PDF में जोड़ना चाहते हैं।',
  },
  qr: {
    label: 'QR कोड',
    description: 'दुकान का UPI QR, WhatsApp, WiFi और लिंक का QR बनाएं।',
    audience: 'दुकानदार, कैफ़े, और जिन्हें UPI, WhatsApp, WiFi या लिंक का QR चाहिए।',
  },
  text: {
    label: 'टेक्स्ट टूल',
    description: 'शब्द गिनें, केस बदलें, और दोहरी लाइनें हटाएं।',
    audience: 'जिन्हें शब्द गिनने, केस बदलने या लिस्ट साफ करने की ज़रूरत हो।',
  },
  converters: {
    label: 'कनवर्टर',
    description: 'इमेज और दस्तावेज़ का फॉर्मैट ब्राउज़र में बदलें।',
    audience: 'जो आम इमेज या दस्तावेज़ फॉर्मैट आपस में बदलना चाहते हैं।',
  },
  developer: {
    label: 'डेवलपर टूल',
    description: 'JSON ठीक करें, Base64, JWT और UUID का काम करें।',
    audience: 'डेवलपर जिन्हें JSON, Base64, URL, UUID या JWT देखना हो, बिना डेटा भेजे।',
  },
  calculators: {
    label: 'कैलकुलेटर',
    description: 'GST, EMI, SIP, FD, छूट और ग्रेच्युटी निकालें।',
    audience: 'दुकानदार, छात्र, और जिन्हें GST, EMI, SIP, FD, छूट या ग्रेच्युटी निकालनी हो।',
  },
};

export const TOOL_HI: Record<string, { short: string; description: string }> = {
  'image-compressor': {
    short: 'JPEG, PNG और WebP फोटो का साइज़ घटाएँ, क्वालिटी बनाए रखें।',
    description:
      'फोटो का फ़ाइल साइज़ कम करें और तस्वीर साफ रखें। काम आपके ब्राउज़र में होता है, फ़ाइल सर्वर पर नहीं जाती।',
  },
  'image-resizer': {
    short: 'फोटो की चौड़ाई, ऊँचाई या प्रतिशत से साइज़ बदलें।',
    description: 'एक या कई फोटो को पिक्सल, चौड़ाई-ऊँचाई या प्रतिशत से रीसाइज़ करें।',
  },
  'image-cropper': {
    short: 'फोटो को हैंडल से काटें, या तैयार अनुपात चुनें।',
    description: 'फोटो को अपनी माप या सोशल मीडिया के अनुपात में काटें।',
  },
  'image-converter': {
    short: 'JPG, PNG, WebP, AVIF, SVG और GIF आपस में बदलें।',
    description: 'फोटो का फॉर्मैट ब्राउज़र में बदलें। फ़ाइल आपके कंप्यूटर पर रहती है।',
  },
  'document-translator': {
    short: 'PDF या फोटो को दूसरी भाषा में बदलें। पेज का लेआउट बना रहता है।',
    description:
      'PDF, JPG, PNG या WebP अपलोड करें, भाषा चुनें, और अनुवाद डाउनलोड करें। फ़ाइल DocsWala सर्वर से Google Gemini तक जाती है। DocsWala उसे बाद में सेव नहीं रखता।',
  },
  'pdf-merger': {
    short: 'कई PDF को एक फ़ाइल में जोड़ें।',
    description: 'PDF फ़ाइलें जोड़ें। क्रम बदलकर एक PDF डाउनलोड करें।',
  },
  'pdf-splitter': {
    short: 'PDF के पन्ने अलग करें या चुनकर निकालें।',
    description: 'हर पन्ना अलग PDF बनाएं, या पेज रेंज लिखकर निकालें। ZIP से एक साथ डाउनलोड करें।',
  },
  'pdf-to-image': {
    short: 'PDF के पन्नों को JPG या PNG बनाएं।',
    description: 'PDF के पन्नों को साफ JPG या PNG तस्वीरों में बदलें।',
  },
  'image-to-pdf': {
    short: 'JPG, PNG और WebP फोटो को एक PDF बनाएं।',
    description: 'फोटो, रसीद या स्कैन को साफ PDF में बदलें। पेज साइज़ और मार्जिन चुन सकते हैं।',
  },
  'json-formatter': {
    short: 'JSON को सुंदर, छोटा या जाँच के साथ देखें।',
    description: 'गड़बड़ JSON को साफ इंडेंट में लाएं, छोटा करें, और गलती तुरंत देखें।',
  },
  'qr-code-generator': {
    short: 'UPI, WhatsApp, WiFi, लिंक या टेक्स्ट का QR बनाएं।',
    description:
      'दुकान के भुगतान, WhatsApp, WiFi या वेबसाइट के लिए प्रिंट होने वाला QR बनाएं। साइन-अप नहीं चाहिए।',
  },
  'base64-converter': {
    short: 'टेक्स्ट या फ़ाइल को Base64 में बदलें, या वापस पढ़ें।',
    description: 'टेक्स्ट और फ़ाइल को Base64 में एन्कोड या डिकोड करें। काम ब्राउज़र में होता है।',
  },
  'compress-image-to-50kb': {
    short: 'फोटो को 50KB के अंदर लाएं, सरकारी और परीक्षा फॉर्म के लिए।',
    description: 'SSC, UPSC और पोर्टल अपलोड के लिए फोटो को 50KB से कम करें।',
  },
  'compress-image-to-100kb': {
    short: 'फोटो को 100KB के अंदर लाएं।',
    description: 'जिन फॉर्म में 100KB की सीमा हो, उनके लिए फोटो छोटा करें।',
  },
  'passport-photo-maker': {
    short: 'फोटो को 35×45mm पासपोर्ट साइज़ में काटें।',
    description: 'पोर्ट्रेट को 35×45mm या 2×2 इंच के आधिकारिक साइज़ में काटें।',
  },
  'passport-sheet-maker': {
    short: 'एक पासपोर्ट फोटो को 4x6 या A4 शीट पर कई कॉपी में लगाएं।',
    description: 'एक फोटो से प्रिंट होने वाली शीट बनाएं, 8 या 12 कॉपी के साथ।',
  },
  'signature-cropper': {
    short: 'हस्ताक्षर को 3:1 अनुपात में काटें, फॉर्म अपलोड के लिए।',
    description: 'SSC, UPSC और बैंक फॉर्म के लिए साफ हस्ताक्षर काटें।',
  },
  'upi-qr-code-generator': {
    short: 'दुकान के काउंटर के लिए GPay, PhonePe, Paytm QR बनाएं।',
    description: 'UPI ID से प्रिंट होने वाला भुगतान QR स्टैंडी बनाएं।',
  },
  'gst-calculator': {
    short: 'GST जोड़ें या निकालें, और दुकान का मुनाफा देखें।',
    description: 'कीमत पर GST लगाएं या हटाएं। लागत और मुनाफा भी निकालें।',
  },
  'emi-calculator': {
    short: 'लोन की EMI, ब्याज और कुल भुगतान निकालें।',
    description: 'राशि, ब्याज और समय भरें। EMI और कुल भुगतान तुरंत देखें।',
  },
  'gratuity-calculator': {
    short: 'नौकरी के सालों से ग्रेच्युटी का अनुमान लगाएं।',
    description: 'वेतन और सेवा के साल भरकर ग्रेच्युटी राशि देखें।',
  },
  'discount-calculator': {
    short: 'छूट, मार्जिन और बिक्री कीमत निकालें।',
    description: 'अंकित कीमत पर छूट लगाएं, या दुकान का मार्जिन देखें।',
  },
  'sip-calculator': {
    short: 'SIP और चक्रवृद्धि से जमा राशि का अनुमान लगाएं।',
    description: 'महीने की राशि, रिटर्न और साल भरकर मैच्योरिटी देखें।',
  },
  'fd-calculator': {
    short: 'FD और बैंक जमा पर ब्याज व मैच्योरिटी निकालें।',
    description: 'मूलधन, दर और अवधि से FD की मैच्योरिटी राशि देखें।',
  },
  'word-counter': {
    short: 'शब्द, अक्षर, वाक्य और पैराग्राफ गिनें।',
    description: 'टेक्स्ट चिपकाएं। शब्द और अक्षर की गिनती तुरंत दिखेगी।',
  },
  'case-converter': {
    short: 'टेक्स्ट को बड़े, छोटे या टाइटल केस में बदलें।',
    description: 'अक्षरों का केस एक क्लिक में बदलें।',
  },
  'remove-duplicates': {
    short: 'दोहरी लाइनें हटाएं और लिस्ट को क्रम में लगाएं।',
    description: 'लिस्ट साफ करें। एक जैसी लाइनें हटें और चाहें तो A से Z क्रम लगाएं।',
  },
  uuid: {
    short: 'एक या कई UUID v4 आईडी बनाएं।',
    description: 'रैंडम UUID v4 बनाएं और कॉपी करें।',
  },
  'url-encoder': {
    short: 'URL और क्वेरी टेक्स्ट को एन्कोड या डिकोड करें।',
    description: 'लिंक के खास अक्षरों को एन्कोड करें, या वापस पढ़ने लायक बनाएं।',
  },
  'jwt-decoder': {
    short: 'JWT का हेडर और पेलोड पढ़ें। हस्ताक्षर की जाँच नहीं होती।',
    description:
      'टोकन चिपकाएं। हेडर और पेलोड JSON में दिखेगा। यह हस्ताक्षर को सही या भरोसेमंद नहीं बताता।',
  },
};

export function toolHindi(slug: string): { short: string; description: string } | undefined {
  return TOOL_HI[slug];
}

export const PROCESS_LABEL: Record<string, { en: string; hi: string }> = {
  'image-compressor': { en: 'Compress Images', hi: 'इमेज कंप्रेस करें' },
  'compress-image-to-50kb': { en: 'Compress Images', hi: 'इमेज कंप्रेस करें' },
  'compress-image-to-100kb': { en: 'Compress Images', hi: 'इमेज कंप्रेस करें' },
  'image-resizer': { en: 'Resize Images', hi: 'इमेज रीसाइज़ करें' },
  'pdf-merger': { en: 'Merge PDF Files', hi: 'PDF जोड़ें' },
  'pdf-splitter': { en: 'Split PDF Document', hi: 'PDF के पन्ने अलग करें' },
  'pdf-to-image': { en: 'Convert PDF to Images', hi: 'PDF को इमेज बनाएं' },
  'image-to-pdf': { en: 'Convert to PDF', hi: 'PDF बनाएं' },
  'image-converter': { en: 'Convert Format', hi: 'फॉर्मैट बदलें' },
};

export const SITE_HI = {
  oneLiner:
    'DocsWala मुफ़्त वेबसाइट है। फोटो छोटा या काटें, PDF जोड़ें या बदलें, दुकान का QR बनाएं, टेक्स्ट ठीक करें, और GST, EMI, SIP निकालें। साइन-अप नहीं। ज़्यादातर टूल आपके कंप्यूटर पर चलते हैं।',
};

const LABEL_HI: Record<string, string> = {
  'Process Files': 'फ़ाइल प्रोसेस करें',
};
for (const pair of Object.values(PROCESS_LABEL)) {
  LABEL_HI[pair.en] = pair.hi;
}

export function hindiForKnownLabel(english: string): string | undefined {
  return LABEL_HI[english];
}

export function categoryHindi(id: string): { label: string; description: string; audience: string } {
  return (
    CATEGORY_HI[id] ?? {
      label: id,
      description: '',
      audience: 'जिन्हें बिना साइन-अप के ब्राउज़र टूल चाहिए।',
    }
  );
}
