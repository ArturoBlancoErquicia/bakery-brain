"use client";

import React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react'; // Assuming these icons exist or use appropriate ones

// A simple theme toggle example - in a real app, this would use context or a state manager
const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  React.useEffect(() => {
    // Check for saved theme or system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark));
  }, []);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle theme">
      {isDarkMode ? <Sun /> : <Moon />}
    </Button>
  );
};


export default function AppHeader() {
  const { isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        {!isMobile && <div className="hidden md:block w-7 h-7"></div>} {/* Placeholder for desktop trigger if needed elsewhere or for alignment */}
        <h2 className="text-xl font-semibold font-headline md:hidden">Bakery Brain</h2>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Avatar>
          <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
          <AvatarFallback>BB</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
