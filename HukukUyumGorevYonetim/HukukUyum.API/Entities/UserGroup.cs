using HukukUyum.API.Identity;

namespace HukukUyum.API.Entities;

public class UserGroup
{
    public string UserId { get; set; } = string.Empty;

    public ApplicationUser User { get; set; } = null!;


    public int GroupId { get; set; }

    public Group Group { get; set; } = null!;
}