import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FlashCard } from './FlashCard';
import { useFlashcardStore } from '../store/flashcard-store';
import { CheckCircle, XCircle, RotateCcw, Trophy, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export function StudySession() {
  const {
    isStudying,
    currentSession,
    currentCardIndex,
    getFilteredCards,
    markCardStudied,
    nextCard,
    endStudySession,
  } = useFlashcardStore();

  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswerButtons, setShowAnswerButtons] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const filteredCards = getFilteredCards();
  const currentCard = filteredCards[currentCardIndex];

  useEffect(() => {
    if (isStudying && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
  }, [isStudying, sessionStartTime]);

  const handleFlip = (flipped: boolean) => {
    setIsFlipped(flipped);
    if (flipped) {
      setShowAnswerButtons(true);
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (currentCard) {
      markCardStudied(currentCard.id, correct);
      
      if (correct) {
        toast.success('Correct! Well done!');
      } else {
        toast.error('Incorrect, but keep practicing!');
      }

      setTimeout(() => {
        if (currentCardIndex < filteredCards.length - 1) {
          nextCard();
          setIsFlipped(false);
          setShowAnswerButtons(false);
        } else {
          // Session completed
          endStudySession();
          toast.success('Study session completed!');
        }
      }, 1000);
    }
  };

  const handleEndSession = () => {
    endStudySession();
    setSessionStartTime(null);
    toast.success('Study session ended');
  };

  const getSessionDuration = () => {
    if (!sessionStartTime) return '0:00';
    const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isStudying || !currentSession) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No Active Study Session</CardTitle>
          <CardDescription>
            Start a new study session to begin practicing your flashcards.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (currentCardIndex >= filteredCards.length) {
    const accuracy = currentSession.totalCards > 0 
      ? Math.round((currentSession.correctAnswers / currentSession.totalCards) * 100)
      : 0;

    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle>Session Complete!</CardTitle>
          <CardDescription>Great job studying today!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{currentSession.totalCards}</p>
              <p className="text-sm text-gray-600">Cards Studied</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {currentSession.correctAnswers} correct out of {currentSession.totalCards}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCard) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No Cards Available</CardTitle>
          <CardDescription>
            Add some flashcards to start studying.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const progress = ((currentCardIndex + 1) / filteredCards.length) * 100;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Session Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{getSessionDuration()}</span>
            </div>
            <div className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {filteredCards.length}
            </div>
          </div>
          
          <Progress value={progress} className="mb-2" />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress: {Math.round(progress)}%</span>
            <span>Correct: {currentSession.correctAnswers}/{currentSession.studiedCards}</span>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <FlashCard 
        flashcard={currentCard} 
        onFlip={handleFlip}
        className="mb-6"
      />

      {/* Action Buttons */}
      <div className="space-y-4">
        {showAnswerButtons && isFlipped ? (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="destructive"
              onClick={() => handleAnswer(false)}
              className="flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
              <span>Incorrect</span>
            </Button>
            <Button
              variant="default"
              onClick={() => handleAnswer(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Correct</span>
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            {!isFlipped ? 'Click the card to reveal the answer' : 'Rate your answer'}
          </div>
        )}
        
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsFlipped(false);
              setShowAnswerButtons(false);
            }}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Card</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleEndSession}
          >
            End Session
          </Button>
        </div>
      </div>
    </div>
  );
}