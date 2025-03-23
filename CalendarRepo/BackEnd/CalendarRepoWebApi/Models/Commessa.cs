using System.ComponentModel.DataAnnotations;

namespace CalendarRepo.Models
{
    public class Commessa
    {
        [Key] 
        public long Id { get; set; }
        public string Title { get; set; }
        public DateTime Date {  get; set; }
        public decimal Start { get; set; }
        public decimal End { get; set; }
        public decimal Hours { get; set; }
        public bool? MaintenanceHours { get; set; }
        public string? Client {  get; set; }
        public string? Project {  get; set; }
        public string? Status {  get; set; }
        public string? Note {  get; set; }

    }
}
