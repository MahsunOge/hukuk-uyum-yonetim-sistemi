using HukukUyum.API.DTOs.Reports;

namespace HukukUyum.API.Interfaces;

public interface IReportService
{
    Task<List<GroupReportDto>> GetGroupReportsAsync();
    Task<ReportSummaryDto> GetSummaryAsync(
        string currentUserId,
        bool canViewAllReports);
}
