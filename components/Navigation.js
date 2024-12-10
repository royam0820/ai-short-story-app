export default function Navigation() {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">✨</span>
        Navigation
      </h2>
      <div className="space-y-2">
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 border border-green-100">
          <span className="text-lg">💡</span>
          <span className="text-gray-800">Thèmes</span>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
          <span className="text-lg">👤</span>
          <span className="text-gray-800">Personnages</span>
          <span className="ml-auto text-red-500">*</span>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
          <span className="text-lg">🏰</span>
          <span className="text-gray-800">Lieux</span>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
          <span className="text-lg">📜</span>
          <span className="text-gray-800">Intrigue</span>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
          <span className="text-lg">⚔️</span>
          <span className="text-gray-800">Conflit</span>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
          <span className="text-lg">✨</span>
          <span className="text-gray-800">Résolution</span>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
          <span className="text-lg">📚</span>
          <span className="text-gray-800">Histoire Finale</span>
        </div>
      </div>
    </nav>
  );
} 