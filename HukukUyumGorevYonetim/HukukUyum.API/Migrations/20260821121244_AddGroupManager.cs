using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HukukUyum.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupManager : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ManagerUserId",
                table: "Groups",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Groups_ManagerUserId",
                table: "Groups",
                column: "ManagerUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_AspNetUsers_ManagerUserId",
                table: "Groups",
                column: "ManagerUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Groups_AspNetUsers_ManagerUserId",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_Groups_ManagerUserId",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "ManagerUserId",
                table: "Groups");
        }
    }
}
