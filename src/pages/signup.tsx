import '../app/globals.css';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import supabase from '../lib/supabaseClient';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { initCursor, updateCursor, customCursorStyle } from 'ipad-cursor';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initCursor({
        normalStyle: { 
          background: 'rgba(255, 255, 255, 0.3)',
          border: '2px solid black'
        },
        textStyle: { 
          background: 'rgba(255, 255, 255, 0.5)',
          border: '2px solid black'
        },
        blockStyle: { 
          background: 'rgba(255, 255, 255, 0.2)',
          radius: 'auto',
          border: '2px solid black'
        },
      });
      updateCursor();
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!hcaptchaToken) {
      setErrorMessage('Please complete the hCaptcha.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error creating account:', error.message);
      if (error.status === 429) {
        setErrorMessage('Too many requests. Please try again later.');
      } else {
        setErrorMessage(error.message);
      }
      setLoading(false);
    } else if (data.user) {
      console.log('Account created successfully:', data.user);

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: data.user.id, email, password, name, hcaptchaToken }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response from API:', errorData);
          throw new Error('Failed to create user in database');
        }

        const result = await response.json();
        console.log('User created in database:', result);

        router.push('/dashboard');
      } catch (error: any) {
        console.error('Error creating user in database:', (error as Error).message);
        setErrorMessage('An error occurred while creating your account. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      console.error('User data is null');
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dot-pattern flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8" data-cursor="normal">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="absolute top-4 left-4 sm:top-20 sm:left-40" data-cursor="block">
            <Link 
              href="/"
              data-cursor="block"
              data-cursor-style={customCursorStyle({ 
                background: 'rgba(255, 255, 255, 0.4)',
                width: '40px',
                height: '40px',
                radius: '50%'
              })}
            >
              <FaArrowLeft className="text-black text-2xl" />
            </Link>
          </div>
          <div className="p-8 rounded-lg w-full max-w-sm">
            <h1 className="text-3xl font-bold text-center text-black mb-8">Join Kard</h1>
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-black
                             focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="you@example.com"
                  required
                  data-cursor="text"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-black
                             focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Your username"
                  required
                  data-cursor="text"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 text-black
                               focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="••••••••"
                    required
                    data-cursor="text"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    data-cursor="block"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </div>
                </div>
              </div>
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                onVerify={(token) => setHcaptchaToken(token)}
              />
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-500"
                disabled={loading}
                data-cursor="block"
                data-cursor-style={customCursorStyle({ background: 'rgba(255, 255, 255, 0.4)' })}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
          <p className="text-center text-sm font-semibold text-black">
            Already have an account?{' '}
            <Link 
              href="/signin" 
              className="font-medium text-black underline hover:text-gray-800"
              data-cursor="block"
              data-cursor-style={customCursorStyle({ 
                background: 'rgba(0, 0, 0, 0.1)',
                radius: '20px',
                padding: '8px 10px'
              })}
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
};

export default SignUp;