document.addEventListener("DOMContentLoaded", () => {
    const fieldsContainer = document.getElementById("fields-container");
    const addFieldButton = document.getElementById("add-field");
    const newKeyInput = document.getElementById("new-key");
    const newValueInput = document.getElementById("new-value");
    const profileSelector = document.getElementById("profile-selector");
    const newProfileButton = document.getElementById("new-profile-button");
    const deleteProfileButton = document.getElementById("delete-profile-button");

    let currentProfile = "default";

    chrome.storage.local.get(["profiles"], (result) => {
        const profiles = result.profiles || { default: [] };
        populateProfileSelector(Object.keys(profiles));
        currentProfile = profileSelector.value || "default";
        loadFieldsForProfile(currentProfile, profiles);
    });

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

    newProfileButton.addEventListener("click", () => {
        const profileName = prompt("Enter new profile name:");
        if (profileName) {
            chrome.storage.local.get(["profiles"], (result) => {
                const profiles = result.profiles || {};
                profiles[profileName] = [];
                chrome.storage.local.set({ profiles }, () => {
                    populateProfileSelector(Object.keys(profiles));
                    profileSelector.value = profileName;
                    currentProfile = profileName;
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
                profileSelector.value = currentProfile;
                fieldsContainer.innerHTML = "";
                loadFieldsForProfile(currentProfile, profiles);
            });
        });
    });

    profileSelector.addEventListener("change", () => {
        currentProfile = profileSelector.value;
        chrome.storage.local.get(["profiles"], (result) => {
            const profiles = result.profiles || {};
            fieldsContainer.innerHTML = "";
            loadFieldsForProfile(currentProfile, profiles);
        });
    });

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
        console.log(fields)
        populateMappingFields(fields)
    }

    function populateProfileSelector(profileNames) {
        profileSelector.innerHTML = "";
        profileNames.forEach((name) => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            profileSelector.appendChild(option);
        });
    }

    const extractButton = document.createElement("button");
    extractButton.textContent = "Extract from LinkedIn";
    extractButton.style.marginTop = "10px";
    document.body.appendChild(extractButton);

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
        if(!linkedinData) return;
        const selector = document.getElementById("linkedin-field-selector");
        selector.innerHTML = '<option value="" disabled>Select LinkedIn Field</option>';
        linkedinData.forEach((field) => {
            const option = document.createElement("option");
            option.value = field.key;
            option.textContent = field.key;
            selector.appendChild(option);
        });
    }
    
});
