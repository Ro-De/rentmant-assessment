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

    /*
    * Loads data from the JSON file, transforms it, and builds the tree structure.
    */
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

    /* 
    * Builds a hierarchical tree structure from flat folder and item lists. 
    */
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

    /*
    * Transforms the API response into flat arrays of folders and items.
    */
    private transformData(response: ApiResponse) {
        const folders = response.folders.data.map(row => ({
            id: row[0], title: row[1], parent_id: row[2]
        }));
        const items = response.items.data.map(row => ({
            id: row[0], title: row[1], folder_id: row[2]
        }));
        return { folders, items };
    }

    /*
    * Updates the internal state with partial changes.
    * @params
    */
    private updateState(partial: Partial<ItemSelectorState>): void {
        this.state.next({ ...this.state.value, ...partial });
    }
}