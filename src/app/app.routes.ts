import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'url/:code',
    loadComponent: () => import('./pages/url-detail/url-detail.component').then(m => m.UrlDetailComponent)
  },
  {
    path: 'r/:code',
    loadComponent: () => import('./pages/redirect/redirect.component').then(m => m.RedirectComponent)
  },
  { path: '**', redirectTo: '' }
];
