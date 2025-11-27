
import { Component, OnDestroy, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, Renderer2, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-fallen',
  templateUrl: './fallen.component.html',
  styleUrls: ['./fallen.component.css']
})
export class FallenComponent implements OnDestroy, AfterViewInit {

  @ViewChild('maze') mazeElement!: ElementRef;
  @ViewChild('btnUp') btnUp!: ElementRef;
  @ViewChild('btnDown') btnDown!: ElementRef;
  @ViewChild('btnLeft') btnLeft!: ElementRef;
  @ViewChild('btnRight') btnRight!: ElementRef;
  // @ViewChild('btnRules') btnRules!: ElementRef;
  @ViewChild('btnRulesClose') btnRulesClose!: ElementRef;

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

  isMenuOpen = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private renderer: Renderer2, private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.maze = this.mazeElement.nativeElement;
      this.setupBoard();
      this.bindEvents();
    }
  }

  ngOnDestroy(): void {
    // Limpa os event listeners para evitar memory leaks
    if (isPlatformBrowser(this.platformId)) {
      this.unbindEvents();
    }
  }

  private bindEvents(): void {
    // Adiciona event listeners para o teclado
    this.renderer.listen('document', 'keydown', this.handleKeyboardEvent);

    // Adiciona event listeners para os botões usando o Renderer2
    this.renderer.listen(this.btnUp.nativeElement, 'click', this.moveUp);
    this.renderer.listen(this.btnDown.nativeElement, 'click', this.moveDown);
    this.renderer.listen(this.btnLeft.nativeElement, 'click', this.moveLeft);
    this.renderer.listen(this.btnRight.nativeElement, 'click', this.moveRight);
    // this.renderer.listen(this.btnRules.nativeElement, 'click', this.showRules);
    this.renderer.listen(this.btnRulesClose.nativeElement, 'click', this.hideRules);
  }

  private unbindEvents(): void {
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
    const newHouse = this.renderer.selectRootElement(`#${newHouseId}`, true); // document.getElementById(newHouseId);

    if (newHouse?.classList.contains(this.empty)) {
      this.endGame(false);
      return;
    }

    this.turnOffLights();

    this.Player.house.updateHouse(nextX, nextY);

    this.turnOnLights();
    this.detectCollision();
  }

  // NOVO: Método para alternar a visibilidade do menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // NOVO: Método para lidar com o clique no item "Regras"
  onRulesClick(): void {
    this.renderer.setStyle(this.renderer.selectRootElement('#popup-canvas', true), 'display', 'flex');
    this.renderer.setStyle(this.renderer.selectRootElement('#popup-rules', true), 'display', 'block');
  }

  // NOVO: Método para lidar com o clique no item "Reiniciar"
  onResetClick(): void {
    // this.endGame(false);
    this.setupBoard();
  }

  private showRules = () => {
    const popupCanvas = this.renderer.selectRootElement('#popup-canvas', true); // document.getElementById('popup-canvas');
    const popupRules = this.renderer.selectRootElement('#popup-rules', true); //document.getElementById('popup-rules');
    this.renderer.setStyle(popupCanvas, 'display', 'flex');
    this.renderer.setStyle(popupRules, 'display', 'block');
  }

  private hideRules = () => {
    const popupCanvas = this.renderer.selectRootElement('#popup-canvas', true); //document.getElementById('popup-canvas');
    const popupRules = this.renderer.selectRootElement('#popup-rules', true); //document.getElementById('popup-rules');
    this.renderer.setStyle(popupCanvas, 'display', 'none');
    this.renderer.setStyle(popupRules, 'display', 'none');
  }


  private generateId(x: number, y: number): string {
    return "cell-" + x + "-" + y;
  }

  private resetGame(): void {
    this.stack = [];
    this.completeMaze = [];
    this.completeBoard = [];
    this.availableMaze = [];
    this.reachedHouses = [];
    this.gameOn = true;
    this.fruitHouse = null;
    this.Player = null;
    while (this.maze.firstChild) {
      this.renderer.removeChild(this.maze, this.maze.firstChild);
    }
  }

  private generateBoard(): void {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const cellId = this.generateId(i, j);
        const cell = this.renderer.createElement("div"); //document.createElement("div");
        this.renderer.addClass(cell, 'cell'); //cell.classList.add('cell', this.empty);
        this.renderer.addClass(cell, this.empty); //
        this.renderer.setAttribute(cell, 'id', cellId); //cell.id = cellId;
        const house = { house: cell, x: i, y: j, tunnelable: false, updateHouse: (newX: number, newY: number) => this.updateHouse(house, newX, newY) };
        this.renderer.appendChild(this.maze, cell); //this.maze.appendChild(cell);
        this.completeBoard.push(house);
      }
    }
  }

  private setupBoard(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.resetGame();
      this.generateBoard();
      this.initializeGameLogic();
    }
  }

  private initializeGameLogic(): void {
    while (this.completeMaze.length === 0){
      this.generateMaze();
    }
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
    console.log();
  }

  private assignFruitHouse(): void {
    this.fruitHouse = this.availableMaze[Math.floor(Math.random() * this.availableMaze.length)];
    this.swapHouseClass(this.fruitHouse.house, this.open, this.fruit);
    this.availableMaze = this.completeMaze.filter(el => !el.house.classList.contains(this.fruit));
    console.log();
  }

  private swapHouseClass(house: HTMLElement, remClass: string, addClass: string): void {
    this.renderer.removeClass(house, remClass); //house.classList.remove(remClass);
    this.renderer.addClass(house, addClass); //house.classList.add(addClass);
    console.log();
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
      this.renderer.addClass(al.house, this.light); //al.house.classList.add(this.light);
    }
    console.log();
  }

  private turnOffLights(): void {
    for (const al of this.reachedHouses) {
      this.renderer.removeClass(al.house, this.light); //al.house.classList.remove(this.light);
    }
  }

  private drawReach(neighbor: any, max: number, pos: { x: number, y: number }): void {
    if (!neighbor.house || max === 0 || neighbor.house.classList.contains(this.empty) || neighbor.house.classList.contains(this.fruit)) {
      return;
    }
    this.reachedHouses.push(neighbor);
    const nextX = pos.x + neighbor.x;
    const nextY = pos.y + neighbor.y;
    const newHouse = this.renderer.selectRootElement(`#${this.generateId(nextX, nextY)}`, true);
    // const newNeighbor = { house: document.getElementById(this.generateId(nextX, nextY)), x: nextX, y: nextY };
    const newNeighbor = { house: newHouse, x: nextX, y: nextY };
    this.drawReach(newNeighbor, max - 1, pos);
  }

  private endGame(result: boolean): void {
    if (result) {
      alert("Você venceu!");
    } else {
      alert("Você morreu!");
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
    console.log();
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
