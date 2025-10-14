<template>
  <q-page class="inspection-page">
    <!-- 標題列 -->
    <div class="header-section q-pa-md bg-white">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h5 q-mb-sm text-weight-medium">檢驗作業</div>
          <div class="row q-gutter-md text-body2 text-grey-8">
            <div><strong>Style:</strong> {{ currentRoll?.style }}</div>
            <div><strong>Color:</strong> {{ currentRoll?.color }}</div>
            <div><strong>BL#:</strong> {{ currentRoll?.bl_no }}</div>
            <div><strong>Lot:</strong> {{ currentRoll?.lot }}</div>
            <div><strong>Roll#:</strong> {{ currentRoll?.roll_number }}</div>
            <div><strong>Avg Point:</strong> {{ currentRoll?.avg_points?.toFixed(2) || '0.00' }}</div>
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            <strong>Fabric:</strong> {{ currentRoll?.fabric_description }} | <strong>Supplier:</strong> {{ currentRoll?.supplier }}
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
          <q-card-section>
            <div class="section-title q-mb-md">
              <q-icon name="straighten" size="sm" class="q-mr-sm" />
              <span class="text-h6">Spec Check</span>
            </div>
            
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-checkbox v-model="shortageCheck" label="Shortage Check" color="primary" />
              </div>
            </div>

            <!-- 重量檢查 -->
            <div class="spec-group q-mt-md">
              <div class="text-subtitle2 text-grey-8 q-mb-sm">Weight (KGS)</div>
              <div class="row q-col-gutter-md">
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.standard_weight"
                    label="Standard"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('standard_weight', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('standard_weight', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.checked_weight"
                    label="Checked"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('checked_weight', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('checked_weight', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    :model-value="weightDiff"
                    label="Diff %"
                    outlined
                    dense
                    readonly
                    :bg-color="getDiffColor(weightDiff)"
                  />
                </div>
              </div>
            </div>

            <!-- 長度檢查 -->
            <div class="spec-group q-mt-md">
              <div class="text-subtitle2 text-grey-8 q-mb-sm">Length (YARDS)</div>
              <div class="row q-col-gutter-md">
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.standard_length"
                    label="Standard"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('standard_length', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('standard_length', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.checked_length"
                    label="Checked"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('checked_length', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('checked_length', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-4 col-sm-6 col-xs-12">
                  <q-input
                    :model-value="lengthDiff"
                    label="Diff %"
                    outlined
                    dense
                    readonly
                    :bg-color="getDiffColor(lengthDiff)"
                  />
                </div>
              </div>
            </div>

            <!-- 寬度與其他 -->
            <div class="spec-group q-mt-md">
              <div class="text-subtitle2 text-grey-8 q-mb-sm">Width & Others</div>
              <div class="row q-col-gutter-md">
                <div class="col-md-3 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.ticket_full_width"
                    label="Ticket Full Width"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('ticket_full_width', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('ticket_full_width', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-3 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.actual_full_width"
                    label="Actual Full Width"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('actual_full_width', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('actual_full_width', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-3 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.ticket_cut_width"
                    label="Ticket Cut Width"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('ticket_cut_width', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('ticket_cut_width', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-3 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.moisture"
                    label="Moisture %"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('moisture', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('moisture', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-md-6 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.skew_width"
                    label="Skew Width"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('skew_width', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('skew_width', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-6 col-sm-6 col-xs-12">
                  <q-input
                    v-model.number="specForm.skew_height"
                    label="Skew Height"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    @focus="handleFieldFocus('skew_height', 'spec')"
                    class="keypad-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        name="dialpad" 
                        color="primary" 
                        size="xs"
                        class="cursor-pointer"
                        @click="handleFieldFocus('skew_height', 'spec')"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Quality Check 區塊 -->
        <q-card class="quality-check-card q-mb-md shadow-2">
          <q-card-section>
            <div class="section-title q-mb-md">
              <q-icon name="verified" size="sm" class="q-mr-sm" />
              <span class="text-h6">Quality Check</span>
            </div>
            
            <div class="row q-col-gutter-md">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.appearance"
                  :options="passFailOptions"
                  label="Appearance"
                  outlined
                  dense
                  emit-value
                  map-options
                  :color="qualityForm.appearance === 'pass' ? 'positive' : 'negative'"
                >
                  <template v-slot:prepend>
                    <q-icon :name="qualityForm.appearance === 'pass' ? 'check_circle' : 'cancel'" 
                            :color="qualityForm.appearance === 'pass' ? 'positive' : 'negative'" />
                  </template>
                </q-select>
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.hand_feel"
                  :options="passFailOptions"
                  label="Hand-Feel"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="qualityForm.hand_feel === 'pass' ? 'check_circle' : 'cancel'" 
                            :color="qualityForm.hand_feel === 'pass' ? 'positive' : 'negative'" />
                  </template>
                </q-select>
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.slant_issue"
                  :options="passFailOptions"
                  label="Slant Issue"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="qualityForm.slant_issue === 'pass' ? 'check_circle' : 'cancel'" 
                            :color="qualityForm.slant_issue === 'pass' ? 'positive' : 'negative'" />
                  </template>
                </q-select>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.color_shade"
                  :options="passFailOptions"
                  label="Color Shade"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="qualityForm.color_shade === 'pass' ? 'check_circle' : 'cancel'" 
                            :color="qualityForm.color_shade === 'pass' ? 'positive' : 'negative'" />
                  </template>
                </q-select>
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.specification_issue"
                  :options="passFailOptions"
                  label="Specification"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="qualityForm.specification_issue === 'pass' ? 'check_circle' : 'cancel'" 
                            :color="qualityForm.specification_issue === 'pass' ? 'positive' : 'negative'" />
                  </template>
                </q-select>
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.approved_sample"
                  :options="yesNoOptions"
                  label="Approved Sample"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="qualityForm.approved_sample === 'yes' ? 'check_circle' : 'cancel'" 
                            :color="qualityForm.approved_sample === 'yes' ? 'positive' : 'negative'" />
                  </template>
                </q-select>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.sticker"
                  :options="passFailOptions"
                  label="Sticker"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="qualityForm.sticker === 'pass' ? 'check_circle' : 'cancel'" 
                            :color="qualityForm.sticker === 'pass' ? 'positive' : 'negative'" />
                  </template>
                </q-select>
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="qualityForm.packing"
                  :options="passFailOptions"
                  label="Packing"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="qualityForm.packing === 'pass' ? 'check_circle' : 'cancel'" 
                            :color="qualityForm.packing === 'pass' ? 'positive' : 'negative'" />
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Defect Record 區塊 -->
        <q-card class="defect-record-card shadow-2">
          <q-card-section>
            <div class="section-title q-mb-md">
              <q-icon name="bug_report" size="sm" class="q-mr-sm" />
              <span class="text-h6">Defect Record</span>
              <q-chip v-if="defectsList.length > 0" color="negative" text-color="white" size="sm" class="q-ml-sm">
                {{ defectsList.length }} 筆缺陷
              </q-chip>
            </div>
            
            <div class="row q-col-gutter-md">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="selectedCategory"
                  :options="categoryOptions"
                  label="Issue Category"
                  outlined
                  dense
                  @update:model-value="onCategoryChange"
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model="defectForm.defect_code_id"
                  :options="filteredDefectCodes"
                  label="Defect Code"
                  outlined
                  dense
                  option-value="id"
                  :option-label="opt => opt.description_zh || opt.description_en || opt.code"
                  emit-value
                  map-options
                  :disable="!selectedCategory"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.description_zh || scope.opt.description_en }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.code }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
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

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-input
                  ref="positionInput"
                  v-model.number="defectForm.position_yard"
                  label="Position (Yard)"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                  @focus="handleFieldFocus('position_yard', 'defect')"
                  class="keypad-input"
                >
                  <template v-slot:append>
                    <q-icon 
                      name="dialpad" 
                      color="primary" 
                      size="xs"
                      class="cursor-pointer"
                      @click="handleFieldFocus('position_yard', 'defect')"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select
                  v-model.number="defectForm.level"
                  :options="[1, 2, 3, 4, 5]"
                  label="Severity Level"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-btn 
                  color="primary" 
                  label="ADD"
                  icon="add"
                  @click="handleAddDefect"
                  :disable="!canAddDefect"
                  class="full-width"
                  style="height: 40px"
                />
              </div>
            </div>

            <!-- 缺陷列表 -->
            <div v-if="defectsList.length > 0" class="defect-list q-mt-md">
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

      <!-- 右側數字鍵盤 -->
      <div class="col-md-4 col-sm-12">
        <q-card class="keypad-card shadow-2 sticky-keypad">
          <q-card-section>
            <div class="section-title q-mb-md">
              <q-icon name="dialpad" size="sm" class="q-mr-sm" />
              <span class="text-h6">數字鍵盤</span>
            </div>
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
            <div class="text-caption text-grey-7 q-mt-sm text-center">
              <div v-if="focusedField" class="text-primary text-weight-medium">
                當前輸入: {{ getFieldLabel(focusedField) }}
              </div>
              <div v-else class="text-grey-6">
                請點擊數字欄位開始輸入
              </div>
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
        <div class="col-auto">
          <q-select
            v-model="selectedLanguage"
            :options="languageOptions"
            outlined
            dense
            style="min-width: 100px"
          >
            <template v-slot:prepend>
              <q-icon name="language" />
            </template>
          </q-select>
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
const languageOptions = [
  { label: 'English', value: 'EN' },

];
const selectedLanguage = ref({ label: '柬埔寨語', value: 'CAB' });

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
  return Object.keys(defectCodesByCategory.value).map(cat => ({ label: cat, value: cat }));
});

const filteredDefectCodes = computed(() => {
  if (!selectedCategory.value) return [];
  return defectCodesByCategory.value[selectedCategory.value] || [];
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

// 表格欄位定義
const defectColumns = [
  {
    name: 'code',
    required: true,
    label: 'Defect Code',
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
  max-height: 400px;
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

@media (max-width: 768px) {
  .sticky-keypad {
    position: static;
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
}
</style>