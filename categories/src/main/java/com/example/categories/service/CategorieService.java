package com.example.categories.service;

import java.util.List;
import java.util.Optional;

import com.example.categories.models.entities.Categorie;

public interface CategorieService {
    List<Categorie> getAllProducts();
    Optional<Categorie> geProductById(Long id);
    Categorie createCategorie(Categorie categorie);

    Categorie updateCategorie(Long id, Categorie categorie);
    void deleteProduct(Long id);

}
