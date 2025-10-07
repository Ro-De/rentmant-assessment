export interface Folder {
    id: number;
    title: string;
    parent_id: number | null;
}

export interface Item {
    id: number;
    title: string;
    folder_id: number;
}

export interface ApiResponse {
    folders: {
        columns: string[];
        data: Array<[number, string, number | null]>
    };
    items: {
        columns: string[];
        data: Array<[number, string, number]>
    };
}

export const NodeType = {
    FOLDER: 'folder',
    ITEM: 'item'
} as const;

export type NodeType = typeof NodeType[keyof typeof NodeType];

export interface TreeNode {
    id: number;
    title: string;
    type: NodeType;
    children: TreeNode[];
    parent?: TreeNode;
    expanded: boolean;
    selected: boolean;
    indeterminate: boolean;
}

export interface ItemSelectorState {
  treeData: TreeNode[];
  selectedIds: number[];
  loading: boolean;
  error: string | null;
}