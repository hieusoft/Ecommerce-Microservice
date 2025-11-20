using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Entities;
using System.Data;

public class AuthUseCases
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly ITokenRepository _tokenRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IEmailService _emailService;
    private readonly IEmailVerificationTokenRepository _emailVerificationTokenRepository;
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly IRabbitMqService _rabbitMqService;
    public AuthUseCases(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        ITokenRepository tokenRepository,
        IEmailService emailService,
        IEmailVerificationTokenRepository emailVerificationTokenRepository,
        IPasswordResetTokenRepository passwordResetTokenRepository,
        IRoleRepository roleRepository,
        IRabbitMqService rabbitMqService
        )
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _tokenRepository = tokenRepository;
        _emailService = emailService;
        _emailVerificationTokenRepository = emailVerificationTokenRepository;
        _passwordResetTokenRepository = passwordResetTokenRepository;
        _roleRepository = roleRepository;
        _rabbitMqService = rabbitMqService;

    }

    public async Task<(string accessToken, string refreshToken)> LoginAsync(LoginRequestDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || !_passwordHasher.VerifyPassword(user.PasswordHash, dto.Password))
            throw new Exception("Invalid credentials");
        if (user.IsBanned)
            throw new Exception("Your account has been banned");
        user.TokenVersion += 1;
        await _userRepository.UpdateAsync(user);
        var roles = user.UserRoles?.Select(ur => ur.Role.RoleName) ?? new List<string>();
        var accessToken = _jwtService.GenerateAccessToken(user.UserId, user.Email, roles,user.TokenVersion);
        var refreshToken = _jwtService.GenerateRefreshToken();

        var existingToken = await _tokenRepository.GetRefreshTokenByUserIdAsync(user.UserId);
        _rabbitMqService.Publish("user_registered", new
        {
            user.UserId,
            user.Email
        });
        _rabbitMqService.Publish("email_verification_requested", new
        {
            user.Email,
            Token = "xxxx"
        });
        if (existingToken == null)
        {
          
            await _tokenRepository.AddRefreshTokenAsync(new RefreshToken
            {
                Token = refreshToken,
                UserId = user.UserId,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            });
        }
        else
        {
           
            existingToken.Token = refreshToken;
            existingToken.ExpiresAt = DateTime.UtcNow.AddDays(7);
            existingToken.Revoked = false;

            await _tokenRepository.UpdateRefreshTokenAsync(existingToken);
        }

        return (accessToken, refreshToken);
    }


    public async Task RegisterAsync(RegisterRequestDto dto)
    {

        var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new Exception("Email already exists");

        var passwordHash = _passwordHasher.HashPassword(dto.Password);
        var user = new User
        {
            Email = dto.Email,
            UserName = dto.UserName,
            PasswordHash = passwordHash,
            EmailVerified = false

        };
        var role = await _roleRepository.GetByNameAsync("User");
        if (role == null) throw new Exception("Role not found");

        if (user.UserRoles == null)
            user.UserRoles = new List<UserRole>();
        user.UserRoles.Add(new UserRole { RoleId = role.RoleId, UserId = user.UserId });
        await _userRepository.AddAsync(user);
    

        var verificationToken = _jwtService.GenerateRefreshToken();

        await _emailVerificationTokenRepository.AddEmailVerificationTokenAsync(new EmailVerificationToken
        {
            Token = verificationToken,
            UserId = user.UserId,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            Verified = false
        });
        _rabbitMqService.Publish("user_registered", new
        {
            user.UserId,
            user.Email
        });
      
        await _emailService.SendVerificationEmailAsync(user.Email, user.UserName, verificationToken);
        _rabbitMqService.Publish("email_verification_requested", new
        {
            user.Email,
            Token = "xxxx"
        });
    }
    
    public async Task ForgotPasswordAsync(ForgotPasswordRequestDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null) return;

        var resetToken = _jwtService.GenerateRefreshToken();
        await _passwordResetTokenRepository.AddPasswordResetTokenAsync(new PasswordResetToken
        {
            Token = resetToken,
            UserId = user.UserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            Used = false
        });

        await _emailService.SendPasswordResetEmailAsync(user.Email, user.UserName, resetToken);
    }
    public async Task<(string accessToken, string refreshToken)> ResetPasswordAsync(ResetPasswordRequestDto dto)
    {
        var resetToken = await _passwordResetTokenRepository.GetPasswordResetTokenAsync(dto.Token);

        if (resetToken == null || resetToken.Used || resetToken.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Invalid or expired reset token");

        var user = await _userRepository.GetByIdAsync(resetToken.UserId);

        if (user == null)
            throw new Exception("User not found");
        if (_passwordHasher.VerifyPassword(user.PasswordHash, dto.NewPassword))
            throw new Exception("New password cannot be the same as the old password");


        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
        user.TokenVersion += 1;
        await _userRepository.UpdateAsync(user);

        resetToken.Used = true;
        await _passwordResetTokenRepository.UpdatePasswordResetTokenAsync(resetToken);


        var roles = user.UserRoles?.Select(ur => ur.Role.RoleName) ?? new List<string>();
      
        var accessToken = _jwtService.GenerateAccessToken(user.UserId, user.Email, roles,user.TokenVersion);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var existingToken = await _tokenRepository.GetRefreshTokenByUserIdAsync(user.UserId);

        if (existingToken == null)
        {
            await _tokenRepository.AddRefreshTokenAsync(new RefreshToken
            {
                Token = refreshToken,
                UserId = user.UserId,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            });
        }
        else
        {
            existingToken.Token = refreshToken;
            existingToken.ExpiresAt = DateTime.UtcNow.AddDays(7);
            existingToken.Revoked = false;

            await _tokenRepository.UpdateRefreshTokenAsync(existingToken);
        }

        return (accessToken, refreshToken);
    }

    public async Task VerifyEmailAsync(VerifyEmailRequestDto dto)
    {
        var token = await _emailVerificationTokenRepository.GetEmailVerificationTokenAsync(dto.Token);
        if (token == null || token.Verified || token.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Invalid or expired verification token");

        var user = await _userRepository.GetByIdAsync(token.UserId);
        user.EmailVerified = true;
        await _userRepository.UpdateAsync(user);

        token.Verified = true;
        await _emailVerificationTokenRepository.UpdateEmailVerificationTokenAsync(token);
    }

    public async Task ResendVerificationEmailAsync(ForgotPasswordRequestDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null)
            throw new Exception("User not found");

        if (user.EmailVerified)
            throw new Exception("Email is already verified");

        var existingToken = await _emailVerificationTokenRepository
            .GetEmailVerificationTokensByUserIdAsync(user.UserId);
        if(existingToken == null || existingToken.ExpiresAt < DateTime.UtcNow)
        {
            existingToken = null;
        }
        string verificationToken;

        if (existingToken != null)
        {
            
            verificationToken = existingToken.Token;
        }
        else
        {
         
            verificationToken = _jwtService.GenerateRefreshToken();

            await _emailVerificationTokenRepository.AddEmailVerificationTokenAsync(new EmailVerificationToken
            {
                Token = verificationToken,
                UserId = user.UserId,
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                Verified = false
            });
        }
        await _emailService.SendVerificationEmailAsync(user.Email, user.UserName, verificationToken);
    }

    public async Task<(string accessToken, string refreshToken)> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
      
        var oldToken = await _tokenRepository.GetRefreshTokenAsync(dto.RefreshToken);
        if (oldToken == null || oldToken.ExpiresAt < DateTime.UtcNow || oldToken.Revoked)
            throw new Exception("Invalid or expired refresh token");

        var user = await _userRepository.GetByIdAsync(oldToken.UserId);

        if (user == null)
            throw new Exception("User not found");
        user.TokenVersion += 1;
        await _userRepository.UpdateAsync(user);
        var roles = user.UserRoles?.Select(ur => ur.Role.RoleName) ?? new List<string>();
        var newAccessToken = _jwtService.GenerateAccessToken(user.UserId, user.Email, roles,user.TokenVersion);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        var refreshEntity = new RefreshToken
        {
            UserId = user.UserId,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
       
        await _tokenRepository.UpdateRefreshTokenAsync(refreshEntity);
        return (newAccessToken, newRefreshToken);
    }
}
