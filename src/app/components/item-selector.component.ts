import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { DataService } from '../services/data.service';
import { TreeNode } from '../models/data.model';

@Component({
    selector: 'app-item-selector',
    standalone: true,
    imports: [AsyncPipe, NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div
  class="w-[275px] box-border border border-[#e3e3e3] rounded-[3px]
         bg-white font-sans text-[14px] text-[#3c3c3c] overflow-hidden
         shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
>
  @for (node of treeData$ | async; track trackByNode($index, node)) {
    <ng-container *ngTemplateOutlet="treeNode; context:{node:node}"></ng-container>
  }
</div>

<ng-template #treeNode let-node="node">
  <div
    class="flex items-center min-h-[40px] cursor-pointer select-none
           border-b border-[#e3e3e3] transition-colors duration-150
           hover:bg-[#f5f5f5]"
    [style.padding-left.px]="16 + getIndentLevel(node) * 16"
    [style.padding-right.px]="16"
    (click)="onRowClick(node)"
    (keydown.enter)="onRowClick(node)"
    (keydown.space)="onCheckboxChange(node, $event); $event.preventDefault()"
    tabindex="0"
  >
    <div class="relative" style="margin-right: 12px;">
      <input
        type="checkbox"
        [id]="getNodeId(node)"
        [checked]="node.selected"
        [indeterminate]="node.indeterminate"
        (change)="onCheckboxChange(node, $event)"
        (click)="$event.stopPropagation()"
        class="appearance-none w-[18px] h-[18px] border-2 border-[#b3b3b3]
               rounded-[3px] flex items-center justify-center cursor-pointer
               transition-all duration-150 bg-white
               hover:border-[#2563eb]
               checked:bg-[#2563eb] checked:border-[#2563eb]
               indeterminate:bg-[#2563eb] indeterminate:border-[#2563eb]"
      />

      @if (node.selected && !node.indeterminate) {
        <svg
          class="absolute left-[3px] top-[3px] pointer-events-none"
          width="12" height="12" viewBox="0 0 12 12"
        >
          <path d="M1.5 6L4.5 9L10.5 3"
                stroke="white"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>
      }

      @if (node.indeterminate) {
        <div class="absolute left-[4px] top-[8px] w-[10px] h-[2px] bg-white rounded-[1px] pointer-events-none"></div>
      }
    </div>

    <label
      [for]="getNodeId(node)"
      class="flex-1 truncate text-[#3c3c3c] text-[14px] cursor-pointer select-none"
      (click)="$event.stopPropagation()"
    >
      {{ node.title }}
    </label>

    @if (node.type === 'folder') {
      <button
        (click)="onExpandClick(node, $event)"
        class="w-[20px] h-[20px] ml-auto flex items-center justify-center text-[#3c3c3c]
               opacity-60 hover:opacity-100 transition-all duration-200 flex-shrink-0"
        [style.transform]="node.expanded ? 'rotate(0deg)' : 'rotate(-90deg)'"
        aria-label="Toggle"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
             stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3L5 6L8 3" />
        </svg>
      </button>
    }
  </div>

  @if (node.expanded && node.children.length > 0) {
    <div>
      @for (child of node.children; track child.id) {
        <ng-container *ngTemplateOutlet="treeNode; context:{node:child}"></ng-container>
      }
    </div>
  }
</ng-template>

  `
})
export class ItemSelectorComponent {
    private readonly dataService = inject(DataService);
    readonly treeData$ = this.dataService.treeData$;
    readonly selectedIds$ = this.dataService.selectedIds$;

    trackByNode(_: number, n: TreeNode) { return `${n.type}-${n.id}`; }
    getNodeId(n: TreeNode) { return `checkbox-${n.type}-${n.id}`; }

    getIndentLevel(n: TreeNode): number {
        let level = 0, cur = n.parent;
        while (cur) { level++; cur = cur.parent; }
        return level;
    }

    onRowClick(n: TreeNode) { this.dataService.updateNodeSelection(n); }
    onCheckboxChange(n: TreeNode, e: Event) { e.stopPropagation(); this.dataService.updateNodeSelection(n); }
    onExpandClick(n: TreeNode, e: MouseEvent) { e.stopPropagation(); this.dataService.toggleNodeExpanded(n); }
}
