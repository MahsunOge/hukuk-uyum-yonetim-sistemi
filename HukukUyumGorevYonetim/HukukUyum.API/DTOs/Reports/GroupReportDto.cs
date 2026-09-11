namespace HukukUyum.API.DTOs.Reports;

public class GroupReportDto
{
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public string? ManagerName { get; set; }
    public int MemberCount { get; set; }
    public ReportSummaryDto Summary { get; set; } = new();
    public List<GroupReportMemberDto> Members { get; set; } = new();
}

public class GroupReportMemberDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsCurrentMember { get; set; }
    public int ActiveTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
}
