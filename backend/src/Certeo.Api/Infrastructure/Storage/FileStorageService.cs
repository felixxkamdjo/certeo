using Certeo.Api.Common;

namespace Certeo.Api.Infrastructure.Storage;

public interface IFileStorageService
{
    // Saves a file to the storage and returns the relative path where it was saved.
    Task<string> SaveAsync(Stream fileStream, string originalFileName, string subFolder, CancellationToken cancellationToken = default);

    void Delete(string relativePath);
    string GetPublicUrl(string relativePath);
}

public sealed class LocalFileStorageService : IFileStorageService
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    private readonly string _rootPath;

    public LocalFileStorageService(IConfiguration configuration)
    {
        _rootPath = Path.GetFullPath(configuration["Storage:RootPath"] ?? "/app/uploads");
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveAsync(
        Stream fileStream, string originalFileName, string subFolder, CancellationToken cancellationToken = default)
    {
        if (fileStream is null || fileStream.Length == 0)
        {
            throw new DomainValidationException("Le fichier est vide ou manquant.");
        }

        if (fileStream.Length > MaxFileSizeBytes)
        {
            throw new DomainValidationException("Le fichier dépasse la taille maximale autorisée par le stockage.");
        }

        if (string.IsNullOrWhiteSpace(subFolder) || subFolder.Contains("..") || Path.IsPathRooted(subFolder))
        {
            throw new ArgumentException("Sous-dossier de stockage invalide.", nameof(subFolder));
        }

        var extension = Path.GetExtension(originalFileName);
        var targetDir = Path.Combine(_rootPath, subFolder);
        Directory.CreateDirectory(targetDir);

        // filename generated as a GUID to avoid collisions and ensure uniqueness
        var fileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(targetDir, fileName);

        if (fileStream.CanSeek)
        {
            fileStream.Position = 0;
        }

        await using (var output = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
        {
            await fileStream.CopyToAsync(output, cancellationToken);
        }

        // relative path (ex: "cvs/<guid>.pdf")
        return Path.Combine(subFolder, fileName).Replace("\\", "/");
    }

    public void Delete(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            return;
        }

        var fullPath = Path.Combine(_rootPath, relativePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    public string GetPublicUrl(string relativePath) => $"/uploads/{relativePath.Replace("\\", "/")}";
}