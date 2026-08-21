using System.Globalization;
using System.Text;
using Certeo.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Certeo.Api.Modules.Trainings;

public sealed class SlugGenerator
{
    private readonly CerteoDbContext _context;

    public SlugGenerator(CerteoDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateUniqueSlugAsync(string title, CancellationToken cancellationToken)
    {
        var baseSlug = Slugify(title);
        var candidate = baseSlug;
        var suffix = 1;

        while (await _context.Trainings.AnyAsync(t => t.Slug == candidate, cancellationToken))
        {
            suffix++;
            candidate = $"{baseSlug}-{suffix}";
        }

        return candidate;
    }

    // Slugify method adapted from https://stackoverflow.com/a/29208885
    private static string Slugify(string input)
    {
        var normalized = input.Normalize(NormalizationForm.FormD);
        var withoutDiacritics = new StringBuilder();

        foreach (var ch in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (category != UnicodeCategory.NonSpacingMark)
            {
                withoutDiacritics.Append(ch);
            }
        }

        var lower = withoutDiacritics.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
        var slug = new StringBuilder();
        var lastWasDash = false;

        foreach (var ch in lower)
        {
            if (char.IsLetterOrDigit(ch))
            {
                slug.Append(ch);
                lastWasDash = false;
            }
            else if (!lastWasDash && slug.Length > 0)
            {
                slug.Append('-');
                lastWasDash = true;
            }
        }

        return slug.ToString().Trim('-');
    }
}
