export interface ToolGuideStep {
  stepNumber: number;
  iconName: 'UploadCloud' | 'Sliders' | 'Download' | 'Crop' | 'QrCode' | 'Calculator' | 'FileText' | 'CheckCircle';
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
}

export interface ToolGuideData {
  title: {
    en: string;
    hi: string;
  };
  subtitle: {
    en: string;
    hi: string;
  };
  steps: ToolGuideStep[];
}

export const DEFAULT_GUIDE_DATA: ToolGuideData = {
  title: {
    en: 'How to Use This Tool in 3 Easy Steps',
    hi: 'इस टूल का उपयोग 3 आसान चरणों में कैसे करें',
  },
  subtitle: {
    en: '100% private in-browser processing with zero server uploads.',
    hi: '100% सुरक्षित ब्राउज़र प्रोसेसिंग - कोई फाइल सर्वर पर अपलोड नहीं होती।',
  },
  steps: [
    {
      stepNumber: 1,
      iconName: 'UploadCloud',
      title: {
        en: 'Select or Drop Files',
        hi: 'फाइलें चुनें या ड्रैग करें',
      },
      description: {
        en: 'Choose files from your device or drag them directly into the box. Files stay 100% private on your computer.',
        hi: 'अपने डिवाइस से फाइलें चुनें या सीधे बॉक्स में ड्रैग करें। फाइलें आपके कंप्यूटर पर 100% सुरक्षित रहती हैं।',
      },
    },
    {
      stepNumber: 2,
      iconName: 'Sliders',
      title: {
        en: 'Adjust Settings',
        hi: 'सेटिंग्स सेट करें',
      },
      description: {
        en: 'Customize compression quality, dimensions, aspect ratios, or calculation values to meet your needs.',
        hi: 'अपनी आवश्यकता के अनुसार कम्प्रेशन, डाइमेंशन, आस्पेक्ट रेशियो या कैलकुलेशन सेटिंग्स एडजस्ट करें।',
      },
    },
    {
      stepNumber: 3,
      iconName: 'Download',
      title: {
        en: 'Instant Download',
        hi: 'तुरंत डाउनलोड करें',
      },
      description: {
        en: 'Click process to process your file in real time and download the output immediately.',
        hi: 'प्रोसेस पर क्लिक करें और बिना किसी प्रतीक्षा के तुरंत अपनी तैयार फाइल डाउनलोड करें।',
      },
    },
  ],
};

export const TOOL_GUIDES: Record<string, ToolGuideData> = {
  'image-cropper': {
    title: {
      en: 'How to Crop Photos & Presets in 3 Steps',
      hi: 'फोटो क्रॉप और प्रैसेट का उपयोग 3 चरणों में करें',
    },
    subtitle: {
      en: 'Precise interactive crop box for Passport, Signatures, and Social Media.',
      hi: 'पासपोर्ट, सिग्नेचर और सोशल मीडिया के लिए सटीक क्रॉप टूल।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'UploadCloud',
        title: {
          en: 'Upload Photo',
          hi: 'फोटो अपलोड करें',
        },
        description: {
          en: 'Select a photo from your phone or PC. Supported formats: JPG, PNG, WebP.',
          hi: 'अपने फोन या कंप्यूटर से फोटो चुनें। JPG, PNG, WebP सपोर्टेड हैं।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Crop',
        title: {
          en: 'Select Preset & Adjust Box',
          hi: 'प्रैसेट चुनें और बॉक्स सेट करें',
        },
        description: {
          en: 'Choose Passport (35×45mm), Signature (3:1), or custom aspect ratio. Drag handles to frame face/signature.',
          hi: 'पासपोर्ट (35x45mm), सिग्नेचर (3:1) या कस्टम रेशियो चुनें और हैंडल खींचकर फोटो एडजस्ट करें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Download Cropped Image',
          hi: 'क्रॉप की गई इमेज डाउनलोड करें',
        },
        description: {
          en: 'Click "Crop Image" and download your perfectly formatted photo instantly.',
          hi: '"क्रॉप फोटो" बटन पर क्लिक करें और तुरंत हाई-क्वालिटी फोटो डाउनलोड करें।',
        },
      },
    ],
  },

  'passport-photo-maker': {
    title: {
      en: 'How to Make Passport Size Photo (35x45 mm)',
      hi: 'पासपोर्ट साइज फोटो (35x45 मिमी) कैसे बनाएं',
    },
    subtitle: {
      en: 'Format portrait photos for Sarkari, Exam, Visa, and Identity Cards.',
      hi: 'सरकारी फॉर्म, परीक्षा, वीजा और आईडी कार्ड के लिए फोटो बनाएं।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'UploadCloud',
        title: {
          en: 'Upload Portrait / Selfie',
          hi: 'पासपोर्ट फोटो अपलोड करें',
        },
        description: {
          en: 'Upload a front-facing portrait photo with clear background lighting.',
          hi: 'साफ बैकग्राउंड वाली अपनी पासपोर्ट साइज फोटो या सेल्फी अपलोड करें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Crop',
        title: {
          en: 'Align Face in 35×45mm Frame',
          hi: 'चेहरे को 35×45mm फ्रेम में मिलाएं',
        },
        description: {
          en: 'The crop box is fixed to standard 35×45mm (7:9 ratio). Center head and eyes within the guide.',
          hi: 'क्रॉप बॉक्स 35×45mm स्टैंडर्ड पर सेट है। चेहरे और आंखों को बीच में रखें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Download Printable Photo',
          hi: 'प्रिंट-रेडी फोटो डाउनलोड करें',
        },
        description: {
          en: 'Download high-resolution image ready for shop printing or online application uploads.',
          hi: 'ऑनलाइन फॉर्म अपलोड या दुकान पर प्रिंट करने के लिए हाई-रिफ्रेश फोटो डाउनलोड करें।',
        },
      },
    ],
  },

  'passport-sheet-maker': {
    title: {
      en: 'How to Make Printable Passport Photo Sheet (4x6" / A4)',
      hi: 'प्रिंट करने योग्य पासपोर्ट फोटो शीट (4x6" / A4) कैसे बनाएं',
    },
    subtitle: {
      en: 'Tile 1 passport photo into an 8-photo (4x6") or 12-photo (A4) grid with cutting borders.',
      hi: '1 फोटो से 8-फोटो (4x6") या 12-फोटो (A4) कटिंग लाइन वाली प्रिंट शीट बनाएं।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'UploadCloud',
        title: {
          en: 'Upload 1 Passport Photo',
          hi: '1 पासपोर्ट फोटो अपलोड करें',
        },
        description: {
          en: 'Upload a single cropped passport photo (35×45mm or 2×2 in).',
          hi: 'अपनी 1 तैयार पासपोर्ट साइज फोटो (35×45 मिमी) अपलोड करें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Select Paper Size (4x6" or A4)',
          hi: 'कागज का साइज चुनें (4x6" या A4)',
        },
        description: {
          en: 'Choose 8 Photos on 4×6 photo paper or 12/16 Photos on A4 paper with cut lines.',
          hi: '4×6 फोटो पेपर पर 8 फोटो या A4 पेपर पर 12/16 फोटो प्रैसेट चुनें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Print or Download Sheet',
          hi: 'प्रिंट करें या शीट डाउनलोड करें',
        },
        description: {
          en: 'Click Print or Download to save printable high-res PDF image sheet.',
          hi: 'प्रिंटर से सीधे प्रिंट निकालें या उच्च-गुणवत्ता वाली PDF शीट डाउनलोड करें।',
        },
      },
    ],
  },

  'signature-cropper': {
    title: {
      en: 'How to Crop Signature for Online Forms',
      hi: 'ऑनलाइन फॉर्म के लिए सिग्नेचर कैसे क्रॉप करें',
    },
    subtitle: {
      en: 'Extract clean signature from paper scan photos in 3:1 ratio.',
      hi: 'कागज पर लिखे सिग्नेचर को साफ करके 3:1 अनुपात में क्रॉप करें।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'UploadCloud',
        title: {
          en: 'Upload Scanned Signature Page',
          hi: 'स्कैन किया हुआ सिग्नेचर अपलोड करें',
        },
        description: {
          en: 'Take a photo of signature on white paper or upload scanned document.',
          hi: 'सफेद कागज पर किए गए हस्ताक्षर की फोटो खींचकर यहां अपलोड करें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Crop',
        title: {
          en: 'Select 3:1 or 2:1 Ratio',
          hi: '3:1 या 2:1 रेशियो सेट करें',
        },
        description: {
          en: 'Use 3:1 preset (standard for SSC, UPSC, bank forms) and tighten bounding box around signature.',
          hi: '3:1 प्रैसेट चुनें (सरकारी फॉर्म के लिए मानक) और सिग्नेचर के चारों तरफ बॉक्स सेट करें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Download Signature File',
          hi: 'सिग्नेचर डाउनलोड करें',
        },
        description: {
          en: 'Click crop and download crisp signature PNG/JPG image ready to upload.',
          hi: 'क्रॉप पर क्लिक करें और फॉर्म में अपलोड करने के लिए सिग्नेचर डाउनलोड करें।',
        },
      },
    ],
  },

  'qr-code-generator': {
    title: {
      en: 'How to Create Shop UPI & WhatsApp QR Codes',
      hi: 'दुकान UPI और व्हाट्सएप QR कोड कैसे बनाएं',
    },
    subtitle: {
      en: 'Generate printable counter payment standees & direct WhatsApp customer chat QR.',
      hi: 'दुकान के काउंटर के लिए UPI QR कोड और व्हाट्सएप डायरेक्ट चैट QR बनाएं।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'QrCode',
        title: {
          en: 'Select QR Type & Enter Details',
          hi: 'QR टाइप चुनें और जानकारी भरें',
        },
        description: {
          en: 'Choose Shop UPI, WhatsApp Chat, or WiFi tab. Type Payee UPI ID (e.g. shopname@upi) & Shop Name.',
          hi: 'Shop UPI, WhatsApp या WiFi टैब चुनें। अपनी UPI ID (उदा. shopname@upi) और दुकान का नाम लिखें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Choose Center Logo or Custom Logo',
          hi: 'सेंटर लोगो या दुकान का लोगो लगाएं',
        },
        description: {
          en: 'Select built-in ₹ Rupee / UPI icon or upload your own shop logo with auto-contrast shield.',
          hi: '₹ रुपया / UPI आइकन चुनें या अपनी दुकान का लोगो अपलोड करें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Download or Print Shop Standee',
          hi: 'डाउनलोड करें या स्टैंडी प्रिंट करें',
        },
        description: {
          en: 'Click "Print Standee" to print a ready-made counter standee card, or download PNG image.',
          hi: '"प्रिंट स्टैंडी" पर क्लिक करके दुकान के काउंटर के लिए प्रिंट निकालें या PNG डाउनलोड करें।',
        },
      },
    ],
  },

  'upi-qr-code-generator': {
    title: {
      en: 'How to Make Shop UPI Counter Standee QR',
      hi: 'दुकान काउंटर UPI पेमेंट QR कोड कैसे बनाएं',
    },
    subtitle: {
      en: 'Accept payments from PhonePe, Google Pay, Paytm & BHIM with 0% fee.',
      hi: 'PhonePe, Google Pay, Paytm और BHIM से पेमेंट स्वीकार करने के लिए QR बनाएं।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'QrCode',
        title: {
          en: 'Enter Shop VPA & Payee Name',
          hi: 'UPI ID और दुकान का नाम भरें',
        },
        description: {
          en: 'Enter your GPay/PhonePe UPI ID (e.g., 9876543210@paytm or shop@ybl) and Shop Payee Name.',
          hi: 'अपनी GPay/PhonePe UPI ID और अपनी दुकान/व्यापारी का नाम लिखें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Set Fixed Amount (Optional)',
          hi: 'फिक्स्ड अमाउंट सेट करें (ऐच्छिक)',
        },
        description: {
          en: 'Leave amount blank for flexible customer entry, or set exact amount for fixed items.',
          hi: 'ग्राहक को मनचाहा अमाउंट भरने देने के लिए खाली छोड़ें, या फिक्स्ड रकम दर्ज करें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Print Shop Counter Standee',
          hi: 'काउंटर स्टैंडी प्रिंट करें',
        },
        description: {
          en: 'Click "Print Counter Standee" to get a clean printable payment card ready to stick at shop counter.',
          hi: '"प्रिंट काउंटर स्टैंडी" पर क्लिक करके प्रिंटर से कार्ड प्रिंट करें और दुकान पर लगाएं।',
        },
      },
    ],
  },

  'compress-image-to-50kb': {
    title: {
      en: 'How to Compress Photo Under 50KB for Forms',
      hi: 'फॉर्म के लिए फोटो का साइज 50KB से कम कैसे करें',
    },
    subtitle: {
      en: 'Strict target reduction for Sarkari Result, SSC, UPSC, and Admit Card portals.',
      hi: 'सरकारी रिजल्ट, SSC, UPSC और एडमिट कार्ड पोर्टल के लिए साइज 50KB से कम करें।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'UploadCloud',
        title: {
          en: 'Upload Photo or Certificate',
          hi: 'फोटो या सर्टिफिकेट अपलोड करें',
        },
        description: {
          en: 'Drop your heavy image (1MB - 10MB) into the dropzone.',
          hi: 'अपनी बड़ी फोटो या डॉक्यूमेंट (1MB - 10MB) यहां अपलोड करें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Auto 50KB Target Compression',
          hi: 'ऑटो 50KB टारगेट कम्प्रेशन',
        },
        description: {
          en: 'The compressor automatically reduces file size under 50KB while keeping text/face legible.',
          hi: 'टूल अपने आप साइज 50KB से कम कर देगा और फोटो की क्लेरिटी बनाए रखेगा।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Download & Upload to Form',
          hi: 'डाउनलोड करके फॉर्म में लगाएं',
        },
        description: {
          en: 'Download the compressed file and directly upload it to government portal without rejection.',
          hi: 'फाइल डाउनलोड करें और बिना किसी रिजेक्शन के सीधे सरकारी पोर्टल पर अपलोड करें।',
        },
      },
    ],
  },

  'compress-image-to-100kb': {
    title: {
      en: 'How to Compress Image Under 100KB',
      hi: 'फोटो का साइज 100KB से कम कैसे करें',
    },
    subtitle: {
      en: 'Shrink marksheets and ID card scans under 100KB limit.',
      hi: 'मार्कशीट और आईडी कार्ड स्कैन का साइज 100KB के अंदर लाएं।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'UploadCloud',
        title: {
          en: 'Upload Image File',
          hi: 'इमेज फाइल अपलोड करें',
        },
        description: {
          en: 'Upload single or multiple images that exceed the 100KB limit.',
          hi: '100KB से बड़ी फोटो या स्कैन फाइल अपलोड करें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Quality Optimization',
          hi: 'क्वालिटी ऑप्टिमाइजेशन',
        },
        description: {
          en: 'Algorithm compresses data down under 100KB with live percentage savings indicator.',
          hi: 'एल्गोरिदम बिना धुंधला किए फाइल साइज 100KB के अंदर सेट करता है।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Download Compressed File',
          hi: 'कम्प्रैस्ड फाइल डाउनलोड करें',
        },
        description: {
          en: 'Click Download to save optimized file directly to your device.',
          hi: 'डाउनलोड पर क्लिक करके फाइल तुरंत सुरक्षित करें।',
        },
      },
    ],
  },

  'gst-calculator': {
    title: {
      en: 'How to Use GST & Profit Calculator for Shopkeepers',
      hi: 'दुकानदार प्रॉफिट और GST कैलकुलेटर का उपयोग कैसे करें',
    },
    subtitle: {
      en: 'Calculate MRP required to get your desired in-pocket profit after tax.',
      hi: 'टैक्स देने के बाद जेब में अपनी मनचाही कमाई (Net Profit) पाने के लिए सही MRP जानें।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'Calculator',
        title: {
          en: 'Choose Calculation Mode',
          hi: 'कैलकुलेशन मोड चुनें',
        },
        description: {
          en: 'Select "Shopkeeper Profit Mode" to calculate Selling MRP, or "Add GST / Remove GST" mode.',
          hi: '"Shopkeeper Profit Mode" चुनें (MRP जानने के लिए), या Add GST / Remove GST चुनें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Enter Cost & Profit Margin',
          hi: 'लागत और मनचाहा मुनाफा भरें',
        },
        description: {
          en: 'Type Purchase Cost (₹), Desired Profit (₹), and GST Slab (5%, 12%, 18%, 28%).',
          hi: 'खरीद मूल्य (₹), अपनी मनचाही कमाई (₹) और GST दर (5%, 12%, 18%, 28%) दर्ज करें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'CheckCircle',
        title: {
          en: 'View MRP & CGST/SGST Split',
          hi: 'सटीक MRP और CGST/SGST देखें',
        },
        description: {
          en: 'Instantly view exact MRP to charge customer so you get 100% of your targeted net profit.',
          hi: 'ग्राहक से लेने वाली सही MRP और CGST/SGST टैक्स का पूरा हिसाब तुरंत देखें।',
        },
      },
    ],
  },

  'pdf-merger': {
    title: {
      en: 'How to Merge PDF Files in 3 Steps',
      hi: 'कई PDF फाइलों को एक साथ कैसे जोड़ें (Merge PDF)',
    },
    subtitle: {
      en: 'Combine Aadhaar front/back, marksheets, or certificates into 1 PDF.',
      hi: 'आधार कार्ड, मार्कशीट या सर्टिफिकेट्स की फाइलों को एक PDF में मिलाएं।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'UploadCloud',
        title: {
          en: 'Upload PDF Documents',
          hi: 'PDF फाइलें अपलोड करें',
        },
        description: {
          en: 'Select 2 or more PDF files from your computer or phone.',
          hi: '2 या उससे अधिक PDF फाइलें अपने डिवाइस से चुनें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Drag to Reorder Pages',
          hi: 'पेजों का क्रम (Order) बदलें',
        },
        description: {
          en: 'Drag files up or down to set the exact page sequence in your final document.',
          hi: 'फाइलों को ऊपर या नीचे खींचकर सही क्रम सेट करें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'Download',
        title: {
          en: 'Download Combined PDF',
          hi: 'मर्ज की गई PDF डाउनलोड करें',
        },
        description: {
          en: 'Click "Merge PDFs" and download your compiled single document.',
          hi: '"मर्ज PDF" पर क्लिक करके तैयार एक पीडीएफ फाइल डाउनलोड करें।',
        },
      },
    ],
  },

  'sip-calculator': {
    title: {
      en: 'How to Calculate SIP Investment Growth in 3 Steps',
      hi: 'SIP निवेश रिटर्न की गणना 3 आसान चरणों में कैसे करें',
    },
    subtitle: {
      en: 'Calculate monthly compounding returns, total wealth gained, and final maturity amount.',
      hi: 'मंथली कंपाउंडिंग रिटर्न, कुल मुनाफा और मैच्योरिटी रकम की गणना करें।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'Calculator',
        title: {
          en: 'Enter Monthly SIP or Lumpsum Amount',
          hi: 'मासिक SIP या एकमुश्त रकम भरें',
        },
        description: {
          en: 'Type your monthly investment amount (e.g. ₹10,000 / month) or switch to Lumpsum mode.',
          hi: 'अपनी मासिक निवेश रकम (उदा. ₹10,000 / महीना) भरें या एकमुश्त (Lumpsum) चुनें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Set Expected Return Rate & Tenure',
          hi: 'वार्षिक ब्याज दर और समय अवधि सेट करें',
        },
        description: {
          en: 'Use sliders to set annual expected return rate (e.g. 6% or 12%) and investment tenure in years.',
          hi: 'अनुमानित वार्षिक रिटर्न रेट (उदा. 6% या 12%) और वर्षों की संख्या चुनें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'CheckCircle',
        title: {
          en: 'View Maturity Wealth & Growth Breakdown',
          hi: 'कुल संपत्ति और मुनाफे का हिसाब देखें',
        },
        description: {
          en: 'Instantly view Total Invested, Compounded Growth, Total Maturity Value, and copy summary.',
          hi: 'कुल जमा राशि, कंपाउंडिंग मुनाफा, मैच्योरिटी राशि और सारांश कॉपी करें।',
        },
      },
    ],
  },

  'fd-calculator': {
    title: {
      en: 'How to Calculate Bank FD Interest & Maturity',
      hi: 'बैंक एफडी (FD) ब्याज और मैच्योरिटी रकम की गणना कैसे करें',
    },
    subtitle: {
      en: 'Calculate quarterly compounding interest returns on fixed term deposits.',
      hi: 'फिक्स्ड डिपॉजिट पर बैंक की त्रैमासिक (Quarterly) कंपाउंडिंग दर से ब्याज जानें।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'Calculator',
        title: {
          en: 'Enter Deposit Amount & Interest Rate',
          hi: 'जमा राशि और ब्याज दर भरें',
        },
        description: {
          en: 'Type total principal deposit (e.g. ₹1,00,000) and annual bank interest rate (e.g. 7.5%).',
          hi: 'कुल जमा राशि (उदा. ₹1,00,000) और बैंक की वार्षिक ब्याज दर (उदा. 7.5%) भरें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Choose Compounding Frequency & Tenure',
          hi: 'कंपाउंडिंग दर और समय चुनें',
        },
        description: {
          en: 'Select Quarterly compounding (Standard Indian Bank FD) or Monthly/Annual payout mode.',
          hi: 'त्रैमासिक (Quarterly) चक्रवर्ती ब्याज दर या मासिक/वार्षिक भुगतान चुनें।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'CheckCircle',
        title: {
          en: 'View Total Interest & Maturity Payout',
          hi: 'कुल ब्याज और मैच्योरिटी वैल्यू देखें',
        },
        description: {
          en: 'Get exact breakdown of Total Interest Earned and Final Maturity Amount.',
          hi: 'कुल ब्याज कमाई और परिपक्वता (Maturity) राशि का पूरा ब्योरा प्राप्त करें।',
        },
      },
    ],
  },

  'json-formatter': {
    title: {
      en: 'How to Use JSON Formatter & Validator',
      hi: 'JSON फॉर्मेट और वैलिडेटर का उपयोग कैसे करें',
    },
    subtitle: {
      en: 'Prettify, validate, minify, and inspect JSON data in 3 easy steps.',
      hi: 'JSON डेटा को प्रेटीफाई (Prettify), वैलिडेट (Validate) और मिनीफाई (Minify) करें।',
    },
    steps: [
      {
        stepNumber: 1,
        iconName: 'FileText',
        title: {
          en: 'Paste Raw JSON or Upload .json File',
          hi: 'रॉ JSON टेक्स्ट भरें या .json फाइल अपलोड करें',
        },
        description: {
          en: 'Paste your unformatted JSON string into the box or click "Upload .json File".',
          hi: 'अपना बिना फॉर्मेट किया हुआ JSON कोड बॉक्स में पेस्ट करें या फाइल अपलोड करें।',
        },
      },
      {
        stepNumber: 2,
        iconName: 'Sliders',
        title: {
          en: 'Format, Prettify or Minify',
          hi: 'फॉर्मेट (Format) या मिनीफाई (Minify) करें',
        },
        description: {
          en: 'Choose 2 spaces, 4 spaces, or Tab indentation, or click Minify for single-line JSON.',
          hi: '2 स्पेस, 4 स्पेस या टैब चुनें या एक लाइन के कोड के लिए Minify दबाएं।',
        },
      },
      {
        stepNumber: 3,
        iconName: 'CheckCircle',
        title: {
          en: 'Check Syntax & Copy / Download',
          hi: 'सिंटेक्स चेक करें और कॉपी/डाउनलोड करें',
        },
        description: {
          en: 'Verify the green "Valid JSON" indicator, inspect key stats, and copy or download JSON.',
          hi: '"Valid JSON" हरा इंडिकेटर चेक करें और 1-क्लिक में कॉपी या डाउनलोड करें।',
        },
      },
    ],
  },
};

export function getToolGuide(toolSlug: string): ToolGuideData {
  return TOOL_GUIDES[toolSlug] || DEFAULT_GUIDE_DATA;
}
