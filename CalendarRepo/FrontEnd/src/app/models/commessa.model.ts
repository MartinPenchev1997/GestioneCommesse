export interface Commesse {
  Id: number;
  Title: string;
  Date: Date;
  Start: number;
  End: number;
  Hours: number;
  MaintenanceHours?: boolean;
  Client?: string;
  Project?: string;
  Status: 'completed' | 'in-progress' | 'pending';
  Note?: string;
}
