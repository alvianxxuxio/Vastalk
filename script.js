const chatBox = document.getElementById('chat-box');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const recommendedButtons = document.getElementById('recommended-buttons');

        sendBtn.addEventListener('click', () => {
            const message = userInput.value;
            if (message.trim()) {
                addMessageToChat('user', message);
                showLoadingDots();
                hideRecommendedButtons();
                sendToAPI(message);
                userInput.value = '';
            }
        });

        function sendRecommended(text) {
            addMessageToChat('user', text);
            showLoadingDots();
            hideRecommendedButtons();
            sendToAPI(text);
        }

        function hideRecommendedButtons() {
            recommendedButtons.style.display = 'none';
        }

        function showLoadingDots() {
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'bot-message');
            loadingDiv.style.backgroundColor = 'transparent';
            loadingDiv.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;
            loadingDiv.id = 'loading-dots';
            chatBox.appendChild(loadingDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function removeLoadingDots() {
            const loadingDots = document.getElementById('loading-dots');
            if (loadingDots) {
                loadingDots.remove();
            }
        }

        function addMessageToChat(sender, message) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
            messageDiv.innerHTML = sender === 'bot' ? parseMarkdown(message) : message;
            chatBox.appendChild(messageDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function escapeHtml(html) {
            return html
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function parseMarkdown(text) {
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            text = text.replace(/_(.*?)_/g, '<em>$1</em>');

            text = parseCodeBlocks(text);

            return text;
        }

        let codeBlockCount = 0; // To keep track of code blocks

function parseCodeBlocks(text) {
    const codeBlockRegex = /```(.*?)\n([\s\S]*?)```/g;
    text = text.replace(codeBlockRegex, (match, p1, p2) => {
        const codeType = p1.trim();
        const code = escapeHtml(p2.trim());
        const uniqueId = `code-box-${codeBlockCount}`; // Unique ID for each code block
        const buttonId = `copy-btn-${codeBlockCount}`; // Unique ID for each button
        codeBlockCount++; // Increment the count for the next code block

        return `<br>
            <div class="code-container">
                <div class="code-header">
                    <span>${escapeHtml(codeType)}</span>
                    <span><button onclick="copyToClipboard('${uniqueId}', '${buttonId}')" id="${buttonId}" class="send-button"><i class="fa-regular fa-clipboard"></i> Copy</button></span>
                </div>
                <pre id="${uniqueId}"><code class="language-${escapeHtml(codeType)}">${code}</code></pre>
            </div><br>
        `;
    });

    return text;
}

function copyToClipboard(codeBoxId, buttonId) {
    var code = document.getElementById(codeBoxId).textContent; // Get the code from the specific code box
    var button = document.getElementById(buttonId); // Get the specific button
    var originalText = button.innerText; // Save the original button text
    var newText = 'Copied ✅'; // New text while copying

    button.innerHTML = `Copied <i class='fas fa-check'></i>`; // Change button text to indicate action

    navigator.clipboard.writeText(code)
        .then(() => {
            showToast("Kode berhasil disalin!");
        })
        .catch(err => {
            console.error('Async: Could not copy text: ', err);
        })
        .finally(() => {
            // Revert button text back to original after 4 seconds
            setTimeout(() => {
                button.innerText = originalText; // Restore original text
            }, 4000);
        });
}

        async function sendToAPI(text) {
            try {
                const response = await fetch(`https://api.alvianuxio.my.id/api/openai?message=${encodeURIComponent(text)}&apikey=aluxi`);
                const data = await response.json();

                removeLoadingDots();
                if (data && data.data && data.data.response) {
                    addMessageToChat('bot', data.data.response);
                } else {
                    addMessageToChat('bot', 'Sorry, I could not understand the response from the server.');
                }
            } catch (error) {
                console.error('Error:', error);
                removeLoadingDots();
                addMessageToChat('bot', 'Sorry, something went wrong.');
            }
        }