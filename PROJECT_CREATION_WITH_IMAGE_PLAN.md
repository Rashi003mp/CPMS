# 📋 Project Creation with Image Upload - Implementation Plan

## Current State Analysis

### Backend Current Structure
```csharp
// Project Entity (ConstructionPM.Domain/Entities/Project.cs)
public class Project : BaseEntity
{
    public string ProjectName { get; set; }
    public string Description { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ICollection<ProjectStatusHistory> StatusHistory { get; set; }
}

// CreateProjectDto (Current)
public class CreateProjectDto
{
    [Required] public string ProjectName { get; set; }
    [Required] public string Description { get; set; }
    [Required] public DateTime StartDate { get; set; }
    [Required] public DateTime? EndDate { get; set; }
    [Required] public ProjectStatus Status { get; set; }
}
```

### Frontend Current Structure
```typescript
// types/project.ts
export interface CreateProjectRequest {
  projectName: string
  description: string
  startDate: string
  endDate: string
  status: ProjectStatus
}
```

---

## Image Storage Options Analysis

### Option 1: Cloudinary (RECOMMENDED ✅)
**Pros:**
- ✅ Free tier: 25GB storage, 25GB bandwidth/month
- ✅ Automatic image optimization and transformations
- ✅ CDN delivery (fast loading worldwide)
- ✅ No database bloat
- ✅ Easy to implement (.NET SDK available)
- ✅ Supports multiple formats and sizes
- ✅ Built-in image manipulation (resize, crop, etc.)
- ✅ Secure URLs with signed uploads
- ✅ Can delete images easily

**Cons:**
- ❌ External dependency
- ❌ Requires internet connection
- ❌ Costs money after free tier

**Best For:** Production applications, scalability, performance

### Option 2: Database BLOB Storage
**Pros:**
- ✅ No external dependencies
- ✅ Data stays in your control
- ✅ Transactional consistency
- ✅ Works offline

**Cons:**
- ❌ Database bloat (images are large)
- ❌ Slower queries and backups
- ❌ No CDN (slower loading)
- ❌ No automatic optimization
- ❌ Expensive database storage
- ❌ Memory issues with large images

**Best For:** Small applications, sensitive data, offline requirements

### Option 3: Local File System
**Pros:**
- ✅ Simple implementation
- ✅ No external costs
- ✅ Fast local access

**Cons:**
- ❌ Not scalable (single server)
- ❌ Backup complexity
- ❌ No CDN
- ❌ Deployment issues
- ❌ Lost on server crash

**Best For:** Development/testing only

---

## Recommended Approach: Cloudinary

### Why Cloudinary?
1. **Scalability** - Handles millions of images
2. **Performance** - CDN ensures fast loading
3. **Cost-Effective** - Free tier is generous
4. **Developer-Friendly** - Easy SDK and API
5. **Production-Ready** - Used by major companies
6. **Image Optimization** - Automatic compression and format conversion
7. **Security** - Signed uploads prevent abuse

---

## Implementation Plan

### Phase 1: Backend Changes

#### 1.1 Database Migration
```csharp
// Add to Project entity
public string? ImageUrl { get; set; }
public string? ImagePublicId { get; set; } // For Cloudinary deletion
```

**Migration Command:**
```bash
dotnet ef migrations add AddProjectImage --project ConstructionPM.Infrastructure --startup-project ConstrictionPM.API
dotnet ef database update --project ConstructionPM.Infrastructure --startup-project ConstrictionPM.API
```

#### 1.2 Install Cloudinary NuGet Package
```bash
dotnet add package CloudinaryDotNet --version 1.26.2
```

#### 1.3 Add Cloudinary Configuration
```csharp
// appsettings.json
{
  "Cloudinary": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  }
}

// CloudinarySettings.cs (new file)
public class CloudinarySettings
{
    public string CloudName { get; set; }
    public string ApiKey { get; set; }
    public string ApiSecret { get; set; }
}
```

#### 1.4 Create Image Upload Service
```csharp
// IImageUploadService.cs
public interface IImageUploadService
{
    Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file);
    Task<bool> DeleteImageAsync(string publicId);
}

// CloudinaryImageUploadService.cs
public class CloudinaryImageUploadService : IImageUploadService
{
    private readonly Cloudinary _cloudinary;
    
    public CloudinaryImageUploadService(IOptions<CloudinarySettings> config)
    {
        var account = new Account(
            config.Value.CloudName,
            config.Value.ApiKey,
            config.Value.ApiSecret
        );
        _cloudinary = new Cloudinary(account);
    }
    
    public async Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file)
    {
        // Validation
        if (file.Length > 5 * 1024 * 1024) // 5MB limit
            throw new Exception("File size exceeds 5MB");
            
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            throw new Exception("Invalid file type");
        
        // Upload
        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = "construction-projects",
            Transformation = new Transformation()
                .Width(1200).Height(800).Crop("limit")
                .Quality("auto")
        };
        
        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        
        if (uploadResult.Error != null)
            throw new Exception(uploadResult.Error.Message);
        
        return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
    }
    
    public async Task<bool> DeleteImageAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }
}
```

#### 1.5 Update DTOs
```csharp
// CreateProjectDto.cs
public class CreateProjectDto
{
    [Required] public string ProjectName { get; set; }
    [Required] public string Description { get; set; }
    [Required] public DateTime StartDate { get; set; }
    [Required] public DateTime? EndDate { get; set; }
    [Required] public ProjectStatus Status { get; set; }
    
    // NEW: Optional image
    public IFormFile? Image { get; set; }
}

// ProjectDto.cs (for GET)
public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUserName { get; set; }
    public string? ProjectManagerName { get; set; }
    public List<string>? SiteEngineerName { get; set; }
    
    // NEW: Image URL
    public string? ImageUrl { get; set; }
}

// UpdateProjectDto.cs
public class UpdateProjectDto
{
    public string? ProjectName { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ProjectStatus? Status { get; set; }
    public string? Remarks { get; set; }
    
    // NEW: Optional image update
    public IFormFile? Image { get; set; }
    public bool RemoveImage { get; set; } = false; // Flag to remove existing image
}
```

#### 1.6 Update Controller
```csharp
// ProjectsController.cs
[HttpPost("create")]
public async Task<ActionResult<ApiResponse>> Create([FromForm] CreateProjectDto dto)
{
    var response = await _projectService.CreateAsync(dto);  
    return StatusCode(response.StatusCode, response);
}

[HttpPut("{id:int}")]
public async Task<ActionResult<ApiResponse>> UpdateProject(
    int id, 
    [FromForm] UpdateProjectDto dto)
{
    var response = await _projectService.UpdateProjectAsync(id, dto);
    return StatusCode(response.StatusCode, response);
}
```

#### 1.7 Update Service
```csharp
// ProjectService.cs - CreateAsync method
public async Task<ApiResponse<int>> CreateAsync(CreateProjectDto dto)
{
    // ... existing validations ...
    
    string? imageUrl = null;
    string? imagePublicId = null;
    
    // Upload image if provided
    if (dto.Image != null)
    {
        try
        {
            (imageUrl, imagePublicId) = await _imageUploadService.UploadImageAsync(dto.Image);
        }
        catch (Exception ex)
        {
            return ApiResponse<int>.ErrorResponse($"Image upload failed: {ex.Message}", 400);
        }
    }
    
    await _unitOfWork.BeginTransactionAsync();
    
    try
    {
        var project = new Project
        {
            ProjectName = dto.ProjectName,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = dto.Status,
            ImageUrl = imageUrl,
            ImagePublicId = imagePublicId
        };
        
        // ... rest of the code ...
    }
    catch (Exception ex)
    {
        // Rollback and delete uploaded image if transaction fails
        if (!string.IsNullOrEmpty(imagePublicId))
        {
            await _imageUploadService.DeleteImageAsync(imagePublicId);
        }
        
        await _unitOfWork.RollbackAsync();
        return ApiResponse<int>.ErrorResponse("Failed to create project", 500);
    }
}

// UpdateProjectAsync method
public async Task<ApiResponse<object>> UpdateProjectAsync(int projectId, UpdateProjectDto dto)
{
    // ... existing code ...
    
    // Handle image update
    if (dto.RemoveImage && !string.IsNullOrEmpty(project.ImagePublicId))
    {
        await _imageUploadService.DeleteImageAsync(project.ImagePublicId);
        project.ImageUrl = null;
        project.ImagePublicId = null;
    }
    else if (dto.Image != null)
    {
        // Delete old image if exists
        if (!string.IsNullOrEmpty(project.ImagePublicId))
        {
            await _imageUploadService.DeleteImageAsync(project.ImagePublicId);
        }
        
        // Upload new image
        try
        {
            (project.ImageUrl, project.ImagePublicId) = 
                await _imageUploadService.UploadImageAsync(dto.Image);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackAsync();
            return ApiResponse<object>.ErrorResponse($"Image upload failed: {ex.Message}", 400);
        }
    }
    
    // ... rest of the code ...
}
```

#### 1.8 Register Services
```csharp
// Program.cs or ServiceCollectionExtensions.cs
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("Cloudinary"));
    
builder.Services.AddScoped<IImageUploadService, CloudinaryImageUploadService>();
```

---

### Phase 2: Frontend Changes

#### 2.1 Update Types
```typescript
// types/project.ts
export interface CreateProjectRequest {
  projectName: string
  description: string
  startDate: string
  endDate: string
  status: ProjectStatus
  image?: File // NEW
}

export interface Project {
  id: number
  name: string
  description?: string
  status: string
  createdAt: string
  createdByUserName?: string
  projectManagerName?: string
  siteEngineerName?: string[]
  imageUrl?: string // NEW
}

export interface UpdateProjectRequest {
  projectName?: string
  description?: string
  startDate?: string
  endDate?: string
  status?: ProjectStatus
  remarks?: string
  image?: File // NEW
  removeImage?: boolean // NEW
}
```

#### 2.2 Update API Client
```typescript
// lib/api/projects.ts
export const projectsApi = {
  create: async (data: CreateProjectRequest): Promise<number> => {
    const formData = new FormData()
    formData.append('projectName', data.projectName)
    formData.append('description', data.description)
    formData.append('startDate', data.startDate)
    formData.append('endDate', data.endDate)
    formData.append('status', data.status.toString())
    
    if (data.image) {
      formData.append('image', data.image)
    }
    
    const response = await apiClient.post<ApiResponse<number>>(
      '/projects/create',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data!
  },
  
  update: async (id: number, data: UpdateProjectRequest): Promise<void> => {
    const formData = new FormData()
    
    if (data.projectName) formData.append('projectName', data.projectName)
    if (data.description) formData.append('description', data.description)
    if (data.startDate) formData.append('startDate', data.startDate)
    if (data.endDate) formData.append('endDate', data.endDate)
    if (data.status !== undefined) formData.append('status', data.status.toString())
    if (data.remarks) formData.append('remarks', data.remarks)
    if (data.removeImage) formData.append('removeImage', 'true')
    if (data.image) formData.append('image', data.image)
    
    await apiClient.put<ApiResponse>(`/projects/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
```

#### 2.3 Create Image Upload Component
```typescript
// components/ui/image-upload.tsx
'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './button'

interface ImageUploadProps {
  value?: File | string
  onChange: (file: File | null) => void
  onRemove?: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert('File must be an image')
        return
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      onChange(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onRemove?.()
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            Click to upload project image
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, WEBP up to 5MB
          </p>
        </div>
      )}
    </div>
  )
}
```

#### 2.4 Create Project Modal
```typescript
// components/projects/create-project-modal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { useCreateProject } from '@/lib/hooks/useProjects'
import { ProjectStatus } from '@/types/project'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ProjectStatus.Planned,
    image: null as File | null,
  })

  const createProject = useCreateProject()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createProject.mutateAsync(formData)
      onClose()
      // Reset form
      setFormData({
        projectName: '',
        description: '',
        startDate: '',
        endDate: '',
        status: ProjectStatus.Planned,
        image: null,
      })
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Project Image</Label>
            <ImageUpload
              value={formData.image}
              onChange={(file) => setFormData({ ...formData, image: file })}
            />
          </div>
          
          <div>
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status.toString()}
              onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) })}
            >
              <option value={ProjectStatus.Planned}>Planned</option>
              <option value={ProjectStatus.Active}>Active</option>
              <option value={ProjectStatus.OnHold}>On Hold</option>
            </Select>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

#### 2.5 Update Projects Page
```typescript
// Update projects page to show images in cards
<Card>
  {project.imageUrl && (
    <div className="h-48 overflow-hidden">
      <img
        src={project.imageUrl}
        alt={project.name}
        className="w-full h-full object-cover"
      />
    </div>
  )}
  <CardHeader>
    {/* ... rest of card content ... */}
  </CardHeader>
</Card>
```

---

## Implementation Checklist

### Backend
- [ ] Add Cloudinary NuGet package
- [ ] Add CloudinarySettings class
- [ ] Update appsettings.json with Cloudinary credentials
- [ ] Create IImageUploadService interface
- [ ] Implement CloudinaryImageUploadService
- [ ] Add ImageUrl and ImagePublicId to Project entity
- [ ] Create and run database migration
- [ ] Update CreateProjectDto to accept IFormFile
- [ ] Update UpdateProjectDto to accept IFormFile
- [ ] Update ProjectDto to include ImageUrl
- [ ] Update ProjectsController to use [FromForm]
- [ ] Update ProjectService.CreateAsync to handle image upload
- [ ] Update ProjectService.UpdateProjectAsync to handle image update/delete
- [ ] Register IImageUploadService in DI container
- [ ] Test image upload endpoint
- [ ] Test image delete on project update
- [ ] Test image delete on project deletion

### Frontend
- [ ] Update Project type to include imageUrl
- [ ] Update CreateProjectRequest to include image
- [ ] Update UpdateProjectRequest to include image
- [ ] Update projectsApi.create to use FormData
- [ ] Update projectsApi.update to use FormData
- [ ] Create ImageUpload component
- [ ] Create CreateProjectModal component
- [ ] Update projects page to show "Create Project" button
- [ ] Update project cards to display images
- [ ] Add image preview in project details
- [ ] Test image upload
- [ ] Test image update
- [ ] Test image removal

---

## Testing Plan

### Manual Testing
1. Create project without image - should work
2. Create project with image - should upload to Cloudinary
3. Update project with new image - should replace old image
4. Update project and remove image - should delete from Cloudinary
5. Delete project with image - should delete image from Cloudinary
6. Test file size validation (> 5MB should fail)
7. Test file type validation (non-images should fail)
8. Test image display in project list
9. Test image display in project details

### Edge Cases
- Network failure during upload
- Cloudinary API errors
- Invalid credentials
- Concurrent uploads
- Transaction rollback with uploaded image

---

## Estimated Timeline

- **Backend Implementation**: 4-6 hours
- **Frontend Implementation**: 3-4 hours
- **Testing**: 2-3 hours
- **Total**: 9-13 hours

---

## Cost Estimation

### Cloudinary Free Tier
- 25GB storage
- 25GB bandwidth/month
- ~10,000 images (at 2.5MB average)
- Sufficient for small to medium projects

### Paid Plans (if needed)
- Plus: $89/month (100GB storage, 100GB bandwidth)
- Advanced: $224/month (200GB storage, 200GB bandwidth)

---

## Alternative: Database Storage (If Required)

If you prefer database storage despite the drawbacks:

```csharp
// Project entity
public byte[]? ImageData { get; set; }
public string? ImageContentType { get; set; }

// Controller
[HttpGet("{id}/image")]
public async Task<IActionResult> GetProjectImage(int id)
{
    var project = await _projectService.GetByIdAsync(id);
    if (project?.ImageData == null)
        return NotFound();
    
    return File(project.ImageData, project.ImageContentType);
}
```

But this is NOT recommended for production.

---

## Recommendation

✅ **Use Cloudinary** for the best balance of:
- Performance
- Scalability
- Cost
- Developer experience
- Production readiness

---

## Next Steps

1. Review this plan
2. Provide feedback or suggestions
3. Get Cloudinary account (free tier)
4. I'll implement backend changes
5. I'll implement frontend changes
6. Test thoroughly
7. Deploy

**Ready to proceed?** Let me know if you want to:
- Use Cloudinary (recommended)
- Use database storage
- Use a different cloud provider (AWS S3, Azure Blob, etc.)
- Modify any part of this plan
