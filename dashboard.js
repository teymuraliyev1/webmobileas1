document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("application-form");
    const tableBody = document.getElementById("application-table").querySelector("tbody");

    // Load existing applications from local storage
    // **Source**: MDN Web Docs: Web Storage API.
    // [https://developer.mozilla.org/en-US/docs/Web/API/Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage)
    chrome.storage.local.get(["applications"], (result) => {
        const applications = result.applications || [];
        applications.forEach((app, index) => addApplicationRow(app, index));
    });

    // Load current profile and populate cover letter
    chrome.storage.local.get(["currentProfile", "profiles"], (res) => {
        const currentFields = res.profiles[res.currentProfile];
        document.getElementById("cover-letter-text").innerHTML = currentFields.find(item => item.key === "coverLetter").value;
    });

    // Handle form submission for adding applications
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const company = document.getElementById("company").value.trim();
        const jobTitle = document.getElementById("job-title").value.trim();
        const dateApplied = document.getElementById("date-applied").value;
        const status = document.getElementById("status").value;

        const application = { company, jobTitle, dateApplied, status };
        addApplicationRow(application, tableBody.children.length);
        saveApplicationToStorage(application);
        form.reset();
    });

    // Add a row to the application table
    function addApplicationRow(application, index) {
        const columnOrder = ["company", "jobTitle", "dateApplied", "status"];
        const row = document.createElement("tr");
        row.setAttribute("data-index", index);

        columnOrder.forEach((key) => {
            const cell = document.createElement("td");
            const value = application[key] || "";

            switch (key) {
                case "status":
                    const select = document.createElement("select");
                    ["Pending", "Interview", "Offered", "Rejected"].forEach((status) => {
                        const option = document.createElement("option");
                        option.value = status;
                        option.textContent = status;
                        option.selected = status === value;
                        select.appendChild(option);
                    });
                    select.disabled = true;
                    cell.appendChild(select);
                    break;
                case "dateApplied":
                    const inputDate = document.createElement("input");
                    inputDate.type = "date";
                    inputDate.value = value;
                    inputDate.disabled = true;
                    cell.appendChild(inputDate);
                    break;
                default:
                    const input = document.createElement("textarea");
                    input.value = value;
                    input.disabled = true;
                    cell.appendChild(input);
            }
            row.appendChild(cell);
        });

        const actionsCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => toggleEdit(row, application, editButton));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteApplication(row, index));
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    }

    // Toggle edit mode for a row
    function toggleEdit(row, application, editButton) {
        const columnOrder = ["company", "jobTitle", "dateApplied", "status"];
        const cells = row.querySelectorAll("td");
        const isEditing = editButton.textContent === "Save";

        if (isEditing) {
            const updatedApplication = {};
            cells.forEach((cell, i) => {
                if (i < columnOrder.length) {
                    const input = cell.querySelector("input, select, textarea");
                    if (input) {
                        const key = columnOrder[i];
                        updatedApplication[key] = input.value;
                        input.disabled = true;
                    }
                }
            });

            const index = row.getAttribute("data-index");
            saveEditedApplication(updatedApplication, index);
            editButton.textContent = "Edit";
        } else {
            cells.forEach((cell) => {
                const input = cell.querySelector("input, select, textarea");
                if (input) input.disabled = false;
            });
            editButton.textContent = "Save";
        }
    }

    // Save edited application to storage
    function saveEditedApplication(updatedApplication, index) {
        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            applications[index] = updatedApplication;
            chrome.storage.local.set({ applications });
        });
    }

    // Save new application to storage
    function saveApplicationToStorage(application) {
        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            applications.push(application);
            chrome.storage.local.set({ applications });
        });
    }

    // Delete an application from storage
    function deleteApplication(row, index) {
        row.remove();
        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            applications.splice(index, 1);
            chrome.storage.local.set({ applications });
        });
    }

    // Export data to a JSON file
    document.getElementById("export-data").addEventListener("click", () => {
        chrome.storage.local.get(null, (data) => {
            const jsonData = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "form_data.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    // Import data from a JSON file
    document.getElementById("import-data").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    chrome.storage.local.get(null, (currentData) => {
                        const mergedData = { ...currentData, ...importedData };
                        chrome.storage.local.set(mergedData, () => {
                            alert("Data imported successfully!");
                            location.reload();
                        });
                    });
                } catch (error) {
                    alert("Invalid JSON file.");
                }
            };
            reader.readAsText(file);
        }
    });

    // Generate cover letter using Google Gemini API
    // **Source**: Google Gemini API Documentation.
    // [https://ai.google.dev/pricing#1_5flash](https://ai.google.dev/pricing#1_5flash)
    document.getElementById("create-coverletter").addEventListener("click", () => {
        chrome.storage.local.get(["currentProfile", "profiles"], (res) => {
            const currentFields = res.profiles[res.currentProfile];
            const payload = {
                contents: [
                    {
                        parts: [
                            {
                                text: `Create me a cover letter with this data: ${JSON.stringify(currentFields)}`
                            }
                        ]
                    }
                ]
            };

            sendJsonToGoogleAI(payload)
                .then(response => {
                    const responseText = response.candidates[0].content.parts[0].text;
                    document.getElementById("cover-letter-text").innerHTML = responseText;

                    const updatedFields = [...currentFields, { key: "coverLetter", value: responseText }];
                    res.profiles[res.currentProfile] = updatedFields;

                    chrome.storage.local.set({ profiles: res.profiles }, () => {
                        alert("Cover letter stored successfully!");
                    });
                })
                .catch(error => console.error('API Call Failed:', error));
        });
    });

    // Helper to send JSON to Google AI API
    async function sendJsonToGoogleAI(requestBody) {
        const apiKey = "AIzaSyB-rCUjE8hrGz-ypbr8ZI9dgC8BAkCh9tc";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending JSON to API:', error);
            throw error;
        }
    }
});
