import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

const EXTRACTION_PROMPT = `You are an expense data extraction assistant. Analyse the input and extract expense information.

Return ONLY a valid JSON object (no markdown, no code fences) with these fields:
{
  "amount": <number — total amount paid>,
  "description": "<string — short description of the expense>",
  "date": "<string — date in YYYY-MM-DD format, or null if not found>",
  "type": "<EXPENSE or INCOME>",
  "category": "<string — best-fit category name, e.g. Food, Transport, Shopping, Utilities, Entertainment, Healthcare, Education, Rent, Salary, Freelance, Other>",
  "merchant": "<string — merchant / store / vendor name, or null>",
  "currency": "<string — ISO 4217 currency code, default GBP if unclear>",
  "items": [
    { "name": "<item name>", "quantity": <number>, "price": <number> }
  ],
  "confidence": <number 0-1 — how confident you are in the extraction>
}

Rules:
- If a field cannot be determined, set it to null.
- "items" can be an empty array if individual items are not identifiable.
- Always return valid JSON. Nothing else.`;

const extractFromImage = async (
  imageBuffer: Buffer,
  mimeType: string,
) => {
  if (!config.gemini.apiKey) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Gemini API key is not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const imagePart: Part = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };

  const result = await model.generateContent([
    EXTRACTION_PROMPT + '\n\nExtract expense data from this receipt image.',
    imagePart,
  ]);

  const response = result.response;
  const text = response.text();

  return parseGeminiResponse(text);
};

const extractFromText = async (inputText: string) => {
  if (!config.gemini.apiKey) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Gemini API key is not configured');
  }

  if (!inputText || inputText.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Text input is required');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    EXTRACTION_PROMPT + `\n\nExtract expense data from this text:\n"${inputText}"`,
  ]);

  const response = result.response;
  const text = response.text();

  return parseGeminiResponse(text);
};

const parseGeminiResponse = (text: string) => {
  // Strip markdown code fences if Gemini wraps the response
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const data = JSON.parse(cleaned);
    return {
      amount: data.amount ?? null,
      description: data.description ?? null,
      date: data.date ?? null,
      type: data.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      category: data.category ?? 'Other',
      merchant: data.merchant ?? null,
      currency: data.currency ?? 'GBP',
      items: Array.isArray(data.items) ? data.items : [],
      confidence: typeof data.confidence === 'number' ? data.confidence : 0,
    };
  } catch {
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      'Failed to parse extraction result. Please try again.',
    );
  }
};

export const AiExtractService = { extractFromImage, extractFromText };
