import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages = [], name = '', email = '', phone = '', category = '', image = '' } = req.body;

    const systemPrompt = `
You are a helpful, casual repair chatbot for home services. Greet the user if it's the first message. Ask what they need help with, and suggest a few common categories like "Plumbing", "AC", "Broken Appliance" — but let them type freely.

Collect name and email (or phone) together, but don't block progress if email is missing — just try to get it gently. Ask follow-up questions to understand the root problem. Be conversational but not annoying. Don't repeat yourself. Be short and clear.

Once you understand the problem, summarize it clearly. Suggest a likely cause or fix (don't give a price). Let the user know a certified professional will reach out shortly. Invite them to create an account to track projects.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
