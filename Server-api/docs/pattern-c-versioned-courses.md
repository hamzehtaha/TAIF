# Pattern C: Versioned Records with Published Pointer

## Implementation Proposal for Draft vs Published Courses

---

## 1. Current Schema Summary

### Entity Hierarchy

```
Course (OrganizationBase)
├── Id, Name, Description, Photo, CategoryId, Status, Tags
├── TotalDurationInSeconds, TotalEnrolled, TotalLessonItems, TotalLessons
└── CourseLessons (M-M junction)

CourseLesson (OrganizationBase)
├── CourseId → Course
├── LessonId → Lesson
└── Order

Lesson (OrganizationBase)
├── Id, Title, Description, Photo, InstructorId
├── TotalDurationInSeconds, TotalLessonItems
├── CourseLessons (M-M junction)
└── LessonLessonItems (M-M junction)

LessonLessonItem (OrganizationBase)
├── LessonId → Lesson
├── LessonItemId → LessonItem
└── Order

LessonItem (OrganizationBase)
├── Id, Name, Description, Type, DurationInSeconds
├── ContentId → Content
├── SkillIds
└── LessonLessonItems (M-M junction)

Content (OrganizationBase)
├── Id, Type, ContentJson
└── (Polymorphic: Video, RichText, Quiz)
```

### Current Relationships

| Relationship | Type | Junction Table |
|-------------|------|----------------|
| Course ↔ Lesson | Many-to-Many | `CourseLessons` |
| Lesson ↔ LessonItem | Many-to-Many | `LessonLessonItems` |
| LessonItem → Content | Many-to-One | Direct FK |

### Current Status Field

The `Course` entity already has a `Status` enum:
```csharp
public enum CourseStatus
{
    Draft = 0,
    Published = 1,
    Archived = 2
}
```

**Problem:** This status applies to the entire course. When an instructor edits a published course, changes are immediately visible to students.

---

## 2. Proposed Schema Changes

### 2.1 New Entities

#### CourseVersion Entity

```csharp
namespace TAIF.Domain.Entities
{
    public class CourseVersion : OrganizationBase
    {
        public Guid CourseId { get; set; }
        public Course Course { get; set; } = null!;
        
        public int VersionNumber { get; set; }
        public CourseVersionStatus Status { get; set; } = CourseVersionStatus.Draft;
        
        // Snapshot of course metadata at this version
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public ICollection<Guid> Tags { get; set; } = new List<Guid>();
        
        // Computed totals for this version
        public double TotalDurationInSeconds { get; set; } = 0;
        public int TotalLessonItems { get; set; } = 0;
        public int TotalLessons { get; set; } = 0;
        
        // Navigation to version-specific lessons
        public ICollection<CourseVersionLesson> CourseVersionLessons { get; set; } = new List<CourseVersionLesson>();
        
        // Publishing metadata
        public DateTime? PublishedAt { get; set; }
        public Guid? PublishedBy { get; set; }
    }
}
```

#### CourseVersionStatus Enum

```csharp
public enum CourseVersionStatus
{
    Draft = 0,
    Published = 1,
    Archived = 2
}
```

#### CourseVersionLesson Junction Entity

```csharp
namespace TAIF.Domain.Entities
{
    public class CourseVersionLesson : OrganizationBase
    {
        public Guid CourseVersionId { get; set; }
        public CourseVersion CourseVersion { get; set; } = null!;
        
        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        
        public int Order { get; set; }
    }
}
```

### 2.2 Modified Entities

#### Course Entity (Modified)

```csharp
namespace TAIF.Domain.Entities
{
    public class Course : OrganizationBase
    {
        // KEEP: Stable identifier
        // KEEP: Organization-level stats that span versions
        public int TotalEnrolled { get; set; } = 0;
        
        // NEW: Pointer to currently published version
        public Guid? CurrentPublishedVersionId { get; set; }
        public CourseVersion? CurrentPublishedVersion { get; set; }
        
        // NEW: Pointer to current draft version (if editing)
        public Guid? CurrentDraftVersionId { get; set; }
        public CourseVersion? CurrentDraftVersion { get; set; }
        
        // KEEP: Navigation for all versions
        public ICollection<CourseVersion> Versions { get; set; } = new List<CourseVersion>();
        
        // DEPRECATED - Remove after migration:
        // public string? Name { get; set; }
        // public string? Description { get; set; }
        // public string? Photo { get; set; }
        // public Guid CategoryId { get; set; }
        // public ICollection<Guid> Tags { get; set; }
        // public double TotalDurationInSeconds { get; set; }
        // public int TotalLessonItems { get; set; }
        // public int TotalLessons { get; set; }
        // public CourseStatus Status { get; set; }
        // public ICollection<CourseLesson> CourseLessons { get; set; }
    }
}
```

### 2.3 Unchanged Entities

The following entities remain **unchanged**:
- `Lesson` - Lessons are reusable across versions
- `LessonItem` - LessonItems are reusable across versions  
- `LessonLessonItem` - Lesson ↔ LessonItem mapping unchanged
- `Content` - Content is immutable and reusable

**Key Insight:** Lessons and LessonItems are treated as **immutable content blocks**. When editing, we create new copies rather than modifying existing ones.

### 2.4 Database Schema Changes

#### New Tables

```sql
-- CourseVersions table
CREATE TABLE CourseVersions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CourseId UNIQUEIDENTIFIER NOT NULL,
    VersionNumber INT NOT NULL,
    Status INT NOT NULL DEFAULT 0,
    
    -- Metadata snapshot
    Name NVARCHAR(500) NULL,
    Description NVARCHAR(MAX) NULL,
    Photo NVARCHAR(1000) NULL,
    CategoryId UNIQUEIDENTIFIER NOT NULL,
    Tags NVARCHAR(MAX) NULL,
    
    -- Computed totals
    TotalDurationInSeconds FLOAT NOT NULL DEFAULT 0,
    TotalLessonItems INT NOT NULL DEFAULT 0,
    TotalLessons INT NOT NULL DEFAULT 0,
    
    -- Publishing metadata
    PublishedAt DATETIME2 NULL,
    PublishedBy UNIQUEIDENTIFIER NULL,
    
    -- Base entity fields
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    OrganizationId UNIQUEIDENTIFIER NULL,
    
    CONSTRAINT FK_CourseVersions_Courses FOREIGN KEY (CourseId) 
        REFERENCES Courses(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CourseVersions_Categories FOREIGN KEY (CategoryId) 
        REFERENCES Categories(Id) ON DELETE RESTRICT
);

-- CourseVersionLessons junction table
CREATE TABLE CourseVersionLessons (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CourseVersionId UNIQUEIDENTIFIER NOT NULL,
    LessonId UNIQUEIDENTIFIER NOT NULL,
    [Order] INT NOT NULL,
    
    -- Base entity fields
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    OrganizationId UNIQUEIDENTIFIER NULL,
    
    CONSTRAINT FK_CourseVersionLessons_CourseVersions FOREIGN KEY (CourseVersionId) 
        REFERENCES CourseVersions(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CourseVersionLessons_Lessons FOREIGN KEY (LessonId) 
        REFERENCES Lessons(Id) ON DELETE CASCADE
);
```

#### Alter Courses Table

```sql
-- Add version pointers to Courses
ALTER TABLE Courses ADD CurrentPublishedVersionId UNIQUEIDENTIFIER NULL;
ALTER TABLE Courses ADD CurrentDraftVersionId UNIQUEIDENTIFIER NULL;

ALTER TABLE Courses ADD CONSTRAINT FK_Courses_PublishedVersion 
    FOREIGN KEY (CurrentPublishedVersionId) REFERENCES CourseVersions(Id);
    
ALTER TABLE Courses ADD CONSTRAINT FK_Courses_DraftVersion 
    FOREIGN KEY (CurrentDraftVersionId) REFERENCES CourseVersions(Id);
```

---

## 3. Editing Workflow

### When Instructor Clicks "Edit Course"

#### Scenario A: First Edit (No Draft Exists)

```csharp
public async Task<CourseVersion> StartEditingCourse(Guid courseId, Guid userId)
{
    var course = await _context.Courses
        .Include(c => c.CurrentPublishedVersion)
            .ThenInclude(v => v.CourseVersionLessons)
                .ThenInclude(cvl => cvl.Lesson)
                    .ThenInclude(l => l.LessonLessonItems)
        .FirstOrDefaultAsync(c => c.Id == courseId);
    
    if (course == null)
        throw new NotFoundException("Course not found");
    
    // Check if draft already exists
    if (course.CurrentDraftVersionId != null)
    {
        return await _context.CourseVersions
            .Include(v => v.CourseVersionLessons)
            .FirstAsync(v => v.Id == course.CurrentDraftVersionId);
    }
    
    // Get next version number
    var maxVersion = await _context.CourseVersions
        .Where(v => v.CourseId == courseId)
        .MaxAsync(v => (int?)v.VersionNumber) ?? 0;
    
    // Create new draft version
    var draftVersion = new CourseVersion
    {
        Id = Guid.NewGuid(),
        CourseId = courseId,
        VersionNumber = maxVersion + 1,
        Status = CourseVersionStatus.Draft,
        
        // Copy metadata from published version (or defaults for new course)
        Name = course.CurrentPublishedVersion?.Name ?? course.Name,
        Description = course.CurrentPublishedVersion?.Description ?? course.Description,
        Photo = course.CurrentPublishedVersion?.Photo ?? course.Photo,
        CategoryId = course.CurrentPublishedVersion?.CategoryId ?? course.CategoryId,
        Tags = course.CurrentPublishedVersion?.Tags?.ToList() ?? course.Tags?.ToList() ?? new List<Guid>(),
        
        TotalDurationInSeconds = course.CurrentPublishedVersion?.TotalDurationInSeconds ?? 0,
        TotalLessonItems = course.CurrentPublishedVersion?.TotalLessonItems ?? 0,
        TotalLessons = course.CurrentPublishedVersion?.TotalLessons ?? 0,
    };
    
    _context.CourseVersions.Add(draftVersion);
    
    // Deep copy lesson structure
    if (course.CurrentPublishedVersion != null)
    {
        await DuplicateLessonsForVersion(
            course.CurrentPublishedVersion.Id, 
            draftVersion.Id,
            userId);
    }
    
    // Update course pointer
    course.CurrentDraftVersionId = draftVersion.Id;
    
    await _context.SaveChangesAsync();
    
    return draftVersion;
}
```

#### What Gets Duplicated

| Entity | Duplicated? | Reason |
|--------|-------------|--------|
| `CourseVersion` | ✅ Yes | New version record created |
| `CourseVersionLesson` | ✅ Yes | Junction records for new version |
| `Lesson` | ✅ Yes* | New lesson copies to allow editing |
| `LessonLessonItem` | ✅ Yes | Junction records for new lessons |
| `LessonItem` | ✅ Yes* | New item copies to allow editing |
| `Content` | ❌ No | Content is immutable, referenced by ID |

*Lessons and LessonItems are duplicated as **shallow copies** - they reference the same `ContentId`.

#### Duplication Service

```csharp
private async Task DuplicateLessonsForVersion(
    Guid sourceVersionId, 
    Guid targetVersionId,
    Guid userId)
{
    var sourceLessons = await _context.CourseVersionLessons
        .Include(cvl => cvl.Lesson)
            .ThenInclude(l => l.LessonLessonItems)
                .ThenInclude(lli => lli.LessonItem)
        .Where(cvl => cvl.CourseVersionId == sourceVersionId)
        .OrderBy(cvl => cvl.Order)
        .ToListAsync();
    
    foreach (var sourceLink in sourceLessons)
    {
        var sourceLesson = sourceLink.Lesson;
        
        // Create new lesson copy
        var newLesson = new Lesson
        {
            Id = Guid.NewGuid(),
            Title = sourceLesson.Title,
            Description = sourceLesson.Description,
            Photo = sourceLesson.Photo,
            InstructorId = sourceLesson.InstructorId,
            TotalDurationInSeconds = sourceLesson.TotalDurationInSeconds,
            TotalLessonItems = sourceLesson.TotalLessonItems,
        };
        
        _context.Lessons.Add(newLesson);
        
        // Create CourseVersionLesson link
        var newVersionLink = new CourseVersionLesson
        {
            Id = Guid.NewGuid(),
            CourseVersionId = targetVersionId,
            LessonId = newLesson.Id,
            Order = sourceLink.Order
        };
        
        _context.CourseVersionLessons.Add(newVersionLink);
        
        // Duplicate lesson items
        foreach (var sourceLessonItem in sourceLesson.LessonLessonItems.OrderBy(lli => lli.Order))
        {
            var sourceItem = sourceLessonItem.LessonItem;
            
            // Create new lesson item copy (references same ContentId)
            var newLessonItem = new LessonItem
            {
                Id = Guid.NewGuid(),
                Name = sourceItem.Name,
                Description = sourceItem.Description,
                Type = sourceItem.Type,
                ContentId = sourceItem.ContentId, // Same content reference
                DurationInSeconds = sourceItem.DurationInSeconds,
                SkillIds = sourceItem.SkillIds.ToList()
            };
            
            _context.LessonItems.Add(newLessonItem);
            
            // Create LessonLessonItem link
            var newItemLink = new LessonLessonItem
            {
                Id = Guid.NewGuid(),
                LessonId = newLesson.Id,
                LessonItemId = newLessonItem.Id,
                Order = sourceLessonItem.Order
            };
            
            _context.LessonLessonItems.Add(newItemLink);
        }
    }
}
```

---

## 4. Publishing Workflow

### Publish Draft Version

```csharp
public async Task PublishCourseVersion(Guid courseId, Guid userId)
{
    var course = await _context.Courses
        .Include(c => c.CurrentDraftVersion)
        .Include(c => c.CurrentPublishedVersion)
        .FirstOrDefaultAsync(c => c.Id == courseId);
    
    if (course == null)
        throw new NotFoundException("Course not found");
    
    if (course.CurrentDraftVersionId == null)
        throw new InvalidOperationException("No draft version to publish");
    
    var draftVersion = course.CurrentDraftVersion!;
    
    // Archive previous published version (if exists)
    if (course.CurrentPublishedVersion != null)
    {
        course.CurrentPublishedVersion.Status = CourseVersionStatus.Archived;
    }
    
    // Publish the draft
    draftVersion.Status = CourseVersionStatus.Published;
    draftVersion.PublishedAt = DateTime.UtcNow;
    draftVersion.PublishedBy = userId;
    
    // Update course pointers
    course.CurrentPublishedVersionId = draftVersion.Id;
    course.CurrentDraftVersionId = null; // Clear draft pointer
    
    await _context.SaveChangesAsync();
}
```

### SQL Equivalent

```sql
-- Archive current published version
UPDATE CourseVersions 
SET Status = 2, -- Archived
    UpdatedAt = GETUTCDATE(),
    UpdatedBy = @UserId
WHERE Id = (SELECT CurrentPublishedVersionId FROM Courses WHERE Id = @CourseId);

-- Publish draft version
UPDATE CourseVersions 
SET Status = 1, -- Published
    PublishedAt = GETUTCDATE(),
    PublishedBy = @UserId,
    UpdatedAt = GETUTCDATE(),
    UpdatedBy = @UserId
WHERE Id = (SELECT CurrentDraftVersionId FROM Courses WHERE Id = @CourseId);

-- Update course pointers (single atomic operation)
UPDATE Courses 
SET CurrentPublishedVersionId = CurrentDraftVersionId,
    CurrentDraftVersionId = NULL,
    UpdatedAt = GETUTCDATE(),
    UpdatedBy = @UserId
WHERE Id = @CourseId;
```

---

## 5. Student Read Queries

### Get Published Course with Lessons

```csharp
public async Task<CourseDetailDto> GetPublishedCourseForStudent(Guid courseId, Guid userId)
{
    var course = await _context.Courses
        .Where(c => c.Id == courseId && !c.IsDeleted)
        .Where(c => c.CurrentPublishedVersionId != null) // Must be published
        .Select(c => new CourseDetailDto
        {
            Id = c.Id,
            VersionId = c.CurrentPublishedVersionId!.Value,
            
            // From published version
            Name = c.CurrentPublishedVersion!.Name,
            Description = c.CurrentPublishedVersion.Description,
            Photo = c.CurrentPublishedVersion.Photo,
            CategoryId = c.CurrentPublishedVersion.CategoryId,
            CategoryName = c.CurrentPublishedVersion.Category.Name,
            Tags = c.CurrentPublishedVersion.Tags,
            TotalDurationInSeconds = c.CurrentPublishedVersion.TotalDurationInSeconds,
            TotalLessonItems = c.CurrentPublishedVersion.TotalLessonItems,
            TotalLessons = c.CurrentPublishedVersion.TotalLessons,
            
            // From course
            TotalEnrolled = c.TotalEnrolled,
            
            // Lessons from published version
            Lessons = c.CurrentPublishedVersion.CourseVersionLessons
                .Where(cvl => !cvl.IsDeleted)
                .OrderBy(cvl => cvl.Order)
                .Select(cvl => new LessonDto
                {
                    Id = cvl.Lesson.Id,
                    Title = cvl.Lesson.Title,
                    Description = cvl.Lesson.Description,
                    Photo = cvl.Lesson.Photo,
                    Order = cvl.Order,
                    TotalDurationInSeconds = cvl.Lesson.TotalDurationInSeconds,
                    TotalLessonItems = cvl.Lesson.TotalLessonItems,
                    
                    Items = cvl.Lesson.LessonLessonItems
                        .Where(lli => !lli.IsDeleted)
                        .OrderBy(lli => lli.Order)
                        .Select(lli => new LessonItemDto
                        {
                            Id = lli.LessonItem.Id,
                            Name = lli.LessonItem.Name,
                            Description = lli.LessonItem.Description,
                            Type = lli.LessonItem.Type,
                            Order = lli.Order,
                            DurationInSeconds = lli.LessonItem.DurationInSeconds,
                            ContentId = lli.LessonItem.ContentId
                        }).ToList()
                }).ToList()
        })
        .FirstOrDefaultAsync();
    
    return course;
}
```

### Raw SQL Query

```sql
-- Get published course with full hierarchy
SELECT 
    c.Id AS CourseId,
    cv.Id AS VersionId,
    cv.Name,
    cv.Description,
    cv.Photo,
    cv.CategoryId,
    cat.Name AS CategoryName,
    cv.Tags,
    cv.TotalDurationInSeconds,
    cv.TotalLessonItems,
    cv.TotalLessons,
    c.TotalEnrolled,
    
    l.Id AS LessonId,
    l.Title AS LessonTitle,
    l.Description AS LessonDescription,
    cvl.[Order] AS LessonOrder,
    l.TotalDurationInSeconds AS LessonDuration,
    
    li.Id AS LessonItemId,
    li.Name AS LessonItemName,
    li.Type AS LessonItemType,
    lli.[Order] AS LessonItemOrder,
    li.DurationInSeconds AS LessonItemDuration,
    li.ContentId
    
FROM Courses c
INNER JOIN CourseVersions cv ON c.CurrentPublishedVersionId = cv.Id
INNER JOIN Categories cat ON cv.CategoryId = cat.Id
LEFT JOIN CourseVersionLessons cvl ON cv.Id = cvl.CourseVersionId AND cvl.IsDeleted = 0
LEFT JOIN Lessons l ON cvl.LessonId = l.Id AND l.IsDeleted = 0
LEFT JOIN LessonLessonItems lli ON l.Id = lli.LessonId AND lli.IsDeleted = 0
LEFT JOIN LessonItems li ON lli.LessonItemId = li.Id AND li.IsDeleted = 0

WHERE c.Id = @CourseId
  AND c.IsDeleted = 0
  AND c.CurrentPublishedVersionId IS NOT NULL

ORDER BY cvl.[Order], lli.[Order];
```

---

## 6. Performance Considerations

### Join Analysis

| Query Type | Joins Required | Tables Involved |
|------------|----------------|-----------------|
| Student: Get Course | 2 | Courses → CourseVersions → Categories |
| Student: Get Lessons | 4 | + CourseVersionLessons → Lessons |
| Student: Get Full Hierarchy | 6 | + LessonLessonItems → LessonItems |
| Instructor: Edit Draft | 4 | Same as lessons |
| Instructor: Publish | 1 | Courses ↔ CourseVersions |

### Comparison: Before vs After

| Metric | Before (Current) | After (Pattern C) |
|--------|------------------|-------------------|
| Course query joins | 1-2 | 2-3 |
| Full hierarchy joins | 4 | 6 |
| Write complexity (edit) | Direct mutation | Copy-on-write |
| Write complexity (publish) | N/A | Single pointer update |
| Storage overhead | Baseline | ~2x per active draft |

### Query Complexity

- **Student reads**: O(1) pointer lookup + standard hierarchy traversal
- **Publishing**: O(1) - single UPDATE statement
- **Creating draft**: O(N) where N = total lessons + items in course

---

## 7. Required Indexes

### New Indexes for CourseVersions

```sql
-- Primary lookup: Get published version for course
CREATE NONCLUSTERED INDEX IX_CourseVersions_CourseId_Status 
ON CourseVersions (CourseId, Status)
INCLUDE (Name, Description, Photo, CategoryId, TotalDurationInSeconds, TotalLessonItems, TotalLessons);

-- Version history lookup
CREATE NONCLUSTERED INDEX IX_CourseVersions_CourseId_VersionNumber
ON CourseVersions (CourseId, VersionNumber DESC);

-- Organization filtering
CREATE NONCLUSTERED INDEX IX_CourseVersions_OrganizationId
ON CourseVersions (OrganizationId)
WHERE IsDeleted = 0;
```

### New Indexes for CourseVersionLessons

```sql
-- Primary lookup: Get lessons for a version
CREATE UNIQUE NONCLUSTERED INDEX IX_CourseVersionLessons_VersionId_LessonId
ON CourseVersionLessons (CourseVersionId, LessonId);

-- Ordered lesson retrieval
CREATE NONCLUSTERED INDEX IX_CourseVersionLessons_VersionId_Order
ON CourseVersionLessons (CourseVersionId, [Order])
INCLUDE (LessonId);
```

### Updated Indexes for Courses

```sql
-- Published course lookup (for students)
CREATE NONCLUSTERED INDEX IX_Courses_PublishedVersionId
ON Courses (CurrentPublishedVersionId)
WHERE CurrentPublishedVersionId IS NOT NULL AND IsDeleted = 0;

-- Draft course lookup (for instructors)
CREATE NONCLUSTERED INDEX IX_Courses_DraftVersionId
ON Courses (CurrentDraftVersionId)
WHERE CurrentDraftVersionId IS NOT NULL;
```

---

## 8. Migration Strategy

### Phase 1: Schema Addition (Non-Breaking)

```sql
-- Step 1: Create new tables
CREATE TABLE CourseVersions (...);
CREATE TABLE CourseVersionLessons (...);

-- Step 2: Add new columns to Courses (nullable)
ALTER TABLE Courses ADD CurrentPublishedVersionId UNIQUEIDENTIFIER NULL;
ALTER TABLE Courses ADD CurrentDraftVersionId UNIQUEIDENTIFIER NULL;

-- Step 3: Create indexes
CREATE INDEX IX_CourseVersions_CourseId_Status ...
CREATE INDEX IX_CourseVersionLessons_VersionId_Order ...
```

### Phase 2: Data Migration

```sql
-- Migrate each existing course to versioned model
INSERT INTO CourseVersions (
    Id, CourseId, VersionNumber, Status,
    Name, Description, Photo, CategoryId, Tags,
    TotalDurationInSeconds, TotalLessonItems, TotalLessons,
    PublishedAt, PublishedBy,
    CreatedAt, CreatedBy, OrganizationId
)
SELECT 
    NEWID(),
    c.Id,
    1, -- First version
    CASE WHEN c.Status = 1 THEN 1 ELSE 0 END, -- Published or Draft
    c.Name, c.Description, c.Photo, c.CategoryId, c.Tags,
    c.TotalDurationInSeconds, c.TotalLessonItems, c.TotalLessons,
    CASE WHEN c.Status = 1 THEN c.UpdatedAt ELSE NULL END,
    CASE WHEN c.Status = 1 THEN c.UpdatedBy ELSE NULL END,
    c.CreatedAt, c.CreatedBy, c.OrganizationId
FROM Courses c
WHERE c.IsDeleted = 0;

-- Migrate CourseLessons to CourseVersionLessons
INSERT INTO CourseVersionLessons (
    Id, CourseVersionId, LessonId, [Order],
    CreatedAt, CreatedBy, OrganizationId
)
SELECT 
    NEWID(),
    cv.Id,
    cl.LessonId,
    cl.[Order],
    cl.CreatedAt, cl.CreatedBy, cl.OrganizationId
FROM CourseLessons cl
INNER JOIN CourseVersions cv ON cl.CourseId = cv.CourseId
WHERE cl.IsDeleted = 0;

-- Update Course pointers
UPDATE c
SET CurrentPublishedVersionId = cv.Id
FROM Courses c
INNER JOIN CourseVersions cv ON c.Id = cv.CourseId
WHERE cv.Status = 1; -- Published
```

### Phase 3: Application Code Migration

1. **Update DTOs**: Add `VersionId` to course responses
2. **Update Repositories**: Switch queries to use `CourseVersions`
3. **Add Version Service**: Implement `ICourseVersionService`
4. **Update Controllers**: Add edit/publish endpoints
5. **Dual-write period**: Write to both old and new structures

### Phase 4: Cleanup (Breaking)

```sql
-- Remove deprecated columns from Courses
ALTER TABLE Courses DROP COLUMN Name;
ALTER TABLE Courses DROP COLUMN Description;
ALTER TABLE Courses DROP COLUMN Photo;
ALTER TABLE Courses DROP COLUMN CategoryId;
ALTER TABLE Courses DROP COLUMN Tags;
ALTER TABLE Courses DROP COLUMN TotalDurationInSeconds;
ALTER TABLE Courses DROP COLUMN TotalLessonItems;
ALTER TABLE Courses DROP COLUMN TotalLessons;
ALTER TABLE Courses DROP COLUMN Status;

-- Drop old junction table
DROP TABLE CourseLessons;
```

### Migration Timeline

| Phase | Duration | Risk | Rollback |
|-------|----------|------|----------|
| Phase 1 | 1 day | Low | Drop new tables |
| Phase 2 | 2-3 days | Medium | Delete migrated data |
| Phase 3 | 1-2 weeks | Medium | Feature flag |
| Phase 4 | 1 day | High | Restore from backup |

---

## 9. EF Core Configuration

### DbContext Updates

```csharp
// Add to TaifDbContext
public DbSet<CourseVersion> CourseVersions { get; set; }
public DbSet<CourseVersionLesson> CourseVersionLessons { get; set; }

// In OnModelCreating
modelBuilder.Entity<CourseVersion>(entity =>
{
    entity.HasOne(cv => cv.Course)
          .WithMany(c => c.Versions)
          .HasForeignKey(cv => cv.CourseId)
          .OnDelete(DeleteBehavior.Cascade);
    
    entity.HasOne(cv => cv.Category)
          .WithMany()
          .HasForeignKey(cv => cv.CategoryId)
          .OnDelete(DeleteBehavior.Restrict);
    
    entity.HasIndex(cv => new { cv.CourseId, cv.Status });
    entity.HasIndex(cv => new { cv.CourseId, cv.VersionNumber });
    entity.HasIndex(cv => cv.OrganizationId);
    
    // Tags converter (same as Course)
    entity.Property(e => e.Tags)
          .HasConversion(guidCollectionConverter)
          .Metadata.SetValueComparer(guidCollectionComparer);
});

modelBuilder.Entity<CourseVersionLesson>(entity =>
{
    entity.HasIndex(cvl => new { cvl.CourseVersionId, cvl.LessonId }).IsUnique();
    entity.HasIndex(cvl => new { cvl.CourseVersionId, cvl.Order });
    
    entity.HasOne(cvl => cvl.CourseVersion)
          .WithMany(cv => cv.CourseVersionLessons)
          .HasForeignKey(cvl => cvl.CourseVersionId)
          .OnDelete(DeleteBehavior.Cascade);
    
    entity.HasOne(cvl => cvl.Lesson)
          .WithMany()
          .HasForeignKey(cvl => cvl.LessonId)
          .OnDelete(DeleteBehavior.Cascade);
});

modelBuilder.Entity<Course>(entity =>
{
    // Existing config...
    
    // Add version navigation
    entity.HasOne(c => c.CurrentPublishedVersion)
          .WithOne()
          .HasForeignKey<Course>(c => c.CurrentPublishedVersionId)
          .OnDelete(DeleteBehavior.SetNull);
    
    entity.HasOne(c => c.CurrentDraftVersion)
          .WithOne()
          .HasForeignKey<Course>(c => c.CurrentDraftVersionId)
          .OnDelete(DeleteBehavior.SetNull);
    
    entity.HasIndex(c => c.CurrentPublishedVersionId);
    entity.HasIndex(c => c.CurrentDraftVersionId);
});
```

---

## 10. Summary

### Benefits of Pattern C

1. **Zero-downtime publishing**: Pointer swap is atomic
2. **Safe editing**: Students never see incomplete changes
3. **Version history**: Can restore or compare versions
4. **Audit trail**: Track who published what and when
5. **Content reuse**: Content/LessonItems can be shared across versions

### Trade-offs

1. **Storage cost**: ~2x storage per actively-edited course
2. **Query complexity**: +2 joins for student reads
3. **Duplication logic**: Copy-on-write requires careful implementation
4. **Orphan cleanup**: May need background job to clean unused drafts

### Recommendation

Pattern C is well-suited for this learning platform because:
- Courses are long-lived and frequently updated
- Publishing cadence is likely measured in days/weeks, not minutes
- Content immutability (Videos, RichText, Quiz) aligns with the model
- Multi-tenant architecture benefits from clear version isolation
