using HukukUyum.API.Data;
using HukukUyum.API.DTOs.TaskCategories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TaskCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TaskCategoriesController(
        ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<
        List<TaskCategoryResponseDto>>> GetAll()
    {
        var categories =
            await _context.TaskCategories
                .AsNoTracking()
                .Where(category =>
                    category.IsActive)
                .OrderBy(category =>
                    category.Group.Name)
                .ThenBy(category =>
                    category.Name)
                .Select(category =>
                    new TaskCategoryResponseDto
                    {
                        Id =
                            category.Id,

                        Name =
                            category.Name,

                        GroupId =
                            category.GroupId,

                        GroupName =
                            category.Group.Name
                    })
                .ToListAsync();

        return Ok(categories);
    }
}