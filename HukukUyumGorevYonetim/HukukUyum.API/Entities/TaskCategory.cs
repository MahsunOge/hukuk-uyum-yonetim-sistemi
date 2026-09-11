namespace HukukUyum.API.Entities;

public class TaskCategory
{
    public int Id { get; set; }

    public string Name { get; set; } =
        string.Empty;

    public bool IsActive { get; set; } =
        true;

    public int GroupId { get; set; }

    public Group Group { get; set; } =
        null!;
}