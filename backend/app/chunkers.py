import re
import tiktoken
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Initialize tokenizer for token counts
try:
    tokenizer = tiktoken.get_encoding("cl100k_base")
except Exception:
    tokenizer = None

def get_token_count(text: str) -> int:
    if tokenizer:
        return len(tokenizer.encode(text, disallowed_special=()))
    # Fallback to rough estimate if tiktoken fails
    return len(text.split())

def build_chunk_response(chunk_id: int, text: str, start: int, end: int, original_text: str) -> Dict[str, Any]:
    # Calculate word count
    words = text.split()
    word_count = len(words)
    char_count = len(text)
    token_count = get_token_count(text)
    
    return {
        "id": chunk_id,
        "text": text,
        "start_char": start,
        "end_char": end,
        "word_count": word_count,
        "char_count": char_count,
        "token_count": token_count,
        "overlap_prev": 0, # To be computed by caller
        "overlap_next": 0  # To be computed by caller
    }

def compute_overlaps(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Computes overlapping character count with previous and next chunks.
    """
    for i in range(len(chunks)):
        # Overlap with previous
        if i > 0:
            prev_chunk = chunks[i - 1]
            curr_chunk = chunks[i]
            # If current starts before previous ends, there is an overlap
            if curr_chunk["start_char"] < prev_chunk["end_char"]:
                overlap_len = prev_chunk["end_char"] - curr_chunk["start_char"]
                curr_chunk["overlap_prev"] = overlap_len
                prev_chunk["overlap_next"] = overlap_len
        
        # Check boundary condition for last chunk
        if i < len(chunks) - 1:
            next_chunk = chunks[i + 1]
            curr_chunk = chunks[i]
            if next_chunk["start_char"] < curr_chunk["end_char"]:
                overlap_len = curr_chunk["end_char"] - next_chunk["start_char"]
                curr_chunk["overlap_next"] = overlap_len
                next_chunk["overlap_prev"] = overlap_len

    return chunks

def fixed_size_chunking(text: str, chunk_size: int, chunk_overlap: int) -> List[Dict[str, Any]]:
    if chunk_size <= 0:
        return []
    if chunk_overlap >= chunk_size:
        chunk_overlap = chunk_size - 1
    if chunk_overlap < 0:
        chunk_overlap = 0

    chunks = []
    start = 0
    chunk_id = 0
    text_len = len(text)
    
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk_text = text[start:end]
        
        chunks.append(build_chunk_response(chunk_id, chunk_text, start, end, text))
        chunk_id += 1
        
        if end >= text_len:
            break
        start += (chunk_size - chunk_overlap)
        
    return compute_overlaps(chunks)

def recursive_character_chunking(text: str, chunk_size: int, chunk_overlap: int, separators: List[str] = None) -> List[Dict[str, Any]]:
    if not separators:
        separators = ["\n\n", "\n", " ", ""]
        
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=separators,
        keep_separator=True
    )
    
    split_texts = splitter.split_text(text)
    chunks = []
    current_pos = 0
    chunk_id = 0
    
    for split_text in split_texts:
        search_text = split_text.strip()
        if not search_text:
            continue
            
        # Search starting from current pos. Since recursive splitter has overlaps,
        # we start searching from max(0, current_pos - chunk_overlap - 50) to allow overlap matching.
        search_start = max(0, current_pos - chunk_overlap - 100)
        idx = text.find(split_text, search_start)
        
        if idx != -1:
            start = idx
            end = idx + len(split_text)
            chunks.append(build_chunk_response(chunk_id, split_text, start, end, text))
            current_pos = end
        else:
            # Fallback search just in case whitespace matching was off
            idx_fuzzy = text.find(search_text, search_start)
            if idx_fuzzy != -1:
                start = idx_fuzzy
                end = idx_fuzzy + len(search_text)
                chunks.append(build_chunk_response(chunk_id, text[start:end], start, end, text))
                current_pos = end
            else:
                # Direct fallback
                start = current_pos
                end = min(current_pos + len(split_text), len(text))
                chunks.append(build_chunk_response(chunk_id, split_text, start, end, text))
                current_pos = end
                
        chunk_id += 1
        
    return compute_overlaps(chunks)

def sentence_chunking(text: str, sentences_per_chunk: int) -> List[Dict[str, Any]]:
    if sentences_per_chunk <= 0:
        return []
        
    # Get spans of sentences
    spans = []
    # Match sentences by regex
    pattern = re.compile(r'[^.!?]+[.!?]?')
    for match in pattern.finditer(text):
        sentence = match.group(0)
        if sentence.strip():
            start = match.start()
            end = match.end()
            # Trim leading whitespace in positions
            while start < end and text[start].isspace():
                start += 1
            while end > start and text[end-1].isspace():
                end -= 1
            if start < end:
                spans.append((start, end, text[start:end]))
                
    if not spans:
        return []
        
    chunks = []
    chunk_id = 0
    i = 0
    total_sentences = len(spans)
    
    while i < total_sentences:
        group_spans = spans[i : min(i + sentences_per_chunk, total_sentences)]
        start_char = group_spans[0][0]
        end_char = group_spans[-1][1]
        chunk_text = text[start_char:end_char]
        
        chunks.append(build_chunk_response(chunk_id, chunk_text, start_char, end_char, text))
        chunk_id += 1
        i += sentences_per_chunk
        
    return compute_overlaps(chunks)

def paragraph_chunking(text: str, paragraphs_per_chunk: int) -> List[Dict[str, Any]]:
    if paragraphs_per_chunk <= 0:
        return []
        
    # Split text into paragraphs (separated by \n\n)
    spans = []
    for match in re.finditer(r'(?:[^\n]|\n(?!\n))+', text):
        start = match.start()
        end = match.end()
        # Trim leading/trailing whitespace
        while start < end and text[start].isspace():
            start += 1
        while end > start and text[end-1].isspace():
            end -= 1
        if start < end:
            spans.append((start, end, text[start:end]))
            
    if not spans:
        # Fallback to single chunk if no double newlines
        if text.strip():
            return compute_overlaps([build_chunk_response(0, text, 0, len(text), text)])
        return []
        
    chunks = []
    chunk_id = 0
    i = 0
    total_paragraphs = len(spans)
    
    while i < total_paragraphs:
        group_spans = spans[i : min(i + paragraphs_per_chunk, total_paragraphs)]
        start_char = group_spans[0][0]
        end_char = group_spans[-1][1]
        chunk_text = text[start_char:end_char]
        
        chunks.append(build_chunk_response(chunk_id, chunk_text, start_char, end_char, text))
        chunk_id += 1
        i += paragraphs_per_chunk
        
    return compute_overlaps(chunks)

def sliding_window_chunking(text: str, window_size: int, stride: int) -> List[Dict[str, Any]]:
    if window_size <= 0:
        return []
    if stride <= 0:
        stride = 1
        
    # Get word spans
    spans = []
    for match in re.finditer(r'\S+', text):
        spans.append((match.start(), match.end()))
        
    if not spans:
        return []
        
    chunks = []
    chunk_id = 0
    total_words = len(spans)
    i = 0
    
    while i < total_words:
        group_spans = spans[i : min(i + window_size, total_words)]
        start_char = group_spans[0][0]
        end_char = group_spans[-1][1]
        chunk_text = text[start_char:end_char]
        
        chunks.append(build_chunk_response(chunk_id, chunk_text, start_char, end_char, text))
        chunk_id += 1
        
        if i + window_size >= total_words:
            break
        i += stride
        
    return compute_overlaps(chunks)
