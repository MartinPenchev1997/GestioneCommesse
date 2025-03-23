using CalendarRepo.Models;

namespace CalendarRepo.Repository
{
    public interface ITokenService
    {
        string CreateToken(Utenti user);
        string CreateRefreshToken();
    }
}
