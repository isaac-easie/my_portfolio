(() => {
    const panel = document.getElementById('isax-ai-panel');
    const launcher = document.querySelector('.isax-ai-launcher');
    const closeButton = document.getElementById('isax-ai-close');
    const statusText = document.getElementById('isax-ai-status');
    const messagesBox = document.getElementById('isax-ai-messages');
    const form = document.getElementById('isax-ai-form');
    const input = document.getElementById('isax-ai-input');
    const sendButton = document.querySelector('.isax-ai-panel__send');

    if (!panel || !launcher || !closeButton || !messagesBox || !form || !input || !sendButton) {
        return;
    }

    const storedConfig = window.ISAX_AI_CONFIG || {
        apiKey: "AIzaSyDs_Z4lGrMQlTJjEdS5NeQUNN4AfwHK3ZY",
        authDomain: "myportfolio-42394.firebaseapp.com",
        projectId: "myportfolio-42394",
        storageBucket: "myportfolio-42394.firebasestorage.app",
        messagingSenderId: "556206248589",
        appId: "1:556206248589:web:7575923e20698b028288c4",
        measurementId: "G-TKE54JTH2L"
    };
    const sessionMessages = [];
    let modelInstance = null;
    let appCheckReady = false;

    const setStatus = (message) => {
        statusText.textContent = message;
    };

    const appendMessage = (role, text) => {
        const wrapper = document.createElement('div');
        wrapper.className = `isax-ai-message isax-ai-message--${role}`;

        const bubble = document.createElement('div');
        bubble.className = 'isax-ai-message__bubble';
        bubble.textContent = text;
        wrapper.appendChild(bubble);
        messagesBox.appendChild(wrapper);
        messagesBox.scrollTop = messagesBox.scrollHeight;

        sessionMessages.push({ role, text });
    };

    const openPanel = () => {
        panel.classList.add('is-open');
        launcher.setAttribute('aria-expanded', 'true');
        input.focus();

        if (sessionMessages.length === 0) {
            appendMessage('assistant', 'Hello! I am Ask iSAX AI. Ask me about Isaac’s portfolio, skills, projects, services or general technology and IT questions.');
        }

        const missing = getMissingConfig();
        if (missing.length) {
            appendMessage('assistant', 'The Firebase web configuration is not available yet, so Gemini cannot be reached. Add your existing Firebase app config to window.ISAX_AI_CONFIG and the App Check site key if it is enabled in Firebase Console.');
            setStatus('Config needed');
        } else {
            setStatus('Ready');
        }
    };

    const closePanel = () => {
        panel.classList.remove('is-open');
        launcher.setAttribute('aria-expanded', 'false');
        setStatus('Closed');
    };

    const getMissingConfig = () => {
        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        return requiredFields.filter((field) => !storedConfig[field]);
    };

    const getPortfolioContext = () => {
        const selectors = [
            '#about',
            '#skills',
            '#projects',
            '#what-i-do',
            '#education',
            '#contact',
            '.hero-copy',
            '.footer-column--about',
            '.footer-links--stacked'
        ];

        const text = selectors
            .flatMap((selector) => [...document.querySelectorAll(selector)])
            .map((element) => element.textContent.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .join('\n\n');

        return `
            Isaac Okonya is the portfolio owner and founder of iSAX TECH HUB.
            He is an Information Technology student at Uganda Christian University and an aspiring software developer.
            His portfolio states the following:
            ${text}
            Use these facts when answering. Do not invent experience, prices, achievements or qualifications. When something is not clearly stated, be honest and say it is not stated on the site.
        `;
    };

    const ensureModel = async () => {
        const missing = getMissingConfig();
        if (missing.length) {
            throw new Error(`Firebase configuration is incomplete. Missing: ${missing.join(', ')}. Add your existing Firebase web config to window.ISAX_AI_CONFIG and your App Check site key if it is enabled.`);
        }

        if (modelInstance) {
            return modelInstance;
        }

        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js');
        const { getAI, getGenerativeModel, GoogleAIBackend } = await import('https://www.gstatic.com/firebasejs/10.13.1/firebase-ai.js');
        const app = initializeApp(storedConfig);

        if (storedConfig.appCheckSiteKey) {
            const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-check.js');
            initializeAppCheck(app, {
                provider: new ReCaptchaEnterpriseProvider(storedConfig.appCheckSiteKey),
                isTokenAutoRefreshEnabled: true
            });
            appCheckReady = true;
        } else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            const { initializeAppCheck, DebugProvider } = await import('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-check.js');
            initializeAppCheck(app, {
                provider: new DebugProvider({
                    token: 'debug-token-for-localhost'
                }),
                isTokenAutoRefreshEnabled: true
            });
            appCheckReady = true;
        }

        const ai = getAI(app, { backend: new GoogleAIBackend() });
        modelInstance = getGenerativeModel(ai, {
            model: 'gemini-3.5-flash-lite'
        });
        return modelInstance;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const question = input.value.trim();

        if (!question) {
            input.focus();
            return;
        }

        appendMessage('user', question);
        input.value = '';
        input.style.height = 'auto';
        form.classList.add('is-loading');
        sendButton.disabled = true;
        setStatus('Thinking...');

        try {
            const model = await ensureModel();
            const prompt = `You are Ask iSAX AI, a friendly and professional assistant for Isaac Okonya's portfolio website. Use the portfolio information below to answer carefully. Do not invent skills, projects, qualifications, prices, services, or achievements. If the answer is not clearly stated in the portfolio, say so clearly and provide a helpful, general technology response only if it is safe and clearly labelled as general guidance instead of a claim about Isaac.

Portfolio information:
${getPortfolioContext()}

Visitor question:
${question}`;

            const result = await model.generateContent({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }]
            });

            const reply = await result.response.text();
            appendMessage('assistant', reply || 'I could not generate an answer right now. Please try again in a moment.');
            setStatus('Ready');
        } catch (error) {
            console.error('Ask iSAX AI request failed', error);
            const fallbackMessage = error && error.message && error.message.includes('Firebase configuration')
                ? error.message
                : 'I could not reach the AI service right now. Please try again in a moment. If the Firebase configuration is missing, add the existing web config in window.ISAX_AI_CONFIG before trying again.';
            appendMessage('assistant', fallbackMessage);
            setStatus('AI unavailable');
        } finally {
            form.classList.remove('is-loading');
            sendButton.disabled = false;
            input.focus();
        }
    };

    launcher.addEventListener('click', () => {
        if (!panel.classList.contains('is-open')) {
            openPanel();
        } else {
            closePanel();
        }
    });

    closeButton.addEventListener('click', closePanel);
    form.addEventListener('submit', handleSubmit);
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        const nextHeight = Math.min(input.scrollHeight, 140);
        input.style.height = `${nextHeight}px`;
    });

    openPanel();
    closePanel();
})();
