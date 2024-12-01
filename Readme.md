## Auto Form Filler Chrome Extension

### Overview
The **Auto Form Filler Chrome Extension** is an intelligent tool designed to streamline job application and form-filling processes. It extracts data from a user's LinkedIn profile and allows manual customization of fields. Users can save profiles for different applications, generate cover letters, and track job applications via a built-in dashboard.

---

### Features

1. **Customizable Data Fields**  
   - Add or edit fields manually.
   - Save additional data like certificates or portfolio links locally.

2. **Profile Switching**  
   - Create and switch between multiple profiles tailored to different industries or roles.

3. **Form Field Mapping**  
   - Map LinkedIn fields to specific form fields for accurate autofill functionality.

4. **Automatic Cover Letter Generation**  
   - Generate tailored cover letters using job title and company name.  
   *(Uses the Google Gemini API for text generation.)*
    https://ai.google.dev/pricing#1_5flash

5. **Job Application Tracker**  
   - A dashboard to manage tracked job applications, including details such as company, job title, application date, and status.

6. **History Restoring**  
   - Save partially or fully filled forms for future use.

7. **Data Transfer**  
   - Import/export data as JSON files and send data via email.

8. **Browser Extension**  
   - Simple interface and lightweight structure using only HTML, CSS, and JavaScript.  

---

### Technologies Used
- **Manifest Version**: 3  
- **Programming Languages**: JavaScript, HTML, CSS  
- **API Integration**: Google Gemini API for cover letter generation  
- **Storage**: Chrome Local Storage for saving data

---

### File Structure
```
├── background.js          # Handles background tasks and message passing
├── content.js             # Extracts LinkedIn data and interacts with web pages
├── dashboard.html         # Job application tracker interface
├── dashboard.js           # Logic for job tracking and data visualization
├── exampleForm.html       # Example form for testing
├── manifest.json          # Chrome extension configuration
├── popup.html             # Popup interface for profile and field management
├── popup.js               # Logic for the popup menu and profile switching
├── styles.css             # General styles for extension and popup
├── dashboard.css          # Specific styles for dashboard page

```

### Usage Instructions
1. **Extract Data**  
   - Visit a LinkedIn profile and use the popup to extract data.
   
2. **Manage Profiles**  
   - Create, edit, or delete profiles based on your requirements.

3. **Map Fields**  
   - Customize mappings between manually entered or Linkedin data and form fields.

4. **Autofill Forms**  
   - Navigate to a job application form and autofill it using saved profiles.

5. **Generate Cover Letter**  
   - Automatically create a cover letter using extracted data.

6. **Track Applications**  
   - Use the dashboard to log and monitor your job applications.

7. **Save & Restore Forms**  
   - Save partially completed forms for later submission.


### References

1. **AI Assistance**  
   OpenAI. (2023, October 23). ChatGPT (Sep 25, 2023 version) [Large language model].  
   [https://chat.openai.com/chat](https://chat.openai.com/chat)

2. **Chrome Extension Development**  
   Google Chrome Developers Documentation.  
   [https://developer.chrome.com/docs/extensions/](https://developer.chrome.com/docs/extensions/)

3. **Manifest Version 3**  
   Google Chrome Extension Manifest V3 Overview.  
   [https://developer.chrome.com/docs/extensions/mv3/intro/](https://developer.chrome.com/docs/extensions/mv3/intro/)

4. **Google Gemini API**  
   Generative Language API Documentation.  
   [https://ai.google.dev/pricing#1_5flash](https://ai.google.dev/pricing#1_5flash)

5. **JavaScript Local Storage**  
   MDN Web Docs: Web Storage API.  
   [https://developer.mozilla.org/en-US/docs/Web/API/Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage)

6. **MDN Web Docs**  
   Form Validation.  
   [https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)  
