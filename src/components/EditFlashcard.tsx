import React, { useState } from 'react';

interface EditFlashcardProps {
  id: string;
  question: string;
  answer: string;
  onSave: (id: string, updatedQuestion: string, updatedAnswer: string) => void;
  onDelete: (id: string) => void;
}

const EditFlashcard: React.FC<EditFlashcardProps> = ({ id, question, answer, onSave, onDelete }) => {
  const [editQuestion, setEditQuestion] = useState(question);
  const [editAnswer, setEditAnswer] = useState(answer);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(id, editQuestion, editAnswer);
    setIsEditing(false);
  };

  return (
    <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-600 rounded shadow flex justify-between items-center">
      {isEditing ? (
        <>
          <div className="flex w-full space-x-4">
            <textarea
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className="block w-1/2 p-2 border rounded resize-none bg-white dark:bg-gray-700 text-black dark:text-white"
              rows={1}
              aria-label="Question"
              placeholder="Question"
              style={{ minHeight: '2rem', overflow: 'hidden' }}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
              }}
            />
            <textarea
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              className="block w-1/2 p-2 border rounded resize-none bg-white dark:bg-gray-700 text-black dark:text-white"
              rows={1}
              aria-label="Answer"
              placeholder="Answer"
              style={{ minHeight: '2rem', overflow: 'hidden' }}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSave}
            className="ml-4 px-3 py-2 bg-green-700 text-white rounded"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <div className="flex w-full space-x-4">
            <div className="w-1/2">
              <p className="font-bold text-black dark:text-white">{question}</p>
            </div>
            <div className="w-1/2">
              <p className="font-bold text-black dark:text-white">{answer}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="ml-4 px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(id)}
            className="ml-4 px-1 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default EditFlashcard;