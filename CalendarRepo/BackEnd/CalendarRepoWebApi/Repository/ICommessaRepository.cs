using CalendarRepo.Models;

namespace CalendarRepo.Repository
{
    public interface ICommessaRepository
    {
        Task<Commessa> GetByIdAsync(int id);
        Task AddAsync(Commessa commessa);
        Task AddRangeAsync(List<Commessa> commessa);
        void Update(Commessa commessa);
        void Delete(Commessa commessa);
        List<Commessa> GetAll();
    }
}
