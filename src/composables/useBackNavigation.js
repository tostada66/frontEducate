import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

export function useBackNavigation(defaultFallback = "/") {
  const router = useRouter();
  const route = useRoute();
  const previousRoute = ref(null);

  onMounted(() => {
    previousRoute.value = router.options.history.state.back;
  });

  function goBack() {
    if (previousRoute.value) {
      router.back();
    } else {
      router.push(defaultFallback);
    }
  }

  return { goBack };
}
