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

        public UserUseCases(IUserRepository userRepository, IRoleRepository roleRepository)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
        }
        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(u => new UserResponseDto
            {
                UserId = u.UserId,
                Email = u.Email,
                UserName = u.UserName,
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
                UserName = user.UserName,
                Roles = user.UserRoles?.Select(ur => ur.Role.RoleName).ToList() ?? new List<string>()
            };
        }


        public async Task UpdateUserAsync(UpdateUserRequestDto dto)
        {
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null) throw new Exception("User not found");

            user.UserName = dto.UserName;
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

            if (!user.UserRoles.Any(ur => ur.RoleId == role.RoleId))
                user.UserRoles.Add(new UserRole { RoleId = role.RoleId, UserId = user.UserId });

            await _userRepository.UpdateAsync(user);
        }
    }
}
