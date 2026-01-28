import { Component } from '@angular/core';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {

  isOpen = false;

  constructor(private menuService: MenuService) {
    this.menuService.menuOpen$.subscribe(state => {
      this.isOpen = state;
    });
  }

  close() {
    this.menuService.close(); 
  }

}
