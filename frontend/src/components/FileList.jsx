import React, { useState } from 'react';
import './FileList.css';

function FileList({ files, onDownload, onRefresh }) {
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.docx')) return '📝';
    if (filename.endsWith('.pdf')) return '📕';
    return '📄';
  };

  const getFileType = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  const filteredFiles = files.filter(file => {
    if (filterType === 'all') return true;
    if (filterType === 'docx') return file.filename.endsWith('.docx');
    if (filterType === 'pdf') return file.filename.endsWith('.pdf');
    return true;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created) - new Date(a.created);
    } else if (sortBy === 'name') {
      return a.filename.localeCompare(b.filename);
    } else if (sortBy === 'size') {
      return b.size - a.size;
    }
    return 0;
  });

  return (
    <div className="file-list-container">
      {files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Files Generated Yet</h3>
          <p>Generate your first FRD to see files here</p>
          <button className="btn btn-primary" onClick={onRefresh}>
            🔄 Refresh
          </button>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="file-controls">
            <div className="control-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select">
                <option value="date">Latest First</option>
                <option value="name">File Name</option>
                <option value="size">File Size</option>
              </select>
            </div>

            <div className="control-group">
              <label>Filter:</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="select">
                <option value="all">All Files</option>
                <option value="docx">DOCX Only</option>
                <option value="pdf">PDF Only</option>
              </select>
            </div>

            <button className="btn btn-secondary" onClick={onRefresh}>
              🔄 Refresh
            </button>
          </div>

          {/* File Table */}
          <div className="file-table-container">
            <table className="file-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedFiles.map((file, index) => (
                  <tr key={index} className="file-row">
                    <td className="file-name">
                      <span className="file-icon">{getFileIcon(file.filename)}</span>
                      <span className="file-label">{file.filename}</span>
                    </td>
                    <td className="file-type">
                      <span className="type-badge">{getFileType(file.filename)}</span>
                    </td>
                    <td className="file-size">{formatFileSize(file.size)}</td>
                    <td className="file-date">{formatDate(file.created)}</td>
                    <td className="file-actions">
                      <button
                        className="btn-action download"
                        onClick={() => onDownload(file.filename)}
                        title="Download file"
                      >
                        ⬇️ Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="file-summary">
            <span>{sortedFiles.length} file(s)</span>
            <span>•</span>
            <span>{formatFileSize(sortedFiles.reduce((sum, f) => sum + f.size, 0))} total</span>
          </div>
        </>
      )}
    </div>
  );
}

export default FileList;
