(function() {
  'use strict';

  // LeadFlow AI Chat Widget
  class LeadFlowWidget {
    constructor(config = {}) {
      this.config = {
        apiUrl: config.apiUrl || 'https://your-domain.com',
        workspaceId: config.workspaceId || 'default-workspace',
        position: config.position || 'bottom-right',
        primaryColor: config.primaryColor || '#0A4D68',
        accentColor: config.accentColor || '#FF6B6B',
        title: config.title || 'Chat with us',
        subtitle: config.subtitle || 'We\'re here to help!',
        placeholder: config.placeholder || 'Type your message...',
        ...config
      };
      
      this.isOpen = false;
      this.conversationId = null;
      this.messages = [];
      
      this.init();
    }

    init() {
      this.createStyles();
      this.createWidget();
      this.bindEvents();
    }

    createStyles() {
      const styles = `
        .leadflow-widget {
          position: fixed;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .leadflow-widget.bottom-right {
          bottom: 20px;
          right: 20px;
        }
        
        .leadflow-widget.bottom-left {
          bottom: 20px;
          left: 20px;
        }
        
        .leadflow-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .leadflow-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        
        .leadflow-toggle svg {
          width: 24px;
          height: 24px;
          fill: white;
        }
        
        .leadflow-chat {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        
        .leadflow-chat.open {
          display: flex;
        }
        
        .leadflow-header {
          background: ${this.config.primaryColor};
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .leadflow-header-content h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .leadflow-header-content p {
          margin: 4px 0 0 0;
          font-size: 12px;
          opacity: 0.8;
        }
        
        .leadflow-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
        }
        
        .leadflow-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .leadflow-message {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .leadflow-message.user {
          background: ${this.config.primaryColor};
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        
        .leadflow-message.bot {
          background: #f1f5f9;
          color: #334155;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        
        .leadflow-typing {
          display: none;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #f1f5f9;
          border-radius: 12px;
          align-self: flex-start;
          max-width: 80px;
        }
        
        .leadflow-typing.show {
          display: flex;
        }
        
        .leadflow-typing-dot {
          width: 6px;
          height: 6px;
          background: #94a3b8;
          border-radius: 50%;
          animation: leadflow-bounce 1.4s infinite ease-in-out;
        }
        
        .leadflow-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .leadflow-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes leadflow-bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .leadflow-input-container {
          padding: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
        }
        
        .leadflow-input {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 14px;
          outline: none;
          resize: none;
          max-height: 80px;
        }
        
        .leadflow-input:focus {
          border-color: ${this.config.primaryColor};
        }
        
        .leadflow-send {
          background: ${this.config.primaryColor};
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .leadflow-send:hover {
          background: ${this.config.accentColor};
        }
        
        .leadflow-send:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
        
        .leadflow-send svg {
          width: 16px;
          height: 16px;
          fill: white;
        }
        
        @media (max-width: 480px) {
          .leadflow-chat {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            bottom: 80px;
            right: 20px;
          }
        }
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    createWidget() {
      const widget = document.createElement('div');
      widget.className = `leadflow-widget ${this.config.position}`;
      
      widget.innerHTML = `
        <button class="leadflow-toggle" id="leadflow-toggle">
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        
        <div class="leadflow-chat" id="leadflow-chat">
          <div class="leadflow-header">
            <div class="leadflow-header-content">
              <h3>${this.config.title}</h3>
              <p>${this.config.subtitle}</p>
            </div>
            <button class="leadflow-close" id="leadflow-close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          
          <div class="leadflow-messages" id="leadflow-messages">
            <div class="leadflow-message bot">
              Hi! I'm here to help you learn more about our services. What can I assist you with today?
            </div>
            <div class="leadflow-typing" id="leadflow-typing">
              <div class="leadflow-typing-dot"></div>
              <div class="leadflow-typing-dot"></div>
              <div class="leadflow-typing-dot"></div>
            </div>
          </div>
          
          <div class="leadflow-input-container">
            <textarea 
              class="leadflow-input" 
              id="leadflow-input" 
              placeholder="${this.config.placeholder}"
              rows="1"
            ></textarea>
            <button class="leadflow-send" id="leadflow-send">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(widget);
      this.widget = widget;
    }

    bindEvents() {
      const toggle = document.getElementById('leadflow-toggle');
      const close = document.getElementById('leadflow-close');
      const input = document.getElementById('leadflow-input');
      const send = document.getElementById('leadflow-send');
      
      toggle.addEventListener('click', () => this.toggleChat());
      close.addEventListener('click', () => this.closeChat());
      send.addEventListener('click', () => this.sendMessage());
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      input.addEventListener('input', () => {
        this.autoResize(input);
      });
    }

    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    }

    openChat() {
      const chat = document.getElementById('leadflow-chat');
      chat.classList.add('open');
      this.isOpen = true;
      
      // Focus input
      setTimeout(() => {
        document.getElementById('leadflow-input').focus();
      }, 100);
    }

    closeChat() {
      const chat = document.getElementById('leadflow-chat');
      chat.classList.remove('open');
      this.isOpen = false;
    }

    async sendMessage(messageText = null) {
      const input = document.getElementById('leadflow-input');
      let message;
      
      if (messageText) {
        // Use provided message text
        message = messageText.trim();
        // Set input value for visual feedback
        input.value = message;
        this.autoResize(input);
      } else {
        // Use input field value
        message = input.value.trim();
      }
      
      if (!message) return;
      
      // Add user message
      this.addMessage(message, 'user');
      input.value = '';
      this.autoResize(input);
      
      // Show typing indicator
      this.showTyping();
      
      try {
        // Send to API
        const response = await fetch(`${this.config.apiUrl}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationId: this.conversationId,
            leadData: this.extractLeadData(),
            workspaceId: this.config.workspaceId
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        const data = await response.json();
        
        // Update conversation ID if new
        if (data.conversationId && !this.conversationId) {
          this.conversationId = data.conversationId;
        }
        
        // Hide typing and add bot response
        this.hideTyping();
        this.addMessage(data.message, 'bot');
        
      } catch (error) {
        console.error('Chat error:', error);
        this.hideTyping();
        this.addMessage('Sorry, I\'m having trouble connecting right now. Please try again later.', 'bot');
      }
    }

    // Method to add a message locally without sending to server
    addLocalMessage(text, sender = 'user') {
      this.addMessage(text, sender);
    }

    // Method to send a message programmatically (both display and send to server)
    async sendProgrammaticMessage(messageText) {
      if (!messageText || !messageText.trim()) return;
      
      // Open chat if not already open
      if (!this.isOpen) {
        this.openChat();
      }
      
      // Send the message
      await this.sendMessage(messageText.trim());
    }

    addMessage(text, sender) {
      const messages = document.getElementById('leadflow-messages');
      const message = document.createElement('div');
      message.className = `leadflow-message ${sender}`;
      message.textContent = text;
      
      // Insert before typing indicator
      const typing = document.getElementById('leadflow-typing');
      messages.insertBefore(message, typing);
      
      // Scroll to bottom
      messages.scrollTop = messages.scrollHeight;
      
      // Store message
      const messageData = { text, sender, timestamp: new Date() };
      this.messages.push(messageData);
      
      // Call callback if set (for framework integration)
      if (this.onMessageCallback) {
        this.onMessageCallback(messageData);
      }
    }

    showTyping() {
      const typing = document.getElementById('leadflow-typing');
      typing.classList.add('show');
      
      const messages = document.getElementById('leadflow-messages');
      messages.scrollTop = messages.scrollHeight;
    }

    hideTyping() {
      const typing = document.getElementById('leadflow-typing');
      typing.classList.remove('show');
    }

    autoResize(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    }

    extractLeadData() {
      // Extract any lead data from the conversation or config
      const leadData = {};
      
      // Check if we have any lead info from previous messages
      if (this.messages.length > 0) {
        // Simple extraction - in a real implementation, you'd use NLP
        const userMessages = this.messages.filter(m => m.sender === 'user');
        const allText = userMessages.map(m => m.text).join(' ').toLowerCase();
        
        // Extract email if mentioned
        const emailMatch = allText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) {
          leadData.email = emailMatch[0];
        }
        
        // Extract company if mentioned
        const companyPatterns = [
          /(?:work at|from|company is|at) ([A-Za-z0-9\s]+?)(?:\.|,|$)/,
          /(?:i'm with|we're) ([A-Za-z0-9\s]+?)(?:\.|,|$)/
        ];
        
        for (const pattern of companyPatterns) {
          const match = allText.match(pattern);
          if (match && match[1].trim().length > 2) {
            leadData.company = match[1].trim();
            break;
          }
        }
      }
      
      return leadData;
    }
  }

  // Auto-initialize widget when DOM is ready
  function initWidget() {
    // Prevent multiple initializations
    if (window.LeadFlowWidget && window.LeadFlowWidget.initialized) {
      return;
    }

    // Get configuration from script tag
    const script = document.querySelector('script[src*="widget.js"]');
    const config = {};
    
    if (script) {
      // Parse data attributes
      const attrs = script.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.name.startsWith('data-')) {
          const key = attr.name.replace('data-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          config[key] = attr.value;
        }
      }
    }
    
    // Initialize widget
    const widget = new LeadFlowWidget(config);
    widget.initialized = true;
    window.LeadFlowWidget = widget;
    
    // Expose global methods for framework integration
    window.LeadFlowAPI = {
      open: () => widget.openChat(),
      close: () => widget.closeChat(),
      toggle: () => widget.toggleChat(),
      isOpen: () => widget.isOpen,
      
      // Enhanced sendMessage method with multiple modes
      sendMessage: (message, options = {}) => {
        if (!message) return;
        
        const { 
          sendToServer = true,  // Whether to send to server (default: true)
          sender = 'user',      // Message sender (default: 'user')
          openChat = true       // Whether to open chat if closed (default: true)
        } = options;
        
        if (sendToServer) {
          // Send message to server (displays locally and sends API request)
          return widget.sendProgrammaticMessage(message);
        } else {
          // Add message locally only (no API call)
          if (openChat && !widget.isOpen) {
            widget.openChat();
          }
          widget.addLocalMessage(message, sender);
        }
      },
      
      // Convenience methods for specific use cases
      sendToServer: (message) => widget.sendProgrammaticMessage(message),
      addLocalMessage: (message, sender = 'user') => widget.addLocalMessage(message, sender),
      
      // Event callback
      onMessage: (callback) => {
        widget.onMessageCallback = callback;
      },
      
      // Additional utility methods
      getMessages: () => widget.messages,
      getConversationId: () => widget.conversationId,
      clearMessages: () => {
        widget.messages = [];
        const messagesContainer = document.getElementById('leadflow-messages');
        if (messagesContainer) {
          // Keep only the initial bot message and typing indicator
          const initialMessage = messagesContainer.querySelector('.leadflow-message.bot');
          const typingIndicator = document.getElementById('leadflow-typing');
          messagesContainer.innerHTML = '';
          if (initialMessage) messagesContainer.appendChild(initialMessage);
          if (typingIndicator) messagesContainer.appendChild(typingIndicator);
        }
      }
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Export for module systems (if available)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeadFlowWidget;
  }
  
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return LeadFlowWidget;
    });
  }

})();