// packages/github/src/ingestion/chunker.ts
// Intelligent file chunking for code analysis and embedding

import { createHash } from 'crypto';

export interface CodeChunk {
    content: string;
    hash: string;
    startLine: number;
    endLine: number;
    metadata: {
        type: 'file' | 'function' | 'class' | 'module' | 'section';
        name?: string;
        language?: string;
        imports?: string[];
        exports?: string[];
    };
}

interface ChunkOptions {
    maxChunkSize?: number;
    minChunkSize?: number;
    overlapLines?: number;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
    maxChunkSize: 2000,   // ~500 tokens
    minChunkSize: 100,    // Don't create tiny chunks
    overlapLines: 3,       // Lines of overlap between chunks
};

/**
 * Chunk a file into manageable pieces for embedding
 */
export function chunkFile(
    content: string,
    filePath: string,
    language?: string,
    options: ChunkOptions = {}
): CodeChunk[] {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const lines = content.split('\n');

    // For small files, return as single chunk
    if (content.length <= opts.maxChunkSize) {
        return [{
            content,
            hash: hashContent(content),
            startLine: 1,
            endLine: lines.length,
            metadata: {
                type: 'file',
                name: getFileName(filePath),
                language: language || inferLanguage(filePath),
                imports: extractImports(content, language),
                exports: extractExports(content, language),
            },
        }];
    }

    // For larger files, try semantic chunking first
    const semanticChunks = trySemanticChunking(content, lines, language, opts);
    if (semanticChunks.length > 0) {
        return semanticChunks.map((chunk) => ({
            ...chunk,
            metadata: {
                ...chunk.metadata,
                language: language || inferLanguage(filePath),
            },
        }));
    }

    // Fall back to line-based chunking
    return lineBasedChunking(content, lines, filePath, language, opts);
}

/**
 * Try to chunk by semantic boundaries (functions, classes, etc.)
 */
function trySemanticChunking(
    content: string,
    lines: string[],
    language: string | undefined,
    opts: Required<ChunkOptions>
): CodeChunk[] {
    const lang = language?.toLowerCase();

    // JavaScript/TypeScript patterns
    if (lang === 'javascript' || lang === 'typescript') {
        return chunkByPatterns(lines, [
            // Export function/const
            /^export\s+(async\s+)?function\s+(\w+)/,
            /^export\s+const\s+(\w+)\s*=/,
            /^export\s+class\s+(\w+)/,
            /^export\s+interface\s+(\w+)/,
            /^export\s+type\s+(\w+)/,
            // Regular declarations
            /^(async\s+)?function\s+(\w+)/,
            /^const\s+(\w+)\s*=\s*(async\s+)?\(/,
            /^class\s+(\w+)/,
            /^interface\s+(\w+)/,
            /^type\s+(\w+)/,
        ], opts);
    }

    // Python patterns
    if (lang === 'python') {
        return chunkByPatterns(lines, [
            /^def\s+(\w+)/,
            /^async\s+def\s+(\w+)/,
            /^class\s+(\w+)/,
        ], opts);
    }

    // Go patterns
    if (lang === 'go') {
        return chunkByPatterns(lines, [
            /^func\s+(\w+)/,
            /^func\s+\(\w+\s+\*?\w+\)\s+(\w+)/,
            /^type\s+(\w+)\s+struct/,
            /^type\s+(\w+)\s+interface/,
        ], opts);
    }

    // Ruby patterns
    if (lang === 'ruby') {
        return chunkByPatterns(lines, [
            /^def\s+(\w+)/,
            /^class\s+(\w+)/,
            /^module\s+(\w+)/,
        ], opts);
    }

    // Java/Kotlin patterns
    if (lang === 'java' || lang === 'kotlin') {
        return chunkByPatterns(lines, [
            /^(public|private|protected)?\s*(static\s+)?(async\s+)?(\w+)\s+(\w+)\s*\(/,
            /^class\s+(\w+)/,
            /^interface\s+(\w+)/,
        ], opts);
    }

    return [];
}

/**
 * Chunk by matching patterns to find semantic boundaries
 */
function chunkByPatterns(
    lines: string[],
    patterns: RegExp[],
    opts: Required<ChunkOptions>
): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    const boundaries: Array<{ line: number; name: string; type: string }> = [];

    // Find all semantic boundaries
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                const name = match[match.length - 1] || match[1] || 'anonymous';
                const type = inferTypeFromMatch(line);
                boundaries.push({ line: i, name, type });
                break;
            }
        }
    }

    // No boundaries found
    if (boundaries.length === 0) {
        return [];
    }

    // Create chunks between boundaries
    for (let i = 0; i < boundaries.length; i++) {
        const start = boundaries[i].line;
        const end = i < boundaries.length - 1 ? boundaries[i + 1].line - 1 : lines.length - 1;

        const chunkLines = lines.slice(start, end + 1);
        const content = chunkLines.join('\n');

        // Skip if chunk is too small
        if (content.length < opts.minChunkSize) {
            continue;
        }

        // If chunk is too large, split it
        if (content.length > opts.maxChunkSize) {
            const subChunks = splitLargeChunk(chunkLines, start, opts);
            chunks.push(...subChunks.map((sc) => ({
                ...sc,
                metadata: {
                    ...sc.metadata,
                    name: boundaries[i].name,
                },
            })));
        } else {
            chunks.push({
                content,
                hash: hashContent(content),
                startLine: start + 1,
                endLine: end + 1,
                metadata: {
                    type: boundaries[i].type as any,
                    name: boundaries[i].name,
                },
            });
        }
    }

    return chunks;
}

/**
 * Fall back: chunk by line count with overlap
 */
function lineBasedChunking(
    content: string,
    lines: string[],
    filePath: string,
    language: string | undefined,
    opts: Required<ChunkOptions>
): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    const avgLineLength = content.length / lines.length;
    const linesPerChunk = Math.floor(opts.maxChunkSize / avgLineLength);

    for (let i = 0; i < lines.length; i += linesPerChunk - opts.overlapLines) {
        const startLine = i;
        const endLine = Math.min(i + linesPerChunk, lines.length);
        const chunkLines = lines.slice(startLine, endLine);
        const chunkContent = chunkLines.join('\n');

        if (chunkContent.length >= opts.minChunkSize) {
            chunks.push({
                content: chunkContent,
                hash: hashContent(chunkContent),
                startLine: startLine + 1,
                endLine: endLine,
                metadata: {
                    type: 'section',
                    name: `${getFileName(filePath)}:${startLine + 1}-${endLine}`,
                    language: language || inferLanguage(filePath),
                },
            });
        }
    }

    return chunks;
}

/**
 * Split a large chunk into smaller ones
 */
function splitLargeChunk(
    lines: string[],
    baseStartLine: number,
    opts: Required<ChunkOptions>
): CodeChunk[] {
    const content = lines.join('\n');
    const avgLineLength = content.length / lines.length;
    const linesPerChunk = Math.floor(opts.maxChunkSize / avgLineLength);

    const chunks: CodeChunk[] = [];

    for (let i = 0; i < lines.length; i += linesPerChunk - opts.overlapLines) {
        const startLine = i;
        const endLine = Math.min(i + linesPerChunk, lines.length);
        const chunkLines = lines.slice(startLine, endLine);
        const chunkContent = chunkLines.join('\n');

        if (chunkContent.length >= opts.minChunkSize) {
            chunks.push({
                content: chunkContent,
                hash: hashContent(chunkContent),
                startLine: baseStartLine + startLine + 1,
                endLine: baseStartLine + endLine,
                metadata: {
                    type: 'section',
                },
            });
        }
    }

    return chunks;
}

function inferTypeFromMatch(line: string): string {
    if (/\bfunction\b/.test(line)) return 'function';
    if (/\bclass\b/.test(line)) return 'class';
    if (/\binterface\b/.test(line)) return 'interface';
    if (/\btype\b/.test(line)) return 'type';
    if (/\bconst\b/.test(line)) return 'function'; // Usually const = arrow function
    if (/\bdef\b/.test(line)) return 'function';
    if (/\bmodule\b/.test(line)) return 'module';
    return 'section';
}

function hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
}

function inferLanguage(filePath: string): string | undefined {
    const ext = filePath.split('.').pop()?.toLowerCase();

    const extToLang: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'mjs': 'javascript',
        'cjs': 'javascript',
        'py': 'python',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'java': 'java',
        'kt': 'kotlin',
        'swift': 'swift',
        'cs': 'csharp',
        'cpp': 'cpp',
        'c': 'c',
        'h': 'c',
        'hpp': 'cpp',
        'php': 'php',
        'vue': 'vue',
        'svelte': 'svelte',
        'sql': 'sql',
        'graphql': 'graphql',
        'gql': 'graphql',
        'yaml': 'yaml',
        'yml': 'yaml',
        'json': 'json',
        'md': 'markdown',
        'sh': 'shell',
        'bash': 'shell',
    };

    return ext ? extToLang[ext] : undefined;
}

function extractImports(content: string, language?: string): string[] {
    const imports: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        // JavaScript/TypeScript imports
        const jsImport = line.match(/^import\s+.*from\s+['"]([^'"]+)['"]/);
        if (jsImport) {
            imports.push(jsImport[1]);
            continue;
        }

        // Python imports
        const pyImport = line.match(/^(?:from\s+(\S+)\s+)?import\s+(\S+)/);
        if (pyImport && (language === 'python' || !language)) {
            imports.push(pyImport[1] || pyImport[2]);
            continue;
        }

        // Go imports
        const goImport = line.match(/^\s*"([^"]+)"/);
        if (goImport && language === 'go') {
            imports.push(goImport[1]);
        }
    }

    return [...new Set(imports)];
}

function extractExports(content: string, language?: string): string[] {
    const exports: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        // JavaScript/TypeScript exports
        const jsExport = line.match(/^export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+(\w+)/);
        if (jsExport) {
            exports.push(jsExport[1]);
        }
    }

    return exports;
}
