'use client';

import { Loader2, Map } from 'lucide-react';

export function MapSkeleton() {
  return (
    <div className="relative w-full h-[300px] bg-muted rounded-lg border border-border overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="p-3 rounded-full bg-background/80 backdrop-blur-sm">
          <Map className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Indlæser kort...
        </div>
      </div>
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
    </div>
  );
}
