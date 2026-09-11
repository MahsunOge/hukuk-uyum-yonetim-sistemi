using HukukUyum.API.DTOs.Tasks;
using HukukUyum.API.Enums;
using HukukUyum.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IManagerDelegationService _managerDelegationService;

    public TasksController(
        ITaskService taskService,
        IManagerDelegationService managerDelegationService)
    {
        _taskService = taskService;
        _managerDelegationService = managerDelegationService;
    }

    [HttpGet]
    public async Task<
        ActionResult<List<TaskResponseDto>>> GetAll()
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var canViewAllTasks =
            User.IsInRole("Admin");

        var tasks =
            await _taskService.GetAllAsync(
                currentUserId,
                canViewAllTasks);

        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<
        ActionResult<TaskResponseDto>> GetById(
        int id)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var canViewAllTasks =
            User.IsInRole("Admin");

        var task =
            await _taskService.GetByIdAsync(
                id,
                currentUserId,
                canViewAllTasks);

        if (task is null)
        {
            return NotFound(new
            {
                message =
                    "Görev bulunamadı veya bu görevi görüntüleme yetkiniz yok."
            });
        }

        return Ok(task);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<
    ActionResult<TaskResponseDto>> Create(
    CreateTaskDto createTaskDto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        try
        {
            var isAdmin =
                User.IsInRole("Admin");

            if (!isAdmin)
            {
                var accessibleGroupIds =
                    await _managerDelegationService
                        .GetAccessibleGroupIdsAsync(
                            currentUserId);

                if (accessibleGroupIds.Count == 0)
                {
                    return StatusCode(
                        StatusCodes.Status403Forbidden,
                        new
                        {
                            message =
                                "Bu işlem için yönetici veya aktif vekil yetkiniz bulunmuyor."
                        });
                }
            }

            var createdTask =
                await _taskService.CreateAsync(
                    createTaskDto,
                    currentUserId,
                    isAdmin);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = createdTask.Id
                },
                createdTask);
        }
        catch (
            UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        exception.Message
                });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message =
                    exception.Message
            });
        }
    }

    [HttpPost("{id:int}/subtasks")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<
    ActionResult<TaskResponseDto>>
    CreateSubTask(
        int id,
        CreateSubTaskDto createSubTaskDto)
    {
        try
        {
            var currentUserId =
                GetCurrentUserId();

            if (currentUserId is null)
            {
                return Unauthorized(new
                {
                    message =
                        "Oturum açmış kullanıcı bilgisi bulunamadı."
                });
            }

            if (!User.IsInRole("Admin"))
            {
                var parentTask =
                    await _taskService
                        .GetByIdAsync(
                            id,
                            currentUserId,
                            false);

                if (parentTask is null ||
                    !parentTask.AssignedGroupId.HasValue ||
                    !await _managerDelegationService
                        .HasActiveManagerAccessAsync(
                            currentUserId,
                            parentTask.AssignedGroupId.Value))
                {
                    return StatusCode(
                        StatusCodes.Status403Forbidden,
                        new
                        {
                            message =
                                "Bu görev için yönetici veya aktif vekil yetkiniz bulunmuyor."
                        });
                }

                if (!string.IsNullOrWhiteSpace(
                        createSubTaskDto.AssignedUserId))
                {
                    // Service katmanı grup üyeliğini ayrıca doğrular.
                    createSubTaskDto.AssignedGroupId =
                        parentTask.AssignedGroupId;
                }
            }

            var createdSubTask =
                await _taskService
                    .CreateSubTaskAsync(
                        id,
                        createSubTaskDto);

            if (createdSubTask is null)
            {
                return NotFound(new
                {
                    message =
                        "Alt görev eklenecek ana görev bulunamadı."
                });
            }

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = createdSubTask.Id
                },
                createdSubTask);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpGet("{id:int}/subtasks")]
    public async Task<
    ActionResult<List<TaskResponseDto>>>
    GetSubTasks(int id)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var canViewAllTasks =
            User.IsInRole("Admin");

        var parentTask =
            await _taskService.GetByIdAsync(
                id,
                currentUserId,
                canViewAllTasks);

        if (parentTask is null)
        {
            return NotFound(new
            {
                message =
                    "Ana görev bulunamadı veya bu görevi görüntüleme yetkiniz yok."
            });
        }

        var subTasks =
            await _taskService
                .GetSubTasksAsync(
                    id,
                    currentUserId,
                    canViewAllTasks);

        return Ok(subTasks);
    }
    [HttpPost("requests")]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<TaskResponseDto>>
    CreateUserRequest(
        CreateUserRequestDto requestDto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        try
        {
            var createdRequest =
                await _taskService
                    .CreateUserRequestAsync(
                        requestDto,
                        currentUserId);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = createdRequest.Id
                },
                createdRequest);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = exception.Message
                });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }
    [HttpGet("requests/{id:int}")]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<TaskResponseDto>>
    GetUserRequestById(int id)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var request =
            await _taskService
                .GetUserRequestByIdAsync(
                    id,
                    currentUserId);

        if (request is null)
        {
            return NotFound(new
            {
                message =
                    "Talep bulunamadı veya bu talebi görüntüleme yetkiniz yok."
            });
        }

        return Ok(request);
    }
    [HttpGet("my-requests")]
    [Authorize(Roles = "User")]
    public async Task<
        ActionResult<List<TaskResponseDto>>>
        GetMyRequests()
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var requests =
            await _taskService
                .GetMyRequestsAsync(
                    currentUserId);

        return Ok(requests);
    }


    [HttpPut("{id:int}/request")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> UpdateUserRequest(
        int id,
        UpdateUserRequestDto updateUserRequestDto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        try
        {
            var updated =
                await _taskService
                    .UpdateUserRequestAsync(
                        id,
                        updateUserRequestDto,
                        currentUserId);

            if (!updated)
            {
                return NotFound(new
                {
                    message =
                        "Güncellenecek talep bulunamadı veya bu talep size ait değil."
                });
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        exception.Message
                });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateTaskDto updateTaskDto)
    {
        try
        {
            var updated =
                await _taskService.UpdateAsync(
                    id,
                    updateTaskDto,
                    GetCurrentUserId() ?? throw new UnauthorizedAccessException());

            if (!updated)
            {
                return NotFound(new
                {
                    message =
                        "Güncellenecek görev bulunamadı."
                });
            }

            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }
    [HttpPatch("{id:int}/assign-group-member")]
    [Authorize(Roles = "Admin,Manager,Employee")]
    public async Task<IActionResult>
        AssignGroupMember(
            int id,
            AssignGroupTaskDto dto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        try
        {
            var result =
                await _taskService
                    .AssignGroupTaskAsync(
                        id,
                        currentUserId,
                        dto.UserId,
                        User.IsInRole(
                            "Admin"));

            return result switch
            {
                AssignGroupTaskResult.Success =>
                    Ok(new
                    {
                        message =
                            "Görev atama işlemi başarıyla tamamlandı."
                    }),

                AssignGroupTaskResult.TaskNotFound =>
                    NotFound(new
                    {
                        message =
                            "Görev bulunamadı."
                    }),

                AssignGroupTaskResult.NotAssignedToGroup =>
                    BadRequest(new
                    {
                        message =
                            "Görev bir gruba atanmamıştır."
                    }),

                AssignGroupTaskResult.NotGroupManager =>
                    StatusCode(
                        StatusCodes.Status403Forbidden,
                        new
                        {
                            message =
                                "Bu görevin ait olduğu grubun yöneticisi değilsiniz."
                        }),

                AssignGroupTaskResult.UserNotFound =>
                    BadRequest(new
                    {
                        message =
                            "Atanacak kullanıcı bulunamadı."
                    }),

                AssignGroupTaskResult.UserNotInGroup =>
                    BadRequest(new
                    {
                        message =
                            "Seçilen kullanıcı bu grubun üyesi değildir."
                    }),

                AssignGroupTaskResult.AlreadyAssigned =>
                    Conflict(new
                    {
                        message =
                            "Bu görev daha önce bir grup üyesine atanmıştır."
                    }),

                AssignGroupTaskResult.TaskClosed =>
                    BadRequest(new
                    {
                        message =
                            "Tamamlanmış veya iptal edilmiş görev yeniden atanamaz."
                    }),

                _ =>
                    StatusCode(
                        StatusCodes
                            .Status500InternalServerError,
                        new
                        {
                            message =
                                "Görev atanırken beklenmeyen bir hata oluştu."
                        })
            };
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message =
                    exception.Message
            });
        }
    }

    [HttpPost("{id:int}/take")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> TakeTask(
    int id)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        try
        {
            var result =
                await _taskService.TakeTaskAsync(
                    id,
                    currentUserId);

            return result switch
            {
                TakeTaskResult.Success =>
                    Ok(new
                    {
                        message =
                            "Görev başarıyla üzerinize alındı."
                    }),

                TakeTaskResult.TaskNotFound =>
                    NotFound(new
                    {
                        message =
                            "Görev bulunamadı."
                    }),

                TakeTaskResult.NotAssignedToGroup =>
                    BadRequest(new
                    {
                        message =
                            "Bu görev bir gruba atanmamıştır."
                    }),

                TakeTaskResult.UserNotInGroup =>
                    StatusCode(
                        StatusCodes.Status403Forbidden,
                        new
                        {
                            message =
                                "Bu görevin atandığı grubun üyesi değilsiniz."
                        }),

                TakeTaskResult.AlreadyAssignedToUser =>
                    Conflict(new
                    {
                        message =
                            "Bu görev daha önce bir kullanıcı tarafından alınmıştır."
                    }),

                TakeTaskResult.TaskClosed =>
                    BadRequest(new
                    {
                        message =
                            "Tamamlanmış veya iptal edilmiş görev üzerinize alınamaz."
                    }),

                _ =>
                    StatusCode(
                        StatusCodes
                            .Status500InternalServerError,
                        new
                        {
                            message =
                                "Görev üzerinize alınırken beklenmeyen bir hata oluştu."
                        })
            };
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message =
                    exception.Message
            });
        }
    }
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult>
    UpdateStatus(
        int id,
        UpdateTaskStatusDto updateTaskStatusDto)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var result =
            await _taskService.UpdateStatusAsync(
                id,
                currentUserId,
                updateTaskStatusDto.Status);

        return result switch
        {
            UpdateTaskStatusResult.Success =>
                Ok(new
                {
                    message =
                        "Görev durumu başarıyla güncellendi."
                }),

            UpdateTaskStatusResult.TaskNotFound =>
                NotFound(new
                {
                    message =
                        "Görev bulunamadı."
                }),

            UpdateTaskStatusResult.NotAssignedToUser =>
                StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        message =
                            "Yalnızca kendi üzerinize atanmış görevlerin durumunu değiştirebilirsiniz."
                    }),

            UpdateTaskStatusResult.InvalidStatus =>
                BadRequest(new
                {
                    message =
                        "Seçilen görev durumu geçersizdir. Employee görev iptal edemez."
                }),

            _ =>
                StatusCode(
                    StatusCodes
                        .Status500InternalServerError,
                    new
                    {
                        message =
                            "Görev durumu güncellenirken beklenmeyen bir hata oluştu."
                    })
        };
    }
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        int id)
    {
        var deleted =
            await _taskService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message =
                    "Silinecek görev bulunamadı."
            });
        }

        return NoContent();
    }


    [HttpGet("{id:int}/assignment-history")]
    public async Task<
        ActionResult<List<TaskAssignmentHistoryDto>>>
        GetAssignmentHistory(
            int id)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized(new
            {
                message =
                    "Oturum açmış kullanıcı bilgisi bulunamadı."
            });
        }

        var canViewAllTasks =
            User.IsInRole("Admin");

        var task =
            await _taskService.GetByIdAsync(
                id,
                currentUserId,
                canViewAllTasks);

        if (task is null)
        {
            return NotFound(new
            {
                message =
                    "Görev bulunamadı veya bu görevi görüntüleme yetkiniz yok."
            });
        }

        var history =
            await _taskService
                .GetAssignmentHistoryAsync(
                    id,
                    currentUserId,
                    canViewAllTasks);

        return Ok(history);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(
                   ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub")
               ?? User.FindFirstValue("userId")
               ?? User.FindFirstValue("id");
    }
}
