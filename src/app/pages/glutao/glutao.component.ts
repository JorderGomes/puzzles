import { AfterViewInit, Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-glutao',
  templateUrl: './glutao.component.html',
  styleUrls: ['./glutao.component.css']
})
export class GlutaoComponent implements AfterViewInit {
  @ViewChild('piecesContainer') piecesContainer!: ElementRef;
  @ViewChild('playerText') playerText!: ElementRef;
  @ViewChild('rulesClick') rulesClick!: ElementRef;

  isMenuOpen = false;
  showRulesPopup = false;

  constructor(private renderer: Renderer2) { }

  minPieces = 15;
  maxPieces = 26;
  minRemoval = 3;
  maxRemoval = 6;
  QtyExistingPieces: number = 0;
  QtyRemoval: number = 0;
  selectedPieces: HTMLElement[] = [];
  gameMode = 'hard';

  ngAfterViewInit(): void {
    this.createGame();
    this.setupListeners();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onRulesClick(): void {
    this.showRulesPopup = true;
  }

  closeRulesPopup(): void {
    this.showRulesPopup = false;
  }

  setupListeners(): void {
    this.piecesContainer.nativeElement.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('selectable')) {
        this.selectPiece(target);
      } else if (target.classList.contains('selected')) {
        this.deselectPiece(target);
      }
    });
  }

  createGame(): void {
    setTimeout(() => {
      this.QtyExistingPieces = Math.floor(Math.random() * (this.maxPieces - this.minPieces) + this.minPieces);
      this.QtyRemoval = Math.floor(Math.random() * (this.maxRemoval - this.minRemoval) + this.minRemoval);
      this.createPiecesHTML();
    }, 0);
  }

  createPiecesHTML(): void {
    const container = this.piecesContainer.nativeElement;

    // Limpa o conteúdo do container
    while (container.firstChild) {
      this.renderer.removeChild(container, container.firstChild);
    }

    for (let i = 0; i < this.QtyExistingPieces; i++) {
      const piece = this.renderer.createElement('i');
      this.renderer.addClass(piece, 'fas');
      this.renderer.addClass(piece, 'fa-apple-alt');

      if (i === this.QtyExistingPieces - 1) {
        this.renderer.addClass(piece, 'rotten');
      } else {
        this.renderer.addClass(piece, 'selectable');
      }
      this.renderer.setAttribute(piece, 'id', `piece-${i}`);
      this.renderer.appendChild(container, piece);
    }
  }

  selectPiece(piece: HTMLElement): void {
    if (this.selectedPieces.length < this.QtyRemoval) {
      piece.classList.add('selected');
      piece.classList.remove('selectable');
      this.selectedPieces.push(piece);
    }
  }

  deselectPiece(piece: HTMLElement): void {
    piece.classList.remove('selected');
    piece.classList.add('selectable');
    const index = this.selectedPieces.indexOf(piece);
    if (index > -1) {
      this.selectedPieces.splice(index, 1);
    }
  }

  removePieces(): void {
    if (this.selectedPieces.length === 0) {
      console.log("Por favor escolha algumas maçãs");
      return;
    }
    this.selectedPieces.forEach(piece => piece.remove());
    this.QtyExistingPieces -= this.selectedPieces.length;
    this.selectedPieces = [];
    this.changePlayer();
    this.verifyEndGame();
    this.blockPieces();
  }

  onReplayClick(): void {
    this.selectedPieces = [];
    this.playerText.nativeElement.textContent = "Sua vez!";
    this.createGame();
    this.unblockPieces();
  }

  changePlayer(): void {
    const currentPlayer = this.playerText.nativeElement.textContent;
    this.playerText.nativeElement.textContent = currentPlayer === "Sua vez!" ? "Minha vez!" : "Sua vez!";
  }

  verifyEndGame(): void {
    if (this.QtyExistingPieces <= 1) {
      const currentPlayer = this.playerText.nativeElement.textContent;
      this.playerText.nativeElement.textContent = currentPlayer === "Sua vez!" ? "Você perdeu!" : "Você venceu!";
    }
  }

  play(): void {
    if (this.gameMode === "easy") {
      this.playEasy();
    } else if (this.gameMode === "medium") {
      this.playMedium();
    } else if (this.gameMode === "hard") {
      this.playHard();
    }
  }

  playMedium(): void {
    const decision = Math.floor(Math.random() * 2);
    if (decision === 0) {
      this.playEasy();
    } else {
      this.playHard();
    }
  }

  playEasy(): void {
    let qtyToRemove = Math.floor(Math.random() * (Math.min(this.QtyRemoval, this.QtyExistingPieces - 1)) + 1);
    this.autoSelectPieces(qtyToRemove);
    this.removePieces();
  }

  autoSelectPieces(qtd: number): void {
    const allPieces = Array.from(this.piecesContainer.nativeElement.children);
    while (this.selectedPieces.length < qtd) {
      const index = Math.floor(Math.random() * allPieces.length);
      const piece = allPieces[index] as HTMLElement;
      if (piece && !piece.classList.contains('rotten') && !this.selectedPieces.includes(piece)) {
        this.selectPiece(piece);
      }
    }
  }

  playHard(): void {
    const critical = (this.QtyExistingPieces - 1) % (this.QtyRemoval + 1);
    if (critical === 0) {
      this.playEasy();
    } else {
      this.autoSelectPieces(critical);
      this.removePieces();
    }
  }

  blockPieces(): void {
    const allPieces = this.piecesContainer.nativeElement.children;
    for (let i = 0; i < allPieces.length; i++) {
      const piece = allPieces[i] as HTMLElement;
      if (piece.classList.contains('selectable')) {
        piece.classList.add('disable');
        piece.classList.remove('selectable');
      }
    }
  }

  unblockPieces(): void {
    const allPieces = this.piecesContainer.nativeElement.children;
    for (let i = 0; i < allPieces.length; i++) {
      const piece = allPieces[i] as HTMLElement;
      if (piece.classList.contains('disable')) {
        piece.classList.add('selectable');
        piece.classList.remove('disable');
      }
    }
  }

  // Métodos de eventos do HTML
  onEatClick(): void {
    this.removePieces();
    setTimeout(() => {
      this.play();
      setTimeout(() => this.unblockPieces(), 1500);
    }, 1000);
  }

  onGameModeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.gameMode = target.value;
    }
  }

}
