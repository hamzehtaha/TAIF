"use client";

export function PuzzleLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative w-48 h-48">
        {/* Puzzle pieces container */}
        <div className="absolute inset-0">
          {/* Puzzle piece 1 - Top Left (cyan/teal) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute w-24 h-24 top-0 left-0 animate-puzzle-1"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
          >
            <path
              d="M 10 10 L 50 10 Q 50 5 55 5 Q 60 5 60 10 L 90 10 L 90 50 Q 95 50 95 55 Q 95 60 90 60 L 90 90 L 50 90 L 50 60 Q 45 60 45 55 Q 45 50 50 50 L 50 50 L 10 50 L 10 10 Z"
              className="fill-[#7DD3C0]"
            />
          </svg>

          {/* Puzzle piece 2 - Top Right (teal/blue) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute w-24 h-24 top-0 right-0 animate-puzzle-2"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
          >
            <path
              d="M 10 10 L 50 10 L 50 50 Q 55 50 55 55 Q 55 60 50 60 L 50 90 L 10 90 Q 10 95 5 95 Q 0 95 0 90 L 0 50 L 40 50 Q 40 45 45 45 Q 50 45 50 40 L 50 10 L 10 10 Z"
              className="fill-[#5FB8AD]"
            />
          </svg>

          {/* Puzzle piece 3 - Bottom Left (coral/red) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute w-24 h-24 bottom-0 left-0 animate-puzzle-3"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
          >
            <path
              d="M 10 10 L 50 10 L 50 40 Q 55 40 55 45 Q 55 50 50 50 L 50 50 L 90 50 L 90 90 L 50 90 Q 50 95 45 95 Q 40 95 40 90 L 10 90 L 10 50 Q 5 50 5 45 Q 5 40 10 40 L 10 10 Z"
              className="fill-[#FF8882]"
            />
          </svg>

          {/* Puzzle piece 4 - Bottom Right (light coral/pink) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute w-24 h-24 bottom-0 right-0 animate-puzzle-4"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
          >
            <path
              d="M 10 10 L 50 10 Q 50 5 55 5 Q 60 5 60 10 L 90 10 L 90 50 L 50 50 Q 50 55 45 55 Q 40 55 40 50 L 10 50 L 10 10 Z M 50 50 L 50 90 L 10 90 Q 10 95 5 95 Q 0 95 0 90 L 0 50 L 50 50 Z"
              className="fill-[#FFB4AB]"
            />
          </svg>
        </div>

        {/* Center glow effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        </div>
      </div>

      {/* Loading text */}
      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2 animate-pulse">
          Loading...
        </h3>
        <p className="text-sm text-muted-foreground">
          Connecting the pieces
        </p>
      </div>
    </div>
  );
}
