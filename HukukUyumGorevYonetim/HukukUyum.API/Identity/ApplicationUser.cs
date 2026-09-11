using HukukUyum.API.Entities;
using Microsoft.AspNetCore.Identity;

namespace HukukUyum.API.Identity;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } =
        string.Empty;

    public bool MustChangePassword { get; set; } =
        false;

    public ICollection<TaskItem> Tasks
    {
        get;
        set;
    } = new List<TaskItem>();

    public ICollection<Notification> Notifications
    {
        get;
        set;
    } = new List<Notification>();
}