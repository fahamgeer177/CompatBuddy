import * as vscode from 'vscode';
import axios from 'axios';

// Configuration
const BACKEND_URL = 'http://localhost:3000';

// Web features to detect
const WEB_FEATURES = {
  // CSS Features
  'container': { 
    pattern: /@container\s+[^{]+\{/g, 
    name: 'css-container-queries',
    languages: ['css', 'scss', 'less']
  },
  'has\\(': { 
    pattern: /:has\s*\([^)]+\)/g, 
    name: 'css-has-selector',
    languages: ['css', 'scss', 'less']
  },
  '@layer': { 
    pattern: /@layer\s+[^{;]+[{;]/g, 
    name: 'css-cascade-layers',
    languages: ['css', 'scss', 'less']
  },
  'subgrid': { 
    pattern: /grid-template-[^:]*:\s*subgrid/g, 
    name: 'css-subgrid',
    languages: ['css', 'scss', 'less']
  },
  'margin-inline|padding-block|inset-inline': { 
    pattern: /(margin-inline|padding-block|inset-inline|border-inline|border-block)(-start|-end)?/g, 
    name: 'css-logical-properties',
    languages: ['css', 'scss', 'less']
  },
  'color\\(': { 
    pattern: /color\s*\([^)]+\)/g, 
    name: 'css-color-function',
    languages: ['css', 'scss', 'less']
  },
  
  // JavaScript APIs
  'ResizeObserver': { 
    pattern: /new\s+ResizeObserver|ResizeObserver\s*\(/g, 
    name: 'resizeobserver',
    languages: ['javascript', 'typescript']
  },
  'IntersectionObserver': { 
    pattern: /new\s+IntersectionObserver|IntersectionObserver\s*\(/g, 
    name: 'intersectionobserver',
    languages: ['javascript', 'typescript']
  },
  'navigator\\.gpu': { 
    pattern: /navigator\.gpu/g, 
    name: 'webgpu',
    languages: ['javascript', 'typescript']
  },
  'navigator\\.share': { 
    pattern: /navigator\.share\s*\(/g, 
    name: 'web-share-api',
    languages: ['javascript', 'typescript']
  }
};

interface FeatureInfo {
  feature: string;
  supportPercentage: number;
  status: string;
  alternative: string;
  fallbackSnippet: string;
  explanation: string;
  source: string;
}

class CompatBuddyProvider implements vscode.HoverProvider, vscode.CodeActionProvider {
  private featureCache = new Map<string, FeatureInfo>();
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('compatbuddy');
  }

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | undefined> {
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return;
    }

    const text = document.getText();
    const line = document.lineAt(position.line);
    
    // Check if current position contains a risky feature
    for (const [featureKey, featureConfig] of Object.entries(WEB_FEATURES)) {
      if (!featureConfig.languages.includes(document.languageId)) {
        continue;
      }

      const regex = new RegExp(featureConfig.pattern);
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const matchStart = document.positionAt(match.index);
        const matchEnd = document.positionAt(match.index + match[0].length);
        const matchRange = new vscode.Range(matchStart, matchEnd);
        
        if (matchRange.contains(position)) {
          const featureInfo = await this.getFeatureInfo(featureConfig.name);
          if (featureInfo) {
            return this.createHoverContent(featureInfo);
          }
        }
      }
    }

    return undefined;
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const actions: vscode.CodeAction[] = [];

    // Check for compatibility diagnostics in the range
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source === 'compatbuddy') {
        const action = new vscode.CodeAction(
          'Insert fallback snippet',
          vscode.CodeActionKind.QuickFix
        );
        
        action.command = {
          command: 'compatbuddy.insertFallback',
          title: 'Insert fallback snippet',
          arguments: [document.uri, range.start, diagnostic.code]
        };
        
        actions.push(action);
      }
    }

    return actions;
  }

  private createHoverContent(featureInfo: FeatureInfo): vscode.Hover {
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;
    markdown.supportHtml = true;

    // Status indicator
    const statusColor = featureInfo.supportPercentage > 85 ? '🟢' : 
                       featureInfo.supportPercentage > 65 ? '🟡' : '🔴';
    
    markdown.appendMarkdown(`### ${statusColor} ${featureInfo.feature}\n\n`);
    markdown.appendMarkdown(`**Browser Support:** ${featureInfo.supportPercentage}% (${featureInfo.status})\n\n`);
    markdown.appendMarkdown(`**Alternative:** ${featureInfo.alternative}\n\n`);
    markdown.appendMarkdown(`${featureInfo.explanation}\n\n`);
    
    // Add insert snippet command
    const insertCommand = `[Insert Fallback Snippet](command:compatbuddy.insertSnippet?${encodeURIComponent(JSON.stringify([featureInfo.fallbackSnippet]))})`;
    markdown.appendMarkdown(`${insertCommand}\n\n`);
    
    markdown.appendMarkdown(`*Source: ${featureInfo.source}*`);

    return new vscode.Hover(markdown);
  }

  async getFeatureInfo(featureName: string): Promise<FeatureInfo | null> {
    if (this.featureCache.has(featureName)) {
      return this.featureCache.get(featureName)!;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/checkFeature`, {
        feature: featureName
      }, {
        timeout: 5000
      });

      const featureInfo = response.data as FeatureInfo;
      this.featureCache.set(featureName, featureInfo);
      return featureInfo;
    } catch (error) {
      console.error(`Failed to fetch feature info for ${featureName}:`, error);
      return null;
    }
  }

  async scanDocument(document: vscode.TextDocument): Promise<void> {
    console.log('Scanning document:', document.fileName, 'Language:', document.languageId);
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    console.log('Document text length:', text.length);

    for (const [featureKey, featureConfig] of Object.entries(WEB_FEATURES)) {
      if (!featureConfig.languages.includes(document.languageId)) {
        console.log(`Skipping feature ${featureKey} - language ${document.languageId} not supported`);
        continue;
      }

      console.log(`Checking feature: ${featureKey} with pattern: ${featureConfig.pattern}`);
      const regex = new RegExp(featureConfig.pattern, 'g');
      let match;

      while ((match = regex.exec(text)) !== null) {
        console.log(`Found match for ${featureKey}:`, match[0]);
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);

        const featureInfo = await this.getFeatureInfo(featureConfig.name);
        if (featureInfo && featureInfo.supportPercentage < 85) {
          console.log(`Creating diagnostic for ${featureInfo.feature} with ${featureInfo.supportPercentage}% support`);
          const diagnostic = new vscode.Diagnostic(
            range,
            `${featureInfo.feature} has ${featureInfo.supportPercentage}% browser support. Consider using: ${featureInfo.alternative}`,
            vscode.DiagnosticSeverity.Warning
          );
          diagnostic.source = 'compatbuddy';
          diagnostic.code = featureConfig.name;
          diagnostics.push(diagnostic);
        }
      }
    }

    console.log(`Setting ${diagnostics.length} diagnostics for document`);
    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  dispose(): void {
    this.diagnosticCollection.dispose();
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('CompatBuddy extension is now active!');
  
  // Show activation message
  vscode.window.showInformationMessage('CompatBuddy extension activated! Open a CSS or JS file to see compatibility warnings.');

  const provider = new CompatBuddyProvider();

  // Register providers
  const hoverProvider = vscode.languages.registerHoverProvider(
    ['javascript', 'typescript', 'css', 'scss', 'less', 'html'],
    provider
  );

  const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    ['javascript', 'typescript', 'css', 'scss', 'less', 'html'],
    provider
  );

  // Commands
  const scanCommand = vscode.commands.registerCommand('compatbuddy.scan', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      console.log('Manual scan triggered for:', editor.document.fileName);
      await provider.scanDocument(editor.document);
      vscode.window.showInformationMessage(`CompatBuddy scan completed for ${editor.document.fileName}!`);
    } else {
      vscode.window.showWarningMessage('No active editor found. Please open a file first.');
    }
  });

  const insertSnippetCommand = vscode.commands.registerCommand('compatbuddy.insertSnippet', 
    async (snippet: string) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const position = editor.selection.active;
        await editor.edit(editBuilder => {
          editBuilder.insert(position, `\n${snippet}\n`);
        });
      }
    }
  );

  const insertFallbackCommand = vscode.commands.registerCommand('compatbuddy.insertFallback',
    async (uri: vscode.Uri, position: vscode.Position, featureName: string) => {
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);
      
      const featureInfo = await provider.getFeatureInfo(featureName);
      if (featureInfo) {
        await editor.edit(editBuilder => {
          editBuilder.insert(position, `\n${featureInfo.fallbackSnippet}\n`);
        });
      }
    }
  );

  // Auto-scan on document changes
  const onDidChangeText = vscode.workspace.onDidChangeTextDocument(async (event) => {
    const document = event.document;
    if (['javascript', 'typescript', 'css', 'scss', 'less', 'html'].includes(document.languageId)) {
      // Debounce scanning
      setTimeout(() => {
        provider.scanDocument(document);
      }, 1000);
    }
  });

  // Scan active document on activation
  const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (editor && ['javascript', 'typescript', 'css', 'scss', 'less', 'html'].includes(editor.document.languageId)) {
      await provider.scanDocument(editor.document);
    }
  });

  // Initial scan
  if (vscode.window.activeTextEditor) {
    provider.scanDocument(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    hoverProvider,
    codeActionProvider,
    scanCommand,
    insertSnippetCommand,
    insertFallbackCommand,
    onDidChangeText,
    onDidChangeActiveEditor,
    provider
  );
}

export function deactivate() {}
