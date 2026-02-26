namespace TAIF.Domain.Entities
{
    public static class Enums
    {
        public enum LessonItemType
        {
            Video = 0,
            RichText = 1,
            Quiz = 2,
        }

        public enum CourseStatus
        {
            Draft = 0,
            Published = 1,
            Archived = 2,
        }
    }
}
