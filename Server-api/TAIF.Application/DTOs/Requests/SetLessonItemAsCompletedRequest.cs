using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.DTOs.Requests
{
    public record SetLessonItemAsCompletedRequest
    {

        [Required]
        public Guid CourseId { get; set; }

        [Required]
        public Guid LessonItemId { get; set; }
    }
}
