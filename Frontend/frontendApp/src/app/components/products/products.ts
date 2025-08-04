import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, Product } from '../../services/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];

  newForm: FormGroup;
  editForm: FormGroup;

  showCreateModal = false;
  showEditModal = false;
  editingProduct?: Product;
  errorMessage: string | null = null;

  // Paginación y ordenación
  pageSize = 10;
  currentPage = 1;
  sortAsc = true;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.newForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(255)],
      price: [0, [Validators.required, Validators.min(0)]]
    });
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(255)],
      price: [0, [Validators.required, Validators.min(0)]]
    });
    this.newForm = this.fb.group({
  name: ['', [Validators.required]],
  description: ['', [Validators.required]],
  price: [null, [Validators.required, Validators.min(0.01)]],
});
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.productService.getAll().subscribe(data => {
      this.products = data;
      this.currentPage = 1;
    });
  }

  // Getter para ordenar y paginar
  get displayedProducts(): Product[] {
    const sorted = [...this.products].sort((a, b) =>
      this.sortAsc ? a.id! - b.id! : b.id! - a.id!
    );
    const start = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.pageSize);
  }

  toggleSort() {
    this.sortAsc = !this.sortAsc;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  // Crear
  openCreateModal() {
    this.errorMessage = null;
    this.newForm.reset({ name: '', description: '', price: 0 });
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
    this.productService.create(this.newForm.value).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadAll();
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Error al crear producto.';
      }
    });
  }
  // Editar
  openEditModal(p: Product) {
    this.errorMessage = null;
    this.editingProduct = p;
    this.editForm.setValue({
      name: p.name,
      description: p.description ?? '',
      price: p.price
    });
    this.showEditModal = true;
  }
  closeEditModal() {
    this.showEditModal = false;
    this.editingProduct = undefined;
  }
  onUpdate() {
    this.errorMessage = null;
    if (this.editForm.invalid || !this.editingProduct) {
      this.errorMessage = 'Por favor, corrige los errores en el formulario.';
      return;
    }
    this.productService.update(this.editingProduct.id!, this.editForm.value).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadAll();
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Error al actualizar producto.';
      }
    });
  }

  // Borrar
  onDelete(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.productService.delete(id).subscribe({
      next: () => {
        this.errorMessage = 'Producto eliminado correctamente.';
        this.loadAll();
        setTimeout(() => this.errorMessage = null, 3000);
      },
      error: () => {
        this.errorMessage = 'Error al eliminar producto.';
      }
    });
  }
}
