package com.example.products.repositories;

import org.springframework.data.repository.CrudRepository;

import com.example.products.models.entities.Product;

//Aqui se encarga de todo la logica de ingreso a la base de datos de insertar, borar, actualizar
public interface ProductRepository extends CrudRepository<Product, Long> {
    
}
