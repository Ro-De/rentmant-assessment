import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, map, tap, catchError, of } from "rxjs";
import { ApiResponse, Folder, Item, TreeNode, NodeType, ItemSelectorState } from '../models/data.model';


@Injectable({
  providedIn: 'root'
})

export class DataService {
  private readonly http = inject(HttpClient);
  
  private readonly state = new BehaviorSubject<ItemSelectorState>({
    treeData: [],
    selectedIds: [],
    loading: false,
    error: null
  });
  
  readonly state$ = this.state.asObservable();
  readonly treeData$ = this.state$.pipe(map(state => state.treeData));
  readonly selectedIds$ = this.state$.pipe(map(state => state.selectedIds));
  readonly loading$ = this.state$.pipe(map(state => state.loading));

  loadData(): Observable<TreeNode[]> {
    this.updateState({ loading: true, error: null });
    
    return this.http.get<ApiResponse>('assets/response.json').pipe(
      map(response => this.transformData(response)),
      map(({ folders, items }) => this.buildTree(folders, items)),
      tap(treeData => {
        this.updateState({ treeData, loading: false });
      }),
      catchError(error => {
        this.updateState({ error: error.message, loading: false });
        return of([]);
      })
    );
  }

  updateNodeSelection(node: TreeNode): void {
    const treeData = structuredClone(this.state.value.treeData);
    const targetNode = this.findNode(treeData, node.id, node.type);

    if (!targetNode) return;

    if (targetNode.type === NodeType.ITEM) {
      targetNode.selected = !targetNode.selected;
    } else {
      const newState = targetNode.indeterminate || !targetNode.selected;
      this.setAllChildrenSelection(targetNode, newState);
    }

    this.updateSelectionStates(treeData);
    const selectedIds = this.getSelectedItemIds(treeData);

    this.updateState({ treeData, selectedIds });
  }

  toggleNodeExpanded(node: TreeNode): void {
    const treeData = structuredClone(this.state.value.treeData);
    const targetNode = this.findNode(treeData, node.id, node.type);

    if (targetNode && targetNode.type === NodeType.FOLDER) {
      targetNode.expanded = !targetNode.expanded;
      this.updateState({ treeData });
    }
  }

  clearAllSelections(): void {
    const treeData = structuredClone(this.state.value.treeData);
    this.clearSelections(treeData);
    this.updateSelectionStates(treeData);
    this.updateState({ treeData, selectedIds: [] });
  }

  private transformData(response: ApiResponse): { folders: Folder[], items: Item[] } {
    const folders: Folder[] = response.folders.data.map(row => ({
      id: row[0],
      title: row[1],
      parent_id: row[2]
    }));

    const items: Item[] = response.items.data.map(row => ({
      id: row[0],
      title: row[1],
      folder_id: row[2]
    }));

    return { folders, items };
  }

  private buildTree(folders: Folder[], items: Item[]): TreeNode[] {
    const folderMap = new Map<number, TreeNode>();
    const itemsByFolder = new Map<number, Item[]>();
    
    items.forEach(item => {
      const list = itemsByFolder.get(item.folder_id) || [];
      list.push(item);
      itemsByFolder.set(item.folder_id, list);
    });

    folders.forEach(folder => {
      folderMap.set(folder.id, {
        id: folder.id,
        title: folder.title,
        type: NodeType.FOLDER,
        children: [],
        expanded: true,
        selected: false,
        indeterminate: false
      });
    });

    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;
      if (folder.parent_id !== null && folderMap.has(folder.parent_id)) {
        const parent = folderMap.get(folder.parent_id)!;
        parent.children.push(node);
        node.parent = parent;
      }
    });

    folderMap.forEach((folderNode, folderId) => {
      const folderItems = itemsByFolder.get(folderId) || [];
      const itemNodes: TreeNode[] = folderItems.map(item => ({
        id: item.id,
        title: item.title,
        type: NodeType.ITEM,
        children: [],
        parent: folderNode,
        expanded: false,
        selected: false,
        indeterminate: false
      }));
      
      const childFolders = folderNode.children.sort((a, b) => 
        a.title.localeCompare(b.title)
      );
      const sortedItems = itemNodes.sort((a, b) => 
        a.title.localeCompare(b.title)
      );
      
      folderNode.children = [...childFolders, ...sortedItems];
    });

    return folders
      .filter(f => f.parent_id === null)
      .map(f => folderMap.get(f.id)!)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  private findNode(nodes: TreeNode[], id: number, type: NodeType): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id && node.type === type) {
        return node;
      }
      if (node.children.length > 0) {
        const found = this.findNode(node.children, id, type);
        if (found) return found;
      }
    }
    return null;
  }

  private setAllChildrenSelection(node: TreeNode, selected: boolean): void {
    if (node.type === NodeType.FOLDER) {
      node.selected = selected;
      node.indeterminate = false;

      node.children.forEach(child => {
        if (child.type === NodeType.ITEM) {
          child.selected = selected;
        } else {
          this.setAllChildrenSelection(child, selected);
        }
      });
    }
  }

  private updateSelectionStates(nodes: TreeNode[]): void {
    nodes.forEach(node => {
      if (node.type === NodeType.FOLDER) {
        this.updateFolderSelectionState(node);
      }
    });
  }

  private updateFolderSelectionState(node: TreeNode): void {
    if (node.type === NodeType.FOLDER && node.children.length > 0) {
      node.children.forEach(child => {
        if (child.type === NodeType.FOLDER) {
          this.updateFolderSelectionState(child);
        }
      });

      const allItems = this.getAllItemsInFolder(node);
      const selectedItems = allItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        node.selected = false;
        node.indeterminate = false;
      } else if (selectedItems.length === allItems.length) {
        node.selected = true;
        node.indeterminate = false;
      } else {
        node.selected = false;
        node.indeterminate = true;
      }
    }
  }

  private getAllItemsInFolder(folder: TreeNode): TreeNode[] {
    const items: TreeNode[] = [];
    folder.children.forEach(child => {
      if (child.type === NodeType.ITEM) {
        items.push(child);
      } else if (child.type === NodeType.FOLDER) {
        items.push(...this.getAllItemsInFolder(child));
      }
    });
    return items;
  }

  private getSelectedItemIds(nodes: TreeNode[]): number[] {
    const ids: number[] = [];
    nodes.forEach(node => {
      if (node.type === NodeType.ITEM && node.selected) {
        ids.push(node.id);
      }
      if (node.children.length > 0) {
        ids.push(...this.getSelectedItemIds(node.children));
      }
    });
    return ids.sort((a, b) => a - b);
  }

  private clearSelections(nodes: TreeNode[]): void {
    nodes.forEach(node => {
      node.selected = false;
      node.indeterminate = false;
      if (node.children.length > 0) {
        this.clearSelections(node.children);
      }
    });
  }

  private updateState(partial: Partial<ItemSelectorState>): void {
    this.state.next({ ...this.state.value, ...partial });
  }
}