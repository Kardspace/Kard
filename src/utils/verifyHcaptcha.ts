// utils/verifyHcaptcha.ts
import axios from 'axios';

const SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY;

interface HcaptchaRequestBody {
  secret: string;
  response: string;
}

interface HcaptchaResponse {
  success: boolean;
  challenge_ts: string; // timestamp of the challenge
  hostname: string;
  'error-codes'?: string[];
}

export const verifyHcaptcha = async (token: string): Promise<boolean> => {
  const requestBody: HcaptchaRequestBody = {
    secret: SECRET_KEY || '',
    response: token,
  };

  const requestUrl = `https://hcaptcha.com/siteverify`;

  try {
    const response = await axios.post<HcaptchaResponse>(requestUrl, null, {
      params: requestBody,
    });
    return response.data.success;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error verifying hCaptcha:', error.response ? error.response.data : error.message);
    } else {
      console.error('Error verifying hCaptcha:', error);
    }
    return false;
  }
};
