// Content script for Jira integration
console.log('Jira Task Converter: Content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.action === 'fillJiraForm') {
        console.log('Starting to fill Jira form...');
        const result = fillJiraForm(request.data);
        console.log('Fill Jira form result:', result);
        sendResponse({success: result.success, message: result.message});
    }
    
    // Always return true to indicate we will send a response asynchronously
    return true;
});

function fillJiraForm(taskData) {
    console.log('Filling Jira form with:', taskData);
    console.log('Current page URL:', window.location.href);
    
    // Common Jira form selectors - expanded list
    const selectors = {
        // Summary/Title field
        summary: [
            'input[name="summary"]',
            'input[id*="summary"]',
            'textarea[name="summary"]',
            'textarea[id*="summary"]',
            '#summary',
            '[data-testid="summary-field"]',
            '[data-testid="summary"]',
            '[data-testid="summary-input"]',
            'input[placeholder*="summary" i]',
            'textarea[placeholder*="summary" i]',
            'input[placeholder*="title" i]',
            'textarea[placeholder*="title" i]',
            '.summary-field input',
            '.summary-field textarea',
            '.title-field input',
            '.title-field textarea'
        ],
        
        // Description field - Jira specific
        description: [
            // ProseMirror editor (Jira's rich text editor)
            'div[data-testid="ak-editor-textarea"]',
            'div[contenteditable="true"][data-testid="ak-editor-textarea"]',
            'div[contenteditable="true"][id="ak-editor-textarea"]',
            'div[contenteditable="true"][role="textbox"]',
            // Fallback selectors
            'textarea[name="description"]',
            'textarea[id*="description"]',
            '#description',
            '[data-testid="description-field"]',
            '[data-testid="description"]',
            '[data-testid="description-input"]',
            '.description-field textarea',
            '.description textarea',
            'textarea[placeholder*="description" i]',
            'div[contenteditable="true"][data-testid="description"]',
            'div[contenteditable="true"][id*="description"]'
        ],
        
        // Acceptance Criteria field
        acceptanceCriteria: [
            'textarea[name="acceptanceCriteria"]',
            'textarea[id*="acceptance"]',
            '#acceptanceCriteria',
            '[data-testid="acceptance-criteria"]',
            '[data-testid="acceptance"]',
            '[data-testid="acceptance-criteria-input"]',
            '.acceptance-criteria textarea',
            '.acceptance textarea',
            'textarea[placeholder*="acceptance" i]',
            'textarea[placeholder*="criteria" i]',
            'div[contenteditable="true"][data-testid="acceptance-criteria"]',
            'div[contenteditable="true"][id*="acceptance"]'
        ]
    };
    
    let filledFields = 0;
    let totalFields = 0;
    
    // Fill Summary/Title
    console.log('Attempting to fill summary/title field...');
    const summaryResult = fillField(selectors.summary, taskData.title);
    if (summaryResult) {
        filledFields++;
        console.log('Summary field filled successfully');
    } else {
        console.log('Summary field not found');
    }
    totalFields++;
    
    // Fill Description
    console.log('Attempting to fill description field...');
    const descriptionResult = fillField(selectors.description, taskData.description);
    if (descriptionResult) {
        filledFields++;
        console.log('Description field filled successfully');
    } else {
        console.log('Description field not found');
    }
    totalFields++;
    
    // Fill Acceptance Criteria
    console.log('Attempting to fill acceptance criteria field...');
    const acceptanceResult = fillField(selectors.acceptanceCriteria, taskData.acceptanceCriteria);
    if (acceptanceResult) {
        filledFields++;
        console.log('Acceptance criteria field filled successfully');
    } else {
        console.log('Acceptance criteria field not found');
    }
    totalFields++;
    
    console.log(`Filled ${filledFields} out of ${totalFields} fields`);
    
    if (filledFields > 0) {
        showNotification(`Successfully filled ${filledFields} field(s)!`, 'success');
        return {success: true, message: `Filled ${filledFields} field(s)`};
    } else {
        showNotification('No form fields found. Please make sure you are on a Jira create issue page.', 'error');
        return {success: false, message: 'No form fields found'};
    }
}

function fillField(selectors, value) {
    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            try {
                // Handle different types of elements
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // Set the value
                    element.value = value;
                    
                    // Trigger change events to notify Jira
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    element.dispatchEvent(new Event('blur', { bubbles: true }));
                } else if (element.hasAttribute('contenteditable')) {
                    // Handle contenteditable elements (like Jira's ProseMirror editor)
                    
                    // Focus the element first
                    element.focus();
                    
                    // Clear existing content
                    element.innerHTML = '';
                    
                    // For ProseMirror, set the content directly
                    if (element.getAttribute('data-testid') === 'ak-editor-textarea') {
                        // Set the text content directly
                        element.textContent = value;
                        
                        // Trigger input event
                        element.dispatchEvent(new InputEvent('input', {
                            inputType: 'insertText',
                            data: value,
                            bubbles: true
                        }));
                    } else {
                        // For other contenteditable elements
                        element.textContent = value;
                        
                        // Trigger events to notify Jira
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    // Final events
                    element.dispatchEvent(new Event('blur', { bubbles: true }));
                }
                
                console.log(`Filled field ${selector} with:`, value);
                return true;
            } catch (error) {
                console.log(`Error filling field ${selector}:`, error);
                continue;
            }
        }
    }
    return false;
}

function showNotification(message, type) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.jira-converter-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'jira-converter-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.background = '#28a745';
    } else {
        notification.style.background = '#dc3545';
    }
    
    // Add animation styles if not already present
    if (!document.querySelector('#jira-converter-styles')) {
        const style = document.createElement('style');
        style.id = 'jira-converter-styles';
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
    }
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}
