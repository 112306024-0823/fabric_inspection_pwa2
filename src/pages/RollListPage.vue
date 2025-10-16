<template>
  <q-page class="roll-list-page">
    <!-- 狀態列 -->
    <div class="status-bar q-pa-sm">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <q-chip 
            :color="isOnline ? 'positive' : 'negative'" 
            text-color="white" 
            icon="wifi"
            size="sm"
          >
            {{ isOnline ? 'Online' : 'Offline' }}
          </q-chip>
          <q-chip 
            v-if="pendingSyncCount > 0"
            color="warning" 
            text-color="white" 
            icon="sync_problem"
            size="sm"
            class="q-ml-sm"
          >
            {{ pendingSyncCount }} 待同步
          </q-chip>
        </div>
        <div class="col-auto">
          <q-btn 
            flat 
            round 
            icon="sync" 
            @click="handleSync"
            :loading="syncing"
            size="sm"
          >
            <q-tooltip>同步資料</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

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
      
      <div class="row q-gutter-md">
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-input
            v-model="currentRoll.bl_no"
            label="BL#"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-input
            v-model="currentRoll.po_no"
            label="PO#"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-input
            v-model="currentRoll.style"
            label="Style"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
          <q-input
            v-model="currentRoll.barcode"
            label="Barcode"
            outlined
            dense
            readonly
          />
        </div>
      </div>

      <div class="row q-gutter-md q-mt-sm">
        <div class="col-md-6 col-sm-12">
          <q-input
            v-model="currentRoll.fabric_description"
            label="Fabric"
            outlined
            dense
            readonly
            type="textarea"
            rows="2"
          />
        </div>
        <div class="col-md-2 col-sm-4 col-xs-6">
          <q-input
            v-model="currentRoll.color"
            label="Color"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-md-2 col-sm-4 col-xs-6">
          <q-input
            v-model="currentRoll.lot"
            label="Lot"
            outlined
            dense
            readonly
          />
        </div>
        <div class="col-md-2 col-sm-4 col-xs-6">
          <q-input
            v-model="currentRoll.roll_number"
            label="Roll#"
            outlined
            dense
            readonly
          />
        </div>
      </div>

      <!-- 長度資訊 -->
      <div class="length-info q-mt-md">
        <div class="text-subtitle2 q-mb-sm">Length Information (YDS)</div>
        <div class="row q-gutter-md">
          <div class="col-md-2 col-sm-4 col-xs-6">
            <q-input
              v-model="currentRoll.total_length"
              label="Total"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-md-2 col-sm-4 col-xs-6">
            <q-input
              v-model="currentRoll.need_inspect_length"
              label="Need Inspect"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-md-2 col-sm-4 col-xs-6">
            <q-input
              v-model="currentRoll.standard_yard"
              label="Pass Condition"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-md-2 col-sm-4 col-xs-6">
            <q-input
              v-model="currentRoll.inspected_length"
              label="Inspected"
              outlined
              dense
              readonly
            />
          </div>
          <div class="col-md-2 col-sm-4 col-xs-6">
            <q-input
              v-model="reachedStatus"
              label="Reached"
              outlined
              dense
              readonly
            />
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="action-buttons q-mt-md">
        <div class="row justify-end q-gutter-sm">
          <q-btn 
            color="primary" 
            @click="handleRollStart"
            :disable="!canStartInspection"
            size="lg"
          >
            Roll Start
          </q-btn>
          <q-btn 
            color="grey" 
            @click="handleReset"
            size="lg"
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
              color="primary" 
              label="List"
              size="sm"
              @click="handleViewDetails(props.row)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-modify="props">
          <q-td :props="props">
            <q-btn 
              flat 
              color="secondary" 
              label="Edit"
              size="sm"
              @click="handleEdit(props.row)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-delete="props">
          <q-td :props="props">
            <q-btn 
              flat 
              color="negative" 
              label="Delete"
              size="sm"
              @click="handleDelete(props.row)"
            />
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
  isOnline, 
  pendingSyncCount, 
  performManualSync,
  setCurrentRoll,
  updatePendingSyncCount
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
  deleteRoll
} = useRolls();

// 響應式資料
const barcodeInput = ref('');
const currentRoll = ref<Roll | null>(null);
const searching = ref(false);
const syncing = ref(false);
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
    label: 'Detail',
    align: 'center',
    field: 'detail'
  },
  {
    name: 'modify',
    label: 'Modify',
    align: 'center',
    field: 'modify'
  },
  {
    name: 'delete',
    label: 'Delete',
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

const handleReset = () => {
  currentRoll.value = null;
  setCurrentRoll(null);
  barcodeInput.value = '';
};

const handleSync = async () => {
  syncing.value = true;
  try {
    const result = await performManualSync();
    $q.notify({
      type: result.success ? 'positive' : 'warning',
      message: result.message,
      position: 'top',
      icon: result.success ? 'cloud_done' : 'cloud_off',
      timeout: 2000
    });
  } catch (error) {
    console.error('Sync error:', error);
    $q.notify({
      type: 'negative',
      message: '同步發生錯誤',
      position: 'top'
    });
  } finally {
    syncing.value = false;
    await updatePendingSyncCount();
  }
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
</style>
