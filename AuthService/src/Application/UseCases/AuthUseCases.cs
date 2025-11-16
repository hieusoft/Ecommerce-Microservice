using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Entities;

public class AuthUseCases
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly ITokenRepository _tokenRepository; 
    private readonly IEmailService _emailService;

    public AuthUseCases(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        ITokenRepository tokenRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _tokenRepository = tokenRepository;
        _emailService = emailService;
    }

    public async Task<(string accessToken, string refreshToken)> LoginAsync(LoginRequestDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || !_passwordHasher.VerifyPassword(user.PasswordHash, dto.Password))
            throw new Exception("Invalid credentials");

        var roles = user.UserRoles?.Select(ur => ur.Role.RoleName) ?? new List<string>();
        var accessToken = _jwtService.GenerateAccessToken(user.UserId, user.Email, roles);
        var refreshToken = _jwtService.GenerateRefreshToken();

        await _tokenRepository.AddRefreshTokenAsync(new RefreshToken
        {
            Token = refreshToken,
            UserId = user.UserId,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

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
            PasswordSalt = passwordHash,
            EmailVerified = false
           
        };

        await _userRepository.AddAsync(user);

    
        var verificationToken = _jwtService.GenerateRefreshToken();

        await _userRepository.AddEmailVerificationTokenAsync(new EmailVerificationToken
        {
            Token = verificationToken,
            UserId = user.UserId,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            Verified = false
        });

        await _emailService.SendVerificationEmailAsync(user.Email, user.UserName, verificationToken);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequestDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null) return;

        var resetToken = _jwtService.GenerateRefreshToken();
        await _userRepository.AddPasswordResetTokenAsync(new PasswordResetToken
        {
            Token = resetToken,
            UserId = user.UserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            Used = false
        });

        await _emailService.SendPasswordResetEmailAsync(user.Email, user.UserName, resetToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto dto)
    {
        var resetToken = await _userRepository.GetPasswordResetTokenAsync(dto.Token);
        if (resetToken == null || resetToken.Used || resetToken.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Invalid or expired reset token");

        var user = await _userRepository.GetByIdAsync(resetToken.UserId);
        var passwordHash = _passwordHasher.HashPassword(dto.NewPassword);
        user.PasswordHash = passwordHash;
        user.PasswordSalt = passwordHash;

        await _userRepository.UpdateAsync(user);

        resetToken.Used = true;
        await _userRepository.UpdatePasswordResetTokenAsync(resetToken);
    }

    public async Task VerifyEmailAsync(VerifyEmailRequestDto dto)
    {
        var token = await _userRepository.GetEmailVerificationTokenAsync(dto.Token);
        if (token == null || token.Verified || token.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Invalid or expired verification token");

        var user = await _userRepository.GetByIdAsync(token.UserId);
        user.EmailVerified = true;
        await _userRepository.UpdateAsync(user);

        token.Verified = true;
        await _userRepository.UpdateEmailVerificationTokenAsync(token);
    }

    public async Task ResendVerificationEmailAsync(ForgotPasswordRequestDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || user.EmailVerified)
            throw new Exception("User not found or already verified");

        var verificationToken = _jwtService.GenerateRefreshToken();
        await _userRepository.AddEmailVerificationTokenAsync(new EmailVerificationToken
        {
            Token = verificationToken,
            UserId = user.UserId,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            Verified = false
        });

        await _emailService.SendVerificationEmailAsync(user.Email, user.UserName, verificationToken);
    }
    public async Task<string> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        // Lấy refresh token từ repository
        var token = await _tokenRepository.GetRefreshTokenAsync(dto.RefreshToken);

        if (token == null || token.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Invalid or expired refresh token");

        // Lấy user theo token
        var user = await _userRepository.GetByIdAsync(token.UserId);

        if (user == null)
            throw new Exception("User not found");

        // Lấy roles của user
        var roles = user.UserRoles?.Select(ur => ur.Role.RoleName) ?? new List<string>();

        // Tạo access token mới
        var accessToken = _jwtService.GenerateAccessToken(user.UserId, user.Email, roles);

        return accessToken;
    }
}
