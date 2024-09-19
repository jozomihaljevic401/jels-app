import {Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, RouterOutlet} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {ItemModalComponent} from "./item-modal/item-modal.component";

@Component({
  selector: 'app-root',
  standalone: true,
    imports: [CommonModule, RouterOutlet, FormsModule, ItemModalComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    currentYear: number = new Date().getFullYear();
}
