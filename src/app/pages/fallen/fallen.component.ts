
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-fallen',
  templateUrl: './fallen.component.html',
  styleUrls: ['./fallen.component.css']
})
export class FallenComponent implements OnDestroy, AfterViewInit {
  
  @ViewChild('maze') mazeElement!: ElementRef;

  private height = 10;
  private width = 10;
  private gameOn = true;
  private fruitHouse: any;
  private maxReach = 1;

  private maze!: HTMLElement;
  private stack: any[] = [];
  private completeMaze: any[] = [];
  private completeBoard: any[] = [];
  private availableMaze: any[] = [];
  private reachedHouses: any[] = [];

  private Player: any;

  private readonly empty = 'empty';
  private readonly character = 'character';
  private readonly wall = 'wall';
  private readonly open = 'open';
  private readonly fruit = 'fruit';
  private readonly light = 'light';

   constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
        this.maze = this.mazeElement.nativeElement;
        this.setupBoard();
        this.bindEvents();
    }
    // this.maze = document.getElementById("maze") as HTMLElement;
    // this.setupBoard();
    // Adiciona event listeners para os botões de controle e teclado
    // this.bindEvents();
  }

  ngOnDestroy(): void {
    // Limpa os event listeners para evitar memory leaks
    if (isPlatformBrowser(this.platformId)) {
        this.unbindEvents();
    }
  }

  private bindEvents(): void {
    document.addEventListener("keydown", this.handleKeyboardEvent);

    document.getElementById('btn-up')?.addEventListener('click', this.moveUp);
    document.getElementById('btn-down')?.addEventListener('click', this.moveDown);
    document.getElementById('btn-left')?.addEventListener('click', this.moveLeft);
    document.getElementById('btn-right')?.addEventListener('click', this.moveRight);

    document.getElementById('btn-rules')?.addEventListener('click', this.showRules);
    document.getElementById('btn-rules-close')?.addEventListener('click', this.hideRules);
  }

  private unbindEvents(): void {
    document.removeEventListener("keydown", this.handleKeyboardEvent);
    document.getElementById('btn-up')?.removeEventListener('click', this.moveUp);
    document.getElementById('btn-down')?.removeEventListener('click', this.moveDown);
    document.getElementById('btn-left')?.removeEventListener('click', this.moveLeft);
    document.getElementById('btn-right')?.removeEventListener('click', this.moveRight);
    document.getElementById('btn-rules')?.removeEventListener('click', this.showRules);
    document.getElementById('btn-rules-close')?.removeEventListener('click', this.hideRules);
  }

  private handleKeyboardEvent = (e: KeyboardEvent) => {
    if (!this.gameOn) {
      return;
    }
    const moveFunction = this.playerEvents[e.key as keyof typeof this.playerEvents];
    if (moveFunction) {
      moveFunction();
    }
  }

  private playerEvents: { [key: string]: () => void } = {
    ArrowUp: () => this.moveCharacter(-1, 0),
    ArrowDown: () => this.moveCharacter(1, 0),
    ArrowLeft: () => this.moveCharacter(0, -1),
    ArrowRight: () => this.moveCharacter(0, 1),
  };

  private moveUp = () => this.playerEvents["ArrowUp"]();
  private moveDown = () => this.playerEvents["ArrowDown"]();
  private moveLeft = () => this.playerEvents["ArrowLeft"]();
  private moveRight = () => this.playerEvents["ArrowRight"]();

  private moveCharacter(dx: number, dy: number): void {
    const nextX = this.Player.house.x + dx;
    const nextY = this.Player.house.y + dy;

    if (nextX < 0 || nextX >= this.height || nextY < 0 || nextY >= this.width) {
      return;
    }

    const newHouseId = this.generateId(nextX, nextY);
    const newHouse = document.getElementById(newHouseId);

    if (newHouse?.classList.contains(this.empty)) {
      this.endGame(false);
      return;
    }

    this.turnOffLights();

    this.Player.house.updateHouse(nextX, nextY);

    this.turnOnLights();
    this.detectCollision();
  }

  private showRules = () => {
    const popupCanvas = document.getElementById('popup-canvas');
    const popupRules = document.getElementById('popup-rules');
    if (popupCanvas && popupRules) {
      popupCanvas.style.display = 'flex';
      popupRules.style.display = 'block';
    }
  }

  private hideRules = () => {
    const popupCanvas = document.getElementById('popup-canvas');
    const popupRules = document.getElementById('popup-rules');
    if (popupCanvas && popupRules) {
      popupCanvas.style.display = 'none';
      popupRules.style.display = 'none';
    }
  }


  private generateId(x: number, y: number): string {
    return "cell-" + x + "-" + y;
  }

  private setupBoard(): void {
    // Limpa o labirinto antes de criar um novo
    while (this.maze.firstChild) {
      this.maze.removeChild(this.maze.firstChild);
    }

    this.completeBoard = [];
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const cellId = this.generateId(i, j);
        const cell = document.createElement("div");
        cell.classList.add('cell', this.empty);
        cell.id = cellId;
        const house = { house: cell, x: i, y: j, tunnelable: false, updateHouse: (newX: number, newY: number) => this.updateHouse(house, newX, newY) };
        this.maze.appendChild(cell);
        this.completeBoard.push(house);
      }
    }
    this.generateMaze();
    this.assignInitialHouse();
    this.assignFruitHouse();
    this.turnOnLights();
  }

  private updateHouse(house: any, newX: number, newY: number): void {
    const newHouseId = this.generateId(newX, newY);
    const newHouse = document.getElementById(newHouseId);

    if (newHouse?.classList.contains(this.empty)) {
      this.endGame(false);
      return;
    }

    this.swapHouseClass(house.house, this.character, this.open);
    this.swapHouseClass(newHouse as HTMLElement, this.open, this.character);
    house.house = newHouse;
    house.x = newX;
    house.y = newY;
  }

  private chooseRandomHouseFromMaze(): any {
    const i = Math.floor(Math.random() * this.completeMaze.length);
    return this.completeMaze[i];
  }

  private assignInitialHouse(): void {
    const houseNow = this.chooseRandomHouseFromMaze();
    this.swapHouseClass(houseNow.house, this.open, this.character);
    this.Player = { house: houseNow };
    this.availableMaze = this.completeMaze.filter(el => !el.house.classList.contains(this.character));
  }

  private assignFruitHouse(): void {
    this.fruitHouse = this.availableMaze[Math.floor(Math.random() * this.availableMaze.length)];
    this.swapHouseClass(this.fruitHouse.house, this.open, this.fruit);
    this.availableMaze = this.completeMaze.filter(el => !el.house.classList.contains(this.fruit));
  }

  private swapHouseClass(house: HTMLElement, remClass: string, addClass: string): void {
    house.classList.remove(remClass);
    house.classList.add(addClass);
  }

  private turnOnLights(): void {
    const max = this.maxReach;
    this.reachedHouses = [];
    const neighbors = this.getNeighbors(this.Player.house);
    for (const viz of neighbors) {
      const pos = { x: viz.x - this.Player.house.x, y: viz.y - this.Player.house.y };
      this.drawReach(viz, max, pos);
    }
    for (const al of this.reachedHouses) {
      al.house.classList.add(this.light);
    }
  }

  private turnOffLights(): void {
    for (const al of this.reachedHouses) {
      al.house.classList.remove(this.light);
    }
  }

  private drawReach(neighbor: any, max: number, pos: { x: number, y: number }): void {
    if (!neighbor.house || max === 0 || neighbor.house.classList.contains(this.empty) || neighbor.house.classList.contains(this.fruit)) {
      return;
    }
    this.reachedHouses.push(neighbor);
    const nextX = pos.x + neighbor.x;
    const nextY = pos.y + neighbor.y;
    const newNeighbor = { house: document.getElementById(this.generateId(nextX, nextY)), x: nextX, y: nextY };
    this.drawReach(newNeighbor, max - 1, pos);
  }

  private endGame(result: boolean): void {
    if (result) {
      alert("You won!");
    } else {
      alert("You lost!");
    }
    this.setupBoard();
  }

  private detectCollision(): void {
    if (this.fruitHouse.house.classList.contains(this.fruit) && this.fruitHouse.house.classList.contains(this.character)) {
      this.endGame(true);
    }
  }

  private generateMaze(): void {
    const initialHouse = this.completeBoard[Math.floor(Math.random() * this.completeBoard.length)];
    this.swapHouseClass(initialHouse.house, this.empty, this.open);
    this.stack.push(initialHouse);

    while (this.stack.length > 0) {
      const neighbors = this.getNeighbors(this.stack[this.stack.length - 1]);
      if (!neighbors) {
        return;
      }

      const tunnelableHouses = neighbors.filter(el => this.isTunnelable(el));

      if (tunnelableHouses.length === 0) {
        this.stack.pop();
      } else {
        const index = Math.floor(Math.random() * tunnelableHouses.length);
        const chosen = tunnelableHouses[index];
        this.completeMaze.push(chosen);
        this.swapHouseClass(chosen.house, this.empty, this.open);
        this.stack.push(chosen);
      }
    }
    this.availableMaze = this.completeMaze;
  }

  private isTunnelable(neighbor: any): boolean {
    if (!neighbor.house.classList.contains(this.empty)) {
      return false;
    }

    const secondLayerNeighbors = this.getNeighbors(neighbor);
    if (secondLayerNeighbors.length < 3) {
      return false;
    }

    const emptyCount = secondLayerNeighbors.filter(viz => viz.house.classList.contains(this.empty)).length;
    return emptyCount >= 3;
  }

  private getNeighbors(house: any): any[] {
    if (!house) {
      return [];
    }

    const neighbors = [];
    const x = house.x;
    const y = house.y;

    if (x - 1 >= 0) {
      neighbors.push(this.completeBoard.find(h => h.x === x - 1 && h.y === y));
    }
    if (x + 1 < this.height) {
      neighbors.push(this.completeBoard.find(h => h.x === x + 1 && h.y === y));
    }
    if (y - 1 >= 0) {
      neighbors.push(this.completeBoard.find(h => h.x === x && h.y === y - 1));
    }
    if (y + 1 < this.width) {
      neighbors.push(this.completeBoard.find(h => h.x === x && h.y === y + 1));
    }

    return neighbors.filter(Boolean);
  }
}

// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-fallen',
//   templateUrl: './fallen.component.html',
//   styleUrl: './fallen.component.css'
// })
// export class FallenComponent {

// }
