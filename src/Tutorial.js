import React from 'react';
import './Tutorial.css'; // Assuming you have a CSS file for styling
import { useNavigate } from 'react-router-dom';

const Tutorial = () => {
const navigate = useNavigate();
  return (
    <div className="tutorial-container" style={{ textAlign: "center" }}>
      <h1 className="tutorial-header">How to Use the CTR Automation</h1>
      <div className="step">
        <h2>Step 1: Accessing the CTR Automation</h2>
        <p>Go to the main dashboard and click on the 'CTR Automation' tool from the navigation menu.</p>
        <img src="/step1.png" alt="Accessing autoCTR" className="tutorial-image" />
      </div>
      <div className="step">
        <h2>Step 2: Uploading Your Document</h2>
        <p>Click the 'Upload' button to select the document you want to process with autoCTR.</p>
        <img src="/step2.png" alt="Uploading Document" className="tutorial-image" />
      </div>
      <div className="step">
        <h2>Step 3: Pasting and Reviewing Extracted Data</h2>
        <p>Paste your data from the excel sheet. Note, you must paste your Sequence #'s | Facility ID's | and Optional Transmission Numbers. Example is shown below. Once your document is processed, review the extracted data displayed on the screen. </p>
        <img src="/step3two.png" alt="Reviewing Data" className="tutorial-image" />
        <img src="/step3.png" alt="Reviewing Data" className="tutorial-image" />
      </div>
      <div className="step">
        <h2>Step 4: Reviewing and Understanding the Data</h2>
        <p>While reviewing, notice how it will either output the proper SEQ # | id, state which pages arent found, and will also let you know if you missed any data points that occured in this CTR.</p>
        <img src="/step4.png" alt="Saving or Exporting Data" className="tutorial-image" />
      </div>
      <div className="step">
        <h2>Step 5: Exporting and Saving the Data</h2>
        <p>Click "Download Edited PDFs" and then enter your WO#, then click Add Box and Download Edited PDF's to download your results.</p>
        <img src="/step5.png" alt="Saving or Exporting Data" className="tutorial-image" />
      </div>

      <button
        onClick={() => navigate('/')} // This navigates to the home route
        className="bg-yellow-500 text-white py-2 px-4 rounded-md mt-4"
      >
        CTR Tool
      </button>

    </div>
  );
}

export default Tutorial;
