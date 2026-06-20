export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `As an interview coach, evaluate this answer to the following question:

Question: "${question}"

Answer: "${answer}"

Provide constructive, specific feedback in 2-3 sentences. Focus on: (1) What they did well, (2) One specific area to improve, (3) A quick tip for the next attempt.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ error: 'Failed to get feedback' });
    }

    const feedback = data.content[0].text.trim();

    return res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to get feedback' });
  }
}
