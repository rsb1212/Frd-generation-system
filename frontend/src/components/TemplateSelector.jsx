import React, { useState, useEffect } from 'react';
import './TemplateSelector.css';

function TemplateSelector({ onSelectTemplate, selectedTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/templates/list');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (templateName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/templates/get/${templateName}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTemplateDetails(data.template);
        onSelectTemplate(data.template);
      }
    } catch (error) {
      console.error('Error fetching template details:', error);
    }
  };

  const defaultTemplates = [
    {
      name: 'Enterprise',
      icon: '🏢',
      description: 'Comprehensive template for large-scale enterprise systems',
      sections: 9,
      use_case: 'Best for: Complex corporate applications'
    },
    {
      name: 'SaaS',
      icon: '☁️',
      description: 'Streamlined template for Software as a Service applications',
      sections: 6,
      use_case: 'Best for: Cloud-based applications'
    },
    {
      name: 'Mobile',
      icon: '📱',
      description: 'Optimized template for mobile application development',
      sections: 7,
      use_case: 'Best for: iOS, Android, and cross-platform apps'
    },
    {
      name: 'Web',
      icon: '🌐',
      description: 'Specialized template for web application projects',
      sections: 8,
      use_case: 'Best for: Web applications and services'
    },
    {
      name: 'API',
      icon: '🔌',
      description: 'Dedicated template for API and backend services',
      sections: 7,
      use_case: 'Best for: REST APIs, microservices'
    },
    {
      name: 'Integration',
      icon: '🔄',
      description: 'Template for system integration and ETL projects',
      sections: 8,
      use_case: 'Best for: Data integration, system connectors'
    },
  ];

  const displayTemplates = templates.length > 0 ? templates : defaultTemplates;

  return (
    <div className="template-selector-container">
      {loading ? (
        <div className="loading">
          <div className="spinner-small"></div>
          <p>Loading templates...</p>
        </div>
      ) : (
        <>
          <div className="template-intro">
            <h3>Choose a Template</h3>
            <p>Select a template that best matches your project type. Templates provide pre-structured sections and guidance.</p>
          </div>

          <div className="templates-grid">
            {displayTemplates.map((template) => (
              <div
                key={template.name}
                className={`template-card ${selectedTemplateDetails?.name === template.name ? 'selected' : ''}`}
                onClick={() => handleSelectTemplate(template.name)}
              >
                <div className="template-header">
                  <div className="template-icon">{template.icon}</div>
                  <h4>{template.name}</h4>
                </div>

                <p className="template-description">{template.description}</p>

                <div className="template-meta">
                  <span className="sections-count">
                    📋 {template.sections} sections
                  </span>
                </div>

                <p className="template-use-case">{template.use_case}</p>

                <div className="template-footer">
                  <button className="btn-select">
                    {selectedTemplateDetails?.name === template.name ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedTemplateDetails && (
            <div className="template-details">
              <h3>📋 Template Details: {selectedTemplateDetails.name}</h3>
              
              <div className="sections-list">
                <h4>Included Sections:</h4>
                <ul>
                  {selectedTemplateDetails.sections?.map((section, index) => (
                    <li key={index}>
                      <span className="section-icon">✓</span>
                      {section}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="template-description-full">
                <h4>Description:</h4>
                <p>{selectedTemplateDetails.description}</p>
              </div>

              <button className="btn btn-primary" onClick={() => {
                // This would trigger FRD generation with the template
                console.log('Generate with template:', selectedTemplateDetails);
              }}>
                ✨ Generate FRD with {selectedTemplateDetails.name} Template
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TemplateSelector;
