const API_BASE_URL = 'http://localhost:3000/api';

// 檢查環境變數
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// 資料庫類型定義（保持與原 Supabase 相同）
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

// 模擬 Supabase 客戶端介面，實際連接到 SQL Server API
export const supabase = {
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          try {
            const endpoint = table === 'rolls' && column === 'barcode' 
              ? `/rolls/barcode/${value}`
              : table === 'inspections' && column === 'roll_id'
              ? `/inspections/roll/${value}`
              : table === 'defects' && column === 'roll_id'
              ? `/defects/roll/${value}`
              : `/${table}`;
            
            const response = await apiRequest(endpoint);
            return { data: response.data, error: null };
          } catch (error: any) {
            return { data: null, error: { code: 'PGRST116', message: error.message } };
          }
        },
        order: (column: string, options: { ascending: boolean }) => {
          // 這個 order 是在 eq 之後調用的，需要處理特定的查詢路由
          const getEndpoint = () => {
            if (table === 'defects') {
              return `/defects/roll/${value}`;
            }
            return `/${table}`;
          };
          
          return {
            then: async (callback: (result: any) => void) => {
              try {
                const response = await apiRequest(getEndpoint());
                callback({ data: response.data, error: null });
              } catch (error: any) {
                callback({ data: null, error: { message: error.message } });
              }
            }
          };
        }
      }),
      order: (column: string, options: { ascending: boolean }) => ({
        then: async (callback: (result: any) => void) => {
          try {
            const response = await apiRequest(`/${table}`);
            callback({ data: response.data, error: null });
          } catch (error: any) {
            callback({ data: null, error: { message: error.message } });
          }
        }
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          try {
            const response = await apiRequest(`/${table}`, {
              method: 'POST',
              body: JSON.stringify(data)
            });
            return { data: response.data, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => {
            try {
              const response = await apiRequest(`/${table}/${value}`, {
                method: 'PUT',
                body: JSON.stringify(data)
              });
              return { data: response.data, error: null };
            } catch (error: any) {
              return { data: null, error: { message: error.message } };
            }
          }
        })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async (callback: (result: any) => void) => {
          try {
            await apiRequest(`/${table}/${value}`, {
              method: 'DELETE'
            });
            callback({ data: null, error: null });
          } catch (error: any) {
            callback({ data: null, error: { message: error.message } });
          }
        }
      })
    })
  }),
  
  rpc: (functionName: string, params: any) => ({
    then: async (callback: (result: any) => void) => {
      try {
        let endpoint = '';
        let body = null;
        
        if (functionName === 'sync_push') {
          endpoint = '/sync/push';
          body = { mutations: params.mutations };
        } else if (functionName === 'sync_pull') {
          endpoint = '/sync/pull';
          body = {
            since: params.since_timestamp,
            take: params.take_limit
          };
        }
        
        const response = await apiRequest(endpoint, {
          method: 'POST',
          body: body ? JSON.stringify(body) : undefined
        });
        
        callback({ data: response, error: null });
      } catch (error: any) {
        callback({ data: null, error: { message: error.message } });
      }
    }
  })
};
