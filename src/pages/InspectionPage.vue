<template>
  <q-page class="inspection-page">
    <!-- 標題列 -->
    <div class="header-section q-pa-md bg-white">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="roll-info-compact">
            <div class="info-row">
              <span class="info-item"><strong>BL#:</strong> {{ currentRoll?.bl_no || '-' }}</span>
              <span class="info-separator">|</span>
              <span class="info-item"><strong>Lot:</strong> {{ currentRoll?.lot || '-' }}</span>
              <span class="info-separator">|</span>
              <span class="info-item"><strong>Roll#:</strong> {{ currentRoll?.roll_number || '-' }}</span>
              <span class="info-separator">|</span>
              <span class="info-item"><strong>Style:</strong> {{ currentRoll?.style || '-' }}</span>
              <span class="info-separator">|</span>
              <span class="info-item"><strong>Color:</strong> {{ currentRoll?.color || '-' }}</span>
              <span class="info-separator">|</span>
              <span class="info-item"><strong>Fabric:</strong> {{ currentRoll?.fabric_description || '-' }}</span>
              <span class="info-separator">|</span>
              <span class="info-item"><strong>Supplier:</strong> {{ currentRoll?.supplier || '-' }}</span>
              <span class="info-separator">|</span>
              <span class="info-item avg-points"><strong>Avg Point:</strong> 
                <span :class="avgPointsColor">{{ currentRoll?.avg_points?.toFixed(2) || '0.00' }}</span>
              </span>
            </div>
            
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat round icon="arrow_back" @click="handleBack" size="md">
            <q-tooltip>返回清單</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-pa-md">
      <!-- 左側表單區域 -->
      <div class="col-md-8 col-sm-12">
        <!-- Spec Check 區塊 -->
        <q-card class="spec-check-card q-mb-md shadow-2">
          <q-card-section class="spec-check-content">
            <div class="section-title q-mb-md">
              <span class="text-h6">Specification Check</span>
            </div>
            
            

            <!-- Spec Check 規格檢查表 -->
            <div class="spec-check-grid">
              <!-- 表頭 -->
              <div class="spec-header">
                <div class="spec-header-item spec-item-label">
                  <span class="text-weight-medium">檢查項目</span>
                </div>
                <div class="spec-header-item spec-item-standard">
                  <span class="text-weight-medium">標準值</span>
                </div>
                <div class="spec-header-item spec-item-checked">
                  <span class="text-weight-medium">實測值</span>
                </div>
                <div class="spec-header-item spec-item-diff">
                  <span class="text-weight-medium">差異%</span>
                </div>
              </div>

              <!-- 重量檢查 -->
              <div class="spec-row">
                <div class="spec-item spec-item-label">
                  <div class="spec-item-content">
                    <q-icon name="scale" size="md" class="q-mr-sm text-primary" />
                    <div>
                      <div class="text-weight-medium">Weight (KGS)</div>
                      <div class="text-caption text-grey-6"></div>
                    </div>
                  </div>
                </div>
                <div class="spec-item spec-item-standard">
                  <q-input
                    v-model.number="specForm.standard_weight"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('standard_weight', 'spec')"
                    class="keypad-input spec-input-no-border"
                  />
                </div>
                <div class="spec-item spec-item-checked">
                  <q-input
                    v-model.number="specForm.checked_weight"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('checked_weight', 'spec')"
                    class="keypad-input spec-input-no-border"
                  />
                </div>
                <div class="spec-item spec-item-diff">
                  <q-input
                    :model-value="`${weightDiff}%`"
                    outlined
                    dense
                    readonly
                    :bg-color="getDiffColor(weightDiff)"
                    :color="weightDiff > 0 ? 'positive' : weightDiff < 0 ? 'negative' : 'grey'"
                    
                  >
                    <template v-slot:prepend>
                      <q-icon 
                        :name="weightDiff > 0 ? 'trending_up' : weightDiff < 0 ? 'trending_down' : 'remove'" 
                        :color="weightDiff > 0 ? 'positive' : weightDiff < 0 ? 'negative' : 'grey'"
                        size="sm"
                        
                      />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- 長度檢查 -->
              <div class="spec-row">
                <div class="spec-item spec-item-label">
                  <div class="spec-item-content">
                    <q-icon name="straighten" size="md" class="q-mr-sm text-primary" />
                    <div>
                      <div class="text-weight-medium">Length (YARDS)</div>
                    </div>
                  </div>
                </div>
                <div class="spec-item spec-item-standard">
                  <q-input
                    v-model.number="specForm.standard_length"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('standard_length', 'spec')"
                    class="keypad-input spec-input-no-border"
                  />
                </div>
                <div class="spec-item spec-item-checked">
                  <q-input
                    v-model.number="specForm.checked_length"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('checked_length', 'spec')"
                    class="keypad-input spec-input-no-border"
                  />
                </div>
                <div class="spec-item spec-item-diff">
                  <q-input
                    :model-value="`${lengthDiff}%`"
                    outlined
                    dense
                    readonly
                    :bg-color="getDiffColor(lengthDiff)"
                    :color="lengthDiff > 0 ? 'positive' : lengthDiff < 0 ? 'negative' : 'grey'"
                  >
                    <template v-slot:prepend>
                      <q-icon 
                        :name="lengthDiff > 0 ? 'trending_up' : lengthDiff < 0 ? 'trending_down' : 'remove'" 
                        :color="lengthDiff > 0 ? 'positive' : lengthDiff < 0 ? 'negative' : 'grey'"
                        size="sm"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- 其他規格項目 -->
            <div class="q-mt-md">
              <div class="row q-col-gutter-md">
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.ticket_full_width"
                    label="Ticket Full Width"
                    outlined
                    
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('ticket_full_width', 'spec')"
                    class="keypad-input"
                  />
                </div>
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.actual_full_width"
                    label="Actual Full Width"
                    outlined
                    
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('actual_full_width', 'spec')"
                    class="keypad-input"
                  />
                </div>
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.ticket_cut_width"
                    label="Ticket Cut Width"
                    outlined
                    
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('ticket_cut_width', 'spec')"
                    class="keypad-input"
                  />
                </div>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.moisture"
                    label="Moisture %"
                    outlined
                    
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('moisture', 'spec')"
                    class="keypad-input"
                  />
                </div>
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.skew_width"
                    label="Skew Width"
                    outlined
                    
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('skew_width', 'spec')"
                    class="keypad-input"
                  />
                </div>
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.skew_height"
                    label="Skew Height"
                    outlined
                    
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('skew_height', 'spec')"
                    class="keypad-input"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Quality Check & Defect Record 合併區塊 -->
        <q-card class="quality-defect-card q-mb-md shadow-2">
          <q-card-section>
            <!-- 標題行 -->
            <div class="row q-mb-md">
              <div class="col-6">
                <div class="section-title">
                  <span class="text-h6">Quality Check</span>
                  <q-chip v-if="defectsList.length > 0"  text-color="grey-7" size="sm" class="q-ml-sm">
                    click to change status
                  </q-chip>
                </div>
                
              </div>
              <div class="col-6">
                <div class="section-title">
                  <span class="text-h6">Defect Record</span>
                  <q-chip v-if="defectsList.length > 0" color="negative" text-color="white" size="sm" class="q-ml-sm">
                    {{ defectsList.length }} 筆缺陷
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- 內容行 -->
            <div class="quality-defect-container">
              <!-- Quality Check 左側 -->
               
              <div class="quality-check-section">
                <div class="quality-check-grid">
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <div class="quality-check-item" @click="toggleQualityCheck('appearance')">
                        <div class="quality-content">
                          <span class="quality-label">Appearance</span>
                          <div class="quality-status">
                            <span class="status-text" :class="qualityForm.appearance === 'pass' ? 'pass' : 'fail'">
                            </span>
                            <q-icon 
                              :name="qualityForm.appearance === 'pass' ? 'check_circle' : 'cancel'" 
                              :color="qualityForm.appearance === 'pass' ? 'positive' : 'negative'"
                              size="sm"
                              class="status-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="quality-check-item" @click="toggleQualityCheck('hand_feel')">
                        <div class="quality-content">
                          <span class="quality-label">Hand-Feel</span>
                          <div class="quality-status">
                            <span class="status-text" :class="qualityForm.hand_feel === 'pass' ? 'pass' : 'fail'">
                            </span>
                            <q-icon 
                              :name="qualityForm.hand_feel === 'pass' ? 'check_circle' : 'cancel'" 
                              :color="qualityForm.hand_feel === 'pass' ? 'positive' : 'negative'"
                              size="sm"
                              class="status-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-6">
                      <div class="quality-check-item" @click="toggleQualityCheck('slant_issue')">
                        <div class="quality-content">
                          <span class="quality-label">Slant Issue</span>
                          <div class="quality-status">
                            <span class="status-text" :class="qualityForm.slant_issue === 'pass' ? 'pass' : 'fail'">
                            </span>
                            <q-icon 
                              :name="qualityForm.slant_issue === 'pass' ? 'check_circle' : 'cancel'" 
                              :color="qualityForm.slant_issue === 'pass' ? 'positive' : 'negative'"
                              size="sm"
                              class="status-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="quality-check-item" @click="toggleQualityCheck('color_shade')">
                        <div class="quality-content">
                          <span class="quality-label">Color Shade</span>
                          <div class="quality-status">
                            
                            <q-icon 
                              :name="qualityForm.color_shade === 'pass' ? 'check_circle' : 'cancel'" 
                              :color="qualityForm.color_shade === 'pass' ? 'positive' : 'negative'"
                              size="sm"
                              class="status-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-6">
                      <div class="quality-check-item" @click="toggleQualityCheck('specification_issue')">
                        <div class="quality-content">
                          <span class="quality-label">Specification</span>
                          <div class="quality-status">
                            
                            <q-icon 
                              :name="qualityForm.specification_issue === 'pass' ? 'check_circle' : 'cancel'" 
                              :color="qualityForm.specification_issue === 'pass' ? 'positive' : 'negative'"
                              size="sm"
                              class="status-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="quality-check-item" @click="toggleQualityCheck('approved_sample')">
                        <div class="quality-content">
                          <span class="quality-label">Approved Sample</span>
                          <div class="quality-status">
                            
                            <q-icon 
                              :name="qualityForm.approved_sample === 'yes' ? 'check_circle' : 'cancel'" 
                              :color="qualityForm.approved_sample === 'yes' ? 'positive' : 'negative'"
                              size="sm"
                              class="status-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-6">
                      <div class="quality-check-item" @click="toggleQualityCheck('sticker')">
                        <div class="quality-content">
                          <span class="quality-label">Sticker</span>
                          <div class="quality-status">
                            
                            <q-icon 
                              :name="qualityForm.sticker === 'pass' ? 'check_circle' : 'cancel'" 
                              :color="qualityForm.sticker === 'pass' ? 'positive' : 'negative'"
                              size="sm"
                              class="status-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="quality-check-item" @click="toggleQualityCheck('packing')">
                        <div class="quality-content">
                          <span class="quality-label">Packing</span>
                          <div class="quality-status">
                           
                            <q-icon 
                              :name="qualityForm.packing === 'pass' ? 'check_circle' : 'cancel'" 
                              :color="qualityForm.packing === 'pass' ? 'positive' : 'negative'"
                              size="sm"
                              class="status-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Defect Record 右側 -->
              <div class="defect-record-section">
                <div class="defect-record-grid">
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-select
                        v-model="selectedCategory"
                        :options="categoryOptions"
                        label="Issue Category"
                        outlined
                        
                        emit-value
                        map-options
                        @update:model-value="onCategoryChange"
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="defectForm.defect_code_id"
                        :options="filteredDefectCodes"
                        label="Description"
                        outlined
                        
                        option-value="id"
                        :option-label="opt => getDefectCodeDescription(opt.id, 'zh')"
                        emit-value
                        map-options
                        :disable="!selectedCategory"
                      >
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label>{{ getDefectCodeDescription(scope.opt.id, 'zh') }}</q-item-label>
                              <q-item-label caption>{{ scope.opt.code }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-6">
                      <q-input
                        v-model="defectForm.remark"
                        label="Remark"
                        outlined
                        
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        ref="positionInput"
                        v-model.number="defectForm.position_yard"
                        label="Position (Yard)"
                        outlined
                        
                        type="number"
                        step="0.01"
                        @focus="handleFieldFocus('position_yard', 'defect')"
                        class="keypad-input"
                      />
                    </div>
                  </div>

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-6">
                      <q-select
                        v-model.number="defectForm.level"
                        :options="[1, 2, 3, 4, 5]"
                        label="Severity Level"
                        outlined
                        
                        emit-value
                        map-options
                      />
                    </div>
                    <div class="col-6">
                      <q-btn 
                        color="primary" 
                        label="ADD"
                        icon="add"
                        @click="handleAddDefect"
                        :disable="!canAddDefect"
                        class="full-width"
                        style="height: 55px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </q-card-section>
        </q-card>
      </div>

      <!-- 右側數字鍵盤和缺陷列表 -->
      <div class="col-md-4 col-sm-12">
        <!-- 數字鍵盤 -->
        <q-card class="keypad-card shadow-2 sticky-keypad">
          <q-card-section>
            
            <div class="keypad-grid">
              <div class="keypad-row" v-for="(row, rowIndex) in keypadLayout" :key="rowIndex">
                <q-btn
                  v-for="key in row"
                  :key="key"
                  :label="key === 'Back' ? '←' : key"
                  :color="key === 'Back' ? 'negative' : 'primary'"
                  class="keypad-btn"
                  @click="handleKeypadInput(key)"
                  unelevated
                />
              </div>
            </div>
            <div class="text-caption text-grey-8 q-mt-sm text-center">
              <div v-if="focusedField" class="text-primary text-weight-medium">
                當前輸入: {{ getFieldLabel(focusedField) }}
              </div>
              <div v-else class="text-grey-6">
                請點擊數字欄位開始輸入
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 缺陷列表 -->
        <q-card class="defect-table-card shadow-2 q-mt-md">
          <q-card-section>
            <div class="section-title q-mb-md">
              <span class="text-h6">Defect List</span>
            </div>
            
            <div v-if="defectsList.length > 0" class="defect-list">
              <q-table
                :rows="defectsList"
                :columns="defectColumns"
                row-key="id"
                flat
                bordered
                :rows-per-page-options="[5, 10, 20]"
                :pagination="{ rowsPerPage: 10 }"
                dense
              >
                <template v-slot:body-cell-code="props">
                  <q-td :props="props">
                    <div class="text-weight-medium">
                      {{ getDefectCode(props.row.defect_code_id)?.description_zh || 
                         getDefectCode(props.row.defect_code_id)?.description_en || '-' }}
                    </div>
                    <div class="text-caption text-grey-7">
                      Code: {{ getDefectCode(props.row.defect_code_id)?.code || '-' }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-level="props">
                  <q-td :props="props">
                    <q-badge 
                      :color="getDefectLevelColor(props.value)" 
                      :label="props.value"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn 
                      flat 
                      dense
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
            <div v-else class="text-center text-grey-6 q-pa-md">
              <q-icon name="info" size="md" />
              <div class="q-mt-sm">尚無缺陷記錄</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 底部按鈕 -->
    <div class="bottom-actions q-pa-md bg-white">
      <div class="row justify-between items-center q-col-gutter-sm">
        <div class="col-auto">
          <q-btn 
            outline
            color="grey-7" 
            label="Start Fabric Inspect"
            icon="play_arrow"
            :disable="true"
          />
        </div>
        <div class="col-auto">
          <div class="row q-gutter-sm">
            <q-btn 
              color="primary" 
              label="Save"
              icon="save"
              @click="handleSave"
              :loading="saving"
              unelevated
            />
            <q-btn 
              outline
              color="grey" 
              label="Cancel"
              icon="close"
              @click="handleCancel"
            />
            <q-btn 
              color="positive" 
              label="Roll Finish"
              icon="check_circle"
              @click="handleRollFinish"
              :loading="finishing"
              unelevated
            />
            <q-btn 
              outline
              color="info" 
              label="Signature"
              icon="edit"
              :disable="true"
            />
          </div>
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
import { useInspections } from '../composables/useInspections';
import { useDefects } from '../composables/useDefects';
import type { Roll, Inspection, Defect, DefectCode, SpecCheckForm, QualityCheckForm, DefectForm } from '../types';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Composables
const { setCurrentRoll, setCurrentInspection, updatePendingSyncCount } = useAppState();
const { getRollById, updateRollStatus } = useRolls();
const { getInspection, saveInspection, finishInspection } = useInspections();
const { 
  defectsList, 
  defectCodesList,
  defectCodesByCategory,
  loadDefectsFromLocal, 
  loadDefectCodes, 
  addDefect, 
  deleteDefect,
  getDefectCodeDescription,
  getDefectCode
} = useDefects();

// 響應式資料
const currentRoll = ref<Roll | null>(null);
const currentInspection = ref<Inspection | null>(null);
const positionInput = ref<any>(null);
const focusedField = ref<string>('');
const focusedFieldType = ref<'spec' | 'defect' | null>(null);
const selectedCategory = ref<string>('');

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
const passFailOptions = [
  { label: 'Pass', value: 'pass' },
  { label: 'Fail', value: 'fail' }
];
const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];



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


// 計算屬性
const categoryOptions = computed(() => {
  const categories = Object.keys(defectCodesByCategory.value).map(cat => ({ label: cat, value: cat }));
  console.log('🏷️ Raw defect codes:', defectCodesList.value);
  console.log('🏷️ Category options:', categories);
  console.log('🏷️ Defect codes by category:', defectCodesByCategory.value);
  return categories;
});

const filteredDefectCodes = computed(() => {
  if (!selectedCategory.value) return [];
  const filtered = defectCodesByCategory.value[selectedCategory.value] || [];
  console.log('🔍 Filtered defect codes for category', selectedCategory.value, ':', filtered);
  return filtered;
});

const weightDiff = computed(() => {
  if (!specForm.value.standard_weight || !specForm.value.checked_weight) return '0.00';
  const diff = ((specForm.value.checked_weight - specForm.value.standard_weight) / specForm.value.standard_weight) * 100;
  return diff.toFixed(2);
});

const lengthDiff = computed(() => {
  if (!specForm.value.standard_length || !specForm.value.checked_length) return '0.00';
  const diff = ((specForm.value.checked_length - specForm.value.standard_length) / specForm.value.standard_length) * 100;
  return diff.toFixed(2);
});

const canAddDefect = computed(() => {
  return defectForm.value.defect_code_id && defectForm.value.position_yard > 0;
});

// Avg Points 顏色
const avgPointsColor = computed(() => {
  const points = currentRoll.value?.avg_points || 0;
  if (points <= 2) return 'text-positive';
  if (points <= 4) return 'text-warning';
  return 'text-negative';
});

// 表格欄位定義
const defectColumns = [
  {
    name: 'code',
    required: true,
    label: 'Description',
    align: 'left',
    field: 'defect_code_id',
    sortable: false
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
    label: '',
    align: 'center',
    field: 'actions'
  }
];

// 方法
const loadRollData = async () => {
  const rollId = route.params.rollId as string;
  console.log('🔍 Loading roll data for ID:', rollId);
  
  if (!rollId || rollId === 'undefined' || rollId === 'null') {
    console.warn('❌ Invalid rollId:', rollId);
    $q.notify({
      type: 'negative',
      message: '無效的布捲ID',
      position: 'top'
    });
    void router.push('/');
    return;
  }

  try {
    console.log('📦 Fetching roll by ID:', rollId);
    const roll = await getRollById(rollId);
    
    if (!roll) {
      console.warn('❌ Roll not found:', rollId);
      $q.notify({
        type: 'negative',
        message: '找不到指定的布捲',
        position: 'top'
      });
      void router.push('/');
      return;
    }
    
    console.log('✅ Roll loaded successfully:', roll);

    currentRoll.value = roll;
    setCurrentRoll(roll);

    // 更新ROLL狀態為 inspecting
    if (roll.status === 'pending') {
      await updateRollStatus(rollId, 'inspecting');
    }

    // 載入檢驗記錄
    const inspection = await getInspection(rollId);
    if (inspection) {
      currentInspection.value = inspection;
      setCurrentInspection(inspection);
      loadInspectionForm(inspection);
    }
    
    // 載入缺陷記錄
    await loadDefectsFromLocal(rollId);
    
    // 載入缺陷代碼
    console.log('🔄 Loading defect codes...');
    await loadDefectCodes();
    console.log('✅ Defect codes loaded. Total:', defectCodesList.value.length);
    console.log('📋 Defect codes data:', defectCodesList.value);
  } catch (error) {
    console.error('Error loading roll data:', error);
    $q.notify({
      type: 'negative',
      message: '載入資料失敗',
      position: 'top'
    });
  }
};

const loadInspectionForm = (inspection: Inspection) => {
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
    appearance: inspection.appearance === 'fail' ? 'fail' : 'pass',
    hand_feel: inspection.hand_feel === 'fail' ? 'fail' : 'pass',
    slant_issue: inspection.slant_issue === 'fail' ? 'fail' : 'pass',
    color_shade: inspection.color_shade === 'fail' ? 'fail' : 'pass',
    specification_issue: inspection.specification_issue === 'fail' ? 'fail' : 'pass',
    approved_sample: inspection.approved_sample === 'no' ? 'no' : 'yes',
    sticker: inspection.sticker === 'fail' ? 'fail' : 'pass',
    packing: inspection.packing === 'fail' ? 'fail' : 'pass'
  };
};

const onCategoryChange = () => {
  console.log('📂 Category changed to:', selectedCategory.value);
  console.log('📂 Category type:', typeof selectedCategory.value);
  console.log('📂 All available categories:', Object.keys(defectCodesByCategory.value));
  console.log('📂 Full defectCodesByCategory:', defectCodesByCategory.value);
  console.log('📂 Available defect codes for this category:', defectCodesByCategory.value[selectedCategory.value]);
  
  // 檢查是否有完全匹配的分類
  const exactMatch = defectCodesByCategory.value[selectedCategory.value];
  if (!exactMatch) {
    console.warn('⚠️ No exact match found for category:', selectedCategory.value);
    // 嘗試找到相似的分類（只有當 selectedCategory.value 是字符串時才執行）
    if (typeof selectedCategory.value === 'string') {
      const similarCategories = Object.keys(defectCodesByCategory.value).filter(cat => 
        cat.includes(selectedCategory.value) || selectedCategory.value.includes(cat)
      );
      console.log('🔍 Similar categories found:', similarCategories);
    }
  }
  
  // 清空已選的 defect code
  defectForm.value.defect_code_id = '';
};

// 處理欄位聚焦
const handleFieldFocus = (fieldName: string, fieldType: 'spec' | 'defect') => {
  focusedField.value = fieldName;
  focusedFieldType.value = fieldType;
  console.log('✓ Field focused:', fieldName, fieldType);
};

// 取得欄位標籤
const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    'standard_weight': 'Weight - Standard (KGS)',
    'checked_weight': 'Weight - Checked (KGS)',
    'standard_length': 'Length - Standard (YARDS)',
    'checked_length': 'Length - Checked (YARDS)',
    'ticket_full_width': 'Ticket Full Width',
    'actual_full_width': 'Actual Full Width',
    'ticket_cut_width': 'Ticket Cut Width',
    'moisture': 'Moisture %',
    'skew_width': 'Skew Width',
    'skew_height': 'Skew Height',
    'position_yard': 'Position (Yard)'
  };
  return labels[field] || field;
};

const getCodeDescription = (code: DefectCode) => {
  const lang = selectedLanguage.value.value;
  if (lang === 'CAB') return code.description_kh || code.description_zh || code.description_en;
  if (lang === 'EN') return code.description_en || code.description_zh || code.description_kh;
  return code.description_zh || code.description_en || code.description_kh;
};

const handleKeypadInput = (key: string) => {
  if (!focusedField.value || !focusedFieldType.value) return;

  const fieldName = focusedField.value;
  const fieldType = focusedFieldType.value;

  // 取得當前欄位值
  let currentValue = '0';
  if (fieldType === 'spec') {
    currentValue = String(specForm.value[fieldName as keyof SpecCheckForm] || '0');
  } else if (fieldType === 'defect' && fieldName === 'position_yard') {
    currentValue = String(defectForm.value.position_yard || '0');
  }

  // 處理按鍵輸入
  let newValue = '';
  
  if (key === 'Back') {
    // 退格
    if (currentValue.length <= 1) {
      newValue = '0';
    } else {
      newValue = currentValue.slice(0, -1);
    }
  } else if (key === '.') {
    // 小數點
    if (!currentValue.includes('.')) {
      newValue = currentValue + '.';
    } else {
      return; // 已有小數點，不處理
    }
  } else {
    // 數字
    if (currentValue === '0') {
      newValue = key;
    } else {
      newValue = currentValue + key;
    }
  }

  // 更新對應欄位的值
  const numValue = parseFloat(newValue) || 0;
  
  if (fieldType === 'spec') {
    specForm.value[fieldName as keyof SpecCheckForm] = numValue as any;
  } else if (fieldType === 'defect' && fieldName === 'position_yard') {
    defectForm.value.position_yard = numValue;
  }

  console.log('✓ Keypad input:', key, '→', fieldName, '=', newValue);
};

// 切換 Quality Check 狀態
const toggleQualityCheck = (field: keyof QualityCheckForm) => {
  if (field === 'approved_sample') {
    // Approved Sample 是 Yes/No 切換
    qualityForm.value[field] = qualityForm.value[field] === 'yes' ? 'no' : 'yes';
  } else {
    // 其他欄位是 Pass/Fail 切換
    qualityForm.value[field] = qualityForm.value[field] === 'pass' ? 'fail' : 'pass';
  }
  
  console.log(` Quality check toggled: ${field} = ${qualityForm.value[field]}`);
};

const handleAddDefect = async () => {
  if (!canAddDefect.value || !currentRoll.value) return;

  const result = await addDefect(
    currentRoll.value.id,
    currentInspection.value?.id,
    defectForm.value
  );

  if (result) {
    // 清空表單
    defectForm.value = {
      defect_code_id: '',
      position_yard: 0,
      level: 1,
      remark: ''
    };
    selectedCategory.value = '';

    $q.notify({
      type: 'positive',
      message: '缺陷記錄已新增',
      position: 'top',
      timeout: 1000
    });
    
    await updatePendingSyncCount();
  }
};

const handleDeleteDefect = (defect: Defect) => {
  $q.dialog({
    title: '確認刪除',
    message: '確定要刪除這個缺陷記錄嗎？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const ok = await deleteDefect(defect.id);
    if (ok) {
      $q.notify({
        type: 'positive',
        message: '缺陷記錄已刪除',
        position: 'top',
        timeout: 1000
      });
      await updatePendingSyncCount();
    }
  });
};

const handleSave = async () => {
  if (!currentRoll.value) return;

  saving.value = true;
  try {
    const result = await saveInspection(
      currentRoll.value.id,
      specForm.value,
      qualityForm.value,
      currentInspection.value || undefined
    );

    if (result) {
      currentInspection.value = result;
      setCurrentInspection(result);

      $q.notify({
        type: 'positive',
        message: '檢驗記錄已儲存',
        position: 'top',
        icon: 'check',
        timeout: 1500
      });
      
      await updatePendingSyncCount();
    }
  } catch (error) {
    console.error('Error saving:', error);
    $q.notify({
      type: 'negative',
      message: '儲存失敗',
      position: 'top'
    });
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  $q.dialog({
    title: '確認取消',
    message: '未儲存的變更將會遺失，確定要取消嗎？',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void router.push('/');
  });
};

const handleRollFinish = () => {
  if (!currentRoll.value || !currentInspection.value) {
    $q.notify({
      type: 'warning',
      message: '請先儲存檢驗記錄',
      position: 'top'
    });
    return;
  }

  $q.dialog({
    title: '確認完成',
    message: '確定要完成這個布捲的檢驗嗎？完成後將無法修改。',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    finishing.value = true;
    try {
      const ok = await finishInspection(currentInspection.value!);
      if (ok) {
        await updateRollStatus(currentRoll.value!.id, 'completed');
        
        $q.notify({
          type: 'positive',
          message: '布捲檢驗已完成',
          position: 'top',
          icon: 'check_circle'
        });

        await updatePendingSyncCount();
        
        setTimeout(() => {
          void router.push('/');
        }, 1000);
      }
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
  if (currentInspection.value?._dirty) {
    $q.dialog({
      title: '未儲存的變更',
      message: '有未儲存的變更，確定要離開嗎？',
      cancel: true,
      persistent: true
    }).onOk(() => {
      void router.push('/');
    });
  } else {
    void router.push('/');
  }
};

const getDiffColor = (diffStr: string) => {
  const diff = parseFloat(diffStr);
  if (Math.abs(diff) <= 2) return 'green-1';
  if (Math.abs(diff) <= 5) return 'yellow-2';
  return 'red-2';
};

const getDefectLevelColor = (level: number) => {
  if (level <= 2) return 'positive';
  if (level <= 3) return 'warning';
  return 'negative';
};

// 生命週期
onMounted(() => {
  void loadRollData();
});
</script>

<style scoped>
  .inspection-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding-bottom: 100px;
  }

  /* 簡潔的 Roll 資訊顯示 */
  .roll-info-compact {
    font-size: 14px;
    line-height: 1.4;
  }

  .info-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 6px;
  }

  .info-item {
    white-space: nowrap;
  }

  .info-item strong {
    color: #1976d2;
    font-weight: 600;
  }

  .info-separator {
    color: #bdbdbd;
    font-weight: 300;
    margin: 0 4px;
  }

  .avg-points strong {
    color: #1976d2;
  }

  .fabric-info {
    color: #666;
    font-size: 13px;
    margin-top: 4px;
  }

  .fabric-info strong {
    color: #1976d2;
    font-weight: 600;
  }

  /* 響應式調整 */
  @media (max-width: 768px) {
    .roll-info-compact {
      font-size: 13px;
    }
    
    .info-row {
      gap: 6px;
    }
    
    .info-separator {
      margin: 0 2px;
    }
    
    .fabric-info {
      font-size: 12px;
    }
  }

.header-section {
  border-bottom: 2px solid #e0e0e0;
}

.section-title {
  display: flex;
  align-items: center;
  color: #1976d2;
}

.spec-check-card,
.quality-check-card,
.defect-record-card,
.keypad-card {
  border-radius: 12px;
  overflow: hidden;
}

/* 設定 specification check 和數字鍵盤相同高度 */
.spec-check-card {
  height: 420px; /* 固定高度，調整為更合適的高度 */
}

.keypad-card {
  height: 420px; /* 調整數字鍵盤高度，為缺陷列表留出空間 */
  display: flex;
  flex-direction: column;
}

.defect-table-card {
  height: 370px; /* 缺陷列表卡片高度 */
  display: flex;
  flex-direction: column;
}

.keypad-card .q-card__section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Specification Check 內容區域樣式 */
.spec-check-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.spec-check-content .section-title {
  flex-shrink: 0; /* 標題不縮放 */
}

.spec-check-content .spec-check-grid {
  flex-shrink: 0; /* 表格不縮放 */
}

.spec-check-content > div:last-child {
  flex: 1; /* 其他規格項目區域可以伸縮 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.spec-group {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.sticky-keypad {
  position: sticky;
  top: 20px;
}

.keypad-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.keypad-row {
  display: flex;
  gap: 10px;
}

.keypad-btn {
  flex: 1;
  min-height: 70px;
  font-size: 22px;
  font-weight: bold;
  border-radius: 8px;
}

.bottom-actions {
  border-top: 2px solid #e0e0e0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.defect-list {
  max-height: 350px; /* 調整為適合新卡片的高度 */
  overflow-y: auto;
}

.defect-table-card .q-card__section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.defect-table-card .section-title {
  flex-shrink: 0; /* 標題不縮放 */
}

.defect-table-card .defect-list {
  flex: 1; /* 表格區域可以伸縮 */
  overflow-y: auto;
}

/* 數字鍵盤輸入欄位樣式 */
.keypad-input.q-field--focused :deep(.q-field__control) {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
  background-color: #e3f2fd;
}

.keypad-input :deep(.q-field__append) {
  cursor: pointer;
}

/* Spec Check 網格樣式 */
.spec-check-grid {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

/* 無框輸入框樣式 */
.spec-input-no-border :deep(.q-field__control) {
  border: none !important;
  box-shadow: none !important;
  background: #f5f5f5 !important;
  border-radius: 4px;
}

.spec-input-no-border :deep(.q-field__control:before) {
  border: none !important;
}

.spec-input-no-border :deep(.q-field__control:after) {
  border: none !important;
}

.spec-input-no-border :deep(.q-field__control:hover) {
  border: none !important;
  box-shadow: none !important;
  background: #eeeeee !important;
}

.spec-input-no-border :deep(.q-field--focused .q-field__control) {
  border: none !important;
  box-shadow: none !important;
  background: #e8f5e8 !important;
}

.spec-input-no-border :deep(.q-field__native) {
  padding: 8px 12px;
  text-align: center;
  font-weight: 500;
  background: transparent;
}

.spec-input-no-border :deep(.q-field__label) {
  display: none;
}

.spec-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
}

.spec-header-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #424242;
  border-right: 1px solid #e0e0e0;
}

.spec-header-item:last-child {
  border-right: none;
}

.spec-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid #f0f0f0;
}

.spec-row:last-child {
  border-bottom: none;
}

.spec-item {
  padding: 16px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.spec-item:last-child {
  border-right: none;
}

.spec-item-label {
  background: #fafafa;
  font-weight: 500;
}

.spec-item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.spec-item-standard,
.spec-item-checked,
.spec-item-diff {
  justify-content: center;
}

.spec-item-standard :deep(.q-field),
.spec-item-checked :deep(.q-field),
.spec-item-diff :deep(.q-field) {
  margin-bottom: 0;
}

.spec-item-standard :deep(.q-field__control),
.spec-item-checked :deep(.q-field__control),
.spec-item-diff :deep(.q-field__control) {
  min-height: 40px;
}


@media (max-width: 768px) {
  .sticky-keypad {
    position: static;
  }
  
  /* 在小螢幕上取消固定高度，讓內容自然流動 */
  .spec-check-card,
  .keypad-card,
  .defect-table-card {
    height: auto !important;
  }
  
  .keypad-card .q-card__section {
    justify-content: flex-start;
  }
  
  .spec-check-content {
    height: auto;
  }
  
  .defect-table-card .q-card__section {
    height: auto;
  }
  
  .bottom-actions {
    padding: 8px !important;
  }
  
  .bottom-actions .row {
    flex-wrap: wrap;
  }
  
  .bottom-actions .q-btn {
    margin: 4px;
  }
  
  .quality-check-grid,
  .defect-record-grid {
    padding: 12px;
  }
}

/* Quality Check 和 Defect Record 左右兩欄佈局 */
.quality-defect-container {
  display: flex;
  gap: 24px;
  width: 100%;
}

.quality-check-section {
  flex: 1;
  min-width: 0; /* 防止 flex 項目溢出 */
}

.defect-record-section {
  flex: 1;
  min-width: 0; /* 防止 flex 項目溢出 */
}

/* 響應式調整 */
@media (max-width: 1200px) {
  .quality-defect-container {
    gap: 16px;
  }
}

@media (max-width: 992px) {
  .quality-defect-container {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .quality-defect-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .quality-check-section,
  .defect-record-section {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 576px) {
  .quality-defect-container {
    gap: 12px;
  }
}

/* Quality Check 項目樣式 */
.quality-check-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px;
}

.quality-check-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.quality-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.quality-label {
  font-size: 0.9rem;
  font-weight: 400;
  color: #212529;
  flex: 1;
}

.quality-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.status-text {
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-text.pass {
  color: #28a745;
}

.status-text.fail {
  color: #dc3545;
}

.status-icon {
  flex-shrink: 0;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .quality-check-item {
    padding: 12px;
    min-height: 50px;
  }
  
  .quality-label {
    font-size: 0.9rem;
  }
  
  .status-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .quality-check-item {
    padding: 10px;
    min-height: 45px;
  }
  
  .quality-label {
    font-size: 0.85rem;
  }
  
  .status-text {
    font-size: 0.75rem;
  }
  
  .quality-status {
    gap: 6px;
  }
}
</style>