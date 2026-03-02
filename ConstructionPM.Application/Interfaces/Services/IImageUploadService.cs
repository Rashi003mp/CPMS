using Microsoft.AspNetCore.Http;

namespace ConstructionPM.Application.Interfaces.Services
{
    public interface IImageUploadService
    {
        Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string publicId);
    }
}
