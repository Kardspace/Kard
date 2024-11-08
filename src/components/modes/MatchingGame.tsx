import '../../app/globals.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlay, FaInfoCircle } from 'react-icons/fa';
import { Card, CardContent } from '../../components/ui/Card';
import CustomButton from '../../components/ui/CustomButton';
import PerformanceSummary from './mode-components/PerformanceSummary';
import Markdown from 'markdown-to-jsx';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

interface MatchingGameProps {
  cards: Flashcard[];
  deckTitle: string;
}

interface CardItem {
  id: string;
  type: 'term' | 'definition';
  content: string;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ cards, deckTitle }) => {
  const [shuffledCards, setShuffledCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardItem[]>([]);
  const [matchedCards, setMatchedCards] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [shakeCards, setShakeCards] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [records, setRecords] = useState<number[]>([]);

  useEffect(() => {
    const combinedCards: CardItem[] = cards.flatMap(card => [
      { id: card.id, type: 'term', content: card.term },
      { id: card.id, type: 'definition', content: card.definition },
    ]);
    const shuffled = combinedCards.sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [cards]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameEnded) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded]);

  const handleCardClick = (card: CardItem) => {
    if (matchedCards.has(card.id)) return;

    if (selectedCards.length === 2) {
      setSelectedCards([card]);
      setShakeCards(false);
    } else {
      setSelectedCards([...selectedCards, card]);
    }

    if (selectedCards.length === 1) {
      setAttempts(attempts + 1);
      const [firstCard] = selectedCards;
      if (firstCard.id === card.id && firstCard.type !== card.type) {
        setMatchedCards(new Set([...matchedCards, card.id]));
        setSelectedCards([]);
        if (matchedCards.size + 1 === cards.length) {
          setGameEnded(true);
          setRecords([...records, time]);
        }
      } else {
        setTimeout(() => {
          setShakeCards(true);
          setTimeout(() => {
            setSelectedCards([]);
            setShakeCards(false);
          }, 1000);
        }, 500);
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setMatchedCards(new Set());
    setAttempts(0);
    setTime(0);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 w-full m-0 p-0">
      <div className="container mx-auto px-8 py-4 max-w-6xl">
        {!gameStarted && !gameEnded && (
          <div className="fixed inset-0 bg-[#F8F7F6] dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
            <div className="absolute top-6 left-6">
              <Link href="/dashboard" passHref>
                <span className="text-black dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer flex items-center pl-10">
                  <FaArrowLeft className="mr-2" /> Back to Dashboard
                </span>
              </Link>
            </div>
            <Card className="max-w-md w-full">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold mb-2 text-center">{deckTitle}</h1>
                <h2 className="text-xl font-semibold mb-6 text-center">Matching Game</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <FaInfoCircle className="mr-2 text-gray-500" />
                    <p className="text-sm">Match terms with their definitions as quickly as possible.</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Click cards to select
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Pair terms with definitions
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Avoid mistakes to save time
                    </li>
                  </ul>
                </div>
                <CustomButton
                  onClick={startGame}
                  className="w-full flex items-center justify-center"
                >
                  <FaPlay className="mr-2" /> Start Game
                </CustomButton>
              </CardContent>
            </Card>
          </div>
        )}
        {gameEnded && (
          <div className="fixed inset-0 dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
            <div className="absolute top-6 left-6">
              <Link href="/dashboard" passHref>
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer flex items-center">
                  <FaArrowLeft className="mr-2" /> Back
                </span>
              </Link>
            </div>
            <Card className="max-w-md w-full">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold mb-2 text-center">{deckTitle}</h1>
                <h2 className="text-xl font-semibold mb-6 text-center">Game Over</h2>
                <PerformanceSummary
                  totalCards={cards.length}
                  correctAnswers={cards.length}
                  maxStreak={cards.length}
                  retriedCards={attempts - cards.length}
                />
                <div className="mt-8">
                  <CustomButton
                    onClick={startGame}
                    className="w-full flex items-center justify-center"
                  >
                    <FaPlay className="mr-2" /> Play Again
                  </CustomButton>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div className={`game-content ${gameStarted && !gameEnded ? 'transition-curtain' : ''}`}>
          <div className="mb-10">
            <h2 className="text-xl font-bold">{deckTitle}</h2>
          </div>
          <div className="flex items-center mb-4">
            <div className="flex-1">
              <Link href="/dashboard" passHref>
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer flex items-center">
                  <FaArrowLeft className="mr-2" /> Back to Dashboard
                </span>
              </Link>
            </div>
            <p className="text-lg mx-4">Time: {formatTime(time)}</p>
            <div className="flex-1 text-lg font-bold text-emerald-600 text-right">
              {matchedCards.size}/{cards.length} Matched
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {shuffledCards.map((card, index) => {
              const isSelected = selectedCards.includes(card);
              const isMatched = matchedCards.has(card.id);
              return (
                <div key={index} className="aspect-w-1 aspect-h-1">
                  <CustomButton
                    onClick={() => handleCardClick(card)}
                    className={`h-full w-full flex items-center justify-center text-center
                      ${isMatched ? 'bg-green-500 text-white' : 
                      isSelected ? 'bg-blue-500 text-white' : 
                      'bg-white text-black border border-gray-300'}
                      ${shakeCards && isSelected ? 'animate-rotate-shake bg-red-500 text-white' : ''}`}
                    disabled={isMatched}
                  >
                    <div className="text-sm overflow-auto">
                      <Markdown
                        options={{
                          overrides: {
                            strong: { component: 'strong', props: { className: 'font-bold' } },
                            em: { component: 'em', props: { className: 'italic' } },
                            u: { component: 'u', props: { className: 'underline' } },
                          },
                        }}
                      >
                        {card.content}
                      </Markdown>
                    </div>
                  </CustomButton>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500" 
              style={{ width: `${(matchedCards.size / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default MatchingGame;