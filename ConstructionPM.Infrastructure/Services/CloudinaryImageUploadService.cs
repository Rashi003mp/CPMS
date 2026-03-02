using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ConstructionPM.Infrastructure.Services
{
    public class CloudinaryImageUploadService : IImageUploadService
    {
        private readonly Cloudinary _cloudinary;
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
        private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/jpg", "image/webp" };

        public CloudinaryImageUploadService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file)
        {
            // Validation
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required");

            if (file.Length > MaxFileSize)
                throw new ArgumentException($"File size exceeds {MaxFileSize / (1024 * 1024)}MB limit");

            if (!AllowedContentTypes.Contains(file.ContentType.ToLower()))
                throw new ArgumentException("Invalid file type. Only JPEG, PNG, and WEBP images are allowed");

            try
            {
                using var stream = file.OpenReadStream();
                
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "construction-projects",
                    Transformation = new Transformation()
                        .Width(1200)
                        .Height(800)
                        .Crop("limit")
                        .Quality("auto")
                        .FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                    throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");

                return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Image upload failed: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId))
                return false;

            try
            {
                var deleteParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deleteParams);
                return result.Result == "ok" || result.Result == "not found";
            }
            catch
            {
                // Log error but don't throw - deletion failure shouldn't break the flow
                return false;
            }
        }
    }
}
