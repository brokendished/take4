import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      messages = [],
      name = '',
      email = '',
      phone = '',
      category = '',
      image = '',
    } = req.body;

    const systemPrompt = `
You are a helpful, casual repair chatbot for home services. Greet the user if it's the first message. Ask what they need help with, and suggest a few common categories like "Plumbing", "AC", "Broken Appliance" — but let them type freely.

Collect name and email (or phone) together, but don't block progress if email is missing — just try to get it gently. Ask follow-up questions to understand the root problem. Be conversational but not annoying. Don't repeat yourself. Be short and clear.

Once enough detail is given, thank the user, summarize the issue, suggest a possible fix (do not give a price), and let them know a certified contractor will follow up shortly. Let them know they'll receive a recap and be invited to create an account to track past quotes.
`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: chatMessages,
      temperature: 0.7,
    });

    const response = completion.data.choices[0].message.content;

    return res.status(200).json({
      response,
      step: null,
      suggestions: [],
    });
  } catch (err) {
    console.error('chatbot_chat error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
