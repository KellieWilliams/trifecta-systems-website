/**
 * Chatbot functionality for Google AI Studio integration
 */

export class Chatbot {
    constructor() {
        this.apiEndpoint = 'chatbot-proxy.php';
        this.isLoading = false;
        this.conversationHistory = [];
        this.maxHistoryLength = 10; // Keep last 10 exchanges
        
        console.log('Chatbot class initialized with endpoint:', this.apiEndpoint);
    }

    /**
     * Send a prompt to the chatbot API
     * @param {string} prompt - The user's input prompt
     * @returns {Promise<Object>} - API response
     */
    async sendPrompt(prompt) {
        console.log('Sending prompt:', prompt);
        
        if (this.isLoading) {
            console.warn('Request already in progress');
            throw new Error('Request already in progress');
        }

        if (!prompt || !prompt.trim()) {
            console.warn('Empty prompt received');
            throw new Error('Prompt cannot be empty');
        }

        this.isLoading = true;
        console.log('Making API request to:', this.apiEndpoint);

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt.trim()
                })
            });

            console.log('API response status:', response.status);
            console.log('API response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API error response:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response data:', data);
            
            if (!data.success) {
                console.error('API returned success: false:', data);
                throw new Error(data.error || 'Unknown error occurred');
            }

            // Add to conversation history
            this.addToHistory(prompt, data.response);

            return {
                success: true,
                response: data.response,
                timestamp: data.timestamp
            };

        } catch (error) {
            console.error('Chatbot API Error:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Add exchange to conversation history
     * @param {string} prompt - User prompt
     * @param {string} response - AI response
     */
    addToHistory(prompt, response) {
        this.conversationHistory.push({
            prompt,
            response,
            timestamp: new Date().toISOString()
        });

        // Keep only the last N exchanges
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
    }

    /**
     * Get conversation history
     * @returns {Array} - Array of conversation exchanges
     */
    getHistory() {
        return [...this.conversationHistory];
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Check if chatbot is currently processing a request
     * @returns {boolean} - True if loading
     */
    isLoading() {
        return this.isLoading;
    }

    /**
     * Format response text (handle line breaks, etc.)
     * @param {string} text - Raw response text
     * @returns {string} - Formatted HTML
     */
    formatResponse(text) {
        if (!text) return '';
        
        // Convert line breaks to HTML
        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    /**
     * Create a conversation context for better responses
     * @param {string} newPrompt - New user prompt
     * @returns {string} - Contextualized prompt
     */
    createContextualPrompt(newPrompt) {
        if (this.conversationHistory.length === 0) {
            return newPrompt;
        }

        // Create context from recent history
        const recentExchanges = this.conversationHistory.slice(-3); // Last 3 exchanges
        let context = "Previous conversation context:\n";
        
        recentExchanges.forEach(exchange => {
            context += `User: ${exchange.prompt}\n`;
            context += `Assistant: ${exchange.response}\n\n`;
        });
        
        context += `User: ${newPrompt}`;
        return context;
    }
}

/**
 * UI Controller for the chatbot interface
 */
export class ChatbotUI {
    constructor(chatbot, options = {}) {
        this.chatbot = chatbot;
        this.options = {
            promptInputId: 'geminiPromptInput',
            responseDisplayId: 'geminiResponseDisplay',
            generateButtonId: 'generateResponseButton',
            loadingSpinnerId: 'geminiLoadingSpinner',
            ...options
        };
        
        this.elements = {};
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        console.log('Initializing chatbot UI elements...');
        
        this.elements.promptInput = document.getElementById(this.options.promptInputId);
        this.elements.responseDisplay = document.getElementById(this.options.responseDisplayId);
        this.elements.generateButton = document.getElementById(this.options.generateButtonId);
        this.elements.loadingSpinner = document.getElementById(this.options.loadingSpinnerId);

        console.log('Found elements:', {
            promptInput: !!this.elements.promptInput,
            responseDisplay: !!this.elements.responseDisplay,
            generateButton: !!this.elements.generateButton,
            loadingSpinner: !!this.elements.loadingSpinner
        });

        if (!this.elements.promptInput || !this.elements.responseDisplay || 
            !this.elements.generateButton || !this.elements.loadingSpinner) {
            console.error('Required chatbot elements not found');
            return;
        }
        
        console.log('All chatbot UI elements initialized successfully');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        console.log('Binding chatbot UI events...');
        
        if (!this.elements.generateButton) {
            console.error('Generate button not found for event binding');
            return;
        }

        this.elements.generateButton.addEventListener('click', () => {
            console.log('Generate button clicked');
            this.handleGenerateClick();
        });

        if (this.elements.promptInput) {
            this.elements.promptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    console.log('Enter key pressed in prompt input');
                    this.handleGenerateClick();
                }
            });
        }
        
        console.log('Chatbot UI events bound successfully');
    }

    /**
     * Handle generate button click
     */
    async handleGenerateClick() {
        const prompt = this.elements.promptInput?.value?.trim();
        
        if (!prompt) {
            this.showError('Please enter a prompt first!');
            return;
        }

        try {
            this.showLoading();
            this.disableInput();
            
            const result = await this.chatbot.sendPrompt(prompt);
            this.showResponse(prompt, result.response);
            
        } catch (error) {
            console.error('Chatbot error:', error);
            this.showError(error.message || 'An error occurred while generating the response');
        } finally {
            this.hideLoading();
            this.enableInput();
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.elements.loadingSpinner) {
            this.elements.loadingSpinner.style.display = 'block';
        }
        if (this.elements.responseDisplay) {
            this.elements.responseDisplay.innerHTML = '<p class="text-gray-400">Generating response...</p>';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.elements.loadingSpinner) {
            this.elements.loadingSpinner.style.display = 'none';
        }
    }

    /**
     * Show response
     * @param {string} prompt - User prompt
     * @param {string} response - AI response
     */
    showResponse(prompt, response) {
        if (!this.elements.responseDisplay) return;

        const formattedResponse = this.chatbot.formatResponse(response);
        
        this.elements.responseDisplay.innerHTML = `
            <div class="space-y-3">
                <div class="border-b border-gray-600 pb-3">
                    <p class="text-gray-300 text-sm font-medium">Your prompt:</p>
                    <p class="text-gray-200">${this.escapeHtml(prompt)}</p>
                </div>
                <div class="pt-2">
                    <p class="text-gray-300 text-sm font-medium">AI Response:</p>
                    <div class="text-white mt-2">${formattedResponse}</div>
                </div>
                <div class="text-xs text-gray-500 pt-2 border-t border-gray-600">
                    Powered by Google AI Studio • ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (!this.elements.responseDisplay) return;

        this.elements.responseDisplay.innerHTML = `
            <div class="text-red-400 p-4 text-center">
                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <p class="font-medium">${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    /**
     * Disable input during processing
     */
    disableInput() {
        if (this.elements.promptInput) {
            this.elements.promptInput.disabled = true;
        }
        if (this.elements.generateButton) {
            this.elements.generateButton.disabled = true;
            this.elements.generateButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Enable input after processing
     */
    enableInput() {
        if (this.elements.promptInput) {
            this.elements.promptInput.disabled = false;
        }
        if (this.elements.generateButton) {
            this.elements.generateButton.disabled = false;
            this.elements.generateButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
