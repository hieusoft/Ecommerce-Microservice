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
        private readonly IRedisService _redisService;

        public UserUseCases(IUserRepository userRepository, IRoleRepository roleRepository, IRabbitMqService rabbitMqService, IRedisService redisService)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _rabbitMqService = rabbitMqService;
            _redisService = redisService;
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
                FullName = user.FullName,
                UserName = user.Username,
                EmailVerified = user.EmailVerified,
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
            var user = await _userRepository.GetByEmailOrUsernameAsync(dto.EmailOrUsername);
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
            await _redisService.SetStringAsync(
               $"user:{user.UserId}:tokenVersion",
               user.TokenVersion.ToString(),
               TimeSpan.FromDays(7)
           );
            await _userRepository.UpdateAsync(user);
        }

        public async Task RemoveRoleAsync(RemoveRoleRequestDto dto)
        {
            var user = await _userRepository.GetByEmailOrUsernameAsync(dto.EmailOrUsername);
            if (user == null) throw new Exception("User not found");

            var role = await _roleRepository.GetByNameAsync(dto.RoleName);
            if (role == null) throw new Exception("Role not found");

            if (user.UserRoles == null || !user.UserRoles.Any(ur => ur.RoleId == role.RoleId))
                throw new Exception("User does not have this role");

            var userRole = user.UserRoles.First(ur => ur.RoleId == role.RoleId);
            user.UserRoles.Remove(userRole);
            user.TokenVersion += 1;
            await _redisService.SetStringAsync(
           $"user:{user.UserId}:tokenVersion",
           user.TokenVersion.ToString(),
           TimeSpan.FromDays(7)
        );
            await _userRepository.UpdateAsync(user);
        }
        public async Task BanUserAsync(string emailOrUsername)
        {
            var user = await _userRepository.GetByEmailOrUsernameAsync(emailOrUsername);
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

        public async Task UnbanUserAsync(string emailOrUsername)
        {
            var user = await _userRepository.GetByEmailOrUsernameAsync(emailOrUsername);
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

        public async Task<IEnumerable<RecipientRequestDto>> GetRecipientsByUserIdAsync(int userId)
        {
            var recipients = await _userRepository.GetRecipientsByUserIdAsync(userId);
            return recipients.Select(r => new RecipientRequestDto
            {
                RecipientId = r.RecipientId,
                UserId = r.UserId,
                FullName = r.FullName,
                AddressLine = r.AddressLine,
                City = r.City,
                PhoneNumber = r.PhoneNumber,
                IsDefault = r.IsDefault
            });
        }

        public async Task<RecipientRequestDto?> GetRecipientById(int recipientId)
        {
            var recipient = await _userRepository.GetRecipientByIdAsync(recipientId);
            if (recipient == null) return null;

            return new RecipientRequestDto
            {
                RecipientId = recipient.RecipientId,
                FullName = recipient.FullName,
                UserId = recipient.UserId,
                AddressLine = recipient.AddressLine,
                City = recipient.City,
                PhoneNumber = recipient.PhoneNumber,
                IsDefault = recipient.IsDefault
            };
        }

        public async Task AddRecipientAsync(RecipientRequestDto dto)
        {
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null) throw new Exception("User not found");
            var recipient = new RecipientInfo
            {
                UserId = dto.UserId,
                FullName = dto.FullName,
                AddressLine = dto.AddressLine,
                City = dto.City,
                PhoneNumber = dto.PhoneNumber,
                IsDefault = dto.IsDefault
            };

            if (recipient.IsDefault)
            {
              
                var existingRecipient = await _userRepository.GetRecipientsByUserIdAsync(dto.UserId);
                foreach (var c in existingRecipient)
                {
                    if (c.IsDefault)
                    {
                        c.IsDefault = false;
                        await _userRepository.UpdateRecipientAsync(c);
                    }
                }
            }

            await _userRepository.AddRecipientAsync(recipient);
        }

        public async Task UpdateRecipientAsync(UpdateRecipientInfoRequestDto dto)
        {
            var recipient = await _userRepository.GetRecipientByIdAsync(dto.RecipientId);
            if (recipient == null) throw new Exception("Recipient not found");

            recipient.AddressLine = dto.AddressLine;
            recipient.City = dto.City;
            recipient.PhoneNumber = dto.PhoneNumber;

            if (dto.IsDefault && !recipient.IsDefault)
            {
               
                var existingRecipient = await _userRepository.GetRecipientsByUserIdAsync(recipient.UserId);
                foreach (var r in existingRecipient)
                {
                    if (r.IsDefault)
                    {
                        r.IsDefault = false;
                        await _userRepository.UpdateRecipientAsync(r);
                    }
                }
                recipient.IsDefault = true;
            }
            else if (!dto.IsDefault)
            {
                recipient.IsDefault = false;
            }

            await _userRepository.UpdateRecipientAsync(recipient);
        }

        public async Task DeleteRecipientAsync(int recipientId)
        {
            var contact = await _userRepository.GetRecipientByIdAsync(recipientId);
            if (contact == null) throw new Exception("Recipient not found");

            await _userRepository.DeleteRecipientAsync(contact);
        }

    }
}
