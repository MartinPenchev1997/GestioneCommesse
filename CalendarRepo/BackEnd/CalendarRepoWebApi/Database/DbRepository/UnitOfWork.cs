using CalendarRepo.Repository;

namespace CalendarRepo.Database.DbRepository
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        public IUserRepository Users { get; }
        public ICommessaRepository Commesse { get; }

        public UnitOfWork(AppDbContext context, IUserRepository userRepository, ICommessaRepository commesse)
        {
            _context = context;
            Users = userRepository;
            Commesse = commesse;
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
