# ScanSec Authentication & Features Setup

## 🔐 **Authentication System**

### Backend Authentication
- **JWT-based authentication** with secure token management
- **Password hashing** using bcrypt for security
- **Protected API endpoints** requiring authentication
- **User management** with registration, login, and profile updates

### Frontend Authentication
- **Login/Register pages** with form validation
- **JWT token storage** in localStorage
- **Protected routes** that redirect to login when not authenticated
- **User profile dropdown** with logout functionality

## 🚀 **New Features**

### 1. **Authentication**
- **Registration**: Create new accounts with email, username, and password
- **Login**: Secure authentication with JWT tokens
- **Profile Management**: Update username, email, and password
- **Logout**: Secure token removal and session cleanup

### 2. **Enhanced Vulnerability Table**
- **Real-time filtering** by severity, language, and file
- **Multi-column sorting** with visual indicators
- **Search functionality** across all vulnerability data
- **Bulk actions** for selected vulnerabilities

### 3. **Report Export**
- **JSON Export**: Download scan results as structured JSON
- **CSV Export**: Download scan results as CSV for spreadsheet analysis
- **Backend integration**: Export functionality connected to FastAPI endpoints

### 4. **Settings Management**
- **Profile settings**: Update user information
- **Password change**: Secure password updates with current password verification
- **API configuration**: View backend connection settings
- **Security information**: Display account security status

## 📋 **API Endpoints**

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user info |
| PUT | `/auth/me` | Update user profile |

### Protected Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scan-repo` | Scan repository (requires auth) |
| POST | `/export-report` | Export scan results (requires auth) |

## 🧪 **Testing Instructions**

### 1. **Start the Backend**
```bash
python start_backend.py
```

### 2. **Start the Frontend**
```bash
cd frontend
npm start
```

### 3. **Test Authentication**
1. **Register a new account**:
   - Go to http://localhost:3000
   - Click "Don't have an account? Sign up"
   - Fill in username, email, and password
   - Submit registration

2. **Login with the account**:
   - Enter email and password
   - Click "Sign in"
   - Should redirect to dashboard

3. **Test protected features**:
   - Try scanning a repository (should work when logged in)
   - Check user profile in header dropdown
   - Test logout functionality

### 4. **Test Export Features**
1. **Scan a repository** to get vulnerability data
2. **Click "Export JSON"** to download JSON report
3. **Click "Export CSV"** to download CSV report
4. **Verify downloads** contain scan results

### 5. **Test Settings**
1. **Navigate to Settings** page
2. **Update profile information** (username, email)
3. **Change password** (requires current password)
4. **Verify changes** are saved

## 🔧 **Configuration**

### Environment Variables
Create a `.env` file in the project root:

```env
# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENABLE_MOCK_DATA=false

# Backend Configuration (for production)
SECRET_KEY=your-secure-secret-key-here
DATABASE_URL=your-database-url-here
```

### JWT Configuration
The JWT secret key is currently set to a default value. For production:

1. **Generate a secure secret key**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Update the secret key** in `app/auth/jwt_handler.py`:
   ```python
   SECRET_KEY = "your-generated-secret-key"
   ```

## 🛡️ **Security Features**

### Password Security
- **bcrypt hashing** for password storage
- **Password validation** (minimum 6 characters)
- **Current password verification** for changes

### Token Security
- **JWT tokens** with 30-minute expiration
- **Secure token storage** in localStorage
- **Automatic token refresh** on API calls

### API Security
- **Protected endpoints** requiring authentication
- **CORS configuration** for frontend integration
- **Input validation** and sanitization

## 📊 **Data Flow**

### Authentication Flow
1. **User registers/logs in** → JWT token received
2. **Token stored** in localStorage
3. **API requests** include Authorization header
4. **Backend validates** token for protected endpoints
5. **Token expires** → User redirected to login

### Scan Flow
1. **Authenticated user** submits repository URL
2. **Backend validates** JWT token
3. **Repository scanned** for vulnerabilities
4. **Results returned** to frontend
5. **Data displayed** in vulnerability table

### Export Flow
1. **User clicks export** button
2. **Frontend prepares** scan data
3. **API request sent** to export endpoint
4. **Backend generates** report (JSON/CSV)
5. **File downloaded** to user's device

## 🐛 **Troubleshooting**

### Common Issues

1. **"Authentication required" error**:
   - Ensure user is logged in
   - Check JWT token in localStorage
   - Try logging out and back in

2. **Export fails**:
   - Verify backend is running
   - Check browser console for errors
   - Ensure scan data is available

3. **Settings not saving**:
   - Verify current password is correct
   - Check network connectivity
   - Review browser console for errors

4. **Login/Register fails**:
   - Check backend is running on port 8000
   - Verify email format is valid
   - Ensure password meets requirements

### Debug Commands

```bash
# Check backend health
curl http://localhost:8000/health

# Test authentication (replace with actual credentials)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint (replace TOKEN with actual token)
curl -X POST http://localhost:8000/scan-repo \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"repo_url":"https://github.com/octocat/Hello-World"}'
```

## 🚀 **Next Steps**

### Planned Features
- **Database integration** (replace in-memory storage)
- **Email verification** for new accounts
- **Password reset** functionality
- **Advanced filtering** and search
- **Scan history** and comparison
- **Team collaboration** features
- **API rate limiting** and quotas

### Production Deployment
- **HTTPS configuration** for security
- **Database setup** (PostgreSQL/MySQL)
- **Environment variables** for secrets
- **Logging and monitoring**
- **Backup and recovery** procedures 