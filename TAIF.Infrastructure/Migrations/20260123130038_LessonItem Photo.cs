using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TAIF.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LessonItemPhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Photo",
                table: "lessons",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Photo",
                table: "lessons");
        }
    }
}
