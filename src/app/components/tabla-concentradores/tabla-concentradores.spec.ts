import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaConcentradores } from './tabla-concentradores';

describe('TablaConcentradores', () => {
  let component: TablaConcentradores;
  let fixture: ComponentFixture<TablaConcentradores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaConcentradores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaConcentradores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
