import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {addDoc, collection, doc, Firestore, updateDoc} from "@angular/fire/firestore";

@Component({
  selector: 'app-item-modal',
  standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './item-modal.component.html',
  styleUrl: './item-modal.component.css'
})
export class ItemModalComponent implements OnInit {
    @Input() title: string = 'Modal Title';
    @Input() item?: any;
    @Input() edit?: boolean;
    @Input() path?: string;
    @Input() categories?: string[];
    @Input() disableInput: boolean = false;
    @Output() updateCompleted = new EventEmitter<void>();
    isVisible: boolean = false;
    itemForm?: FormGroup;

    constructor(private fb: FormBuilder, private firestore: Firestore) {
    }

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.itemForm = this.fb.group({
            id: [this.item?.id || ''],
            name: [{ value: this.item?.name || '', disabled: this.disableInput }, Validators.required],
            category: [this.item?.category || '', Validators.required],
            description: [this.item?.description || ''],
            quantity: [this.item?.quantity || 1, [Validators.required, Validators.min(1)]],
        });
    }

    openModal(): void {
        this.isVisible = true;
        if (this.item) {
            this.itemForm?.patchValue({
                id: '',
                name: this.item.name,
                category: this.item.category,
                description: this.item.description,
                quantity: this.item.quantity
            });
        }
        if (this.disableInput) {
            this.itemForm?.get('name')?.disable();
            this.itemForm?.get('category')?.disable();
        } else {
            this.itemForm?.get('name')?.enable();
            this.itemForm?.get('category')?.enable();
        }
        if (!this.edit) {
            this.title = 'Dodaj novi artikal';
        }
    }

    closeModal() {
        this.isVisible = false;
    }

    onSubmit() {
        if (this.itemForm && this.itemForm.valid) {
            console.log('Form Submitted', this.itemForm.getRawValue());

            if (this.edit) {
                const itemId = this.item.id; // Assuming `item.id` is available
                const itemToEdit = { ...this.itemForm.getRawValue()};
                if (!itemToEdit.id) {
                    delete itemToEdit.id;
                }
                const itemDocRef = doc(this.firestore, `${this.path}/${itemId}`);

                updateDoc(itemDocRef, itemToEdit)
                    .then(() => {
                        console.log('Item updated successfully');
                        this.updateCompleted.emit();
                    })
                    .catch(error => {
                        console.error('Error updating item:', error);
                    });
            } else {
                // TODO: rename testCollection
                const testCollection = collection(this.firestore, `${this.path}/`);

                // Remove id if it's empty or not valid
                const newItem = { ...this.itemForm.value };
                if (!newItem.id) {
                    delete newItem.id; // Remove `id` field before adding
                }

                addDoc(testCollection, newItem)
                    .then(() => {
                        console.log('Item added successfully!');
                        this.updateCompleted.emit();
                    })
                    .catch((error) => {
                        console.error('Error adding item: ', error);
                    });
            }
        }
    }
}
