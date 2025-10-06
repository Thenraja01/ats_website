# ATS Resume Analyzer - Setup Guide

## Project Structure
```
ats frontend/
├── ats/              # Frontend React Application
│   ├── src/
│   │   ├── assets/
│   │   │   ├── Nav.jsx       # Navigation component
│   │   │   ├── Uploader.jsx  # Resume upload component
│   │   │   ├── Result.jsx    # Results display component
│   │   │   ├── mark.jsx      # Score visualization component
│   │   │   └── Suggest.jsx   # Tips and suggestions component
│   │   ├── components/
│   │   ├── Layout/
│   │   └── lib/
│   └── package.json
└── server/           # Backend Express Server
    ├── server.js
    └── package.json
```

## Setup Instructions

### 1. Server Setup (Backend)

```bash
# Navigate to server directory
cd "D:\ats frontend\server"

# Install dependencies
npm install

# Create uploads folder for resume files
mkdir uploads

# Start the server
npm start

# OR use nodemon for development (auto-restart on changes)
npm run dev
```

**Server will run on:** `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd "D:\ats frontend\ats"

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173` (or the port Vite assigns)

## Features Implemented

### Frontend Components (with Axios Integration)

1. **Nav.jsx**
   - Navigation bar with smooth scrolling
   - Responsive design

2. **Uploader.jsx**
   - File upload with validation
   - Form submission using Axios POST
   - Real-time file preview
   - Error handling
   - Loading states

3. **Result.jsx**
   - Fetches data from server using Axios GET
   - Displays all resume submissions
   - Delete functionality using Axios DELETE
   - Color-coded scores
   - Refresh capability

4. **mark.jsx**
   - Visual score display with circular progress
   - Score breakdown (Keywords, Format, Content)
   - Grade calculation (A+, A, B+, etc.)
   - Color-coded feedback

5. **Suggest.jsx**
   - 8 expert tips for resume improvement
   - Professional UI with icons
   - Optional personalized suggestions from server

### Backend API Endpoints

1. **POST /api/upload**
   - Upload resume file (PDF, DOC, DOCX, TXT)
   - Accepts: name, email, jobdesc, file
   - Returns: ATS score and feedback

2. **GET /api/data**
   - Fetch all resume submissions
   - Returns: array of all uploaded resumes with scores

3. **GET /api/data/:id**
   - Fetch specific resume by ID
   - Returns: single resume data

4. **DELETE /api/data/:id**
   - Delete specific resume entry
   - Returns: success message

5. **GET /health**
   - Health check endpoint
   - Returns: server status

## API Request Examples

### Upload Resume
```javascript
const formData = new FormData();
formData.append("file", file);
formData.append("name", "John Doe");
formData.append("email", "john@example.com");
formData.append("jobdesc", "Software Engineer position...");

axios.post("http://localhost:8000/api/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

### Get All Data
```javascript
axios.get("http://localhost:8000/api/data");
```

### Delete Entry
```javascript
axios.delete(`http://localhost:8000/api/data/${id}`);
```

## Technologies Used

### Frontend
- React 19
- Axios (HTTP client)
- Tailwind CSS 4
- Vite (build tool)
- Shadcn/ui components

### Backend
- Node.js
- Express.js
- Multer (file upload)
- CORS

## Development Workflow

1. **Start Backend Server:**
   ```bash
   cd server
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd ats
   npm run dev
   ```

3. **Test the Application:**
   - Open browser to `http://localhost:5173`
   - Upload a resume file
   - Check results and scores
   - View suggestions

## Important Notes

- Server stores data in memory (resets on restart)
- For production, implement a database (MongoDB, PostgreSQL, etc.)
- Upload files are stored in `server/uploads/` directory
- CORS is enabled for all origins (configure for production)
- ATS scoring is currently simulated (integrate actual AI/ML for production)

## Future Enhancements

1. **Database Integration**
   - Use MongoDB or PostgreSQL for persistent storage
   - Store file references instead of files

2. **AI/ML Integration**
   - Implement actual resume parsing
   - Use NLP for keyword extraction
   - Compare with job description using AI

3. **Authentication**
   - User accounts and login
   - Personal dashboard

4. **Advanced Features**
   - Resume templates
   - Cover letter analyzer
   - Interview preparation tips
   - Job matching suggestions

## Troubleshooting

### Server won't start
- Check if port 8000 is available
- Install dependencies: `npm install`
- Check Node.js version (should be 14+)

### Frontend can't connect to server
- Ensure server is running on port 8000
- Check CORS configuration
- Verify API URLs in components

### File upload fails
- Check `uploads/` folder exists
- Verify file type (PDF, DOC, DOCX, TXT only)
- Check file size limits

## License
ISC

## Author
ATS Resume Analyzer Team
