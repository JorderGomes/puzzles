
import { Component, AfterViewInit, Inject, ElementRef, Renderer2, ViewChild, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-guess',
  templateUrl: './guess.component.html',
  styleUrls: ['./guess.component.css']
})
export class GuessComponent implements AfterViewInit {
  // Referência ao elemento #colors do DOM
  @ViewChild('colors') colorsContainer!: ElementRef;

  // Variáveis do jogo (antigas variáveis globais)
  private colors!: HTMLElement;
  colorsToSwap: string[] = [];
  allColors = ["red", "blue", "pink", "yellow", "green", "purple"];
  secretColors = ["red", "blue", "pink", "yellow", "green", "purple"];
  qtdAttempts = 0;
  endGame = false;
  hitCount = 0;
  showRulesPopup = false;
  isMenuOpen = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.colors = this.colorsContainer.nativeElement;
      this.initGame();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onRulesClick(): void {
    this.showRulesPopup = true;
  }
  
  onResetClick(): void {
    console.log('Reiniciando o jogo...');
    this.qtdAttempts = 0;
    this.endGame = false;
    this.colorsToSwap = [];
    this.hitCount = 0;
    
    // Limpa o conteúdo atual para criar novas "casas"
    if (this.colorsContainer && this.colorsContainer.nativeElement) {
      this.renderer.setProperty(this.colorsContainer.nativeElement, 'innerHTML', '');
    }
    
    this.initGame();
  }

  // Lógica do jogo
  testWin(): void {
    let contHit = 0;
    for (let i = 0; i < this.allColors.length; i++) {
      if (this.allColors[i] === this.secretColors[i]) {
        contHit++;
      }
    }
    this.hitCount = contHit;

    if (this.hitCount === this.secretColors.length) {
      this.endGame = true;
    }
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  createHouse(color: string): void {
    const house = this.renderer.createElement('div');
    this.renderer.setAttribute(house, 'id', color);
    this.renderer.addClass(house, 'circle');
    this.renderer.addClass(house, 'flex-center');
    this.renderer.appendChild(this.colors, house);
  }

  initGame(): void {
    this.shuffleArray(this.secretColors);
    this.allColors.map(color => this.createHouse(color));
    this.testWin();
  }

  // Lógica de eventos
  onColorClick(event: MouseEvent): void {
    if (this.endGame) {
      return;
    }

    const target = event.target as HTMLElement;
    if (!target || !target.classList.contains('circle')) {
      return;
    }

    const id = target.getAttribute('id');
    if (!id) return;

    if (this.colorsToSwap.includes(id)) {
      this.renderer.removeClass(target, 'selected');
      this.colorsToSwap = [];
      return;
    }

    this.colorsToSwap.push(id);
    this.renderer.addClass(target, 'selected');

    if (this.colorsToSwap.length === 2) {
      this.swapColors();
      this.colorsToSwap = [];
      this.qtdAttempts++;
      this.testWin();
    }
  }

  swapColors(): void {
    const [id1, id2] = this.colorsToSwap;
    const house1 = this.renderer.selectRootElement(`#${id1}`, true);
    const house2 = this.renderer.selectRootElement(`#${id2}`, true);

    const position1 = this.allColors.indexOf(id1);
    const position2 = this.allColors.indexOf(id2);
    [this.allColors[position1], this.allColors[position2]] = [this.allColors[position2], this.allColors[position1]];

    this.renderer.removeClass(house1, 'selected');
    this.renderer.removeClass(house2, 'selected');

    // Troca os IDs dos elementos para refletir a nova ordem
    this.renderer.setAttribute(house1, 'id', id2);
    this.renderer.setAttribute(house2, 'id', id1);
  }

  // Lógica do popup de regras
  toggleRulesPopup(): void {
    this.showRulesPopup = !this.showRulesPopup;
  }
}

// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-guess',
//   templateUrl: './guess.component.html',
//   styleUrl: './guess.component.css'
// })
// export class GuessComponent {

// }
