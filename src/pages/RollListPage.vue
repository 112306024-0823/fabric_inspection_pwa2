<template>
  <q-page class="roll-list-page">

    <!-- 條碼輸入區 -->
    <div class="barcode-section q-pa-md">
      <div class="text-h6 q-mb-md">布捲資訊</div>
      <div class="text-h8 q-mb-md">Barcode測試資料:BC001 - BC003</div>

      
      <div class="row q-gutter-md">
        <div class="col">
          <q-input
            v-model="barcodeInput"
            label="Barcode"
            outlined
            dense
            @keyup.enter="handleBarcodeSearch"
            @update:model-value="handleBarcodeInput"
            :loading="searching"
            clearable
            @clear="handleClearBarcode"
          >
            <template v-slot:append>
              <q-icon name="qr_code_scanner" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn 
            color="primary" 
            @click="handleBarcodeSearch"
            :loading="searching"
            :disable="!barcodeInput.trim()"
          >
            搜尋
          </q-btn>
        </div>
      </div>
    </div>

    <!-- 布捲基本資訊 -->
    <div v-if="currentRoll" class="fabric-info q-pa-md">
      <div class="text-h6 q-mb-md">Fabric Information</div>
      
      <!-- 簡化的資訊卡片 -->
      <div class="fabric-info-grid">
        <div class="info-card">
          <div class="info-label">BL#</div>
          <div class="info-value">{{ currentRoll.bl_no || '-' }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">PO#</div>
          <div class="info-value">{{ currentRoll.po_no || '-' }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Style</div>
          <div class="info-value">{{ currentRoll.style || '-' }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Barcode</div>
          <div class="info-value">{{ currentRoll.barcode || '-' }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Fabric</div>
          <div class="info-value">{{ currentRoll.fabric_description || '-' }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Color</div>
          <div class="info-value">{{ currentRoll.color || '-' }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Lot</div>
          <div class="info-value">{{ currentRoll.lot || '-' }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Roll#</div>
          <div class="info-value">{{ currentRoll.roll_number || '-' }}</div>
        </div>
      </div>

      <!-- 長度資訊 -->
      <div class="length-info-section q-mt-md">
        <div class="text-h6 q-mb-md">Length Information (YDS)</div>
        <div class="length-info-grid">     

          <div class="info-card">
            <div class="info-label">Total</div>
            <div class="info-value">{{ currentRoll.total_length || '0' }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Need Inspect</div>
            <div class="info-value">{{ currentRoll.need_inspect_length || '0' }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Pass Condition</div>
            <div class="info-value">{{ currentRoll.standard_yard || '0' }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Inspected</div>
            <div class="info-value">{{ currentRoll.inspected_length || '0' }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Reached</div>
            <div class="info-value">{{ reachedStatus }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="action-buttons q-mt-md">
        <div class="button-group">
          <q-btn 
            color="primary" 
            @click="handleRollStart"
            :disable="!canStartInspection"
            size="lg"
            class="action-btn"
          >
            Roll Start
          </q-btn>
          <q-btn 
            color="grey" 
            @click="handleReset"
            size="lg"
            class="action-btn"
          >
            Reset
          </q-btn>
        </div>
      </div>
    </div>

    <!-- 布捲列表 -->
    <div class="rolls-info q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Rolls Information</div>
        <div class="text-caption text-grey-7">
          <span v-if="barcodeInput.trim()">
            顯示 {{ filteredRollsList.length }} 筆 / 共 {{ rollsList.length }} 筆
          </span>
          <span v-else>
            共 {{ rollsList.length }} 筆
          </span>
        </div>
      </div>
      
      <q-table
        :rows="filteredRollsList"
        :columns="rollColumns"
        row-key="id"
        flat
        bordered
        :loading="isLoading"
        :rows-per-page-options="[10, 20, 50]"
        :pagination="{ rowsPerPage: 20 }"
        class="shadow-1"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center text-grey-7 q-gutter-sm q-pa-lg">
            <q-icon size="2em" name="inventory_2" />
            <span>尚無布捲資料，請搜尋條碼或按 Sync 同步</span>
          </div>
        </template>
        
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip 
              :color="getStatusColor(props.value)" 
              text-color="white"
              size="sm"
            >
              {{ getStatusLabel(props.value) }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-grade="props">
          <q-td :props="props">
            <q-chip 
              :color="getGradeColor(props.value)" 
              text-color="white"
              size="sm"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-detail="props">
          <q-td :props="props">
            <q-btn 
              flat 
              round
              color="primary" 
              icon="visibility"
              size="sm"
              @click="handleViewDetails(props.row)"
            >
              <q-tooltip>檢驗記錄</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-modify="props">
          <q-td :props="props">
            <q-btn 
              flat 
              round
              color="secondary" 
              icon="edit"
              size="sm"
              @click="handleEdit(props.row)"
            >
              <q-tooltip>編輯</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-delete="props">
          <q-td :props="props">
            <q-btn 
              flat 
              round
              color="negative" 
              icon="delete"
              size="sm"
              @click="handleDelete(props.row)"
            >
              <q-tooltip>刪除</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- 缺陷列表 -->
    <div class="defect-list q-pa-md">
      <div class="text-h6 q-mb-md">Roll Defect List</div>
      <div class="defect-placeholder">
        <q-card flat bordered class="q-pa-lg text-center text-grey-6">
          <div class="text-subtitle1">選擇布捲查看缺陷列表</div>
        </q-card>
      </div>
    </div>

    <!-- 錯誤提示 -->
    <q-dialog v-model="showError" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">錯誤</div>
        </q-card-section>
        <q-card-section>
          {{ errorMessage }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="確定" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAppState } from '../composables/useAppState';
import { useRolls } from '../composables/useRolls';
import type { Roll } from '../types';

const router = useRouter();
const $q = useQuasar();

// Composables
const { 
  setCurrentRoll
} = useAppState();

const {
  rollsList,
  isLoading,
  hasError,
  errorMessage,
  clearError,
  loadRollsFromLocal,
  loadRollsFromServer,
  searchRollByBarcode,
  editRoll,
  deleteRoll,
  updateRollStatus
} = useRolls();

// 響應式資料
const barcodeInput = ref('');
const currentRoll = ref<Roll | null>(null);
const searching = ref(false);
const showError = ref(false);

// 表格欄位定義
const rollColumns = [
  {
    name: 'bl_no',
    required: true,
    label: 'BL_NO',
    align: 'left',
    field: 'bl_no',
    sortable: true
  },
  {
    name: 'roll_number',
    required: true,
    label: 'Roll#',
    align: 'left',
    field: 'roll_number',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center',
    field: 'status',
    sortable: true
  },
  {
    name: 'standard_yard',
    label: 'STANDARD YARD',
    align: 'right',
    field: 'standard_yard',
    sortable: true,
    format: (val: number) => val.toFixed(2)
  },
  {
    name: 'grade',
    label: 'Grade',
    align: 'center',
    field: 'grade',
    sortable: true
  },
  {
    name: 'avg_points',
    label: 'AVG Points',
    align: 'right',
    field: 'avg_points',
    sortable: true,
    format: (val: number) => val ? val.toFixed(2) : '-'
  },
  {
    name: 'detail',
    label: '查看',
    align: 'center',
    field: 'detail'
  },
  {
    name: 'modify',
    label: '編輯',
    align: 'center',
    field: 'modify'
  },
  {
    name: 'delete',
    label: '刪除',
    align: 'center',
    field: 'delete'
  }
];

// 計算屬性 - 根據 barcode 篩選
const filteredRollsList = computed(() => {
  if (!barcodeInput.value.trim()) {
    return rollsList.value;
  }
  return rollsList.value.filter(roll => 
    roll.barcode?.toLowerCase().includes(barcodeInput.value.trim().toLowerCase())
  );
});

const reachedStatus = computed(() => {
  if (!currentRoll.value) return '';
  return currentRoll.value.inspected_length >= currentRoll.value.need_inspect_length ? 'Y' : 'N';
});

const canStartInspection = computed(() => {
  return currentRoll.value && currentRoll.value.status !== 'completed';
});

// 方法
// Barcode 長度（可調整）
const BARCODE_LENGTH = 15; // (F)90000492201 = 15個字元

// 自動搜尋處理
const handleBarcodeInput = (val: string) => {
  if (val && val.length >= BARCODE_LENGTH) {
    void handleBarcodeSearch();
  }
};

// 清除 barcode 時重置
const handleClearBarcode = () => {
  currentRoll.value = null;
  setCurrentRoll(null);
  barcodeInput.value = '';
};


const handleBarcodeSearch = async () => {
  if (!barcodeInput.value.trim()) return;
  
  
  searching.value = true;
  try {
    const roll = await searchRollByBarcode(barcodeInput.value.trim());
    if (roll) {
      currentRoll.value = roll;
      setCurrentRoll(roll);
    } else {
      $q.notify({
        type: 'warning',
        message: '找不到指定的布捲',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    $q.notify({
      type: 'negative',
      message: '搜尋失敗',
      position: 'top'
    });
  } finally {
    searching.value = false;
  }
};



const handleRollStart = () => {
  if (!currentRoll.value) return;
  
  void router.push(`/inspect/${currentRoll.value.id}`);
};

const handleReset = async () => {
  if (currentRoll.value) {
    // 將當前布捲狀態重置為 pending
    await updateRollStatus(currentRoll.value.id, 'pending');
  }
  
  // 清除當前選中的布捲
  currentRoll.value = null;
  setCurrentRoll(null);
  barcodeInput.value = '';
};


// Status 相關顏色與圖示
const getStatusColor = (status: string) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'pending': return 'grey-6';
    case 'inspecting': return 'orange-7';
    case 'completed': return 'positive';
    default: return 'grey';
  }
};

const getStatusIcon = (status: string) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'pending': return 'schedule';
    case 'inspecting': return 'analytics';
    case 'completed': return 'check_circle';
    default: return 'help_outline';
  }
};

const getStatusLabel = (status: string) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'pending': return 'Pending';
    case 'inspecting': return 'Inspecting';
    case 'completed': return 'Completed';
    default: return status || '-';
  }
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return 'positive';
    case 'B': return 'warning';
    case 'C': return 'negative';
    default: return 'grey';
  }
};

const handleViewDetails = (roll: Roll) => {
  // 與搜尋相同：帶入該 roll 作為目前顯示的 Fabric Information
  currentRoll.value = roll;
  setCurrentRoll(roll);
  barcodeInput.value = roll.barcode;
  // 捲到上方資訊區域
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 編輯表單
const editFormData = ref({
  grade: '',
  standard_yard: 0,
  standard_kg: 0,
  supplier: '',
  po_no: '',
  style: '',
  color: ''
});

const handleEdit = async (roll: Roll) => {
  // 初始化表單資料
  editFormData.value = {
    grade: roll.grade || '',
    standard_yard: roll.standard_yard || 0,
    standard_kg: roll.standard_kg || 0,
    supplier: roll.supplier || '',
    po_no: roll.po_no || '',
    style: roll.style || '',
    color: roll.color || ''
  };

  $q.dialog({
    component: defineAsyncComponent(() => import('../components/RollEditDialog.vue')),
    componentProps: {
      roll: roll,
      formData: editFormData.value
    }
  }).onOk(async (updatedData: any) => {
    const ok = await editRoll(roll.id, updatedData);
    if (ok) {
      $q.notify({ 
        type: 'positive', 
        message: '布捲資料已更新', 
        position: 'top',
        timeout: 1500
      });
      await loadRollsFromLocal(); // 重新載入
    }
  });
};

const handleDelete = (roll: Roll) => {
  $q.dialog({
    title: '確認刪除',
    message: `確定要刪除布捲 ${roll.barcode} 嗎？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const ok = await deleteRoll(roll.id);
    if (ok) $q.notify({ type: 'positive', message: '已刪除', position: 'top' });
  });
};

// 監聽錯誤狀態
const checkError = () => {
  if (hasError.value) {
    showError.value = true;
    clearError();
  }
};

// 生命週期
onMounted(async () => {
  // 先載入本地資料（快）
  await loadRollsFromLocal();
  checkError();
  
  // 背景載入伺服器資料（若線上）
  if (isOnline.value) {
    try {
      await loadRollsFromServer();
    } catch (e) {
      console.warn('Failed to load from server on mount:', e);
    }
  }
});
</script>

<style scoped>
.roll-list-page {
  background-color: #f5f5f5;
}

.status-bar {
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.barcode-section,
.fabric-info,
.rolls-info,
.defect-list {
  background-color: white;
  margin: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.length-info {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.action-buttons {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.defect-placeholder {
  min-height: 200px;
}

.q-table {
  border-radius: 4px;
}

/* 簡化的 Fabric Information 樣式 */
.fabric-info-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.length-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.info-card {
  background: transparent;
  border: none;
  padding: 8px 0;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: fit-content;
  flex-shrink: 0;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.action-btn {
  min-width: 120px;
}

/* 響應式調整 */
@media (max-width: 1200px) {
  .fabric-info-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .fabric-info-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  
  .length-info-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }
  
  .info-card {
    padding: 6px 0;
    gap: 6px;
  }
  
  .info-label {
    font-size: 0.75rem;
  }
  
  .info-value {
    font-size: 0.85rem;
  }
  
  .button-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .fabric-info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .length-info-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .info-card {
    padding: 4px 0;
    gap: 4px;
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }
  
  .info-label {
    font-size: 0.7rem;
    margin-bottom: 2px;
  }
  
  .info-value {
    font-size: 0.8rem;
  }
}
</style>
