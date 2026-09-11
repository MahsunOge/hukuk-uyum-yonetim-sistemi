using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HukukUyum.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskCategoryToRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TaskCategoryId",
                table: "Tasks",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TaskCategoryId",
                table: "Tasks",
                column: "TaskCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_TaskCategories_TaskCategoryId",
                table: "Tasks",
                column: "TaskCategoryId",
                principalTable: "TaskCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_TaskCategories_TaskCategoryId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_TaskCategoryId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TaskCategoryId",
                table: "Tasks");
        }
    }
}
