console.log("popup.js loaded");

const button = document.querySelector(".button");

if (!button) {
    console.error("Button not found in popup.html");
}

button.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
            alert("No active tab found");
            return;
        }

        const tab = tabs[0];

        if (!tab.url || !tab.url.includes("mail.google.com")) {
            alert("Please open Gmail first");
            return;
        }

        chrome.tabs.sendMessage(
            tab.id,
            { type: "REQUEST_EMAIL" },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    alert("Content script not loaded. Please refresh Gmail.");
                    return;
                }

                const email = response?.email;

                if (!email) {
                    alert("Could not detect email. Please refresh Gmail.");
                    return;
                }

                if (email.endsWith(".edu")) {
                    alert("College email detected: " + email);
                } else {
                    alert("This extension works only for college emails");
                }
            }
        );

    });
});