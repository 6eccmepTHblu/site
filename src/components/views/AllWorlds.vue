<script setup lang="ts">
  // === import =================================
  // vue
  import { ref, computed } from 'vue'
  // vue-query
  import { useQuery } from 'vue-query'
  // type
  import type { Word } from '../../types/Word.ts'
  // store
  import { useAllWordsStore } from '../../store/AllWordsStore.ts'
  import { useVocabularyStore } from '../../store/VocabularyState.ts'
  // primevue
  import Drawer from 'primevue/drawer'
  import Button from 'primevue/button'
  import ProgressSpinner from 'primevue/progressspinner'
  import DatePicker from 'primevue/datepicker'
  import FloatLabel from 'primevue/floatlabel'

  // === Store =================================
  const allWordsStore = useAllWordsStore()
  const vocabularyStore = useVocabularyStore()

  // === Drawer =================================
  const visible = defineModel<boolean>('visible')

  // === Logic =================================
  //  Add words in list AllWords
  const { isLoading } = useQuery<Word[], Error>('allWords', allWordsStore.fetchAllWords, {
    onSuccess: (fetchedData: Word[]) => {
      allWordsStore.fillListAllWords(fetchedData)
    },
    enabled: visible,
  })

  // Button add word in list practices
  const addWord = (word: Word) => {
    vocabularyStore.addWord(word)
  }

  // === Filters =================================
  // Date filter
  const dateRange = ref([])

  // Filtering
  const filteredWords = computed(() => {
    if (dateRange.value.length === 0) {
      return allWordsStore.wordsAll
    }

    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59)

    return allWordsStore.wordsAll.filter((word: Word) => {
      const wordDate = new Date(word.created_at)
      return wordDate >= startDate && wordDate <= endDate
    })
  })

  // Add words in list practices
  const selectAllFilteredWords = () => {
    const wordsToSelect = filteredWords.value.filter(
      (word) => !vocabularyStore.checkWordInWordsList(word)
    )
    allWordsStore.selectWords(wordsToSelect)
  }

  // Clear filter
  const clearFilter = () => {
    dateRange.value = []
  }
</script>

<template>
  <Drawer v-model:visible="visible" position="right" :show-close-icon="false">
    <!-- Header -->
    <template #header>
      <div class="flex justify-center items-center w-full">
        <span class="text-2xl text-gray-700">All word</span>
      </div>
    </template>

    <!-- === List item for all words ================================================== -->
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div class="flex mb-2 mt-1 items-center justify-between">
        <FloatLabel variant="on">
          <DatePicker
            v-model="dateRange"
            size="small"
            showIcon
            iconDisplay="input"
            selectionMode="range"
            dateFormat="dd.mm.yy"
            inputId="on_label"
          />
          <label for="on_label">Select a date</label>
        </FloatLabel>
        <Button
          icon="pi pi-filter-slash"
          unstyled
          @click="clearFilter"
          :badge="filteredWords.length.toString()"
        />
      </div>
      <div class="flex w-full">
        <Button
            @click="selectAllFilteredWords"
            label="Select All Filtered Words"
            class="w-full mb-3 p-button-sm p-button-outlined shadow shadow-green-200 shadow-lg"
            size="small"
        />
      </div>
      <TransitionGroup name="allWords" tag="ul">
        <li
          v-for="word in filteredWords"
          :key="word.id"
          class="mb-4 p-3 bg-gray-50 rounded-lg shadow shadow-lg hover:shadow-md transition-shadow duration-200"
        >
          <!-- === Inform for word ================================== -->
          <!-- Line 1 -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-blue-600">{{ word.english }}</h3>
            <span class="text-sm text-gray-500">{{ word.transcription }}</span>
          </div>

          <!-- Line 2 -->
          <div
            v-if="word.transcription && word.transcription.length"
            class="mt-1 items-center justify-between"
          >
            <span class="mt-1 text-sm text-gray-600">
              {{ word.translations.map((translation) => translation.russian).join('; ') }}
            </span>
          </div>

          <!-- Line 1 -->
          <div class="flex items-center justify-between mt-2">
            <div>
              <span
                v-if="word.remember"
                class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
                >Remember</span
              >
            </div>
            <Button
              @click="addWord(word)"
              v-if="!vocabularyStore.checkWordInWordsList(word)"
              unstyled
              icon="pi pi-plus-circle"
              class="text-green-400 hover:text-green-600 hover:scale-120 transform transition-transform"
            />
          </div>
        </li>
      </TransitionGroup>
    </div>
  </Drawer>
</template>

<style scoped></style>
