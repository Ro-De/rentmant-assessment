import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { DataService } from "./services/data.service";
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1>Testing Data Load</h1>
      <div *ngIf="loading$ | async">Loading...</div>
      <div *ngIf="error$ | async as error" style="color: red">Error: {{ error }}</div>
      <div *ngIf="(loading$ | async) === false">
        <p>Root nodes: {{ (treeData$ | async)?.length }}</p>
        <details>
          <summary>View tree structure (console)</summary>
          <p>Check browser console for full tree data</p>
        </details>
      </div>
    </div>
  `
})
export class AppComponent {
  private readonly dataService = inject(DataService);
  readonly treeData$ = this.dataService.treeData$;
  readonly loading$ = this.dataService.loading$;
  readonly error$ = this.dataService.state$.pipe(
    map(state => state.error)
  );

  constructor() {
    this.dataService.loadData().subscribe(data => {
      console.log('✅ Tree data loaded:', data);
      console.log('Total root nodes:', data.length);
      console.log('Full structure:', this.removeCircularRefs(data));
    });
  }

  private removeCircularRefs(obj: any): any {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (key === 'parent') return undefined;
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      return value;
    }));
  }
}