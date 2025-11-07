import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { FlashCard } from './FlashCard';
import { useFlashcardStore, type Flashcard } from '../store/flashcard-store';
import { Plus, Edit, Trash2, BookOpen, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export function FlashcardManager() {
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useFlashcardStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [previewCard, setPreviewCard] = useState<Flashcard | null>(null);
  
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  // const categories = getAvailableCategories().filter(cat => cat !== 'All');

  const resetForm = () => {
    setFormData({
      front: '',
      back: '',
      category: '',
      difficulty: 'medium',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.front.trim() || !formData.back.trim()) {
      toast.error('Please fill in both front and back of the card');
      return;
    }

    if (!formData.category.trim()) {
      toast.error('Please specify a category');
      return;
    }

    if (editingCard) {
      updateFlashcard(editingCard.id, formData);
      toast.success('Flashcard updated successfully!');
      setEditingCard(null);
    } else {
      addFlashcard(formData);
      toast.success('Flashcard added successfully!');
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (card: Flashcard) => {
    setFormData({
      front: card.front,
      back: card.back,
      category: card.category,
      difficulty: card.difficulty,
    });
    setEditingCard(card);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteFlashcard(id);
    toast.success('Flashcard deleted successfully!');
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <Target className="h-4 w-4 text-yellow-600" />;
      case 'hard':
        return <Target className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStats = () => {
    const totalCards = flashcards.length;
    const totalStudied = flashcards.filter(card => card.timesStudied > 0).length;
    const avgCorrectRate = flashcards.length > 0 
      ? Math.round(flashcards.reduce((acc, card) => {
          const rate = card.timesStudied > 0 ? (card.correctCount / card.timesStudied) * 100 : 0;
          return acc + rate;
        }, 0) / flashcards.length)
      : 0;

    return { totalCards, totalStudied, avgCorrectRate };
  };

  const stats = getStats();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCards}</p>
                <p className="text-sm text-gray-600">Total Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalStudied}</p>
                <p className="text-sm text-gray-600">Cards Studied</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 text-purple-600 font-bold text-lg">%</div>
              <div>
                <p className="text-2xl font-bold">{stats.avgCorrectRate}%</p>
                <p className="text-sm text-gray-600">Avg. Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Card Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Flashcards</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add New Card</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCard ? 'Edit Flashcard' : 'Add New Flashcard'}</DialogTitle>
              <DialogDescription>
                {editingCard ? 'Edit your flashcard details.' : 'Create a new flashcard for studying.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question (Front)</label>
                <Textarea
                  value={formData.front}
                  onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                  placeholder="Enter the question or prompt..."
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Answer (Back)</label>
                <Textarea
                  value={formData.back}
                  onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                  placeholder="Enter the answer or explanation..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Math, Science, History..."
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingCard(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCard ? 'Update Card' : 'Add Card'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Flashcards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcards.map((card) => (
          <Card key={card.id} className="relative group">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="secondary">{card.category}</Badge>
                <div className="flex items-center space-x-1">
                  {getDifficultyIcon(card.difficulty)}
                  <span className="text-xs capitalize">{card.difficulty}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Question:</p>
                  <p className="text-sm">{card.front}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Answer:</p>
                  <p className="text-sm">{card.back}</p>
                </div>
              </div>
              
              {card.timesStudied > 0 && (
                <div className="text-xs text-gray-500 mb-3">
                  Studied {card.timesStudied} times • {card.correctCount} correct
                  {card.timesStudied > 0 && (
                    <span> • {Math.round((card.correctCount / card.timesStudied) * 100)}% accuracy</span>
                  )}
                </div>
              )}
              
              <div className="flex justify-between space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewCard(card)}
                  className="flex-1"
                >
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(card)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(card.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {flashcards.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards yet</h3>
            <p className="text-gray-500 mb-4">Create your first flashcard to get started with studying!</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewCard} onOpenChange={() => setPreviewCard(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Card Preview</DialogTitle>
          </DialogHeader>
          {previewCard && (
            <div className="mt-4">
              <FlashCard flashcard={previewCard} showCategory={false} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}