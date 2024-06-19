import React from 'react';
import './Tutorial.css'; // Assuming you have a CSS file for styling
import { useNavigate } from 'react-router-dom';

const Tutorial = () => {
const navigate = useNavigate();
  return (
    <div className="tutorial-container">
      <h1 className="tutorial-header">How to Use autoCTR</h1>
      <div className="step">
        <h2>Step 1: Accessing autoCTR</h2>
        <p>Go to the main dashboard and click on the 'autoCTR' tool from the navigation menu.</p>
        <img src="/step1.png" alt="Accessing autoCTR" className="tutorial-image"/>
      </div>
      <div className="step">
        <h2>Step 2: Uploading Your Document</h2>
        <p>Click the 'Upload' button to select the document you want to process with autoCTR.</p>
        <img src="/step2.png" alt="Uploading Document" className="tutorial-image"/>
      </div>
      <div className="step">
        <h2>Step 3: Pasting and Reviewing Extracted Data</h2>
        <p>Upload your data from the excel sheet. Once your document is processed, review the extracted data displayed on the screen. </p>
        <img src="/step3.png" alt="Reviewing Data" className="tutorial-image"/>
      </div>
      <div className="step">
        <h2>Step 4: Saving or Exporting Data</h2>
        <p>After reviewing, you can save your data and export it with the marked-up rectangular boxes, by clicking on 'Download Edited PDFs and Entering your WO#</p>
        <img src="/step4.png" alt="Saving or Exporting Data" className="tutorial-image"/>
      </div>

      <button
        onClick={() => navigate('/')} // This navigates to the home route
        className="bg-red-500 text-white py-2 px-4 rounded-md mt-4"
      >
        Go Back to App.js
      </button>

    </div>
  );
}

export default Tutorial;
