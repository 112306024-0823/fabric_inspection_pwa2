import Dexie, { type Table } from 'dexie';
import type { Roll, Inspection, Defect, DefectCode, OutboxItem } from '../types';

export class FabricInspectionDB extends Dexie {
  // 主要資料表
  rolls!: Table<Roll>;
  inspections!: Table<Inspection>;
  defects!: Table<Defect>;
  defectCodes!: Table<DefectCode>;
  
  // 同步相關
  outbox!: Table<OutboxItem>;

  constructor() {
    super('FabricInspectionDB');
    
    this.version(1).stores({
      // 主要資料表
      rolls: 'id, barcode, bl_no, po_no, style, color, lot, roll_number, status, updated_at, _dirty',
      inspections: 'id, roll_id, finished, updated_at, _dirty',
      defects: 'id, roll_id, inspection_id, defect_code_id, updated_at, _dirty',
      defectCodes: 'id, category, code, is_active',
      
      // 同步相關
      outbox: 'id, entity, op, key, clientMutationId, createdAt'
    });
  }
}

export const db = new FabricInspectionDB();

// 資料庫初始化
export async function initDatabase() {
  try {
    await db.open();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// 清理資料庫
export async function clearDatabase() {
  try {
    await db.transaction('rw', [db.rolls, db.inspections, db.defects, db.defectCodes, db.outbox], async () => {
      await db.rolls.clear();
      await db.inspections.clear();
      await db.defects.clear();
      await db.defectCodes.clear();
      await db.outbox.clear();
    });
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
}
