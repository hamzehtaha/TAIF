namespace TAIF.Application.Services
{
    /// <summary>
    /// Configuration for the recommendation engine.
    /// To add a new event type: 1) Add to BehaviorEventType enum 2) Add config to EventConfigs
    /// </summary>
    public static class RecommendationConfig
    {
        public const int DefaultRecommendationCount = 10;
        public const int MaxRecommendationCount = 50;
        
        // Behavior factor constraints
        public const double MinBehaviorFactor = 0.7;
        public const double MaxBehaviorFactor = 1.8;
        
        // Decay settings
        public const double DaysPerMonth = 30.0;
        public const double GlobalMonthlyDecayRate = 0.15; // 15% decay per month on stored scores

        /// <summary>
        /// Event configurations: effect strength and whether it's positive/negative
        /// </summary>
        public static readonly Dictionary<BehaviorEventType, EventConfig> EventConfigs = new()
        {
            // Positive events (boost recommendations for similar courses)
            { BehaviorEventType.CourseViewed, new EventConfig(0.1) },
            { BehaviorEventType.CourseEnrolled, new EventConfig(0.5) },
            { BehaviorEventType.LessonCompleted, new EventConfig(0.3) },
            { BehaviorEventType.CourseCompleted, new EventConfig(1.0) },
            { BehaviorEventType.CourseLiked, new EventConfig(0.4) },
            
            // Negative events (reduce recommendations for this course)
            { BehaviorEventType.CourseSkipped, new EventConfig(-0.2) },
            { BehaviorEventType.CourseDisliked, new EventConfig(-0.5) },
        };

        public static EventConfig GetConfig(BehaviorEventType eventType)
        {
            return EventConfigs.TryGetValue(eventType, out var config) 
                ? config 
                : new EventConfig(0.0);
        }

        /// <summary>
        /// Applies time decay to a behavior score.
        /// Score decays by GlobalMonthlyDecayRate per month.
        /// </summary>
        public static double ApplyDecay(double score, DateTime lastUpdated)
        {
            var daysElapsed = (DateTime.UtcNow - lastUpdated).TotalDays;
            var monthsElapsed = daysElapsed / DaysPerMonth;
            return score * Math.Pow(1 - GlobalMonthlyDecayRate, monthsElapsed);
        }
    }

    public class EventConfig
    {
        /// <summary>
        /// Effect magnitude. Positive = boost, Negative = suppress.
        /// </summary>
        public double Effect { get; }

        public EventConfig(double effect)
        {
            Effect = effect;
        }
    }

    /// <summary>
    /// Types of behavior events that affect recommendations.
    /// Trigger these from controllers when user interactions occur.
    /// </summary>
    public enum BehaviorEventType
    {
        // Positive signals
        CourseViewed,
        CourseEnrolled,
        LessonCompleted,
        CourseCompleted,
        CourseLiked,
        
        // Negative signals
        CourseSkipped,
        CourseDisliked
    }
}
