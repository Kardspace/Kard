import React, { useState, useEffect } from 'react';
import { renderFormattedText } from '@/utils/textFormatting';

interface FillInTheBlankQuestionProps {
  question: {
    question: string;
    userAnswer?: string;
    correctAnswer: string;
  };
  onAnswer: (answer: string) => void;
  showSolution: boolean;
  isCorrect: boolean;
}

const FillInTheBlankQuestion: React.FC<FillInTheBlankQuestionProps> = ({ question, onAnswer, showSolution, isCorrect }) => {
  const [answer, setAnswer] = useState(question.userAnswer || '');

  useEffect(() => {
    setAnswer(question.userAnswer || '');
  }, [question.userAnswer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswer = e.target.value;
    setAnswer(newAnswer);
    onAnswer(newAnswer);
  };

  return (
    <div className="p-3">
      <h3 
        className="text-sm mb-2"
        dangerouslySetInnerHTML={renderFormattedText(question.question)}
      />
      <input
        type="text"
        value={answer}
        onChange={handleChange}
        className={`
          border rounded px-2 py-1 w-full text-sm {/* Smaller padding and text */}
          ${answer ? 'bg-[#D0E8D9]' : 'border-gray-300'}
          ${showSolution ? (isCorrect ? 'border-green-500' : 'border-red-500') + ' border-2' : ''}
        `}
        placeholder="Type your answer here"
        disabled={showSolution}
      />
      {showSolution && (
        <div className={`mt-2 ${isCorrect ? 'text-green-600' : 'text-red-600'} text-xs`}> {/* Smaller text */}
          <span className="font-semibold">Correct answer: </span>
          <span dangerouslySetInnerHTML={renderFormattedText(question.correctAnswer)} />
        </div>
      )}
    </div>
  );
};

export default FillInTheBlankQuestion;
