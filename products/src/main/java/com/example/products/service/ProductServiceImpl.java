package com.example.products.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.products.client.CategoryClient;
import com.example.products.client.CategoryDTO;
import com.example.products.models.entities.Product;
import com.example.products.repositories.ProductRepository;



@Service
@Transactional
public class ProductServiceImpl implements ProductService{

    private final ProductRepository productRepository;
    private final CategoryClient categoryClient;

    public ProductServiceImpl(ProductRepository productRepository, CategoryClient categoryClient) {
        this.productRepository = productRepository;
        this.categoryClient = categoryClient;
    }

    @Override
    public List<Product> getAllProducts(){
        return (List<Product>)productRepository.findAll();
    }

    @Override
    public Optional<Product> geProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public Product createProduct(Product product) {
         if (product.getCategoryId() == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }

        try {
            CategoryDTO category = categoryClient.getCategory(product.getCategoryId());
            if (category != null && category.getId() != null) {
                return productRepository.save(product);
            } else {
                throw new IllegalArgumentException("Category with id " + product.getCategoryId() + " does not exist");
            }
            
        } catch (Exception e) {
            throw new IllegalArgumentException("Category with id " + product.getCategoryId() + " does not exist or service unavailable: " + e.getMessage());
        }
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        if (!productRepository.findById(id).isPresent()) {
            throw new IllegalArgumentException("Product with id " + id + " does not exist");
        }
        
        // Validar categoryId si se proporciona
        if (product.getCategoryId() != null) {
            try {
                CategoryDTO category = categoryClient.getCategory(product.getCategoryId());
                if (category == null || category.getId() == null) {
                    throw new IllegalArgumentException("Category with id " + product.getCategoryId() + " does not exist");
                }
            } catch (Exception e) {
                throw new IllegalArgumentException("Category with id " + product.getCategoryId() + " does not exist or service unavailable: " + e.getMessage());
            }
        }
        
        product.setId(id);
        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
         if(!productRepository.findById(id).isPresent()){
            throw new IllegalArgumentException("Product with id"+id+"does not exist");
        }
        productRepository.deleteById(id);
    }

}