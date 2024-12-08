import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { element, prompt, language } = req.body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: `You are a helpful assistant that generates ideas for children's stories in French. Always respond in French with proper grammar and vocabulary appropriate for children aged 9-15. Maintain a magical and engaging tone.`
          },
          { role: "user", content: prompt }
        ],
      });

      res.status(200).json({ result: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la génération de l\'élément de l\'histoire.' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}