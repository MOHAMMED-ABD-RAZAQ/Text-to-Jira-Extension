# 🚀 Text to Jira Task Converter

A powerful Chrome extension that transforms your ideas into professional Jira tasks using AI-powered assistance. Convert natural language descriptions into well-structured Jira tasks with titles, descriptions, and acceptance criteria.

## ✨ Features

### 🤖 AI-Powered Conversion
- **Smart Task Generation**: Convert natural language to professional Jira tasks
- **Structured Output**: Automatically generates Title, Description, and Acceptance Criteria
- **Professional Formatting**: Ensures tasks are suitable for development teams

### 🎯 Jira Integration
- **One-Click Form Filling**: Automatically fill Jira create issue forms
- **Multi-Field Support**: Handles summary, description, and acceptance criteria fields
- **ProseMirror Editor Support**: Works with Jira's rich text editor
- **Cross-Platform**: Supports both Atlassian Cloud and self-hosted Jira

### 💾 Smart Storage & History
- **Persistent Results**: Your last generated task stays visible
- **Task History**: Access your previous 10 generated tasks
- **Individual Copy Buttons**: Copy specific sections (Title, Description, Acceptance Criteria)
- **Secure API Key Storage**: Your OpenAI API key is safely stored locally

### 🎨 Modern UI/UX
- **Beautiful Interface**: Modern gradient design with smooth animations
- **Responsive Design**: Works perfectly on different screen sizes
- **Visual Feedback**: Clear success/error notifications
- **Loading States**: Professional loading animations

## 📋 Requirements

- **Chrome Browser** (version 88 or higher)
- **OpenAI API Key** (get one from [OpenAI Platform](https://platform.openai.com/api-keys))
- **Jira Access** (Atlassian Cloud or self-hosted instance)

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/text-to-jira-task-converter.git
   cd text-to-jira-task-converter
   ```

2. **Open Chrome Extensions**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the extension folder
   - The extension should now appear in your extensions list

4. **Get your OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key for the next step

5. **Configure the extension**
   - Click the extension icon in your browser
   - Enter your OpenAI API key and save it
   - You're ready to use!

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store for easy installation.

## 🎯 Usage

### Basic Workflow

1. **Describe Your Task**
   - Click the extension icon
   - Enter a description of what you want to accomplish
   - Example: "Create a user registration form with email validation and password strength requirements"

2. **Generate the Task**
   - Click "✨ Convert to Jira Task"
   - Wait for AI processing (usually 2-5 seconds)
   - Review the generated Title, Description, and Acceptance Criteria

3. **Use the Results**
   - **Copy Individual Sections**: Use the 📋 buttons next to each section
   - **Fill Jira Form**: Click "🚀 Fill Jira Form" to auto-fill a Jira create issue page
   - **Access History**: View previous tasks in the "📚 Recent Tasks" section

### Advanced Features

#### 🚀 Auto-Fill Jira Forms
1. Navigate to your Jira create issue page
2. Generate a task in the extension
3. Click "🚀 Fill Jira Form"
4. The form will be automatically populated!

#### 📚 Task History
- All generated tasks are saved automatically
- Click on any history item to restore it
- Use "🗑️ Clear All" to reset your history

#### 🔑 API Key Management
- Your API key is stored securely in Chrome's sync storage
- Use "🗑️ Remove" to clear your API key
- The key is never shared or transmitted except to OpenAI

## 🛠️ Development

### Project Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI
├── popup.css             # Styles
├── popup.js              # Main logic
├── content.js            # Jira page integration
└── README.md             # This file
```

### Key Technologies

- **Chrome Extension APIs**: Storage, Tabs, Scripting
- **OpenAI GPT-3.5-turbo**: AI-powered task generation
- **Modern CSS**: Gradients, animations, responsive design
- **JavaScript ES6+**: Async/await, promises, modern syntax

### Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/yourusername/text-to-jira-task-converter.git
   cd text-to-jira-task-converter
   ```

2. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the folder

3. **Make changes**
   - Edit files as needed
   - Click the refresh button on the extension card to reload
   - Test your changes

4. **Debug**
   - Right-click the extension icon → "Inspect popup"
   - Check the console for logs and errors

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Reporting Bugs
1. Check existing issues first
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS

### 💡 Suggesting Features
1. Open a new issue with the "enhancement" label
2. Describe the feature and its benefits
3. Include mockups if possible

### 📝 Code Style
- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Test your changes before submitting

## 🔒 Privacy & Security

### Data Handling
- **API Key**: Stored securely in Chrome's sync storage
- **Task Data**: Stored locally in your browser
- **No External Storage**: We don't store your data on our servers
- **OpenAI API**: Only your task descriptions are sent to OpenAI

### Permissions
- **Storage**: To save your API key and task history
- **Active Tab**: To detect Jira pages
- **Scripting**: To inject content scripts into Jira pages
- **Tabs**: To communicate with Jira pages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT API
- **Atlassian** for Jira's excellent platform
- **Chrome Extensions Team** for the powerful extension APIs
- **Contributors** who help improve this project

## 🚀 Roadmap

- [ ] Chrome Web Store publication
- [ ] Firefox extension support
- [ ] Additional Jira field types
- [ ] Custom templates
- [ ] Team collaboration features
- [ ] Integration with other project management tools

---