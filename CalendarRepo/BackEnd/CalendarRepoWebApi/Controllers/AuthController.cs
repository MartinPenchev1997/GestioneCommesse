using Azure.Core;
using CalendarRepo.Dto.Auth;
using CalendarRepo.Models;
using CalendarRepo.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace CalendarRepo.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _config;
        public AuthController(IUnitOfWork unitOfWork, ITokenService tokenService, IConfiguration config)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _config = config;
        }

        [HttpGet("getall")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(await _unitOfWork.Users.GetAllAsync());

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthRequest request)
        {
            try
            {
                var existingUser = await _unitOfWork.Users.GetByUsernameAsync(request.Username);
                if (existingUser != null)
                    return BadRequest("Username già esistente.");

                var user = new Utenti
                {
                    Username = request.Username,
                    PasswordHash = ComputeHash(request.Password),
                    RefreshToken = "",
                    Role = string.IsNullOrEmpty(request.Role) ? "User" : request.Role
                };

                await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.CompleteAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByUsernameAsync(request.Username);
                if (user == null || user.PasswordHash != ComputeHash(request.Password))
                    return Unauthorized("Credenziali non valide.");

                var token = _tokenService.CreateToken(user);
                var refreshToken = _tokenService.CreateRefreshToken();
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.Now.AddDays(double.Parse(_config["JwtSettings:RefreshTokenLifetimeDays"]));
                _unitOfWork.Users.Update(user);
                await _unitOfWork.CompleteAsync();

                return Ok(new AuthResponse { Token = token, RefreshToken = refreshToken, LoggedUser = request.Username });
            }
            catch (Exception ex)
            {
                return Unauthorized("Credenziali non valide.");
            }

        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] AuthResponse tokenRequest)
        {
            var user = (await _unitOfWork.Users.GetByTokenAsync(tokenRequest.RefreshToken))!;
            if (user == null || user.RefreshToken != tokenRequest.RefreshToken || user.RefreshTokenExpiryTime < DateTime.Now)
                return Unauthorized("Refresh token non valido o scaduto.");

            var newToken = _tokenService.CreateToken(user);
            var newRefreshToken = _tokenService.CreateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.Now.AddDays(double.Parse(_config["JwtSettings:RefreshTokenLifetimeDays"]));
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new AuthResponse { Token = newToken, RefreshToken = newRefreshToken, LoggedUser = tokenRequest.LoggedUser });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var username = User.Identity?.Name;
            var user = await _unitOfWork.Users.GetByUsernameAsync(username);
            if (user == null)
                return Unauthorized();

            // Invalida il refresh token
            user.RefreshToken = "";
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok();
        }

        [HttpDelete("delete/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if(user is null)
                    return BadRequest("Utente non trovato");

                _unitOfWork.Users.Delete(user);
                await _unitOfWork.CompleteAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Funzione di utilità per hashare la password
        private string ComputeHash(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}
