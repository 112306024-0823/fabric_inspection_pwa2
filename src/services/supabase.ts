import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 從 .env 讀取設定（Vite 只會暴露以 VITE_ 開頭的變數）
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // 在開發主控台提示缺少環境變數
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// 資料庫類型定義
export interface Database {
  public: {
    Tables: {
      rolls: {
        Row: {
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
          status: string;
          created_at: string;
          updated_at: string;
          rowversion: number;
        };
        Insert: {
          id?: string;
          barcode: string;
          bl_no: string;
          po_no: string;
          style: string;
          color: string;
          lot: string;
          roll_number: string;
          fabric_description?: string;
          supplier?: string;
          total_length?: number;
          need_inspect_length?: number;
          inspected_length?: number;
          standard_yard?: number;
          grade?: string;
          avg_points?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          rowversion?: number;
        };
        Update: {
          id?: string;
          barcode?: string;
          bl_no?: string;
          po_no?: string;
          style?: string;
          color?: string;
          lot?: string;
          roll_number?: string;
          fabric_description?: string;
          supplier?: string;
          total_length?: number;
          need_inspect_length?: number;
          inspected_length?: number;
          standard_yard?: number;
          grade?: string;
          avg_points?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          rowversion?: number;
        };
      };
      inspections: {
        Row: {
          id: string;
          roll_id: string;
          inspector_name?: string;
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
          appearance: string;
          hand_feel: string;
          slant_issue: string;
          color_shade: string;
          specification_issue: string;
          approved_sample: string;
          sticker: string;
          packing: string;
          remark?: string;
          finished: boolean;
          inspection_started_at?: string;
          inspection_finished_at?: string;
          created_at: string;
          updated_at: string;
          rowversion: number;
        };
        Insert: {
          id?: string;
          roll_id: string;
          inspector_name?: string;
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
          appearance?: string;
          hand_feel?: string;
          slant_issue?: string;
          color_shade?: string;
          specification_issue?: string;
          approved_sample?: string;
          sticker?: string;
          packing?: string;
          remark?: string;
          finished?: boolean;
          inspection_started_at?: string;
          inspection_finished_at?: string;
          created_at?: string;
          updated_at?: string;
          rowversion?: number;
        };
        Update: {
          id?: string;
          roll_id?: string;
          inspector_name?: string;
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
          appearance?: string;
          hand_feel?: string;
          slant_issue?: string;
          color_shade?: string;
          specification_issue?: string;
          approved_sample?: string;
          sticker?: string;
          packing?: string;
          remark?: string;
          finished?: boolean;
          inspection_started_at?: string;
          inspection_finished_at?: string;
          created_at?: string;
          updated_at?: string;
          rowversion?: number;
        };
      };
      defects: {
        Row: {
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
        };
        Insert: {
          id?: string;
          roll_id: string;
          inspection_id?: string;
          defect_code_id: string;
          position_yard?: number;
          level?: number;
          remark?: string;
          created_at?: string;
          updated_at?: string;
          rowversion?: number;
        };
        Update: {
          id?: string;
          roll_id?: string;
          inspection_id?: string;
          defect_code_id?: string;
          position_yard?: number;
          level?: number;
          remark?: string;
          created_at?: string;
          updated_at?: string;
          rowversion?: number;
        };
      };
      defect_codes: {
        Row: {
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
        };
        Insert: {
          id?: string;
          category: string;
          code: string;
          description_zh?: string;
          description_en?: string;
          description_kh?: string;
          severity_level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          code?: string;
          description_zh?: string;
          description_en?: string;
          description_kh?: string;
          severity_level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
