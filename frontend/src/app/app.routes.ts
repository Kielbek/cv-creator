import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage) },
  { path: 'templates', loadComponent: () => import('./features/templates/templates-page').then((m) => m.TemplatesPage) },
  { path: 'editor', loadComponent: () => import('./features/editor/editor-page').then((m) => m.EditorPage) },
  { path: '**', redirectTo: '' },
];
