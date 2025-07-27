package com.example.categories.repositories;

import org.springframework.data.repository.CrudRepository;
import com.example.categories.models.entities.Category;

// Gestiona CRUD en la tabla "categories"
public interface CategoryRepository extends CrudRepository<Category, Long> {
}
