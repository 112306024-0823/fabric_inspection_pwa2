<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">編輯布捲資料</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-6">
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
            <div class="col-6">
              <q-input
                v-model="form.supplier"
                label="Supplier"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model.number="form.standard_yard"
                label="Standard Yard"
                outlined
                dense
                type="number"
                step="0.01"
              />
            </div>
            <div class="col-6">
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

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.po_no"
                label="PO#"
                outlined
                dense
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.style"
                label="Style"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
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

      <q-card-actions align="right">
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
  standard_kg: props.formData.standard_kg,
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

