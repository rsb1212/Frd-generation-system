import React, { useState, useRef } from 'react';
import './FRDForm.css';

const FRDForm = ({ onSubmit, onFileUpload, isLoading }) => {
  const [formData, setFormData] = useState({
    requirement: '',
    projectName: '',
    author: '',
    format: 'docx',
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const allowedExtensions = ['pdf', 'docx', 'txt', 'xlsx', 'xls'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    setUploadError(null);

    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        setUploadError(`Invalid file type: ${file.name}. Allowed: ${allowedExtensions.join(', ')}`);
        continue;
      }

      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File too large: ${file.name}. Max size: 10MB`);
        continue;
      }

      setIsUploading(true);
      try {
        await onFileUpload(file);
        setUploadedFiles((prev) => [...prev, { name: file.name, size: file.size }]);
      } catch (err) {
        setUploadError(`Failed to upload ${file.name}: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const event = { target: { files } };
      handleFileSelect(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.requirement.trim()) {
      setUploadError('Please enter a business requirement');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="frd-form-container">
      <form onSubmit={handleSubmit} className="frd-form">
        {/* Project Details */}
        <div className="form-section">
          <h3>📋 Project Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="author">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Enter author name"
              />
            </div>
          </div>
        </div>

        {/* Business Requirement */}
        <div className="form-section">
          <h3>📝 Business Requirement</h3>
          <div className="form-group">
            <label htmlFor="requirement">Describe your requirement *</label>
            <textarea
              id="requirement"
              name="requirement"
              value={formData.requirement}
              onChange={handleInputChange}
              placeholder="Enter your business requirement in detail. The more specific you are, the better the generated FRD will be."
              rows={8}
              required
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="form-section">
          <h3>📁 Upload Reference Files (Optional)</h3>
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <span className="drop-icon">📤</span>
              <p>Drag & drop files here, or click to select</p>
              <p className="drop-hint">Supported formats: PDF, DOCX, TXT, Excel (Max 10MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {isUploading && (
            <div className="upload-status">
              <span className="spinner">⏳</span> Uploading...
            </div>
          )}

          {uploadError && (
            <div className="error-message">
              ⚠️ {uploadError}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h4>Uploaded Files:</h4>
              <ul className="file-list">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="file-item">
                    <span className="file-info">
                      📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Output Format */}
        <div className="form-section">
          <h3>📄 Output Format</h3>
          <div className="format-options">
            <label className={`format-option ${formData.format === 'docx' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="format"
                value="docx"
                checked={formData.format === 'docx'}
                onChange={handleInputChange}
              />
              <span className="format-icon">📘</span>
              <span>Word (.docx)</span>
            </label>
            <label className={`format-option ${formData.format === 'pdf' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={formData.format === 'pdf'}
                onChange={handleInputChange}
              />
              <span className="format-icon">📕</span>
              <span>PDF (.pdf)</span>
            </label>
            <label className={`format-option ${formData.format === 'markdown' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="format"
                value="markdown"
                checked={formData.format === 'markdown'}
                onChange={handleInputChange}
              />
              <span className="format-icon">📗</span>
              <span>Markdown (.md)</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !formData.requirement.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner">⏳</span> Generating FRD...
              </>
            ) : (
              <>
                🚀 Generate FRD
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FRDForm;
