namespace src.DTOs
{
    public class SendVerifyEmailDto
    {
        public string Email { get; set; } = null!;          
        public string UserName { get; set; } = null!;      
        public string Token { get; set; } = null!;
    }
}
