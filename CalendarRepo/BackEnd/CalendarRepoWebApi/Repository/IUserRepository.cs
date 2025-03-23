using CalendarRepo.Models;

namespace CalendarRepo.Repository
{
    public interface IUserRepository
    {
        Task<Utenti> GetByUsernameAsync(string username);
        Task<Utenti> GetByTokenAsync(string refreshToken);
        Task<Utenti> GetByIdAsync(int id);
        Task AddAsync(Utenti user);
        void Update(Utenti user);
    }
}
