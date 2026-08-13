# FRD Generation System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required. Future versions will implement JWT-based authentication.

## Response Format
All responses are in JSON format.

---

## Endpoints

### 1. Health Check

**Endpoint**: `GET /health`

**Description**: Check if the API is running and healthy.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "FRD Generation System"
}
```

---

### 2. Analyze Requirement

**Endpoint**: `POST /requirements/analyze`

**Description**: Analyze and understand a business requirement using GPT.

**Request**:
```json
{
  "requirement": "We need a customer management system that allows sales teams to track leads, manage contacts, and monitor sales pipelines with real-time analytics and reporting capabilities."
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| requirement | string | Yes | Business requirement text (min 50 chars) |

**Response**:
```json
{
  "success": true,
  "analysis": {
    "main_objective": "...",
    "key_features": ["...", "..."],
    "success_criteria": ["..."],
    "potential_challenges": ["..."],
    "user_personas": ["..."]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response**:
```json
{
  "error": "Invalid requirement",
  "issues": [
    "Requirement is too brief. Please provide more details.",
    "Requirement lacks clear functional language."
  ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (validation failed)
- `500`: Server error

---

### 3. Retrieve Similar Documents

**Endpoint**: `POST /requirements/retrieve-similar`

**Description**: Retrieve similar documents from the database using semantic search.

**Request**:
```json
{
  "query": "customer management system",
  "n_results": 5
}
```

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Search query |
| n_results | integer | No | 5 | Number of results (1-10) |

**Response**:
```json
{
  "success": true,
  "similar_documents": [
    {
      "content": "Document content...",
      "metadata": {
        "doc_id": "20240115_103000",
        "chunk": 0,
        "type": "frd"
      },
      "distance": 0.15
    }
  ],
  "count": 1
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request
- `500`: Server error

---

### 4. Generate FRD

**Endpoint**: `POST /frd/generate`

**Description**: Generate a complete Functional Requirements Document.

**Request**:
```json
{
  "requirement": "Detailed business requirement...",
  "user_info": {
    "project_name": "Customer Management System",
    "author": "john.doe@company.com"
  },
  "format": "both",
  "include_templates": false
}
```

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| requirement | string | Yes | - | Business requirement |
| user_info | object | No | {} | User information |
| user_info.project_name | string | No | "" | Project name |
| user_info.author | string | No | "" | Author name/email |
| format | string | No | "both" | Output format: docx, pdf, or both |
| include_templates | boolean | No | false | Include template context |

**Response**:
```json
{
  "success": true,
  "requirement": "...",
  "sections": {
    "Project Overview": "...",
    "Scope": "...",
    "Functional Requirements": "...",
    "Non-Functional Requirements": "...",
    "User Roles": "...",
    "Use Cases": "...",
    "Workflow": "...",
    "Acceptance Criteria": "...",
    "Traceability Matrix": "..."
  },
  "files": {
    "docx": "FRD_20240115_103000.docx",
    "pdf": "FRD_20240115_103000.pdf"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request
- `500`: Server error

---

### 5. Upload File

**Endpoint**: `POST /files/upload`

**Description**: Upload a reference document (PDF, DOCX, or TXT).

**Request**:
```
Content-Type: multipart/form-data

file: <binary file data>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | file | Yes | File to upload (max 10MB) |

**Allowed File Types**: pdf, docx, txt

**Response**:
```json
{
  "success": true,
  "filename": "20240115_103000_document.pdf",
  "size": 524288,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response**:
```json
{
  "error": "File size exceeds maximum allowed"
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request
- `413`: Payload too large
- `500`: Server error

---

### 6. Download File

**Endpoint**: `GET /files/download/<filename>`

**Description**: Download a generated or uploaded file.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filename | string | Yes | Name of file to download |

**Response**: Binary file data with appropriate content type.

**Status Codes**:
- `200`: Success
- `404`: File not found
- `500`: Server error

---

### 7. List Generated Files

**Endpoint**: `GET /files/list`

**Description**: List all generated and uploaded files.

**Response**:
```json
{
  "success": true,
  "files": [
    {
      "filename": "FRD_20240115_103000.docx",
      "size": 524288,
      "created": "2024-01-15T10:30:00.000Z"
    },
    {
      "filename": "FRD_20240115_103000.pdf",
      "size": 1048576,
      "created": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `500`: Server error

---

### 8. List Templates

**Endpoint**: `GET /templates/list`

**Description**: List available FRD templates.

**Response**:
```json
{
  "success": true,
  "templates": [
    {
      "name": "Enterprise",
      "description": "Large scale enterprise systems",
      "sections": 9
    },
    {
      "name": "SaaS",
      "description": "Software as a Service applications",
      "sections": 6
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `500`: Server error

---

### 9. Get Template Details

**Endpoint**: `GET /templates/get/<template_name>`

**Description**: Get detailed information about a specific template.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| template_name | string | Yes | Name of template |

**Response**:
```json
{
  "success": true,
  "template": {
    "name": "Enterprise",
    "description": "Comprehensive template...",
    "sections": [
      "Project Overview",
      "Scope",
      "Functional Requirements",
      "Non-Functional Requirements",
      "User Roles",
      "Use Cases",
      "Workflow",
      "Acceptance Criteria",
      "Traceability Matrix"
    ]
  }
}
```

**Status Codes**:
- `200`: Success
- `404`: Template not found
- `500`: Server error

---

## Error Handling

### Common Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

### Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 413 | Payload Too Large - File too large |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Server maintenance |

---

## Rate Limiting

Currently no rate limiting is enforced. Future versions will implement:
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Pagination

Not applicable for current version. Will be implemented for large datasets.

---

## File Size Limits

| File Type | Max Size |
|-----------|----------|
| DOCX | 10 MB |
| PDF | 10 MB |
| TXT | 10 MB |
| Generated DOCX | Unlimited |
| Generated PDF | Unlimited |

---

## Validation Rules

### Requirement Text
- Minimum: 50 characters
- Maximum: 100,000 characters
- Must contain keywords: should, must, shall, will, can, feature, requirement

### Project Name
- Maximum: 100 characters
- Allowed: Alphanumeric, spaces, hyphens

### Author
- Maximum: 100 characters
- Allowed: Alphanumeric, spaces, special characters (@, -, ., _)

---

## Examples

### cURL Example: Generate FRD
```bash
curl -X POST http://localhost:5000/api/frd/generate \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "Build a customer management system with lead tracking, contact management, and sales pipeline analytics. Must support real-time reporting, user authentication, and integrations with email and calendar services.",
    "user_info": {
      "project_name": "CRM System",
      "author": "john.doe@company.com"
    },
    "format": "both"
  }'
```

### Python Example: Upload File
```python
import requests

files = {'file': open('reference_document.pdf', 'rb')}
response = requests.post(
    'http://localhost:5000/api/files/upload',
    files=files
)
print(response.json())
```

### JavaScript Example: Generate FRD
```javascript
const response = await fetch('http://localhost:5000/api/frd/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    requirement: 'Your requirement here...',
    user_info: {
      project_name: 'Project Name',
      author: 'Author Name'
    },
    format: 'both'
  })
});

const data = await response.json();
console.log(data);
```

---

## Webhooks

Not yet implemented. Planned for future versions.

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core FRD generation functionality
- File upload and download
- Template system
- RAG-based document retrieval

---

## Support

For API issues or questions:
1. Check this documentation
2. Review error messages
3. Check logs in backend
4. Create an issue in repository

---

**Last Updated**: 2024
**API Version**: 1.0.0
