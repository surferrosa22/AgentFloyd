'use client';

import { Button } from "@/components/ui/button";

export function ButtonTest() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">New Button Test</h2>
      
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h3>Default Variants</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3>Sizes</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">+</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 