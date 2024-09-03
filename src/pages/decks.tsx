import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import SketchPickerWrapper from '../components/SketchPickerWrapper';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import useDOMNodeInserted from '../hooks/useDOMNodeInserted';
import NavMenu from '../components/NavMenu';
import { useToast } from "@/components/ui/use-toast";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  tags: Tag[];
  order: number;
}

const DecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckTags, setNewDeckTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#000000');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all'); 
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const fetchDecks = useCallback(async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch(`/api/decks?userId=${session.user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }

      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleCreateDeck = async () => {
    if (!newDeckName || !newDeckDescription) {
      console.error('Deck name and description are required');
      return;
    }

    if (newDeckName.length > 20) {
      toast({
        title: "Error",
        description: "Deck name must be 20 characters or less",
        variant: "destructive",
      });
      return;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newDeckName,
          description: newDeckDescription,
          userId: session.user.id,
          tags: newDeckTags,
          isPublic: isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deck');
      }

      const newDeck = await response.json();
      setDecks((prevDecks) => [...prevDecks, newDeck]);
      setNewDeckName('');
      setNewDeckDescription('');
      setNewDeckTags([]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    if (isEditDialogOpen && editingDeck) {
      setEditingDeck((prevDeck) => {
        if (!prevDeck) return prevDeck;
        return {
          ...prevDeck,
          tags: [...prevDeck.tags, { id: 0, name: newTagName, color: newTagColor }],
        };
      });
    } else {
      setNewDeckTags([...newDeckTags, { id: 0, name: newTagName, color: newTagColor }]);
    }
    setNewTagName('');
    setNewTagColor('#000000');
  };

  const handleDeleteTag = (tagIndex: number) => {
    setNewDeckTags((prevTags) => prevTags.filter((_, index) => index !== tagIndex));
  };

  const handleDeleteEditingTag = (tagIndex: number) => {
    if (!editingDeck) return;
    setEditingDeck((prevDeck) => {
      if (!prevDeck) return prevDeck;
      return {
        ...prevDeck,
        tags: prevDeck.tags.filter((_, index) => index !== tagIndex),
      };
    });
  };

  const handleDeleteDeck = async (deckId: string) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch(`/api/decks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deckId, userId: session.user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete deck');
      }

      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  const handleEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDeck = async () => {
    if (!editingDeck) {
      console.error('No deck to update');
      return;
    }
  
    if (editingDeck.name.length > 20) {
      toast({
        title: "Error",
        description: "Deck name must be 20 characters or less",
        variant: "destructive",
      });
      return;
    }
  
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }
  
    try {
      const response = await fetch(`/api/decks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deckId: editingDeck.id,
          name: editingDeck.name,
          description: editingDeck.description,
          userId: session.user.id,
          tags: editingDeck.tags,
          isPublic: isPublic,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update deck');
      }
  
      const updatedDeck = await response.json();
      setDecks((prevDecks) => prevDecks.map((deck) => (deck.id === updatedDeck.id ? updatedDeck : deck)));
      setEditingDeck(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Deck updated successfully",
      });
    } catch (error) {
      console.error('Error updating deck:', error);
      toast({
        title: "Error",
        description: "Failed to update deck. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredDecks = decks.filter(
    (deck) =>
      deck &&
      deck.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTag === 'all' || deck.tags.some(tag => tag.name === selectedTag))
  );

  const uniqueTags = Array.from(new Set(decks.flatMap(deck => deck.tags.map(tag => tag.name))));

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reorderedDecks = Array.from(decks);
    const [movedDeck] = reorderedDecks.splice(result.source.index, 1);
    reorderedDecks.splice(result.destination.index, 0, movedDeck);

    // Update the order of the decks
    const updatedDecks = reorderedDecks.map((deck, index) => ({
      ...deck,
      order: index + 1,
    }));

    try {
      const response = await fetch('/api/decks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decks: updatedDecks }),
      });

      if (!response.ok) {
        throw new Error('Failed to update deck order');
      }

      // Update the local state with the new order
      setDecks(updatedDecks);
    } catch (error) {
      console.error('Error updating deck order:', error);
      // Optionally, revert the local state if the API call fails
      setDecks(decks);
    }
  };

  useDOMNodeInserted((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
      }
    }
  });

  const handleDeckSelect = (deckId: string) => {
    setSelectedDeckId(deckId);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-gray-800 flex">
      <NavMenu onDeckSelect={handleDeckSelect} />
      <div className="flex-1 pl-64">
        <header className="bg-gray dark:bg-gray-800">
          {/* Remove the existing header content */}
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mt-16">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
              <div className="relative w-full sm:w-auto flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white" />
                <Input
                  type="text"
                  placeholder="Search Decks"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full bg-white dark:bg-gray-800 border-1 border-black dark:border-gray-600"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-1 border-black dark:border-gray-600">
                    <SelectValue placeholder="Filter by Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {uniqueTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="whitespace-nowrap"><Plus className="h-4 w-4 mr-2" /> Create Deck</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Deck</DialogTitle>
                      <DialogDescription>Add a new deck to your collection.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Deck Name"
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                      />
                      <Input
                        placeholder="Deck Description"
                        value={newDeckDescription}
                        onChange={(e) => setNewDeckDescription(e.target.value)}
                      />
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="tag-name" className="sr-only">Tag Name</label>
                            <input
                              type="text"
                              id="tag-name"
                              placeholder="Tag Name"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              className="p-2 border-2 border-black dark:border-gray-600 rounded"
                            />
                            <Button onClick={handleAddTag}>Add Tag</Button>
                          </div>
                          <SketchPickerWrapper
                            color={newTagColor}
                            onChangeComplete={(color) => setNewTagColor(color.hex)}
                            className="ml-4"
                          />
                        </div>
                      </div>
                      <div>
                        {newDeckTags.map((tag, index) => (
                          <span key={index} className={`inline-flex items-center text-gray-800 text-xs px-2 py-1 rounded mr-2`} style={{ backgroundColor: tag.color }}>
                            {tag.name}
                            <button onClick={() => handleDeleteTag(index)} className="ml-2 text-red-500 flex items-center justify-center">
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                          Make this deck public
                        </label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateDeck}>Create Deck</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={fetchDecks} className="whitespace-nowrap">
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
              </div>
            </div>
          </div>
          {filteredDecks.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No decks found. Create a new deck to get started.</p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="decks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredDecks.map((deck, index) => (
                      deck && deck.id ? (
                        <Draggable key={deck.id} draggableId={deck.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-shadow duration-300 ${
                                deck.id === selectedDeckId ? 'border-2 border-blue-500' : ''
                              }`}
                            >
                              <Card className="hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-700">
                                <CardHeader>
                                  <CardTitle className="text-black dark:text-gray-100 text-lg sm:text-xl">{deck.name}</CardTitle>
                                  <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                                    {deck.description}
                                  </CardDescription>
                                  <div className="mt-2 flex flex-wrap">
                                    {deck.tags.map((tag) => (
                                      <span key={tag.id} className="inline-block text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2" style={{ backgroundColor: tag.color }}>
                                        {tag.name}
                                      </span>
                                    ))}
                                  </div>
                                </CardHeader>
                                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                                  <Link href={`/decks/${deck.id}`}>
                                    <Button variant="outline" className="text-black dark:text-gray-200 w-full sm:w-auto">View Deck</Button>
                                  </Link>
                                  <div className="flex space-x-2 w-full sm:w-auto">
                                    <Button
                                      variant="outline"
                                      onClick={() => handleEditDeck(deck)}
                                      className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 flex-grow sm:flex-grow-0"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleDeleteDeck(deck.id)}
                                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ) : null
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </main>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Deck</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Deck Name"
                value={editingDeck?.name || ''}
                onChange={(e) => setEditingDeck((prevDeck) => prevDeck ? { ...prevDeck, name: e.target.value } : prevDeck)}
              />
              <Input
                placeholder="Deck Description"
                value={editingDeck?.description || ''}
                onChange={(e) => setEditingDeck((prevDeck) => prevDeck ? { ...prevDeck, description: e.target.value } : prevDeck)}
              />
              <div className="flex flex-col space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="tag-name" className="sr-only">Tag Name</label>
                    <input
                      type="text"
                      id="tag-name"
                      placeholder="Tag Name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="p-2 border-2 border-black dark:border-gray-600 rounded"
                    />
                    <Button onClick={handleAddTag}>Add Tag</Button>
                  </div>
                  <SketchPickerWrapper
                    color={newTagColor}
                    onChangeComplete={(color) => setNewTagColor(color.hex)}
                    className="ml-4"
                  />
                </div>
              </div>
              <div>
                {editingDeck?.tags.map((tag, index) => (
                  <span key={index} className={`inline-flex items-center text-gray-800 text-xs px-2 py-1 rounded mr-2`} style={{ backgroundColor: tag.color }}>
                    {tag.name}
                    <button onClick={() => handleDeleteEditingTag(index)} className="ml-2 text-red-500 flex items-center justify-center">
                      x
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                  Make this deck public
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateDeck}>Update Deck</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DecksPage;