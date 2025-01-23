import { Component } from '@angular/core';
import {AngularFireAuth, AngularFireAuthModule} from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {Firestore, collection, getDocs} from '@angular/fire/firestore';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, AngularFireAuthModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private afAuth: AngularFireAuth, private router: Router, private firestore: Firestore) {}

  async login() {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      const user = userCredential.user;
      console.log(user);

      if (user) {
        // Check if the user's email is whitelisted
        this.checkIfWhitelisted(user.email);
        this.afAuth.setPersistence('local');
      }
    } catch (error) {
      this.errorMessage = 'Invalid login credentials';
    }
  }

  async checkIfWhitelisted(email: string | null) {
    if (!email) {
      await this.afAuth.signOut();
      this.errorMessage = 'Email not found';
      return;
    }

    // Check Firestore if the email is in the whitelisted collection
    const emailsCollection = collection(this.firestore, 'whitelistedEmails');
    const snapshot = await getDocs(emailsCollection);
    const whitelistedEmails = snapshot.docs.map(doc => doc.data()['email']);

    if (whitelistedEmails.includes(email)) {
      // Email is whitelisted, redirect to home page or dashboard
      await this.router.navigate(['/home']);
    } else {
      // Email not whitelisted, sign out
      await this.afAuth.signOut();
      this.errorMessage = 'Your account is not whitelisted.';
    }
  }
}
