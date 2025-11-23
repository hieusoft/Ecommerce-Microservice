using Application.DTOs.User;
using Application.Interfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.UseCases
{
    public class UserUseCases
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IRabbitMqService _rabbitMqService;

        public UserUseCases(IUserRepository userRepository, IRoleRepository roleRepository, IRabbitMqService rabbitMqService)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _rabbitMqService = rabbitMqService;
        }
        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(u => new UserResponseDto
            {
                UserId = u.UserId,
                Email = u.Email,
                Roles = u.UserRoles?.Select(ur => ur.Role.RoleName).ToList() ?? new List<string>()
            });
        }
        public async Task<UserResponseDto> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return new UserResponseDto
                {
                    UserId = 0,
                    Email = string.Empty,
                    UserName = string.Empty,
                    Roles = new List<string>()
                };

            return new UserResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Roles = user.UserRoles?.Select(ur => ur.Role.RoleName).ToList() ?? new List<string>()
            };
        }


        public async Task UpdateUserAsync(UpdateUserRequestDto dto)
        {
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null) throw new Exception("User not found");

            user.Email = dto.Email;

            await _userRepository.UpdateAsync(user);
        }

        public async Task DeleteUserAsync(DeleteUserRequestDto dto)
        {
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null) throw new Exception("User not found");

            await _userRepository.DeleteAsync(user);
        }

        public async Task AssignRoleAsync(AssignRoleRequestDto dto)
        {
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null) throw new Exception("User not found");

            var role = await _roleRepository.GetByNameAsync(dto.RoleName);
            if (role == null) throw new Exception("Role not found");

            if (user.UserRoles == null)
                user.UserRoles = new List<UserRole>();

           
            var hasRole = user.UserRoles.Any(ur => ur.RoleId == role.RoleId);
            if (hasRole)
                throw new Exception("User already has this role");

            
            user.UserRoles.Add(new UserRole { RoleId = role.RoleId, UserId = user.UserId });

           
            user.TokenVersion += 1;

            await _userRepository.UpdateAsync(user);
        }

        public async Task RemoveRoleAsync(RemoveRoleRequestDto dto)
        {
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null) throw new Exception("User not found");

            var role = await _roleRepository.GetByNameAsync(dto.RoleName);
            if (role == null) throw new Exception("Role not found");

            if (user.UserRoles == null || !user.UserRoles.Any(ur => ur.RoleId == role.RoleId))
                throw new Exception("User does not have this role");

            var userRole = user.UserRoles.First(ur => ur.RoleId == role.RoleId);
            user.UserRoles.Remove(userRole);
            user.TokenVersion += 1;

            await _userRepository.UpdateAsync(user);
        }
        public async Task BanUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");
            if (user.IsBanned) throw new Exception("User is already banned");
            user.IsBanned = true;
            await _userRepository.UpdateAsync(user);
            _rabbitMqService.Publish("auth_events", "user.banned", new
            {
                user.UserId,
                user.Email
            });
        }

        public async Task UnbanUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            if (!user.IsBanned) throw new Exception("User is not banned");

            user.IsBanned = false;
           
            await _userRepository.UpdateAsync(user);
            _rabbitMqService.Publish("auth_events", "user.unbanned", new
            {
                user.UserId,
                user.Email
            });
        }
        public async Task<IEnumerable<UserContactResponseDto>> GetContactsByUserIdAsync(int userId)
        {
            var contacts = await _userRepository.GetContactsByUserIdAsync(userId);
            return contacts.Select(c => new UserContactResponseDto
            {
                ContactId = c.ContactId,
                UserId = c.UserId,
                AddressLine = c.AddressLine,
                City = c.City,
                PhoneNumber = c.PhoneNumber,
                IsDefault = c.IsDefault
            });
        }

        public async Task<UserContactResponseDto?> GetContactByIdAsync(int contactId)
        {
            var contact = await _userRepository.GetContactByIdAsync(contactId);
            if (contact == null) return null;

            return new UserContactResponseDto
            {
                ContactId = contact.ContactId,
                UserId = contact.UserId,
                AddressLine = contact.AddressLine,
                City = contact.City,
                PhoneNumber = contact.PhoneNumber,
                IsDefault = contact.IsDefault
            };
        }

        public async Task AddContactAsync(AddUserContactRequestDto dto)
        {
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null) throw new Exception("User not found");
            var contact = new UserContacts
            {
                UserId = dto.UserId,
                AddressLine = dto.AddressLine,
                City = dto.City,
                PhoneNumber = dto.PhoneNumber,
                IsDefault = dto.IsDefault
            };

            if (contact.IsDefault)
            {
              
                var existingContacts = await _userRepository.GetContactsByUserIdAsync(dto.UserId);
                foreach (var c in existingContacts)
                {
                    if (c.IsDefault)
                    {
                        c.IsDefault = false;
                        await _userRepository.UpdateContactAsync(c);
                    }
                }
            }

            await _userRepository.AddContactAsync(contact);
        }

        public async Task UpdateContactAsync(UpdateUserContactRequestDto dto)
        {
            var contact = await _userRepository.GetContactByIdAsync(dto.ContactId);
            if (contact == null) throw new Exception("Contact not found");

            contact.AddressLine = dto.AddressLine;
            contact.City = dto.City;
            contact.PhoneNumber = dto.PhoneNumber;

            if (dto.IsDefault && !contact.IsDefault)
            {
                // Nếu đánh dấu default, reset các contact khác
                var existingContacts = await _userRepository.GetContactsByUserIdAsync(contact.UserId);
                foreach (var c in existingContacts)
                {
                    if (c.IsDefault)
                    {
                        c.IsDefault = false;
                        await _userRepository.UpdateContactAsync(c);
                    }
                }
                contact.IsDefault = true;
            }
            else if (!dto.IsDefault)
            {
                contact.IsDefault = false;
            }

            await _userRepository.UpdateContactAsync(contact);
        }

        public async Task DeleteContactAsync(int contactId)
        {
            var contact = await _userRepository.GetContactByIdAsync(contactId);
            if (contact == null) throw new Exception("Contact not found");

            await _userRepository.DeleteContactAsync(contact);
        }

    }
}
