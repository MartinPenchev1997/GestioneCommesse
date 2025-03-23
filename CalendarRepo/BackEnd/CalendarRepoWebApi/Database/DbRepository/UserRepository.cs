﻿using CalendarRepo.Models;
using CalendarRepo.Repository;
using Microsoft.EntityFrameworkCore;

namespace CalendarRepo.Database.DbRepository
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Utenti user)
        {
            await _context.Utenti.AddAsync(user);
        }
        public async Task<Utenti> GetByUsernameAsync(string username)
        {
            return await _context.Utenti.FirstOrDefaultAsync(u => u.Username == username);
        }
        public async Task<Utenti> GetByTokenAsync(string refreshToken)
        {
            return await _context.Utenti.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        public async Task<Utenti> GetByIdAsync(int id)
        {
            return await _context.Utenti.FindAsync(id);
        }
        public void Update(Utenti user)
        {
            _context.Utenti.Update(user);
        }
    }
}
