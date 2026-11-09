import { Type } from '@google/genai';

const bboxSchema = {
  type: Type.OBJECT,
  properties: {
    x: { type: Type.NUMBER },
    y: { type: Type.NUMBER },
    width: { type: Type.NUMBER },
    height: { type: Type.NUMBER },
  },
  required: ['x', 'y', 'width', 'height'],
};

const blockSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    type: { type: Type.STRING },
    originalText: { type: Type.STRING },
    translatedText: { type: Type.STRING },
    uncertain: { type: Type.BOOLEAN },
    bbox: bboxSchema,
    fontSize: { type: Type.NUMBER },
    color: { type: Type.STRING },
    align: { type: Type.STRING },
  },
  required: ['id', 'type', 'originalText', 'translatedText', 'uncertain', 'bbox'],
};

const pageSchema = {
  type: Type.OBJECT,
  properties: {
    pageNumber: { type: Type.INTEGER },
    width: { type: Type.NUMBER },
    height: { type: Type.NUMBER },
    blocks: { type: Type.ARRAY, items: blockSchema },
  },
  required: ['pageNumber', 'width', 'height', 'blocks'],
};

export const translatedDocumentSchema = {
  type: Type.OBJECT,
  properties: {
    sourceLanguage: { type: Type.STRING },
    targetLanguage: { type: Type.STRING },
    pages: { type: Type.ARRAY, items: pageSchema },
  },
  required: ['sourceLanguage', 'targetLanguage', 'pages'],
};
