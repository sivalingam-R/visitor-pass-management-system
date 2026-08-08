# Visitor Pass Management System (VPMS)

## API Documentation

This document provides a brief overview of the REST APIs used by the Visitor Pass Management System.

---

## 1. API Base URL

### Production

https://vpms-backend-v59a.onrender.com/api

### Local Development

http://localhost:5000/api

---

## 2. Authentication

The application uses JWT (JSON Web Token) based authentication.

For protected APIs, send the JWT token in the request header:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 3. Authentication APIs

## 3.1 Login

Authenticates a user and returns a JWT token.

### Endpoint

```http
POST /api/auth/login
```

### Access

Public

### Request Body

```json
{
  "email": "admin@vpm.com",
  "password": "admin123"
}
```

### Supported Roles

- Administrator
- Receptionist
- Employee

---

## 3.2 Register User

Creates a new user account.

### Endpoint

```http
POST /api/auth/register
```

### Access

Administrator only

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Employee"
}
```

### Supported Roles

- Administrator
- Receptionist
- Employee

---

## 3.3 Get Current User

Returns the currently authenticated user's information.

### Endpoint

```http
GET /api/auth/me
```

### Access

Authenticated users

### Authorization

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 4. User Management APIs

## 4.1 Get All Users

Returns all registered users.

### Endpoint

```http
GET /api/users
```

### Access

Administrator only

---

## 4.2 Get Employees

Returns the list of employees.

### Endpoint

```http
GET /api/users/employees
```

### Access

Authenticated users

---

## 4.3 Create User

Creates a new user.

### Endpoint

```http
POST /api/users
```

### Access

Administrator only

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Employee"
}
```

---

## 4.4 Update User

Updates an existing user's information.

### Endpoint

```http
PUT /api/users/:id
```

### Access

Administrator only

### Example

```text
PUT /api/users/USER_ID
```

---

## 4.5 Delete User

Deletes an existing user.

### Endpoint

```http
DELETE /api/users/:id
```

### Access

Administrator only

### Example

```text
DELETE /api/users/USER_ID
```

---

# 5. Dashboard API

## 5.1 Get Dashboard Data

Returns dashboard statistics based on the authenticated user's role.

### Endpoint

```http
GET /api/dashboard
```

### Access

Authenticated users

### Authorization

```text
Authorization: Bearer <JWT_TOKEN>
```

### Dashboard Statistics

The API provides role-based dashboard information such as:

### Administrator

- Total Employees
- Total Visitors
- Pending Visitors
- Checked-In Visitors
- Today's Visitors

### Receptionist

- Today's Visitors
- Checked-In Visitors
- Approved Visitors
- Scheduled Visitors

### Employee

- Pending Requests
- Approved Today
- Total Handled

---

# 6. Visitor Management APIs

All visitor APIs require authentication.

---

## 6.1 Get All Visitors

Returns visitor records.

### Endpoint

```http
GET /api/visitors
```

### Access

Authenticated users

### Authorization

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## 6.2 Register Visitor

Creates a new visitor request.

### Endpoint

```http
POST /api/visitors
```

### Access

Receptionist only

### Request Body

```json
{
  "visitorName": "John Doe",
  "phone": "9876543210",
  "address": "Chennai",
  "purpose": "Business Meeting",
  "employeeToVisit": "Employee Name",
  "visitDate": "2026-08-10",
  "expectedArrivalTime": "10:30"
}
```

---

## 6.3 Get My Requests

Returns visitor requests related to the authenticated employee.

### Endpoint

```http
GET /api/visitors/my-requests
```

### Access

Employee only

### Authorization

```text
Authorization: Bearer <EMPLOYEE_JWT_TOKEN>
```

---

## 6.4 Search Visitors

Searches visitor records.

### Endpoint

```http
GET /api/visitors/search
```

### Access

Authenticated users

---

## 6.5 Approve Visitor

Approves a pending visitor request.

### Endpoint

```http
PUT /api/visitors/:id/approve
```

### Access

Employee only

### Example

```text
PUT /api/visitors/VISITOR_ID/approve
```

### Request Body

```json
{
  "remarks": "Approved for meeting"
}
```

---

## 6.6 Reject Visitor

Rejects a pending visitor request.

### Endpoint

```http
PUT /api/visitors/:id/reject
```

### Access

Employee only

### Example

```text
PUT /api/visitors/VISITOR_ID/reject
```

### Request Body

```json
{
  "remarks": "Not available today"
}
```

---

## 6.7 Check In Visitor

Marks an approved visitor as checked in.

### Endpoint

```http
PUT /api/visitors/:id/checkin
```

### Access

Receptionist only

### Example

```text
PUT /api/visitors/VISITOR_ID/checkin
```

---

## 6.8 Check Out Visitor

Marks a visitor as checked out.

### Endpoint

```http
PUT /api/visitors/:id/checkout
```

### Access

Receptionist only

### Example

```text
PUT /api/visitors/VISITOR_ID/checkout
```

---

## 6.9 Cancel Visitor

Cancels a visitor request.

### Endpoint

```http
PUT /api/visitors/:id/cancel
```

### Access

- Administrator
- Receptionist

### Example

```text
PUT /api/visitors/VISITOR_ID/cancel
```

---

## 6.10 Get Visitor Activity

Returns the activity history of a visitor.

### Endpoint

```http
GET /api/visitors/:id/activity
```

### Access

Authenticated users

### Example

```text
GET /api/visitors/VISITOR_ID/activity
```

---

# 7. Visitor Reports API

## 7.1 Get Visitor Reports

Returns visitor report information.

### Endpoint

```http
GET /api/visitors/reports
```

### Access

Administrator only

### Authorization

```text
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

# 8. API Access Control

The application implements role-based access control.

| Feature | Administrator | Receptionist | Employee |
|---|---|---|---|
| Login | Yes | Yes | Yes |
| Current User | Yes | Yes | Yes |
| Register User | Yes | No | No |
| View All Users | Yes | No | No |
| Create User | Yes | No | No |
| Update User | Yes | No | No |
| Delete User | Yes | No | No |
| View Employees | Yes | Yes | Yes |
| Dashboard | Yes | Yes | Yes |
| View Visitors | Yes | Yes | Yes |
| Register Visitor | No | Yes | No |
| My Requests | No | No | Yes |
| Approve Visitor | No | No | Yes |
| Reject Visitor | No | No | Yes |
| Check-In | No | Yes | No |
| Check-Out | No | Yes | No |
| Cancel Visitor | Yes | Yes | No |
| Visitor Reports | Yes | No | No |
| Visitor Activity | Yes | Yes | Yes |

---

# 9. Common HTTP Status Codes

| Status Code | Description |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Bad request |
| 401 | Authentication required or invalid token |
| 403 | Access denied |
| 404 | Resource not found |
| 500 | Internal server error |

---

# 10. Sample Test Users

These accounts can be used to test the role-based features of the application.

### Administrator

```text
Email: admin@vpm.com
Password: admin123
Role: Administrator
```

### Receptionist

```text
Email: reception@vpm.com
Password: reception123
Role: Receptionist
```

### Employee

```text
Email: employee@vpm.com
Password: employee123
Role: Employee
```

> These are demo/test credentials created for application testing.

---

# 11. Production Deployment

### Frontend

Vercel:

https://visitor-pass-management-system-seven.vercel.app/

### Backend

Render:

https://vpms-backend-v59a.onrender.com/

### Database

MongoDB Atlas

The React frontend communicates with the Express.js backend through the production API base URL.

---

# 12. Technology Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- Vanilla CSS

## Backend

- Node.js
- Express.js
- JWT Authentication
- REST APIs

## Database

- MongoDB Atlas

## Deployment

- Vercel
- Render

---

# 13. API Architecture

```text
                    React Frontend
                          |
                    Axios API Client
                          |
                   HTTP / REST API
                          |
                          v
                  Express.js Backend
                          |
              +-----------+-----------+
              |           |           |
              v           v           v
        Authentication   Users     Visitors
              |           |           |
              +-----------+-----------+
                          |
                          v
                    MongoDB Atlas
```

---

# 14. Authentication Flow

```text
User
 |
 | Email + Password
 v
POST /api/auth/login
 |
 v
Express.js Backend
 |
 | Validate Credentials
 v
JWT Token
 |
 v
React Frontend
 |
 | Authorization: Bearer <JWT_TOKEN>
 v
Protected API
 |
 v
JWT Verification + Role Authorization
 |
 v
Requested Operation
```

---

# 15. Role-Based Workflow

## Administrator

```text
Login
  |
  v
Dashboard
  |
  +--> Manage Users
  |
  +--> View All Visitors
  |
  +--> Reports
```

## Receptionist

```text
Login
  |
  v
Dashboard
  |
  +--> Register Visitor
  |
  +--> View Visitors
  |
  +--> Check-In
  |
  +--> Check-Out
```

## Employee

```text
Login
  |
  v
Dashboard
  |
  +--> View My Requests
  |
  +--> Approve Visitor
  |
  +--> Reject Visitor
```

---

# 16. API Security

The application uses the following security mechanisms:

- JWT-based authentication
- Protected API routes
- Role-based authorization
- Password hashing on the backend
- Authorization headers for protected requests
- Environment variables for sensitive configuration

---

# 17. Notes

- Protected APIs require a valid JWT token.
- API access is controlled based on the authenticated user's role.
- Administrator-only APIs cannot be accessed by Receptionists or Employees.
- Receptionist operations are restricted to visitor management activities.
- Employee operations are focused on visitor request approval and rejection.
- The production frontend and backend are deployed separately.
- MongoDB Atlas is used as the production database.