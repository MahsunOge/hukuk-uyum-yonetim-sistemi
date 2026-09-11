using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HukukUyum.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskGroupAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedGroupId",
                table: "Tasks",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssignedGroupId",
                table: "Tasks",
                column: "AssignedGroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Groups_AssignedGroupId",
                table: "Tasks",
                column: "AssignedGroupId",
                principalTable: "Groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Groups_AssignedGroupId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_AssignedGroupId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "AssignedGroupId",
                table: "Tasks");
        }
    }
}
