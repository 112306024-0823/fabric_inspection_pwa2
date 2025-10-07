// 資料庫類型定義
export interface Roll {
  id: string;
  barcode: string;
  bl_no: string;
  po_no: string;
  style: string;
  color: string;
  lot: string;
  roll_number: string;
  fabric_description?: string;
  supplier?: string;
  total_length: number;
  need_inspect_length: number;
  inspected_length: number;
  standard_yard: number;
  grade?: string;
  avg_points?: number;
  status: 'pending' | 'inspecting' | 'completed';
  created_at: string;
  updated_at: string;
  rowversion: number;
  _dirty?: boolean; // 本地標記
}

export interface Inspection {
  id: string;
  roll_id: string;
  inspector_name?: string;
  
  // Spec Check
  standard_weight?: number;
  checked_weight?: number;
  standard_length?: number;
  checked_length?: number;
  ticket_full_width?: number;
  actual_full_width?: number;
  ticket_cut_width?: number;
  moisture?: number;
  skew_width?: number;
  skew_height?: number;
  
  // Quality Check
  appearance: 'pass' | 'fail';
  hand_feel: 'pass' | 'fail';
  slant_issue: 'pass' | 'fail';
  color_shade: 'pass' | 'fail';
  specification_issue: 'pass' | 'fail';
  approved_sample: 'yes' | 'no';
  sticker: 'pass' | 'fail';
  packing: 'pass' | 'fail';
  
  remark?: string;
  finished: boolean;
  inspection_started_at?: string;
  inspection_finished_at?: string;
  created_at: string;
  updated_at: string;
  rowversion: number;
  _dirty?: boolean;
}

export interface DefectCode {
  id: string;
  category: string;
  code: string;
  description_zh?: string;
  description_en?: string;
  description_kh?: string;
  severity_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Defect {
  id: string;
  roll_id: string;
  inspection_id?: string;
  defect_code_id: string;
  position_yard?: number;
  level: number;
  remark?: string;
  created_at: string;
  updated_at: string;
  rowversion: number;
  _dirty?: boolean;
}

export interface SyncLog {
  id: string;
  entity_type: 'rolls' | 'inspections' | 'defects';
  entity_id: string;
  operation: 'insert' | 'update' | 'delete';
  client_mutation_id?: string;
  synced_at: string;
  status: 'pending' | 'synced' | 'failed';
}

// 同步相關類型
export interface OutboxItem {
  id: string;
  entity: 'rolls' | 'inspections' | 'defects';
  op: 'upsert' | 'delete';
  key: string;
  payload: unknown;
  clientMutationId: string;
  createdAt: string;
}

export interface SyncPushRequest {
  mutations: OutboxItem[];
}

export interface SyncPushResponse {
  results: Array<{
    clientMutationId: string;
    success: boolean;
    error?: string;
    serverVersion?: number;
    updated_at?: string;
  }>;
}

export interface SyncPullRequest {
  since?: string;
  take?: number;
}

export interface SyncPullResponse {
  data: {
    rolls: Roll[];
    inspections: Inspection[];
    defects: Defect[];
  };
  lastSyncAt: string;
}

// UI 狀態類型
export interface AppState {
  isOnline: boolean;
  lastSyncAt?: string;
  pendingSyncCount: number;
  currentRoll?: Roll;
  currentInspection?: Inspection;
}

// 表單類型
export interface SpecCheckForm {
  standard_weight: number;
  checked_weight: number;
  standard_length: number;
  checked_length: number;
  ticket_full_width: number;
  actual_full_width: number;
  ticket_cut_width: number;
  moisture: number;
  skew_width: number;
  skew_height: number;
}

export interface QualityCheckForm {
  appearance: 'pass' | 'fail';
  hand_feel: 'pass' | 'fail';
  slant_issue: 'pass' | 'fail';
  color_shade: 'pass' | 'fail';
  specification_issue: 'pass' | 'fail';
  approved_sample: 'yes' | 'no';
  sticker: 'pass' | 'fail';
  packing: 'pass' | 'fail';
}

export interface DefectForm {
  defect_code_id: string;
  position_yard: number;
  level: number;
  remark: string;
}
