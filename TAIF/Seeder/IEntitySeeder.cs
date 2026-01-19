using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.API.Seeder
{
    public interface IEntitySeeder
    {
        Task SeedAsync();
    }
}
