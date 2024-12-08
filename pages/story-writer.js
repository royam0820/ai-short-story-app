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

    // If there's no prompt and the element is optional, just move to next
    if (!prompt && storyElements[currentElement].optional) {
      if (currentElement < storyElements.length - 1) {
        setCurrentElement(currentElement + 1);
        // Set prompt to existing value when navigating
        setPrompt(storyData[storyElements[currentElement + 1]?.name] || '');
      } else {
        setCurrentElement(storyElements.length);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/story-element', { 
        element: storyElements[currentElement].name, 
        prompt: storyElements[currentElement].name === 'Lieux' ? `Décrivez le lieu: ${prompt}` : prompt,
        language: 'French'
      });
      
      const newStoryData = { ...storyData };
      newStoryData[storyElements[currentElement].name] = response.data.result;
      setStoryData(newStoryData);
      
      if (currentElement < storyElements.length - 1) {
        setCurrentElement(currentElement + 1);
        // Set prompt to existing value when navigating
        setPrompt(storyData[storyElements[currentElement + 1]?.name] || '');
      } else {
        setCurrentElement(storyElements.length);
      }
    } catch (error) {
      console.error('Erreur de génération de l\'élément de l\'histoire:', error);
    }
    setLoading(false);
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
      {/* Navigation Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-sm shadow-lg p-6 space-y-4">
        <div className="text-xl font-semibold text-gray-700 mb-6">
          ✨ Navigation
        </div>
        
        {storyElements.map((element, index) => {
          const status = getElementStatus(index, currentElement, storyData, storyElements);
          return (
            <button
              key={element.name}
              onClick={() => handleNavigation(index, element)}
              className={`w-full text-left p-3 rounded-xl flex items-center transition-all duration-200 ${
                status === 'current' 
                  ? 'nav-item-current'
                  : status === 'completed'
                  ? 'nav-item-completed'
                  : status === 'required'
                  ? 'nav-item-required'
                  : 'nav-item-pending'
              }`}
            >
              <span className="nav-item-icon">{element.icon}</span>
              <span className="flex-1 font-medium">{element.name}</span>
              {status === 'completed' && (
                <span className="nav-status-icon text-green-600">✓</span>
              )}
              {status === 'required' && (
                <span className="nav-status-icon text-red-600">*</span>
              )}
            </button>
          );
        })}
        
        {/* Final Story Button */}
        {Object.keys(storyData).length > 0 && (
          <button
            onClick={() => setCurrentElement(storyElements.length)}
            className={`w-full text-left p-3 rounded-xl flex items-center transition-all duration-200 ${
              currentElement === storyElements.length
                ? 'nav-item-current'
                : 'nav-item-pending'
            }`}
          >
            <span className="nav-item-icon">📚</span>
            <span className="flex-1 font-medium">Histoire Finale</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 font-serif">
              ✨ Tisseur d'Histoires
            </h1>
            <button
              onClick={resetStory}
              className="py-3 px-6 rounded-xl text-white zen-button"
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
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-gray-700">Ou décrivez votre propre lieu :</div>
                          {prompt && (
                            <button
                              type="button"
                              onClick={clearCurrentElement}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 flex items-center font-medium"
                            >
                              <span className="mr-1.5">🗑️</span>
                              Effacer
                            </button>
                          )}
                        </div>
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
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-gray-700">{storyElements[currentElement].optional && '(Optionnel)'}</div>
                      {prompt && (
                        <button
                          type="button"
                          onClick={clearCurrentElement}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 flex items-center font-medium"
                        >
                          <span className="mr-1.5">🗑️</span>
                          Effacer
                        </button>
                      )}
                    </div>
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
                  className="w-full py-4 px-8 rounded-2xl text-xl font-medium text-white zen-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading 
                    ? '✨ Création en cours...' 
                    : currentElement === 0 || currentElement === 1
                      ? '✨ Continuer l\'aventure' 
                      : prompt || !storyElements[currentElement].optional 
                        ? '✨ Continuer l\'aventure' 
                        : '✨ Passer cette étape'
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
                  className="w-full py-4 px-8 rounded-2xl text-xl font-medium text-white zen-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '✨ Création en cours...' : '✨ Tisser Votre Histoire'}
                </button>
                
                {!wordCount && (
                  <p className="text-sm text-red-500 text-center">
                    * Veuillez sélectionner une longueur pour votre histoire
                  </p>
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