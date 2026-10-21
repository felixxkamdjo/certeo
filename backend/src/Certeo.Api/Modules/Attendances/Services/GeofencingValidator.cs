namespace Certeo.Api.Modules.Attendance.Services;

public static class GeofencingValidator
{
    // Define ODC Douala center latitude coordinate
    private const double CenterLatitude = 4.051056;

    // Define ODC Douala center longitude coordinate
    private const double CenterLongitude = 9.767869;

    // Define maximum authorized perimeter radius in meters
    private const double AllowedRadiusMeters = 150.0;

    // Validate geolocation coordinates against central coordinates
    public static (double DistanceMeters, bool IsValid) ValidatePosition(double latitude, double longitude)
    {
        const double earthRadiusKm = 6371.0;

        double dLat = DegreesToRadians(latitude - CenterLatitude);
        double dLon = DegreesToRadians(longitude - CenterLongitude);

        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(DegreesToRadians(CenterLatitude)) * Math.Cos(DegreesToRadians(latitude)) *
                   Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        double distanceMeters = Math.Round(earthRadiusKm * c * 1000.0, 2);

        // Check if computed distance falls within allowed threshold
        return (distanceMeters, distanceMeters <= AllowedRadiusMeters);
    }

    // Convert decimal degrees value into radians
    private static double DegreesToRadians(double degrees) => degrees * (Math.PI / 180.0);
}