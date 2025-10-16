-- Fabric Inspection PWA2 - SQL Server Database Schema
-- 建立資料庫（如果需要）
-- CREATE DATABASE FabricInspectionDB;
-- USE FabricInspectionDB;

-- 1. 缺陷代碼表 (defect_codes)
CREATE TABLE defect_codes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    category NVARCHAR(50) NOT NULL,
    code NVARCHAR(20) NOT NULL,
    description_zh NVARCHAR(200),
    description_en NVARCHAR(200),
    description_kh NVARCHAR(200),
    severity_level INT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_defect_codes_code UNIQUE (code)
);

-- 2. 布捲表 (rolls)
CREATE TABLE rolls (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    barcode NVARCHAR(50) NOT NULL,
    bl_no NVARCHAR(50) NOT NULL,
    po_no NVARCHAR(50) NOT NULL,
    style NVARCHAR(100) NOT NULL,
    color NVARCHAR(50) NOT NULL,
    lot NVARCHAR(50) NOT NULL,
    roll_number NVARCHAR(50) NOT NULL,
    fabric_description NVARCHAR(200),
    supplier NVARCHAR(100),
    total_length DECIMAL(10,2) NOT NULL DEFAULT 0,
    need_inspect_length DECIMAL(10,2) NOT NULL DEFAULT 0,
    inspected_length DECIMAL(10,2) NOT NULL DEFAULT 0,
    standard_yard DECIMAL(10,2) NOT NULL DEFAULT 0,
    grade NVARCHAR(20),
    avg_points DECIMAL(5,2),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    rowversion ROWVERSION,
    
    CONSTRAINT UQ_rolls_barcode UNIQUE (barcode),
    CONSTRAINT CHK_rolls_status CHECK (status IN ('pending', 'inspecting', 'completed'))
);

-- 3. 檢驗記錄表 (inspections)
CREATE TABLE inspections (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    roll_id UNIQUEIDENTIFIER NOT NULL,
    inspector_name NVARCHAR(100),
    
    -- Spec Check
    standard_weight DECIMAL(10,2),
    checked_weight DECIMAL(10,2),
    standard_length DECIMAL(10,2),
    checked_length DECIMAL(10,2),
    ticket_full_width DECIMAL(10,2),
    actual_full_width DECIMAL(10,2),
    ticket_cut_width DECIMAL(10,2),
    moisture DECIMAL(5,2),
    skew_width DECIMAL(10,2),
    skew_height DECIMAL(10,2),
    
    -- Quality Check
    appearance NVARCHAR(10) NOT NULL DEFAULT 'pass',
    hand_feel NVARCHAR(10) NOT NULL DEFAULT 'pass',
    slant_issue NVARCHAR(10) NOT NULL DEFAULT 'pass',
    color_shade NVARCHAR(10) NOT NULL DEFAULT 'pass',
    specification_issue NVARCHAR(10) NOT NULL DEFAULT 'pass',
    approved_sample NVARCHAR(10) NOT NULL DEFAULT 'yes',
    sticker NVARCHAR(10) NOT NULL DEFAULT 'pass',
    packing NVARCHAR(10) NOT NULL DEFAULT 'pass',
    
    remark NVARCHAR(500),
    finished BIT NOT NULL DEFAULT 0,
    inspection_started_at DATETIME2,
    inspection_finished_at DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    rowversion ROWVERSION,
    
    CONSTRAINT FK_inspections_roll_id FOREIGN KEY (roll_id) REFERENCES rolls(id) ON DELETE CASCADE,
    CONSTRAINT CHK_inspections_appearance CHECK (appearance IN ('pass', 'fail')),
    CONSTRAINT CHK_inspections_hand_feel CHECK (hand_feel IN ('pass', 'fail')),
    CONSTRAINT CHK_inspections_slant_issue CHECK (slant_issue IN ('pass', 'fail')),
    CONSTRAINT CHK_inspections_color_shade CHECK (color_shade IN ('pass', 'fail')),
    CONSTRAINT CHK_inspections_specification_issue CHECK (specification_issue IN ('pass', 'fail')),
    CONSTRAINT CHK_inspections_approved_sample CHECK (approved_sample IN ('yes', 'no')),
    CONSTRAINT CHK_inspections_sticker CHECK (sticker IN ('pass', 'fail')),
    CONSTRAINT CHK_inspections_packing CHECK (packing IN ('pass', 'fail'))
);

-- 4. 缺陷記錄表 (defects)
CREATE TABLE defects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    roll_id UNIQUEIDENTIFIER NOT NULL,
    inspection_id UNIQUEIDENTIFIER,
    defect_code_id UNIQUEIDENTIFIER NOT NULL,
    position_yard DECIMAL(10,2),
    level INT NOT NULL DEFAULT 1,
    remark NVARCHAR(500),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    rowversion ROWVERSION,
    
    CONSTRAINT FK_defects_roll_id FOREIGN KEY (roll_id) REFERENCES rolls(id) ON DELETE CASCADE,
    CONSTRAINT FK_defects_inspection_id FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE SET NULL,
    CONSTRAINT FK_defects_defect_code_id FOREIGN KEY (defect_code_id) REFERENCES defect_codes(id),
    CONSTRAINT CHK_defects_level CHECK (level >= 1 AND level <= 5)
);

-- 5. 同步記錄表 (sync_logs) - 用於追蹤同步狀態
CREATE TABLE sync_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    entity_type NVARCHAR(20) NOT NULL,
    entity_id UNIQUEIDENTIFIER NOT NULL,
    operation NVARCHAR(10) NOT NULL,
    client_mutation_id NVARCHAR(100),
    synced_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    
    CONSTRAINT CHK_sync_logs_entity_type CHECK (entity_type IN ('rolls', 'inspections', 'defects')),
    CONSTRAINT CHK_sync_logs_operation CHECK (operation IN ('insert', 'update', 'delete')),
    CONSTRAINT CHK_sync_logs_status CHECK (status IN ('pending', 'synced', 'failed'))
);

-- 建立索引以提升查詢效能
CREATE INDEX IX_rolls_barcode ON rolls(barcode);
CREATE INDEX IX_rolls_status ON rolls(status);
CREATE INDEX IX_rolls_updated_at ON rolls(updated_at);

CREATE INDEX IX_inspections_roll_id ON inspections(roll_id);
CREATE INDEX IX_inspections_finished ON inspections(finished);
CREATE INDEX IX_inspections_updated_at ON inspections(updated_at);

CREATE INDEX IX_defects_roll_id ON defects(roll_id);
CREATE INDEX IX_defects_inspection_id ON defects(inspection_id);
CREATE INDEX IX_defects_defect_code_id ON defects(defect_code_id);
CREATE INDEX IX_defects_updated_at ON defects(updated_at);

CREATE INDEX IX_defect_codes_category ON defect_codes(category);
CREATE INDEX IX_defect_codes_is_active ON defect_codes(is_active);

CREATE INDEX IX_sync_logs_entity_type ON sync_logs(entity_type);
CREATE INDEX IX_sync_logs_status ON sync_logs(status);
CREATE INDEX IX_sync_logs_synced_at ON sync_logs(synced_at);

-- 插入預設的缺陷代碼
INSERT INTO defect_codes (category, code, description_zh, description_en, description_kh, severity_level) VALUES
('外觀', 'A01', '污漬', 'Stain', '污漬', 3),
('外觀', 'A02', '破洞', 'Hole', '破洞', 4),
('外觀', 'A03', '色差', 'Color Shade', '色差', 3),
('外觀', 'A04', '皺摺', 'Wrinkle', '皺摺', 2),
('外觀', 'A05', '起毛', 'Pilling', '起毛', 2),
('品質', 'Q01', '重量不足', 'Under Weight', '重量不足', 3),
('品質', 'Q02', '長度不足', 'Short Length', '長度不足', 3),
('品質', 'Q03', '寬度不足', 'Narrow Width', '寬度不足', 3),
('品質', 'Q04', '厚度不均', 'Uneven Thickness', '厚度不均', 2),
('品質', 'Q05', '手感不佳', 'Poor Hand Feel', '手感不佳', 2);

-- 建立觸發器自動更新 updated_at 欄位
CREATE TRIGGER TR_rolls_updated_at
ON rolls
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE rolls 
    SET updated_at = GETUTCDATE()
    FROM rolls r
    INNER JOIN inserted i ON r.id = i.id;
END;

CREATE TRIGGER TR_inspections_updated_at
ON inspections
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE inspections 
    SET updated_at = GETUTCDATE()
    FROM inspections i
    INNER JOIN inserted ins ON i.id = ins.id;
END;

CREATE TRIGGER TR_defects_updated_at
ON defects
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE defects 
    SET updated_at = GETUTCDATE()
    FROM defects d
    INNER JOIN inserted i ON d.id = i.id;
END;

CREATE TRIGGER TR_defect_codes_updated_at
ON defect_codes
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE defect_codes 
    SET updated_at = GETUTCDATE()
    FROM defect_codes dc
    INNER JOIN inserted i ON dc.id = i.id;
END;
