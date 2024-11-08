import React from 'react';
import CustomButton from '../../ui/CustomButton';
import { renderFormattedText } from '@/utils/textFormatting';

interface TrueFalseQuestionProps {
  question: {
    question: string;
    userAnswer?: boolean;
    correctAnswer: boolean;
  };
  onAnswer: (answer: boolean) => void;
  showSolution: boolean;
  isCorrect: boolean;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({ question, onAnswer, showSolution, isCorrect }) => {
  return (
    <div className="p-3">
      <h3 
        className="text-sm mb-2"
        dangerouslySetInnerHTML={renderFormattedText(question.question)}
      />
      <div className="flex justify-center space-x-2">
        <CustomButton 
          onClick={() => onAnswer(true)}
          className={`
            px-3 py-1 text-md
            ${question.userAnswer === true ? 'bg-[#D0E8D9]' : 'bg-white text-black border border-gray-300'}
            ${showSolution && question.correctAnswer === true ? 'border-green-500 border-2' : ''}
          `}
          disabled={showSolution}
        >
          True
        </CustomButton>
        <CustomButton 
          onClick={() => onAnswer(false)}
          className={`
            px-3 py-1 text-sm
            ${question.userAnswer === false ? 'bg-[#D0E8D9]' : 'bg-white text-black border border-gray-300'}
            ${showSolution && question.correctAnswer === false ? 'border-green-500 border-2' : ''}
          `}
          disabled={showSolution}
        >
          False
        </CustomButton>
      </div>
      {showSolution && (
        <div className={`mt-2 ${isCorrect ? 'text-green-600' : 'text-red-600'} text-xs`}>
          <span className="font-semibold">Correct answer: </span>
          {question.correctAnswer ? 'True' : 'False'}
        </div>
      )}
    </div>
  );
};

export default TrueFalseQuestion;
