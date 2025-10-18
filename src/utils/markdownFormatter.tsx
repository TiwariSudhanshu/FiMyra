import React from 'react';

/**
 * Cleans and formats AI response text that contains markdown formatting
 * Converts markdown to clean HTML elements for React rendering
 */

export interface FormattedTextOptions {
  preserveLineBreaks?: boolean;
  className?: string;
}

/**
 * Strips markdown symbols and returns plain text
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // Remove bold/strong markers (**text** or __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic markers (*text* or _text_)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove code markers (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove heading markers (# Heading)
    .replace(/^#+\s+/gm, '')
    // Remove list markers (- item or * item or 1. item)
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts markdown text to React JSX elements with proper HTML structure
 */
export function formatMarkdownToJSX(text: string, options: FormattedTextOptions = {}): React.ReactNode {
  if (!text) return null;

  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (!listBuffer.length || !listType) return;
    
    if (listType === 'ul') {
      elements.push(
        <ul key={elements.length} className="list-disc pl-5 my-2 space-y-1">
          {listBuffer.map((item, i) => (
            <li key={i} className="text-white/90">{formatInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={elements.length} className="list-decimal pl-5 my-2 space-y-1">
          {listBuffer.map((item, i) => (
            <li key={i} className="text-white/90">{formatInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
    }
    
    listBuffer = [];
    listType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      flushList();
      continue;
    }

    // Heading level 2 (## Heading)
    if (trimmed.startsWith('## ')) {
      flushList();
      const content = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h2 key={elements.length} className="text-lg font-bold text-white mt-4 mb-2">
          {formatInlineMarkdown(content)}
        </h2>
      );
      continue;
    }

    // Heading level 3 (### Heading)
    if (trimmed.startsWith('### ')) {
      flushList();
      const content = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h3 key={elements.length} className="text-base font-semibold text-white/95 mt-3 mb-2">
          {formatInlineMarkdown(content)}
        </h3>
      );
      continue;
    }

    // Heading level 4 (#### Heading)
    if (trimmed.startsWith('#### ')) {
      flushList();
      const content = trimmed.replace(/^####\s+/, '');
      elements.push(
        <h4 key={elements.length} className="text-sm font-semibold text-white/90 mt-2 mb-1">
          {formatInlineMarkdown(content)}
        </h4>
      );
      continue;
    }

    // Unordered list (- item or * item)
    if (/^[-*]\s+/.test(trimmed)) {
      const item = trimmed.replace(/^[-*]\s+/, '');
      if (listType === 'ol') flushList();
      listType = 'ul';
      listBuffer.push(item);
      continue;
    }

    // Ordered list (1. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const item = trimmed.replace(/^\d+\.\s+/, '');
      if (listType === 'ul') flushList();
      listType = 'ol';
      listBuffer.push(item);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={elements.length} className="text-sm text-white/90 leading-relaxed mb-2">
        {formatInlineMarkdown(trimmed)}
      </p>
    );
  }

  // Flush any remaining list
  flushList();

  return <div className={options.className || ''}>{elements}</div>;
}

/**
 * Formats inline markdown (bold, italic, code) within a line of text
 */
function formatInlineMarkdown(text: string): React.ReactNode {
  if (!text) return text;

  // Split text by markdown patterns and create React elements
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Process bold (**text**)
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(remaining)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(remaining.substring(lastIndex, match.index));
    }
    // Add bold text
    parts.push(<strong key={`bold-${key++}`} className="font-semibold text-white">{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < remaining.length) {
    parts.push(remaining.substring(lastIndex));
  }

  // If no formatting was found, return original text
  if (parts.length === 0) {
    return text;
  }

  // Process the parts array to handle other formatting (italic, code)
  const finalParts: React.ReactNode[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Skip already formatted parts (React elements)
    if (typeof part !== 'string') {
      finalParts.push(part);
      continue;
    }

    // Process italic (*text* or _text_)
    const italicRegex = /[*_]([^*_]+)[*_]/g;
    const italicMatches = [];
    let italicMatch;
    
    while ((italicMatch = italicRegex.exec(part)) !== null) {
      italicMatches.push({
        index: italicMatch.index,
        text: italicMatch[1],
        length: italicMatch[0].length
      });
    }

    if (italicMatches.length > 0) {
      let currentPos = 0;
      italicMatches.forEach((m, idx) => {
        if (m.index > currentPos) {
          finalParts.push(part.substring(currentPos, m.index));
        }
        finalParts.push(<em key={`italic-${key++}`} className="italic text-white/95">{m.text}</em>);
        currentPos = m.index + m.length;
      });
      if (currentPos < part.length) {
        finalParts.push(part.substring(currentPos));
      }
    } else {
      finalParts.push(part);
    }
  }

  return finalParts.length > 0 ? <>{finalParts}</> : text;
}

/**
 * Quick clean function for simple markdown removal
 * Useful when you just need plain text without React elements
 */
export function cleanMarkdownSimple(text: string): string {
  return stripMarkdown(text);
}

/**
 * React component wrapper for formatted markdown text
 */
interface FormattedMarkdownProps {
  text: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ text, className }) => {
  return <>{formatMarkdownToJSX(text, { className })}</>;
};
