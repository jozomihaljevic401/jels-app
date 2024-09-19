import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AboutComponent } from './about/about.component';
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
    { path: 'home', component: HomeComponent },  // Home route
    { path: 'about', component: AboutComponent } // About route
];

export const appRouting = [
    provideRouter(routes)
];