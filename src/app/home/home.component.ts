import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
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

    @ViewChild('modalShoppingListItem') modalShoppingListItem?: ItemModalComponent;
    @ViewChild('modalSelectedItem') modalSelectedItem?: ItemModalComponent;
    @ViewChild('toastContainerRef', { static: true }) toastContainerRef!: ElementRef;

    constructor(
        private firestore: Firestore,
        private itemService: ItemService,
        private renderer: Renderer2) {
    }

    ngOnInit() {
        this.getAllItems();
        this.getShoppingListItems();
        this.itemService.updateItemCount(this.selectedItems.length);

        // TODO: make cartService move it there maybe?
        this.itemService.showCart$.subscribe((showCart: boolean) => {
            this.showItemsList = !showCart;
            this.showCart = showCart;
        });
        this.showItemsList = false;
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
                this.selectedItems = this.shoppingListItems;
                this.itemCount = this.shoppingListItems.length;
                this.itemService.updateItemCount(this.itemCount);
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
            this.itemService.updateItemCount(this.selectedItems.length);
            this.showToast('Artikal je uspješno dodan u popis', 'success');
        } else {
            this.showToast('Ovaj artikal je već u popisu!', 'danger');
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

    toggleAllItemsList(event: Event) {
        const target = event.target as HTMLInputElement;
        this.showItemsList = target.checked; // Set the value to the checkbox state
        console.log('Show items list:', this.showItemsList);
    }

    toggleShoppingItemsList(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.showCart = target.checked; // Update showCart based on the switch state
        console.log('Show cart:', this.showCart);
    }

    refresh() {
        this.getAllItems();
        this.getShoppingListItems();
    }

    showToast(message: string, type: 'success' | 'danger') {
        // Create a new toast element
        const toastElement = this.renderer.createElement('div');
        toastElement.classList.add('toast', 'align-items-center', 'text-white', 'border-0', `bg-${type}`);
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.style.display = 'block'; // Ensure it's visible

        // Create the toast body with the message
        const toastBody = this.renderer.createElement('div');
        toastBody.classList.add('toast-body');
        toastBody.innerHTML = message;

        // Create a close button for the toast
        const closeButton = this.renderer.createElement('button');
        closeButton.classList.add('btn-close', 'btn-close-white', 'me-2', 'm-auto');
        closeButton.setAttribute('aria-label', 'Close');
        this.renderer.listen(closeButton, 'click', () => {
            this.renderer.removeChild(this.toastContainerRef.nativeElement, toastElement);
        });

        // Create a div to hold the close button and message
        const toastContent = this.renderer.createElement('div');
        toastContent.classList.add('d-flex');
        this.renderer.appendChild(toastContent, toastBody);
        this.renderer.appendChild(toastContent, closeButton);

        // Add content to the toast element
        this.renderer.appendChild(toastElement, toastContent);

        // Append the toast to the container
        this.renderer.appendChild(this.toastContainerRef.nativeElement, toastElement);
        toastElement.classList.add('show');

        // Automatically hide the toast after a delay (e.g., 2 seconds)
        setTimeout(() => {
            this.renderer.removeChild(this.toastContainerRef.nativeElement, toastElement);
        }, 2000); // Adjust the delay as needed
    }
}
