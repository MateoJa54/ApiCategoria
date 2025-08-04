// src/app/components/footer/footer.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <p>&copy; 2025 Mi Tienda Futurista</p>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #023e8a;
      color: #caf0f8;
      text-align: center;
      padding: 0.5rem;
      font-size: 0.9rem;
    }
  `]
})
export class FooterComponent {}
