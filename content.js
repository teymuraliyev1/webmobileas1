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

    // Extract about section
    const aboutElement = document.querySelector(
        "#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-none.scaffold-layout--main-aside.scaffold-layout--single-column.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section:nth-child(4) > div.display-flex.ph5.pv3 > div > div > div > span:nth-child(1)"
    );
    if (aboutElement) {
        console.log(aboutElement)
        data.about = aboutElement.innerText
    }

    console.log(data)
    return data;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractLinkedInData") {
        const data = extractLinkedInData();
        sendResponse(data);
    }
});
