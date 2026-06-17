const PRODUCTION_URL = 'https://carelink-backend-wenq.onrender.com';

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || PRODUCTION_URL;
