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
  folders: { columns: string[]; data: Array<[number, string, number | null]> };
  items: { columns: string[]; data: Array<[number, string, number]> };
}