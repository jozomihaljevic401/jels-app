import { Injectable } from '@angular/core';
import {addDoc, collection, deleteDoc, doc, Firestore, getDocs, query, updateDoc, where} from "@angular/fire/firestore";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ItemService {
    private collectionNameAllItems = 'ShoppingItems';
    private collectionNameSelectedItems = 'SelectedItems';
    private itemCount = new BehaviorSubject<number>(0)
    itemCount$ = this.itemCount.asObservable();
    private showCartSubject = new BehaviorSubject<boolean>(false);
    showCart$ = this.showCartSubject.asObservable();

    constructor(private firestore: Firestore) { }

    async getAllItemsFromFirestore() {
        const itemsCollection = collection(this.firestore, this.collectionNameAllItems);
        const querySnapshot = await getDocs(itemsCollection);

        const res = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(res);
        return res;
    }

    async getSelectedItemsFromFirestore() {
        const itemsCollection = collection(this.firestore, this.collectionNameSelectedItems);
        const querySnapshot = await getDocs(itemsCollection);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    addNewCategoryToFirestore(newCategoryItem: any) {
        const shoppingItemsCollection = collection(this.firestore, this.collectionNameAllItems);
        return addDoc(shoppingItemsCollection, newCategoryItem);
    }

    async updateCategoryNameInFirestore (collectionName: string, oldCategory: string, newCategory: string) {
        // Get the reference to the collection using collection() method from Firebase Firestore
        const collectionRef = collection(this.firestore, collectionName);

        // Create a query to find documents with the old category name
        const q = query(collectionRef, where('category', '==', oldCategory));

        // Get the documents that match the query
        const querySnapshot = await getDocs(q);

        // Loop through the documents and update the category field
        for (const documentSnapshot of querySnapshot.docs) {
            const docId = documentSnapshot.id;

            // Check if document ID is valid
            if (docId) {
                const docRef = doc(this.firestore, collectionName, docId); // Get the document reference
                try {
                    await updateDoc(docRef, {
                        category: newCategory // Update the category field with the new value
                    });
                    console.log(`Document in ${collectionName} with ID: ${docId} updated successfully`);
                } catch (error) {
                    console.error(`Failed to update document in ${collectionName} with ID: ${docId}`, error);
                }
            } else {
                console.warn('Document is missing an ID:', documentSnapshot.data());
            }
        }
    }

    async deleteAllItemsWithThisCategoryInFirestore(category: string, i: number) {
        const collections = [this.collectionNameAllItems, this.collectionNameSelectedItems];
        console.log(category, i);

        // Iterate through each collection
        for (const coll of collections) {
            // Create a query to find items with the specific category
            const q = query(collection(this.firestore, coll), where('category', '==', category));

            // Get the query snapshot
            const querySnapshot = await getDocs(q);

            // Iterate through each document in the snapshot
            querySnapshot.forEach(async (docSnapshot) => {
                // Delete the document
                await deleteDoc(doc(this.firestore, coll, docSnapshot.id))
                console.log(`Deleted ${docSnapshot.id} from ${coll}`);
            })
        }
    }

    updateItemCount(newCount: number) {
        this.itemCount.next(newCount);
    }

    // Method to toggle cart state
    showCart() {
        this.showCartSubject.next(true);
    }

    hideCart() {
        this.showCartSubject.next(false);
    }
}
