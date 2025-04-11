import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const cleanedMessages = messages.filter(
      (msg) => msg.role && msg.content
    );

    const systemPrompt = `
You are a helpful, casual repair chatbot for home services. Greet the user if it's the first message. Ask what they need help with, and suggest a few common categories like "Plumbing", "AC", "Broken Appliance" — but let them type freely.

Collect name and email (or phone) together, but don't block progress if email is missing — just try to get it gently. Ask follow-up questions to understand the root problem. Be conversational but not annoying. Don't repeat yourself. Be short and clear.

Once you understand the problem, summarize it clearly. Suggest a likely cause or fix (don't give a price). Let the user know a certified professional will reach out shortly. Invite them to create an account to track projects.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...cleanedMessages,
      ],
      temperature: 0.7,
    });

    const reply = response.choices?.[0]?.message?.content || 'Something went wrong.';

    // ✅ Google Sheets Logging (optional)
    try {
      await fetch(process.env.SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Timestamp: new Date().toISOString(),
          Name: name,
          Email: email,
          Phone: phone,
          Image: image,
          Issue: cleanedMessages.find(m => m.role === 'user')?.content || '',
          'Chat Transcript': cleanedMessages.map(m => `${m.role}: ${m.content}`).join('\n'),
          'AI Reply': reply,
        }),
      });
    } catch (sheetErr) {
      console.error('Logging to sheet failed:', sheetErr);
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
}
