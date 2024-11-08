"use client";

import '../app/globals.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { RiFeedbackFill } from "react-icons/ri";
import CookieConsent from '../components/CookieConsent';
import { Button } from '../components/ui/Button';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import FlipCard from '../components/demo/FlipCard';
import FeaturesSection from '../components/demo/FeaturesSection';
import Modal from '../components/EmailModal';
import EmailForm from '../components/EmailForm';
import Bubbles from '../components/demo/Bubbles';

const DynamicDragAndDropDemo = dynamic(() => import('../components/demo/DragAndDropDemo'), {
  ssr: false,
  loading: () => <p>Loading drag and drop demo...</p>
});

interface DynamicTitleProps {
  isMobile: boolean;
  text: string;
}

const DynamicTitle = dynamic<DynamicTitleProps>(() => Promise.resolve(({ isMobile, text }) => (
  <h1 className="font-bold mb-2 mt-20 text-black text-4xl md:text-5xl lg:text-6xl">
    {isMobile ? (
      "Kard is an Uncomplicated learning platform"
    ) : (
      <>
        {text}
        <Cursor />
      </>
    )}
  </h1>
)), { ssr: false });

const HomePage: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth <= 767);
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', handleResize);

    const updateNavHeight = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', updateNavHeight);
    };
  }, []);

  const [text] = useTypewriter({
    words: ['Uncomplicated & Fast', 'For Everyone'],
    loop: true,
    delaySpeed: 2000,
  });

  const handleSupportClick = () => {
    window.open('https://forms.gle/bP14r8vtGhmj8s7S7', '_blank');
  };

  const handleLearnMoreClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`min-h-screen flex flex-col relative bg-[#F8F7F6] text-black overflow-hidden ${isMounted && !isMobile ? 'cursor-none' : ''}`}>
        {isMounted && <Bubbles />}
        
        <header className="w-full fixed top-0 left-0 right-0 z-50 px-4 py-2">
          <nav ref={navRef} className="flex justify-center items-center py-2 px-6 max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="kard wiggle-effect text-black mr-10" 
            >
              Kard
            </Link>
            <div className="inner-nav hover:lighten-effect">
              <a 
                href="#" 
                className="nav-item text-black px-4 py-2 rounded-full" 
                onClick={handleLearnMoreClick}
              >
                Learn More
              </a>
            </div>
          </nav>
        </header>

        <div style={{ height: `${navHeight}px` }} />

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center mb-12 fixed-title">
            {isMounted ? (
              <DynamicTitle isMobile={isMobile} text={text} />
            ) : (
              <h1 className="font-bold mb-2 text-black text-4xl md:text-5xl lg:text-6xl">
                Kard is a Better Quizlet Alternative
              </h1>
            )}
            <p className="max-w-2xl mx-auto text-gray-900 text-base md:text-xl">
              A Flashcard App that scales with you.
            </p>
          </div>

          <hr className="w-1/2 mb-10 border-black" />

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/signin">
              <Button
                className="px-6 py-3 rounded-md font-semibold w-full sm:w-auto bg-white text-black border-2 border-black relative overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:translate-x-0.5 active:translate-y-0 active:translate-x-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none hover:bg-white"
              >
                <span className="text-lg relative z-10">Get Started</span>
              </Button>
            </Link>
          </div>
        </main>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-black">Experience Kard in Action</h2>
            <div className="relative">
              <div className="backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8 bg-gray-100/30">
                <h3 className="text-2xl font-semibold mb-4 text-black">Drag & Drop</h3>
                <DynamicDragAndDropDemo />
              </div>
              <div className="backdrop-blur-sm p-6 rounded-lg shadow-lg md:w-3/4 md:ml-auto md:-mt-16 bg-white/30">
                <h3 className="text-2xl font-semibold mb-4 text-black">Flashcard</h3>
                <FlipCard
                  question="What is the capital of France?"
                  answer="Paris"
                />
              </div>
            </div>

            <FeaturesSection />
          </div>
        </section>

        <footer className="w-full p-6 flex flex-col items-center text-black">
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center mt-2">
              <div className="relative w-24 h-24 sm:w-40 sm:h-40 md:w-55 md:h-55 lg:w-80 lg:h-80 mr-2 sm:mr-4">
                <Image
                  src="/blob.svg"
                  alt="Blob"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <p className="text-7xl sm:text-8xl md:text-8xl lg:text-kard font-bold mr-4 sm:mr-20">KARD</p>
            </div>
            
            <div className="w-full flex flex-row justify-center sm:justify-end items-center mt-4 sm:mt-0 sm:mr-44">
              <p className="text-sm backdrop-blur-sm p-2 rounded-lg bg-white/30 mr-2">
                <Link href="/privacy">Privacy Policy</Link>
              </p>
              <p className="text-sm backdrop-blur-sm p-2 rounded-lg bg-white/30">
                &copy; Kard {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>

        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-transparent">
          <div className="flex-grow"></div>
          <button
            className="text-md font-bold px-3 py-3 sm:px-4 sm:py-2 rounded-full shadow-lg transition duration-300 flex items-center bg-background text-foreground hover:bg-gray-200"
            onClick={handleSupportClick}
          >
            <RiFeedbackFill className="text-xl sm:text-base sm:mr-2" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <EmailForm />
        </Modal>

        <CookieConsent />
      </div>
    </>
  );
};

export default HomePage;
