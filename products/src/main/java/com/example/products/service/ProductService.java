package com.example.products.service;

import java.util.List;
import java.util.Optional;

import com.example.products.models.entities.Product;

public interface ProductService {
    List<Product> getAllProducts();
    Optional<Product> geProductById(Long id);
    Product createProduct(Product product);

    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);

}
