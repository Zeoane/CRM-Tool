import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { addDoc, collection } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { CrmUser, CrmUserRow } from './crm-user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly firestore = inject(Firestore);
  private readonly usersCollection = collection(this.firestore, 'users');

  getUsers(): Observable<CrmUserRow[]> {
    return collectionData(this.usersCollection, { idField: 'id' }) as Observable<CrmUserRow[]>;
  }

  async addUser(user: CrmUser): Promise<string> {
    const savePromise = addDoc(this.usersCollection, { ...user }).then((ref) => ref.id);

    const timeoutPromise = new Promise<never>((_, reject) => {
      globalThis.setTimeout(() => {
        reject(
          new Error(
            'Timeout: Firestore is not responding. Has the database been created in the Firebase project (test mode)?',
          ),
        );
      }, 12000);
    });

    return Promise.race([savePromise, timeoutPromise]);
  }
}
