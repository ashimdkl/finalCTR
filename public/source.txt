import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';

import './App.css';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function MainPage() {
  const [renameFiles, setRenameFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [facilityData, setFacilityData] = useState("");
  const [facilityDialogVisible, setFacilityDialogVisible] = useState(false);
  const [workOrderDialogVisible, setWorkOrderDialogVisible] = useState(false);
  const [workOrder, setWorkOrder] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [missingCtrs, setMissingCtrs] = useState([]);

  const handleFacilityDataChange = (event) => {
    setFacilityData(event.target.value);
  };

  const handleWorkOrderChange = (event) => {
    setWorkOrder(event.target.value);
  };

  const parseFacilityData = (data) => {
    return data.split('\n').map(line => {
      const [sequence, facilityId, transmission] = line.split('\t');
      return { sequence, facilityId, transmission };
    });
  };

  const extractTransmissionNumber = (text) => {
    const regex = /(\d{6}\/\d{2}\s?\d{1,2}\/\d{3})/;
    const match = text.match(regex);
    return match ? match[1].replace(/\s+/g, '') : null;
  };

  const handleRenameDrop = (acceptedFiles) => {
    setRenameFiles(acceptedFiles);
    setLoading(true);
    setFacilityDialogVisible(true);
  };

  const processFacilityData = () => {
    const facilityDataArray = parseFacilityData(facilityData);
    const missingFacilityData = [...facilityDataArray];
    const renamePromises = renameFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedArray = new Uint8Array(reader.result);
          const loadingTask = getDocument(typedArray);
          const pdf = await loadingTask.promise;

          const pagePromises = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            pagePromises.push(pdf.getPage(i).then(async (page) => {
              const textContent = await page.getTextContent();
              const lines = textContent.items.map(item => item.str.replace(/\s+/g, ''));
              const text = lines.join('');

              const regex = /(\d{8}\.\d+)\s*(\d+)/;
              const matches = text.match(regex);
              let facilityId = null;
              if (matches) {
                facilityId = matches[1] + matches[2];
              }

              const facilityMatch = facilityDataArray.find(item => item.facilityId === facilityId);
              if (facilityMatch) {
                const index = missingFacilityData.findIndex(item => item.facilityId === facilityId);
                if (index !== -1) missingFacilityData.splice(index, 1);
              }

              let sequence = facilityMatch ? facilityMatch.sequence : 'not found';
              let additionalInfo = '';

              if (sequence === 'not found') {
                const transmissionNumber = extractTransmissionNumber(text);
                if (transmissionNumber) {
                  const transmissionMatch = facilityDataArray.find(item => item.transmission && item.transmission.replace(/\s+/g, '') === transmissionNumber);
                  if (transmissionMatch) {
                    sequence = transmissionMatch.sequence;
                    additionalInfo = 'transmission';
                  }
                }
              }

              const result = {
                fileName: file.name,
                page: `page ${i}`,
                sequence,
                facilityId: facilityId || 'not found',
                additionalInfo,
              };

              return result;
            }));
          }

          Promise.all(pagePromises).then((pageResults) => {
            resolve(pageResults);
          });
        };

        reader.readAsArrayBuffer(file);
      });
    });

    Promise.all(renamePromises).then((allResults) => {
      const flattenedResults = allResults.flat();
      setResults(flattenedResults);
      setMissingCtrs(missingFacilityData);
      setLoading(false);
      setFacilityDialogVisible(false);
    });
  };

  const renameAndZipFiles = () => {
    setLoading(true);
    const zip = new JSZip();

    const sequenceGroups = results.reduce((groups, result) => {
      if (result.sequence !== 'not found') {
        if (!groups[result.sequence]) {
          groups[result.sequence] = [];
        }
        groups[result.sequence].push(result);
      }
      return groups;
    }, {});

    const renamePromises = Object.keys(sequenceGroups).map(async (sequence) => {
      const pdfDoc = await PDFDocument.create();
      const sequenceResults = sequenceGroups[sequence];
      for (const result of sequenceResults) {
        const file = renameFiles.find(f => f.name === result.fileName);
        if (file) {
          const arrayBuffer = await file.arrayBuffer();
          const originalPdf = await PDFDocument.load(arrayBuffer);

          const pageIndex = parseInt(result.page.split(' ')[1], 10) - 1;
          const [page] = await pdfDoc.copyPages(originalPdf, [pageIndex]);
          pdfDoc.addPage(page);
        }
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      zip.file(`SEQ${sequence}.pdf`, blob);
    });

    Promise.all(renamePromises).then(() => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'output.zip');
        setLoading(false);
      });
    }).catch(error => {
      console.error('Error generating zip file:', error);
      setLoading(false);
    });
  };

  const addBoxToPages = async () => {
    setLoading(true);

    const sequenceGroups = results.reduce((groups, result) => {
      if (result.sequence !== 'not found') {
        if (!groups[result.sequence]) {
          groups[result.sequence] = [];
        }
        groups[result.sequence].push(result);
      }
      return groups;
    }, {});

    const editPromises = Object.keys(sequenceGroups).map(async (sequence) => {
      const pdfDoc = await PDFDocument.create();
      const sequenceResults = sequenceGroups[sequence];
      
      for (const result of sequenceResults) {
        const file = renameFiles.find(f => f.name === result.fileName);
        if (file) {
          const arrayBuffer = await file.arrayBuffer();
          const originalPdf = await PDFDocument.load(arrayBuffer);

          const pageIndex = parseInt(result.page.split(' ')[1], 10) - 1;
          const [page] = await pdfDoc.copyPages(originalPdf, [pageIndex]);
          const newPage = pdfDoc.addPage(page);

          const rectWidth = 120;
          const rectHeight = 40;
          const rectX = newPage.getWidth() - rectWidth - 10;
          const rectY = newPage.getHeight() - rectHeight - 10;

          newPage.drawRectangle({
            x: rectX,
            y: rectY,
            width: rectWidth,
            height: rectHeight,
            borderColor: rgb(1, 0, 0),
            borderWidth: 1,
          });

          newPage.drawText(`WO: ${workOrder}`, {
            x: rectX + 5,
            y: rectY + 20,
            size: 10,
            color: rgb(1, 0, 0),
          });

          newPage.drawText(`Sequence #: ${result.sequence}`, {
            x: rectX + 5,
            y: rectY + 5,
            size: 10,
            color: rgb(1, 0, 0),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      return { blob, fileName: `SEQ${sequence}.pdf` };
    });

    const editedFiles = await Promise.all(editPromises);
    const zip = new JSZip();

    editedFiles.forEach((file) => {
      zip.file(file.fileName, file.blob);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'edited_files.zip');
      setLoading(false);
    }).catch(error => {
      console.error('Error generating zip file:', error);
      setLoading(false);
    });
  };

  const { getRootProps: getRenameRootProps, getInputProps: getRenameInputProps } = useDropzone({ onDrop: handleRenameDrop });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full bg-white shadow-md py-4 flex items-center">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <img src="https://darktolight.productions/wp-content/uploads/2016/04/power-engineers-logo-1024x363.png" alt="My Logo" className="h-12"/>
          <nav className="flex items-center space-x-4">
            <div className="relative group">
            <button className="flex items-center space-x-1">
            <span>Tools</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 12a.9.9 0 01-.614-.228l-3.976-3.505A.9.9 0 116.59 6.52L10 9.692l3.41-3.172a.9.9 0 111.182 1.316L10.614 11.77A.9.9 0 0110 12z" clipRule="evenodd" />
          </svg>
          </button>
          <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-1 py-1 w-48">
          {/* Update the links below */}
          <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">CTR Automation</Link>
          <Link to="/tutorial" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Tutorial</Link>
          <Link to="/developer-docs" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Developer Docs</Link>
      </div>
    </div>
  </nav>

        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font- mb-6">PacifiCorp CTR Automation</h1>
        <div {...getRenameRootProps({ className: 'dropzone' })} className="w-full max-w-md bg-white border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer">
          <input {...getRenameInputProps()} />
          <p className="text-gray-500">Choose or drag your ctr pdf document here.</p>
        </div>
        {loading && renameFiles.length > 0 ? (
          <div className="mt-4">Loading and processing files...</div>
        ) : (
          renameFiles.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">Files processed! Check the results below.</h2>
            </div>
          )
        )}
        {facilityDialogVisible && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Enter sequence # and facility id pairs</h2>
            <textarea
              rows="10"
              cols="50"
              value={facilityData}
              onChange={handleFacilityDataChange}
              placeholder={`Enter sequence #'s, facility ids, and optional transmission numbers, e.g.\n1010\t01339008.0221700\n1020\t01339008.0221761\t068038/00 11/028`}
              className="w-full p-2 border border-gray-300 rounded-md mt-2"
            />
            <button onClick={processFacilityData} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">Process Data</button>
          </div>
        )}
        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Results</h2>
            <table className="min-w-full bg-white mt-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">File Name</th>
                  <th className="px-4 py-2 border">Page</th>
                  <th className="px-4 py-2 border">Sequence #</th>
                  <th className="px-4 py-2 border">Facility ID</th>
                </tr>
              </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className={result.sequence === 'not found' && result.facilityId === 'not found' ? 'bg-red-100' : ''}>
                  <td className="px-4 py-2 border">{result.fileName}</td>
                  <td className="px-4 py-2 border">{result.sequence === 'not found' && result.additionalInfo ? `${result.page} ${result.additionalInfo}` : result.page}</td>
                  <td className="px-4 py-2 border">
                    {result.sequence === 'not found' && result.facilityId !== 'not found' 
                      ? 'Please ensure you pasted your ENTIRE spreadsheet.' 
                      : result.sequence === 'not found' && result.facilityId === 'not found'
                      ? 'not found, ensure file validity'
                      : result.sequence}
                  </td>
                  <td className="px-4 py-2 border">
                    {result.facilityId === 'not found' && result.sequence !== 'not found' ? 'transmission' : result.facilityId}
                  </td>
                </tr>
                ))}
            </tbody>

            </table>
            {missingCtrs.length > 0 ? (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">CTRs not found:</h2>
                <ul>
                  {missingCtrs.map((ctr, index) => (
                    <li key={index} className="mt-2">
                      {ctr.sequence} {ctr.facilityId}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">All CTRs found.</h2>
              </div>
            )}
            <button className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md" onClick={renameAndZipFiles}>Download Renamed Files</button>
            <button className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded-md" onClick={() => setWorkOrderDialogVisible(true)}>Download Edited PDFs</button>
            {workOrderDialogVisible && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">Enter work order #</h2>
                <input
                  type="text"
                  value={workOrder}
                  onChange={handleWorkOrderChange}
                  placeholder="Enter work order #"
                  className="w-full p-2 border border-gray-300 rounded-md mt-2"
                />
                <button className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md" onClick={addBoxToPages}>Add Box and Download Edited PDFs</button>
              </div>
            )}
          </div>
        )}
      </main>
      <div
        className="absolute bottom-10 left-10 cursor-pointer z-50"
        onClick={() => setPopupVisible(true)}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/84/Question_Mark_Icon.png"
          alt="Help"
          className="w-16 h-16 opacity-50"
        />
      </div>
      {popupVisible && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg z-50"
        >
          <video width="320" height="240" controls>
            <source src="/ctrAuto.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={() => setPopupVisible(false)}
            className="block mt-4 mx-auto py-2 px-4 bg-red-500 text-white rounded-md"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default MainPage;
