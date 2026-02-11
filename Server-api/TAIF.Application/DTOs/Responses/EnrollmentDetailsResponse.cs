namespace TAIF.Application.DTOs.Responses
{
    public class EnrollmentDetailsResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid CourseId { get; set; }
        public DateTime EnrolledAt { get; set; }
        public bool IsFavourite { get; set; }
        public Guid? LastLessonItemId { get; set; }
        public double CompletedDurationInSeconds { get; set; }
    }
}