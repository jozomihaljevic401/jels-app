import {Component, OnInit, ViewChild} from '@angular/core';
import {ItemModalComponent} from "../item-modal/item-modal.component";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {RouterOutlet} from "@angular/router";
import {Item} from "../models/item.model";
import {
    collection,
    deleteDoc,
    doc,
    Firestore,
    setDoc
} from "@angular/fire/firestore";
import {FormsModule} from "@angular/forms";
import {ItemService} from "../item.service";

@Component({
  selector: 'app-home',
  standalone: true,
    imports: [
        ItemModalComponent,
        NgForOf,
        NgIf,
        RouterOutlet,
        CommonModule, RouterOutlet, FormsModule, ItemModalComponent
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
    collectionName = 'ShoppingItems';
    allItems?: any;
    categories: string[] = [];
    selectedItems: any[] = [];
    itemCount: number = 0;
    shoppingListItems!: any;
    showCart: boolean = false;
    showItemsList: boolean = false;
    openAccordionItems: number[] = [];

    @ViewChild('modalShoppingListItem') modalShoppingListItem?: ItemModalComponent;
    @ViewChild('modalSelectedItem') modalSelectedItem?: ItemModalComponent;

    constructor(
        private firestore: Firestore,
        private itemService: ItemService) {
    }

    ngOnInit() {
        this.getAllItems();
        this.getShoppingListItems();
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

    getShoppingListItems() {
        try {
            this.itemService.getSelectedItemsFromFirestore().then((res) => {
                this.shoppingListItems = res;
                this.itemCount = this.shoppingListItems.docs?.length;
            });
        } catch (error) {
            console.error('Error fetching documents: ', error);
        }
    }

    addNewItem() {
        const newItem: any = {
            "name": "Krastavac",
            "quantity": 3,
            "description": "Bio",
            "category": "Povrće"
        }
        this.openModalShoppingItem(newItem, false);
        this.getAllItems();
    }

    getItemsByCategory(category: string): Item[] {
        return this.allItems.filter((item: Item) => item.category === category);
    }

    getShoppingListItemsByCategory(category: string): Item[] {
        return this.shoppingListItems.filter((item: Item) => item.category === category);
    }

    getSafeCategoryId(category: string): string {
        return category.replace(/\s+/g, '').replace(/[\/]/g, '-');
    }

    openModalShoppingItem(item: any, edit: boolean) {
        console.log(item);
        if (this.modalShoppingListItem) {
            this.modalShoppingListItem.item = item;
            this.modalShoppingListItem.edit = edit;
            this.modalShoppingListItem.path = 'ShoppingItems';
            this.modalShoppingListItem.categories = this.categories;
            this.modalShoppingListItem.openModal();
        }
    }

    openModalSelectedItem(item: any, edit: boolean) {
        console.log(item);
        if (this.modalSelectedItem) {
            this.modalSelectedItem.item = item;
            this.modalSelectedItem.edit = edit;
            this.modalSelectedItem.path = 'SelectedItems';
            this.modalSelectedItem.categories = this.categories;
            this.modalSelectedItem.disableInput = true;
            this.modalSelectedItem.openModal();
        }
    }

    deleteItem(itemId: any) {
        console.log(itemId);
        const itemDocRef = doc(this.firestore, `${this.collectionName}/${itemId}`);
        deleteDoc(itemDocRef)
            .then(() => {
                console.log('Item deleted successfully!');
                this.getAllItems();
            }).catch((error) => {
            console.error('Error deleting item: ', error);
        });
    }

    // Function to add an item to the selected list
    addItemToSelectedList(item: Item) {
        const existingItem = this.selectedItems.find(i => i.id === item.id);
        if (!existingItem) {
            this.selectedItems.push(item);
            this.updateSelectedItemsInFirestore();
        } else {
            console.log('This item is already in the shopping list');
        }
    }

    updateSelectedItemsInFirestore() {
        const selectedItemsCollection = collection(this.firestore, 'SelectedItems');

        this.selectedItems.forEach(item => {
            const itemDocRef = item.id
                ? doc(this.firestore, `SelectedItems/${item.id}`)
                : doc(selectedItemsCollection);

            setDoc(itemDocRef, {
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                description: item.description
            }, { merge: true });

            this.getShoppingListItems();
        });
    }

    // Function to remove an item from the selected list
    removeItemFromSelectedList(item: Item) {
        const itemDocRef = doc(this.firestore, `SelectedItems/${item.id}`);
        deleteDoc(itemDocRef).then(() => {
            console.log('Item removed successfully');
            this.getShoppingListItems();
        }).catch(error => {
            console.error('Error removing item:', error);
        });
    }

    toggleAllItemsList() {
        this.showItemsList = !this.showItemsList;
    }

    toggleShoppingItemsList(): void {
        this.showCart = !this.showCart;
    }

    refresh() {
        this.getAllItems();
        this.getShoppingListItems();
    }
}
