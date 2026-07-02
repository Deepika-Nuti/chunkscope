export interface Chunk {
  id: number;
  text: string;
  start_char: number;
  end_char: number;
  word_count: number;
  char_count: number;
  token_count: number;
  overlap_prev: number;
  overlap_next: number;
}

export interface ChunkParams {
  chunk_size?: number;
  chunk_overlap?: number;
  separators?: string[];
  sentences_per_chunk?: number;
  paragraphs_per_chunk?: number;
  window_size?: number;
  stride?: number;
}

export interface ChunkingResult {
  chunks: Chunk[];
  statistics: {
    total_chunks: number;
    avg_chunk_size: number;
    avg_token_count: number;
    largest_chunk: number;
    smallest_chunk: number;
    processing_time_ms: number;
  };
}

// Rough token estimation: ~4 characters per token on average for English
const estimateTokens = (text: string): number => {
  return Math.max(1, Math.round(text.length / 4.1));
};

const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const computeOverlaps = (chunks: Chunk[]): Chunk[] => {
  for (let i = 0; i < chunks.length; i++) {
    const curr = chunks[i];
    
    if (i > 0) {
      const prev = chunks[i - 1];
      if (curr.start_char < prev.end_char) {
        const overlap = prev.end_char - curr.start_char;
        curr.overlap_prev = overlap;
        prev.overlap_next = overlap;
      }
    }
    
    if (i < chunks.length - 1) {
      const next = chunks[i + 1];
      if (next.start_char < curr.end_char) {
        const overlap = curr.end_char - next.start_char;
        curr.overlap_next = overlap;
        next.overlap_prev = overlap;
      }
    }
  }
  return chunks;
};

// 1. Fixed Size Chunking
export const fixedSizeChunking = (text: string, chunkSize: number, chunkOverlap: number): Chunk[] => {
  if (chunkSize <= 0) return [];
  if (chunkOverlap >= chunkSize) chunkOverlap = chunkSize - 1;
  if (chunkOverlap < 0) chunkOverlap = 0;

  const chunks: Chunk[] = [];
  let start = 0;
  let id = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkText = text.slice(start, end);
    
    chunks.push({
      id,
      text: chunkText,
      start_char: start,
      end_char: end,
      word_count: getWordCount(chunkText),
      char_count: chunkText.length,
      token_count: estimateTokens(chunkText),
      overlap_prev: 0,
      overlap_next: 0,
    });
    
    id++;
    if (end >= text.length) break;
    start += (chunkSize - chunkOverlap);
  }
  
  return computeOverlaps(chunks);
};

// 2. Recursive Character Chunking
export const recursiveCharacterChunking = (
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  separators: string[] = ["\n\n", "\n", " ", ""]
): Chunk[] => {
  if (chunkSize <= 0) return [];
  if (chunkOverlap >= chunkSize) chunkOverlap = chunkSize - 1;

  // Let's implement a clean recursive splitter simulation
  const chunks: Chunk[] = [];
  let chunkId = 0;

  // Helper to split text using separators list
  const splitText = (txt: string, currentSeps: string[]): string[] => {
    if (txt.length <= chunkSize || currentSeps.length === 0) {
      return [txt];
    }

    const sep = currentSeps[0];
    const nextSeps = currentSeps.slice(1);
    
    // Split by separator
    let parts: string[];
    if (sep === "") {
      // Character fallback
      parts = txt.split("");
    } else {
      parts = txt.split(sep);
      // Re-insert separator in-between
      parts = parts.reduce((acc, part, index) => {
        if (index === 0) return [part];
        // Combine separator and part
        acc[acc.length - 1] += sep;
        acc.push(part);
        return acc;
      }, [] as string[]);
    }

    let result: string[] = [];
    for (const part of parts) {
      if (part.length <= chunkSize) {
        result.push(part);
      } else {
        result = result.concat(splitText(part, nextSeps));
      }
    }
    return result;
  };

  const rawSplits = splitText(text, separators);

  // Now, merge splits into chunks up to chunkSize
  let currentChunkSplits: string[] = [];
  let currentLen = 0;
  let currentStart = 0;

  for (let i = 0; i < rawSplits.length; i++) {
    const split = rawSplits[i];
    
    if (currentLen + split.length <= chunkSize || currentChunkSplits.length === 0) {
      currentChunkSplits.push(split);
      currentLen += split.length;
    } else {
      // Save current chunk
      const chunkText = currentChunkSplits.join("");
      const startIdx = text.indexOf(chunkText, Math.max(0, currentStart - 100));
      if (startIdx !== -1) {
        chunks.push({
          id: chunkId++,
          text: chunkText,
          start_char: startIdx,
          end_char: startIdx + chunkText.length,
          word_count: getWordCount(chunkText),
          char_count: chunkText.length,
          token_count: estimateTokens(chunkText),
          overlap_prev: 0,
          overlap_next: 0
        });
        currentStart = startIdx + chunkText.length;
      }
      
      // Handle overlap: go back in splits to satisfy overlap
      let overlapLen = 0;
      const overlapSplits: string[] = [];
      for (let j = currentChunkSplits.length - 1; j >= 0; j--) {
        const s = currentChunkSplits[j];
        if (overlapLen + s.length <= chunkOverlap) {
          overlapSplits.unshift(s);
          overlapLen += s.length;
        } else {
          break;
        }
      }
      
      currentChunkSplits = [...overlapSplits, split];
      currentLen = currentChunkSplits.reduce((sum, s) => sum + s.length, 0);
    }
  }

  // Add the last chunk
  if (currentChunkSplits.length > 0) {
    const chunkText = currentChunkSplits.join("");
    const startIdx = text.indexOf(chunkText, Math.max(0, currentStart - 100));
    if (startIdx !== -1) {
      chunks.push({
        id: chunkId++,
        text: chunkText,
        start_char: startIdx,
        end_char: startIdx + chunkText.length,
        word_count: getWordCount(chunkText),
        char_count: chunkText.length,
        token_count: estimateTokens(chunkText),
        overlap_prev: 0,
        overlap_next: 0
      });
    }
  }

  return computeOverlaps(chunks);
};

// 3. Sentence Chunking
export const sentenceChunking = (text: string, sentencesPerChunk: number): Chunk[] => {
  if (sentencesPerChunk <= 0) return [];
  
  // Basic sentence split regex (dot, question, exclamation mark followed by space or end)
  const sentenceRegex = /[^.!?]+[.!?]?/g;
  const spans: { start: number; end: number; text: string }[] = [];
  let match;
  
  while ((match = sentenceRegex.exec(text)) !== null) {
    let s = match[0];
    if (s.trim()) {
      let start = match.index;
      let end = start + s.length;
      
      // Trim spaces from positions
      while (start < end && /\s/.test(text[start])) start++;
      while (end > start && /\s/.test(text[end - 1])) end--;
      
      if (start < end) {
        spans.push({ start, end, text: text.slice(start, end) });
      }
    }
  }
  
  if (spans.length === 0) return [];
  
  const chunks: Chunk[] = [];
  let chunkId = 0;
  
  for (let i = 0; i < spans.length; i += sentencesPerChunk) {
    const group = spans.slice(i, i + sentencesPerChunk);
    const start = group[0].start;
    const end = group[group.length - 1].end;
    const chunkText = text.slice(start, end);
    
    chunks.push({
      id: chunkId++,
      text: chunkText,
      start_char: start,
      end_char: end,
      word_count: getWordCount(chunkText),
      char_count: chunkText.length,
      token_count: estimateTokens(chunkText),
      overlap_prev: 0,
      overlap_next: 0
    });
  }
  
  return computeOverlaps(chunks);
};

// 4. Paragraph Chunking
export const paragraphChunking = (text: string, paragraphsPerChunk: number): Chunk[] => {
  if (paragraphsPerChunk <= 0) return [];
  
  const paragraphRegex = /(?:[^\n]|\n(?!\n))+/g;
  const spans: { start: number; end: number; text: string }[] = [];
  let match;
  
  while ((match = paragraphRegex.exec(text)) !== null) {
    const p = match[0];
    if (p.trim()) {
      let start = match.index;
      let end = start + p.length;
      
      while (start < end && /\s/.test(text[start])) start++;
      while (end > start && /\s/.test(text[end - 1])) end--;
      
      if (start < end) {
        spans.push({ start, end, text: text.slice(start, end) });
      }
    }
  }
  
  if (spans.length === 0) {
    if (text.trim()) {
      return [{
        id: 0,
        text,
        start_char: 0,
        end_char: text.length,
        word_count: getWordCount(text),
        char_count: text.length,
        token_count: estimateTokens(text),
        overlap_prev: 0,
        overlap_next: 0
      }];
    }
    return [];
  }
  
  const chunks: Chunk[] = [];
  let chunkId = 0;
  
  for (let i = 0; i < spans.length; i += paragraphsPerChunk) {
    const group = spans.slice(i, i + paragraphsPerChunk);
    const start = group[0].start;
    const end = group[group.length - 1].end;
    const chunkText = text.slice(start, end);
    
    chunks.push({
      id: chunkId++,
      text: chunkText,
      start_char: start,
      end_char: end,
      word_count: getWordCount(chunkText),
      char_count: chunkText.length,
      token_count: estimateTokens(chunkText),
      overlap_prev: 0,
      overlap_next: 0
    });
  }
  
  return computeOverlaps(chunks);
};

// 5. Sliding Window Chunking (Word-Based)
export const slidingWindowChunking = (text: string, windowSize: number, stride: number): Chunk[] => {
  if (windowSize <= 0) return [];
  if (stride <= 0) stride = 1;
  
  // Find word boundaries with index offsets
  const wordRegex = /\S+/g;
  const spans: { start: number; end: number }[] = [];
  let match;
  
  while ((match = wordRegex.exec(text)) !== null) {
    spans.push({ start: match.index, end: match.index + match[0].length });
  }
  
  if (spans.length === 0) return [];
  
  const chunks: Chunk[] = [];
  let chunkId = 0;
  
  for (let i = 0; i < spans.length; i += stride) {
    const group = spans.slice(i, i + windowSize);
    if (group.length === 0) break;
    
    const start = group[0].start;
    const end = group[group.length - 1].end;
    const chunkText = text.slice(start, end);
    
    chunks.push({
      id: chunkId++,
      text: chunkText,
      start_char: start,
      end_char: end,
      word_count: group.length,
      char_count: chunkText.length,
      token_count: estimateTokens(chunkText),
      overlap_prev: 0,
      overlap_next: 0
    });
    
    if (i + windowSize >= spans.length) break;
  }
  
  return computeOverlaps(chunks);
};

// Main entry point for browser simulation
export const simulateChunking = (
  text: string,
  strategy: string,
  params: ChunkParams
): ChunkingResult => {
  const startTime = performance.now();
  let chunks: Chunk[] = [];
  
  const strategyLower = strategy.toLowerCase();
  
  if (strategyLower === "fixed") {
    chunks = fixedSizeChunking(text, params.chunk_size || 500, params.chunk_overlap || 100);
  } else if (strategyLower === "recursive") {
    chunks = recursiveCharacterChunking(
      text,
      params.chunk_size || 500,
      params.chunk_overlap || 100,
      params.separators
    );
  } else if (strategyLower === "sentence") {
    chunks = sentenceChunking(text, params.sentences_per_chunk || 3);
  } else if (strategyLower === "paragraph") {
    chunks = paragraphChunking(text, params.paragraphs_per_chunk || 1);
  } else if (strategyLower === "sliding") {
    chunks = slidingWindowChunking(text, params.window_size || 100, params.stride || 50);
  }
  
  const totalChunks = chunks.length;
  const avgChunkSize = totalChunks > 0 ? chunks.reduce((sum, c) => sum + c.char_count, 0) / totalChunks : 0;
  const avgTokenCount = totalChunks > 0 ? chunks.reduce((sum, c) => sum + c.token_count, 0) / totalChunks : 0;
  const largestChunk = totalChunks > 0 ? Math.max(...chunks.map(c => c.char_count)) : 0;
  const smallestChunk = totalChunks > 0 ? Math.min(...chunks.map(c => c.char_count)) : 0;
  const processingTimeMs = Math.round(performance.now() - startTime);
  
  return {
    chunks,
    statistics: {
      total_chunks: totalChunks,
      avg_chunk_size: Math.round(avgChunkSize * 10) / 10,
      avg_token_count: Math.round(avgTokenCount * 10) / 10,
      largest_chunk: largestChunk,
      smallest_chunk: smallestChunk,
      processing_time_ms: processingTimeMs
    }
  };
};
