import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import {firebaseConfig} from "../../firebaseConfig";
import {AngularFireModule} from "@angular/fire/compat";

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AngularFireModule.initializeApp(firebaseConfig)),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    // provideAppCheck(() => {
    //       // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
    //     const provider = new ReCaptchaEnterpriseProvider(/* reCAPTCHA Enterprise site key */);
    //     return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
    //   }),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase())
  ]
};
