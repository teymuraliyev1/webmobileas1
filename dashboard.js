document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("application-form");
    const tableBody = document.getElementById("application-table").querySelector("tbody");

    // Load applications from storage
    chrome.storage.local.get(["applications"], (result) => {
        const applications = result.applications || [];
        applications.forEach((app) => addApplicationToTable(app));
    });

    // Add application
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const company = document.getElementById("company").value.trim();
        const jobTitle = document.getElementById("job-title").value.trim();
        const dateApplied = document.getElementById("date-applied").value;
        const status = document.getElementById("status").value;

        const application = { company, jobTitle, dateApplied, status };

        addApplicationToTable(application);
        saveApplicationToStorage(application);

        form.reset();
    });

    // Add application to table
    function addApplicationToTable(application) {
        const row = document.createElement("tr");

        Object.values(application).forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Add actions cell
        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            row.remove();
            deleteApplicationFromStorage(application);
        });
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    }

    // Save application to storage
    function saveApplicationToStorage(application) {
        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            applications.push(application);
            chrome.storage.local.set({ applications });
        });
    }

    // Delete application from storage
    function deleteApplicationFromStorage(application) {
        chrome.storage.local.get(["applications"], (result) => {
            const applications = result.applications || [];
            const updatedApplications = applications.filter(
                (app) =>
                    app.company !== application.company ||
                    app.jobTitle !== application.jobTitle ||
                    app.dateApplied !== application.dateApplied ||
                    app.status !== application.status
            );
            chrome.storage.local.set({ applications: updatedApplications });
        });
    }
});
