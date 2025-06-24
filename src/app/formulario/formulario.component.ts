import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';


import jsPDF from 'jspdf';

// Coordenadas para jsPDF (x, y)
const camposPosiciones = {
  nombrePersonaje: [30, 25],  // "NOMBRE DEL PERSONAJE"
  
  // Atributos principales
  fuerza: [25, 45],
  destreza: [25, 55],
  constitucion: [25, 65],
  inteligencia: [25, 75],
  sabiduria: [25, 85],
  carisma: [25, 95],
  
  // Información básica
  raza: [30, 120],
  clase: [30, 130],
  nivel: [30, 140],
  transfondo: [30, 150],
  
  // Habilidades (ejemplos)
  acrobacias: [120, 45],
  atletismo: [120, 55],
  arcanos: [120, 65],
  engaño: [120, 75],
  
  // Rasgos
  rasgosPersonalidad: [30, 180],
  ideales: [30, 200],
  vinculos: [30, 220],
  defectos: [30, 240],
  
  // Puntos de golpe
  puntosGolpeMaximos: [100, 120],
  puntosGolpeActuales: [100, 130],
  iniciativa: [100, 100],
  velocidad: [100, 110]
};


@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css'],
})
export class FormularioComponent {
  fichaForm: FormGroup;
  camposForm: FormGroup;

  tiradas: number[][] = [];
  tiradasRealizadas = 0;
  filaActivaIndex: number | null = null;
  asignaciones: Array<(number | null)[]> = [];
  atributos = ['Fuerza', 'Destreza', 'Constitución', 'Inteligencia', 'Sabiduría', 'Carisma'];
  razas = ['Enano', 'Elfo', 'Mediano', 'Humano', 'Dracónido', 'Gnomo', 'Semielfo', 'Semiorco', 'Tiefling'];
  clases = ['Bárbaro', 'Bardo', 'Brujo', 'Clérigo', 'Druida', 'Explorador', 'Guerrero', 'Hechicero', 'Mago', 'Monje', 'Paladín', 'Pícaro'];

  mostrarOtraRaza = false;
  mostrarOtraClase = false; 
  

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.fichaForm = this.fb.group({
      nombre: [''],
      raza: [''],
      otraRaza: [''],
      clase: [''],
      otraClase: [''],
      nivel: [1, [Validators.required, Validators.min(1)]], 
      transfondo: [''],
      alineamiento1: [''],
      alineamiento2: [''],
      jugador: [''],
      rasgos: [''],
      ideales: [''],
      vinculos: [''],
      defectos: ['']
    });
    
    this.camposForm = this.fb.group({
      campo1: [{ value: '', disabled: true }],
      campo2: [{ value: '', disabled: true }],
      campo3: [{ value: '', disabled: true }],
      campo4: [{ value: '', disabled: true }],
      campo5: [{ value: '', disabled: true }],
      campo6: [{ value: '', disabled: true }],
    });
  }

  onRazaChange(value: string) {
    this.mostrarOtraRaza = (value === 'otra');
    if (!this.mostrarOtraRaza) {
      this.fichaForm.get('otraRaza')?.setValue('');
    }
  }

  onClaseChange(value: string) {
    this.mostrarOtraClase = (value === 'otra');
    if (!this.mostrarOtraClase) {
      this.fichaForm.get('otraClase')?.setValue('');
    }
  }

  tirarDados() {
    if (this.tiradasRealizadas >= 2) return;

    const nuevaTirada = Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 1);
    this.tiradas.push(nuevaTirada);
    this.tiradasRealizadas++;

    // Inicializamos asignaciones vacías para esta fila
    this.asignaciones.push(new Array(6).fill(null));

    // Seleccionamos esta fila como activa para asignar valores
    this.filaActivaIndex = this.tiradas.length - 1;

    // Actualizamos el formulario para mostrar campos vacíos de la fila activa
    this.updateCamposForm();
  }

  activarFila(index: number) {
    this.filaActivaIndex = this.filaActivaIndex === index ? null : index;
    this.updateCamposForm();
  }

  asignarValor(valor: number) {
  if (this.filaActivaIndex === null) {
    alert('Selecciona una fila para asignar números');
    return;
  }

  const tiradaActiva = this.tiradas[this.filaActivaIndex];
  const asignacionFila = this.asignaciones[this.filaActivaIndex];

  // Contamos cuántas veces aparece el valor en la tirada activa
  const totalEnTirada = tiradaActiva.filter(v => v === valor).length;

  // Contamos cuántas veces ya está asignado en esta fila
  const totalAsignado = asignacionFila.filter(v => v === valor).length;

  if (totalAsignado >= totalEnTirada) {
    alert(`Ya has asignado todas las veces el número ${valor} que aparece en esta tirada.`);
    return;
  }

  // Asignar en el primer campo null disponible de la fila activa
  const indexCampo = asignacionFila.findIndex(v => v === null);
  if (indexCampo !== -1) {
    asignacionFila[indexCampo] = valor;
    this.updateCamposForm();
  } else {
    alert('Todos los campos de esta fila ya están asignados.');
  }
}

  

  quitarAsignacion(indexCampo: number) {
    if (this.filaActivaIndex === null) return;

    this.asignaciones[this.filaActivaIndex][indexCampo] = null;
    this.updateCamposForm();
  }

  updateCamposForm() {
    if (this.filaActivaIndex === null) {
      // Si no hay fila activa, limpiar campos
      for (let i = 1; i <= 6; i++) {
        this.camposForm.get(`campo${i}`)?.setValue('');
      }
      return;
    }

    const asignacionFila = this.asignaciones[this.filaActivaIndex];
    for (let i = 0; i < 6; i++) {
      this.camposForm.get(`campo${i + 1}`)?.setValue(asignacionFila[i] ?? '');
    }
  }

  volver() {
    this.router.navigate(['']);
  }

  // Método para convertir una imagen en base64
  async loadImageAsBase64(url: string): Promise<string> {
    const blob = await this.http.get(url, { responseType: 'blob' }).toPromise();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob!);
    });
  }

  async finalizar() {
    if (this.fichaForm.valid) {
      const { nombre, raza, clase, nivel, transfondo, jugador, alineamiento1, alineamiento2} = this.fichaForm.value;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Cargar imagen desde assets (ajusta el nombre y formato si es PNG)
      const imgData = await this.loadImageAsBase64('/assets/dnd_blankcharactersheet_es_page-0001.jpg');

      // Agregar la imagen de fondo
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      doc.setFontSize(12);

      // Posicionar cada campo en coordenadas específicas (ajusta según tu imagen)
      doc.text(`${nombre}`, 30, 30);
      doc.text(`${raza}`, 95, 35);
      doc.text(`${clase}`, 95 ,25);
      doc.text(`${nivel}`, 115, 25);
      doc.text(`${transfondo}`, 127, 25);
      doc.text(`${jugador}`, 165, 25); 
      doc.text(`${alineamiento1}/${alineamiento2}`, 127, 35);


      for (let i = 0; i < 6; i++) {
        const valores = this.asignaciones[i] ?? [];
        const baseY = 75.5 + i * 26.3;
        valores.forEach((valor, j) => {
          doc.text(`${valor}`, 19, 75.5 + j * 26.3);
        });
      }

      doc.text(doc.splitTextToSize(`${this.fichaForm.value.rasgos}`, 50), 143, 57.5);
      doc.text(doc.splitTextToSize(`${this.fichaForm.value.ideales}`, 50), 143, 83);
      doc.text(doc.splitTextToSize(`${this.fichaForm.value.vinculos}`, 50), 143, 103.5);
      doc.text(doc.splitTextToSize(`${this.fichaForm.value.defectos}`, 50), 143, 124);

      doc.save('ficha-dnd.pdf');
      
      const base64pdf = doc.output('datauristring');

      const nuevaFicha = {
        id: Date.now(), // único
        nombre: nombre,
        datos: this.fichaForm.value,
        pdf: base64pdf
      };

      const fichasGuardadas = JSON.parse(localStorage.getItem('fichasDND') || '[]');
      fichasGuardadas.push(nuevaFicha);
      localStorage.setItem('fichasDND', JSON.stringify(fichasGuardadas));


      this.router.navigate(['']);
    } else {
      alert('Por favor, rellena todos los campos.');
    }
  }
  
}
