import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { DataService } from "./services/data.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1>Testing Data Load</h1>
      <pre>{{ treeData$ | async | json }}</pre>
    </div>
  `
})
export class AppComponent {
  private readonly dataService = inject(DataService);
  readonly treeData$ = this.dataService.treeData$;

  constructor() {
    this.dataService.loadData().subscribe();
  }
}