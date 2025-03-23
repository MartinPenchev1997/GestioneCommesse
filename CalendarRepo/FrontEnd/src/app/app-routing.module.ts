import { Routes } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AuthGuard } from '../../auth/auth.guard';
import { ReportComponent } from './components/report/report.component'; // Import ReportComponent
import { DashboardComponent } from './dashboard/dashboard.component'; // Import DashboardComponent
import { BlankLayoutComponent } from './layouts/blank-layout/blank-layout.component';
import { FullLayoutComponent } from './layouts/full-layout/full.component';

export const routes: Routes = [
  {
    path: "",
    component: BlankLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("@auth/auth.module").then(
            (m) => m.AuthenticationModule
          ),
        data: { title: "Authentication" },
      },
    ],
  },
  {
    path: '',
    component: FullLayoutComponent,
    children: [
      { path: '', redirectTo: '/calendar', pathMatch: 'full' },
      { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
      { path: 'report', component: ReportComponent, canActivate: [AuthGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: '**', redirectTo: '/404' }
    ]
  }
];
