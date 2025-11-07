import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StudySession } from './StudySession';
import { FlashcardManager } from './FlashcardManager';
import { useFlashcardStore } from '../store/flashcard-store';
import { 
  BookOpen, 
  Settings, 
  Play, 
  GraduationCap, 
  BarChart3,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

type ViewMode = 'home' | 'study' | 'manage';

export function StudyApp() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const {
    flashcards,
    isStudying,
    selectedCategory,
    setCategory,
    startStudySession,
    getAvailableCategories,
    getFilteredCards,
  } = useFlashcardStore();

  const categories = getAvailableCategories();
  const filteredCards = getFilteredCards();

  const handleStartStudy = () => {
    if (filteredCards.length === 0) {
      toast.error('No flashcards available for study. Please add some cards first!');
      return;
    }
    
    startStudySession(selectedCategory === 'All' ? undefined : selectedCategory);
    setCurrentView('study');
    toast.success(`Starting study session with ${filteredCards.length} cards!`);
  };

  const getStats = () => {
    const totalCards = flashcards.length;
    const totalStudied = flashcards.filter(card => card.timesStudied > 0).length;
    const categoriesCount = categories.length - 1; // Exclude "All"
    
    return { totalCards, totalStudied, categoriesCount };
  };

  const stats = getStats();

  // If currently studying, show the study session
  if (isStudying && currentView === 'study') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentView('home');
              }}
              className="mb-4"
            >
              ← Back to Home
            </Button>
          </div>
          <StudySession />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">StudyCards</h1>
                <p className="text-sm text-gray-600">Master any subject with flashcards</p>
              </div>
            </div>

            <nav className="flex space-x-2">
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button
                variant={currentView === 'manage' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('manage')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Cards</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="max-w-4xl mx-auto">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalCards}</p>
                      <p className="text-sm text-gray-600">Total Cards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalStudied}</p>
                      <p className="text-sm text-gray-600">Cards Studied</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Filter className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.categoriesCount}</p>
                      <p className="text-sm text-gray-600">Categories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Study Section */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Ready to Study?</h2>
                    <p className="text-gray-600">
                      Choose a category and start practicing your flashcards
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category} 
                            {category !== 'All' && (
                              <span className="text-gray-500 ml-1">
                                ({flashcards.filter(c => c.category === category).length})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''} available for study
                  </div>

                  <Button
                    onClick={handleStartStudy}
                    disabled={filteredCards.length === 0}
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Study Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="text-xl font-semibold">Manage Your Cards</h3>
                    <p className="text-gray-600">
                      Add, edit, or delete flashcards to customize your study material
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentView('manage')}
                      className="w-full"
                    >
                      Manage Cards
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="text-xl font-semibold">Study Tips</h3>
                    <div className="text-sm text-gray-600 space-y-2 text-left">
                      <p>• Study regularly for better retention</p>
                      <p>• Focus on difficult cards more often</p>
                      <p>• Take breaks between study sessions</p>
                      <p>• Review cards multiple times</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'manage' && <FlashcardManager />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>StudyCards - Your personal flashcard study companion</p>
          </div>
        </div>
      </footer>
    </div>
  );
}