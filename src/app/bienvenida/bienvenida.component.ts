import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css'],
  imports: [CommonModule, RouterModule]
})
export class BienvenidaComponent {
  fichasGuardadas: any[] = [];
  juegos = [
    {
      nombre: 'Dungeons & Dragons',
      imagen: 'assets/dnd-logo.png',
      ruta: 'crear',
      activo: true,
    },
    {
      nombre: 'Próximamente...',
      imagen: 'assets/placeholder.png',
      ruta: '',
      activo: false,
    },
  ];

  indiceJuego = 0;
  indiceFicha = 0;


  constructor(private router: Router) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const fichas = localStorage.getItem('fichasDND');
    if (fichas) {
      this.fichasGuardadas = JSON.parse(fichas);
    }
  }
}


  siguiente() {
    if (this.indiceJuego < this.juegos.length - 1) {
      this.indiceJuego++;
    }
  }

  anterior() {
    if (this.indiceJuego > 0) {
      this.indiceJuego--;
    }
  }

  siguienteFicha() {
  if (this.indiceFicha < this.fichasGuardadas.length - 1) {
    this.indiceFicha++;
  }
}

anteriorFicha() {
  if (this.indiceFicha > 0) {
    this.indiceFicha--;
  }
}

  navegar(ruta: string, activo: boolean) {
    if (activo && ruta) {
      this.router.navigate([`/${ruta}`]);
    }
  }

  descargarFicha(ficha: any) {
    const link = document.createElement('a');
    link.href = ficha.pdf;
    link.download = `${ficha.nombre}.pdf`;
    link.click();
  }

  borrarFicha(id: number) {
    this.fichasGuardadas = this.fichasGuardadas.filter(f => f.id !== id);
    localStorage.setItem('fichasDND', JSON.stringify(this.fichasGuardadas));
    this.indiceFicha = 0;
  }

  verFicha(ficha: any) {
  window.open(ficha.pdf, '_blank');
}

editarFicha(ficha: any) {
  localStorage.setItem('fichaEditar', JSON.stringify(ficha));
  this.router.navigate(['/crear']);
}

}
