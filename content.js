console.log("content.js running");

chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "REQUEST_EMAIL") return;

    let email = null;

    const elements = document.querySelectorAll('[aria-label*="@"]');

    for (const el of elements) {
        const text = el.getAttribute("aria-label") || "";
        const match = text.match(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
        );

        if (match) {
            email = match[0];
            break;
        }
    }

    chrome.runtime.sendMessage({
        type: "USER_EMAIL",
        email: email
    });
});
