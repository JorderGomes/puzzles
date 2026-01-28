import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor() { }

  private menuOpen = new BehaviorSubject<boolean>(false);
  menuOpen$ = this.menuOpen.asObservable();

  toggle() {
    this.menuOpen.next(!this.menuOpen.value);
  }

  close() {
    this.menuOpen.next(false);
  }

}
