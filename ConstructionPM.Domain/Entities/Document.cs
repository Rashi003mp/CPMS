using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConstructionPM.Domain.Entities
{
    public class Document : BaseEntity
    {
        public string DocumentName { get; set; } = null!;

        public string FileType { get; set; } = null!;

        public string FilePath { get; set; } = null!;

        public int ProjectId { get; set; }

        public int UploadedByUserId { get; set; }
    }

}
