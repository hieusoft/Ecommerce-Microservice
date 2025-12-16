using System;

namespace src.Models
{
    public class UserCache
    {
        public int UserId { get; set; }         
        public string? FullName { get; set; }   
        public string Username { get; set; }     
        public string Email { get; set; }        
        public DateTime UpdatedAt { get; set; }  
    }
}
