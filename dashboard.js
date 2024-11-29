document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("application-form");
    const tableBody = document.getElementById("application-table").querySelector("tbody");

    chrome.storage.local.get(["applications"], (result) => {
        const applications = result.applications || [];
        applications.forEach((app, index) => addApplicationRow(app, index));
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const company = document.getElementById("company").value.trim();
        const jobTitle = document.getElementById("job-title").value.trim();
        const dateApplied = document.getElementById("date-applied").value;
        const status = document.getElementById("status").value;

        const application = { company, jobTitle, dateApplied, status };
        console.log(application)
        addApplicationRow(application, tableBody.children.length);
        saveApplicationToStorage(application);
        form.reset();
    });

    function addApplicationRow(application, index) {
        const columnOrder = ["company", "jobTitle", "dateApplied", "status"]; // Fixed column order
        const row = document.createElement("tr");
        row.setAttribute("data-index", index);

        columnOrder.forEach((key) => {
            const cell = document.createElement("td");
            const value = application[key] || ""; // Default to empty if key is missing

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

    function toggleEdit(row, application, editButton) {
        const columnOrder = ["company", "jobTitle", "dateApplied", "status"]; // Ensure consistent order
        const cells = row.querySelectorAll("td");
        const isEditing = editButton.textContent === "Save";

        if (isEditing) {
            const updatedApplication = {};
            cells.forEach((cell, i) => {
                if (i < columnOrder.length) {
                    const input = cell.querySelector("input, select, textarea");
                    if (input) {
                        const key = columnOrder[i]; // Use fixed column order
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

    function saveEditedApplication(updatedApplication, index) {
        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            applications[index] = updatedApplication;
            chrome.storage.local.set({ applications });
        });
    }

    function saveApplicationToStorage(application) {
        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            applications.push(application);
            chrome.storage.local.set({ applications });
        });
    }

    function deleteApplication(row, index) {
        row.remove();
        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            applications.splice(index, 1);
            chrome.storage.local.set({ applications });
        });
    }

    // Data transfer
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
                            location.reload(); // Reload to reflect new data
                        });
                    });
                } catch (error) {
                    alert("Invalid JSON file.");
                }
            };
            reader.readAsText(file);
        }
    });

    document.getElementById("send-email").addEventListener("click", () => {
        chrome.storage.local.get(null, (data) => {
            const formattedData = JSON.stringify(data, null, 2);

            const maxEmailBodyLength = 500; 
            let body;

            if (formattedData.length > maxEmailBodyLength) {
                // Truncate data if it's too long
                const truncatedData = formattedData.substring(0, 500) + "\n\n[Data truncated: too long to include]";
                body = `Here is your exported form data (truncated):\n\n${truncatedData}\n\nPlease export the data as a file for the complete dataset.`;
            } else {
                // Include full data if within the limit
                body = `Here is your exported form data:\n\n${formattedData}`;
            }

            // Create the mailto link
            const subject = encodeURIComponent("Exported Form Data");
            const encodedBody = encodeURIComponent(body);
            const mailtoLink = `mailto:?subject=${subject}&body=${encodedBody}`;

            // Open the default email client
            window.location.href = mailtoLink;
        });
    });

});
