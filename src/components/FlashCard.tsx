import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import type { Flashcard } from '../store/flashcard-store';

interface FlashCardProps {
  flashcard: Flashcard;
  onFlip?: (isFlipped: boolean) => void;
  showCategory?: boolean;
  className?: string;
}

export function FlashCard({ flashcard, onFlip, showCategory = true, className = '' }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    onFlip?.(newFlippedState);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`[perspective:1000px] ${className}`}>
      <div
        className={`relative w-full h-64 [transform-style:preserve-3d] transition-transform duration-500 cursor-pointer ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front of card */}
        <Card className="absolute inset-0 [backface-visibility:hidden]">
          <CardContent className="flex flex-col justify-between h-full p-6">
            <div className="flex justify-between items-start mb-4">
              {showCategory && (
                <Badge variant="secondary" className="text-xs">
                  {flashcard.category}
                </Badge>
              )}
              <Badge className={`text-xs ${getDifficultyColor(flashcard.difficulty)}`}>
                {flashcard.difficulty}
              </Badge>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-medium text-center">{flashcard.front}</p>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Click to reveal answer
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardContent className="flex flex-col justify-between h-full p-6">
            <div className="flex justify-between items-start mb-4">
              {showCategory && (
                <Badge variant="secondary" className="text-xs">
                  {flashcard.category}
                </Badge>
              )}
              <Badge className={`text-xs ${getDifficultyColor(flashcard.difficulty)}`}>
                {flashcard.difficulty}
              </Badge>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg text-center">{flashcard.back}</p>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Click to go back to question
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}