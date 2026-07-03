const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export default async function handler(req, res) {
  try {
    const seed = Date.now();
    const questions = await generateQuestions(seed);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ questions, question_count: questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function generateQuestions(seed) {
  const prompt = `You are a fun math teacher for 5-year-old children. Generate exactly 3 math questions. Use seed ${seed} for variety.

Mix these types: counting with emojis, simple addition, simple subtraction, pattern recognition.
Rules: numbers 1-10 only, short playful text, 2-4 emojis per question, NO answers.

Respond ONLY with a JSON array, no markdown, no explanation:
[{"display":"🍎 + 🍎","question":"How many apples? 🤔","type":"addition","hint":"Count all the apples!"}]`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://trmnl.com',
      'X-Title': 'TRMNL Math Quiz'
    },
    body: JSON.stringify({
      model: 'nvidia/llama-3.1-nemotron-nano-8b-v1:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800
    })
  });

  const data = await response.json();
  if (!data.choices || !data.choices[0]) throw new Error(JSON.stringify(data));
  const text = data.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
