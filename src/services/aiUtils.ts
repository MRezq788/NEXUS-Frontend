import type {
  AILanguage,
  AIToolType,
} from '../models/aiMessage';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY as string | undefined;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// We are filling in a form field. The output goes directly into a single-line
// input (product name) or a short textarea (product description). The model
// must behave like a person typing, not like it is writing a document.
const formContext = `You are helping a user fill in a form field inside a product management dashboard.
The text you return will be placed directly into the field, replacing whatever the user had.
Return ONLY the final text the user should see in the field.

Strict rules:
- The field is a product name (single line, very short) or a product description (short paragraph).
- Keep the output roughly the same length as the input. Never pad, never expand into a paragraph if the input is 3-6 words.
- No greetings. No sign-offs. No "Here is your text". No explanations. No preambles. No postscripts.
- No markdown of any kind: no **bold**, no *italics*, no headings, no bullet points, no numbered lists, no code blocks, no quotes.
- No "Alternatively" or "Option 1 / Option 2". Return exactly one version.
- Use plain words the way a person types into a form.`;

const systemPromptForTool = (
  tool: AIToolType,
  language: AILanguage,
  composePrompt?: string,
): string => {
  const lang = language === 'arabic' ? 'Arabic' : 'English';
  switch (tool) {
    case 'proofread':
      return `${formContext}

Task: Proofread the user's ${lang} text. Fix only clear spelling, grammar, and punctuation mistakes. Do not rewrite, rephrase, or add new words. Output the corrected text at the same length.`;
    case 'rewrite':
      return `${formContext}

Task: Rewrite the user's ${lang} text so it reads more naturally, while keeping the exact same meaning and roughly the same length.`;
    case 'friendly':
      return `${formContext}

Task: Make the user's ${lang} text sound friendlier. Use warm, simple words the way a person would type casually. Keep it at the same length or shorter. Do not turn a short product name into a paragraph.`;
    case 'professional':
      return `${formContext}

Task: Make the user's ${lang} text sound more professional and polished. Keep it concise and at the same length. Do not add formal salutations, "Dear...", or marketing language.`;
    case 'concise':
      return `${formContext}

Task: Shorten the user's ${lang} text. Remove filler words. Keep the core meaning. Result must be shorter than the input.`;
    case 'compose':
      return `${formContext}

Task: Write a short ${lang} ${language === 'arabic' ? 'product description or name' : 'product name or description'} based on the user's input. ${composePrompt ? `Extra instruction from user: ${composePrompt}` : ''} Keep it short — one line for a name, one or two short sentences for a description.`;
    default:
      return `${formContext}

Task: Improve the user's ${lang} text slightly while keeping the same length.`;
  }
};

const translatePrompt = (targetLanguage: AILanguage): string => {
  const target = targetLanguage === 'arabic' ? 'Arabic' : 'English';
  return `${formContext}

Task: Translate the user's text into ${target}. Keep the translation the same length and register as the source. Do not add commentary.`;
};

// Strip any markdown/structure the model might still return so it looks like
// plain human-typed form input.
const sanitizeOutput = (text: string): string => {
  return text
    // Strip bold/italic markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/(?<!\w)_(.+?)_(?!\w)/g, '$1')
    // Strip inline code
    .replace(/`{1,3}(.+?)`{1,3}/g, '$1')
    // Strip heading prefixes
    .replace(/^#{1,6}\s+/gm, '')
    // Strip blockquote / list prefixes at line start
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+•·]\s+/gm, '')
    .replace(/^\d+[.)]\s+/gm, '')
    // Strip common preambles the model loves to add
    .replace(/^(here is|here's|sure[,!]?|certainly[,!]?|of course[,!]?|okay[,!]?|alright[,!]?)\s*/i, '')
    .replace(/^(your (rewritten|revised|improved|friendly|professional|concise|proofread|translated) (text|version|output|response)[:\s-]*)/i, '')
    .replace(/^(rewritten|revised|improved|friendly|professional|concise|proofread|translated|translated text|translation)[:\s-]*/i, '')
    // Collapse multiple blank lines / spaces
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

const callMistral = async (
  system: string,
  user: string,
): Promise<string> => {
  if (!MISTRAL_API_KEY) {
    throw new Error('Missing VITE_MISTRAL_API_KEY');
  }

  const res = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-tiny',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Mistral API error ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from Mistral');
  }
  return content.trim();
};

export const AIAssistCall = async (
  type: AIToolType,
  text: string,
  language: AILanguage,
  composePrompt?: string,
): Promise<string> => {
  try {
    const system = systemPromptForTool(type, language, composePrompt);
    const result = await callMistral(system, text);
    return sanitizeOutput(result);
  } catch (err) {
    console.error('AIAssistCall error:', err);
    return text;
  }
};

export const AIAutoTranslateCall = async (
  text: string,
  targetLanguage: AILanguage,
): Promise<string> => {
  try {
    const system = translatePrompt(targetLanguage);
    const result = await callMistral(system, text);
    return sanitizeOutput(result);
  } catch (err) {
    console.error('AIAutoTranslateCall error:', err);
    return text;
  }
};
