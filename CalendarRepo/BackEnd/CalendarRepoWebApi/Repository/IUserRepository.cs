using CalendarRepo.Dto.Auth;
using CalendarRepo.Models;

namespace CalendarRepo.Repository
{
    public interface IUserRepository
    {
        Task<List<UserDto>> GetAllAsync();
        Task<Utenti> GetByUsernameAsync(string username);
        Task<Utenti> GetByTokenAsync(string refreshToken);
        Task<Utenti> GetByIdAsync(int id);
        Task AddAsync(Utenti user);
        void Update(Utenti user);
        void Delete(Utenti user);
    }
}
