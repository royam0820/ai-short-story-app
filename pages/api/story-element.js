import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract names and locations from text
const extractStoryElements = (text) => {
  const names = text.match(/\b[A-Z][a-zÀ-ÿ]+\b/g) || [];
  // Basic location patterns in French
  const locationPatterns = /(?:dans |à |au |aux |en |sur )((?:la |le |les |l')?[A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)*)/g;
  const locations = [];
  let match;
  
  while ((match = locationPatterns.exec(text)) !== null) {
    locations.push(match[1]);
  }
  
  return { names, locations };
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { element, prompt, previousElements, wordCount } = req.body;
      
      // If this is the final story compilation
      if (element === 'Compile Story') {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: `You are a creative writing assistant for children. You need to write an engaging story in French that is EXACTLY the requested word count. The story should be sophisticated enough for ages 9-15 but still accessible. Use varied vocabulary and engaging dialogue.`
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          // Increase max_tokens to accommodate longer stories
          // 1 word ≈ 1.3 tokens for French
          max_tokens: Math.ceil(wordCount * 1.5),
          // Lower temperature for more consistent output
          temperature: 0.8,
        });

        res.status(200).json({ result: completion.choices[0].message.content });
        return;
      }

      // Extract existing names and locations from previous elements
      let existingNames = [];
      let existingLocations = [];
      
      if (previousElements?.theme) {
        const themeElements = extractStoryElements(previousElements.theme);
        existingNames = [...existingNames, ...themeElements.names];
        existingLocations = [...existingLocations, ...themeElements.locations];
      }

      // Construct the system message with context
      let systemContent = `You are a creative writing assistant helping children write stories. Keep your responses brief and focused, providing 2-3 concise sentences that capture the essence of the requested story element. Use simple, clear language appropriate for ages 9-15. Respond in French.`;

      // Add context based on the element type
      if (element === 'Personnages' && existingNames.length > 0) {
        systemContent += `\nUtilisez ces noms de personnages déjà mentionnés si pertinent: ${existingNames.join(', ')}.`;
      }
      if (element === 'Lieux' && existingLocations.length > 0) {
        systemContent += `\nIntégrez ces lieux déjà mentionnés si pertinent: ${existingLocations.join(', ')}.`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: systemContent
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      res.status(200).json({ 
        result: completion.choices[0].message.content,
        extractedElements: extractStoryElements(completion.choices[0].message.content)
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la génération de l\'élément de l\'histoire.' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}