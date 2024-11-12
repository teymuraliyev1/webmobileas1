function extractLinkedInData() {
    const data = {};

    // Extract name
    const nameElement = document.querySelector("h1");
    if (nameElement) {
        let fullname = nameElement.textContent.trim().split(" ");
        data.name = fullname[0]
        data.surname = fullname[1]
    }

    // Extract headline
    const headlineElement = document.querySelector(".text-body-medium.break-words");
    if (headlineElement) {
        data.headline = headlineElement.textContent.trim();
    }
    
    return data;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractLinkedInData") {
        const data = extractLinkedInData();
        sendResponse(data);
    }
});
