import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Markdown from 'markdown-to-jsx';

interface Card {
  id: string;
  question: string;
  answer: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

const initialColumns: Column[] = [
  {
    id: 'column-1',
    title: 'Math',
    cards: [
      { id: 'card-1', question: 'What is 2 + 2?', answer: '4' },
      { id: 'card-2', question: 'What is the square root of 16?', answer: '4' },
      { id: 'card-3', question: 'What is 5 x 7?', answer: '35' },
    ],
  },
  {
    id: 'column-2',
    title: 'Chemistry',
    cards: [
      { id: 'card-4', question: 'What is the chemical symbol for water?', answer: 'H<sub>2</sub>O' },
      { id: 'card-5', question: 'What is the difference between a sigma bond (σ bond) and a pi bond (π bond) in molecular orbital theory?', 
        answer: 'A sigma bond (σ bond) is formed by the direct overlap of atomic orbitals along the internuclear axis, leading to stronger bonding... ' },
    ],
  },
  {
    id: 'column-3',
    title: 'Fun Facts',
    cards: [
      { id: 'card-6', question: 'What is the largest organ in the human body?', answer: 'The skin.' },
      { id: 'card-7', question: 'Which planet in our solar system has the strongest winds?', answer: 'Neptune, with wind speeds reaching up to 1,200 miles per hour (2,000 kilometers per hour).' },
    ],
  },
];

const DragAndDropDemo: React.FC = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    // Moved within the same list
    if (source.droppableId === destination.droppableId) {
      const column = columns.find(col => col.id === source.droppableId);
      if (!column) return;

      const newCards = Array.from(column.cards);
      const [reorderedItem] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, reorderedItem);

      const newColumns = columns.map(col =>
        col.id === source.droppableId ? { ...col, cards: newCards } : col
      );

      setColumns(newColumns);
    } else {
      // Moved to a different list
      const sourceColumn = columns.find(col => col.id === source.droppableId);
      const destColumn = columns.find(col => col.id === destination.droppableId);
      if (!sourceColumn || !destColumn) return;

      const sourceCards = Array.from(sourceColumn.cards);
      const destCards = Array.from(destColumn.cards);
      const [movedItem] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedItem);

      const newColumns = columns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, cards: sourceCards };
        }
        if (col.id === destination.droppableId) {
          return { ...col, cards: destCards };
        }
        return col;
      });

      setColumns(newColumns);
    }
  };

  const handleFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        {columns.map(column => (
          <div key={column.id} className="w-full sm:w-1/3">
            <h3 className="text-lg font-semibold mb-2">{column.title}</h3>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-100 p-2 rounded min-h-[200px]"
                >
                  {column.cards.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`draggable border-2 border-black dark:border-gray-600 rounded-sm p-1 mb-1 relative bg-white dark:bg-gray-800 ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="absolute inset-0 cursor-grab active:cursor-grabbing"
                          />
                          <div className="rounded p-2 relative z-10 pointer-events-none">
                            <div className="p-2 text-black dark:text-black text-sm sm:text-base">
                              <Markdown>
                                {flippedCards.has(card.id) ? card.answer : card.question}
                              </Markdown>
                            </div>
                          </div>
                          <button
                            onClick={() => handleFlip(card.id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full z-20 flex items-center justify-center text-white text-xs"
                            title="Flip card"
                          >
                            ↻
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default DragAndDropDemo;