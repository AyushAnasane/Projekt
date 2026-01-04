console.log("popup.js loaded");

const button = document.querySelector(".button");

button.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;

        if (!currentUrl.includes("mail.google.com")) {
            alert("Please open your college Gmail");
            return;
        }

        alert("Gmail detected. Checking account type...");
    });
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "USER_EMAIL") return;

    const userEmail = message.email;

    if (!userEmail || typeof userEmail !== "string") {
        alert("Could not detect email. Please refresh Gmail.");
        return;
    }

    if (userEmail.endsWith(".edu")) {
        alert("College email detected   ");
    } else {
        alert("This extension works only for college emails");
    }
});
