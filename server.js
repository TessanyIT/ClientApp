const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware to serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));  // Serve everything from the root folder
app.use(express.json());  // Parse JSON data

// Endpoint to handle file upload and updates
app.post('/upload', upload.single('excelFile'), (req, res) => {
  const filePath = req.file.path;
  
  // Read the uploaded Excel file
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Update the Excel data (just for demonstration, you can modify based on your frontend input)
  json[1][1] = 'Updated Value';  // Example: Update the second cell

  // Convert updated data back to sheet
  const updatedSheet = XLSX.utils.aoa_to_sheet(json);
  const updatedWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(updatedWorkbook, updatedSheet, "Sheet1");

  // Write the updated Excel file back to disk
  const updatedFilePath = path.join(__dirname, 'updated_data.xlsx');
  XLSX.writeFile(updatedWorkbook, updatedFilePath);

  // Send the updated file back to the client
  res.download(updatedFilePath, 'updated_data.xlsx', () => {
    fs.unlinkSync(filePath);  // Clean up the uploaded file
    fs.unlinkSync(updatedFilePath);  // Clean up the updated file
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});



