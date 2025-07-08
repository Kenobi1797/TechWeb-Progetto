import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// Configurazione sicura per HTML sanitizzato
const sanitizeOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'
  ],
  allowedAttributes: {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height']
  },
  allowedSchemes: ['http', 'https'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false
};

// Configurazione sicura per marked
marked.setOptions({
  breaks: true,
  gfm: true
});

/**
 * Converte il markdown in HTML sicuro
 */
export async function parseMarkdown(markdownText: string): Promise<string> {
  if (!markdownText || typeof markdownText !== 'string') {
    return '';
  }

  try {
    // Converte markdown in HTML
    const html = await marked(markdownText);
    
    // Sanitizza l'HTML per sicurezza
    const safeHtml = sanitizeHtml(html, sanitizeOptions);
    
    return safeHtml;
  } catch (error) {
    console.error('Errore nel parsing del markdown:', error);
    return sanitizeHtml(markdownText, { allowedTags: [], allowedAttributes: {} });
  }
}

/**
 * Valida che il testo markdown non sia troppo lungo o contenga contenuti pericolosi
 */
export function validateMarkdown(text: string): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: true };
  }

  // Controlla lunghezza massima (es: 5000 caratteri)
  if (text.length > 5000) {
    return { valid: false, error: 'La descrizione è troppo lunga (massimo 5000 caratteri)' };
  }

  // Controlla per pattern potenzialmente pericolosi
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      return { valid: false, error: 'La descrizione contiene contenuti non consentiti' };
    }
  }

  return { valid: true };
}
