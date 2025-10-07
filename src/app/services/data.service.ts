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
            map(response => {
                const treeData = this.transformData(response);
                console.log('Transformed Tree Data:', treeData);
                // Return dummy empty array to satisfy TreeNode[] type
                return [];
            })
        );
    }


    private transformData(response: ApiResponse) {
        const folders = response.folders.data.map(row => ({
            id: row[0], title: row[1], parent_id: row[2]
        }));
        const items = response.items.data.map(row => ({
            id: row[0], title: row[1], folder_id: row[2]
        }));
        return { folders, items };
    }

    private updateState(partial: Partial<ItemSelectorState>): void {
        this.state.next({ ...this.state.value, ...partial });
    }
}