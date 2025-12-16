using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Entities;
using System;
using System.Data;
using System.Security.Claims;
using System.Xml;


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
    private readonly IRedisService _redisService;
    public AuthUseCases(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        ITokenRepository tokenRepository,
        IEmailService emailService,
        IEmailVerificationTokenRepository emailVerificationTokenRepository,
        IPasswordResetTokenRepository passwordResetTokenRepository,
        IRoleRepository roleRepository,
        IRabbitMqService rabbitMqService,
        IRedisService redisService
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
        _redisService = redisService;

    }

    public async Task<(string accessToken, string refreshToken)> LoginAsync(LoginRequestDto dto)
    {
        var user = await _userRepository.GetByEmailOrUsernameAsync(dto.EmailOrUsername);

        if (user == null || !_passwordHasher.VerifyPassword(user.PasswordHash, dto.Password))
            throw new Exception("Invalid credentials");

        if (user.IsBanned)
            throw new Exception("Your account has been banned");

        if (!user.EmailVerified)
            throw new Exception("Email not verified");

        user.TokenVersion += 1;

      
        await _redisService.SetStringAsync(
            $"user:{user.UserId}:tokenVersion",
            user.TokenVersion.ToString(),
            TimeSpan.FromDays(7)
        );

     
        await _userRepository.UpdateAsync(user);

      
        var roles = user.UserRoles?.Select(ur => ur.Role.RoleName) ?? new List<string>();

        var accessToken = _jwtService.GenerateAccessToken(
            user.UserId,
            user.Email,
            roles,
            user.TokenVersion
        );

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

            await _tokenRepository.UpdateRefreshTokenAsync(existingToken);
        }
       
        return (accessToken, refreshToken);
    }

    public async Task RegisterAsync(RegisterRequestDto dto)
    {

        var emailUser = await _userRepository.GetByEmailOrUsernameAsync(dto.Email);

      
        var usernameUser = await _userRepository.GetByEmailOrUsernameAsync(dto.UserName);

       
        if (usernameUser != null && usernameUser.Email != dto.Email)
            throw new Exception("Username is already taken");


        var passwordHash = _passwordHasher.HashPassword(dto.Password);
        var verificationToken = _jwtService.GenerateRefreshToken();



        if (emailUser != null)
        {
            if (emailUser.EmailVerified)
                throw new Exception("Email is already registered");

            
            var existingToken = await _emailVerificationTokenRepository.GetEmailVerificationTokensByUserIdAsync(emailUser.UserId);
            if (existingToken != null)
            {
               
                return;
            }


            emailUser.PasswordHash = passwordHash;
            emailUser.FullName = dto.FullName;
            emailUser.Username = dto.UserName;
            emailUser.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(emailUser);

            await _emailVerificationTokenRepository.AddEmailVerificationTokenAsync(new EmailVerificationToken
            {
                Token = verificationToken,
                UserId = emailUser.UserId,
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                Verified = false
            });

            _rabbitMqService.Publish("auth_events", "email.verification_requested", new
            {
                Title = "Verify your email",
                Content = "Please verify your email by clicking the link",
                UserName = emailUser.Username,
                emailUser.UserId,
                emailUser.Email,
                Token = verificationToken
            });

            return;
        }

        var newUser = new User
        {
            Email = dto.Email,
            Username = dto.UserName,
            FullName = dto.FullName,
            PasswordHash = passwordHash,
            EmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UserRoles = new List<UserRole>()   
        };

        await _userRepository.AddAsync(newUser);


       
        var role = await _roleRepository.GetByNameAsync("User");
        if (role == null)
            throw new Exception("Role 'User' not found");

       
        newUser.UserRoles.Add(new UserRole
        {
            RoleId = role.RoleId,
            UserId = newUser.UserId
        });

        await _userRepository.UpdateAsync(newUser);


    
        await _emailVerificationTokenRepository.AddEmailVerificationTokenAsync(new EmailVerificationToken
        {
            Token = verificationToken,
            UserId = newUser.UserId,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            Verified = false
        });

        _rabbitMqService.Publish("auth_events", "email.verification_requested", new
        {
            Title = "Verify your email",
            Content = "Please verify your email by clicking the link",
            UserName = newUser.Username,
            newUser.UserId,
            newUser.Email,
            Token = verificationToken
        });
    }

 
    public async Task LogoutAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found");
        user.TokenVersion += 1;

        await _userRepository.UpdateAsync(user);

        await _redisService.SetStringAsync(
             $"user:{user.UserId}:tokenVersion",
             user.TokenVersion.ToString(),
             TimeSpan.FromDays(7)
         );
    }
    public async Task ForgotPasswordAsync(ForgotPasswordRequestDto dto)
    {
        var user = await _userRepository.GetByEmailOrUsernameAsync(dto.Email);
        if (user == null) return;

        var resetToken = _jwtService.GenerateRefreshToken();
        await _passwordResetTokenRepository.AddPasswordResetTokenAsync(new PasswordResetToken
        {
            Token = resetToken,
            UserId = user.UserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            Used = false
        });
        _rabbitMqService.Publish("auth_events", "password.reset_requested", new
        {
            Title = "Password Reset Request",
            Content = "You can reset your password by clicking the link",
            user.UserId,
            user.Email,
            user.UserName,
            Token = resetToken
        });


    }
    public async Task ChangePasswordAsync(ChangePasswordDto dto, int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            throw new Exception("User not found");

        if (!_passwordHasher.VerifyPassword(user.PasswordHash, dto.OldPassword))
            throw new Exception("Old password is incorrect");
        if (dto.OldPassword == dto.NewPassword)
            throw new Exception("The new password cannot be the same as the old password!");
        
        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
        user.TokenVersion += 1;
        await _userRepository.UpdateAsync(user);
          _rabbitMqService.Publish("auth_events", "password.reset_completed", new
        {
            Title = "Your password has been reset",
            Content = "You can now log in with your new password",
            user.UserId,
            user.Email,
            user.UserName,
            ResetAt = DateTime.UtcNow
        });
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto dto)
    {
        var resetToken = await _passwordResetTokenRepository
            .GetPasswordResetTokenAsync(dto.Token);

        if (resetToken == null || resetToken.Used || resetToken.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Invalid or expired reset token");

        var user = await _userRepository.GetByIdAsync(resetToken.UserId);
        if (user == null)
            throw new Exception("User not found");

        if (_passwordHasher.VerifyPassword(user.PasswordHash, dto.NewPassword))
            throw new Exception("New password cannot be the same as the old password");


        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);

        
        user.TokenVersion += 1;

        await _redisService.SetStringAsync(
            $"user:{user.UserId}:tokenVersion",
            user.TokenVersion.ToString(),
            TimeSpan.FromDays(7)
        );

        await _userRepository.UpdateAsync(user);

    
        resetToken.Used = true;
        await _passwordResetTokenRepository.UpdatePasswordResetTokenAsync(resetToken);

        _rabbitMqService.Publish("auth_events", "password.reset_completed", new
        {
            Title = "Your password has been reset",
            Content = "You can now log in with your new password",
            user.UserId,
            user.Email,
            user.UserName,
            ResetAt = DateTime.UtcNow
        });
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
        _rabbitMqService.Publish("auth_events", "user.registered", new
        {
            Title = "You have successfully registered",
            Content = "Welcome to our platform!",
            user.UserId,
            user.Email,
            user.UserName
        });
        _rabbitMqService.Publish("auth_events", "email.verified", new
        {
            Title = "Your email has been verified",
            Content = "Thank you for verifying your email",
            user.UserId,
            user.Email,
            user.UserName,
            VerifiedAt = DateTime.UtcNow
        });
    }

    public async Task ResendVerificationEmailAsync(ResendVerificationRequestDto dto)
    {
        var user = await _userRepository.GetByEmailOrUsernameAsync(dto.Email);
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
        _rabbitMqService.Publish("auth_events", "email.verification_requested", new
        {
            Title = "Verify your email",
            Content = "Please verify your email by clicking the link",
            user.UserId,
            user.Email,
            user.UserName,
            Token = verificationToken
        });
    }

    public async Task<(string accessToken, string refreshToken)> RefreshTokenAsync(string refreshToken)
    {
      
        var oldToken = await _tokenRepository.GetRefreshTokenAsync(refreshToken);
        
        if (oldToken == null || oldToken.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Invalid or expired refresh token");

        var user = await _userRepository.GetByIdAsync(oldToken.UserId);

        if (user == null)
            throw new Exception("User not found");
        user.TokenVersion += 1;
        await _redisService.SetStringAsync(
           $"user:{user.UserId}:tokenVersion",
           user.TokenVersion.ToString(),
           TimeSpan.FromDays(7)
       );
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
