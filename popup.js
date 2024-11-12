document.addEventListener("DOMContentLoaded", () => {
    const fieldsContainer = document.getElementById("fields-container");
    const addFieldButton = document.getElementById("add-field");
    const newKeyInput = document.getElementById("new-key");
    const newValueInput = document.getElementById("new-value");

    // Load fields from storage
    chrome.storage.local.get(["customFields"], (result) => {
        const fields = result.customFields || [];
        fields.forEach(({ key, value }) => addFieldToUI(key, value));
    });

    // Add a new key-value field
    addFieldButton.addEventListener("click", () => {
        const key = newKeyInput.value.trim();
        const value = newValueInput.value.trim();
        if (key && value) {
            addFieldToUI(key, value);
            newKeyInput.value = "";
            newValueInput.value = "";
            saveFieldsToStorage();
        }
    });

    // Add a field to the UI
    function addFieldToUI(key, value) {
        const div = document.createElement("div");
        div.classList.add("field");

        // Key input (disabled, non-editable initially)
        const keyInput = document.createElement("input");
        keyInput.type = "text";
        keyInput.classList.add("key");
        keyInput.placeholder = "Key";
        keyInput.value = key;
        keyInput.disabled = true;

        // Value input (editable)
        const valueInput = document.createElement("input");
        valueInput.type = "text";
        valueInput.classList.add("value");
        valueInput.placeholder = "Value";
        valueInput.value = value;
        valueInput.disabled = true;

        // Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "✏️";
        editButton.title = "Edit";
        editButton.addEventListener("click", () => {
            if (keyInput.disabled && valueInput.disabled) {
                // Enable editing
                keyInput.disabled = false;
                valueInput.disabled = false;
                editButton.textContent = "✔️"; // Change to Save icon
                editButton.title = "Save";
            } else {
                // Disable editing and save changes to storage
                keyInput.disabled = true;
                valueInput.disabled = true;
                editButton.textContent = "✏️"; // Change back to Edit icon
                editButton.title = "Edit";
                saveFieldsToStorage(); // Save updated fields
            }
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.title = "Delete";
        deleteButton.style.marginLeft = "5px";
        deleteButton.addEventListener("click", () => {
            fieldsContainer.removeChild(div);
            saveFieldsToStorage(); // Save updated fields after deletion
        });

        // Append elements to the field div
        div.appendChild(keyInput);
        div.appendChild(valueInput);
        div.appendChild(editButton);
        div.appendChild(deleteButton);

        // Add the field div to the container
        fieldsContainer.appendChild(div);
    }

    // Save all fields to local storage
    function saveFieldsToStorage() {
        const fields = Array.from(fieldsContainer.children).map((div) => {
            const key = div.querySelector(".key").value.trim();
            const value = div.querySelector(".value").value.trim();
            return { key, value };
        });

        chrome.storage.local.set({ customFields: fields }, () => {
            console.log("Fields saved successfully!");
        });
    }

    // Extract LinkedIn Data Section
    const extractButton = document.createElement("button");
    extractButton.textContent = "Extract from LinkedIn";
    extractButton.style.marginTop = "10px";

    // Append the button to the UI
    document.body.appendChild(extractButton);

    extractButton.addEventListener("click", () => {
        // Send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(
                activeTab.id,
                { action: "extractLinkedInData" },
                (response) => {
                    if (response) {
                        // Clear existing fields to avoid duplicates
                        fieldsContainer.innerHTML = "";

                        // Populate fields with extracted data
                        Object.entries(response).forEach(([key, value]) => {
                            addFieldToUI(key, value);
                        });

                        saveFieldsToStorage();
                    } else {
                        alert("Failed to extract LinkedIn data. Ensure you're on a LinkedIn profile page.");
                    }
                }
            );
        });
    });
});
