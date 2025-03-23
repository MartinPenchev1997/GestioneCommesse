import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'commesse-calendar-app';

  // isSidebarOpen = true; // Sidebar aperta di default su desktop

  // constructor(private renderer: Renderer2, private authService: AuthService) {}

  // toggleSidebar() {
  //   this.isSidebarOpen = !this.isSidebarOpen;

  //   // Gestione del margine su desktop
  //   if (!this.isSidebarOpen) {
  //     this.renderer.addClass(document.querySelector('.main-content'), 'sidebar-closed');
  //   } else {
  //     this.renderer.removeClass(document.querySelector('.main-content'), 'sidebar-closed');
  //   }
  // }

  // doLogout() {
  //   this.authService.logOut();
  // }
}
