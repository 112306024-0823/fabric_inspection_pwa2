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
      <div class="text-h8 q-mb-md">Barcode測試資料:(F)90000492204 (F)90000492202 (F)90000492203</div>

      
      <div class="row q-gutter-md">
        <div class="col">
          <q-input
            v-model="barcodeInput"
            label="Barcode"
            outlined
            dense
            @keyup.enter="handleBarcodeSearch"
            :loading="searching"
          >
            <template v-slot:append>
              
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
      <div class="text-h6 q-mb-md">Rolls Information</div>
      
      <q-table
        :rows="rollsList"
        :columns="rollColumns"
        row-key="id"
        flat
        bordered
        :loading="isLoading"
        :rows-per-page-options="[10, 20, 50]"
        :pagination="{ rowsPerPage: 20 }"
      >
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
import { ref, computed, onMounted } from 'vue';
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

// 計算屬性
const reachedStatus = computed(() => {
  if (!currentRoll.value) return '';
  return currentRoll.value.inspected_length >= currentRoll.value.need_inspect_length ? 'Y' : 'N';
});

const canStartInspection = computed(() => {
  return currentRoll.value && currentRoll.value.status !== 'completed';
});

// 方法
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
    const success = await performManualSync();
    if (success) {
      $q.notify({
        type: 'positive',
        message: '同步完成',
        position: 'top'
      });
    } else {
      $q.notify({
        type: 'warning',
        message: '同步部分失敗',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    $q.notify({
      type: 'negative',
      message: '同步失敗',
      position: 'top'
    });
  } finally {
    syncing.value = false;
    // 同步後更新徽章數量
    await updatePendingSyncCount();
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

const handleEdit = async (roll: Roll) => {
  const { dialog } = $q;
  dialog({
    title: '編輯布捲',
    message: '修改 Grade 與標準碼數',
    prompt: {
      model: roll.grade || '',
      type: 'text',
      isValid: (val) => !val || ['A','B','C'].includes(val.toUpperCase()),
      label: 'Grade (A/B/C)'
    },
    cancel: true,
    persistent: true
  }).onOk(async (grade: string) => {
    const ok = await editRoll(roll.id, { grade: grade?.toUpperCase() as any });
    if (ok) $q.notify({ type: 'positive', message: '已更新', position: 'top' });
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
  await loadRollsFromLocal();
  checkError();
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
