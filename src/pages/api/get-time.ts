import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Istanbul' };
  const time = now.toLocaleTimeString('tr-TR', options);
  res.status(200).json({ time });
} 