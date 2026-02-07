// packages/github/src/ingestion/scanner.ts
// Repository structure scanner with language and framework detection

import type { DirectoryInfo, FrameworkDetection } from '../types';

export interface ScanResult {
    directories: Record<string, DirectoryInfo>;
    directoryMap: Record<string, {
        responsibility: string;
        files: string[];
        exports: string[];
    }>;
    keyFiles: Array<{
        path: string;
        importance: 'critical' | 'high' | 'medium';
        reason: string;
    }>;
    frameworks: string[];
    buildTools: string[];
    testingFrameworks: string[];
    packageManager: string | undefined;
    entryPoints: string[];
    summary: string;
    architectureSummary: string;
}

interface TreeItem {
    path: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
}

// Framework detection patterns
const FRAMEWORK_INDICATORS: Record<string, {
    files?: string[];
    dependencies?: string[];
    devDependencies?: string[];
}> = {
    'react': {
        dependencies: ['react', 'react-dom'],
    },
    'next.js': {
        files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
        dependencies: ['next'],
    },
    'vue': {
        files: ['vue.config.js', 'nuxt.config.js', 'nuxt.config.ts'],
        dependencies: ['vue'],
    },
    'nuxt': {
        files: ['nuxt.config.js', 'nuxt.config.ts'],
        dependencies: ['nuxt'],
    },
    'angular': {
        files: ['angular.json'],
        dependencies: ['@angular/core'],
    },
    'express': {
        dependencies: ['express'],
    },
    'fastify': {
        dependencies: ['fastify'],
    },
    'nest.js': {
        dependencies: ['@nestjs/core'],
    },
    'django': {
        files: ['manage.py', 'django.conf'],
    },
    'flask': {
        files: ['app.py', 'wsgi.py'],
    },
    'rails': {
        files: ['Gemfile', 'config/routes.rb'],
    },
    'spring-boot': {
        files: ['pom.xml', 'build.gradle'],
    },
    'tailwindcss': {
        files: ['tailwind.config.js', 'tailwind.config.ts'],
        dependencies: ['tailwindcss'],
    },
    'prisma': {
        files: ['prisma/schema.prisma'],
        dependencies: ['prisma', '@prisma/client'],
    },
};

// Build tool indicators
const BUILD_TOOL_INDICATORS: Record<string, string[]> = {
    'webpack': ['webpack.config.js', 'webpack.config.ts'],
    'vite': ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'],
    'rollup': ['rollup.config.js', 'rollup.config.mjs'],
    'esbuild': ['esbuild.config.js'],
    'turbo': ['turbo.json'],
    'nx': ['nx.json'],
    'gradle': ['build.gradle', 'build.gradle.kts'],
    'maven': ['pom.xml'],
    'cargo': ['Cargo.toml'],
    'make': ['Makefile'],
    'cmake': ['CMakeLists.txt'],
};

// Testing framework indicators
const TESTING_INDICATORS: Record<string, {
    files?: string[];
    dependencies?: string[];
}> = {
    'jest': {
        files: ['jest.config.js', 'jest.config.ts'],
        dependencies: ['jest'],
    },
    'vitest': {
        files: ['vitest.config.js', 'vitest.config.ts'],
        dependencies: ['vitest'],
    },
    'mocha': {
        files: ['.mocharc.js', '.mocharc.json'],
        dependencies: ['mocha'],
    },
    'pytest': {
        files: ['pytest.ini', 'conftest.py'],
    },
    'cypress': {
        files: ['cypress.config.js', 'cypress.config.ts'],
        dependencies: ['cypress'],
    },
    'playwright': {
        files: ['playwright.config.js', 'playwright.config.ts'],
        dependencies: ['@playwright/test'],
    },
    'rspec': {
        files: ['spec/spec_helper.rb'],
    },
    'junit': {
        files: ['src/test/java'],
    },
};

// Directory responsibility patterns
const DIRECTORY_PATTERNS: Record<string, string> = {
    'src': 'Main source code',
    'lib': 'Library/utility code',
    'utils': 'Utility functions',
    'helpers': 'Helper functions',
    'components': 'UI components',
    'pages': 'Page components/routes',
    'app': 'Application core/routes',
    'api': 'API routes/endpoints',
    'routes': 'Route handlers',
    'controllers': 'Request controllers',
    'services': 'Business logic services',
    'models': 'Data models',
    'entities': 'Database entities',
    'schemas': 'Schema definitions',
    'types': 'Type definitions',
    'interfaces': 'Interface definitions',
    'middleware': 'Middleware functions',
    'hooks': 'React/Vue hooks',
    'stores': 'State management stores',
    'reducers': 'Redux reducers',
    'actions': 'Redux/Flux actions',
    'contexts': 'React contexts',
    'providers': 'Context providers',
    'layouts': 'Layout components',
    'templates': 'Template files',
    'views': 'View templates',
    'public': 'Static public assets',
    'static': 'Static files',
    'assets': 'Asset files',
    'images': 'Image assets',
    'styles': 'Stylesheet files',
    'css': 'CSS stylesheets',
    'config': 'Configuration files',
    'constants': 'Constant definitions',
    'tests': 'Test files',
    '__tests__': 'Test files',
    'spec': 'Test specifications',
    'scripts': 'Build/automation scripts',
    'bin': 'Executable scripts',
    'migrations': 'Database migrations',
    'seeds': 'Database seeds',
    'fixtures': 'Test fixtures',
    'mocks': 'Mock data/functions',
    'docs': 'Documentation',
    'examples': 'Example code',
    'packages': 'Monorepo packages',
    'apps': 'Monorepo applications',
    'workers': 'Background workers',
    'jobs': 'Background jobs',
    'queues': 'Queue definitions',
    'handlers': 'Event handlers',
    'events': 'Event definitions',
    'prisma': 'Prisma schema and migrations',
    'database': 'Database-related code',
    'db': 'Database-related code',
};

// Key file patterns
const KEY_FILE_PATTERNS: Array<{
    pattern: RegExp | string;
    importance: 'critical' | 'high' | 'medium';
    reason: string;
}> = [
        { pattern: 'package.json', importance: 'critical', reason: 'Project configuration and dependencies' },
        { pattern: 'tsconfig.json', importance: 'high', reason: 'TypeScript configuration' },
        { pattern: /.+\.config\.(js|ts|mjs)$/, importance: 'high', reason: 'Build/tool configuration' },
        { pattern: 'README.md', importance: 'high', reason: 'Project documentation' },
        { pattern: /prisma\/schema\.prisma$/, importance: 'critical', reason: 'Database schema' },
        { pattern: /Dockerfile$/, importance: 'high', reason: 'Container configuration' },
        { pattern: /docker-compose\.ya?ml$/, importance: 'high', reason: 'Docker orchestration' },
        { pattern: /\.env\.example$/, importance: 'medium', reason: 'Environment variable template' },
        { pattern: /index\.(ts|js|tsx|jsx)$/, importance: 'medium', reason: 'Module entry point' },
        { pattern: /main\.(ts|js|py|go|rs)$/, importance: 'high', reason: 'Application entry point' },
        { pattern: /app\.(ts|js|tsx|jsx|py)$/, importance: 'high', reason: 'Application entry point' },
        { pattern: /routes?\.(ts|js)$/, importance: 'medium', reason: 'Route definitions' },
        { pattern: /schema\.(ts|js|graphql)$/, importance: 'high', reason: 'Schema definition' },
    ];

/**
 * Scan repository structure and detect frameworks, patterns
 */
export async function scanRepository(
    tree: TreeItem[],
    defaultBranch: string
): Promise<ScanResult> {
    const directories: Record<string, DirectoryInfo> = {};
    const fileList: string[] = [];
    const directoryList = new Set<string>();

    // Categorize files and directories
    for (const item of tree) {
        if (item.type === 'blob') {
            fileList.push(item.path);

            // Track parent directories
            const parts = item.path.split('/');
            let currentPath = '';
            for (let i = 0; i < parts.length - 1; i++) {
                currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
                directoryList.add(currentPath);
            }
        }
    }

    // Build directory info
    for (const dirPath of directoryList) {
        const dirName = dirPath.split('/').pop() || dirPath;
        const filesInDir = fileList.filter((f) => {
            const parts = f.split('/');
            parts.pop(); // Remove filename
            return parts.join('/') === dirPath;
        });

        const subdirs = Array.from(directoryList).filter((d) => {
            const parts = d.split('/');
            parts.pop();
            return parts.join('/') === dirPath;
        });

        directories[dirPath] = {
            path: dirPath,
            responsibility: DIRECTORY_PATTERNS[dirName.toLowerCase()],
            files: filesInDir.map((f) => f.split('/').pop() || f),
            subdirectories: subdirs.map((d) => d.split('/').pop() || d),
        };
    }

    // Detect frameworks
    const frameworkDetection = detectFrameworks(fileList);

    // Detect build tools
    const buildTools = detectBuildTools(fileList);

    // Detect testing frameworks
    const testingFrameworks = detectTestingFrameworks(fileList);

    // Find key files
    const keyFiles = findKeyFiles(fileList);

    // Find entry points
    const entryPoints = findEntryPoints(fileList);

    // Build directory map (simplified version for storage)
    const directoryMap: Record<string, {
        responsibility: string;
        files: string[];
        exports: string[];
    }> = {};

    for (const [path, info] of Object.entries(directories)) {
        if (info.responsibility) {
            directoryMap[path] = {
                responsibility: info.responsibility,
                files: info.files,
                exports: [], // Would need AST analysis
            };
        }
    }

    // Generate summary
    const summary = generateRepositorySummary(
        fileList.length,
        frameworkDetection,
        buildTools,
        Object.keys(directoryMap).length
    );

    const architectureSummary = generateArchitectureSummary(
        directories,
        frameworkDetection,
        entryPoints
    );

    return {
        directories,
        directoryMap,
        keyFiles,
        frameworks: frameworkDetection.frameworks,
        buildTools,
        testingFrameworks,
        packageManager: frameworkDetection.packageManager,
        entryPoints,
        summary,
        architectureSummary,
    };
}

function detectFrameworks(files: string[]): FrameworkDetection {
    const detected: string[] = [];
    const buildTools: string[] = [];
    const testingFrameworks: string[] = [];
    let packageManager: string | undefined;

    const fileSet = new Set(files.map((f) => f.toLowerCase()));

    // Check for package managers
    if (fileSet.has('package-lock.json') || fileSet.has('package.json')) {
        packageManager = 'npm';
    } else if (fileSet.has('yarn.lock')) {
        packageManager = 'yarn';
    } else if (fileSet.has('pnpm-lock.yaml')) {
        packageManager = 'pnpm';
    } else if (fileSet.has('bun.lockb')) {
        packageManager = 'bun';
    } else if (fileSet.has('requirements.txt') || fileSet.has('pyproject.toml')) {
        packageManager = 'pip';
    } else if (fileSet.has('gemfile')) {
        packageManager = 'bundler';
    } else if (fileSet.has('go.mod')) {
        packageManager = 'go modules';
    } else if (fileSet.has('cargo.toml')) {
        packageManager = 'cargo';
    }

    // Detect frameworks from file presence
    for (const [framework, indicators] of Object.entries(FRAMEWORK_INDICATORS)) {
        if (indicators.files) {
            for (const file of indicators.files) {
                if (files.some((f) => f.toLowerCase().endsWith(file.toLowerCase()))) {
                    detected.push(framework);
                    break;
                }
            }
        }
    }

    return {
        frameworks: [...new Set(detected)],
        buildTools,
        testingFrameworks,
        packageManager,
    };
}

function detectBuildTools(files: string[]): string[] {
    const detected: string[] = [];

    for (const [tool, patterns] of Object.entries(BUILD_TOOL_INDICATORS)) {
        for (const pattern of patterns) {
            if (files.some((f) => f.toLowerCase().endsWith(pattern.toLowerCase()))) {
                detected.push(tool);
                break;
            }
        }
    }

    return [...new Set(detected)];
}

function detectTestingFrameworks(files: string[]): string[] {
    const detected: string[] = [];

    for (const [framework, indicators] of Object.entries(TESTING_INDICATORS)) {
        if (indicators.files) {
            for (const file of indicators.files) {
                if (files.some((f) => f.toLowerCase().includes(file.toLowerCase()))) {
                    detected.push(framework);
                    break;
                }
            }
        }
    }

    return [...new Set(detected)];
}

function findKeyFiles(files: string[]): Array<{
    path: string;
    importance: 'critical' | 'high' | 'medium';
    reason: string;
}> {
    const keyFiles: Array<{
        path: string;
        importance: 'critical' | 'high' | 'medium';
        reason: string;
    }> = [];

    for (const file of files) {
        for (const { pattern, importance, reason } of KEY_FILE_PATTERNS) {
            const matches = typeof pattern === 'string'
                ? file.toLowerCase().endsWith(pattern.toLowerCase())
                : pattern.test(file);

            if (matches) {
                keyFiles.push({ path: file, importance, reason });
                break;
            }
        }
    }

    // Sort by importance
    const importanceOrder: Record<string, number> = { critical: 0, high: 1, medium: 2 };
    keyFiles.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance]);

    return keyFiles.slice(0, 50); // Limit to top 50
}

function findEntryPoints(files: string[]): string[] {
    const entryPoints: string[] = [];

    const entryPatterns = [
        /^src\/index\.(ts|js|tsx|jsx)$/,
        /^src\/main\.(ts|js|py|go|rs)$/,
        /^src\/app\.(ts|js|tsx|jsx)$/,
        /^app\/page\.(ts|js|tsx|jsx)$/, // Next.js App Router
        /^pages\/index\.(ts|js|tsx|jsx)$/, // Next.js Pages Router
        /^index\.(ts|js|tsx|jsx)$/,
        /^main\.(ts|js|py|go|rs)$/,
        /^app\.py$/,
        /^server\.(ts|js)$/,
    ];

    for (const file of files) {
        for (const pattern of entryPatterns) {
            if (pattern.test(file)) {
                entryPoints.push(file);
                break;
            }
        }
    }

    return entryPoints;
}

function generateRepositorySummary(
    fileCount: number,
    frameworks: FrameworkDetection,
    buildTools: string[],
    directoryCount: number
): string {
    const parts: string[] = [];

    parts.push(`This repository contains ${fileCount} files organized across ${directoryCount} directories.`);

    if (frameworks.frameworks.length > 0) {
        parts.push(`It uses ${frameworks.frameworks.join(', ')} as its main framework(s).`);
    }

    if (buildTools.length > 0) {
        parts.push(`Build tools include ${buildTools.join(', ')}.`);
    }

    if (frameworks.packageManager) {
        parts.push(`Package management is handled by ${frameworks.packageManager}.`);
    }

    return parts.join(' ');
}

function generateArchitectureSummary(
    directories: Record<string, DirectoryInfo>,
    frameworks: FrameworkDetection,
    entryPoints: string[]
): string {
    const parts: string[] = [];

    // Identify architecture style
    const dirNames = Object.keys(directories).map((d) => d.split('/').pop()?.toLowerCase() || '');

    if (dirNames.includes('apps') && dirNames.includes('packages')) {
        parts.push('This is a monorepo with multiple applications and shared packages.');
    } else if (dirNames.includes('components') && dirNames.includes('pages')) {
        parts.push('This follows a typical frontend application structure with components and pages.');
    } else if (dirNames.includes('controllers') && dirNames.includes('services')) {
        parts.push('This follows an MVC or service-oriented architecture pattern.');
    } else if (dirNames.includes('api') && dirNames.includes('lib')) {
        parts.push('This follows a modular architecture with API routes and library code.');
    }

    if (entryPoints.length > 0) {
        parts.push(`Main entry points: ${entryPoints.slice(0, 3).join(', ')}.`);
    }

    return parts.join(' ');
}
