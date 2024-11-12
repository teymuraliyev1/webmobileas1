document.addEventListener("DOMContentLoaded", () => {
    const fieldsContainer = document.getElementById("fields-container");
    const addFieldButton = document.getElementById("add-field");
    const saveFieldsButton = document.getElementById("save-fields");
    const newKeyInput = document.getElementById("new-key");
    const newValueInput = document.getElementById("new-value");
    const unsavedIndicator = document.getElementById("unsaved-indicator");

    let unsavedChanges = false;

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
            markUnsaved();
        }
    });

    // Save fields to local storage
    saveFieldsButton.addEventListener("click", () => {
        const fields = Array.from(fieldsContainer.children).map((div) => {
            return {
                key: div.querySelector(".key").value.trim(),
                value: div.querySelector(".value").value.trim(),
            };
        });

        chrome.storage.local.set({ customFields: fields }, () => {
            alert("Fields saved successfully!");
            unsavedChanges = false;
            updateUnsavedIndicator();
        });
    });

    // Add a field to the UI
    function addFieldToUI(key, value) {
        const div = document.createElement("div");
        div.classList.add("field");

        const keyInput = document.createElement("input");
        keyInput.type = "text";
        keyInput.classList.add("key");
        keyInput.placeholder = "Key";
        keyInput.value = key;

        const valueInput = document.createElement("input");
        valueInput.type = "text";
        valueInput.classList.add("value");
        valueInput.placeholder = "Value";
        valueInput.value = value;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.style.width = "30px";
        deleteButton.addEventListener("click", () => {
            fieldsContainer.removeChild(div);
            markUnsaved();
        });

        keyInput.addEventListener("input", markUnsaved);
        valueInput.addEventListener("input", markUnsaved);

        div.appendChild(keyInput);
        div.appendChild(valueInput);
        div.appendChild(deleteButton);
        fieldsContainer.appendChild(div);
    }

    // Mark changes as unsaved
    function markUnsaved() {
        unsavedChanges = true;
        updateUnsavedIndicator();
    }

    // Update the unsaved changes indicator
    function updateUnsavedIndicator() {
        if (unsavedChanges) {
            unsavedIndicator.style.display = "block";
        } else {
            unsavedIndicator.style.display = "none";
        }
    }
});  