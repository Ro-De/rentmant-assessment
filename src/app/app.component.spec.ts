import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DataService } from './services/data.service';
import { ItemSelectorComponent } from './components/item-selector.component';
import { BehaviorSubject, of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;
  let selectedIdsSubject: BehaviorSubject<number[]>;

  beforeEach(async () => {
    selectedIdsSubject = new BehaviorSubject<number[]>([]);

    mockDataService = jasmine.createSpyObj('DataService', ['loadData', 'clearAllSelections'], {
      treeData$: of([]),
      selectedIds$: selectedIdsSubject.asObservable()
    });

    mockDataService.loadData.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      // ✅ FIX: Use `imports` for standalone components
      imports: [AppComponent, ItemSelectorComponent],
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on initialization', () => {
    expect(mockDataService.loadData).toHaveBeenCalled();
  });

  describe('clearSelection', () => {
    it('should call dataService.clearAllSelections', () => {
      component.clearSelection();
      expect(mockDataService.clearAllSelections).toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should render title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title?.textContent).toContain('Item Selector');
    });

    it('should render ItemSelectorComponent', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const itemSelector = compiled.querySelector('app-item-selector');
      expect(itemSelector).toBeTruthy();
    });

    it('should render Clear selection button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toContain('Clear selection');
    });

    it('should disable Clear button when no items selected', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBeTrue();
    });

    it('should not display selected IDs when none are selected', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).not.toContain('Selected item IDs:');
    });

    it('should enable Clear button when items are selected', () => {
      selectedIdsSubject.next([1, 2]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBeFalse();
    });

    it('should display selected IDs when items are selected', () => {
      selectedIdsSubject.next([1, 2, 3]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Selected item IDs: 1, 2, 3');
    });
  });

  describe('button interactions', () => {
    it('should call clearAllSelections when button is clicked', () => {
      selectedIdsSubject.next([99]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button') as HTMLButtonElement;
      button.click();

      expect(mockDataService.clearAllSelections).toHaveBeenCalled();
    });
  });
});
