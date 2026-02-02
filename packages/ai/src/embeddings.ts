import { getOpenAIClient } from './client';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
}

/**
 * Create an embedding for a single text
 */
export async function createEmbedding(text: string): Promise<EmbeddingResult> {
  const client = getOpenAIClient();
  
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return {
    embedding: response.data[0].embedding,
    tokenCount: response.usage.total_tokens,
  };
}

/**
 * Create embeddings for multiple texts in batch
 */
export async function createBatchEmbeddings(
  texts: string[]
): Promise<EmbeddingResult[]> {
  const client = getOpenAIClient();
  
  // OpenAI recommends batching up to 2048 inputs
  const batchSize = 100;
  const results: EmbeddingResult[] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const tokensPerInput = Math.floor(response.usage.total_tokens / batch.length);
    
    for (const data of response.data) {
      results.push({
        embedding: data.embedding,
        tokenCount: tokensPerInput,
      });
    }
  }

  return results;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find the most similar items from a list of embeddings
 */
export function findMostSimilar(
  queryEmbedding: number[],
  embeddings: Array<{ id: string; embedding: number[] }>,
  topK = 5
): Array<{ id: string; similarity: number }> {
  const similarities = embeddings.map(item => ({
    id: item.id,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Chunk text into smaller pieces for embedding
 * Useful for large documents
 */
export function chunkText(
  text: string,
  options: {
    maxChunkSize?: number;
    overlap?: number;
    separator?: string;
  } = {}
): string[] {
  const { maxChunkSize = 1000, overlap = 100, separator = '\n\n' } = options;

  // First try to split by separator
  const paragraphs = text.split(separator);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length <= maxChunkSize) {
      currentChunk += (currentChunk ? separator : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If a single paragraph is too long, split it further
      if (paragraph.length > maxChunkSize) {
        const words = paragraph.split(' ');
        currentChunk = '';
        
        for (const word of words) {
          if (currentChunk.length + word.length + 1 <= maxChunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + word;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk);
            }
            currentChunk = word;
          }
        }
      } else {
        currentChunk = paragraph;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  // Add overlap between chunks for better context
  if (overlap > 0 && chunks.length > 1) {
    const overlappedChunks: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      if (i === 0) {
        overlappedChunks.push(chunks[i]);
      } else {
        const prevChunk = chunks[i - 1];
        const overlapText = prevChunk.slice(-overlap);
        overlappedChunks.push(overlapText + ' ' + chunks[i]);
      }
    }
    
    return overlappedChunks;
  }

  return chunks;
}

/**
 * Prepare code for embedding by extracting key information
 */
export function prepareCodeForEmbedding(
  code: string,
  filePath: string,
  language?: string
): string {
  // Extract function/class names and comments for better embeddings
  const lines = code.split('\n');
  const significantLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Keep comments
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || 
        trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      significantLines.push(trimmed);
      continue;
    }
    
    // Keep function/class/interface definitions
    if (
      /^(export\s+)?(async\s+)?(function|class|interface|type|const|let|var|def|class)\s+\w+/.test(trimmed) ||
      /^(public|private|protected)\s+(static\s+)?(async\s+)?\w+/.test(trimmed)
    ) {
      significantLines.push(trimmed);
    }
  }

  const header = `File: ${filePath}${language ? ` (${language})` : ''}`;
  return `${header}\n\n${significantLines.join('\n')}`;
}
