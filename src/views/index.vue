<template>
  <div class="tw-relative tw-h-[100vh]">
    <div class="home-container">
      <h1 class="home-title">{{ $t("home.yours-ai-helper") }}</h1>
      <home-search :can-create="canCreate"></home-search>
    </div>
    <div class="footer-tooltip" v-if="showFooterTips">
      <div class="left">
        <svg-icon
          name="icon-home-tips"
          size="18px"
          margin="0 8px 0 0"
        ></svg-icon>
        <div>{{ $t("home.footer-tips") }}</div>
      </div>
      <svg-icon
        name="icon-close"
        pointer
        size="12px"
        @click="showFooterTips = false"
      ></svg-icon>
    </div>
  </div>
</template>

<script lang="ts" setup layout="default">
import HomeSearch from "@/components/pages/home/HomeSearch.vue";
import { useHomeStore } from "@/stores/modules/home";
import { RouterClass } from "@/actions/common/router-class";
// const code = ref(`option = {
//   xAxis: {
//     type: 'category',
//     data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
//   },
//   yAxis: {
//     type: 'value'
//   },
//   series: [
//     {
//       data: [150, 230, 224, 218, 135, 147, 260],
//       type: 'line'
//     }
//   ]
// }`)

const home = useHomeStore();

const canCreate = ref(true);

const _defineMeta = { title: "ddd" };

const router = new RouterClass();
const showFooterTips = ref(true);
const hasProjectAndGo = async (id: string) => {
  const { type, close } = await $showPageMessageBox();
  if (type === "cancel") {
    canCreate.value = true;
    close();
  } else if (type === "sure") {
    close();
    router.push(`/question?id=${id}`);
  }
};
const getExitProject = async () => {
  const res = await home.getUserEditProject();
  if (res?.taskId) {
    canCreate.value = false;
    hasProjectAndGo(res?.taskId);
  }
};

// getExitProject()
// const { type, close } = await $showPageMessageBox()
// if (type === 'cancel') {
//   close()
// }
</script>

<style lang="scss" scoped>
.home-container {
  @apply tw-w-[var(--home-width)] dd-flex-center tw-h-full tw-mx-auto;
  .home-title {
    @apply tw-text-[56px] tw-leading-[74px] tw-mb-[27px];
  }
}
.footer-tooltip {
  // width: calc(100vw - 40px);
  @apply tw-left-[20px] tw-right-[20px] tw-px-[20px]  tw-absolute tw-bottom-[16px] tw-h-[52px] tw-rounded-[8px] tw-bg-themecolor/[0.12] tw-flex tw-justify-between tw-items-center;
  .left {
    @apply tw-flex tw-items-center tw-text-auxcolor;
  }
}
</style>
