using ConstrictionPM.API.Services;
using ConstructionPM.Application.Interfaces.Auth;
using ConstructionPM.Application.Interfaces.Repositories.Commands;
using ConstructionPM.Application.Interfaces.Repositories.Queries;
using ConstructionPM.Application.Interfaces.Services;
using ConstructionPM.Application.Interfaces.UoW;
using ConstructionPM.Application.Services;
using ConstructionPM.Application.Validators.Common;
using ConstructionPM.Application.Validators.Implimentations;
using ConstructionPM.Application.Validators.Interface;
using ConstructionPM.Domain.Entities;
using ConstructionPM.Infrastructure.Auth;
using ConstructionPM.Infrastructure.Dapper;
using ConstructionPM.Infrastructure.Persistence;
using ConstructionPM.Infrastructure.Repositories.Commands;
using ConstructionPM.Infrastructure.Repositories.Quaries;
using ConstructionPM.Infrastructure.UoW;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace ConstructionPM.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // ---------- Database ----------
            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));

            services.AddSingleton(new DapperContext(connectionString!));

            //IDbConnection for Dapper 
            services.AddScoped<IDbConnection>(sp => new SqlConnection(connectionString));

            // ---------- Repositories ----------
            services.AddScoped<IProjectAssignmentQueryRepository, ProjectAssignmentQueryRepository>();
            services.AddScoped<IUserCommandRepository, UserCommandRepository>();
            services.AddScoped<IUserQueryRepository, UserQueryRepository>();
            services.AddScoped<IRegistrationCommandRepository, RegistrationCommandRepository>();
            services.AddScoped<IRegistrationQueryRepository, RegistrationQueryRepository>();
            services.AddScoped<IProjectCommandRepository, ProjectCommandRepository>();
            services.AddScoped<IProjectQueryRepository, ProjectQueryRepository>();
            services.AddScoped<IProjectStatusHistoryCommandRepository,ProjectStatusHistoryCommandRepository >();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserCountQuery,UserCountQuery>();

            // validators
            services.AddScoped<ICommonValidator, CommonValidator>();
            services.AddScoped<IRegistrationValidator, RegistrationValidator>();
            services.AddScoped<IAdminUserSetupValidator, AdminUserSetupValidator>();

            // ---------- Unit of Work ----------
            services.AddScoped<IUnitOfWork,UnitOfWork>();

            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));


            // ---------- Services ----------
            services.AddScoped<IRegistrationService, RegistrationService>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddScoped<IAdminApprovalService, AdminApprovalService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IPasswordRecoveryService, PasswordRecoveryService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IProjectService, ProjectService>();
            services.AddScoped<IProjectUsersService, ProjectUsersService>();
            services.AddScoped<IUserService, UserService>();


            // ---------- Security ----------
            services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

            // ---------- JWT ----------
            services.AddSingleton<IJwtTokenGenerator>(
                new JwtTokenGenerator(configuration["Jwt:Secret"]!)
            );

            return services;
        }
    }
}
