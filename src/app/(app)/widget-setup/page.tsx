'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Copy, 
  CheckCircle, 
  Globe,
  Palette,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface WorkspaceInfo {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  website: string;
}

export default function WidgetSetupPage() {
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [widgetCodes, setWidgetCodes] = useState({
    html: '',
    react: '',
    vue: '',
    angular: '',
    svelte: '',
    vanilla: ''
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [customization, setCustomization] = useState({
    title: '',
    subtitle: "We're here to help!",
    primaryColor: '#0A4D68',
    accentColor: '#FF6B6B',
    position: 'bottom-right',
  });

  useEffect(() => {
    fetchWorkspaceInfo();
  }, []);

  const handleCompleteOnboarding = () => {
    // Redirect to onboarding if workspace is not set up
    window.location.href = '/setup';
  };

  useEffect(() => {
    if (workspace) {
      generateWidgetCodes();
    }
  }, [workspace, customization]);

  const fetchWorkspaceInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workspace/info');
      if (response.ok) {
        const data = await response.json();
        setWorkspace(data.workspace);
        setCustomization(prev => ({
          ...prev,
          title: `Chat with ${data.workspace.name}`,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch workspace info:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWidgetCodes = () => {
    if (!workspace) return;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const config = {
      apiUrl: baseUrl,
      workspaceId: workspace.id,
      title: customization.title,
      subtitle: customization.subtitle,
      primaryColor: customization.primaryColor,
      accentColor: customization.accentColor,
      position: customization.position
    };

    // HTML/Vanilla JavaScript
    const htmlCode = `<!-- LeadFlow AI Chat Widget -->
<script src="${baseUrl}/widget.js" 
  data-api-url="${config.apiUrl}"
  data-workspace-id="${config.workspaceId}"
  data-title="${config.title}"
  data-subtitle="${config.subtitle}"
  data-primary-color="${config.primaryColor}"
  data-accent-color="${config.accentColor}"
  data-position="${config.position}"></script>`;

    // React/Next.js
    const reactCode = `// Install: npm install react-helmet-async (for Next.js use next/head)
import { Helmet } from 'react-helmet-async';
// For Next.js: import Head from 'next/head';

function App() {
  useEffect(() => {
    // Initialize widget after component mounts
    if (typeof window !== 'undefined' && !window.LeadFlowWidget) {
      const script = document.createElement('script');
      script.src = '${baseUrl}/widget.js';
      script.setAttribute('data-api-url', '${config.apiUrl}');
      script.setAttribute('data-workspace-id', '${config.workspaceId}');
      script.setAttribute('data-title', '${config.title}');
      script.setAttribute('data-subtitle', '${config.subtitle}');
      script.setAttribute('data-primary-color', '${config.primaryColor}');
      script.setAttribute('data-accent-color', '${config.accentColor}');
      script.setAttribute('data-position', '${config.position}');
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div>
      {/* Your app content */}
      
      {/* For Next.js, use Head instead of Helmet */}
      <Helmet>
        <script
          src="${baseUrl}/widget.js"
          data-api-url="${config.apiUrl}"
          data-workspace-id="${config.workspaceId}"
          data-title="${config.title}"
          data-subtitle="${config.subtitle}"
          data-primary-color="${config.primaryColor}"
          data-accent-color="${config.accentColor}"
          data-position="${config.position}"
        />
      </Helmet>
    </div>
  );
}`;

    // Vue.js
    const vueCode = `<!-- Vue.js Component -->
<template>
  <div>
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.loadLeadFlowWidget();
  },
  methods: {
    loadLeadFlowWidget() {
      if (typeof window !== 'undefined' && !window.LeadFlowWidget) {
        const script = document.createElement('script');
        script.src = '${baseUrl}/widget.js';
        script.setAttribute('data-api-url', '${config.apiUrl}');
        script.setAttribute('data-workspace-id', '${config.workspaceId}');
        script.setAttribute('data-title', '${config.title}');
        script.setAttribute('data-subtitle', '${config.subtitle}');
        script.setAttribute('data-primary-color', '${config.primaryColor}');
        script.setAttribute('data-accent-color', '${config.accentColor}');
        script.setAttribute('data-position', '${config.position}');
        document.body.appendChild(script);
      }
    }
  }
}
</script>

<!-- Or add to public/index.html -->
<!-- 
<script src="${baseUrl}/widget.js" 
  data-api-url="${config.apiUrl}"
  data-workspace-id="${config.workspaceId}"
  data-title="${config.title}"
  data-subtitle="${config.subtitle}"
  data-primary-color="${config.primaryColor}"
  data-accent-color="${config.accentColor}"
  data-position="${config.position}"></script>
-->`;

    // Angular
    const angularCode = `// app.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  ngOnInit() {
    this.loadLeadFlowWidget();
  }

  private loadLeadFlowWidget() {
    if (typeof window !== 'undefined' && !(window as any).LeadFlowWidget) {
      const script = document.createElement('script');
      script.src = '${baseUrl}/widget.js';
      script.setAttribute('data-api-url', '${config.apiUrl}');
      script.setAttribute('data-workspace-id', '${config.workspaceId}');
      script.setAttribute('data-title', '${config.title}');
      script.setAttribute('data-subtitle', '${config.subtitle}');
      script.setAttribute('data-primary-color', '${config.primaryColor}');
      script.setAttribute('data-accent-color', '${config.accentColor}');
      script.setAttribute('data-position', '${config.position}');
      document.body.appendChild(script);
    }
  }
}

<!-- Or add to src/index.html -->
<!-- 
<script src="${baseUrl}/widget.js" 
  data-api-url="${config.apiUrl}"
  data-workspace-id="${config.workspaceId}"
  data-title="${config.title}"
  data-subtitle="${config.subtitle}"
  data-primary-color="${config.primaryColor}"
  data-accent-color="${config.accentColor}"
  data-position="${config.position}"></script>
-->`;

    // Svelte
    const svelteCode = `<!-- App.svelte -->
<script>
  import { onMount } from 'svelte';
  
  onMount(() => {
    loadLeadFlowWidget();
  });
  
  function loadLeadFlowWidget() {
    if (typeof window !== 'undefined' && !window.LeadFlowWidget) {
      const script = document.createElement('script');
      script.src = '${baseUrl}/widget.js';
      script.setAttribute('data-api-url', '${config.apiUrl}');
      script.setAttribute('data-workspace-id', '${config.workspaceId}');
      script.setAttribute('data-title', '${config.title}');
      script.setAttribute('data-subtitle', '${config.subtitle}');
      script.setAttribute('data-primary-color', '${config.primaryColor}');
      script.setAttribute('data-accent-color', '${config.accentColor}');
      script.setAttribute('data-position', '${config.position}');
      document.body.appendChild(script);
    }
  }
</script>

<!-- Your app content -->
<main>
  <h1>Hello world!</h1>
</main>

<!-- Or add to public/index.html -->
<!-- 
<script src="${baseUrl}/widget.js" 
  data-api-url="${config.apiUrl}"
  data-workspace-id="${config.workspaceId}"
  data-title="${config.title}"
  data-subtitle="${config.subtitle}"
  data-primary-color="${config.primaryColor}"
  data-accent-color="${config.accentColor}"
  data-position="${config.position}"></script>
-->`;

    // Vanilla JavaScript (programmatic)
    const vanillaCode = `// Vanilla JavaScript - Programmatic Integration
// Add this to your main JavaScript file

// Method 1: Load script dynamically
function loadLeadFlowWidget() {
  if (typeof window !== 'undefined' && !window.LeadFlowWidget) {
    const script = document.createElement('script');
    script.src = '${baseUrl}/widget.js';
    script.setAttribute('data-api-url', '${config.apiUrl}');
    script.setAttribute('data-workspace-id', '${config.workspaceId}');
    script.setAttribute('data-title', '${config.title}');
    script.setAttribute('data-subtitle', '${config.subtitle}');
    script.setAttribute('data-primary-color', '${config.primaryColor}');
    script.setAttribute('data-accent-color', '${config.accentColor}');
    script.setAttribute('data-position', '${config.position}');
    document.body.appendChild(script);
  }
}

// Load when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadLeadFlowWidget);
} else {
  loadLeadFlowWidget();
}

// Method 2: Initialize manually (after loading widget.js)
// window.LeadFlowWidget = new LeadFlowWidget({
//   apiUrl: '${config.apiUrl}',
//   workspaceId: '${config.workspaceId}',
//   title: '${config.title}',
//   subtitle: '${config.subtitle}',
//   primaryColor: '${config.primaryColor}',
//   accentColor: '${config.accentColor}',
//   position: '${config.position}'
// });`;

    setWidgetCodes({
      html: htmlCode,
      react: reactCode,
      vue: vueCode,
      angular: angularCode,
      svelte: svelteCode,
      vanilla: vanillaCode
    });
  };

  const copyToClipboard = async (framework: string) => {
    try {
      await navigator.clipboard.writeText(widgetCodes[framework as keyof typeof widgetCodes]);
      setCopied(framework);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Setup</h1>
          <p className="text-gray-600 mt-1">
            Please complete your workspace setup first
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workspace Setup Required</h3>
            <p className="text-gray-500 mb-4">
              You need to complete your workspace setup before you can generate widget code.
            </p>
            <Button onClick={handleCompleteOnboarding}>
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Widget Setup</h1>
        <p className="text-gray-600 mt-1">
          Add AI-powered lead generation to your website
        </p>
      </div>

      {/* Workspace Info */}
      {workspace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Workspace Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Workspace Name</Label>
                <p className="text-gray-900">{workspace.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Industry</Label>
                <p className="text-gray-900">{workspace.industry}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Company Size</Label>
                <p className="text-gray-900">{workspace.companySize}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Workspace ID</Label>
                <Badge variant="outline" className="font-mono text-xs">
                  {workspace.id}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Widget Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Chat Title</Label>
              <Input
                id="title"
                value={customization.title}
                onChange={(e) => setCustomization(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Chat with us"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Chat Subtitle</Label>
              <Input
                id="subtitle"
                value={customization.subtitle}
                onChange={(e) => setCustomization(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="We're here to help!"
              />
            </div>
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={customization.primaryColor}
                  onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={customization.primaryColor}
                  onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#0A4D68"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={customization.accentColor}
                  onChange={(e) => setCustomization(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={customization.accentColor}
                  onChange={(e) => setCustomization(prev => ({ ...prev, accentColor: e.target.value }))}
                  placeholder="#FF6B6B"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="position">Widget Position</Label>
              <select
                id="position"
                value={customization.position}
                onChange={(e) => setCustomization(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Integration Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Widget Integration Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="vue">Vue</TabsTrigger>
              <TabsTrigger value="angular">Angular</TabsTrigger>
              <TabsTrigger value="svelte">Svelte</TabsTrigger>
              <TabsTrigger value="vanilla">Vanilla JS</TabsTrigger>
            </TabsList>
            
            {Object.entries(widgetCodes).map(([framework, code]) => (
              <TabsContent key={framework} value={framework} className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4 relative">
                  <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
                    <code>{code}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(framework)}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {copied === framework ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Framework-specific instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {framework.charAt(0).toUpperCase() + framework.slice(1)} Integration Instructions
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    {framework === 'html' && (
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Copy the script tag above</li>
                        <li>Paste it into your HTML file, just before the closing &lt;/body&gt; tag</li>
                        <li>Save and publish your website</li>
                        <li>The chat widget will appear automatically</li>
                      </ol>
                    )}
                    {framework === 'react' && (
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Install react-helmet-async: <code className="bg-blue-100 px-1 rounded">npm install react-helmet-async</code></li>
                        <li>For Next.js, use <code className="bg-blue-100 px-1 rounded">next/head</code> instead</li>
                        <li>Copy the component code above</li>
                        <li>Add it to your main App component or layout</li>
                        <li>The widget will initialize when the component mounts</li>
                      </ol>
                    )}
                    {framework === 'vue' && (
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Copy the Vue component code above</li>
                        <li>Add it to your main App.vue or layout component</li>
                        <li>Alternatively, add the script tag to public/index.html</li>
                        <li>The widget will load when the component mounts</li>
                      </ol>
                    )}
                    {framework === 'angular' && (
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Copy the TypeScript code to your app.component.ts</li>
                        <li>Alternatively, add the script tag to src/index.html</li>
                        <li>The widget will initialize in ngOnInit</li>
                        <li>Make sure to handle TypeScript types for window object</li>
                      </ol>
                    )}
                    {framework === 'svelte' && (
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Copy the Svelte component code above</li>
                        <li>Add it to your main App.svelte</li>
                        <li>Alternatively, add the script tag to public/index.html</li>
                        <li>The widget will load in the onMount lifecycle</li>
                      </ol>
                    )}
                    {framework === 'vanilla' && (
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Copy the JavaScript code above</li>
                        <li>Add it to your main JavaScript file</li>
                        <li>Or include the widget.js script directly in HTML</li>
                        <li>Choose between dynamic loading or manual initialization</li>
                      </ol>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              How It Works
            </h4>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Visitors see a chat button on your website</li>
              <li>AI automatically qualifies leads through conversation</li>
              <li>Qualified leads appear in your dashboard with conversation history</li>
              <li>You can follow up with context from the AI conversation</li>
              <li>Works with any frontend framework or plain HTML</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>The widget is lightweight and won't affect your site's performance</li>
              <li>It's mobile-responsive and works on all devices</li>
              <li>HTTPS is required for the widget to function properly</li>
              <li>The widget respects user privacy and GDPR compliance</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Advanced Integration (Optional)</h4>
            <div className="text-sm text-purple-800 space-y-2">
              <p>For advanced users, you can control the widget programmatically:</p>
              <pre className="bg-purple-100 p-3 rounded font-mono text-xs overflow-x-auto">
                <code>{`// Open/close widget
window.LeadFlowAPI.open();
window.LeadFlowAPI.close();
window.LeadFlowAPI.toggle();

// Send messages (to server)
window.LeadFlowAPI.sendMessage('Hello!');
window.LeadFlowAPI.sendToServer('I need help');

// Add local messages (no server)
window.LeadFlowAPI.addLocalMessage('Local msg');
window.LeadFlowAPI.sendMessage('Local', { sendToServer: false });

// Listen to messages & get data
window.LeadFlowAPI.onMessage((msg) => {
  // Handle new message
});
window.LeadFlowAPI.getMessages();
window.LeadFlowAPI.clearMessages();`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Widget Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-6 rounded-lg relative min-h-[300px] border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500 mb-4">
              <h3 className="text-lg font-medium">Your Website Preview</h3>
              <p className="text-sm">This is how the chat widget will appear on your site</p>
            </div>
            
            {/* Mock website content */}
            <div className="bg-white p-4 rounded shadow-sm mb-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Widget preview button */}
            <div 
              className={`fixed ${customization.position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'} z-10`}
              style={{ position: 'absolute' }}
            >
              <button
                className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110"
                style={{ backgroundColor: customization.primaryColor }}
                onClick={() => alert('This is a preview. The actual widget will open a chat interface.')}
              >
                <MessageSquare className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 text-center">
            <p>Click the chat button above to see how visitors will interact with your widget</p>
            <p className="mt-1">Customize the colors and position using the settings above</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}