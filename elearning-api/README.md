# Jordan eLearning API Platform

A comprehensive multi-tenant eLearning API platform designed specifically for Jordanian universities. This platform allows any university in Jordan to plug in and provide their students with access to course content, assignments, exams, discussions, grades, and more.

## 🌟 Features

### 🏛️ Multi-Tenant Architecture
- **University Isolation**: Each university has completely isolated data
- **Domain-based Tenancy**: Universities access via their own subdomain or domain
- **Scalable Design**: Single API serves multiple universities efficiently

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication
- **OAuth2 Integration**: Support for Google and Microsoft SSO
- **Role-based Access Control**: Super Admin, University Admin, Dean, Professor, Teaching Assistant, Student
- **Multi-language Support**: Arabic and English interface

### 🎓 Academic Management
- **University → Faculty → Department → Course Hierarchy**: Flexible academic structure
- **Course Management**: Complete course lifecycle management
- **Enrollment System**: Student course registration and management
- **Academic Calendar**: Semester and academic year management

### 📚 Content Management
- **Lectures & Notes**: Upload and manage course materials
- **Assignments**: Create, submit, and grade assignments
- **Exams & Quizzes**: Comprehensive examination system with proctoring support
- **File Uploads**: Support for various file types with AWS S3 integration
- **Discussion Forums**: Course-based discussion boards

### 📊 Grading & Analytics
- **Comprehensive Grading**: Multiple grading types and scales
- **Grade Analytics**: Performance tracking and reporting
- **Attendance Management**: Track student attendance
- **Engagement Metrics**: Monitor student engagement and participation

### 🔔 Communication
- **Real-time Notifications**: Socket.IO-based real-time updates
- **Email Integration**: Automated email notifications
- **Announcements**: University and course-level announcements
- **Discussion Forums**: Interactive course discussions

### 🌐 Internationalization
- **Arabic & English Support**: Full RTL and LTR language support
- **Localized Content**: All text content available in both languages
- **Cultural Adaptation**: Designed for Jordanian academic culture

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js** - Web framework
- **PostgreSQL** - Primary database with Sequelize ORM
- **Redis** - Caching and session management
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **Passport.js** - OAuth2 strategies

### Security & Performance
- **Helmet.js** - Security headers
- **Rate Limiting** - API abuse protection
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression
- **Winston** - Logging system

### File Management
- **AWS S3** - File storage
- **Multer** - File upload handling
- **Sharp** - Image processing

### Documentation & Testing
- **Swagger/OpenAPI** - API documentation
- **Jest** - Testing framework
- **Supertest** - API testing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- AWS S3 bucket (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd elearning-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=jordan_elearning
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   
   # Email (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb jordan_elearning
   
   # Run migrations
   npm run migrate
   
   # Seed initial data (optional)
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000/api/v1`
   - API Documentation: `http://localhost:3000/api-docs`
   - Health Check: `http://localhost:3000/health`

## 📖 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register    - Register new user
POST /api/v1/auth/login       - User login
POST /api/v1/auth/refresh     - Refresh access token
GET  /api/v1/auth/me          - Get current user profile
POST /api/v1/auth/logout      - User logout
```

### University Management
```
GET    /api/v1/universities        - List all universities (public)
POST   /api/v1/universities        - Create university (Super Admin)
GET    /api/v1/universities/:id    - Get university details
PUT    /api/v1/universities/:id    - Update university
GET    /api/v1/universities/:id/stats - Get university statistics
```

### Course Management
```
GET    /api/v1/courses             - List courses
POST   /api/v1/courses             - Create course
GET    /api/v1/courses/:id         - Get course details
PUT    /api/v1/courses/:id         - Update course
DELETE /api/v1/courses/:id         - Delete course
POST   /api/v1/courses/:id/enroll  - Enroll student
```

### Additional Endpoints
- **Users**: `/api/v1/users/*`
- **Assignments**: `/api/v1/assignments/*`
- **Exams**: `/api/v1/exams/*`
- **Discussions**: `/api/v1/discussions/*`
- **Grades**: `/api/v1/grades/*`
- **Notifications**: `/api/v1/notifications/*`
- **Analytics**: `/api/v1/analytics/*`
- **File Uploads**: `/api/v1/uploads/*`

## 🏗️ Architecture

### Multi-Tenant Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   University A  │    │   University B  │    │   University C  │
│   (ju.edu.jo)   │    │   (uj.edu.jo)   │    │  (just.edu.jo)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Jordan eLearning │
                    │    API Platform   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │    PostgreSQL   │
                    │    Database     │
                    └─────────────────┘
```

### Database Schema
```
Universities
├── Faculties
│   └── Departments
│       └── Courses
│           ├── Enrollments
│           ├── Lectures
│           ├── Assignments
│           ├── Exams
│           └── Discussions
└── Users (Students, Professors, Admins)
    ├── Grades
    ├── Notifications
    └── Submissions
```

## 🔧 Configuration

### University Setup
Each university needs to be configured with:
- **Domain**: Unique domain/subdomain (e.g., ju.edu.jo)
- **University Code**: Short code (e.g., JU, UJ, JUST)
- **Branding**: Logo, colors, custom settings
- **Subscription Plan**: Basic, Premium, or Enterprise

### Role Permissions
- **Super Admin**: System-wide access, university management
- **University Admin**: University-wide access, user management
- **Dean**: Faculty-level access, course oversight
- **Professor**: Course management, grading, content creation
- **Teaching Assistant**: Limited course access, grading assistance
- **Student**: Course enrollment, content access, submission

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Protection** with domain validation
- **Input Validation** using express-validator
- **SQL Injection Protection** via Sequelize ORM
- **XSS Protection** through helmet.js
- **File Upload Security** with type and size validation

## 🌍 Internationalization

The platform supports both Arabic and English:
- **RTL/LTR Support**: Proper text direction handling
- **Localized Messages**: All API responses include both languages
- **Cultural Adaptation**: Academic terms and concepts localized for Jordan
- **Date/Time Formatting**: Appropriate for Middle Eastern context

## 📊 Monitoring & Analytics

- **Winston Logging**: Comprehensive application logging
- **Performance Metrics**: API response times and usage statistics
- **Error Tracking**: Detailed error reporting and monitoring
- **User Analytics**: Student engagement and performance tracking
- **System Health**: Database and service health monitoring

## 🚀 Deployment

### Production Deployment
1. **Environment Setup**
   - Configure production environment variables
   - Set up SSL certificates
   - Configure domain DNS

2. **Database Migration**
   ```bash
   NODE_ENV=production npm run migrate
   ```

3. **Process Management**
   ```bash
   # Using PM2
   pm2 start src/app.js --name "elearning-api"
   pm2 startup
   pm2 save
   ```

4. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 443 ssl;
       server_name api.jordan-elearning.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@jordan-elearning.com
- **Documentation**: Visit `/api-docs` for detailed API documentation
- **Issues**: Create an issue on GitHub

## 📋 Roadmap

### Phase 1 (Current)
- [x] Multi-tenant architecture
- [x] Authentication & authorization
- [x] Basic course management
- [x] Assignment system
- [x] Grade management

### Phase 2 (Next)
- [ ] Advanced exam proctoring
- [ ] Video conferencing integration
- [ ] Mobile app API
- [ ] Advanced analytics dashboard
- [ ] Plagiarism detection

### Phase 3 (Future)
- [ ] AI-powered recommendations
- [ ] Blockchain certificates
- [ ] Advanced reporting
- [ ] Integration with Jordan MOE systems

---

**Built with ❤️ for Jordanian Universities**
