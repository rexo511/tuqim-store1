'use client';

import { useEffect, useState } from 'react';

export default function WelcomeScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome screen before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      setShow(true);
      
      // Hide after 3 seconds
      setTimeout(() => {
        setShow(false);
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 3000);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-purple-900 animate-fadeIn">
      <div className="text-center animate-scaleIn">
        {/* Logo */}
        <div className="mb-8 animate-slideDown">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
            <span className="text-6xl font-black text-white">T</span>
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-6xl font-extrabold mb-4 animate-slideUp">
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
            مرحباً بك
          </span>
        </h1>

        <p className="text-3xl font-bold text-white animate-slideUp" style={{ animationDelay: '0.2s' }}>
          في متجر Tuqim Store
        </p>

        {/* Animated dots */}
        <div className="flex gap-2 justify-center mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
