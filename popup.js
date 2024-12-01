document.addEventListener("DOMContentLoaded", () => {
    const fieldsContainer = document.getElementById("fields-container");
    const addFieldButton = document.getElementById("add-field");
    const newKeyInput = document.getElementById("new-key");
    const newValueInput = document.getElementById("new-value");
    const profileSelector = document.getElementById("profile-selector");
    const newProfileButton = document.getElementById("new-profile-button");
    const deleteProfileButton = document.getElementById("delete-profile-button");

    let currentProfile = "default";

    loadMappings()
    loadSavedForms();

    document.getElementById("open-dashboard").addEventListener("click", () => {
        // **Source**: AI Assistance  
        // OpenAI. (2023, October 23). ChatGPT (Sep 25, 2023 version) [Large language model].  
        // [https://chat.openai.com/chat](https://chat.openai.com/chat)
        // Prompt: "Provide a snippet for opening a new tab in a Chrome extension."
        chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    });

    chrome.storage.local.get(["profiles"], (result) => {
        // **Source**: Chrome Extension Development  
        // Google Chrome Developers Documentation.  
        // [https://developer.chrome.com/docs/extensions/](https://developer.chrome.com/docs/extensions/)
        const profiles = result.profiles || { default: [] };
        populateProfileSelector(Object.keys(profiles));
        chrome.storage.local.get(["currentProfile"], (result) => {
            currentProfile = result.currentProfile || "default";
            profileSelector.value = currentProfile;
            loadFieldsForProfile(currentProfile, profiles);
        });

        loadFieldsForProfile(currentProfile, profiles);
    });

    addFieldButton.addEventListener("click", () => {
        // **Source**: MDN Web Docs  
        // Form Validation.  
        // [https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
        if (currentProfile === "default") {
            alert("You cannot add fields to the default profile.");
            return;
        }
        const key = newKeyInput.value.trim();
        const value = newValueInput.value.trim();
        if (key && value) {
            addFieldToUI(key, value);
            newKeyInput.value = "";
            newValueInput.value = "";
            saveFieldsToStorage();
        }
    });

    newProfileButton.addEventListener("click", () => {
        const profileName = prompt("Enter new profile name:");
        if (profileName) {
            // **Source**: AI Assistance
            // OpenAI. (2023, October 23). ChatGPT (Sep 25, 2023 version) [Large language model].  
            // [https://chat.openai.com/chat](https://chat.openai.com/chat)
            // Prompt: "How to dynamically create new objects in local storage using Chrome Extensions?"
            chrome.storage.local.get(["profiles"], (result) => {
                const profiles = result.profiles || {};
                profiles[profileName] = [];
                chrome.storage.local.set({ profiles }, () => {
                    populateProfileSelector(Object.keys(profiles));
                    profileSelector.value = profileName;
                    currentProfile = profileName;
                    chrome.storage.local.set({ currentProfile });
                    fieldsContainer.innerHTML = "";
                });
            });
        }
    });

    deleteProfileButton.addEventListener("click", () => {
        if (currentProfile === "default") {
            alert("Default profile cannot be deleted.");
            return;
        }
        chrome.storage.local.get(["profiles"], (result) => {
            const profiles = result.profiles || {};
            delete profiles[currentProfile];
            chrome.storage.local.set({ profiles }, () => {
                populateProfileSelector(Object.keys(profiles));
                currentProfile = "default";
                chrome.storage.local.set({ currentProfile });
                profileSelector.value = currentProfile;
                fieldsContainer.innerHTML = "";
                loadFieldsForProfile(currentProfile, profiles);
            });
        });
    });

    profileSelector.addEventListener("change", () => {
        currentProfile = profileSelector.value;
        chrome.storage.local.set({ currentProfile });

        chrome.storage.local.get(["profiles"], (result) => {
            const profiles = result.profiles || {};
            fieldsContainer.innerHTML = "";
            loadFieldsForProfile(currentProfile, profiles);
        });

        if (currentProfile === "default") {
            addFieldButton.disabled = true;
            newKeyInput.disabled = true;
            newValueInput.disabled = true;
        } else {
            addFieldButton.disabled = false;
            newKeyInput.disabled = false;
            newValueInput.disabled = false;
        }

    });

    // Helper function to add fields to UI
    // **Source**: AI Assistance  
    // OpenAI. (2023, October 23). ChatGPT (Sep 25, 2023 version) [Large language model].  
    // [https://chat.openai.com/chat](https://chat.openai.com/chat)
    // Prompt: "How to dynamically create input fields in JavaScript for a Chrome Extension?"
    function addFieldToUI(key, value) {
        const div = document.createElement("div");
        div.classList.add("field");

        const keyInput = document.createElement("input");
        keyInput.type = "text";
        keyInput.classList.add("key");
        keyInput.value = key;
        keyInput.disabled = true;

        const valueInput = document.createElement("input");
        valueInput.type = "text";
        valueInput.classList.add("value");
        valueInput.value = value;
        valueInput.disabled = true;

        const editButton = document.createElement("button");
        editButton.textContent = "✏️";
        editButton.addEventListener("click", () => {
            if (keyInput.disabled && valueInput.disabled) {
                keyInput.disabled = false;
                valueInput.disabled = false;
                editButton.textContent = "✔️";
            } else {
                keyInput.disabled = true;
                valueInput.disabled = true;
                editButton.textContent = "✏️";
                saveFieldsToStorage();
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.addEventListener("click", () => {
            fieldsContainer.removeChild(div);
            saveFieldsToStorage();
        });

        div.appendChild(keyInput);
        div.appendChild(valueInput);
        div.appendChild(editButton);
        div.appendChild(deleteButton);
        fieldsContainer.appendChild(div);
    }

    function saveFieldsToStorage() {
        const fields = Array.from(fieldsContainer.children).map((div) => {
            return {
                key: div.querySelector(".key").value.trim(),
                value: div.querySelector(".value").value.trim(),
            };
        });
        chrome.storage.local.get(["profiles"], (result) => {
            const profiles = result.profiles || {};
            profiles[currentProfile] = fields;
            chrome.storage.local.set({ profiles });
        });
    }

    function loadFieldsForProfile(profile, profiles) {
        const fields = profiles[profile] || [];
        fields.forEach(({ key, value }) => addFieldToUI(key, value));
        populateMappingFields(fields)
    }

    function populateProfileSelector(profileNames) {
        profileSelector.innerHTML = "";
        profileNames.forEach((name) => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            if (name == "default") option.disabled = true
            profileSelector.appendChild(option);
        });
    }

    const extractButton = document.getElementById("extractLinkedin");

    extractButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(
                activeTab.id,
                { action: "extractLinkedInData" },
                (response) => {
                    if (response) {
                        fieldsContainer.innerHTML = "";
                        Object.entries(response).forEach(([key, value]) => {
                            addFieldToUI(key, value);
                        });
                        saveFieldsToStorage();
                        populateMappingFields(response)
                    } else {
                        alert("Failed to extract LinkedIn data. Ensure you're on a LinkedIn profile page.");
                    }
                }
            );
        });
    });

    function populateMappingFields(linkedinData) {
        if (!linkedinData) return;
        const selector = document.getElementById("linkedin-field-selector");
        selector.innerHTML = '<option value="" disabled>Select LinkedIn Field</option>';
        linkedinData.forEach((field) => {
            const option = document.createElement("option");
            option.value = field.key;
            option.textContent = field.key;
            selector.appendChild(option);
        });
    }

    document.getElementById("add-mapping").addEventListener("click", () => {
        const linkedinField = document.getElementById("linkedin-field-selector").value;
        const formFieldName = document.getElementById("form-field-name").value.trim();

        if (linkedinField && formFieldName) {
            addMappingToUI(linkedinField, formFieldName);
            saveMappingsToStorage();
        }
    });

    function addMappingToUI(linkedinField, formFieldName) {
        const container = document.getElementById("mapping-container");

        const div = document.createElement("div");
        div.classList.add("mapping-item");

        const mappingText = document.createElement("span");
        mappingText.textContent = `${linkedinField} → ${formFieldName}`;
        div.appendChild(mappingText);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.addEventListener("click", () => {
            container.removeChild(div);
            saveMappingsToStorage();
        });
        div.appendChild(deleteButton);

        container.appendChild(div);
    }

    function saveMappingsToStorage() {
        const mappings = Array.from(document.querySelectorAll(".mapping-item span")).map((span) => {
            const [linkedinField, formFieldName] = span.textContent.split(" → ");
            return { linkedinField, formFieldName };
        });
        chrome.storage.local.set({ fieldMappings: mappings });
    }

    function loadMappings() {
        chrome.storage.local.get(["fieldMappings"], (result) => {
            const mappingFields = result.fieldMappings || [];
            mappingFields.forEach(({ linkedinField, formFieldName }) => {
                addMappingToUI(linkedinField, formFieldName);
            });
        });
    }

    const autofillButton = document.getElementById("autofillButton")
    autofillButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "applyMappings", currentProfile });
        });
    });

    document.getElementById("save-for-later").addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "saveFormForLater" }, (response) => {
                if (response?.success) {
                    alert("Form saved successfully!");
                    loadSavedForms();
                } else {
                    alert("No form detected on this page.");
                }
            });
        });
    });

    // Load saved forms into the popup
    function loadSavedForms() {
        chrome.storage.local.get(["savedForms"], (result) => {
            const savedForms = result.savedForms || [];
            const savedFormsList = document.getElementById("saved-forms-list");
            savedFormsList.innerHTML = "";

            savedForms.forEach((form, index) => {
                const listItem = document.createElement("li");
                const title = form.pageTitle || "Untitled Page";
                listItem.textContent = `Form #${index + 1} - ${title}`;

                const restoreButton = document.createElement("button");
                restoreButton.textContent = "Restore";
                restoreButton.addEventListener("click", () => restoreForm(index));
                listItem.appendChild(restoreButton);

                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => editSavedForm(index, form));
                listItem.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => deleteSavedForm(index));
                listItem.appendChild(deleteButton);

                savedFormsList.appendChild(listItem);
            });
        });
    }

    // Restore a saved form
    function restoreForm(index) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.storage.local.get(["savedForms"], (result) => {
                const savedForms = result.savedForms || [];
                if (savedForms[index]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "restoreForm", form: savedForms[index] });
                }
            });
        });
    }

    // Delete a saved form
    function deleteSavedForm(index) {
        chrome.storage.local.get(["savedForms"], (result) => {
            const savedForms = result.savedForms || [];
            savedForms.splice(index, 1);
            chrome.storage.local.set({ savedForms }, loadSavedForms);
        });
    }

    function editSavedForm(index, form) {
        const savedFormsContainer = document.getElementById("saved-forms-list");
        savedFormsContainer.innerHTML = ""; // Clear the saved forms list

        const editForm = document.createElement("div");
        editForm.innerHTML = `
            <h2>Edit Form #${index + 1} - ${form.pageTitle}</h2>
            <div id="edit-form-fields"></div>
            <button id="save-edits">Save Changes</button>
            <button id="cancel-edit">Cancel</button>
        `;

        savedFormsContainer.appendChild(editForm);

        // Populate the editable fields
        const editFieldsContainer = document.getElementById("edit-form-fields");
        Object.entries(form).forEach(([key, value]) => {
            const fieldDiv = document.createElement("div");
            fieldDiv.innerHTML = `
                <label>${key}</label>
                <input type="text" id="edit-${key}" value="${value}" />
            `;
            editFieldsContainer.appendChild(fieldDiv);
        });

        // Save Changes Button
        document.getElementById("save-edits").addEventListener("click", () => {
            const updatedForm = {};
            Object.keys(form).forEach((key) => {
                const input = document.getElementById(`edit-${key}`);
                if (input) {
                    updatedForm[key] = input.value;
                }
            });

            chrome.storage.local.get(["savedForms"], (result) => {
                const savedForms = result.savedForms || [];
                savedForms[index] = updatedForm; // Update the form in storage
                chrome.storage.local.set({ savedForms }, () => {
                    alert("Form updated successfully!");
                    const savedFormsContainer = document.getElementById("saved-forms-list");
                    savedFormsContainer.innerHTML = "";
                    loadSavedForms(); // Reload the list of forms
                });
            });
        });

        // Cancel Button
        document.getElementById("cancel-edit").addEventListener("click", () => {
            const savedFormsContainer = document.getElementById("saved-forms-list");
            savedFormsContainer.innerHTML = ""; // Clear the edit form
            loadSavedForms(); // Restore the saved forms list
        });
    }
});
