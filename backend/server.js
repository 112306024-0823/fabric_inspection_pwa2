const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// SQL Server 配置
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
};

// 資料庫連接池
let pool;

// 初始化資料庫連接
async function initDatabase() {
  try {
    pool = await sql.connect(sqlConfig);
    console.log('✅ Connected to SQL Server database');
    
    // 測試連接
    const result = await pool.request().query('SELECT 1 as test');
    console.log('✅ Database connection test successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// 錯誤處理中間件
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: pool ? 'Connected' : 'Disconnected'
  });
});

// ==================== ROLLS API ====================

// 取得所有布捲
app.get('/api/rolls', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        id, barcode, bl_no, po_no, style, color, lot, roll_number,
        fabric_description, supplier, total_length, need_inspect_length,
        inspected_length, standard_yard, grade, avg_points, status,
        created_at, updated_at, rowversion
      FROM rolls 
      ORDER BY updated_at DESC
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching rolls:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rolls'
    });
  }
});

// 根據條碼取得布捲
app.get('/api/rolls/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const result = await pool.request()
      .input('barcode', sql.NVarChar, barcode)
      .query(`
        SELECT 
          id, barcode, bl_no, po_no, style, color, lot, roll_number,
          fabric_description, supplier, total_length, need_inspect_length,
          inspected_length, standard_yard, grade, avg_points, status,
          created_at, updated_at, rowversion
        FROM rolls 
        WHERE barcode = @barcode
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Roll not found'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Error fetching roll by barcode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roll'
    });
  }
});

// 新增布捲
app.post('/api/rolls', async (req, res) => {
  try {
    const {
      barcode, bl_no, po_no, style, color, lot, roll_number,
      fabric_description, supplier, total_length, need_inspect_length,
      inspected_length, standard_yard, grade, avg_points, status
    } = req.body;
    
    const id = uuidv4();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('barcode', sql.NVarChar, barcode)
      .input('bl_no', sql.NVarChar, bl_no)
      .input('po_no', sql.NVarChar, po_no)
      .input('style', sql.NVarChar, style)
      .input('color', sql.NVarChar, color)
      .input('lot', sql.NVarChar, lot)
      .input('roll_number', sql.NVarChar, roll_number)
      .input('fabric_description', sql.NVarChar, fabric_description)
      .input('supplier', sql.NVarChar, supplier)
      .input('total_length', sql.Decimal(10,2), total_length || 0)
      .input('need_inspect_length', sql.Decimal(10,2), need_inspect_length || 0)
      .input('inspected_length', sql.Decimal(10,2), inspected_length || 0)
      .input('standard_yard', sql.Decimal(10,2), standard_yard || 0)
      .input('grade', sql.NVarChar, grade)
      .input('avg_points', sql.Decimal(5,2), avg_points)
      .input('status', sql.NVarChar, status || 'pending')
      .query(`
        INSERT INTO rolls (
          id, barcode, bl_no, po_no, style, color, lot, roll_number,
          fabric_description, supplier, total_length, need_inspect_length,
          inspected_length, standard_yard, grade, avg_points, status
        )
        VALUES (
          @id, @barcode, @bl_no, @po_no, @style, @color, @lot, @roll_number,
          @fabric_description, @supplier, @total_length, @need_inspect_length,
          @inspected_length, @standard_yard, @grade, @avg_points, @status
        )
      `);
    
    res.status(201).json({
      success: true,
      data: { id, ...req.body },
      message: 'Roll created successfully'
    });
  } catch (error) {
    console.error('Error creating roll:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create roll'
    });
  }
});

// 更新布捲
app.put('/api/rolls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // 動態建立更新查詢
    const updateFields = [];
    const request = pool.request().input('id', sql.UniqueIdentifier, id);
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'created_at' && key !== 'rowversion') {
        updateFields.push(`${key} = @${key}`);
        request.input(key, sql.NVarChar, updateData[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    const query = `UPDATE rolls SET ${updateFields.join(', ')} WHERE id = @id`;
    await request.query(query);
    
    res.json({
      success: true,
      message: 'Roll updated successfully'
    });
  } catch (error) {
    console.error('Error updating roll:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update roll'
    });
  }
});

// ==================== INSPECTIONS API ====================

// 根據 roll_id 取得檢驗記錄
app.get('/api/inspections/roll/:rollId', async (req, res) => {
  try {
    const { rollId } = req.params;
    
    const result = await pool.request()
      .input('rollId', sql.UniqueIdentifier, rollId)
      .query(`
        SELECT 
          id, roll_id, inspector_name, standard_weight, checked_weight,
          standard_length, checked_length, ticket_full_width, actual_full_width,
          ticket_cut_width, moisture, skew_width, skew_height, appearance,
          hand_feel, slant_issue, color_shade, specification_issue,
          approved_sample, sticker, packing, remark, finished,
          inspection_started_at, inspection_finished_at, created_at, updated_at, rowversion
        FROM inspections 
        WHERE roll_id = @rollId
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inspection not found'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inspection'
    });
  }
});

// 新增或更新檢驗記錄
app.post('/api/inspections', async (req, res) => {
  try {
    const {
      id, roll_id, inspector_name, standard_weight, checked_weight,
      standard_length, checked_length, ticket_full_width, actual_full_width,
      ticket_cut_width, moisture, skew_width, skew_height, appearance,
      hand_feel, slant_issue, color_shade, specification_issue,
      approved_sample, sticker, packing, remark, finished,
      inspection_started_at, inspection_finished_at
    } = req.body;
    
    const inspectionId = id || uuidv4();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, inspectionId)
      .input('roll_id', sql.UniqueIdentifier, roll_id)
      .input('inspector_name', sql.NVarChar, inspector_name)
      .input('standard_weight', sql.Decimal(10,2), standard_weight)
      .input('checked_weight', sql.Decimal(10,2), checked_weight)
      .input('standard_length', sql.Decimal(10,2), standard_length)
      .input('checked_length', sql.Decimal(10,2), checked_length)
      .input('ticket_full_width', sql.Decimal(10,2), ticket_full_width)
      .input('actual_full_width', sql.Decimal(10,2), actual_full_width)
      .input('ticket_cut_width', sql.Decimal(10,2), ticket_cut_width)
      .input('moisture', sql.Decimal(5,2), moisture)
      .input('skew_width', sql.Decimal(10,2), skew_width)
      .input('skew_height', sql.Decimal(10,2), skew_height)
      .input('appearance', sql.NVarChar, appearance || 'pass')
      .input('hand_feel', sql.NVarChar, hand_feel || 'pass')
      .input('slant_issue', sql.NVarChar, slant_issue || 'pass')
      .input('color_shade', sql.NVarChar, color_shade || 'pass')
      .input('specification_issue', sql.NVarChar, specification_issue || 'pass')
      .input('approved_sample', sql.NVarChar, approved_sample || 'yes')
      .input('sticker', sql.NVarChar, sticker || 'pass')
      .input('packing', sql.NVarChar, packing || 'pass')
      .input('remark', sql.NVarChar, remark)
      .input('finished', sql.Bit, finished || false)
      .input('inspection_started_at', sql.DateTime2, inspection_started_at)
      .input('inspection_finished_at', sql.DateTime2, inspection_finished_at)
      .query(`
        MERGE inspections AS target
        USING (SELECT @id AS id) AS source
        ON target.id = source.id
        WHEN MATCHED THEN
          UPDATE SET
            inspector_name = @inspector_name,
            standard_weight = @standard_weight,
            checked_weight = @checked_weight,
            standard_length = @standard_length,
            checked_length = @checked_length,
            ticket_full_width = @ticket_full_width,
            actual_full_width = @actual_full_width,
            ticket_cut_width = @ticket_cut_width,
            moisture = @moisture,
            skew_width = @skew_width,
            skew_height = @skew_height,
            appearance = @appearance,
            hand_feel = @hand_feel,
            slant_issue = @slant_issue,
            color_shade = @color_shade,
            specification_issue = @specification_issue,
            approved_sample = @approved_sample,
            sticker = @sticker,
            packing = @packing,
            remark = @remark,
            finished = @finished,
            inspection_started_at = @inspection_started_at,
            inspection_finished_at = @inspection_finished_at
        WHEN NOT MATCHED THEN
          INSERT (
            id, roll_id, inspector_name, standard_weight, checked_weight,
            standard_length, checked_length, ticket_full_width, actual_full_width,
            ticket_cut_width, moisture, skew_width, skew_height, appearance,
            hand_feel, slant_issue, color_shade, specification_issue,
            approved_sample, sticker, packing, remark, finished,
            inspection_started_at, inspection_finished_at
          )
          VALUES (
            @id, @roll_id, @inspector_name, @standard_weight, @checked_weight,
            @standard_length, @checked_length, @ticket_full_width, @actual_full_width,
            @ticket_cut_width, @moisture, @skew_width, @skew_height, @appearance,
            @hand_feel, @slant_issue, @color_shade, @specification_issue,
            @approved_sample, @sticker, @packing, @remark, @finished,
            @inspection_started_at, @inspection_finished_at
          );
      `);
    
    res.status(201).json({
      success: true,
      data: { id: inspectionId, ...req.body },
      message: 'Inspection saved successfully'
    });
  } catch (error) {
    console.error('Error saving inspection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save inspection'
    });
  }
});

// ==================== DEFECTS API ====================

// 根據 roll_id 取得缺陷記錄
app.get('/api/defects/roll/:rollId', async (req, res) => {
  try {
    const { rollId } = req.params;
    
    const result = await pool.request()
      .input('rollId', sql.UniqueIdentifier, rollId)
      .query(`
        SELECT 
          d.id, d.roll_id, d.inspection_id, d.defect_code_id, d.position_yard,
          d.level, d.remark, d.created_at, d.updated_at, d.rowversion,
          dc.category, dc.code, dc.description_zh, dc.description_en, dc.description_kh
        FROM defects d
        INNER JOIN defect_codes dc ON d.defect_code_id = dc.id
        WHERE d.roll_id = @rollId
        ORDER BY d.created_at DESC
      `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching defects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch defects'
    });
  }
});

// 新增缺陷記錄
app.post('/api/defects', async (req, res) => {
  try {
    const {
      roll_id, inspection_id, defect_code_id, position_yard, level, remark
    } = req.body;
    
    const id = uuidv4();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('roll_id', sql.UniqueIdentifier, roll_id)
      .input('inspection_id', sql.UniqueIdentifier, inspection_id)
      .input('defect_code_id', sql.UniqueIdentifier, defect_code_id)
      .input('position_yard', sql.Decimal(10,2), position_yard)
      .input('level', sql.Int, level || 1)
      .input('remark', sql.NVarChar, remark)
      .query(`
        INSERT INTO defects (id, roll_id, inspection_id, defect_code_id, position_yard, level, remark)
        VALUES (@id, @roll_id, @inspection_id, @defect_code_id, @position_yard, @level, @remark)
      `);
    
    res.status(201).json({
      success: true,
      data: { id, ...req.body },
      message: 'Defect created successfully'
    });
  } catch (error) {
    console.error('Error creating defect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create defect'
    });
  }
});

// 刪除缺陷記錄
app.delete('/api/defects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('DELETE FROM defects WHERE id = @id');
    
    res.json({
      success: true,
      message: 'Defect deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting defect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete defect'
    });
  }
});

// ==================== DEFECT CODES API ====================

// 取得所有缺陷代碼
app.get('/api/defect-codes', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        id, category, code, description_zh, description_en, description_kh,
        severity_level, is_active, created_at, updated_at
      FROM defect_codes 
      WHERE is_active = 1
      ORDER BY category, code
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching defect codes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch defect codes'
    });
  }
});

// ==================== SYNC API ====================

// 同步推送
app.post('/api/sync/push', async (req, res) => {
  try {
    const { mutations } = req.body;
    const results = [];
    
    for (const mutation of mutations) {
      try {
        const { entity, op, key, payload, clientMutationId } = mutation;
        
        if (op === 'upsert') {
          // 根據實體類型執行 upsert
          switch (entity) {
            case 'rolls':
              await upsertRoll(payload);
              break;
            case 'inspections':
              await upsertInspection(payload);
              break;
            case 'defects':
              await upsertDefect(payload);
              break;
          }
        } else if (op === 'delete') {
          // 執行刪除
          await deleteEntity(entity, key);
        }
        
        results.push({
          clientMutationId,
          success: true,
          serverVersion: 1,
          updated_at: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          clientMutationId: mutation.clientMutationId,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error in sync push:', error);
    res.status(500).json({
      success: false,
      error: 'Sync push failed'
    });
  }
});

// 同步拉取
app.post('/api/sync/pull', async (req, res) => {
  try {
    const { since, take = 100 } = req.body;
    
    const sinceDate = since ? new Date(since) : new Date(0);
    
    console.log('[Sync Pull] Parameters:', { since, take, sinceDate });
    
    // 取得更新的資料 - 簡化查詢避免參數問題
    const rollsResult = await pool.request().query(`
        SELECT TOP (${take})
          id, barcode, bl_no, po_no, style, color, lot, roll_number,
          fabric_description, supplier, total_length, need_inspect_length,
          inspected_length, standard_yard, grade, avg_points, status,
          created_at, updated_at, rowversion
        FROM rolls 
        ORDER BY updated_at DESC
      `);
    
    const inspectionsResult = await pool.request().query(`
        SELECT TOP (${take})
          id, roll_id, inspector_name, standard_weight, checked_weight,
          standard_length, checked_length, ticket_full_width, actual_full_width,
          ticket_cut_width, moisture, skew_width, skew_height, appearance,
          hand_feel, slant_issue, color_shade, specification_issue,
          approved_sample, sticker, packing, remark, finished,
          inspection_started_at, inspection_finished_at, created_at, updated_at, rowversion
        FROM inspections 
        ORDER BY updated_at DESC
      `);
    
    const defectsResult = await pool.request().query(`
        SELECT TOP (${take})
          id, roll_id, inspection_id, defect_code_id, position_yard,
          level, remark, created_at, updated_at, rowversion
        FROM defects 
        ORDER BY updated_at DESC
      `);
    
    res.json({
      success: true,
      data: {
        rolls: rollsResult.recordset,
        inspections: inspectionsResult.recordset,
        defects: defectsResult.recordset
      },
      lastSyncAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in sync pull:', error);
    res.status(500).json({
      success: false,
      error: 'Sync pull failed'
    });
  }
});

// 輔助函數
async function upsertRoll(payload) {
  const request = pool.request();
  
  // 定義數字欄位
  const numericFields = ['total_length', 'need_inspect_length', 'inspected_length', 'standard_yard', 'standard_kg', 'avg_points'];
  
  // 確保所有必要的欄位都有值，即使是 null
  const requiredFields = ['barcode', 'bl_no', 'po_no', 'style', 'color', 'lot', 'roll_number', 
                         'fabric_description', 'supplier', 'total_length', 'need_inspect_length', 
                         'inspected_length', 'standard_yard', 'standard_kg', 'grade', 'avg_points', 'status'];
  
  // 先設置所有必要的參數
  requiredFields.forEach(field => {
    if (numericFields.includes(field)) {
      request.input(field, sql.Decimal(10, 2), payload[field] || 0);
    } else {
      request.input(field, sql.NVarChar, payload[field] || null);
    }
  });
  
  // 處理其他非必要欄位
  Object.keys(payload).forEach(key => {
    if (key !== 'id' && key !== 'created_at' && key !== 'rowversion' && key !== '_dirty' && !requiredFields.includes(key)) {
      if (numericFields.includes(key)) {
        request.input(key, sql.Decimal(10, 2), payload[key] || 0);
      } else {
        request.input(key, sql.NVarChar, payload[key] || null);
      }
    }
  });
  
  request.input('id', sql.UniqueIdentifier, payload.id);
  
  await request.query(`
    MERGE rolls AS target
    USING (SELECT @id AS id) AS source
    ON target.id = source.id
    WHEN MATCHED THEN
      UPDATE SET
        barcode = @barcode,
        bl_no = @bl_no,
        po_no = @po_no,
        style = @style,
        color = @color,
        lot = @lot,
        roll_number = @roll_number,
        fabric_description = @fabric_description,
        supplier = @supplier,
        total_length = @total_length,
        need_inspect_length = @need_inspect_length,
        inspected_length = @inspected_length,
        standard_yard = @standard_yard,
        standard_kg = @standard_kg,
        grade = @grade,
        avg_points = @avg_points,
        status = @status
    WHEN NOT MATCHED THEN
      INSERT (id, barcode, bl_no, po_no, style, color, lot, roll_number,
              fabric_description, supplier, total_length, need_inspect_length,
              inspected_length, standard_yard, standard_kg, grade, avg_points, status)
      VALUES (@id, @barcode, @bl_no, @po_no, @style, @color, @lot, @roll_number,
              @fabric_description, @supplier, @total_length, @need_inspect_length,
              @inspected_length, @standard_yard, @standard_kg, @grade, @avg_points, @status);
  `);
}

async function upsertInspection(payload) {
  const request = pool.request();
  
  // 定義數字欄位
  const numericFields = [
    'standard_weight', 'checked_weight', 'standard_length', 'checked_length',
    'ticket_full_width', 'actual_full_width', 'ticket_cut_width', 'moisture',
    'skew_width', 'skew_height'
  ];
  
  // 定義布林欄位
  const booleanFields = ['finished'];
  
  Object.keys(payload).forEach(key => {
    if (key !== 'id' && key !== 'created_at' && key !== 'rowversion' && key !== '_dirty') {
      if (numericFields.includes(key)) {
        request.input(key, sql.Decimal(10, 2), payload[key]);
      } else if (booleanFields.includes(key)) {
        request.input(key, sql.Bit, payload[key]);
      } else {
        request.input(key, sql.NVarChar, payload[key]);
      }
    }
  });
  request.input('id', sql.UniqueIdentifier, payload.id);
  
  await request.query(`
    MERGE inspections AS target
    USING (SELECT @id AS id) AS source
    ON target.id = source.id
    WHEN MATCHED THEN
      UPDATE SET
        roll_id = @roll_id,
        inspector_name = @inspector_name,
        standard_weight = @standard_weight,
        checked_weight = @checked_weight,
        standard_length = @standard_length,
        checked_length = @checked_length,
        ticket_full_width = @ticket_full_width,
        actual_full_width = @actual_full_width,
        ticket_cut_width = @ticket_cut_width,
        moisture = @moisture,
        skew_width = @skew_width,
        skew_height = @skew_height,
        appearance = @appearance,
        hand_feel = @hand_feel,
        slant_issue = @slant_issue,
        color_shade = @color_shade,
        specification_issue = @specification_issue,
        approved_sample = @approved_sample,
        sticker = @sticker,
        packing = @packing,
        remark = @remark,
        finished = @finished,
        inspection_started_at = @inspection_started_at,
        inspection_finished_at = @inspection_finished_at
    WHEN NOT MATCHED THEN
      INSERT (id, roll_id, inspector_name, standard_weight, checked_weight,
              standard_length, checked_length, ticket_full_width, actual_full_width,
              ticket_cut_width, moisture, skew_width, skew_height, appearance,
              hand_feel, slant_issue, color_shade, specification_issue,
              approved_sample, sticker, packing, remark, finished,
              inspection_started_at, inspection_finished_at)
      VALUES (@id, @roll_id, @inspector_name, @standard_weight, @checked_weight,
              @standard_length, @checked_length, @ticket_full_width, @actual_full_width,
              @ticket_cut_width, @moisture, @skew_width, @skew_height, @appearance,
              @hand_feel, @slant_issue, @color_shade, @specification_issue,
              @approved_sample, @sticker, @packing, @remark, @finished,
              @inspection_started_at, @inspection_finished_at);
  `);
}

async function upsertDefect(payload) {
  const request = pool.request();
  
  // 定義數字欄位
  const numericFields = ['position_yard', 'level'];
  
  // 定義 UUID 欄位
  const uuidFields = ['roll_id', 'inspection_id', 'defect_code_id'];
  
  // 確保必要的欄位存在，即使是 null
  const requiredFields = ['roll_id', 'inspection_id', 'defect_code_id', 'position_yard', 'level', 'remark'];
  
  // 先設置所有必要的參數為 null
  requiredFields.forEach(field => {
    if (uuidFields.includes(field)) {
      request.input(field, sql.UniqueIdentifier, payload[field] || null);
    } else if (numericFields.includes(field)) {
      if (field === 'position_yard') {
        request.input(field, sql.Decimal(10, 2), payload[field] || 0);
      } else {
        request.input(field, sql.Int, payload[field] || 1);
      }
    } else {
      request.input(field, sql.NVarChar, payload[field] || null);
    }
  });
  
  // 處理其他非必要欄位
  Object.keys(payload).forEach(key => {
    if (key !== 'id' && key !== 'created_at' && key !== 'rowversion' && key !== '_dirty' && !requiredFields.includes(key)) {
      if (numericFields.includes(key)) {
        if (key === 'position_yard') {
          request.input(key, sql.Decimal(10, 2), payload[key]);
        } else {
          request.input(key, sql.Int, payload[key]);
        }
      } else if (uuidFields.includes(key)) {
        request.input(key, sql.UniqueIdentifier, payload[key]);
      } else {
        request.input(key, sql.NVarChar, payload[key]);
      }
    }
  });
  
  request.input('id', sql.UniqueIdentifier, payload.id);
  
  await request.query(`
    MERGE defects AS target
    USING (SELECT @id AS id) AS source
    ON target.id = source.id
    WHEN MATCHED THEN
      UPDATE SET
        roll_id = @roll_id,
        inspection_id = @inspection_id,
        defect_code_id = @defect_code_id,
        position_yard = @position_yard,
        level = @level,
        remark = @remark
    WHEN NOT MATCHED THEN
      INSERT (id, roll_id, inspection_id, defect_code_id, position_yard, level, remark)
      VALUES (@id, @roll_id, @inspection_id, @defect_code_id, @position_yard, @level, @remark);
  `);
}

async function deleteEntity(entity, id) {
  const tableName = entity === 'rolls' ? 'rolls' : 
                   entity === 'inspections' ? 'inspections' : 
                   entity === 'defects' ? 'defects' : null;
  
  if (!tableName) {
    throw new Error(`Unknown entity type: ${entity}`);
  }
  
  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query(`DELETE FROM ${tableName} WHERE id = @id`);
}

// 啟動伺服器
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API docs: http://localhost:${PORT}/api`);
  });
}

// 優雅關閉
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (pool) {
    await pool.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  if (pool) {
    await pool.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
