# CompatBuddy Development Guidelines

## Project Overview
CompatBuddy is an AI-powered VS Code extension that flags risky web features and suggests safer alternatives using Baseline data.

## Architecture
- **Frontend**: VS Code Extension (TypeScript)
- **Backend**: Node.js + Express API
- **Data**: Curated compatibility mappings with Baseline integration ready

## Development Workflow
1. Extension source code in `src/extension.ts`
2. Backend service in `backend/`
3. Demo files in `demo/` for testing
4. Build with `npm run compile`
5. Test with `F5` (Extension Development Host)

## Key Features
- Real-time feature detection for CSS and JavaScript
- Hover tooltips with compatibility data
- One-click fallback code insertion
- Support for 10+ modern web features

## Hackathon Submission Ready
- ✅ Integrates Baseline data concept
- ✅ Solves real developer problems
- ✅ Complete VS Code extension
- ✅ Open source (MIT License)
- ✅ Demo-ready with examples