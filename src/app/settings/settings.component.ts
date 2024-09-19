import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";
import {Item} from "../models/item.model";
import {ItemService} from "../item.service";

@Component({
  selector: 'app-settings',
  standalone: true,
    imports: [
        FormsModule,
        NgForOf,
        ReactiveFormsModule
    ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit{
    allItems?: any;
    categories: string[] = [];
    newCategory: string = '';
    selectedCategory: string = '';
    selectedIndex: number = -1;

    constructor(
        private itemService: ItemService) {
    }

    ngOnInit() {
        this.getAllItems();
    }

    getAllItems() {
        try {
            this.itemService.getAllItemsFromFirestore().then((res) => {
                this.allItems = res;
                this.categories = [...new Set(this.allItems.map((item: Item) => item.category))] as string[];
                console.log(this.categories);
                console.log(this.allItems);
            })
        } catch (error) {
            console.error('Error fetching documents: ', error);
        }
    }

    addNewCategory (newCategory: string) {
        console.log(newCategory);
        if (newCategory && this.categories && !this.categories.includes(newCategory)) {
            const newCategoryItem: any = {
                "name": `Novi artikal za ${newCategory}`,
                "quantity": 1,
                "description": "Opis artikla",
                "category": newCategory
            }

            this.itemService.addNewCategoryToFirestore(newCategoryItem).then(() => {
                console.log('Item with new category added successfully!');
                this.getAllItems();
            })
                .catch((error) => {
                    console.error('Error adding item: ', error);
                });
        }
    }

    // Open the edit modal and set selected category and index
    openEditModal(category: string, index: number) {
        this.selectedCategory = category;
        this.selectedIndex = index;

        // Use Bootstrap data attributes to show the modal
        const modalElement = document.getElementById('editCategoryModal');
        if (modalElement) {
            const modal = new (window as any).bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    // Update the category name
    updateCategory() {
        if (this.selectedIndex >= 0) {
            this.updateCategoryInBothCollections(this.selectedCategory, this.categories[this.selectedIndex]);
        }

        // Hide the modal after updating
        // const modalElement = document.getElementById('editCategoryModal');
        // if (modalElement) {
        //     // Create a new Bootstrap modal instance
        //     const modal = new bootstrap.Modal(modalElement);
        //     modal.hide(); // Properly hide the modal
        // }
    }

    updateCategoryInBothCollections(newCategory: string, oldCategory: string) {
        // Update in ShoppingItems collection
        this.updateCategoryInCollection('ShoppingItems', oldCategory, newCategory)

        // Update in ListItems collection
        this.updateCategoryInCollection('SelectedItems', oldCategory, newCategory)
    }

    updateCategoryInCollection(collectionName: string, oldCategory: string, newCategory: string) {
        this.itemService.updateCategoryNameInFirestore(collectionName, oldCategory, newCategory).then(() => {
            console.log('Category name updated successfully');
            this.getAllItems();
        }).catch((err) => {
            console.log('Something went wrong', err);
        })
    }

    confirmAndDeleteItemsByCategory() {
        // Show a confirmation dialog
        // const userConfirmed = window.confirm(`Are you sure you want to delete all items in the "${category}" category? This action cannot be undone.`);
        //
        // if (userConfirmed) {
        //     // Proceed with the deletion if the user confirms
        //     deleteItemsByCategory(category);
        //     alert('All items in the category have been deleted.');
        // } else {
        //     // Optionally, you can notify the user that the deletion was cancelled
        //     alert('Deletion cancelled.');
        // }
    }

    deleteCategory(category: string, i: number) {
        // Show a confirmation dialog
        const userConfirmed = window.confirm(`Potvrdom će se izbrisati "${category}" i svi artikli koji joj pripadaju. Sigurno želiš nastaviti?`);
        console.log(userConfirmed);
        if (userConfirmed) {
            // Proceed with the deletion if the user confirms
            this.itemService.deleteAllItemsWithThisCategoryInFirestore(category, i).then(() => {
                console.log('Category name updated successfully');
                this.getAllItems();
            }).catch((err) => {
                console.log('Something went wrong', err);
            })
            alert(`Kategorija "${category}" i svi artikli koji joj pripadaju su uspješno izbrisani`);
        } else {
            // Optionally, you can notify the user that the deletion was cancelled
            alert('Brisanje otkazano.');
        }
    }
}
