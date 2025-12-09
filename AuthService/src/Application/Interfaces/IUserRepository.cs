using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IUserRepository
    {
    
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailOrUsernameAsync(string input);

        IQueryable<User> Query();
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);

        Task<RecipientInfo?> GetRecipientByIdAsync(int recipientId);
        Task<IEnumerable<RecipientInfo>> GetRecipientsByUserIdAsync(int userId);
        Task AddRecipientAsync(RecipientInfo recipientInfo);
        Task UpdateRecipientAsync(RecipientInfo recipientInfo);
        Task DeleteRecipientAsync(RecipientInfo recipientInfo);
    }
}
