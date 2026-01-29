import { Component } from '@angular/core';
import { NavItemType } from '../../components/item-nav/item-nav.component';

@Component({
  selector: 'app-styleguide',
  templateUrl: './styleguide.component.html',
  styleUrl: './styleguide.component.css'
})
export class StyleguideComponent {

  public NavItemType = NavItemType;

  onRulesClick(): void {
    console.log('Rules clicked!');
  }

  onDescriptionClick(): void {
    console.log('Description clicked!');
  }

  onPlayClick(): void {
    console.log('Play clicked!');
  }

}
