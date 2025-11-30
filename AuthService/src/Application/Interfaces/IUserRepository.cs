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

    
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);

       
        Task<UserContacts?> GetContactByIdAsync(int contactId);
        Task<IEnumerable<UserContacts>> GetContactsByUserIdAsync(int userId);
        Task AddContactAsync(UserContacts contact);
        Task UpdateContactAsync(UserContacts contact);
        Task DeleteContactAsync(UserContacts contact);
    }
}
