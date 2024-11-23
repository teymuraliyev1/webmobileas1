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
});
