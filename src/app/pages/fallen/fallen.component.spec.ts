import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallenComponent } from './fallen.component';

describe('FallenComponent', () => {
  let component: FallenComponent;
  let fixture: ComponentFixture<FallenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FallenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FallenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
