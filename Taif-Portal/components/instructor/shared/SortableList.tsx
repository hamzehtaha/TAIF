"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function SortableList<T>({
  items,
  onReorder,
  keyExtractor,
  renderItem,
  className,
}: SortableListProps<T>) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className={cn("space-y-2", className)}
    >
      {items.map((item, index) => (
        <SortableItem key={keyExtractor(item)} item={item}>
          {renderItem(item, index)}
        </SortableItem>
      ))}
    </Reorder.Group>
  );
}

interface SortableItemProps<T> {
  item: T;
  children: React.ReactNode;
}

function SortableItem<T>({ item, children }: SortableItemProps<T>) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="relative"
    >
      <div className="flex items-stretch">
        <div
          className="flex items-center px-2 cursor-grab active:cursor-grabbing hover:bg-muted rounded-l-lg border-r"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </Reorder.Item>
  );
}

interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className }: DragHandleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-muted rounded p-1",
        className
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
