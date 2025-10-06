import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// In-memory data storage (replace with database in production)
let resumeData = [];

// Upload resume endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, email, jobdesc } = req.body;
    
    // Simulate ATS scoring (replace with actual AI/ML logic)
    const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
    const feedback = generateFeedback(score);
    
    const newEntry = {
      id: Date.now(),
      name,
      email,
      jobdesc,
      filename: req.file.filename,
      score,
      feedback,
      timestamp: new Date().toISOString()
    };
    
    resumeData.push(newEntry);
    
    res.status(200).json({
      message: 'Resume uploaded successfully',
      data: newEntry
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get all resume data
app.get('/api/data', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: resumeData.length,
      data: resumeData
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Get specific resume by ID
app.get('/api/data/:id', (req, res) => {
  try {
    const resume = resumeData.find(item => item.id === parseInt(req.params.id));
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// Delete resume by ID
app.delete('/api/data/:id', (req, res) => {
  try {
    const index = resumeData.findIndex(item => item.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    resumeData.splice(index, 1);
    res.status(200).json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Helper function to generate feedback based on score
function generateFeedback(score) {
  if (score >= 90) {
    return 'Excellent! Your resume is well-optimized for ATS systems.';
  } else if (score >= 75) {
    return 'Good job! Minor improvements could boost your score further.';
  } else if (score >= 60) {
    return 'Your resume needs some improvements. Consider adding more relevant keywords.';
  } else {
    return 'Significant improvements needed. Please review the job description carefully.';
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
