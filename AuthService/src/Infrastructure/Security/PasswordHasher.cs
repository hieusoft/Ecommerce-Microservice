using Application.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace Infrastructure.Security
{
    public class PasswordHasher : IPasswordHasher
    {
        private const int SaltSize = 16;
        private const int HashSize = 32;
        private const int Iterations = 10000;

        public string HashPassword(string password)
        {
         
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[SaltSize];
            rng.GetBytes(salt);

         
            var hash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                HashSize
            );

            
            var saltHash = new byte[SaltSize + HashSize];
            Array.Copy(salt, 0, saltHash, 0, SaltSize);
            Array.Copy(hash, 0, saltHash, SaltSize, HashSize);

            return Convert.ToBase64String(saltHash);
        }

        public bool VerifyPassword(string hashedPassword, string password)
        {
            try
            {
                var saltHash = Convert.FromBase64String(hashedPassword);

                if (saltHash.Length != SaltSize + HashSize)
                    return false;

              
                var salt = new byte[SaltSize];
                Array.Copy(saltHash, 0, salt, 0, SaltSize);

                var storedHash = new byte[HashSize];
                Array.Copy(saltHash, SaltSize, storedHash, 0, HashSize);

              
                var computedHash = Rfc2898DeriveBytes.Pbkdf2(
                    Encoding.UTF8.GetBytes(password),
                    salt,
                    Iterations,
                    HashAlgorithmName.SHA256,
                    HashSize
                );

                return CryptographicOperations.FixedTimeEquals(storedHash, computedHash);
            }
            catch
            {
                return false;
            }
        }
    }
}

