import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlutaoComponent } from './glutao.component';

describe('GlutaoComponent', () => {
  let component: GlutaoComponent;
  let fixture: ComponentFixture<GlutaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlutaoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlutaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
