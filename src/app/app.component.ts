import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, RouterOutlet} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {ItemModalComponent} from "./item-modal/item-modal.component";
import {ItemService} from "./item.service";

@Component({
  selector: 'app-root',
  standalone: true,
    imports: [CommonModule, RouterOutlet, FormsModule, ItemModalComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    currentYear: number = new Date().getFullYear();
    itemCount: number = 0;

    constructor(private itemService: ItemService) {
    }

    ngOnInit() {
        this.itemService.itemCount$.subscribe((count: number) => {
            this.itemCount = count;
        });
    }

    onCartClick() {
        this.itemService.showCart();
    }
}
