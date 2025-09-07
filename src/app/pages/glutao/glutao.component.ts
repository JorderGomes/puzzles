import { AfterViewInit, Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-glutao',
  templateUrl: './glutao.component.html',
  styleUrls: ['./glutao.component.css']
})
export class GlutaoComponent implements AfterViewInit {
  @ViewChild('pecasContainer') pecasContainer!: ElementRef;
  @ViewChild('playerText') playerText!: ElementRef;
  @ViewChild('rulesClick') rulesClick!: ElementRef;

  constructor(private renderer: Renderer2) { }

  minPecas = 15;
  maxPecas = 26;
  minRetirada = 3;
  maxRetirada = 6;
  qtdPecasExistentes!: number;
  qtdRetirada!: number;
  pecasSelecionadas: HTMLElement[] = [];
  gameMode = 'hard';

  ngAfterViewInit(): void {
    this.criarJogo();
    this.setupListeners();
  }

  setupListeners(): void {
    this.pecasContainer.nativeElement.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('selectable')) {
        this.selecionarPeca(target);
      } else if (target.classList.contains('selected')) {
        this.deselecionarPeca(target);
      }
    });

    this.rulesClick.nativeElement.addEventListener('click', () => {
      window.alert(
        "Aqui há " + this.qtdPecasExistentes +
        " maçãs. \nDurante o jogo cada jogador alternativamente " +
        "pode retirar desde 1 até " + this.qtdRetirada +
        " delas. \nAquele que ficar com o último perderá. "
      );
    });
  }

  criarJogo(): void {
    this.qtdPecasExistentes = Math.floor(Math.random() * (this.maxPecas - this.minPecas) + this.minPecas);
    this.qtdRetirada = Math.floor(Math.random() * (this.maxRetirada - this.minRetirada) + this.minRetirada);
    this.criarPecasHTML();
  }

  // criarPecasHTML(): void {
  //   this.pecasContainer.nativeElement.innerHTML = '';
  //   for (let i = 0; i < this.qtdPecasExistentes; i++) {
  //     const peca = document.createElement('i');
  //     peca.classList.add('fas', 'fa-apple-alt');
  //     if (i === this.qtdPecasExistentes - 1) {
  //       peca.classList.add('rotten');
  //     } else {
  //       peca.classList.add('selectable');
  //     }
  //     peca.id = `peca-${i}`;
  //     this.pecasContainer.nativeElement.appendChild(peca);
  //   }
  // }

  criarPecasHTML(): void {
    const container = this.pecasContainer.nativeElement;

    // Limpa o conteúdo do container
    while (container.firstChild) {
      this.renderer.removeChild(container, container.firstChild);
    }

    for (let i = 0; i < this.qtdPecasExistentes; i++) {
      const peca = this.renderer.createElement('i');
      this.renderer.addClass(peca, 'fas');
      this.renderer.addClass(peca, 'fa-apple-alt');

      if (i === this.qtdPecasExistentes - 1) {
        this.renderer.addClass(peca, 'rotten');
      } else {
        this.renderer.addClass(peca, 'selectable');
      }
      this.renderer.setAttribute(peca, 'id', `peca-${i}`);
      this.renderer.appendChild(container, peca);
    }
  }

  selecionarPeca(peca: HTMLElement): void {
    if (this.pecasSelecionadas.length < this.qtdRetirada) {
      peca.classList.add('selected');
      peca.classList.remove('selectable');
      this.pecasSelecionadas.push(peca);
    }
  }

  deselecionarPeca(peca: HTMLElement): void {
    peca.classList.remove('selected');
    peca.classList.add('selectable');
    const index = this.pecasSelecionadas.indexOf(peca);
    if (index > -1) {
      this.pecasSelecionadas.splice(index, 1);
    }
  }

  comer(): void {
    if (this.pecasSelecionadas.length === 0) {
      console.log("Por favor escolha algumas maçãs");
      return;
    }
    this.pecasSelecionadas.forEach(peca => peca.remove());
    this.qtdPecasExistentes -= this.pecasSelecionadas.length;
    this.pecasSelecionadas = [];
    this.mudarJogador();
    this.verificarFimDeJogo();
    this.bloquearPecas();
    setTimeout(() => {
      this.jogar();
      setTimeout(() => this.desbloquearPecas(), 1500);
    }, 1000);
  }

  mudarJogador(): void {
    const jogadorAtual = this.playerText.nativeElement.textContent;
    this.playerText.nativeElement.textContent = jogadorAtual === "Sua vez!" ? "Minha vez!" : "Sua vez!";
  }

  verificarFimDeJogo(): void {
    if (this.qtdPecasExistentes <= 1) {
      const jogadorAtual = this.playerText.nativeElement.textContent;
      this.playerText.nativeElement.textContent = jogadorAtual === "Sua vez!" ? "Você perdeu!" : "Você venceu!";
    }
  }

  jogar(): void {
    if (this.gameMode === "easy") {
      this.jogarEasy();
    } else if (this.gameMode === "medium") {
      this.jogarMedium();
    } else if (this.gameMode === "hard") {
      this.jogarHard();
    }
  }

  jogarMedium(): void {
    const decision = Math.floor(Math.random() * 2);
    if (decision === 0) {
      this.jogarEasy();
    } else {
      this.jogarHard();
    }
  }

  jogarEasy(): void {
    let qtdARetirar = Math.floor(Math.random() * (Math.min(this.qtdRetirada, this.qtdPecasExistentes - 1)) + 1);
    this.selecionarPecasAutomaticamente(qtdARetirar);
    this.comer();
  }

  selecionarPecasAutomaticamente(qtd: number): void {
    const todasPecas = Array.from(this.pecasContainer.nativeElement.children);
    while (this.pecasSelecionadas.length < qtd) {
      const indice = Math.floor(Math.random() * todasPecas.length);
      const peca = todasPecas[indice] as HTMLElement;
      if (peca && !peca.classList.contains('rotten') && !this.pecasSelecionadas.includes(peca)) {
        this.selecionarPeca(peca);
      }
    }
  }

  jogarHard(): void {
    const critico = (this.qtdPecasExistentes - 1) % (this.qtdRetirada + 1);
    if (critico === 0) {
      this.jogarEasy();
    } else {
      this.selecionarPecasAutomaticamente(critico);
      this.comer();
    }
  }

  bloquearPecas(): void {
    const todasPecas = this.pecasContainer.nativeElement.children;
    for (let i = 0; i < todasPecas.length; i++) {
      const peca = todasPecas[i] as HTMLElement;
      if (peca.classList.contains('selectable')) {
        peca.classList.add('disable');
        peca.classList.remove('selectable');
      }
    }
  }

  desbloquearPecas(): void {
    const todasPecas = this.pecasContainer.nativeElement.children;
    for (let i = 0; i < todasPecas.length; i++) {
      const peca = todasPecas[i] as HTMLElement;
      if (peca.classList.contains('disable')) {
        peca.classList.add('selectable');
        peca.classList.remove('disable');
      }
    }
  }

  // Métodos de eventos do HTML
  onComerClick(): void {
    this.comer();
  }

  // onGameModeChange(mode: string): void {
  //   this.gameMode = mode;
  // }
  onGameModeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.gameMode = target.value;
    }
  }
}

// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-glutao',
//   templateUrl: './glutao.component.html',
//   styleUrl: './glutao.component.css'
// })
// export class GlutaoComponent {

// }
