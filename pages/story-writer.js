import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const storyElements = [
  { name: 'Thèmes', prompt: 'Suggérez un thème pour l\'histoire (obligatoire):', icon: '💡', optional: false },
  { name: 'Personnages', prompt: 'Décrivez un personnage pour l\'histoire (obligatoire):', icon: '👤', optional: false },
  { 
    name: 'Lieux', 
    prompt: 'Décrivez le lieu de votre histoire ou choisissez une suggestion (optionnel):', 
    icon: '🏞️', 
    optional: true,
    options: [
      'Forêt Enchantée - un lieu mystérieux rempli d\'arbres millénaires et de créatures magiques',
      'Royaume Sous-Marin - une cité engloutie aux palais de corail et habitants aquatiques',
      'Station Spatiale - une base high-tech flottant parmi les étoiles',
      'École de Magie - un château ancien où l\'on enseigne les arts mystiques',
      'Château Ancien - une forteresse mystérieuse aux nombreux passages secrets',
      'Ville Futuriste - une métropole avec des gratte-ciels volants et des voitures volantes',
      'Village Médiéval - un petit bourg paisible entouré de remparts',
      'Île Tropicale - un paradis exotique aux trésors cachés',
      'Monde Miniature - un univers secret à l\'échelle d\'un jardin'
    ],
    allowCustomInput: true
  },
  { name: 'Intrigue', prompt: 'Donnez un bref résumé de l\'intrigue (optionnel):', icon: '📜', optional: true },
  { name: 'Conflit', prompt: 'Décrivez un conflit pour l\'histoire (optionnel):', icon: '⚔️', optional: true },
  { name: 'Résolution', prompt: 'Suggérez une résolution pour l\'histoire (optionnel):', icon: '🎉', optional: true },
];

// Add this helper function at the top level
const getElementStatus = (elementIndex, currentElement, storyData, storyElements) => {
  if (storyData[storyElements[elementIndex].name]) {
    return 'completed';
  }
  if (elementIndex === currentElement) {
    return 'current';
  }
  if (!storyElements[elementIndex].optional && !storyData[storyElements[elementIndex].name]) {
    return 'required';
  }
  return 'pending';
};

// Add this function with your other functions at the top of the component
const printStory = () => {
  window.print();
};

export default function StoryWriter() {
  // Add isClient state to handle hydration
  const [isClient, setIsClient] = useState(false);
  
  // Initialize with empty object for server-side render
  const [storyData, setStoryData] = useState({});
  const [currentElement, setCurrentElement] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(null);
  const router = useRouter();
  const [isStoryGenerated, setIsStoryGenerated] = useState(false);

  // Load stored data after component mounts
  useEffect(() => {
    setIsClient(true);
    const savedData = localStorage.getItem('storyData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setStoryData(parsed);
    }
  }, []);

  // Save to localStorage whenever storyData changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('storyData', JSON.stringify(storyData));
    }
  }, [storyData, isClient]);

  const wordCountOptions = [
    { value: 1500, label: '1500 mots - Histoire courte' },
    { value: 2000, label: '2000 mots - Histoire moyenne' },
    { value: 3000, label: '3000 mots - Histoire longue' }
  ];

  const resetStory = () => {
    if (confirm('Êtes-vous sûr de vouloir commencer une nouvelle histoire ? Tous vos éléments actuels seront effacés.')) {
      localStorage.removeItem('storyData');
      setStoryData({});
      setCurrentElement(0);
      setPrompt('');
      setWordCount(null);
    }
  };

  const clearCurrentElement = () => {
    setPrompt('');
    const newStoryData = { ...storyData };
    delete newStoryData[storyElements[currentElement].name];
    setStoryData(newStoryData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for mandatory elements (themes and characters)
    if (!prompt && (currentElement === 0 || currentElement === 1)) {
      const elementName = currentElement === 0 ? 'thème' : 'personnage';
      alert(`Veuillez décrire au moins un ${elementName} pour votre histoire`);
      return;
    }

    // Save the current prompt to storyData before moving to next element
    if (prompt) {
      setLoading(true);
      try {
        const response = await axios.post('/api/story-element', {
          element: 'Compile Story',
          prompt: `Écrivez une histoire captivante pour enfants en français en utilisant ces éléments comme guide:
${prompt}

Instructions spécifiques:
- Évitez absolument de commencer par "Il était une fois"
- Privilégiez une ouverture originale et immersive qui plonge directement dans l'action
- L'histoire doit être adaptée aux enfants francophones de 9 à 15 ans
- Évitez les conclusions moralisatrices ou les leçons explicites
- Utilisez un style vivant et contemporain`,
          language: 'French'
        });

        const newStoryData = { ...storyData };
        newStoryData[storyElements[currentElement].name] = response.data.result;
        setStoryData(newStoryData);
        
        // Move to next element
        if (currentElement < storyElements.length - 1) {
          setCurrentElement(currentElement + 1);
          setPrompt(storyData[storyElements[currentElement + 1]?.name] || '');
        } else {
          setCurrentElement(storyElements.length);
        }
      } catch (error) {
        console.error('Erreur de génération:', error);
      }
      setLoading(false);
    }

    // If there's no prompt and the element is optional, just move to next
    if (!prompt && storyElements[currentElement].optional) {
      if (currentElement < storyElements.length - 1) {
        setCurrentElement(currentElement + 1);
        setPrompt(storyData[storyElements[currentElement + 1]?.name] || '');
      } else {
        setCurrentElement(storyElements.length);
      }
    }
  };

  const compileStory = async () => {
    if (!wordCount) {
      alert('Veuillez sélectionner une longueur pour votre histoire');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/story-element', {
        element: 'Compile Story',
        prompt: `Écrivez une histoire captivante pour enfants en français d'environ ${wordCount} mots en utilisant ces éléments comme guide:
${Object.entries(storyData)
  .filter(([_, value]) => value)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Instructions spécifiques:
- Commencez l'histoire par "Titre: [Titre créatif]" sur la première ligne
- Sautez une ligne avant de commencer l'histoire
- Évitez absolument de commencer par "Il était une fois"
- Privilégiez une ouverture originale et immersive qui plonge directement dans l'action
- L'histoire doit être adaptée aux enfants francophones de 9 à 15 ans
- Évitez les conclusions moralisatrices ou les leçons explicites
- Terminez l'histoire de manière naturelle, sans paragraphe de conclusion forcée
- Utilisez un style vivant et contemporain`,
        language: 'French'
      });
      
      router.push({
        pathname: '/story-display',
        query: { story: encodeURIComponent(response.data.result) }
      });
      setIsStoryGenerated(true);
    } catch (error) {
      console.error('Erreur de compilation de l\'histoire:', error);
    }
    setLoading(false);
  };

  // Update the navigation button click handler
  const handleNavigation = (index, element) => {
    const canNavigate = index === 0 || 
      storyElements
        .slice(0, index)
        .filter(el => !el.optional)
        .every(el => storyData[el.name]);
    
    if (canNavigate) {
      setCurrentElement(index);
      // Set prompt to existing value when navigating
      setPrompt(storyData[element.name] || '');
    } else {
      alert('Veuillez d\'abord compléter les éléments obligatoires précédents');
    }
  };

  // Only render the main content after hydration is complete
  if (!isClient) {
    return <div className="min-h-screen zen-bg flex">Loading...</div>;
  }

  return (
    <div className="min-h-screen zen-bg flex">
      {/* Navigation Sidebar - hide on print */}
      <div className="w-64 bg-white/80 backdrop-blur-sm shadow-lg p-6 space-y-4 print:hidden">
        <div className="text-xl font-serif text-gray-700 mb-6 flex items-center gap-2">
          <span className="text-yellow-400">✨</span> Navigation
        </div>
        
        {storyElements.map((element, index) => {
          const status = getElementStatus(index, currentElement, storyData, storyElements);
          return (
            <button
              key={element.name}
              onClick={() => handleNavigation(index, element)}
              className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                status === 'current' 
                  ? 'bg-red-100/50'
                  : status === 'completed'
                  ? 'bg-green-100/50'
                  : status === 'required'
                  ? 'bg-red-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{element.icon}</span>
              <span className="flex-1 font-serif text-lg">{element.name}</span>
              {status === 'completed' && (
                <span className="text-green-600">✓</span>
              )}
              {status === 'required' && (
                <span className="text-red-600">*</span>
              )}
            </button>
          );
        })}
        
        {/* Final Story Button */}
        {Object.keys(storyData).length > 0 && (
          <button
            onClick={() => setCurrentElement(storyElements.length)}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${
              currentElement === storyElements.length
                ? 'bg-red-100/50'
                : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">📚</span>
            <span className="flex-1 font-serif text-lg">Histoire Finale</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header - hide on print */}
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h1 className="text-5xl font-bold text-gray-800 font-serif">
              ✨ Tisseur d'Histoires
            </h1>
            <button
              onClick={resetStory}
              className="py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full flex items-center gap-2 hover:from-purple-800 hover:to-purple-600 transition-all duration-300"
            >
              🔄 Nouvelle Histoire
            </button>
          </div>
          
          <div className="zen-card rounded-3xl p-8 mb-12">
            {currentElement < storyElements.length ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <h2 className="text-3xl font-semibold text-gray-700 mb-6 flex items-center">
                  <span className="text-4xl mr-3">{storyElements[currentElement].icon}</span>
                  {storyElements[currentElement].name}
                </h2>
                
                {storyElements[currentElement].options ? (
                  <div className="space-y-6">
                    <div className="text-gray-700 mb-2">{storyElements[currentElement].optional && '(Optionnel)'}</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {storyElements[currentElement].options.map((option, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setPrompt(option)}
                          className={`p-4 rounded-xl text-left transition-all duration-300 ${
                            prompt === option
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                              : 'border-gray-100 hover:bg-gray-50'
                          } zen-card`}
                        >
                          <div className="font-medium mb-2">{option.split(' - ')[0]}</div>
                          <div className="text-sm text-gray-600">{option.split(' - ')[1]}</div>
                        </button>
                      ))}
                    </div>
                    
                    {storyElements[currentElement].allowCustomInput && (
                      <div className="mt-6">
                        {prompt && (
                          <div className="flex justify-end mb-2">
                            <button
                              type="button"
                              onClick={clearCurrentElement}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 flex items-center font-medium"
                            >
                              <span className="mr-1.5">🗑️</span>
                              Effacer
                            </button>
                          </div>
                        )}
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Décrivez un lieu unique pour votre histoire..."
                          className="w-full p-4 rounded-xl text-lg min-h-[150px] zen-input"
                          rows={6}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {prompt && (
                      <div className="flex justify-end mb-2">
                        <button
                          type="button"
                          onClick={clearCurrentElement}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 flex items-center font-medium"
                        >
                          <span className="mr-1.5">🗑️</span>
                          Effacer
                        </button>
                      </div>
                    )}
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={storyElements[currentElement].prompt}
                      className="w-full p-6 rounded-2xl text-lg min-h-[250px] zen-input"
                      rows={10}
                    />
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={loading || ((currentElement === 0 || currentElement === 1) && !prompt) || (storyElements[currentElement].options && !prompt && !storyElements[currentElement].optional)}
                  className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full flex items-center justify-center gap-2 hover:from-purple-800 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">✨</span>
                  {loading 
                    ? 'Création en cours...' 
                    : currentElement === 0 || currentElement === 1
                      ? 'Continuer l\'aventure' 
                      : prompt || !storyElements[currentElement].optional 
                        ? 'Continuer l\'aventure' 
                        : 'Passer cette étape'
                  }
                </button>
              </form>
            ) : (
              <div className="space-y-8">
                <h2 className="text-3xl font-semibold text-gray-700 mb-6 flex items-center">
                  <span className="text-4xl mr-3">📚</span>
                  Terminer Votre Histoire
                </h2>
                <p className="text-lg text-gray-600">
                  Vous avez rassemblé tous les éléments de votre histoire. 
                  Choisissez la longueur souhaitée, puis tissons-les en quelque chose de magique...
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-700">Longueur de l'histoire :</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {wordCountOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setWordCount(option.value)}
                        className={`p-4 rounded-xl text-left transition-all duration-300 ${
                          wordCount === option.value
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 zen-card' 
                            : 'border-gray-100 hover:bg-gray-50 zen-card'
                        }`}
                      >
                        <div className="font-medium mb-2">{option.value} mots</div>
                        <div className="text-sm text-gray-600">{option.label.split(' - ')[1]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={compileStory} 
                  disabled={loading || !wordCount}
                  className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full flex items-center justify-center gap-2 hover:from-purple-800 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '✨ Création en cours...' : '✨ Tisser Votre Histoire'}
                </button>
                
                {!wordCount && (
                  <p className="text-sm text-red-500 text-center">
                    * Veuillez sélectionner une longueur pour votre histoire
                  </p>
                )}

                {isStoryGenerated && (
                  <div className="flex justify-end print:hidden">
                    <div className="print:hidden">
                      <a href="/story-creator" className="text-gray-500">← Retour au Créateur d'Histoires</a>
                    </div>
                    <button 
                      onClick={printStory}
                      className="print:hidden py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full flex items-center gap-2 hover:from-purple-800 hover:to-purple-600 transition-all duration-300"
                    >
                      <span className="text-xl">🖨️</span>
                      Imprimer l'Histoire
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Story Elements Display */}
          {Object.keys(storyData).length > 0 && (
            <div className="zen-card rounded-3xl p-8 space-y-8 mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-700">✨ Vos Éléments d'Histoire</h2>
              </div>
              {Object.entries(storyData).map(([key, value], index) => {
                const elementIndex = storyElements.findIndex(el => el.name === key);
                return (
                  <div key={key} className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700 text-xl flex items-center">
                        <span className="text-2xl mr-2">{storyElements.find(el => el.name === key)?.icon}</span>
                        {key}
                      </h3>
                      <button
                        onClick={() => {
                          setCurrentElement(elementIndex);
                          setPrompt('');
                        }}
                        className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">{value}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}