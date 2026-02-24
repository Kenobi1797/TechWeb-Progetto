/**
 * ReCAPTCHA Utility - Validazione ReCAPTCHA V2
 * 
 * Funzioni per validare i token ReCAPTCHA ricevuti dal frontend
 * contro il server di verifica di Google.
 * 
 * @author Gino Pandozzi-Trani
 * @version 1.0.0
 */

import axios from 'axios';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  error_codes?: string[];
}

/**
 * Valida il token ReCAPTCHA V2 con il server di Google
 * 
 * @param token Il token ricevuto dal client
 * @param secretKey La secret key del progetto ReCAPTCHA
 * @returns Promise con il risultato della validazione
 */
export const verifyRecaptchaToken = async (
  token: string,
  secretKey?: string
): Promise<RecaptchaResponse> => {
  if (!secretKey) {
    secretKey = process.env.RECAPTCHA_SECRET_KEY;
  }

  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY non è configurato nell\'ambiente');
    // Se non è configurato, non fallire, ma log un warning
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error_codes: ['missing-input-response']
    };
  }

  try {
    const response = await axios.post(RECAPTCHA_VERIFY_URL, null, {
      params: {
        secret: secretKey,
        response: token
      },
      timeout: 5000 // 5 secondi timeout
    });

    return response.data as RecaptchaResponse;
  } catch (error: unknown) {
    console.error('Errore durante la validazione ReCAPTCHA:', error);
    return {
      success: false,
      error_codes: ['connection-error']
    };
  }
};

/**
 * Middleware per validare il ReCAPTCHA nel body della richiesta
 * Aggiunge `recaptchaValid` al body dopo la validazione
 * 
 * Utilizzo: app.use(validateRecaptchaMiddleware) prima delle route
 */
export const validateRecaptchaMiddleware = async (
  req: any,
  res: any,
  next: any
) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    // Se non è fornito, continua comunque (per debug/testing)
    req.body.recaptchaValid = false;
    return next();
  }

  try {
    const result = await verifyRecaptchaToken(recaptchaToken);
    req.body.recaptchaValid = result.success;
  } catch (error) {
    console.error('Errore nel middleware ReCAPTCHA:', error);
    req.body.recaptchaValid = false;
  }

  next();
};
