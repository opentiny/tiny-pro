<template>
  <div class="login-form-container">
    <tiny-form
      ref="loginFormMail"
      :model="loginMail"
      class="login-form"
      :rules="rules"
      validate-type="text"
      label-width="0"
      size="medium"
    >
      <tiny-form-item prop="mailname" size="medium">
        <tiny-input
          v-model="loginMail.mailname"
          :placeholder="$t('login.form.mailName.placeholder')"
        >
        </tiny-input>
      </tiny-form-item>

      <tiny-form-item prop="mailpassword" size="medium">
        <tiny-input
          v-model="loginMail.mailpassword"
          type="password"
          show-password
          :placeholder="$t('login.form.mailpassword.placeholder')"
        >
        </tiny-input>
      </tiny-form-item>

      <div class="login-form-options">
        <tiny-checkbox>{{ $t('login.form.rememberPassword') }}</tiny-checkbox>
        <div>
          <tiny-link type="primary">
            {{ $t('login.form.forgetPassword') }}
          </tiny-link>
          <tiny-link type="primary" class="divide-line">|</tiny-link>
          <tiny-link type="primary" @click="typeChange">
            {{ $t('login.form.registration') }}
          </tiny-link>
        </div>
      </div>

      <tiny-form-item size="medium">
        <tiny-button
          type="primary"
          class="login-form-btn"
          :loading="loading"
          @click="handleSubmit"
          >{{ $t('login.form.login') }}</tiny-button
        >
      </tiny-form-item>
    </tiny-form>
  </div>
</template>

<script lang="ts" setup>
  import { inject, ref, reactive, computed } from 'vue';
  import {
    RouteParamsRaw,
    RouteRecordRaw,
    useRoute,
    useRouter,
  } from 'vue-router';
  import {
    Form as TinyForm,
    FormItem as TinyFormItem,
    Input as TinyInput,
    Button as TinyButton,
    Checkbox as TinyCheckbox,
    Link as TinyLink,
    Modal,
    Notify,
  } from '@opentiny/vue';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import { useMenuStore } from '@/store/modules/router';
  import { useLocales } from '@/store/modules/locales';
  import { toRoutes } from '@/router/guard/menu';
  import { AxiosError } from 'axios';

  const router = useRouter();
  const { t, mergeLocaleMessage } = useI18n();
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();
  const menuStore = useMenuStore();
  const localeStore = useLocales();
  const loginFormMail = ref();

  const rules = computed(() => {
    return {
      mailname: [
        {
          required: true,
          message: t('login.form.mailName.errMsg'),
          trigger: 'change',
        },
      ],
      mailpassword: [
        {
          required: true,
          message: t('login.form.mailpassword.errMsg'),
          trigger: 'change',
        },
      ],
    };
  });

  const loginMail = reactive({
    mailname: 'admin@no-reply.com',
    mailpassword: 'admin',
    rememberPassword: true,
  });

  // 切换模式
  const handle: any = inject('handle');
  const typeChange = () => {
    handle(true);
  };

  function handleSubmit() {
    loginFormMail.value?.validate(async (valid: boolean) => {
      if (!valid) {
        return;
      }

      setLoading(true);

      try {
        await userStore.login({
          email: loginMail.mailname,
          password: loginMail.mailpassword,
        });
        Modal.message({
          message: t('login.form.login.success'),
          status: 'success',
        });

        await localeStore.fetchLocalTable();
        const entries = Object.entries(localeStore.localTable);
        for (let i = 0; i < entries.length; i += 1) {
          const key = entries[i][0];
          const messages = entries[i][1];
          mergeLocaleMessage(key, messages);
        }
        localeStore.$patch({
          shouldMerge: false,
        });

        await menuStore.getMenuList();
        const routes = toRoutes(menuStore.menuList);

        routes.forEach((route) => {
          if (!router.hasRoute(route.name)) {
            router.addRoute('root', route);
          }
        });

        const route = router.currentRoute;
        const { redirect = 'Home' } = route.value.query;
        const blackList = ['login', 'notFound', 'redirect', 'preview', 'root'];
        let redirectTo = blackList.includes(redirect.toString())
          ? 'Home'
          : redirect.toString();
        if (!router.hasRoute(redirectTo)) {
          const [routerItem] = router.getRoutes().filter((routeItem) => {
            return (
              routeItem.name &&
              !blackList.includes(routeItem.name.toString()) &&
              routeItem.children.length === 0
            );
          });
          if (!routerItem) {
            Notify({
              type: 'error',
              message: t('router.not-exists-valid-route'),
              duration: 2000,
            });
            return;
          }
          redirectTo = routerItem.name.toString();
        }

        router.replace({ name: redirectTo });
      } catch (err) {
        let title = t('login.tip.right');
        let message = t('login.tip.mail');
        if (err instanceof AxiosError) {
          if (err.status === 500) {
            message = t('http.error.InternalError');
            title = undefined;
          }
        }
        Notify({
          type: 'error',
          title,
          message,
          position: 'top-right',
          duration: 2000,
          customClass: 'my-custom-cls',
        });
      } finally {
        setLoading(false);
      }
    });
  }
</script>

<style lang="less" scoped>
  .login-form-container {
    margin-top: 5%;
  }

  .login-form {
    margin-left: 6%;

    .tiny-form-item {
      margin-bottom: 20px;
    }

    &-container {
      width: 320px;
    }

    &-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 12px;
    }

    &-btn {
      display: block;
      width: 100%;
      max-width: 100%;
    }
  }

  .divide-line {
    margin: 0 5px;
  }
  // responsive
  @media (max-width: @screen-ms) {
    .login-form {
      margin-left: 5%;

      &-container {
        width: 240px;
      }
    }
  }
</style>
