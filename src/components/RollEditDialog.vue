<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="edit-dialog-card">
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="text-h6">編輯布捲資料</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
      </q-card-section>

      <q-card-section class="dialog-content">
        <div class="form-container">
          <!-- 第一行：Grade 和 Supplier -->
          <div class="form-row">
            <div class="form-field">
              <q-input
                v-model="form.grade"
                label="Grade"
                outlined
                dense
                :rules="[val => !val || ['A','B','C',''].includes(val.toUpperCase()) || 'Grade must be A, B, or C']"
              >
                <template v-slot:hint>
                  可選: A / B / C
                </template>
              </q-input>
            </div>
            <div class="form-field">
              <q-input
                v-model="form.supplier"
                label="Supplier"
                outlined
                dense
              />
            </div>
          </div>

          <!-- 第二行：Standard Yard 和 Standard KG -->
          <div class="form-row">
            <div class="form-field">
              <q-input
                v-model.number="form.standard_yard"
                label="Standard Yard"
                outlined
                dense
                type="number"
                step="0.01"
              />
            </div>
            <div class="form-field">
              <q-input
                v-model.number="form.standard_kg"
                label="Standard KG"
                outlined
                dense
                type="number"
                step="0.01"
              />
            </div>
          </div>

          <!-- 第三行：PO# 和 Style -->
          <div class="form-row">
            <div class="form-field">
              <q-input
                v-model="form.po_no"
                label="PO#"
                outlined
                dense
              />
            </div>
            <div class="form-field">
              <q-input
                v-model="form.style"
                label="Style"
                outlined
                dense
              />
            </div>
          </div>

          <!-- 第四行：Color (全寬) -->
          <div class="form-row">
            <div class="form-field full-width">
              <q-input
                v-model="form.color"
                label="Color"
                outlined
                dense
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn flat label="取消" color="grey" @click="onDialogCancel" />
        <q-btn unelevated label="儲存" color="primary" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import type { Roll } from '../types';

interface Props {
  roll: Roll;
  formData: {
    grade: string;
    standard_yard: number;
    standard_kg: number;
    supplier: string;
    po_no: string;
    style: string;
    color: string;
  };
}

const props = defineProps<Props>();

defineEmits([
  ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

// 表單資料
const form = ref({
  grade: props.formData.grade,
  standard_yard: props.formData.standard_yard,
  standard_kg: props.formData.standard_kg, // 0.01
  supplier: props.formData.supplier,
  po_no: props.formData.po_no,
  style: props.formData.style,
  color: props.formData.color
});

const onOKClick = () => {
  // 返回更新的資料
  onDialogOK({
    grade: form.value.grade?.toUpperCase() || '',
    standard_yard: form.value.standard_yard,
    standard_kg: form.value.standard_kg,
    supplier: form.value.supplier,
    po_no: form.value.po_no,
    style: form.value.style,
    color: form.value.color
  });
};
</script>

<style scoped>
.edit-dialog-card {
  min-width: 600px;
  max-width: 700px;
  width: 90vw;
}

.dialog-header {
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.dialog-content {
  padding: 24px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.form-field {
  flex: 1;
  min-width: 0;
}

.form-field.full-width {
  flex: none;
  width: 100%;
}

.dialog-actions {
  padding: 16px 24px 20px 24px;
  border-top: 1px solid #e0e0e0;
  gap: 12px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .edit-dialog-card {
    min-width: 90vw;
    max-width: 95vw;
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .form-container {
    gap: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-field {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .edit-dialog-card {
    min-width: 95vw;
    max-width: 98vw;
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions {
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .form-container {
    gap: 12px;
  }
}
</style>

