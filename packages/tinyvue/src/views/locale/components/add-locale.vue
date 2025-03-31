<template>
  <div>
    <tiny-button show-footer type="primary" @click="onOpen">
      {{ $t('locale.add.btn') }}
    </tiny-button>
    <tiny-dialog-box v-model:visible="open" :title="$t('locale.add.title')">
      <tiny-form
        ref="localeForm"
        :model="locale"
        :rules="rules"
        label-position="top"
      >
        <tiny-form-item :label="$t('locale.add.key')" prop="key">
          <tiny-input v-model="locale.key" />
        </tiny-form-item>
        <tiny-form-item :label="$t('locale.add.content')" prop="content">
          <tiny-input v-model="locale.content" />
        </tiny-form-item>
        <tiny-form-item :label="$t('locale.add.lang')" prop="lang">
          <tiny-select v-model="locale.lang">
            <tiny-option
              v-for="item of langes"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </tiny-select>
          <tiny-popover v-model="langPopoverOpen" trigger="manual">
            <div>
              <tiny-form ref="langForm" :model="lang" :rules="langRule">
                <tiny-form-item :label="$t('lang.add.title')" prop="name">
                  <tiny-input v-model="lang.name" />
                </tiny-form-item>
                <tiny-button @click="addLang">
                  {{ $t('lang.add.btn') }}
                </tiny-button>
              </tiny-form>
            </div>
            <template #reference>
              <tiny-button
                v-permission="'lang::add'"
                type="text"
                :text="$t('locale.add.lang.btn')"
                @click="langPopoverOpen = !langPopoverOpen"
              ></tiny-button>
              <tiny-button
                v-permission="'lang::update'"
                type="text"
                :text="$t('lang.manage.btn')"
                @click="setLangTableOpen"
              ></tiny-button>
            </template>
          </tiny-popover>
        </tiny-form-item>
      </tiny-form>
      <tiny-button
        type="text"
        :text="$t('locale.add.btn')"
        @click="addLocale"
      ></tiny-button>
    </tiny-dialog-box>
    <tiny-dialog-box
      v-model:visible="langTableOpen"
      :title="$t('lang.manage.title')"
      width="60%"
    >
      <lang-table />
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
  import { createLang } from '@/api/lang';
  import { CreateLocal, createLocalItem } from '@/api/local';
  import { useDisclosure } from '@/hooks/useDisclosure';
  import { useLocales } from '@/store/modules/locales';
  import {
    Notify,
    Button as TinyButton,
    DialogBox as TinyDialogBox,
    Form as TinyForm,
    FormItem as TinyFormItem,
    Input as TinyInput,
    Select as TinySelect,
    Option as TinyOption,
    Popover as TinyPopover,
  } from '@opentiny/vue';
  import { computed, reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import langTable from './lang-table.vue';

  const emits = defineEmits<{
    langChange: [];
    localChange: [];
  }>();
  const { open, onOpen, onClose } = useDisclosure();
  const { open: langPopoverOpen, onClose: setLangPopoverClose } =
    useDisclosure();
  const { open: langTableOpen, onOpen: setLangTableOpen } = useDisclosure();
  const localeForm = ref();
  const langForm = ref();
  const locales = useLocales();
  const langes = computed(() => locales.lang);
  const locale = reactive<CreateLocal>({
    key: '',
    content: '',
    lang: '' as any,
  });
  const lang = reactive({ name: '' });

  const rules = {
    key: [
      {
        required: true,
        trigger: 'blur',
      },
    ],
    content: [
      {
        required: true,
        trigger: 'blur',
      },
    ],
    lang: [
      {
        required: true,
        trigger: 'blur',
      },
    ],
  };
  const langRule = {
    name: [
      {
        required: true,
        trigger: 'blur',
      },
    ],
  };

  const addLang = () => {
    langForm.value
      .validate()
      .then(() => {
        createLang({ name: lang.name })
          .then(({ data }) => {
            locales.pushLang(data);
            emits('langChange');
          })
          .catch((reason) => {
            Notify({
              type: 'error',
              message: reason.response.data.message,
            });
          })
          .finally(() => {
            lang.name = '';
            setLangPopoverClose();
          });
      })
      .catch(() => {});
  };

  const i18 = useI18n();

  const addLocale = () => {
    localeForm.value
      .validate()
      .then(() => {
        createLocalItem(locale)
          .then(({ data }) => {
            locale.key = '';
            locale.content = '';
            locale.lang = '' as any;
            locales.pushLocale(data);
            i18.mergeLocaleMessage(data.lang.name, {
              [data.key]: data.content,
            });
            emits('localChange');
          })
          .catch((reason) => {
            Notify({
              type: 'error',
              message: reason.response.data.message,
            });
          })
          .finally(() => {
            onClose();
          });
      })
      .catch(() => {});
  };
</script>
