
import { Component, AfterViewInit, QueryList, ViewChildren, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.css']
})
export class TicTacToeComponent implements AfterViewInit {
  @ViewChildren('box') boxes!: QueryList<ElementRef>;

  currentPlayer = 'X';
  movesCount = 0;
  gameIsOver = false;
  winnerMessage = '';
  moves: string[] = [];

  winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    // Configura os ouvintes de evento para as caixas após o carregamento da vista
    this.boxes.forEach((box, index) => {
      this.renderer.listen(box.nativeElement, 'click', () => this.handleMove(index));
    });
    this.resetGame();
  }

  handleMove(index: number): void {
    const clickedBox = this.boxes.toArray()[index].nativeElement;

    if (this.gameIsOver || clickedBox.textContent !== '') {
      return;
    }

    if (this.moves.length >= 6) {
      this.unmakeOldMove();
    }

    this.makeMove(clickedBox);
    this.checkGameStatus();

    if (!this.gameIsOver) {
      this.switchPlayer();
    }
  }

  makeMove(clickedBox: HTMLElement): void {
    this.renderer.setProperty(clickedBox, 'textContent', this.currentPlayer);
    this.moves.push(clickedBox.id); // Guardar o ID em vez do elemento
    this.movesCount++;
    this.renderer.removeClass(clickedBox, 'selectable');
  }

  unmakeOldMove(): void {
    const oldMoveId = this.moves.shift();
    if (oldMoveId) {
      const oldBox = document.getElementById(oldMoveId);
      if (oldBox) {
        this.renderer.setProperty(oldBox, 'textContent', '');
        this.renderer.addClass(oldBox, 'selectable');
      }
    }
    this.movesCount--;
  }

  switchPlayer(): void {
    this.currentPlayer = (this.currentPlayer === 'X') ? 'O' : 'X';
  }

  checkGameStatus(): void {
    if (this.checkWin()) {
      this.endGame(`O jogador ${this.currentPlayer} venceu!`);
    } else if (this.movesCount === 9) {
      this.endGame('Empate!');
    }
  }

  checkWin(): boolean {
    const boxesArray = this.boxes.toArray().map(box => box.nativeElement.textContent);

    return this.winPatterns.some(pattern => {
      const [a, b, c] = pattern;
      return (
        boxesArray[a] !== '' &&
        boxesArray[a] === boxesArray[b] &&
        boxesArray[a] === boxesArray[c]
      );
    });
  }

  endGame(message: string): void {
    this.gameIsOver = true;
    this.winnerMessage = message;
    this.disableAllBoxes();
  }

  disableAllBoxes(): void {
    this.boxes.forEach(box => {
      this.renderer.removeClass(box.nativeElement, 'selectable');
    });
  }

  resetGame(): void {
    this.currentPlayer = 'X';
    this.movesCount = 0;
    this.gameIsOver = false;
    this.winnerMessage = '';
    this.moves = [];

    this.boxes.forEach(box => {
      this.renderer.setProperty(box.nativeElement, 'textContent', '');
      this.renderer.addClass(box.nativeElement, 'selectable');
    });
  }
}


// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-tic-tac-toe',
//   templateUrl: './tic-tac-toe.component.html',
//   styleUrl: './tic-tac-toe.component.css'
// })
// export class TicTacToeComponent {

// }
