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
        data.about = aboutElement.innerText
    }
    return data;
}

function applyMappingsToForm(mappings, linkedinData) {
    mappings.forEach(({ linkedinField, formFieldName }) => {
        const linkedInFieldData = linkedinData.find(({ key }) => key === linkedinField);
        if (linkedInFieldData) {
            const { value } = linkedInFieldData;
            const formField = document.querySelector(`[name="${formFieldName}"]`);
            if (formField) {
                formField.value = value;
            }
        }
    });

    linkedinData.forEach(({ key, value }) => {
        const formField = document.querySelector(`[name="${key}"]`);
        if (formField) {
            formField.value = value;
        }
    });
}

document.addEventListener("submit", (event) => {
    const form = event.target;

    // Collect all form fields and their values
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Ask the user for missing data
    const company = data.company || prompt("Enter the company name for this job application:");
    const jobTitle = data.jobTitle || prompt("Enter the job title for this application:");


    // Prepare job application data
    const applicationData = {
        company: company || "Unknown Company",
        jobTitle: jobTitle || "Unknown Job Title",
        dateApplied: new Date().toISOString().split("T")[0], // Current date
        status: "Pending", // Default status
    };

    // Save the application data
    chrome.runtime.sendMessage({ action: "trackJobApplication", data: applicationData });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractLinkedInData") {
        const data = extractLinkedInData();
        sendResponse(data);
    }
    if (message.action === "applyMappings") {
        chrome.storage.local.get(["fieldMappings", "profiles"], (result) => {
            applyMappingsToForm(result.fieldMappings, result.profiles[message.currentProfile]);
        })
    }
    if (message.action === "extractJobDetails") {
        const company = document.querySelector(".company-name-selector")?.textContent.trim();
        const jobTitle = document.querySelector(".job-title-selector")?.textContent.trim();

        sendResponse({
            company: company || "Unknown Company",
            jobTitle: jobTitle || "Unknown Job Title",
        });
    }
    
    if (message.action === "saveFormForLater") {
        const inputs = document.querySelectorAll("input, textarea, select");

        if (!inputs || inputs.length === 0) {
            console.error("No form fields found.");
            sendResponse({ success: false });
            return;
        }

        const formData = {};
        inputs.forEach((input) => {
            if ((input.name || input.id) && input.value !== undefined) {
                const key = input.name || input.id;
                formData[key] = input.value;
            } else {
                console.warn("Skipped input with no name or id:", input);
            }
        });

        chrome.storage.local.get(["savedForms"], (result) => {
            const savedForms = result.savedForms || [];
            savedForms.push(formData);
            chrome.storage.local.set({ savedForms }, () => {
                console.log("Form saved successfully:", formData);
                sendResponse({ success: true });
            });
        });

        return true; 
    }

    if (message.action === "restoreForm" && message.form) {
        const formData = message.form;
        Object.entries(formData).forEach(([key, value]) => {
            const input = document.querySelector(`[name="${key}"], [id="${key}"]`);
            if (input) {
                input.value = value;
            } else {
                console.warn(`No input found for key: ${key}`);
            }
        });
        alert("Form restored!");
    }
});
