using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TAIF.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Intial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Users_UserId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonItems_lessons_LessonId",
                table: "LessonItems");

            migrationBuilder.DropForeignKey(
                name: "FK_lessons_Courses_CourseId",
                table: "lessons");

            migrationBuilder.DropIndex(
                name: "IX_lessons_CourseId_IsDeleted",
                table: "lessons");

            migrationBuilder.DropIndex(
                name: "IX_LessonItems_LessonId_IsDeleted",
                table: "LessonItems");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "LessonItems");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "lessons",
                newName: "TotalLessonItems");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "lessons",
                newName: "CreatedByUserId");

            migrationBuilder.RenameColumn(
                name: "LessonId",
                table: "LessonItems",
                newName: "CreatedByUserId");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Courses",
                newName: "CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_UserId",
                table: "Courses",
                newName: "IX_Courses_CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_OrganizationId_UserId",
                table: "Courses",
                newName: "IX_Courses_OrganizationId_CreatedByUserId");

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "UserLearningPathProgress",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "UserCourseBehaviors",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Tags",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Reviews",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "lessons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstructorBio",
                table: "lessons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstructorName",
                table: "lessons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstructorPhoto",
                table: "lessons",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "lessons",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalDurationInSeconds",
                table: "lessons",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "LessonItems",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "LessonItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "LessonItems",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "LessonItemProgress",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "LearningPathSections",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "LearningPaths",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "LearningPathCourses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "InterestTagMappings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Interests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Enrollments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalLessons",
                table: "Courses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CourseLessons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LessonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseLessons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseLessons_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseLessons_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CourseLessons_lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LessonLessonItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LessonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LessonItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonLessonItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonLessonItems_LessonItems_LessonItemId",
                        column: x => x.LessonItemId,
                        principalTable: "LessonItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonLessonItems_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LessonLessonItems_lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Options = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CorrectAnswerIndex = table.Column<int>(type: "int", nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    LessonItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_LessonItems_LessonItemId",
                        column: x => x.LessonItemId,
                        principalTable: "LessonItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Questions_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "RichContents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LessonItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RichContents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RichContents_LessonItems_LessonItemId",
                        column: x => x.LessonItemId,
                        principalTable: "LessonItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RichContents_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Videos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationInSeconds = table.Column<double>(type: "float", nullable: false),
                    LessonItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Videos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Videos_LessonItems_LessonItemId",
                        column: x => x.LessonItemId,
                        principalTable: "LessonItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Videos_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserLearningPathProgress_OrganizationId",
                table: "UserLearningPathProgress",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCourseBehaviors_OrganizationId",
                table: "UserCourseBehaviors",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_OrganizationId",
                table: "Tags",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_OrganizationId",
                table: "Reviews",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_CreatedByUserId",
                table: "lessons",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_OrganizationId",
                table: "lessons",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_OrganizationId_IsDeleted",
                table: "lessons",
                columns: new[] { "OrganizationId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_LessonItems_CreatedByUserId",
                table: "LessonItems",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonItems_OrganizationId",
                table: "LessonItems",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonItems_OrganizationId_IsDeleted",
                table: "LessonItems",
                columns: new[] { "OrganizationId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_LessonItemProgress_OrganizationId",
                table: "LessonItemProgress",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningPathSections_OrganizationId",
                table: "LearningPathSections",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningPaths_OrganizationId",
                table: "LearningPaths",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningPathCourses_OrganizationId",
                table: "LearningPathCourses",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_InterestTagMappings_OrganizationId",
                table: "InterestTagMappings",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Interests_OrganizationId",
                table: "Interests",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_OrganizationId",
                table: "Enrollments",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseLessons_CourseId_LessonId",
                table: "CourseLessons",
                columns: new[] { "CourseId", "LessonId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseLessons_CourseId_Order",
                table: "CourseLessons",
                columns: new[] { "CourseId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_CourseLessons_LessonId",
                table: "CourseLessons",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseLessons_OrganizationId",
                table: "CourseLessons",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonLessonItems_LessonId_LessonItemId",
                table: "LessonLessonItems",
                columns: new[] { "LessonId", "LessonItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LessonLessonItems_LessonId_Order",
                table: "LessonLessonItems",
                columns: new[] { "LessonId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_LessonLessonItems_LessonItemId",
                table: "LessonLessonItems",
                column: "LessonItemId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonLessonItems_OrganizationId",
                table: "LessonLessonItems",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_LessonItemId_Order",
                table: "Questions",
                columns: new[] { "LessonItemId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_OrganizationId",
                table: "Questions",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_RichContents_LessonItemId",
                table: "RichContents",
                column: "LessonItemId",
                unique: true,
                filter: "[LessonItemId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RichContents_OrganizationId",
                table: "RichContents",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_LessonItemId",
                table: "Videos",
                column: "LessonItemId",
                unique: true,
                filter: "[LessonItemId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_OrganizationId",
                table: "Videos",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Users_CreatedByUserId",
                table: "Courses",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_Organizations_OrganizationId",
                table: "Enrollments",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Interests_Organizations_OrganizationId",
                table: "Interests",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InterestTagMappings_Organizations_OrganizationId",
                table: "InterestTagMappings",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LearningPathCourses_Organizations_OrganizationId",
                table: "LearningPathCourses",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LearningPaths_Organizations_OrganizationId",
                table: "LearningPaths",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LearningPathSections_Organizations_OrganizationId",
                table: "LearningPathSections",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonItemProgress_Organizations_OrganizationId",
                table: "LessonItemProgress",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonItems_Organizations_OrganizationId",
                table: "LessonItems",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonItems_Users_CreatedByUserId",
                table: "LessonItems",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_lessons_Organizations_OrganizationId",
                table: "lessons",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_lessons_Users_CreatedByUserId",
                table: "lessons",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Organizations_OrganizationId",
                table: "Reviews",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Organizations_OrganizationId",
                table: "Tags",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserCourseBehaviors_Organizations_OrganizationId",
                table: "UserCourseBehaviors",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserLearningPathProgress_Organizations_OrganizationId",
                table: "UserLearningPathProgress",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Users_CreatedByUserId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_Organizations_OrganizationId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Interests_Organizations_OrganizationId",
                table: "Interests");

            migrationBuilder.DropForeignKey(
                name: "FK_InterestTagMappings_Organizations_OrganizationId",
                table: "InterestTagMappings");

            migrationBuilder.DropForeignKey(
                name: "FK_LearningPathCourses_Organizations_OrganizationId",
                table: "LearningPathCourses");

            migrationBuilder.DropForeignKey(
                name: "FK_LearningPaths_Organizations_OrganizationId",
                table: "LearningPaths");

            migrationBuilder.DropForeignKey(
                name: "FK_LearningPathSections_Organizations_OrganizationId",
                table: "LearningPathSections");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonItemProgress_Organizations_OrganizationId",
                table: "LessonItemProgress");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonItems_Organizations_OrganizationId",
                table: "LessonItems");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonItems_Users_CreatedByUserId",
                table: "LessonItems");

            migrationBuilder.DropForeignKey(
                name: "FK_lessons_Organizations_OrganizationId",
                table: "lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_lessons_Users_CreatedByUserId",
                table: "lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Organizations_OrganizationId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Organizations_OrganizationId",
                table: "Tags");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCourseBehaviors_Organizations_OrganizationId",
                table: "UserCourseBehaviors");

            migrationBuilder.DropForeignKey(
                name: "FK_UserLearningPathProgress_Organizations_OrganizationId",
                table: "UserLearningPathProgress");

            migrationBuilder.DropTable(
                name: "CourseLessons");

            migrationBuilder.DropTable(
                name: "LessonLessonItems");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "RichContents");

            migrationBuilder.DropTable(
                name: "Videos");

            migrationBuilder.DropIndex(
                name: "IX_UserLearningPathProgress_OrganizationId",
                table: "UserLearningPathProgress");

            migrationBuilder.DropIndex(
                name: "IX_UserCourseBehaviors_OrganizationId",
                table: "UserCourseBehaviors");

            migrationBuilder.DropIndex(
                name: "IX_Tags_OrganizationId",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_OrganizationId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_lessons_CreatedByUserId",
                table: "lessons");

            migrationBuilder.DropIndex(
                name: "IX_lessons_OrganizationId",
                table: "lessons");

            migrationBuilder.DropIndex(
                name: "IX_lessons_OrganizationId_IsDeleted",
                table: "lessons");

            migrationBuilder.DropIndex(
                name: "IX_LessonItems_CreatedByUserId",
                table: "LessonItems");

            migrationBuilder.DropIndex(
                name: "IX_LessonItems_OrganizationId",
                table: "LessonItems");

            migrationBuilder.DropIndex(
                name: "IX_LessonItems_OrganizationId_IsDeleted",
                table: "LessonItems");

            migrationBuilder.DropIndex(
                name: "IX_LessonItemProgress_OrganizationId",
                table: "LessonItemProgress");

            migrationBuilder.DropIndex(
                name: "IX_LearningPathSections_OrganizationId",
                table: "LearningPathSections");

            migrationBuilder.DropIndex(
                name: "IX_LearningPaths_OrganizationId",
                table: "LearningPaths");

            migrationBuilder.DropIndex(
                name: "IX_LearningPathCourses_OrganizationId",
                table: "LearningPathCourses");

            migrationBuilder.DropIndex(
                name: "IX_InterestTagMappings_OrganizationId",
                table: "InterestTagMappings");

            migrationBuilder.DropIndex(
                name: "IX_Interests_OrganizationId",
                table: "Interests");

            migrationBuilder.DropIndex(
                name: "IX_Enrollments_OrganizationId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "UserLearningPathProgress");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "UserCourseBehaviors");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "InstructorBio",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "InstructorName",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "InstructorPhoto",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "TotalDurationInSeconds",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "LessonItems");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "LessonItems");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "LessonItemProgress");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "LearningPathSections");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "LearningPaths");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "LearningPathCourses");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "InterestTagMappings");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Interests");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "TotalLessons",
                table: "Courses");

            migrationBuilder.RenameColumn(
                name: "TotalLessonItems",
                table: "lessons",
                newName: "Order");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "lessons",
                newName: "CourseId");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "LessonItems",
                newName: "LessonId");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "Courses",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_OrganizationId_CreatedByUserId",
                table: "Courses",
                newName: "IX_Courses_OrganizationId_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_CreatedByUserId",
                table: "Courses",
                newName: "IX_Courses_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "LessonItems",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "LessonItems",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_lessons_CourseId_IsDeleted",
                table: "lessons",
                columns: new[] { "CourseId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_LessonItems_LessonId_IsDeleted",
                table: "LessonItems",
                columns: new[] { "LessonId", "IsDeleted" });

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Users_UserId",
                table: "Courses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonItems_lessons_LessonId",
                table: "LessonItems",
                column: "LessonId",
                principalTable: "lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_lessons_Courses_CourseId",
                table: "lessons",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
