import { useRouter } from 'next/router';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function StoryDisplay() {
  const router = useRouter();
  const { story } = router.query;

  if (!story) {
    return (
      <div className="min-h-screen zen-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-semibold text-gray-700 mb-6">
            Aucune histoire trouvée
          </h1>
          <Link 
            href="/story-writer"
            className="inline-block py-3 px-6 rounded-xl text-white zen-button no-print"
          >
            ← Retour au Créateur d'Histoires
          </Link>
        </div>
      </div>
    );
  }

  // Extract title and content from the story
  const getStoryTitleAndContent = (storyText) => {
    const decodedStory = decodeURIComponent(storyText);
    const lines = decodedStory.split('\n');
    
    // Look for a title in the first few lines
    let title = "Votre Histoire Magique"; // default title
    let contentStart = 0;
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('Titre:') || line.startsWith('Title:')) {
        title = line.split(':')[1].trim();
        contentStart = i + 1;
        break;
      }
    }

    // Format the rest of the content
    const content = lines
      .slice(contentStart)
      .join('\n')
      .split('\n\n')
      .map(paragraph => `${paragraph}\n\n`)
      .join('');

    return { title, content };
  };

  const { title, content } = story ? getStoryTitleAndContent(story) : { title: "", content: "" };

  // Add this function
  const handlePrint = () => {
    alert(`Conseil pour l'impression :
    Pour un meilleur résultat, dans la boîte de dialogue d'impression :
    1. Cliquez sur "Plus de paramètres"
    2. Décochez "En-têtes et pieds de page"
    3. Sélectionnez "Enregistrer au format PDF"`);
    
    window.print();
  };

  return (
    <div className="min-h-screen zen-bg py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link 
            href="/story-writer"
            className="inline-block py-3 px-6 rounded-xl text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Retour au Créateur d'Histoires
          </Link>
          <button 
            onClick={handlePrint}
            className="py-3 px-6 rounded-xl text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">🖨️</span>
            Imprimer l'Histoire
          </button>
        </div>

        <div className="zen-card rounded-3xl p-8 print:shadow-none print:p-0">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 font-serif text-center">
            {title}
          </h1>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
} 