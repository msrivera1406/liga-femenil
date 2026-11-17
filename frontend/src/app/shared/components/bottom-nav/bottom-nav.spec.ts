import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BottomNavComponent } from './bottom-nav';

describe('BottomNavComponent', () => {
  let component: BottomNavComponent;
  let fixture: ComponentFixture<BottomNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(BottomNavComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra las 4 secciones públicas', () => {
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent || '';
    for (const seccion of ['Inicio', 'Jornadas', 'Posiciones', 'Comunidad']) {
      expect(texto).toContain(seccion);
    }
  });
});
