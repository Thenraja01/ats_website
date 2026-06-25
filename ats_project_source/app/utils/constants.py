"""Application constants."""

# HTTP Status codes
HTTP_200_OK = 200
HTTP_201_CREATED = 201
HTTP_400_BAD_REQUEST = 400
HTTP_401_UNAUTHORIZED = 401
HTTP_403_FORBIDDEN = 403
HTTP_404_NOT_FOUND = 404
HTTP_500_INTERNAL_SERVER_ERROR = 500

# File upload
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".doc"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# Score thresholds
SCORE_EXCELLENT = 90
SCORE_GOOD = 75
SCORE_AVERAGE = 60
SCORE_POOR = 0

# Keywords
SKILL_KEYWORDS = {
    "programming": ["python", "javascript", "java", "c++", "c#", "golang", "rust", "typescript"],
    "databases": ["mongodb", "postgresql", "mysql", "redis", "elasticsearch", "firebase"],
    "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "devops"],
    "web": ["react", "vue", "angular", "django", "fastapi", "node.js", "express"],
}

# Scoring weights
SCORE_WEIGHTS = {
    "skills": 0.25,
    "experience": 0.25,
    "internships": 0.15,
    "certificates": 0.15,
    "projects": 0.15,
    "education": 0.05,
}
