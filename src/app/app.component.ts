import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {ItemModalComponent} from "./item-modal/item-modal.component";
import {ItemService} from "./item.service";
import {AngularFireAuth, AngularFireAuthModule} from "@angular/fire/compat/auth";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, ItemModalComponent, RouterModule, AngularFireAuthModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  itemCount: number = 0;
  isLoggedIn = false;

  constructor(private itemService: ItemService,
              private afAuth: AngularFireAuth,
              private router: Router) {
    this.afAuth.authState.subscribe(user => {
      this.isLoggedIn = !!user;
    })
  }

  ngOnInit() {
    this.itemService.itemCount$.subscribe((count: number) => {
      this.itemCount = count;
    });
  }

  onCartClick() {
    this.itemService.showCart();
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
