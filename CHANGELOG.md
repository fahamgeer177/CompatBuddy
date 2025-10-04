# Change Log

All notable changes to the "CompatBuddy" extension will be documented in this file.

## [0.0.1] - 2025-10-04

### Added
- Initial release of CompatBuddy extension
- Real-time detection of 10+ modern web features in CSS and JavaScript files
- Hover tooltips showing browser support percentages and alternatives
- One-click fallback code insertion
- Backend API service for compatibility data
- Support for CSS Container Queries, :has() selector, Cascade Layers, Subgrid, Logical Properties, color() function
- Support for JavaScript APIs: ResizeObserver, IntersectionObserver, WebGPU, Web Share API
- Command palette integration for manual scanning
- Auto-scanning on file changes
- Curated fallback mappings with practical alternatives
- Demo files showcasing detected features
- Comprehensive documentation and installation guide

### Features
- **Real-time Compatibility Checking**: Automatic scanning of CSS, JavaScript, TypeScript, and HTML files
- **Smart Warnings**: Visual indicators (red underlines) for features with <85% browser support
- **Interactive Tooltips**: Hover for detailed compatibility information and suggestions
- **Quick Fixes**: Insert fallback code snippets with a single click
- **Backend Integration**: RESTful API for extensible compatibility checking
- **Multi-language Support**: Detects features across multiple file types
- **VS Code Integration**: Native VS Code extension with full IDE integration

### Technical Details
- Built with TypeScript and VS Code Extension API
- Node.js + Express backend service
- Webpack bundling for optimized performance
- Regex-based pattern matching for feature detection
- Diagnostic collection for warning management
- Hover and CodeAction providers for user interaction