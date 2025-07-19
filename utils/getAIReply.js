// utils/aiHelper.js
import { OpenAI } from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIReply(userMessage, vendorName = "Owei") {
  const prompt = `
You're a friendly, multilingual WhatsApp assistant for a restaurant named "${vendorName}". 
Respond conversationally (not robotic), be helpful, brief, and human-sounding.

Customer says: "${userMessage}"

Reply:
`;

  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  });

  return response.choices[0].message.content.trim();
}
