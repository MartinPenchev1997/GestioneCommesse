namespace CalendarRepo.Repository
{
    public interface IUnitOfWork
    {
        IUserRepository Users { get; }
        ICommessaRepository Commesse { get; }
        Task<int> CompleteAsync();
    }
}
