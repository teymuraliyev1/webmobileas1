chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "trackJobApplication") {
        const application = message.data;

        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            applications.push(application);
            chrome.storage.local.set({ applications }, () => {
                console.log("Job application tracked:", application);
            });
        });
    }
});
