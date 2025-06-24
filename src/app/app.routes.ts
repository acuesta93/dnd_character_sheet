import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./bienvenida/bienvenida.component').then(m => m.BienvenidaComponent),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./formulario/formulario.component').then(m => m.FormularioComponent),
  },
  {
    path: 'crear',
    loadComponent: () => import('./formulario/formulario.component').then(m => m.FormularioComponent),
  },
  
];
