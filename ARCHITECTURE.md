# 🏗️ Technical Architecture

## Overview
CompatBuddy is a VS Code extension that provides real-time web feature compatibility checking through a client-server architecture.

## System Design

```
┌─────────────────┐    HTTP API    ┌──────────────────┐
│  VS Code        │   ────────►    │  Backend API     │
│  Extension      │                │  (Node.js)       │
│  (TypeScript)   │   ◄────────    │                  │
└─────────────────┘                └──────────────────┘
        │                                    │
        │                                    │
        ▼                                    ▼
┌─────────────────┐                ┌──────────────────┐
│  User Files     │                │  Compatibility   │
│  (.css, .js)    │                │  Database        │
└─────────────────┘                └──────────────────┘
```

## Components

### 1. VS Code Extension (`src/extension.ts`)

**Core Classes:**
- `CompatBuddyProvider` - Main provider implementing VS Code interfaces
- Implements: `HoverProvider`, `CodeActionProvider`
- Manages: `DiagnosticCollection` for warnings

**Feature Detection:**
- Regex-based pattern matching for web features
- Multi-language support (CSS, JS, TS, HTML)
- Real-time scanning on file changes

**User Interface:**
- Hover tooltips with compatibility data
- Red underlines for risky features
- Quick fix code actions
- Command palette integration

### 2. Backend API (`backend/server.js`)

**Express.js Server:**
- RESTful API endpoints
- CORS enabled for cross-origin requests
- In-memory caching for performance

**Endpoints:**
- `POST /checkFeature` - Feature compatibility lookup
- `GET /features` - List available features
- `GET /health` - Service health check

**Data Sources:**
- Curated mappings (`fallback-mappings.json`)
- Ready for web-features npm integration
- Extensible for AI-powered suggestions

### 3. Compatibility Database (`backend/fallback-mappings.json`)

**Structure:**
```json
{
  "feature-name": {
    "supportPercentage": 72,
    "status": "limited|stable|experimental",
    "alternative": "Human-readable suggestion",
    "fallbackSnippet": "// Working code example",
    "explanation": "Detailed explanation"
  }
}
```

**Features Covered:**
- 6 CSS features (Container Queries, :has(), Layers, etc.)
- 4 JavaScript APIs (ResizeObserver, WebGPU, etc.)

## Data Flow

### 1. Feature Detection
```
File Change → Regex Scan → Pattern Match → API Request → Cache Check → Response
```

### 2. User Interaction
```
Hover → Provider → Backend → Compatibility Data → Tooltip Render
Click → Code Action → Snippet Insert → File Update
```

### 3. Caching Strategy
```
Feature Request → Memory Cache Check → Hit/Miss → API Call → Cache Update
```

## Extension Points

### VS Code APIs Used
- `vscode.languages.registerHoverProvider()` - Tooltip functionality
- `vscode.languages.registerCodeActionsProvider()` - Quick fixes
- `vscode.languages.createDiagnosticCollection()` - Warning system
- `vscode.commands.registerCommand()` - Command palette
- `vscode.workspace.onDidChangeTextDocument()` - Auto-scanning

### Pattern Matching System
```typescript
const WEB_FEATURES = {
  'container': { 
    pattern: /@container\s+[^{]+\{/g, 
    name: 'css-container-queries',
    languages: ['css', 'scss', 'less']
  }
  // ... more patterns
}
```

## Performance Characteristics

### Scanning Performance
- **File Size**: O(n) where n = file length
- **Pattern Count**: O(m) where m = number of features
- **Total Complexity**: O(n × m) per file scan
- **Optimization**: Debounced scanning (1s delay)

### Memory Usage
- **Extension**: ~2MB baseline + file content
- **Backend**: ~10MB baseline + feature cache
- **Cache**: <1KB per cached feature

### Network Calls
- **Frequency**: Once per unique feature per session
- **Payload**: ~500 bytes request, ~2KB response
- **Timeout**: 5 seconds with fallback

## Scalability Considerations

### Current Limits
- 10 curated features (expandable)
- Single backend instance
- File-based compatibility data

### Future Scaling
- Microservices architecture
- Database-backed feature storage
- CDN for compatibility data
- Distributed caching

## Security Model

### Extension Sandbox
- Runs in VS Code extension host
- Limited to file system access within workspace
- No direct system calls

### Backend Security
- CORS configured for localhost
- No authentication (local development)
- Input validation on API endpoints

### Data Privacy
- No telemetry collection
- Local-only processing
- No external data transmission

## Technology Stack

### Frontend
- **TypeScript 5.9** - Type safety and modern JS
- **VS Code Extension API** - Editor integration
- **Webpack** - Bundling and optimization

### Backend
- **Node.js 14+** - JavaScript runtime
- **Express.js 4.18** - Web framework
- **Axios** - HTTP client

### Development
- **ESLint** - Code linting
- **VS Code Tasks** - Build automation
- **Jest** (planned) - Unit testing

## Deployment Architecture

### Development
```
Local Machine → VS Code Extension Host → Local Backend (port 3000)
```

### Production (Future)
```
VS Code Marketplace → User Installation → Cloud Backend API
```

## Extension Lifecycle

### Activation
1. VS Code loads extension on file open
2. Registers providers and commands
3. Initializes diagnostic collection
4. Connects to backend service

### Runtime
1. User opens supported file
2. Extension scans for patterns
3. Calls backend for compatibility data
4. Displays warnings and tooltips
5. Provides quick fix actions

### Deactivation
1. Disposes diagnostic collection
2. Cleans up event listeners
3. Releases resources

---

**Architecture designed for:**
- 🚀 **Performance** - Fast pattern matching and caching
- 🔧 **Extensibility** - Easy to add new features and data sources
- 📊 **Scalability** - Ready for web-features npm integration
- 🛡️ **Reliability** - Error handling and fallback mechanisms