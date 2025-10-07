import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemSelectorComponent } from './item-selector.component';
import { DataService } from '../services/data.service';
import { of } from 'rxjs';
import { TreeNode, NodeType } from '../models/data.model';

describe('ItemSelectorComponent', () => {
  let component: ItemSelectorComponent;
  let fixture: ComponentFixture<ItemSelectorComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;

  const mockTreeData: TreeNode[] = [
    {
      id: 1,
      title: 'Audio',
      type: NodeType.FOLDER,
      children: [
        {
          id: 10,
          title: 'Item A',
          type: NodeType.ITEM,
          children: [],
          expanded: false,
          selected: false,
          indeterminate: false
        }
      ],
      expanded: true,
      selected: false,
      indeterminate: false
    }
  ];

  beforeEach(async () => {
    mockDataService = jasmine.createSpyObj(
      'DataService',
      ['loadData', 'updateNodeSelection', 'toggleNodeExpanded', 'clearAllSelections'],
      {
        treeData$: of(mockTreeData),
        selectedIds$: of([])
      }
    );

    await TestBed.configureTestingModule({
      // ✅ Standalone component → use `imports` not `declarations`
      imports: [ItemSelectorComponent],
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('trackByNode', () => {
    it('should return unique identifier for node', () => {
      const node: TreeNode = {
        id: 1,
        title: 'Test',
        type: NodeType.FOLDER,
        children: [],
        expanded: true,
        selected: false,
        indeterminate: false
      };

      const result = component.trackByNode(0, node);
      expect(result).toBe('folder-1');
    });
  });

  describe('getNodeId', () => {
    it('should return unique checkbox ID for node', () => {
      const node: TreeNode = {
        id: 10,
        title: 'Test Item',
        type: NodeType.ITEM,
        children: [],
        expanded: false,
        selected: false,
        indeterminate: false
      };

      const result = component.getNodeId(node);
      expect(result).toBe('checkbox-item-10');
    });
  });

  describe('getIndentLevel', () => {
    it('should return 0 for root node', () => {
      const node: TreeNode = {
        id: 1,
        title: 'Root',
        type: NodeType.FOLDER,
        children: [],
        expanded: true,
        selected: false,
        indeterminate: false
      };

      expect(component.getIndentLevel(node)).toBe(0);
    });

    it('should return correct level for nested node', () => {
      const grandparent: TreeNode = {
        id: 1,
        title: 'Grandparent',
        type: NodeType.FOLDER,
        children: [],
        expanded: true,
        selected: false,
        indeterminate: false
      };

      const parent: TreeNode = {
        id: 2,
        title: 'Parent',
        type: NodeType.FOLDER,
        children: [],
        parent: grandparent,
        expanded: true,
        selected: false,
        indeterminate: false
      };

      const child: TreeNode = {
        id: 3,
        title: 'Child',
        type: NodeType.ITEM,
        children: [],
        parent: parent,
        expanded: false,
        selected: false,
        indeterminate: false
      };

      expect(component.getIndentLevel(child)).toBe(2);
    });
  });

  describe('onRowClick', () => {
    it('should call dataService.updateNodeSelection', () => {
      const node: TreeNode = mockTreeData[0];
      component.onRowClick(node);
      expect(mockDataService.updateNodeSelection).toHaveBeenCalledWith(node);
    });
  });

  describe('onCheckboxChange', () => {
    it('should stop event propagation and call updateNodeSelection', () => {
      const node: TreeNode = mockTreeData[0];
      const event = new Event('change');
      spyOn(event, 'stopPropagation');

      component.onCheckboxChange(node, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(mockDataService.updateNodeSelection).toHaveBeenCalledWith(node);
    });
  });

  describe('onExpandClick', () => {
    it('should stop event propagation and call toggleNodeExpanded', () => {
      const node: TreeNode = mockTreeData[0];
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      component.onExpandClick(node, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(mockDataService.toggleNodeExpanded).toHaveBeenCalledWith(node);
    });
  });

  describe('template rendering', () => {
    it('should render tree nodes', () => {
      const compiled = fixture.nativeElement;
      const labels = compiled.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render checkboxes for all nodes', () => {
      const compiled = fixture.nativeElement;
      const checkboxes = compiled.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should render expand button for folder nodes', () => {
      const compiled = fixture.nativeElement;
      const expandButtons = compiled.querySelectorAll('button[aria-label="Toggle"]');
      expect(expandButtons.length).toBeGreaterThan(0);
    });
  });
});
