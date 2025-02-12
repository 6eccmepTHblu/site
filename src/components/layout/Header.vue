<script setup lang="ts">
  import { ref } from 'vue'

  // Import Vue modules
  import AllWorlds from '../views/AllWorlds.vue'

  // Hamburger button menu
  const isMenuOpen = ref(false)

  // Open all words drawer
  const isAllWordsOpen = ref(false)

  // Menu items
  const menuItems: {
    name: string
    link: string
  }[] = [{ name: 'Vocabulary', link: '#' }]
</script>

<template>
  <header>
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <a href="#" class="flex items-center">
          <img src="/Logo.svg" class="mr-3 h-6 sm:h-9" alt="Logo" />
          <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
            >Little teacher</span
          >
        </a>
        <div class="flex items-center lg:order-2">
          <a
            href="#"
            @click="isAllWordsOpen = true"
            class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
            >All words</a
          >
          <button
            @click="isMenuOpen = !isMenuOpen"
            data-collapse-toggle="mobile-menu-2"
            type="button"
            class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="mobile-menu-2"
            aria-expanded="false"
          >
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          :class="{ hidden: !isMenuOpen, block: isMenuOpen }"
          class="justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
          id="mobile-menu-2"
        >
          <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li v-for="item in menuItems" :key="item.name">
              <a
                :href="item.link"
                class="block py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white"
                aria-current="page"
                >{{ item.name }}</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
  <AllWorlds v-model:visible="isAllWordsOpen" />
</template>

<style scoped></style>
