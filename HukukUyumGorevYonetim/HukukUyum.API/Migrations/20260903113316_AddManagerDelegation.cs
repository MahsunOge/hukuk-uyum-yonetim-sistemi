using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HukukUyum.API.Migrations
{
    /// <inheritdoc />
    public partial class AddManagerDelegation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GroupManagerDelegations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    OriginalManagerUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DelegateUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupManagerDelegations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupManagerDelegations_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupManagerDelegations_AspNetUsers_DelegateUserId",
                        column: x => x.DelegateUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupManagerDelegations_AspNetUsers_OriginalManagerUserId",
                        column: x => x.OriginalManagerUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupManagerDelegations_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroupManagerDelegations_CreatedByUserId",
                table: "GroupManagerDelegations",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupManagerDelegations_DelegateUserId_StartDate_EndDate",
                table: "GroupManagerDelegations",
                columns: new[] { "DelegateUserId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_GroupManagerDelegations_GroupId_IsActive",
                table: "GroupManagerDelegations",
                columns: new[] { "GroupId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_GroupManagerDelegations_OriginalManagerUserId_StartDate_EndDate",
                table: "GroupManagerDelegations",
                columns: new[] { "OriginalManagerUserId", "StartDate", "EndDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GroupManagerDelegations");
        }
    }
}
