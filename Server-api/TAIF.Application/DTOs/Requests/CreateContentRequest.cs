using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateContentRequest
    {
        public LessonItemType  Type { get; set; }
        public Video? Video { get; set; }
        public RichText? RichText { get; set; }
        public Quiz? Quiz { get; set; }
        public Guid? OrganizationId { get; set; } // Only SuperAdmin can set this
    }
}
