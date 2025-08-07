import React, { useState, useCallback } from "react";
import { useGeminiMutation } from "../../features/api/promptAIApi";
import "../../styles/PromptAI/PromptPage.scss";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
  Paper,
  Chip,
} from "@mui/material";
import { info } from "../../schemas/info";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from 'react-markdown';
import { CloudUpload, Send, Clear } from "@mui/icons-material";
import * as XLSX from 'xlsx'; // You'll need to install: npm install xlsx

const PromptPage = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedFileData, setProcessedFileData] = useState([]);
  const [error, setError] = useState("");

  const [promptAI, { isLoading }] = useGeminiMutation();

  // Process files to extract data
  const processFiles = async (files) => {
    const processedData = [];
    
    for (const file of files) {
      try {
        if (file.name.endsWith('.csv')) {
          // Process CSV
          const text = await file.text();
          processedData.push({
            fileName: file.name,
            fileType: 'csv',
            data: text,
            preview: text.split('\n').slice(0, 5).join('\n') // First 5 rows for preview
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Process Excel
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          
          const allSheets = {};
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            allSheets[sheetName] = jsonData;
          });
          
          processedData.push({
            fileName: file.name,
            fileType: 'excel',
            data: allSheets,
            preview: generateExcelPreview(allSheets)
          });
        }
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
        setError(`Error processing file ${file.name}: ${err.message}`);
      }
    }
    
    return processedData;
  };

  const generateExcelPreview = (sheets) => {
    let preview = '';
    Object.keys(sheets).forEach(sheetName => {
      preview += `Sheet: ${sheetName}\n`;
      const rows = sheets[sheetName].slice(0, 5); // First 5 rows
      rows.forEach(row => {
        preview += row.join('\t') + '\n';
      });
      preview += '\n';
    });
    return preview;
  };

  // Handle file drops
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    setError("");
    
    // Process the files immediately
    const processed = await processFiles(acceptedFiles);
    setProcessedFileData((prev) => [...prev, ...processed]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: true,
    onDropRejected: (fileRejections) => {
      setError("Please upload only CSV or Excel files (.csv, .xls, .xlsx)");
    },
  });

  // Remove uploaded file
  const removeFile = (fileToRemove) => {
    setUploadedFiles((prev) => prev.filter((file) => file !== fileToRemove));
    setProcessedFileData((prev) => prev.filter((data) => data.fileName !== fileToRemove.name));
  };

  // Handle AI prompt submission
  const handleAsk = async () => {
    if (!question.trim()) {
      setError("Please enter a question before submitting.");
      return;
    }

    setError("");

    try {
      let fullPrompt = question;

      if (processedFileData.length > 0) {
        fullPrompt += '\n\nFiles uploaded for analysis:\n';
        
        processedFileData.forEach((fileData) => {
          fullPrompt += `\n--- File: ${fileData.fileName} (${fileData.fileType}) ---\n`;
          
          if (fileData.fileType === 'csv') {
            // For CSV, include the actual data (you might want to limit this if files are very large)
            fullPrompt += fileData.data;
          } else if (fileData.fileType === 'excel') {
            // For Excel, include structured data
            Object.keys(fileData.data).forEach(sheetName => {
              fullPrompt += `\nSheet: ${sheetName}\n`;
              const sheet = fileData.data[sheetName];
              
              // Convert to CSV-like format for better AI understanding
              sheet.forEach((row, index) => {
                if (index < 100) { // Limit rows to prevent prompt from being too long
                  fullPrompt += row.join(',') + '\n';
                }
              });
              
              if (sheet.length > 100) {
                fullPrompt += `... (${sheet.length - 100} more rows)\n`;
              }
            });
          }
        });
      }

      const response = await promptAI({
        prompt: fullPrompt,
      }).unwrap();

      console.log("Response from Gemini:", response);
      setAnswer(
        response.value?.answer || response.answer || "No response received"
      );
    } catch (error) {
      console.error("Error asking Gemini:", error);
      setError(
        error.data?.message ||
          error.message ||
          "An error occurred while processing your request."
      );
    }
  };

  // Clear all data
  const handleClear = () => {
    setQuestion("");
    setAnswer("");
    setUploadedFiles([]);
    setProcessedFileData([]);
    setError("");
  };

  // Handle Enter key press in text field
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAsk();
    }
  };

  return (
    <Box className="ai">
      <Box className="ai__header">
        <Typography variant="h4" className="ai__header--title" gutterBottom>
          {info.ai.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Ask questions and upload files for AI analysis
        </Typography>
      </Box>

      <Box
        className="ai__body"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* AI Response Display */}
        {answer && (
          <Paper
            className="ai__response"
            elevation={2}
            sx={{
              flexShrink: 0,
              maxHeight: "40vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box className="ai__response__header">
              <Typography variant="h6" className="ai__response--title">
                AI Response:
              </Typography>
            </Box>
            <Box
              className="ai__response__content"
              sx={{
                overflow: "auto",
                flex: 1,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1c1c1",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "#a8a8a8",
                  },
                },
              }}
            >
              <Typography
                variant="body1"
                className="ai__response--text"
                sx={{ whiteSpace: "pre-wrap" }}
              >
                <ReactMarkdown>{answer}</ReactMarkdown>
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Error Display */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ flexShrink: 0 }}
          >
            {error}
          </Alert>
        )}

        {/* File Preview */}
        {processedFileData.length > 0 && (
          <Paper elevation={1} sx={{ p: 2, maxHeight: "200px", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              File Preview:
            </Typography>
            {processedFileData.map((fileData, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  {fileData.fileName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    whiteSpace: "pre-wrap",
                    backgroundColor: "grey.100",
                    p: 1,
                    borderRadius: 1,
                    maxHeight: "100px",
                    overflow: "auto",
                  }}
                >
                  {fileData.preview}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}

        {/* Combined Question Input & File Upload */}
        <Paper elevation={1} sx={{ p: 3, flexShrink: 0 }}>
          <Typography variant="h6" gutterBottom>
            Ask Your Question
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Enter your question"
            placeholder="What would you like to know? Upload files to include them in your analysis..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{ mb: 3 }}
          />

          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ color: "text.secondary" }}
          >
            Upload Files to Include in Analysis
          </Typography>

          <Box
            {...getRootProps()}
            className="customimport__dialog__import__content__dropzone"
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "grey.300",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: isDragActive ? "primary.50" : "transparent",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "grey.50",
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 40, color: "grey.400", mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              {isDragActive ? "Drop files here" : "Drop CSV/XLSX files here"}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to browse
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              disabled={isLoading}
              startIcon={<CloudUpload />}
              sx={{ mt: 1 }}
            >
              Browse Files
            </Button>
          </Box>

          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Files to analyze with your question:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {uploadedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeFile(file)}
                    color="success"
                    variant="filled"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={isLoading}
            startIcon={<Clear />}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            onClick={handleAsk}
            disabled={isLoading || !question.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
          >
            {isLoading
              ? "Analyzing..."
              : uploadedFiles.length > 0
              ? "Analyze with Files"
              : "Ask AI"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PromptPage;