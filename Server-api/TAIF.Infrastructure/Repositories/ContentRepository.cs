using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Domain.Entities;
using TAIF.Infrastructure.Data;

namespace TAIF.Infrastructure.Repositories
{
    public class ContentRepository : RepositoryBase<Content>, IContentRepository
    {
        public ContentRepository(TaifDbContext context) : base(context)
        {

        }
    }
}
