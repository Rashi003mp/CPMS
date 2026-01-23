using System;

namespace ConstructionPM.Application.Exception
{
    public class ApplicationFailureException : System.Exception
    {
        public ApplicationFailureException(string message, System.Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
