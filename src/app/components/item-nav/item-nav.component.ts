import { Component, Input } from '@angular/core';

export enum NavItemType {
  LINK = 'link',
  BUTTON = 'button'
}

@Component({
  selector: 'app-item-nav',
  templateUrl: './item-nav.component.html',
  styleUrl: './item-nav.component.css'
})
export class ItemNavComponent {
  @Input() type: NavItemType = NavItemType.LINK;
  @Input() name: string = '';
  @Input() icon: string = '';
  @Input() link: string = '';

  public NavType = NavItemType;
}
