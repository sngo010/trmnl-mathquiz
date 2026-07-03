const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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

Mix these types: counting, addition, subtraction, pattern.

STRICT RULES:
- Numbers 1-10 only (keep it easy for young kids)
- Short playful question text
- NO answers shown
- "type" must be exactly one of: "counting", "addition", "subtraction", "pattern" (always lowercase)
- "display" must use ONLY plain ASCII characters — NO emoji, NO unicode symbols
  - For counting: use repeated letters or symbols like "O O O O O" or "* * * *"
  - For addition: use format like "3 + 4 = ?"
  - For subtraction: use format like "7 - 2 = ?"
  - For pattern: use repeating shapes/letters like "A B A B ?" or "1 2 3 ?" or "* ** * ** ?"
  - NEVER use color descriptions in patterns (no red/blue/green) — e-ink screens are black and white only
- "hint" should be a short encouraging phrase, plain text only

Respond ONLY with a JSON array, no markdown, no explanation:
[{"display":"O O O O O","question":"How many circles do you see?","type":"counting","hint":"Point and count each one!"}]`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (!data.content || !data.content[0]) throw new Error(JSON.stringify(data));

  const text = data.content[0].text.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
