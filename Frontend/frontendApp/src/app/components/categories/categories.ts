import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService, Category } from '../../services/category';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];

  newForm: FormGroup;
  editForm: FormGroup;

  showCreateModal = false;
  showEditModal = false;
  editingCategory?: Category;

  errorMessage: string | null = null;
  pageSize = 10;
  currentPage = 1;
  sortAsc = true;
  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.newForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(255)]
    });
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data;
      this.currentPage = 1;
    });
  }
  /** Getter que ordena y pagina */
  get displayedCategories(): Category[] {
    const sorted = [...this.categories].sort((a, b) =>
      this.sortAsc ? (a.id! - b.id!) : (b.id! - a.id!)
    );
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  /** Número total de páginas */
  get totalPages(): number {
    return Math.ceil(this.categories.length / this.pageSize);
  }

  // Cambiar orden
  toggleSort() {
    this.sortAsc = !this.sortAsc;
  }

  // Navegar páginas
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
  // Crear
  openCreateModal() {
    this.errorMessage = null;
    this.newForm.reset({ name: '', description: '' });
    this.showCreateModal = true;
  }
  closeCreateModal() {
    this.showCreateModal = false;
  }
  onCreate() {
    this.errorMessage = null;
    if (this.newForm.invalid) {
      this.errorMessage = 'Por favor, corrige los errores en el formulario.';
      return;
    }
    this.categoryService.create(this.newForm.value)
      .subscribe({
        next: () => {
          this.closeCreateModal();
          this.loadAll();
        },
        error: err => {
          this.errorMessage = err.error?.message || 'Error al crear categoría.';
        }
      });
  }

  // Editar
  openEditModal(cat: Category) {
    this.errorMessage = null;
    this.editingCategory = cat;
    this.editForm.setValue({
      name: cat.name,
      description: cat.description ?? ''
    });
    this.showEditModal = true;
  }
  closeEditModal() {
    this.showEditModal = false;
    this.editingCategory = undefined;
  }
  onUpdate() {
    this.errorMessage = null;
    if (this.editForm.invalid || !this.editingCategory) {
      this.errorMessage = 'Por favor, corrige los errores en el formulario.';
      return;
    }
    this.categoryService.update(this.editingCategory.id!, this.editForm.value)
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.loadAll();
        },
        error: err => {
          this.errorMessage = err.error?.message || 'Error al actualizar categoría.';
        }
      });
  }

  // Borrar
  onDelete(id: number) {
  if (!confirm('¿Eliminar esta categoría?')) return;
  this.categoryService.delete(id).subscribe({
    next: () => {
      this.errorMessage = null;
      // Mostramos una alerta temporal de éxito
      this.errorMessage = 'Categoría eliminada correctamente.';
      this.loadAll();
      setTimeout(() => this.errorMessage = null, 3000);
    },
    error: () => {
      this.errorMessage = 'Error al eliminar categoría.';
    }
  });
}

}
