import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StoryDisplay() {
  const router = useRouter();
  const { story } = router.query;
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');

  useEffect(() => {
    if (story) {
      const decodedStory = decodeURIComponent(story);
      const { title, content } = getStoryTitleAndContent(decodedStory);
      setStoryTitle(title);
      setStoryContent(content);
    }
  }, [story]);

  // Extract title and content from the story
  const getStoryTitleAndContent = (storyText) => {
    const lines = storyText.split('\n');
    let title = "Histoire Magique"; // default title
    let contentStart = 0;
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('Titre:') || line.startsWith('Title:')) {
        title = line.split(':')[1].trim();
        contentStart = i + 1;
        break;
      }
    }

    const content = lines.slice(contentStart).join('\n');
    return { title, content };
  };

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

  return (
    <div className="min-h-screen zen-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Print Controls - hidden when printing */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link 
            href="/story-writer"
            className="py-3 px-6 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ← Retour au Créateur d'Histoires
          </Link>
          <button 
            onClick={() => window.print()}
            className="py-3 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>🖨️</span> Imprimer l'Histoire
          </button>
        </div>

        {/* Story Content - formatted for both screen and print */}
        <article className="bg-white rounded-3xl p-8 shadow-lg prose prose-lg max-w-none print:shadow-none print:p-0">
          {/* Title - shown on every printed page */}
          <div className="text-center mb-8 print:mb-6 break-after-avoid">
            <h1 className="text-4xl font-bold mb-3 print:text-3xl">{storyTitle}</h1>
            <div className="w-32 h-1 bg-purple-600 mx-auto print:bg-black"></div>
          </div>

          {/* Story content with page breaks and running header */}
          <div className="story-content leading-relaxed">
            {storyContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </article>
      </div>

      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          /* Prevent blank pages */
          html, body {
            height: auto !important;
            overflow: auto !important;
          }

          @page {
            margin: 2.54cm 3.18cm; /* Standard margins */
            size: A4;
            @bottom-center {
              content: counter(page);
              font-family: serif;
              font-size: 10pt;
            }
            @top-center {
              content: "${storyTitle}";
              font-family: serif;
              font-size: 10pt;
            }
          }

          /* Special handling for first page - no header */
          @page :first {
            @top-center {
              content: none !important;
            }
            margin-top: 2cm;
          }

          /* Adjust title spacing for print */
          h1 {
            margin-top: 1cm !important;
            break-after: avoid;
          }

          /* Rest of the styles remain the same */
          p {
            orphans: 3;
            widows: 3;
            page-break-inside: avoid;
          }

          body {
            background: none !important;
            color: black !important;
          }

          .story-content {
            font-size: 12pt !important;
            line-height: 1.6 !important;
          }

          .zen-bg {
            min-height: 0 !important;
          }

          article {
            page-break-before: always;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
} 