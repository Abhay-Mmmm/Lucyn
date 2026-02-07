// packages/github/src/ingestion/analyzer.ts
// Code pattern analysis and detection

import type { DirectoryInfo } from '../types';

export interface DetectedPattern {
    type: 'naming' | 'architecture' | 'testing' | 'error-handling' | 'state' | 'api';
    name: string;
    description: string;
    examples: Array<{
        file: string;
        snippet?: string;
    }>;
    confidence: number;
}

/**
 * Analyze repository for common patterns
 */
export async function analyzeRepositoryPatterns(
    directories: Record<string, DirectoryInfo>,
    keyFiles: Array<{ path: string; importance: string; reason: string }>,
    languages: string[]
): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    // Detect architecture patterns
    patterns.push(...detectArchitecturePatterns(directories));

    // Detect naming conventions
    patterns.push(...detectNamingPatterns(Object.keys(directories), keyFiles.map(f => f.path)));

    // Detect testing patterns
    patterns.push(...detectTestingPatterns(directories));

    // Detect API patterns
    patterns.push(...detectAPIPatterns(directories));

    // Detect state management patterns
    patterns.push(...detectStatePatterns(directories));

    return patterns;
}

function detectArchitecturePatterns(
    directories: Record<string, DirectoryInfo>
): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const dirNames = new Set(
        Object.keys(directories).map(d => d.split('/').pop()?.toLowerCase() || '')
    );

    // Monorepo pattern
    if (dirNames.has('apps') && dirNames.has('packages')) {
        patterns.push({
            type: 'architecture',
            name: 'Monorepo Structure',
            description: 'This codebase uses a monorepo architecture with separate apps and shared packages.',
            examples: [
                { file: 'apps/', snippet: 'Contains individual applications' },
                { file: 'packages/', snippet: 'Contains shared libraries' },
            ],
            confidence: 0.95,
        });
    }

    // MVC pattern
    if (dirNames.has('controllers') && dirNames.has('models') && dirNames.has('views')) {
        patterns.push({
            type: 'architecture',
            name: 'MVC Architecture',
            description: 'This codebase follows the Model-View-Controller architectural pattern.',
            examples: [
                { file: 'controllers/', snippet: 'Request handlers' },
                { file: 'models/', snippet: 'Data models' },
                { file: 'views/', snippet: 'Template views' },
            ],
            confidence: 0.9,
        });
    }

    // Clean/Hexagonal architecture
    if ((dirNames.has('domain') || dirNames.has('entities')) &&
        (dirNames.has('use-cases') || dirNames.has('usecases') || dirNames.has('application'))) {
        patterns.push({
            type: 'architecture',
            name: 'Clean Architecture',
            description: 'This codebase follows Clean/Hexagonal architecture with separate domain and use-case layers.',
            examples: [
                { file: 'domain/', snippet: 'Core business entities' },
                { file: 'use-cases/', snippet: 'Application business rules' },
            ],
            confidence: 0.85,
        });
    }

    // Feature-based structure
    if (dirNames.has('features') || dirNames.has('modules')) {
        patterns.push({
            type: 'architecture',
            name: 'Feature-Based Structure',
            description: 'This codebase organizes code by feature or module rather than by type.',
            examples: [
                { file: 'features/', snippet: 'Self-contained feature modules' },
            ],
            confidence: 0.85,
        });
    }

    // Service-oriented
    if (dirNames.has('services') && (dirNames.has('controllers') || dirNames.has('routes'))) {
        patterns.push({
            type: 'architecture',
            name: 'Service Layer Pattern',
            description: 'Business logic is encapsulated in service classes, separate from request handling.',
            examples: [
                { file: 'services/', snippet: 'Business logic services' },
            ],
            confidence: 0.85,
        });
    }

    // Component-based (React/Vue)
    if (dirNames.has('components') && (dirNames.has('pages') || dirNames.has('views'))) {
        patterns.push({
            type: 'architecture',
            name: 'Component-Based UI',
            description: 'UI is built from reusable components composed into pages.',
            examples: [
                { file: 'components/', snippet: 'Reusable UI components' },
                { file: 'pages/', snippet: 'Page-level components' },
            ],
            confidence: 0.9,
        });
    }

    return patterns;
}

function detectNamingPatterns(directories: string[], files: string[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    // Extract file basenames
    const fileNames = files.map(f => f.split('/').pop() || '');

    // PascalCase components
    const pascalCaseFiles = fileNames.filter(f => /^[A-Z][a-z]+([A-Z][a-z]+)*\.(tsx?|jsx?)$/.test(f));
    if (pascalCaseFiles.length > 5) {
        patterns.push({
            type: 'naming',
            name: 'PascalCase Components',
            description: 'React/Vue components use PascalCase naming convention.',
            examples: pascalCaseFiles.slice(0, 3).map(f => ({ file: f })),
            confidence: 0.9,
        });
    }

    // kebab-case files
    const kebabCaseFiles = fileNames.filter(f => /^[a-z]+(-[a-z]+)+\.(ts|js|vue)$/.test(f));
    if (kebabCaseFiles.length > 5) {
        patterns.push({
            type: 'naming',
            name: 'kebab-case Files',
            description: 'Files use kebab-case naming convention.',
            examples: kebabCaseFiles.slice(0, 3).map(f => ({ file: f })),
            confidence: 0.85,
        });
    }

    // .test or .spec suffix
    const testFiles = fileNames.filter(f => /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(f));
    if (testFiles.length > 3) {
        patterns.push({
            type: 'naming',
            name: 'Test File Suffix',
            description: `Test files use ${testFiles[0].includes('.spec.') ? '.spec.' : '.test.'} suffix convention.`,
            examples: testFiles.slice(0, 3).map(f => ({ file: f })),
            confidence: 0.95,
        });
    }

    // index.ts barrel exports
    const indexFiles = files.filter(f => f.endsWith('/index.ts') || f.endsWith('/index.js'));
    if (indexFiles.length > 3) {
        patterns.push({
            type: 'naming',
            name: 'Barrel Exports',
            description: 'Directories use index files for barrel exports.',
            examples: indexFiles.slice(0, 3).map(f => ({ file: f })),
            confidence: 0.9,
        });
    }

    return patterns;
}

function detectTestingPatterns(directories: Record<string, DirectoryInfo>): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const dirNames = Object.keys(directories);

    // __tests__ directory pattern
    const testDirs = dirNames.filter(d => d.includes('__tests__'));
    if (testDirs.length > 0) {
        patterns.push({
            type: 'testing',
            name: 'Colocated Tests',
            description: 'Tests are colocated with source code in __tests__ directories.',
            examples: testDirs.slice(0, 3).map(d => ({ file: d })),
            confidence: 0.9,
        });
    }

    // Separate tests directory
    if (dirNames.some(d => d === 'tests' || d === 'test' || d === 'spec')) {
        patterns.push({
            type: 'testing',
            name: 'Separate Test Directory',
            description: 'Tests are organized in a separate top-level tests directory.',
            examples: [{ file: 'tests/' }],
            confidence: 0.85,
        });
    }

    // E2E tests
    if (dirNames.some(d => d.includes('e2e') || d.includes('integration'))) {
        patterns.push({
            type: 'testing',
            name: 'E2E/Integration Tests',
            description: 'End-to-end or integration tests are maintained separately.',
            examples: [{ file: 'e2e/' }],
            confidence: 0.85,
        });
    }

    // Fixtures/mocks
    if (dirNames.some(d => d.includes('fixtures') || d.includes('mocks'))) {
        patterns.push({
            type: 'testing',
            name: 'Test Fixtures',
            description: 'Test fixtures and mocks are organized in dedicated directories.',
            examples: [{ file: 'fixtures/' }],
            confidence: 0.8,
        });
    }

    return patterns;
}

function detectAPIPatterns(directories: Record<string, DirectoryInfo>): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const dirNames = Object.keys(directories);

    // REST API routes
    if (dirNames.some(d => d.includes('/api/') || d.endsWith('/api'))) {
        patterns.push({
            type: 'api',
            name: 'REST API Structure',
            description: 'API endpoints are organized under /api directory.',
            examples: [{ file: 'api/' }],
            confidence: 0.85,
        });
    }

    // Next.js App Router
    if (dirNames.some(d => d.includes('/app/api/'))) {
        patterns.push({
            type: 'api',
            name: 'Next.js App Router API',
            description: 'API routes follow Next.js App Router convention with route.ts files.',
            examples: [{ file: 'app/api/' }],
            confidence: 0.9,
        });
    }

    // GraphQL
    if (dirNames.some(d => d.includes('graphql') || d.includes('schema'))) {
        patterns.push({
            type: 'api',
            name: 'GraphQL API',
            description: 'API uses GraphQL with organized schema and resolver files.',
            examples: [{ file: 'graphql/' }],
            confidence: 0.8,
        });
    }

    // tRPC
    if (dirNames.some(d => d.includes('trpc') || d.includes('routers'))) {
        patterns.push({
            type: 'api',
            name: 'tRPC API',
            description: 'Type-safe API using tRPC with organized routers.',
            examples: [{ file: 'routers/' }],
            confidence: 0.75,
        });
    }

    return patterns;
}

function detectStatePatterns(directories: Record<string, DirectoryInfo>): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const dirNames = Object.keys(directories);

    // Redux pattern
    if (dirNames.some(d => d.includes('store') || d.includes('redux')) &&
        dirNames.some(d => d.includes('reducers') || d.includes('slices'))) {
        patterns.push({
            type: 'state',
            name: 'Redux State Management',
            description: 'Application state is managed using Redux with organized slices/reducers.',
            examples: [
                { file: 'store/' },
                { file: 'reducers/' },
            ],
            confidence: 0.85,
        });
    }

    // Context-based state
    if (dirNames.some(d => d.includes('contexts') || d.includes('providers'))) {
        patterns.push({
            type: 'state',
            name: 'Context-Based State',
            description: 'State is managed using React Context with organized context providers.',
            examples: [{ file: 'contexts/' }],
            confidence: 0.8,
        });
    }

    // Zustand/Jotai stores
    if (dirNames.some(d => d.includes('stores'))) {
        patterns.push({
            type: 'state',
            name: 'Store-Based State',
            description: 'State is managed using store pattern (Zustand, Jotai, or similar).',
            examples: [{ file: 'stores/' }],
            confidence: 0.75,
        });
    }

    // Hooks-based state
    if (dirNames.some(d => d.includes('hooks'))) {
        patterns.push({
            type: 'state',
            name: 'Custom Hooks',
            description: 'Custom React hooks are used for reusable stateful logic.',
            examples: [{ file: 'hooks/' }],
            confidence: 0.85,
        });
    }

    return patterns;
}

/**
 * Suggest patterns based on common best practices
 */
export function suggestPatterns(
    existingPatterns: DetectedPattern[],
    languages: string[]
): Array<{
    pattern: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
}> {
    const suggestions: Array<{
        pattern: string;
        reason: string;
        priority: 'low' | 'medium' | 'high';
    }> = [];

    const hasPattern = (name: string) =>
        existingPatterns.some(p => p.name.toLowerCase().includes(name.toLowerCase()));

    // Suggest barrel exports if not present
    if (!hasPattern('barrel')) {
        suggestions.push({
            pattern: 'Barrel Exports',
            reason: 'Consider using index.ts files to simplify imports and create clear module boundaries.',
            priority: 'low',
        });
    }

    // Suggest colocated tests if not present
    if (!hasPattern('test') && !hasPattern('spec')) {
        suggestions.push({
            pattern: 'Colocated Tests',
            reason: 'Consider adding tests colocated with source files for better maintainability.',
            priority: 'high',
        });
    }

    // Suggest service layer if only controllers exist
    if (hasPattern('MVC') && !hasPattern('service')) {
        suggestions.push({
            pattern: 'Service Layer',
            reason: 'Consider extracting business logic into services to keep controllers thin.',
            priority: 'medium',
        });
    }

    return suggestions;
}
