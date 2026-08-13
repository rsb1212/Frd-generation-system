import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import FRDForm from './components/FRDForm';
import FileList from './components/FileList';
import TemplateSelector from './components/TemplateSelector';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleGenerateFRD = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/frd/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirement: formData.requirement,
          user_info: {
            project_name: formData.projectName,
            author: formData.author,
          },
          format: formData.format,
          include_templates: selectedTemplate !== null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate FRD');
      }

      const data = await response.json();
      addNotification('FRD generated successfully!', 'success');
      
      // Refresh file list
      await fetchFiles();
      
      // Store generation details
      setGeneratedFiles(prev => [...prev, {
        ...data,
        id: Date.now(),
      }]);

    } catch (error) {
      addNotification(error.message, 'error');
      console.error('Error generating FRD:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      addNotification('File uploaded successfully!', 'success');
      await fetchFiles();

    } catch (error) {
      addNotification(error.message, 'error');
      console.error('Error uploading file:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/list`);
      if (response.ok) {
        const data = await response.json();
        setGeneratedFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDownload = (filename) => {
    const url = `${API_BASE_URL}/files/download/${filename}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  React.useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="App">
      <Header />
      
      <div className="notification-container">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            {notif.message}
          </div>
        ))}
      </div>

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            📄 Generate FRD
          </button>
          <button 
            className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            📋 Templates
          </button>
          <button 
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            📁 Files ({generatedFiles.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'generate' && (
            <div className="tab-pane">
              <h2>Generate Functional Requirements Document</h2>
              <FRDForm 
                onSubmit={handleGenerateFRD}
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
              />
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="tab-pane">
              <h2>Available Templates</h2>
              <TemplateSelector 
                onSelectTemplate={setSelectedTemplate}
                selectedTemplate={selectedTemplate}
              />
            </div>
          )}

          {activeTab === 'files' && (
            <div className="tab-pane">
              <h2>Generated Files</h2>
              <FileList 
                files={generatedFiles}
                onDownload={handleDownload}
                onRefresh={fetchFiles}
              />
            </div>
          )}
        </div>
      </div>

      <footer className="app-footer">
        <p>FRD Generation System © 2024 | All rights reserved</p>
        <p>Version 1.0.0 | API Status: Connected</p>
      </footer>
    </div>
  );
}

export default App;
