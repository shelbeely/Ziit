<template>
  <NuxtLayout name="navbar">
    <main>
      <div class="container">
        <div class="numbers">
          <div class="item">
            <p>total hours</p>
            <h2>{{ stats?.totalHours }}</h2>
          </div>
          <div class="item">
            <p>total heartbeats</p>
            <h2>{{ stats?.totalHeartbeats }}</h2>
          </div>
          <div class="item">
            <p>total users</p>
            <h2>{{ stats?.totalUsers }}</h2>
          </div>
        </div>
        <div class="top">
          <div class="item">
            <p>top editor</p>
            <h2>{{ stats?.topEditor }}</h2>
          </div>
          <div class="item">
            <p>top language</p>
            <h2>{{ stats?.topLanguage }}</h2>
          </div>
          <div class="item">
            <p>top os</p>
            <h2>{{ stats?.topOS }}</h2>
          </div>
        </div>
      </div>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { data: stats } = await useFetch("/api/public/stats", {
  lazy: true,
});

useKeybind({
  keys: ["alt_l"],
  run() {
    try {
      window.location.href = "/api/auth/logout";
    } catch (e: any) {
      useToast().error(e.data?.message || "Logout failed");
    }
  },
  config: { prevent: true, ignoreIfEditable: true },
});

useSeoMeta({
  title: "Ziit - Instance Statistics",
  description: "View instance statistics on Ziit.",
  ogTitle: "Ziit - Instance Statistics",
  ogDescription: "View instance statistics on Ziit.",
  ogImage: "/logo.webp",
  ogSiteName: "Ziit",
  twitterTitle: "Ziit - Instance Statistics",
  twitterDescription: "View instance statistics on Ziit.",
  twitterImage: "/logo.webp",
  twitterCard: "summary",
  twitterCreator: "@pandadev_",
  twitterSite: "@pandadev_",
  author: "PandaDEV",
});

useHead({
  htmlAttrs: { lang: "en" },
  link: [
    {
      rel: "icon",
      type: "image/ico",
      href: "/favicon.ico",
    },
  ],
});
</script>

<style scoped lang="scss">
@use "~~/styles/stats.scss";
</style>
