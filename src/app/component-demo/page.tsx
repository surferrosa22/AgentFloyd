'use client';

import React from 'react';
import { Component as DemoButton } from '@/components/ui/demo';

export default function ComponentDemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <h1 className="text-2xl font-bold mb-8">Component Demo</h1>
      
      <div className="flex flex-col gap-8 items-center">
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h2 className="text-lg font-semibold mb-4">Menu Toggle Button</h2>
          <div className="flex items-center justify-center">
            <DemoButton />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Click the button to toggle the menu open/closed state.
          </p>
        </div>
      </div>
    </div>
  );
}