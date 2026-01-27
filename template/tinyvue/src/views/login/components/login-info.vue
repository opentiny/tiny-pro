<script lang="ts" setup>
import {
  Modal,
  Notify,
  Button as TinyButton,
  Checkbox as TinyCheckbox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Link as TinyLink,
} from '@opentiny/vue'
import { computed, inject, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useLoading from '@/hooks/loading'
import { useUserStore } from '@/store'
import { setToken } from '@/utils/auth'

const router = useRouter()
const { t } = useI18n()
const { loading, setLoading } = useLoading()
const userStore = useUserStore()
const loginFormInfo = ref()

const rules = computed(() => {
  return {
    username: [
      {
        required: true,
        message: t('login.form.userName.errMsg'),
        trigger: 'change',
      },
    ],
    password: [
      {
        required: true,
        message: t('login.form.password.errMsg'),
        trigger: 'change',
      },
    ],
  }
})

const loginInfo = reactive({
  username: 'admin',
  password: 'admin',
  rememberPassword: true,
})

// 切换模式
const handle: any = inject('handle')
function typeChange() {
  handle(true)
}

function handleSubmit() {
  loginFormInfo.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    if (!import.meta.env.VITE_USE_MOCK) {
      window.localStorage.setItem('userRole', 'admin')
      setToken('12345')

      const { redirect, ...othersQuery } = router.currentRoute.value.query
      router.push({
        name: (redirect as string) || 'Home',
        query: {
          ...othersQuery,
        },
      })
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      await userStore.login({
        email: loginInfo.username,
        password: loginInfo.password,
      })
      Modal.message({
        message: t('login.form.login.success'),
        status: 'success',
      })

      const { redirect, ...othersQuery } = router.currentRoute.value.query ?? { redirect: 'Home' }
      router.replace({ name: redirect?.toString() ?? 'Home' })
      router.push({
        name: (redirect as string) || 'Home',
        query: {
          ...othersQuery,
        },
      })
    }
    catch {
      Notify({
        type: 'error',
        title: t('login.tip.right'),
        message: t('login.tip.info'),
        position: 'top-right',
        duration: 2000,
        customClass: 'my-custom-cls',
      })
    }
    finally {
      setLoading(false)
    }
  })
}
</script>

<template>
  <div class="login-form-container">
    <TinyForm
      ref="loginFormInfo"
      :model="loginInfo"
      class="login-form"
      :rules="rules"
      validate-type="text"
      label-width="0"
      size="medium"
    >
      <TinyFormItem prop="username" size="medium">
        <TinyInput
          v-model="loginInfo.username"
          :placeholder="$t('login.form.userName.placeholder')"
        />
      </TinyFormItem>

      <TinyFormItem prop="password" size="medium">
        <TinyInput
          v-model="loginInfo.password"
          type="password"
          show-password
          :placeholder="$t('login.form.password.placeholder')"
        />
      </TinyFormItem>

      <div class="login-form-options">
        <TinyCheckbox>{{ $t('login.form.rememberPassword') }}</TinyCheckbox>
        <div>
          <TinyLink type="primary">
            {{ $t('login.form.forgetPassword') }}
          </TinyLink>
          <TinyLink type="primary" class="divide-line">
            |
          </TinyLink>
          <TinyLink type="primary" @click="typeChange">
            {{ $t('login.form.registration') }}
          </TinyLink>
        </div>
      </div>

      <TinyFormItem size="medium">
        <TinyButton
          type="primary"
          class="login-form-btn"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ $t('login.form.login') }}
        </TinyButton>
      </TinyFormItem>
    </TinyForm>
  </div>
</template>

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
