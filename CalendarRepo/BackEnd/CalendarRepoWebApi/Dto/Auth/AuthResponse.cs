namespace CalendarRepo.Dto.Auth
{
    public class AuthResponse
    {
        public string LoggedUser { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}
