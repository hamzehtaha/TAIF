"use client";

import { FileText } from "lucide-react";
import { RichTextContent as RichTextContentType } from "@/services/lessonItemService";

interface RichTextContentProps {
  content: RichTextContentType;
  title: string;
}

function extractTextContent(content: RichTextContentType): string | null {
  if (!content) return null;
  
  // Handle if text is a string
  if (typeof content.text === "string") return content.text;
  
  // Handle if text is an object with nested text property
  if (content.text && typeof content.text === "object") {
    const nestedText = (content.text as any).text;
    if (typeof nestedText === "string") return nestedText;
  }
  
  return null;
}

function extractHtmlContent(content: RichTextContentType): string | null {
  if (!content) return null;
  
  // Handle if html is a string
  if (typeof content.html === "string") return content.html;
  
  // Handle if html is an object with nested html property
  if (content.html && typeof content.html === "object") {
    const nestedHtml = (content.html as any).html;
    if (typeof nestedHtml === "string") return nestedHtml;
  }
  
  return null;
}

export function RichTextContent({ content, title }: RichTextContentProps) {
  const htmlContent = extractHtmlContent(content);
  const textContent = extractTextContent(content);
  const hasContent = htmlContent || textContent;

  if (!hasContent) {
    return (
      <div className="p-6 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No content available.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Reading Material</h3>
      </div>
      
      {htmlContent ? (
        <div 
          className="prose prose-sm md:prose-base max-w-none dark:prose-invert
            prose-headings:text-foreground prose-p:text-foreground/90
            prose-a:text-primary prose-strong:text-foreground
            prose-code:bg-muted prose-code:px-1 prose-code:rounded
            prose-pre:bg-muted prose-pre:border prose-pre:border-border
            prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30
            prose-ul:text-foreground/90 prose-ol:text-foreground/90
            prose-li:marker:text-primary"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <div className="prose prose-sm md:prose-base max-w-none">
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {textContent}
          </p>
        </div>
      )}
    </div>
  );
}
