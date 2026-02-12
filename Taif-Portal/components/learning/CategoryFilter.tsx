"use client";


import { cn } from "@/lib/utils";
import { Category } from "@/models/category.model";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  loading?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategorySelect,
  loading = false,
}: CategoryFilterProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 bg-muted rounded-full animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onCategorySelect(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap flex-shrink-0",
          selectedCategoryId === null
            ? "bg-primary text-white"
            : "bg-muted hover:bg-muted/80"
        )}
      >
        All Categories
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap flex-shrink-0",
            selectedCategoryId === category.id
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
