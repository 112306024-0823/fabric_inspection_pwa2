<template>
  <q-page class="inspection-page">
    <!-- 標題列 -->
    <div class="header-section q-pa-md">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h5 q-mb-sm">檢驗作業 (Inspection)</div>
          <div class="row q-gutter-md text-body2">
            <div>Style: {{ currentRoll?.style }}</div>
            <div>Color: {{ currentRoll?.color }}</div>
            <div>BL#: {{ currentRoll?.bl_no }}</div>
            <div>Lot: {{ currentRoll?.lot }}</div>
            <div>Roll#: {{ currentRoll?.roll_number }}</div>
            <div>Average Point: {{ currentRoll?.avg_points?.toFixed(2) || '0.00' }}</div>
          </div>
          <div class="row q-gutter-md text-body2 q-mt-xs">
            <div>Fabric: {{ currentRoll?.fabric_description }}</div>
            <div>Supplier: {{ currentRoll?.supplier }}</div>
          </div>
        </div>
        <div class="col-auto">
          <q-btn 
            flat 
            round 
            icon="arrow_back" 
            @click="handleBack"
            size="lg"
          >
            <q-tooltip>返回</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <div class="row q-gutter-md q-pa-md">
      <!-- 左側表單區域 -->
      <div class="col-md-8 col-sm-12">
        <!-- Spec Check 區塊 -->
        <q-card class="spec-check-card q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Spec Check</div>
            
            <div class="row q-gutter-md">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-checkbox v-model="shortageCheck" label="Shortage Check" />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-md">
              <div class="col-md-1 col-sm-12 col-xs-6">
                <label for="standard_weight">NW</label>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.standard_weight"
                  label="STANDARD"
                  outlined
                  dense
                  suffix="KGS"
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.checked_weight"
                  label="CHECKED"
                  outlined
                  dense
                  suffix="KGS"
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-input
                  :model-value="weightDiff"
                  label="DIFF"
                  outlined
                  dense
                  suffix="%"
                  readonly
                />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-sm">
              <div class="col-md-1 col-sm-6 col-xs-6">
                <label for="standard_length">LENGTH</label>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.standard_length"
                  label="STANDARD"
                  outlined
                  dense
                  suffix="YARDS"
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.checked_length"
                  label="CHECKED"
                  outlined
                  dense
                  suffix="YARDS"
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-input
                  :model-value="lengthDiff"
                  label="DIFF"
                  outlined
                  dense
                  suffix="%"
                  readonly
                />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-sm">
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.ticket_full_width"
                  label="Ticket Full Width"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.actual_full_width"
                  label="Actual Full Width"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.ticket_cut_width"
                  label="Ticket Cut Width"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.moisture"
                  label="Moisture"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-sm">
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.skew_width"
                  label="SkewWidth"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-6 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="specForm.skew_height"
                  label="SkewHeight"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Quality Check 區塊 -->
        <q-card class="quality-check-card q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Quality Check</div>
            
            <div class="row q-gutter-md">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.appearance"
                  :options="passFailOptions"
                  label="Appearance"
                  outlined
                  dense
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.hand_feel"
                  :options="passFailOptions"
                  label="Hand-Feel"
                  outlined
                  dense
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.slant_issue"
                  :options="passFailOptions"
                  label="Slant Issue"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-sm">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.color_shade"
                  :options="passFailOptions"
                  label="Color Shade"
                  outlined
                  dense
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.specification_issue"
                  :options="passFailOptions"
                  label="Specification Issue"
                  outlined
                  dense
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.approved_sample"
                  :options="yesNoOptions"
                  label="Approved Sample"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-sm">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.sticker"
                  :options="passFailOptions"
                  label="Sticker"
                  outlined
                  dense
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.packing"
                  :options="passFailOptions"
                  label="Packing"
                  outlined
                  dense
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Defect Record 區塊 -->
        <q-card class="defect-record-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">Defect Record</div>
            
            <div class="row q-gutter-md">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="defectForm.defect_code_id"
                  :options="defectCodeOptions"
                  label="Issue Category"
                  outlined
                  dense
                  option-value="id"
                  option-label="description_zh"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="defectForm.defect_code_id"
                  :options="defectCodeOptions"
                  label="Defect Code"
                  outlined
                  dense
                  option-value="id"
                  option-label="description_kh"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-input
                  v-model="defectForm.remark"
                  label="Remark"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-gutter-md q-mt-sm">
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="defectForm.position_yard"
                  label="Position (Yard)"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model.number="defectForm.level"
                  label="Level"
                  outlined
                  dense
                  type="number"
                  min="1"
                  max="5"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-btn 
                  color="primary" 
                  label="ADD"
                  @click="handleAddDefect"
                  :disable="!canAddDefect"
                />
              </div>
            </div>

            <!-- 缺陷列表 -->
            <div class="defect-list q-mt-md">
              <q-table
                :rows="defectsList"
                :columns="defectColumns"
                row-key="id"
                flat
                bordered
                :rows-per-page-options="[5, 10, 20]"
                :pagination="{ rowsPerPage: 10 }"
              >
                <template v-slot:body-cell-level="props">
                  <q-td :props="props">
                    <q-chip 
                      :color="getDefectLevelColor(props.value)" 
                      text-color="white"
                      size="sm"
                    >
                      {{ props.value }}
                    </q-chip>
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn 
                      flat 
                      color="negative" 
                      icon="delete"
                      size="sm"
                      @click="handleDeleteDefect(props.row)"
                    >
                      <q-tooltip>刪除</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右側數字鍵盤 -->
      <div class="col-md-3 col-sm-12">
        <q-card class="keypad-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">數字鍵盤</div>
            <div class="keypad-grid">
              <div class="keypad-row" v-for="(row, rowIndex) in keypadLayout" :key="rowIndex">
                <q-btn
                  v-for="key in row"
                  :key="key"
                  :label="key"
                  :color="key === 'Back' ? 'negative' : 'primary'"
                  class="keypad-btn"
                  @click="handleKeypadInput(key)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 底部按鈕 -->
    <div class="bottom-actions q-pa-md">
      <div class="row justify-between items-center">
        <div class="col-auto">
          <q-btn 
            color="grey" 
            label="Start Fabric Inspect"
            :disable="true"
            size="lg"
          />
        </div>
        <div class="col-auto">
          <div class="row q-gutter-sm">
            <q-btn 
              color="primary" 
              label="Save"
              @click="handleSave"
              :loading="saving"
              size="lg"
            />
            <q-btn 
              color="grey" 
              label="Cancel"
              @click="handleCancel"
              size="lg"
            />
            <q-btn 
              color="positive" 
              label="Roll Finish"
              @click="handleRollFinish"
              :loading="finishing"
              size="lg"
            />
            <q-btn 
              color="info" 
              label="Signature"
              :disable="true"
              size="lg"
            />
          </div>
        </div>
        <div class="col-auto">
          <q-select
            v-model="selectedLanguage"
            :options="languageOptions"
            outlined
            dense
            style="min-width: 100px"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAppState } from '../composables/useAppState';
import { useRolls } from '../composables/useRolls';
import { db } from '../database';
import { getAllDefectCodes } from '../services/api';
import { addToOutbox } from '../services/sync';
import type { 
  Roll, 
  Inspection, 
  Defect, 
  DefectCode, 
  SpecCheckForm, 
  QualityCheckForm, 
  DefectForm 
} from '../types';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Composables
const { setCurrentRoll, setCurrentInspection } = useAppState();
const { getRollById } = useRolls();

// 響應式資料
const currentRoll = ref<Roll | null>(null);
const currentInspection = ref<Inspection | null>(null);
const defectsList = ref<Defect[]>([]);
const defectCodes = ref<DefectCode[]>([]);

// 表單資料
const shortageCheck = ref(false);
const specForm = ref<SpecCheckForm>({
  standard_weight: 0,
  checked_weight: 0,
  standard_length: 0,
  checked_length: 0,
  ticket_full_width: 0,
  actual_full_width: 0,
  ticket_cut_width: 0,
  moisture: 0,
  skew_width: 0,
  skew_height: 0
});

const qualityForm = ref<QualityCheckForm>({
  appearance: 'pass',
  hand_feel: 'pass',
  slant_issue: 'pass',
  color_shade: 'pass',
  specification_issue: 'pass',
  approved_sample: 'yes',
  sticker: 'pass',
  packing: 'pass'
});

const defectForm = ref<DefectForm>({
  defect_code_id: '',
  position_yard: 0,
  level: 1,
  remark: ''
});

// 選項資料
const passFailOptions = ['pass', 'fail'];
const yesNoOptions = ['yes', 'no'];
const languageOptions = ['CAB', 'EN', 'ZH'];
const selectedLanguage = ref('CAB');

// 狀態
const saving = ref(false);
const finishing = ref(false);

// 數字鍵盤配置
const keypadLayout = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'Back']
];

// 表格欄位定義
const defectColumns = [
  {
    name: 'code',
    required: true,
    label: 'Defect Code',
    align: 'left',
    field: (row: Defect) => getDefectCodeDescription(row.defect_code_id),
    sortable: true
  },
  {
    name: 'position_yard',
    label: 'Position (Yard)',
    align: 'right',
    field: 'position_yard',
    sortable: true,
    format: (val: number) => val ? val.toFixed(2) : '-'
  },
  {
    name: 'level',
    label: 'Level',
    align: 'center',
    field: 'level',
    sortable: true
  },
  {
    name: 'remark',
    label: 'Remark',
    align: 'left',
    field: 'remark'
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center',
    field: 'actions'
  }
];

// 計算屬性
const weightDiff = computed(() => {
  if (!specForm.value.standard_weight || !specForm.value.checked_weight) return '0%';
  const diff = ((specForm.value.checked_weight - specForm.value.standard_weight) / specForm.value.standard_weight) * 100;
  return `${diff.toFixed(2)}%`;
});

const lengthDiff = computed(() => {
  if (!specForm.value.standard_length || !specForm.value.checked_length) return '0%';
  const diff = ((specForm.value.checked_length - specForm.value.standard_length) / specForm.value.standard_length) * 100;
  return `${diff.toFixed(2)}%`;
});

const defectCodeOptions = computed(() => defectCodes.value);

const canAddDefect = computed(() => {
  return defectForm.value.defect_code_id && defectForm.value.position_yard > 0;
});

// 方法
const loadRollData = async () => {
  const rollId = route.params.rollId as string;
  if (!rollId) {
    void router.push('/');
    return;
  }

  try {
    const roll = await getRollById(rollId);
    if (!roll) {
      $q.notify({
        type: 'negative',
        message: '找不到指定的布捲',
        position: 'top'
      });
    void router.push('/');
      return;
    }

    currentRoll.value = roll;
    setCurrentRoll(roll);

    // 載入檢驗記錄
    await loadInspectionData(rollId);
    
    // 載入缺陷記錄
    await loadDefectsData(rollId);
    
    // 載入缺陷代碼
    await loadDefectCodes();
  } catch (error) {
    console.error('Error loading roll data:', error);
    $q.notify({
      type: 'negative',
      message: '載入資料失敗',
      position: 'top'
    });
  }
};

const loadInspectionData = async (rollId: string) => {
  try {
    const inspection = await db.inspections.where('roll_id').equals(rollId).first();
    if (inspection) {
      currentInspection.value = inspection;
      setCurrentInspection(inspection);
      
      // 載入表單資料
      specForm.value = {
        standard_weight: inspection.standard_weight || 0,
        checked_weight: inspection.checked_weight || 0,
        standard_length: inspection.standard_length || 0,
        checked_length: inspection.checked_length || 0,
        ticket_full_width: inspection.ticket_full_width || 0,
        actual_full_width: inspection.actual_full_width || 0,
        ticket_cut_width: inspection.ticket_cut_width || 0,
        moisture: inspection.moisture || 0,
        skew_width: inspection.skew_width || 0,
        skew_height: inspection.skew_height || 0
      };
      
      qualityForm.value = {
        appearance: (inspection.appearance as 'pass' | 'fail') ?? 'pass',
        hand_feel: (inspection.hand_feel as 'pass' | 'fail') ?? 'pass',
        slant_issue: (inspection.slant_issue as 'pass' | 'fail') ?? 'pass',
        color_shade: (inspection.color_shade as 'pass' | 'fail') ?? 'pass',
        specification_issue: (inspection.specification_issue as 'pass' | 'fail') ?? 'pass',
        approved_sample: (inspection.approved_sample as 'yes' | 'no') ?? 'yes',
        sticker: (inspection.sticker as 'pass' | 'fail') ?? 'pass',
        packing: (inspection.packing as 'pass' | 'fail') ?? 'pass'
      };
    }
  } catch (error) {
    console.error('Error loading inspection data:', error);
  }
};

const loadDefectsData = async (rollId: string) => {
  try {
    const defects = await db.defects.where('roll_id').equals(rollId).toArray();
    defectsList.value = defects;
  } catch (error) {
    console.error('Error loading defects data:', error);
  }
};

const loadDefectCodes = async () => {
  try {
    const codes = await getAllDefectCodes();
    defectCodes.value = codes;
  } catch (error) {
    console.error('Error loading defect codes:', error);
  }
};

const handleKeypadInput = (key: string) => {
  // TODO: 實作數字鍵盤輸入邏輯
  console.log('Keypad input:', key);
};

const handleAddDefect = async () => {
  if (!canAddDefect.value || !currentRoll.value) return;

  try {
    const newDefect: Defect = {
      id: crypto.randomUUID(),
      roll_id: currentRoll.value.id,
      inspection_id: currentInspection.value?.id,
      defect_code_id: defectForm.value.defect_code_id,
      position_yard: defectForm.value.position_yard,
      level: defectForm.value.level,
      remark: defectForm.value.remark,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rowversion: 1,
      _dirty: true
    };

    // 儲存到本地資料庫
    await db.defects.add(newDefect);
    
    // 加入同步佇列
    await addToOutbox('defects', 'upsert', newDefect.id, newDefect);
    
    // 更新本地狀態
    defectsList.value.push(newDefect);
    
    // 清空表單
    defectForm.value = {
      defect_code_id: '',
      position_yard: 0,
      level: 1,
      remark: ''
    };

    $q.notify({
      type: 'positive',
      message: '缺陷記錄已新增',
      position: 'top'
    });
  } catch (error) {
    console.error('Error adding defect:', error);
    $q.notify({
      type: 'negative',
      message: '新增缺陷記錄失敗',
      position: 'top'
    });
  }
};

const handleDeleteDefect = async (defect: Defect) => {
  $q.dialog({
    title: '確認刪除',
    message: '確定要刪除這個缺陷記錄嗎？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      // 從本地資料庫刪除
      await db.defects.delete(defect.id);
      
      // 加入同步佇列
      await addToOutbox('defects', 'delete', defect.id, defect);
      
      // 更新本地狀態
      const index = defectsList.value.findIndex(d => d.id === defect.id);
      if (index > -1) {
        defectsList.value.splice(index, 1);
      }

      $q.notify({
        type: 'positive',
        message: '缺陷記錄已刪除',
        position: 'top'
      });
    } catch (error) {
      console.error('Error deleting defect:', error);
      $q.notify({
        type: 'negative',
        message: '刪除缺陷記錄失敗',
        position: 'top'
      });
    }
  });
};

const handleSave = async () => {
  if (!currentRoll.value) return;

  saving.value = true;
  try {
    const inspectionData: Inspection = {
      id: currentInspection.value?.id || crypto.randomUUID(),
      roll_id: currentRoll.value.id,
      inspector_name: 'Inspector Name', // TODO: 從使用者設定取得
      ...specForm.value,
      ...qualityForm.value,
      remark: '', // TODO: 加入備註欄位
      finished: false,
      inspection_started_at: currentInspection.value?.inspection_started_at || new Date().toISOString(),
      inspection_finished_at: undefined,
      created_at: currentInspection.value?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rowversion: (currentInspection.value?.rowversion || 0) + 1,
      _dirty: true
    };

    // 儲存到本地資料庫
    await db.inspections.put(inspectionData);
    
    // 加入同步佇列
    await addToOutbox('inspections', 'upsert', inspectionData.id, inspectionData);
    
    // 更新本地狀態
    currentInspection.value = inspectionData;
    setCurrentInspection(inspectionData);

    $q.notify({
      type: 'positive',
      message: '檢驗記錄已儲存',
      position: 'top'
    });
  } catch (error) {
    console.error('Error saving inspection:', error);
    $q.notify({
      type: 'negative',
      message: '儲存檢驗記錄失敗',
      position: 'top'
    });
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  void router.push('/');
};

const handleRollFinish = async () => {
  if (!currentRoll.value || !currentInspection.value) return;

  $q.dialog({
    title: '確認完成',
    message: '確定要完成這個布捲的檢驗嗎？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    finishing.value = true;
    try {
      // 更新檢驗記錄為完成狀態
      const finishedInspection = {
        ...currentInspection.value,
        finished: true,
        inspection_finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rowversion: currentInspection.value.rowversion + 1,
        _dirty: true
      };

      await db.inspections.put(finishedInspection);
      await addToOutbox('inspections', 'upsert', finishedInspection.id, finishedInspection);

      // 更新布捲狀態
      const updatedRoll = {
        ...currentRoll.value,
        status: 'completed' as const,
        updated_at: new Date().toISOString(),
        _dirty: true
      };

      await db.rolls.put(updatedRoll);
      await addToOutbox('rolls', 'upsert', updatedRoll.id, updatedRoll);

      $q.notify({
        type: 'positive',
        message: '布捲檢驗已完成',
        position: 'top'
      });

      router.push('/');
    } catch (error) {
      console.error('Error finishing roll:', error);
      $q.notify({
        type: 'negative',
        message: '完成檢驗失敗',
        position: 'top'
      });
    } finally {
      finishing.value = false;
    }
  });
};

const handleBack = () => {
  void router.push('/');
};

const getDefectCodeDescription = (defectCodeId: string) => {
  const code = defectCodes.value.find(c => c.id === defectCodeId);
  return code ? code.description_zh || code.description_en || code.description_kh : '';
};

const getDefectLevelColor = (level: number) => {
  switch (level) {
    case 1: return 'positive';
    case 2: return 'warning';
    case 3: return 'negative';
    case 4: return 'negative';
    case 5: return 'negative';
    default: return 'grey';
  }
};

// 生命週期
onMounted(() => { void loadRollData(); });
</script>

<style scoped>
.inspection-page {
  background-color: #f5f5f5;
}

.header-section {
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.spec-check-card,
.quality-check-card,
.defect-record-card,
.keypad-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.keypad-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keypad-row {
  display: flex;
  gap: 8px;
}

.keypad-btn {
  flex: 1;
  min-height: 60px;
  font-size: 18px;
  font-weight: bold;
}

.bottom-actions {
  background-color: white;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  z-index: 1000;
}

.defect-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
