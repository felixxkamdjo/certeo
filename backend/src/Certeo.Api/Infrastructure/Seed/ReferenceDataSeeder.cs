using Certeo.Api.Common;
using Certeo.Api.Modules.Identity;
using Certeo.Api.Modules.MasterData;
using Microsoft.EntityFrameworkCore;

namespace Certeo.Api.Infrastructure.Seed;

public static class ReferenceDataSeeder
{
    public static async Task SeedAsync(CerteoDbContext context)
    {
        await SeedRolesAsync(context);
        await SeedReferenceDataAsync(context);
        await SeedSuperAdminAsync(context);
    }

    private static async Task SeedRolesAsync(CerteoDbContext context)
    {
        if (await context.Roles.AnyAsync())
        {
            return;
        }

        var roles = new[]
        {
            new Role { Name = RoleName.SUPER_ADMIN, Description = "Full access, can create other administrators" },
            new Role { Name = RoleName.ADMIN, Description = "Standard administrator" },
            new Role { Name = RoleName.TRAINER, Description = "Manages trainings, evaluations and participants" },
            new Role { Name = RoleName.RECEPTIONIST, Description = "Reception / entry management only" },
        };

        context.Roles.AddRange(roles);
        await context.SaveChangesAsync();
    }

    private static async Task SeedReferenceDataAsync(CerteoDbContext context)
    {
        if (await context.ReferenceData.AnyAsync())
        {
            return;
        }

        var entries = new List<ReferenceData>();

        entries.AddRange(Build(ReferenceType.CATEGORY, new[]
        {
            ("web-dev", "Développement Web"),
            ("data-science", "Data Science & IA"),
            ("ux-ui", "Design UX/UI"),
            ("cybersecurity", "Cybersécurité"),
        }));

        entries.AddRange(Build(ReferenceType.GENDER, new[]
        {
            ("male", "Homme"),
            ("female", "Femme"),
        }));

        entries.AddRange(Build(ReferenceType.EDUCATION_LEVEL, new[]
        {
            ("secondary", "Niveau secondaire"),
            ("bachelor", "Licence / Bachelor"),
            ("master", "Master"),
            ("phd", "Doctorat"),
            ("other", "Autre"),
        }));

        entries.AddRange(Build(ReferenceType.ATTENDANCE_REASON, new[]
        {
            ("training", "Formation"),
            ("inquiry", "Renseignement"),
            ("event", "Événement"),
            ("challenge", "Challenge"),
            ("coworking", "Accès coworking"),
            ("meeting", "Réunion"),
            ("intern", "Stagiaire"),
            ("other", "Autre motif"),
        }));

        entries.AddRange(Build(ReferenceType.AGE_GROUP, new[]
        {
            ("under-18", "- 18 ans"),
            ("18-25", "18 - 25 ans"),
            ("26-35", "26 - 35 ans"),
            ("36-45", "36 - 45 ans"),
            ("45-plus", "45+ ans"),
        }));

        entries.AddRange(Build(ReferenceType.VISITOR_PROFILE, new[]
        {
            ("student", "Étudiant"),
            ("employee", "Salarié"),
            ("entrepreneur", "Entrepreneur"),
            ("job-seeker", "Chercheur d'emploi"),
            ("retired", "Retraité"),
            ("other", "Autre"),
        }));

        entries.AddRange(Build(ReferenceType.ODC_DISCOVERY_SOURCE, new[]
        {
            ("social-media", "Réseaux sociaux"),
            ("word-of-mouth", "Bouche à oreille"),
            ("website", "Site web ODC"),
            ("partner", "Partenaire"),
            ("other", "Autre"),
        }));

        context.ReferenceData.AddRange(entries);
        await context.SaveChangesAsync();

        static IEnumerable<ReferenceData> Build(ReferenceType type, (string Code, string Label)[] items)
        {
            var order = 0;
            foreach (var (code, label) in items)
            {
                yield return new ReferenceData
                {
                    Type = type,
                    Code = code,
                    Label = label,
                    IsActive = true,
                    Order = order++,
                };
            }
        }
    }

    private static async Task SeedSuperAdminAsync(CerteoDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return;
        }

        var superAdminRole = await context.Roles.SingleAsync(r => r.Name == RoleName.SUPER_ADMIN);

        var superAdmin = new User
        {
            FirstName = "Admin",
            LastName = "CERTEO",
            Email = "admin@certeo.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("ChangeMe123!"),
            RoleId = superAdminRole.Id,
            IsActive = true,
        };

        context.Users.Add(superAdmin);
        await context.SaveChangesAsync();
    }
}