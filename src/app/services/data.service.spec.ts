import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { ApiResponse, NodeType } from '../models/data.model';
import { firstValueFrom, take } from 'rxjs';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  const mockResponse: ApiResponse = {
    folders: {
      columns: ['id', 'title', 'parent_id'],
      data: [
        [1, 'Audio', null],
        [2, 'Speakers', 1],
        [3, 'Rigging', null]
      ]
    },
    items: {
      columns: ['id', 'title', 'folder_id'],
      data: [
        [10, 'Item A', 2],
        [11, 'Item B', 2],
        [12, 'Item C', 3]
      ]
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadData', () => {
    it('should load and transform data from API', async () => {
      const treePromise = firstValueFrom(service.loadData());

      const req = httpMock.expectOne('assets/response.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const tree = await treePromise;
      expect(tree.length).toBe(2); 
      expect(tree[0].title).toBe('Audio');
      expect(tree[0].children.length).toBe(1);
      expect(tree[0].children[0].children.length).toBe(2);
    });

    it('should sort folders and items alphabetically', async () => {
      const unsortedResponse: ApiResponse = {
        folders: {
          columns: ['id', 'title', 'parent_id'],
          data: [
            [1, 'roxhers', null],
            [2, 'roxhe', null]
          ]
        },
        items: {
          columns: ['id', 'title', 'folder_id'],
          data: [
            [10, 'derguti', 1],
            [11, 'xheo', 1]
          ]
        }
      };

      const treePromise = firstValueFrom(service.loadData());

      const req = httpMock.expectOne('assets/response.json');
      req.flush(unsortedResponse);

      const tree = await treePromise;
      expect(tree[0].title).toBe('roxhe');
      expect(tree[1].title).toBe('roxhers');
      expect(tree[1].children[0].title).toBe('derguti');
      expect(tree[1].children[1].title).toBe('xheo');
    });

    it('should expand all folders initially', async () => {
      const treePromise = firstValueFrom(service.loadData());

      const req = httpMock.expectOne('assets/response.json');
      req.flush(mockResponse);

      const tree = await treePromise;
      tree.forEach(node => {
        if (node.type === NodeType.FOLDER) {
          expect(node.expanded).toBeTrue();
        }
      });
    });

    it('should handle HTTP errors gracefully', async () => {
      const treePromise = firstValueFrom(service.loadData());

      const req = httpMock.expectOne('assets/response.json');
      req.error(new ProgressEvent('error'));

      const tree = await treePromise;
      expect(tree).toEqual([]);
    });
  });

  describe('updateNodeSelection', () => {
    beforeEach(async () => {
      const loadPromise = firstValueFrom(service.loadData());
      const req = httpMock.expectOne('assets/response.json');
      req.flush(mockResponse);
      await loadPromise;
    });

    it('should toggle item selection', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const item = tree[0].children[0].children[0];

      service.updateNodeSelection(item);

      const updatedTree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const updatedItem = updatedTree[0].children[0].children[0];
      expect(updatedItem.selected).toBeTrue();
    });

    it('should set folder to indeterminate when some items selected', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const item = tree[0].children[0].children[0];

      service.updateNodeSelection(item);

      const updatedTree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const folder = updatedTree[0].children[0]; 
      expect(folder.indeterminate).toBeTrue();
      expect(folder.selected).toBeFalse();
    });

    it('should set folder to selected when all items selected', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const folder = tree[1]; 

      service.updateNodeSelection(folder);

      const updatedTree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const updatedFolder = updatedTree[1];
      expect(updatedFolder.selected).toBeTrue();
      expect(updatedFolder.indeterminate).toBeFalse();
      expect(updatedFolder.children[0].selected).toBeTrue();
    });

    it('should select all children when clicking folder', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const folder = tree[0].children[0];

      service.updateNodeSelection(folder);

      const updatedTree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const updatedFolder = updatedTree[0].children[0];
      updatedFolder.children.forEach(child => {
        expect(child.selected).toBeTrue();
      });
    });

    it('should deselect all children when clicking selected folder', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const folder = tree[1];

      // First select all
      service.updateNodeSelection(folder);
      // Then deselect all
      service.updateNodeSelection(folder);

      const updatedTree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const updatedFolder = updatedTree[1];
      updatedFolder.children.forEach(child => {
        expect(child.selected).toBeFalse();
      });
    });
  });

  describe('toggleNodeExpanded', () => {
    beforeEach(async () => {
      const loadPromise = firstValueFrom(service.loadData());
      const req = httpMock.expectOne('assets/response.json');
      req.flush(mockResponse);
      await loadPromise;
    });

    it('should toggle folder expanded state', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const folder = tree[0];
      expect(folder.expanded).toBeTrue();

      service.toggleNodeExpanded(folder);

      const updatedTree = await firstValueFrom(service.treeData$.pipe(take(1)));
      expect(updatedTree[0].expanded).toBeFalse();
    });
  });

  describe('clearAllSelections', () => {
    beforeEach(async () => {
      const loadPromise = firstValueFrom(service.loadData());
      const req = httpMock.expectOne('assets/response.json');
      req.flush(mockResponse);
      await loadPromise;
    });

    it('should clear all selections', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const folder = tree[0];
      service.updateNodeSelection(folder);

      service.clearAllSelections();

      const ids = await firstValueFrom(service.selectedIds$.pipe(take(1)));
      expect(ids.length).toBe(0);
    });

    it('should reset indeterminate state', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const item = tree[0].children[0].children[0];
      service.updateNodeSelection(item);

      service.clearAllSelections();

      const updatedTree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const folder = updatedTree[0].children[0];
      expect(folder.indeterminate).toBeFalse();
      expect(folder.selected).toBeFalse();
    });
  });

  describe('selectedIds$', () => {
    beforeEach(async () => {
      const loadPromise = firstValueFrom(service.loadData());
      const req = httpMock.expectOne('assets/response.json');
      req.flush(mockResponse);
      await loadPromise;
    });

    it('should emit selected item IDs in sorted order', async () => {
      const tree = await firstValueFrom(service.treeData$.pipe(take(1)));
      const folder = tree[0].children[0];

      service.updateNodeSelection(folder);

      const ids = await firstValueFrom(service.selectedIds$.pipe(take(1)));
      expect(ids).toEqual([10, 11]);
      expect(ids[0]).toBeLessThan(ids[1]);
    });
  });
});
