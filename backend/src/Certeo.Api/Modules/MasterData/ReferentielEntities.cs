using Certeo.Api.Common;

namespace Certeo.Api.Modules.MasterData;

// A single generic table for all configurable lookup value lists
// (Settings > Master Data): Categories, Genders, Education Levels, Visit Reasons,
// Age Ranges, Visitor Profiles, ODC Discovery Sources.
// Avoids creating a dozen nearly identical small tables.
public sealed class ReferenceData : EntityBase
{
    public required ReferenceType Type { get; set; }
    public required string Code { get; set; }     // stable technical value, e.g. "under_18"
    public required string Label { get; set; }    // displayed text, e.g. "Under 18"
    public bool IsActive { get; set; } = true;
    public int Order { get; set; } = 0;
}