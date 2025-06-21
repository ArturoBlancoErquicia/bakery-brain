"use client";

import React, { useState, useEffect } from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react'; 

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // This effect runs on mount to set the correct initial theme from localStorage or system preference
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  // This effect applies the theme to the document and localStorage whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Cambiar tema">
      {isDarkMode ? <Sun /> : <Moon />}
    </Button>
  );
};


export default function AppHeader() {
  const { isMobile } = useSidebar();
  const [hasMounted, setHasMounted] = useState(false);

  // This effect runs once on the client to set the mounted state
  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        {/* Only render SidebarTrigger on the client after mount to prevent hydration mismatch */}
        {hasMounted && isMobile && <SidebarTrigger />}
        
        {!isMobile && <div className="hidden md:block w-7 h-7"></div>} 
        <h2 className="text-xl font-semibold font-headline md:hidden">Cerebro Pastelero</h2>
      </div>
      <div className="flex items-center gap-4">
        {/* Only render ThemeToggle on the client to prevent hydration mismatch. Render a placeholder before that. */}
        {hasMounted ? <ThemeToggle /> : <Button variant="ghost" size="icon" disabled={true} />}
        
        <Avatar>
          <AvatarImage src="https://placehold.co/40x40.png" alt="Avatar de Usuario" data-ai-hint="user avatar" />
          <AvatarFallback>CP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
