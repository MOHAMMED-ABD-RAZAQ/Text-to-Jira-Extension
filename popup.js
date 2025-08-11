document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const apiKeySection = document.getElementById('apiKeySection');
    const apiKeySaved = document.getElementById('apiKeySaved');
    const removeApiKeyBtn = document.getElementById('removeApiKey');
    const taskInput = document.getElementById('taskInput');
    const convertBtn = document.getElementById('convertBtn');
    const resultSection = document.getElementById('resultSection');
    const taskTitle = document.getElementById('taskTitle');
    const taskDescription = document.getElementById('taskDescription');
    const taskAcceptance = document.getElementById('taskAcceptance');
    const removeResultBtn = document.getElementById('removeResult');
    const fillJiraBtn = document.getElementById('fillJiraBtn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');

    let currentResult = null;
    let resultHistory = [];

    // Load saved data
    loadSavedData();

    // Save API key
    saveApiKeyBtn.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({openaiApiKey: apiKey}, function() {
                showApiKeySaved();
                showMessage('API key saved successfully!', 'success');
            });
        } else {
            showMessage('Please enter a valid API key', 'error');
        }
    });

    // Remove API key
    removeApiKeyBtn.addEventListener('click', function() {
        chrome.storage.sync.remove(['openaiApiKey'], function() {
            showApiKeyInput();
            showMessage('API key removed', 'success');
        });
    });

    // Handle Enter key in textarea
    taskInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            convertToJiraTask();
        }
    });

    // Convert button click
    convertBtn.addEventListener('click', function() {
        // Add loading state to button
        const originalText = convertBtn.innerHTML;
        convertBtn.innerHTML = '⏳ Processing...';
        convertBtn.disabled = true;
        convertBtn.style.opacity = '0.7';
        
        convertToJiraTask().finally(() => {
            // Restore button state
            convertBtn.innerHTML = originalText;
            convertBtn.disabled = false;
            convertBtn.style.opacity = '1';
        });
    });

    // Individual section copy buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-copy-section')) {
            const section = e.target.getAttribute('data-section');
            copySection(section);
        }
    });

    // Remove current result
    removeResultBtn.addEventListener('click', function() {
        hideResult();
        taskInput.value = '';
        taskInput.focus();
    });

    // Fill Jira Form button
    fillJiraBtn.addEventListener('click', function() {
        if (!currentResult) {
            showMessage('No task to fill', 'error');
            return;
        }
        
        console.log('Fill Jira button clicked');
        console.log('Current result:', currentResult);
        
        // Get the current active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            console.log('Active tab:', activeTab);
            
            // Check if we're on a Jira page
            if (activeTab.url && (activeTab.url.includes('atlassian.net') || activeTab.url.includes('jira.com'))) {
                console.log('On Jira page, injecting script...');
                
                // First, try to inject the content script if it's not already loaded
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    files: ['content.js']
                }).then(() => {
                    console.log('Script injected successfully');
                    
                    // Wait a moment for the script to load, then send message
                    setTimeout(() => {
                        console.log('Sending message to content script...');
                        const messageData = {
                            action: 'fillJiraForm',
                            data: {
                                title: currentResult.result.title,
                                description: currentResult.result.description,
                                acceptanceCriteria: currentResult.result.acceptanceCriteria
                            }
                        };
                        console.log('Message data:', messageData);
                        
                        chrome.tabs.sendMessage(activeTab.id, messageData, function(response) {
                            console.log('Response received:', response);
                            console.log('Runtime error:', chrome.runtime.lastError);
                            
                            if (chrome.runtime.lastError) {
                                console.log('Error:', chrome.runtime.lastError);
                                showMessage('Please refresh the Jira page and try again', 'error');
                            } else if (response && response.success) {
                                showMessage('Task filled in Jira form!', 'success');
                            } else {
                                showMessage('Could not fill form. Please check if you are on a Jira create issue page.', 'error');
                            }
                        });
                    }, 1000); // Increased timeout to 1 second
                }).catch((error) => {
                    console.log('Script injection error:', error);
                    showMessage('Please refresh the Jira page and try again', 'error');
                });
            } else {
                console.log('Not on Jira page:', activeTab.url);
                showMessage('Please navigate to a Jira page first', 'error');
            }
        });
    });

    // Clear history
    clearHistoryBtn.addEventListener('click', function() {
        resultHistory = [];
        saveHistory();
        updateHistoryDisplay();
        showMessage('History cleared', 'success');
    });

    function loadSavedData() {
        chrome.storage.sync.get(['openaiApiKey', 'resultHistory', 'currentResult'], function(result) {
            if (result.openaiApiKey) {
                apiKeyInput.value = result.openaiApiKey;
                showApiKeySaved();
            }
            
            if (result.resultHistory) {
                resultHistory = result.resultHistory;
                updateHistoryDisplay();
            }
            
            if (result.currentResult) {
                currentResult = result.currentResult;
                displayResult(currentResult);
            }
        });
    }

    function showApiKeySaved() {
        apiKeySection.style.display = 'none';
        apiKeySaved.style.display = 'block';
    }

    function showApiKeyInput() {
        apiKeySection.style.display = 'block';
        apiKeySaved.style.display = 'none';
        apiKeyInput.value = '';
    }

    function convertToJiraTask() {
        return new Promise((resolve, reject) => {
            const taskText = taskInput.value.trim();
            const apiKey = apiKeyInput.value.trim();

            if (!apiKey) {
                showMessage('Please enter your OpenAI API key first', 'error');
                reject(new Error('No API key'));
                return;
            }

            if (!taskText) {
                showMessage('Please describe what you want to accomplish', 'error');
                reject(new Error('No task text'));
                return;
            }

            // Show loading state
            hideAllSections();
            loading.style.display = 'block';

            // Prepare the prompt for OpenAI
            const prompt = `Convert the following text into a Jira task format. 
Create a clear, concise title (starting with task type like 'Feature:', 'Bug:', etc.) and detailed description with acceptance criteria.

Text: "${taskText}"

Please format the response exactly as follows:
Title: [Task type: A clear, concise title]
Description: [Detailed description]
Acceptance Criteria:
- [First acceptance criterion]
- [Second acceptance criterion]
- [Third acceptance criterion]

Make it professional and suitable for a development team. Example title format: 'Feature: Implement User Authentication' or 'Bug: Fix Login Validation'`;

            // Call OpenAI API
            callOpenAI(apiKey, prompt)
                .then(response => {
                    const parsedResult = parseJiraResponse(response);
                    currentResult = {
                        title: taskText,
                        result: parsedResult,
                        timestamp: Date.now()
                    };
                    
                    // Save to history
                    addToHistory(currentResult);
                    
                    // Display result
                    hideAllSections();
                    displayResult(currentResult);
                    
                    // Save current result
                    saveCurrentResult();
                    
                    // Clear the input after successful conversion
                    taskInput.value = '';
                    
                    showMessage('Task generated successfully!', 'success');
                    resolve();
                })
                .catch(err => {
                    hideAllSections();
                    error.style.display = 'block';
                    errorMessage.textContent = err.message;
                    
                    let userMessage = 'An error occurred while generating the task.';
                    if (err.message.includes('API Error')) {
                        userMessage = 'API Error: Please check your API key and try again.';
                    } else if (err.message.includes('Network error')) {
                        userMessage = 'Network Error: Please check your internet connection.';
                    }
                    
                    showMessage(userMessage, 'error');
                    reject(err);
                });
        });
    }

    function parseJiraResponse(response) {
        const lines = response.split('\n');
        let title = '';
        let description = '';
        let acceptanceCriteria = '';
        
        let currentSection = '';
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            if (line.startsWith('Title:')) {
                currentSection = 'title';
                title = line.replace('Title:', '').trim();
            } else if (line.startsWith('Description:')) {
                currentSection = 'description';
                description = line.replace('Description:', '').trim();
            } else if (line.startsWith('Acceptance Criteria:')) {
                currentSection = 'acceptance';
                acceptanceCriteria = '';
            } else if (currentSection === 'acceptance' && line.startsWith('-')) {
                acceptanceCriteria += line + '\n';
            } else if (currentSection === 'description' && !line.startsWith('Acceptance Criteria:')) {
                description += '\n' + line;
            }
        }
        
        return {
            title: title,
            description: description.trim(),
            acceptanceCriteria: acceptanceCriteria.trim()
        };
    }

    function displayResult(result) {
        resultSection.style.display = 'block';
        taskTitle.textContent = result.result.title;
        taskDescription.textContent = result.result.description;
        taskAcceptance.textContent = result.result.acceptanceCriteria;
    }

    function hideResult() {
        resultSection.style.display = 'none';
        currentResult = null;
        chrome.storage.sync.remove(['currentResult']);
    }

    function addToHistory(result) {
        // Remove if already exists (update)
        resultHistory = resultHistory.filter(item => item.title !== result.title);
        
        // Add to beginning
        resultHistory.unshift(result);
        
        // Keep only last 10 results
        if (resultHistory.length > 10) {
            resultHistory = resultHistory.slice(0, 10);
        }
        
        saveHistory();
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        if (resultHistory.length === 0) {
            historySection.style.display = 'none';
            return;
        }
        
        historySection.style.display = 'block';
        historyList.innerHTML = '';
        
        resultHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-title">${item.title}</div>
                <div class="history-item-preview">${item.result.title}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                currentResult = item;
                displayResult(item);
                saveCurrentResult();
            });
            
            historyList.appendChild(historyItem);
        });
    }

    function saveHistory() {
        chrome.storage.sync.set({resultHistory: resultHistory});
    }

    function saveCurrentResult() {
        if (currentResult) {
            chrome.storage.sync.set({currentResult: currentResult});
        }
    }

    function getFullResultText() {
        if (!currentResult) return '';
        
        return `Title: ${currentResult.result.title}
Description: ${currentResult.result.description}
Acceptance Criteria:
${currentResult.result.acceptanceCriteria}`;
    }

    function copySection(section) {
        if (!currentResult) return;
        
        let textToCopy = '';
        switch(section) {
            case 'title':
                textToCopy = currentResult.result.title;
                break;
            case 'description':
                textToCopy = currentResult.result.description;
                break;
            case 'acceptance':
                textToCopy = currentResult.result.acceptanceCriteria;
                break;
            default:
                return;
        }
        
        navigator.clipboard.writeText(textToCopy).then(function() {
            showMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} copied!`, 'success');
        }).catch(function() {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} copied!`, 'success');
        });
    }

    async function callOpenAI(apiKey, prompt) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that converts text into well-formatted Jira tasks. Always provide clear, actionable titles and detailed descriptions with acceptance criteria.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 800,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content.trim();
            
            // Ensure the response follows the expected format
            if (!aiResponse.match(/^(Feature|Bug|Task|Story|Epic|Fix|Enhancement):/)) {
                return `Task: ${aiResponse}`;
            }
            return aiResponse;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    function hideAllSections() {
        resultSection.style.display = 'none';
        loading.style.display = 'none';
        error.style.display = 'none';
    }

    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.message-notification');
        existingMessages.forEach(msg => msg.remove());
        
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = 'message-notification';
        messageEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${type === 'success' ? '✅' : '❌'}</span>
                <span>${message}</span>
            </div>
        `;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 18px;
            border-radius: 10px;
            color: white;
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            min-width: 250px;
        `;

        if (type === 'success') {
            messageEl.style.background = 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
        } else {
            messageEl.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
        }

        document.body.appendChild(messageEl);

        // Remove after 4 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 4000);
    }

    // Add CSS animations for messages
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});