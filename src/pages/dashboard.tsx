import '../app/globals.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import UserAvatar from '../components/UserAvatar';
import { getMicahAvatarSvg } from '../utils/avatar';
import { SiStagetimer } from "react-icons/si";
import { RiTimerFill } from "react-icons/ri";
import { PiCardsFill } from "react-icons/pi";
import NavMenu from '../components/NavMenu';
import FlashcardComponent from '../components/Flashcard';
import { toast, useToast } from '../components/ui/use-toast';
import { Toaster } from '../components/ui/toaster';
import MatchingGame from '../components/MatchingGame';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { dismiss } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error('No active session found.');
        router.push('/signin');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          console.error('No user data found for this ID');
        } else {
          console.error('Error fetching user data:', userError);
        }
      } else {
        userData.avatarUrl = getMicahAvatarSvg(userData.email);
        setUser(userData);
      }

      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .eq('userId', session.user.id);

      if (decksError) {
        console.error('Error fetching decks:', decksError);
      } else {
        setDecks(decksData);
        if (decksData.length > 0) {
          setSelectedDeckId(decksData[0].id);
        }
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/signin');
      } else {
        const fetchUserData = async () => {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session?.user.id)
            .single();

          if (error) {
            console.error('Error fetching user data:', error);
          } else {
            userData.avatarUrl = getMicahAvatarSvg(userData.email);
            setUser(userData);
          }
        };

        fetchUserData();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Account Deletion Disabled',
      description: 'Account deletion is currently disabled.',
      action: (
        <button
          onClick={() => dismiss()}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          OK
        </button>
      ),
    });
  };

  const handleLearnClick = () => {
    toast({
      title: 'Coming Soon!',
      description: 'The Learn feature is coming soon.',
    });
  };

  const handleTestClick = () => {
    toast({
      title: 'Coming Soon!',
      description: 'The Test feature is coming soon.',
    });
  };

  const handleMatchClick = () => {
    if (selectedDeckId) {
      router.push(`/matching-game/${user.id}/${selectedDeckId}`);
    } else {
      toast({
        title: 'No Deck Selected',
        description: 'Please select a deck to play the matching game.',
      });
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <header className="w-full background bg-white-700 text-black p-4 flex justify-between items-center relative">
        <NavMenu />
        <div className="absolute top-4 right-8 flex items-center">
          {user.avatarUrl && (
            <div className="relative" ref={dropdownRef}>
              <UserAvatar
                avatarSvg={user.avatarUrl}
                alt="User Avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-2 mt-6 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                  >
                    Delete Account
                  </button>
                  <div className="border-t border-gray-200">
                    <p className="block w-full text-left px-4 py-2 text-sm text-gray-700">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow p-4 mt-12">
        {decks.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-2">
            <button
              className="flex items-center space-x-4 bg-white shadow-md rounded-lg p-4 h-12 hover:bg-gray-100"
              onClick={handleLearnClick}
            >
              <SiStagetimer className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
              <span className="text-xl font-semibold mb-1">Learn</span>
            </button>
            <button
              className="flex items-center space-x-4 bg-white shadow-md rounded-lg p-4 h-12 hover:bg-gray-100"
              onClick={handleTestClick}
            >
              <RiTimerFill className="text-[#637FBF]" style={{ fontSize: '1.5rem' }} />
              <span className="text-xl font-semibold  mb-1">Test</span>
            </button>
            <button
              className="flex items-center space-x-4 bg-white shadow-md rounded-lg p-4 h-12 hover:bg-gray-100"
              onClick={handleMatchClick}
            >
              <PiCardsFill className="text-[#637FBF]" style={{ fontSize: '1.5rem' }} />
              <span className="text-xl font-semibold mb-1">Match</span>
            </button>
          </div>
        )}
        {decks.length === 0 ? (
          <div className="flex justify-center mt-20 items-center h-full">
            <p className="text-xl font-semibold text-gray-700">Go to your library and create some decks!</p>
          </div>
        ) : (
          selectedDeckId && <FlashcardComponent userId={user.id} deckId={selectedDeckId} decks={decks} />
        )}
      </main>
      <footer className="w-full bg-white-700 text-black p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
      <Toaster />
    </div>
  );
};

export default Dashboard;