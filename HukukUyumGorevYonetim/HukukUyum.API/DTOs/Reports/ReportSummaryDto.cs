namespace HukukUyum.API.DTOs.Reports;

public class ReportSummaryDto
{
    public int OnHoldTasks { get; set; }
    public int CriticalPriorityTasks { get; set; }
    public int AwaitingAssignmentTasks { get; set; }
    public int ActiveTasks => NewTasks + InProgressTasks + OnHoldTasks;
    public int TotalTasks { get; set; }

    public int NewTasks { get; set; }

    public int InProgressTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int CancelledTasks { get; set; }

    public int OverdueTasks { get; set; }

    public int LowPriorityTasks { get; set; }

    public int MediumPriorityTasks { get; set; }

    public int HighPriorityTasks { get; set; }

    public int UserAssignedTasks { get; set; }

    public int GroupAssignedTasks { get; set; }
}
