import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { decodeToken, getRole } from 'src/app/shared/helper/jwtDecode.helper';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = decodeToken(token);

      if (decoded) {
        return getRole(decoded) === 'Admin';
      }
    }
    // Se non admin, reindirizza
    this.router.navigate(['/calendar']);
    return false;
  }
}
