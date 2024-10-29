import React, { useRef } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { BsFiletypeCsv, BsFiletypePdf, BsFiletypeDocx } from "react-icons/bs";
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Flashcard, FlashcardInput } from '@/types/flashcard';
import { SiQuizlet } from "react-icons/si";

interface FlashcardImportModalProps {
  onClose: () => void;
  onFlashcardsAdded: (flashcards: Flashcard[]) => void;
  userId: string;
  deckId: string;
}

const fileImportOptions = [
  {
    id: 'csv',
    label: 'CSV File',
    icon: <BsFiletypeCsv className="w-10 h-10 ml-1 text-green-600" />,
    accept: '.csv',
    description: 'Import from a CSV file with question and answer columns'
  },
  {
    id: 'pdf',
    label: 'PDF Document',
    icon: <BsFiletypePdf className="w-10 h-10 ml-1 text-red-600" />,
    accept: '.pdf',
    description: 'Extract flashcards from PDF documents automatically'
  },
  {
    id: 'word',
    label: 'Word Document',
    icon: <BsFiletypeDocx className="w-10 h-10 ml-1 text-blue-600" />,
    accept: '.doc,.docx',
    description: 'Import from Word documents with formatted Q&A'
  }
];

const cloudImportOptions = [
  {
    id: 'drive',
    label: 'Google Drive',
    icon: <Icon icon="logos:google-drive" className="w-10 h-10 ml-1" />,
    description: 'Import directly from your Google Drive',
    comingSoon: true
  },
  {
    id: 'quizlet',
    label: 'Quizlet',
    icon: <SiQuizlet className="w-10 h-10 ml-1 text-[#4257B2]" />,
    description: 'Import your existing Quizlet sets',
    comingSoon: true
  }
];

const MAX_CHAR_LIMIT = 930;

export const FlashcardImportModal: React.FC<FlashcardImportModalProps> = ({
  onClose,
  onFlashcardsAdded,
  userId,
  deckId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileType = file.name.split('.').pop()?.toLowerCase();

      switch (fileType) {
        case 'csv':
          handleCsvUpload(file);
          break;
        case 'pdf':
          handlePdfUpload(file);
          break;
        case 'doc':
        case 'docx':
          handleWordUpload(file);
          break;
        default:
          toast.error('Unsupported file format');
      }
    }
  };

  const handleCsvUpload = (file: File) => {
    Papa.parse(file, {
      complete: async (results) => {
        const data = results.data as string[][];
        if (data.length === 0) {
          toast.error('The CSV file is empty.');
          return;
        }

        // Find question and answer column indices
        const headers = data[0].map(header => header.toLowerCase().trim());
        const questionIndex = headers.findIndex(header => 
          header.includes('question') || header.includes('front'));
        const answerIndex = headers.findIndex(header => 
          header.includes('answer') || header.includes('back'));

        if (questionIndex === -1 || answerIndex === -1) {
          toast.error('CSV must have columns for questions and answers.');
          return;
        }

        // Process the rows
        const flashcards = data.slice(1)
          .filter(row => row[questionIndex] && row[answerIndex]) // Skip empty rows
          .map(row => ({
            question: row[questionIndex].trim(),
            answer: row[answerIndex].trim()
          }))
          .filter(card => 
            card.question.length <= MAX_CHAR_LIMIT && 
            card.answer.length <= MAX_CHAR_LIMIT
          );

        if (flashcards.length === 0) {
          toast.error('No valid flashcards found in the CSV file.');
          return;
        }

        saveFlashcards(flashcards);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast.error('Failed to parse CSV file. Please check the file format.');
      }
    });
  };

  const handlePdfUpload = (file: File) => {
    // TODO: Implement PDF processing
    toast.info('PDF import functionality coming soon!');
  };

  const handleWordUpload = (file: File) => {
    // TODO: Implement Word document processing
    toast.info('Word document import functionality coming soon!');
  };

  const saveFlashcards = async (flashcards: FlashcardInput[]): Promise<Flashcard[]> => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcards: flashcards.map(card => ({
            ...card,
            userId,
            deckId
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save flashcards');
      }

      const savedFlashcards: Flashcard[] = await response.json();
      toast.success('Flashcards imported successfully!');
      onFlashcardsAdded(savedFlashcards);
      onClose();
      return savedFlashcards;
    } catch (error) {
      console.error('Error saving flashcards:', error);
      toast.error('Failed to import flashcards. Please try again.');
      return [];
    }
  };

  const handleOptionClick = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-all"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Flashcards
            </h2>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
            >
              Close
            </button>
          </div>

          {/* File Import Section */}
          <div className="mb-6">
            <div className="space-y-4">
              {fileImportOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleOptionClick(option.accept)}
                  className="flex items-center p-4 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {option.icon}
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="question-and-answer-columns" className="text-gray-400 hover:text-gray-500">
                          <FaQuestionCircle className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {option.id === 'csv' && "CSV file should have columns for questions and answers"}
                          {option.id === 'pdf' && "PDF should have clear question and answer sections"}
                          {option.id === 'word' && "Word document should have formatted Q&A pairs"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Import Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Import from Cloud
            </h3>
            <div className="space-y-4">
              {cloudImportOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 relative"
                >
                  {option.icon}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p className="flex items-center">
              <Icon icon="material-symbols:info-outline" className="mr-2" />
              Supported formats: CSV, PDF, and Word documents
            </p>
          </div>

          <input
            aria-label="upload-file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default FlashcardImportModal;