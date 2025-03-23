using CalendarRepo.Models;
using CalendarRepo.Repository;
using Microsoft.EntityFrameworkCore;

namespace CalendarRepo.Database.DbRepository
{
    public class CommessaRepository : ICommessaRepository
    {
        private readonly AppDbContext _context;
        public CommessaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Commessa commessa)
        {
            await _context.Commesse.AddAsync(commessa);
        }
        
        public async Task AddRangeAsync(List<Commessa> commesse)
        {
            await _context.Commesse.AddRangeAsync(commesse);
        }

        public async Task<Commessa> GetByIdAsync(int id)
        {
            return await _context.Commesse.FirstOrDefaultAsync(u => u.Id == Convert.ToInt64(id));
        }

        public void Update(Commessa commessa)
        {
            _context.Commesse.Update(commessa);
        }

        public void Delete(Commessa commessa)
        {
            _context.Commesse.Remove(commessa);
        }

        public List<Commessa> GetAll()
        {
            return _context.Commesse.ToList();
        }
    }
}
