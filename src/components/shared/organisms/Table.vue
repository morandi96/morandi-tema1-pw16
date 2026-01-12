<script setup lang="ts">
import { TABLE_ROWS_PER_PAGE } from '@/constants/table';
import type { QTableProps } from 'quasar';
import { computed, onMounted, ref, watchEffect } from 'vue';

const props = withDefaults(
  defineProps<{
    headers?: QTableProps['columns'];
    slotNames?: string[];
    dense?: boolean;
    serverPagination?: boolean;
    currentPage?: number;
    data?: any[];
  }>(),
  {
    currentPage: 1,
    data: () => []
  }
);
defineEmits(['change-page']);

const rows = ref(props.data || []);

const rowNumber = ref<number>(0);

const tableRef = ref();
const filter = ref('');
const loading = ref(false);
const page = ref(1);

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: page.value,
  rowsPerPage: TABLE_ROWS_PER_PAGE
});

const isLastPage = computed(() => rowNumber.value < TABLE_ROWS_PER_PAGE);

watchEffect(() => {
  if (tableRef?.value?.computedRows?.length) rowNumber.value = tableRef.value.computedRows.length;
  if (props.currentPage) page.value = props.currentPage;
  if (props.data) rows.value = props.data;
});

onMounted(() => {
  tableRef.value.requestServerInteraction();
  page.value = props.currentPage;
});
</script>

<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <q-table
    ref="tableRef"
    v-model:pagination="pagination"
    :dense="dense"
    :rows="rows"
    :columns="headers"
    :loading="loading"
    :filter="filter"
    :rows-per-page-options="[0]"
    table-header-class="bg-gray-100"
  >
    <template #loading>
      <q-inner-loading showing color="primary" />
    </template>
    <template #body-cell="props">
      <q-td :props="props" class="custom-td">
        {{ props.value }}
      </q-td>
    </template>
    <template v-for="slotName of slotNames" #[`body-cell-${slotName}`]="item">
      <slot :key="slotName" :name="slotName" :row-item="item" />
    </template>
    <template #body-cell-action="item">
      <q-td class="text-left">
        <slot name="action" :row-item="item.row" />
      </q-td>
    </template>
    <template v-if="serverPagination" #pagination="scope">
      <span>
        {{
          `${1 + TABLE_ROWS_PER_PAGE * (page - 1)}-${TABLE_ROWS_PER_PAGE * (page - 1) + rowNumber}`
        }}
      </span>
      <q-btn
        icon="chevron_left"
        color="grey-8"
        round
        dense
        flat
        :disable="page == 1"
        @click="
          scope.prevPage();
          page--;
          $emit('change-page', page);
        "
      />

      <q-btn
        icon="chevron_right"
        color="grey-8"
        round
        dense
        flat
        :disable="isLastPage"
        @click="
          scope.nextPage();
          page++;
          $emit('change-page', page);
        "
      />
    </template>
    <template #no-data>
      <div class="full-width row flex-center text-accent q-gutter-sm">
        <q-icon size="2em" name="sentiment_dissatisfied" />
        <div
          class="cursor-pointer"
          @click="
            page--;
            $emit('change-page', page);
          "
        >
          {{ page > 1 ? $t('layout.back_to_previous') : $t('layout.no_data') }}
        </div>
      </div>
    </template>
  </q-table>
</template>

<style lang="sass">
.sticky-header
  height: 80vh
  tr th
    position: sticky
    z-index: 2
    background: #e1f5fe
  thead tr:last-child th
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    z-index: 3
  td:first-child
    z-index: 1
  td:first-child, th:first-child
    position: sticky
    left: 0
.custom-td
    padding: 6px 10px!important
    white-space: normal!important
</style>
