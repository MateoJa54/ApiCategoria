package com.example.categories.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.categories.models.entities.Category;
import com.example.categories.repositories.CategoryRepository;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> getAllCategories() {
        return (List<Category>) categoryRepository.findAll();
    }

    @Override
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    @Override
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

@Override
public Category updateCategory(Long id, Category cat) {
    Category existing = categoryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Category with id " + id + " does not exist"));
    if (cat.getName() != null) {
        existing.setName(cat.getName());
    }
    if (cat.getDescription() != null) {
        existing.setDescription(cat.getDescription());
    }
    return categoryRepository.save(existing);
}


    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.findById(id).isPresent()) {
            throw new IllegalArgumentException("Category with id " + id + " does not exist");
        }
        categoryRepository.deleteById(id);
    }
}
