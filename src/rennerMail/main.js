"use strict";

(() => {
    const API_URL = "https://mail.pudim.xyz/api/sendMail/";

    const MAX_MESSAGE_LENGTH = 1000;
    const MAX_NAME_LENGTH = 50;

    const form = document.getElementById("messageForm");
    const nameInput = document.getElementById("name");
    const messageInput = document.getElementById("message");

    const sendButton = document.getElementById("sendButton");
    const buttonText = document.getElementById("buttonText");
    const sendLabel = buttonText.textContent;

    const statusElement = document.getElementById("status");
    const characterCount = document.getElementById("characterCount");

    const expertModeInput = document.getElementById("expertMode");
    const shortcutDescription = document.getElementById(
        "shortcutDescription"
    );

    const growWrap = messageInput.parentElement;

    let expertModeEnabled = false;
    let isSending = false;
    let statusTimeout = null;

    /*
     * Status messages
     */

    function setStatus(message, type = "") {
        if (statusTimeout !== null) {
            clearTimeout(statusTimeout);
            statusTimeout = null;
        }

        statusElement.textContent = message;
        statusElement.className = "status";

        if (type) {
            statusElement.classList.add(type);
        }
    }

    function clearStatusAfterDelay(delay = 4000) {
        if (statusTimeout !== null) {
            clearTimeout(statusTimeout);
        }

        statusTimeout = setTimeout(() => {
            setStatus("");
        }, delay);
    }

    /*
     * Textarea auto-sizing
     */

    function updateTextareaSize() {
        growWrap.dataset.replicatedValue = messageInput.value;
    }

    /*
     * Character counter
     */

    function updateCharacterCount() {
        if (!characterCount) {
            return;
        }

        const length = messageInput.value.length;

        characterCount.textContent =
            `${length} / ${MAX_MESSAGE_LENGTH}`;

        characterCount.classList.toggle(
            "near-limit",
            length >= MAX_MESSAGE_LENGTH * 0.9 &&
            length < MAX_MESSAGE_LENGTH
        );

        characterCount.classList.toggle(
            "at-limit",
            length >= MAX_MESSAGE_LENGTH
        );
    }

    /*
     * Local storage
     *
     * Storage access can fail in some browser configurations.
     * The page should still work if that happens.
     */

    function readStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn("Could not read local storage:", error);
            return null;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn("Could not write local storage:", error);
        }
    }

    /*
     * Expert mode
     */

    function updateExpertMode(enabled) {
        expertModeEnabled = enabled;

        writeStorage("expertMode", String(enabled));

        if (enabled) {
            shortcutDescription.innerHTML =
                "<kbd>Enter</kbd> to send your message. " +
                "<kbd>Ctrl</kbd> + <kbd>Enter</kbd> for a new line.";
        } else {
            shortcutDescription.innerHTML =
                "<kbd>Ctrl</kbd> + <kbd>Enter</kbd> " +
                "to send your message.";
        }
    }

    function initializeExpertMode() {
        expertModeEnabled = readStorage("expertMode") === "true";

        expertModeInput.checked = expertModeEnabled;

        updateExpertMode(expertModeEnabled);
    }

    expertModeInput.addEventListener("change", () => {
        updateExpertMode(expertModeInput.checked);
    });

    /*
     * Restore the optional name
     */

    function initializeName() {
        const savedName = readStorage("username");

        if (savedName !== null) {
            nameInput.value = normalizeName(savedName);
        }
    }

    function normalizeName(name) {
        return name.replace(/[^A-Za-z0-9]/g, "").slice(0, MAX_NAME_LENGTH);
    }

    /*
     * Validation
     */

    function validateMessage() {
        const message = messageInput.value;

        if (message.trim().length === 0) {
            setStatus(
                "Your message cannot be empty!",
                "error"
            );

            return false;
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            setStatus(
                "Your message cannot be longer than 1000 characters!",
                "error"
            );

            return false;
        }

        return true;
    }

    /*
     * Send message
     */

    async function sendMail() {
        if (isSending) {
            return;
        }

        if (!validateMessage()) {
            clearStatusAfterDelay();
            return;
        }

        const submittedName = nameInput.value;
        const payload = {
            text: messageInput.value,
            name: normalizeName(submittedName)
        };

        isSending = true;

        sendButton.disabled = true;
        buttonText.textContent = "Sending...";

        setStatus("Sending your message...", "pending");

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                credentials: "omit",
                redirect: "error",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const message = response.status >= 400 && response.status < 500
                    ? "The API couldn't accept your message. Check it and try again."
                    : "The delivery service couldn't send your message. Try again shortly.";
                setStatus(message, "error");
                clearStatusAfterDelay(6000);
                return;
            }

            /*
             * Save the name only after a successful response.
             * The message itself is never saved locally.
             */

            writeStorage("username", payload.name);
            if (nameInput.value === submittedName) {
                nameInput.value = payload.name;
            }

            /*
             * Clear the form after a successful send.
             */

            if (messageInput.value === payload.text) {
                messageInput.value = "";
                updateTextareaSize();
                updateCharacterCount();
            }

            setStatus(
                "Message sent!",
                "success"
            );

            clearStatusAfterDelay(5000);
        } catch (error) {
            console.error("Could not send message:", error);

            setStatus(
                "Couldn't send your message. Please check your " +
                "connection and try again.",
                "error"
            );

            clearStatusAfterDelay(6000);
        } finally {
            isSending = false;

            sendButton.disabled = false;
            buttonText.textContent = sendLabel;
        }
    }

    /*
     * Form submission
     */

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        sendMail();
    });

    /*
     * Keyboard shortcuts
     */

    messageInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }

        /*
         * Ignore key combinations involving other modifiers.
         * Ctrl+Enter is the shortcut in normal mode.
         */

        if (
            event.altKey ||
            event.metaKey ||
            event.shiftKey
        ) {
            return;
        }

        if (expertModeEnabled) {
            /*
             * Expert mode:
             * Enter sends the message.
             * Ctrl+Enter inserts a newline.
             */

            if (event.ctrlKey) {
                return;
            }

            event.preventDefault();
            sendMail();
        } else {
            /*
             * Normal mode:
             * Enter inserts a newline.
             * Ctrl+Enter sends the message.
             */

            if (event.ctrlKey) {
                event.preventDefault();
                sendMail();
            }
        }
    });

    /*
     * Keep the textarea size and counter up to date.
     */

    messageInput.addEventListener("input", () => {
        updateTextareaSize();
        updateCharacterCount();
    });

    /*
     * Initialize
     */

    initializeName();
    initializeExpertMode();

    updateTextareaSize();
    updateCharacterCount();
})();
