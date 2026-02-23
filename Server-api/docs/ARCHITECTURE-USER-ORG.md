# User & Organization Architecture Design

## Executive Summary

This document outlines the recommended architecture for the User & Organization system in TAIF, designed for scalability, multi-tenant support, and production readiness.

---

## 🧠 Architectural Decision: Single User Table vs Separate Tables

### Option A: Single User Table (RECOMMENDED ✅)

```
User (unified)
├── Role: Student | Instructor | OrgAdmin | SystemAdmin
├── OrganizationId (nullable for SystemAdmin)
└── Profile extensions via separate tables (InstructorProfile, etc.)
```

### Option B: Separate Tables

```
Students
Instructors  
Admins
```

### Decision Matrix

| Criteria | Single Table | Separate Tables |
|----------|--------------|-----------------|
| **Scalability** | ✅ Excellent - Single index, single query optimization | ⚠️ Complex - Multiple table joins |
| **Query Complexity** | ✅ Simple WHERE clauses | ❌ UNION queries, complex joins |
| **Multi-tenant Filtering** | ✅ Single `OrganizationId` filter | ⚠️ Filter across multiple tables |
| **Permission Management** | ✅ Role enum, simple policies | ⚠️ Per-table logic |
| **Performance** | ✅ Indexed role column | ⚠️ Cross-table operations |
| **Clean Architecture** | ✅ Single repository, DRY | ⚠️ Code duplication |
| **Authentication** | ✅ Single auth flow | ⚠️ Multiple auth handlers |
| **Future Extensions** | ✅ Add role = one migration | ⚠️ New table + relationships |

### **Final Decision: Single User Table with Role-Based Logic**

**Justification:**
1. **DRY Principle**: Authentication, authorization, and common user operations are centralized
2. **Polymorphic Extensions**: Role-specific data stored in extension tables (e.g., `InstructorProfile`)
3. **Multi-tenant Ready**: Single `OrganizationId` column enables tenant filtering at query level
4. **Index Efficiency**: Composite index on `(OrganizationId, Role, IsActive)` covers 95% of queries
5. **Industry Standard**: Used by major SaaS platforms (Stripe, Slack, GitHub)

---

## 🏗️ Database Schema Design

### User Table (Enhanced)

```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(512) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Birthday DATE NOT NULL,
    
    -- Role & Organization
    Role INT NOT NULL DEFAULT 3,  -- 0=SystemAdmin, 1=OrgAdmin, 2=Instructor, 3=Student
    OrganizationId UNIQUEIDENTIFIER NULL,  -- NULL = System-level access
    
    -- Status
    IsActive BIT NOT NULL DEFAULT 1,
    IsCompleted BIT NOT NULL DEFAULT 1,
    EmailVerified BIT NOT NULL DEFAULT 0,
    
    -- Tokens
    RefreshToken NVARCHAR(512) NULL,
    RefreshTokenExpiresAt DATETIME2 NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    
    -- Indexes
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_OrganizationId (OrganizationId),
    INDEX IX_Users_Role (Role),
    INDEX IX_Users_OrgRole (OrganizationId, Role, IsActive),
    
    -- Foreign Key
    CONSTRAINT FK_Users_Organization 
        FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id)
);
```

### Organization Table (Enhanced)

```sql
CREATE TABLE Organizations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL UNIQUE,
    Slug NVARCHAR(100) NOT NULL UNIQUE,  -- URL-friendly identifier
    
    -- Type
    Type INT NOT NULL DEFAULT 0,  -- 0=Public, 1=Private
    
    -- Details
    Logo NVARCHAR(500) NULL,
    Description NVARCHAR(2000) NULL,
    Email NVARCHAR(255) NULL,
    Phone NVARCHAR(50) NULL,
    Website NVARCHAR(500) NULL,
    
    -- Status
    IsActive BIT NOT NULL DEFAULT 1,
    
    -- Settings (JSON for flexibility)
    Settings NVARCHAR(MAX) NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    
    -- Indexes
    INDEX IX_Organizations_Slug (Slug),
    INDEX IX_Organizations_Type (Type)
);
```

### Constraints for Public Organization

```sql
-- Enforce only ONE public organization via unique filtered index
CREATE UNIQUE INDEX IX_Organizations_SinglePublic 
ON Organizations (Type) 
WHERE Type = 0 AND IsDeleted = 0;
```

---

## 🔐 Role Hierarchy

```
SystemAdmin (Role=0)
├── NULL OrganizationId
├── Can access ALL organizations
├── Can create organizations
└── Can manage system settings

OrgAdmin (Role=1)
├── Scoped to OrganizationId
├── Can manage users in their org
├── Can manage org settings
└── Cannot access other orgs

Instructor (Role=2)
├── Scoped to OrganizationId
├── Can create/manage courses
├── Has InstructorProfile extension
└── Cannot manage other users

Student (Role=3)
├── Scoped to OrganizationId (Public by default)
├── Can enroll in courses
├── Can view content
└── Most restricted role
```

---

## 🧩 Middleware Architecture

### 1. Organization Context Middleware

```csharp
public class OrganizationContextMiddleware
{
    // Extracts OrganizationId from JWT
    // Sets IOrganizationContext for the request
    // Validates organization exists and is active
}
```

### 2. Organization Scoping Middleware

```csharp
public class OrganizationScopingMiddleware
{
    // For non-SystemAdmin users:
    //   - Blocks access to resources outside their org
    //   - Auto-filters queries by OrganizationId
    // For SystemAdmin:
    //   - Allows cross-org access
    //   - Respects ?orgId= query parameter for scoping
}
```

### 3. Role Authorization Middleware

```csharp
// Policy-based authorization
[Authorize(Policy = "RequireSystemAdmin")]
[Authorize(Policy = "RequireOrgAdmin")]
[Authorize(Policy = "RequireInstructor")]
[Authorize(Policy = "RequireInstructorOrAbove")]
```

---

## 📁 Folder Structure

```
TAIF.Domain/
├── Entities/
│   ├── User.cs                 # Enhanced with OrganizationId
│   ├── Organization.cs         # Enhanced with Type enum
│   ├── InstructorProfile.cs    # Role-specific extension
│   └── Enums/
│       ├── UserRole.cs         # SystemAdmin, OrgAdmin, Instructor, Student
│       └── OrganizationType.cs # Public, Private
├── Interfaces/
│   └── IOrganizationScoped.cs  # Marker interface for org-scoped entities

TAIF.Application/
├── DTOs/
│   ├── Auth/
│   │   ├── RegisterInstructorRequest.cs
│   │   ├── LoginRequest.cs
│   │   └── AuthResponse.cs
│   ├── User/
│   │   ├── UserResponse.cs
│   │   ├── UpdateProfileRequest.cs
│   │   └── InstructorProfileResponse.cs
│   └── Organization/
│       └── OrganizationResponse.cs
├── Interfaces/
│   ├── Services/
│   │   ├── IAuthService.cs
│   │   ├── IUserService.cs
│   │   └── IOrganizationService.cs
│   └── IOrganizationContext.cs  # Request-scoped org context
├── Services/
│   ├── AuthService.cs
│   ├── UserService.cs
│   └── OrganizationService.cs

TAIF.Infrastructure/
├── Data/
│   └── TaifDbContext.cs        # Enhanced with org filtering
├── Repositories/
│   ├── UserRepository.cs
│   └── OrganizationRepository.cs
├── Middleware/
│   ├── OrganizationContextMiddleware.cs
│   └── OrganizationScopingMiddleware.cs

TAIF.API/
├── Controllers/
│   ├── AuthController.cs       # Register/Login/Profile
│   └── OrganizationController.cs
├── Middleware/
│   └── ExceptionMiddleware.cs
└── Seeder/
    ├── OrganizationSeeder.cs   # Seeds Public Organization
    └── SystemAdminSeeder.cs    # Seeds initial admin
```

---

## 🔄 Authentication Flow

### Register Instructor

```
1. POST /api/auth/register/instructor
2. Validate request
3. Check email uniqueness
4. Get Public Organization ID
5. Create User with:
   - Role = Instructor
   - OrganizationId = PublicOrg.Id
   - IsCompleted = false (needs profile)
6. Create InstructorProfile linked to User
7. Generate JWT with OrganizationId claim
8. Return AuthResponse
```

### Login

```
1. POST /api/auth/login
2. Validate credentials
3. Load User with Organization
4. Generate JWT with claims:
   - sub (UserId)
   - email
   - role
   - organizationId (or null for SystemAdmin)
   - organizationType
5. Return AuthResponse with tokens
```

### Profile Edit

```
1. PUT /api/users/profile
2. OrganizationContextMiddleware extracts org from JWT
3. Validate user belongs to org (middleware)
4. Update User fields
5. If Instructor: update InstructorProfile
6. Return updated profile
```

---

## 🔒 Security Considerations

1. **JWT Claims**: Include `organizationId` and `role` for stateless validation
2. **Defense in Depth**: Middleware + Repository-level filtering
3. **Cross-Org Prevention**: All org-scoped queries filtered by middleware
4. **SystemAdmin Audit**: Log all cross-org access
5. **Password Hashing**: SHA256 → Consider BCrypt/Argon2 upgrade
6. **Rate Limiting**: Implement per-org rate limits
7. **SQL Injection**: Parameterized queries via EF Core

---

## 🚀 Multi-Tenant Strategy

### Current Phase (Implemented)
- Single `OrganizationId` column on User
- Public Organization for all self-registered users
- Role-based access control

### Future Phase (Prepared)
- Add `OrganizationId` to: Course, Lesson, LessonItem, etc.
- Global query filter in DbContext:
  ```csharp
  modelBuilder.Entity<Course>()
      .HasQueryFilter(c => c.OrganizationId == _orgContext.OrganizationId);
  ```
- Org-specific settings in Organization.Settings JSON
- Subdomain routing: `{org-slug}.taif.com`

---

## 📊 Index Strategy

```sql
-- High-frequency queries
CREATE INDEX IX_Users_OrgRoleActive 
ON Users (OrganizationId, Role, IsActive) 
INCLUDE (Email, FirstName, LastName);

-- Email lookup (login)
CREATE UNIQUE INDEX IX_Users_Email ON Users (Email) WHERE IsDeleted = 0;

-- Org filtering
CREATE INDEX IX_Users_OrganizationId ON Users (OrganizationId);

-- Future: Course filtering
CREATE INDEX IX_Courses_OrganizationId ON Courses (OrganizationId);
```

---

## ✅ Implementation Checklist

- [x] Update `UserRole` enum (SystemAdmin, OrgAdmin, Instructor, Student)
- [x] Add `OrganizationType` enum (Public, Private)
- [x] Enhance `User` entity with `OrganizationId`
- [x] Enhance `Organization` entity with `Type`, `Slug`
- [x] Create `IOrganizationContext` interface
- [x] Implement `OrganizationContextMiddleware`
- [x] Implement `OrganizationScopingMiddleware`
- [x] Update `TokenService` to include org claims
- [x] Create instructor registration endpoint
- [x] Update authorization policies
- [x] Update seeders (Organization, User, InstructorProfile)
- [ ] Create EF Core migration
- [ ] Add integration tests

---

## 🚀 Migration Commands

After making the schema changes, run the following commands to create and apply the migration:

```bash
# Navigate to the Server-api directory
cd TAIF/Server-api

# Create the migration
dotnet ef migrations add AddUserOrganizationSupport --project TAIF.Infrastructure --startup-project TAIF

# Apply the migration
dotnet ef database update --project TAIF.Infrastructure --startup-project TAIF

# Seed the database (Organization must be seeded first)
dotnet run --project TAIF -- seed all
```

---

## 📋 API Endpoints Summary

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register student/user | No |
| POST | `/api/auth/register/instructor` | Register instructor | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/refresh` | Refresh token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Sample Request: Register Instructor

```json
POST /api/auth/register/instructor
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.instructor@example.com",
  "password": "SecurePass123!",
  "birthday": "1990-01-15",
  "websiteUrl": "https://johndoe.com",
  "yearsOfExperience": 5
}
```

### Sample Response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "accessTokenExpires": "2026-02-15T04:00:00Z",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshTokenExpires": "2026-03-17T03:30:00Z"
  }
}
```

---

## 🔑 JWT Token Claims

The access token includes the following claims:

| Claim | Description |
|-------|-------------|
| `sub` | User ID (GUID) |
| `email` | User email |
| `firstName` | User first name |
| `lastName` | User last name |
| `Role` | Role integer (0=SystemAdmin, 1=OrgAdmin, 2=Instructor, 3=Student) |
| `OrganizationId` | Organization GUID (null for SystemAdmin) |

---

## 🛡️ Security Best Practices Implemented

1. **Organization Scoping**: All non-SystemAdmin users are scoped to their organization
2. **JWT Claims**: OrganizationId included in token for stateless validation
3. **Middleware Pipeline**: Organization context extracted and validated on each request
4. **Role-Based Policies**: Clear separation between system and org-level access
5. **Soft Deletes**: Base entity supports soft delete pattern
6. **Indexed Queries**: Composite indexes for common multi-tenant query patterns
