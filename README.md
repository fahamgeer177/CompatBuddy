# 🔍 CompatBuddy

**AI-powered VS Code extension that flags risky web features and suggests safer alternatives using Baseline data.**

[![Version](https://img.shields.io/badge/version-0.0.1-blue)](./package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green)](./backend/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

## ⚡ Quick Start

**Ready to install!** Extension package included: `compatbuddy-0.0.1.vsix` (91.86 KB)

1. Open VS Code → Extensions (`Ctrl+Shift+X`) → ⋯ → "Install from VSIX..." → Select `compatbuddy-0.0.1.vsix`
2. Start backend: `cd backend && npm install && npm start`
3. Open demo files in `./demo/` to see CompatBuddy in action!

## 🚀 Features

- **🔍 Real-time Detection**: Automatically scans `.js`, `.ts`, `.css`, `.html` files for modern web features
- **⚠️ Smart Warnings**: Highlights risky features with compatibility warnings
- **💡 AI-Powered Suggestions**: Provides curated fallback alternatives and code snippets
- **🛠️ One-Click Fixes**: Insert fallback code directly from hover tooltips
- **📊 Support Metrics**: Shows browser support percentages from Baseline data
- **🎯 Curated Mappings**: Pre-configured alternatives for 10+ common risky features

## 🎯 Supported Features

### CSS Features
- **Container Queries** (`@container`) - 72% support
- **:has() Selector** - 68% support  
- **Cascade Layers** (`@layer`) - 78% support
- **CSS Subgrid** - 45% support
- **Logical Properties** - 85% support
- **color() Function** - 70% support

### JavaScript APIs
- **ResizeObserver** - 89% support
- **IntersectionObserver** - 92% support
- **WebGPU** - 45% support (experimental)
- **Web Share API** - 65% support

## 📦 Installation & Setup

### Option 1: Install from .vsix (Ready to Use) ⭐

**Quick Installation - Extension Package Included!**

1. **Use the included package**: `compatbuddy-0.0.1.vsix` (91.86 KB)
2. **Install in VS Code**:
   - Open VS Code
   - Go to Extensions (`Ctrl+Shift+X`)
   - Click ⋯ (More Actions) → "Install from VSIX..."
   - Choose `compatbuddy-0.0.1.vsix` from the project root
3. **Start Backend Service**:
   ```bash
   cd backend
   npm install
   npm start
   ```
4. **Start using**: Open any CSS or JavaScript file to see compatibility warnings!

### Option 2: Build from Source

```bash
# Clone repository
git clone https://github.com/fahamgeer177/CompatBuddy
cd CompatBuddy

# Install extension dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Build the extension
npm run compile

# Start backend service
cd backend
npm start
```

### Option 3: Development Mode

```bash
# Open in VS Code
code .

# Press F5 to launch Extension Development Host
# The extension will be active in the new window
```

### 📦 Extension Package Details

- **File**: `compatbuddy-0.0.1.vsix`
- **Size**: 91.86 KB (optimized for distribution)
- **Contents**: 17 files including extension, backend, and demo files
- **Ready to install**: No build required for end users

## 🎮 Demo & Usage

### Quick Demo

1. **Open Demo Files**: Navigate to `./demo/` folder
2. **Open `risky-features.css`**: See CSS warnings for modern features
3. **Open `modern-apis.js`**: See JavaScript API compatibility warnings
4. **Hover on Warnings**: View detailed compatibility info and alternatives
5. **Click "Insert Fallback"**: Automatically add safer code snippets

### Example Workflow

```css
/* This triggers a warning */
@container sidebar (min-width: 400px) {
  .card { display: grid; }
}
```

**Hover tooltip shows:**
- 🟡 css-container-queries
- **Browser Support:** 72% (limited)
- **Alternative:** Flexbox with media queries
- **[Insert Fallback Snippet]** ← Click to add fallback code

### Commands

- **Command Palette** (`Ctrl+Shift+P`):
  - `CompatBuddy: Scan for Compatibility Issues` - Manual scan
  - `CompatBuddy: Insert Fallback Snippet` - Add safer code

### Auto-Detection

CompatBuddy automatically:
- ✅ Scans files on open and edit
- ✅ Shows red underlines for risky features (<85% support)
- ✅ Provides hover tooltips with compatibility data
- ✅ Offers quick fixes via code actions

## 🏗️ Architecture

### Project Structure
```
CompatBuddy/
├── compatbuddy-0.0.1.vsix     # 📦 Ready-to-install extension package
├── src/                        # VS Code Extension source
│   └── extension.ts            # Main extension logic
├── backend/                    # Node.js API Service
│   ├── server.js              # Express server
│   └── fallback-mappings.json # Curated alternatives
├── demo/                       # Demo files with risky features
│   ├── risky-features.css      # CSS examples
│   ├── modern-apis.js          # JavaScript examples
│   └── index.html              # Demo webpage
├── .vscode/                    # Development configuration
├── package.json                # Extension manifest
└── README.md                  # This file
```

### Backend API

- **POST `/checkFeature`**: Get compatibility data for a feature
- **GET `/features`**: List all supported features
- **GET `/health`**: Service health check

Example API call:
```bash
curl -X POST http://localhost:3000/checkFeature \
  -H "Content-Type: application/json" \
  -d '{"feature": "css-container-queries"}'
```

## ⚙️ Configuration

Access settings via VS Code settings (`Ctrl/Cmd + ,`):

```json
{
  "compatbuddy.backendUrl": "http://localhost:3000",
  "compatbuddy.autoScan": true,
  "compatbuddy.minimumSupportThreshold": 85
}
```

### Settings

- `compatbuddy.backendUrl` - Backend API URL for compatibility checks
- `compatbuddy.autoScan` - Automatically scan files for compatibility issues
- `compatbuddy.minimumSupportThreshold` - Minimum browser support percentage to avoid warnings

## 🛠️ Development

### Building

```bash
# Development build
npm run compile

# Watch mode
npm run watch

# Production build
npm run package

# Create .vsix package for distribution
vsce package
```

### Regenerating Extension Package

To create a new .vsix file after making changes:

```bash
# 1. Ensure all changes are compiled
npm run compile

# 2. Create new package
vsce package

# 3. Install the updated package
code --install-extension compatbuddy-0.0.1.vsix
```

The generated `compatbuddy-0.0.1.vsix` file contains:
- Compiled extension code
- Backend service files
- Demo files for testing
- All necessary dependencies

### Testing

```bash
# Run extension tests
npm run test

# Test backend API
cd backend
curl http://localhost:3000/health
```

### Adding New Features

1. **Update `WEB_FEATURES`** in `src/extension.ts`:
```typescript
'new-feature': {
  pattern: /pattern-to-detect/g,
  name: 'feature-name',
  languages: ['css', 'javascript']
}
```

2. **Add mapping** in `backend/fallback-mappings.json`:
```json
{
  "feature-name": {
    "supportPercentage": 60,
    "status": "limited",
    "alternative": "Suggested alternative",
    "fallbackSnippet": "// Fallback code here"
  }
}
```

## 🎯 Hackathon & Baseline Integration

This project was built for the **Baseline Tooling Hackathon** and integrates with Baseline data to:

- ✅ **Solve real developer problems** - "Is it safe to use yet?" question
- ✅ **Integrate with popular tools** - VS Code (millions of users)
- ✅ **Use Baseline data** - Browser compatibility information
- ✅ **Provide innovative solutions** - Real-time IDE integration
- ✅ **Educational value** - Teaches safer alternatives

### Future Baseline Integration

The architecture is ready for:
- [ ] **Official web-features npm integration**
- [ ] **Live Baseline data updates**
- [ ] **AI-powered suggestions via OpenAI**
- [ ] **GitHub Action for CI/CD**
- [ ] **React dashboard for project analysis**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure backend API compatibility
- Test in Extension Development Host

## 📋 Requirements

- **VS Code**: 1.104.0 or higher
- **Node.js**: 14+ (for backend service)
- **npm**: For dependency management

### Dependencies

**Extension:**
- VS Code Extension API
- TypeScript
- Webpack
- Axios

**Backend:**
- Node.js
- Express.js
- CORS

## 🐛 Known Issues

- Backend service must be running manually (future: auto-start)
- Limited to 10 curated features (future: expand with web-features npm)
- Windows PowerShell command syntax in tasks (future: cross-platform)

## 🎉 Release Notes

### 0.0.1 (October 4, 2025)

**Initial Release - Hackathon Ready**

- ✅ Real-time detection of 10+ modern web features
- ✅ Hover tooltips with browser support data
- ✅ One-click fallback code insertion
- ✅ Backend API for extensibility
- ✅ Complete VS Code integration
- ✅ Demo files and documentation
- ✅ MIT license and open source

**Features:**
- CSS: Container Queries, :has(), Cascade Layers, Subgrid, Logical Properties, color()
- JavaScript: ResizeObserver, IntersectionObserver, WebGPU, Web Share API
- VS Code: Hover providers, diagnostics, code actions, commands
- Backend: Express API, curated mappings, health checks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Web Features](https://github.com/web-platform-dx/web-features) for baseline compatibility data
- [MDN Browser Compatibility Data](https://github.com/mdn/browser-compat-data) for API references
- [Baseline Tooling Hackathon](https://baseline.devpost.com/) for the inspiration
- VS Code Extension API for the excellent development platform

---

**Built for Hackathons 🚀 | Ready to Deploy 📦 | Extensible Architecture 🔧**

*Making the web more compatible, one feature at a time.*
