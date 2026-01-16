using ConstructionPM.API.Extensions;
using ConstructionPM.API.Middleware;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---------- Configurations ----------
builder.Services.AddAppConfigurations(builder.Configuration);

// ---------- Controllers & JSON ----------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()
        );
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token ",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// ---------- Auth ----------
builder.Services.AddJwtAuthentication(builder.Configuration);

// ---------- Application DI ----------
builder.Services.AddApplicationServices(builder.Configuration);

// ---------- HttpContext ----------
builder.Services.AddHttpContextAccessor();

// ---------- Build ----------
var app = builder.Build();

//
app.UseMiddleware<ExceptionHandlerMiddleware>();

// ---------- Middleware ----------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();