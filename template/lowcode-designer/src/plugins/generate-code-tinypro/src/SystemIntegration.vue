<template>
  <tiny-dialog-box
    class="system-integration-dialog"
    :visible="visible"
    :close-on-click-modal="false"
    :append-to-body="true"
    width="1200"
    title="集成到后台系统"
    @close="$emit('cancel')"
  >
    <div class="integration-container">
      <!-- 页面信息显示 -->
      <div class="page-info-section">
        <div class="page-info-card">
          <div class="page-info-header">
            <h3 class="page-info-title">📄 当前页面</h3>
            <div class="page-info-badge">
              {{ currentPageInfo.type || "Page" }}
            </div>
          </div>
          <div class="page-info-content">
            <div class="page-info-item">
              <span class="info-label">名称:</span>
              <span class="info-value">{{
                currentPageInfo.name || "未知页面"
              }}</span>
            </div>
            <div class="page-info-item">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ currentPageInfo.id || "N/A" }}</span>
            </div>
            <div class="page-info-item" v-if="tokenManager.tokenInfo">
              <span class="info-label">认证:</span>
              <span
                class="info-value token-status"
                :class="tokenManager.tokenInfo.source"
              >
                {{ getTokenStatusText() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="main-content">
        <!-- 左侧：集成配置 -->
        <div class="integration-form">
          <div class="form-section">
            <h3 class="section-title">⚙️ 菜单配置</h3>
            <div class="form-grid">
              <div class="form-item">
                <label>名称 <span class="required">*</span></label>
                <tiny-input
                  v-model="formData.menuConfig.name"
                  placeholder="请输入菜单名称"
                />
              </div>
              <div class="form-item">
                <label>路由ID <span class="required">*</span></label>
                <tiny-input
                  v-model="formData.menuConfig.routeId"
                  placeholder="请输入路由ID"
                />
              </div>
              <div class="form-item">
                <label>菜单图标</label>
                <tiny-select
                  v-model="formData.menuConfig.icon"
                  :options="iconDatas"
                  filterable
                  placeholder="选择图标"
                ></tiny-select>
              </div>
              <div class="form-item">
                <label>父级菜单ID</label>
                <tiny-input
                  v-model="formData.menuConfig.parentId"
                  placeholder="请输入父级菜单ID"
                />
              </div>
              <div class="form-item">
                <label>优先级</label>
                <tiny-numeric
                  v-model="formData.menuConfig.order"
                  placeholder="请输入排序顺序"
                />
              </div>
              <div class="form-item">
                <label>访问路径 <span class="required">*</span></label>
                <tiny-input
                  v-model="formData.menuConfig.path"
                  placeholder="请输入访问路径"
                />
              </div>
              <div class="form-item">
                <label>组件路径 <span class="required">*</span></label>
                <tiny-input
                  v-model="formData.menuConfig.componentPath"
                  placeholder="组件在项目中的路径"
                />
              </div>
              <div class="form-item">
                <label>国际化Key</label>
                <tiny-input
                  v-model="formData.menuConfig.locale"
                  placeholder="请输入国际化Key"
                />
              </div>
              <div class="form-item full-width">
                <label>语言</label>
                <tiny-select
                  v-model="formData.menuConfig.lang"
                  :options="langOptions"
                  placeholder="请选择语言"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：文件预览 -->
        <div class="file-preview">
          <div class="file-preview-header">
            <h3 class="section-title">📁 生成的文件</h3>
            <div class="file-stats" v-if="generatedFiles.length > 0">
              共 {{ generatedFiles.length }} 个文件
            </div>
          </div>

          <div v-if="generatedFiles.length === 0" class="empty-state">
            <div class="empty-icon">🚀</div>
            <p class="empty-text">配置完成后点击"生成预览"查看文件</p>
            <p class="empty-hint">支持生成TinyPro兼容的Vue组件</p>
          </div>

          <div v-else class="file-list">
            <tiny-grid
              :data="fileTableData"
              ref="gridRef"
              size="mini"
              :max-height="350"
              :tree-config="{ children: 'children' }"
              :expand-config="{ expandAll: true }"
              :auto-resize="true"
              stripe
              border
            >
              <tiny-grid-column width="40" tree-node></tiny-grid-column>
              <tiny-grid-column type="selection" width="50"></tiny-grid-column>
              <tiny-grid-column
                field="fileType"
                title="类型"
                width="70"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="filePath"
                title="文件路径"
                min-width="180"
                show-overflow="tooltip"
              ></tiny-grid-column>
            </tiny-grid>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <tiny-button
            @click="generatePreview"
            :loading="generating.value"
            :disabled="!currentPageInfo.name || generating.value"
            icon="IconRefresh"
            size="medium"
          >
            {{ generating.value ? "生成中..." : "生成预览" }}
          </tiny-button>
          <div class="footer-tips" v-if="!currentPageInfo.name">
            <span class="tip-text">请先选择或创建页面</span>
          </div>
        </div>
        <div class="footer-right">
          <tiny-button
            type="primary"
            @click="confirm"
            :loading="integrating.value"
            :disabled="
              generatedFiles.length === 0 || !isFormValid || integrating.value
            "
            icon="IconCheck"
            size="medium"
          >
            {{ integrating.value ? "集成中..." : "完成集成" }}
          </tiny-button>
          <tiny-button
            @click="$emit('cancel')"
            icon="IconClose"
            size="medium"
            :disabled="integrating.value || generating.value"
          >
            取消
          </tiny-button>
        </div>
      </div>
    </template>
  </tiny-dialog-box>
</template>

<script setup lang="ts">
/* metaService: engine.toolbars.generate-code.SystemIntegration */
import {
  reactive,
  computed,
  watch,
  ref,
  nextTick,
  withDefaults,
  defineProps,
  defineEmits,
  h,
} from "vue";
import {
  DialogBox,
  Button,
  Input,
  Numeric,
  Grid,
  GridColumn,
  Select,
} from "@opentiny/vue";
import {
  useBlock,
  useCanvas,
  useNotify,
  getMetaApi,
  META_APP,
  getMergeMeta,
  META_SERVICE,
} from "@opentiny/tiny-engine-meta-register";
import { fetchMetaData, fetchPageList, fetchBlockSchema } from "./http";
import { icons } from "@opentiny/icons/json/icons.json";

// 组件注册
const TinyDialogBox = DialogBox;
const TinyButton = Button;
const TinyInput = Input;
const TinyNumeric = Numeric;
const TinyGrid = Grid;
const TinyGridColumn = GridColumn;
const TinySelect = Select;

// Props 定义
interface Props {
  visible?: boolean;
  pageInfo?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  pageInfo: () => ({}),
});

// Emits 定义
const emit = defineEmits<{
  confirm: [result: any];
  cancel: [];
}>();

const { getCurrentPage, getSchema: _getSchema } = useCanvas();
const gridRef = ref();

// 获取原始HTTP服务并临时修改拦截器
const httpService = getMetaApi(META_SERVICE.Http);
const rawHttp = httpService.getHttp();

// 调试：查看原始HTTP服务的配置
console.log("🔍 原始HTTP服务配置:", {
  baseURL: rawHttp.defaults.baseURL,
  timeout: rawHttp.defaults.timeout,
  headers: rawHttp.defaults.headers,
});

// 创建一个新的axios实例，使用相同配置但不同的拦截器
const customHttp = rawHttp.create(rawHttp.defaults);

// 添加请求拦截器，记录请求URL
customHttp.interceptors.request.use(
  (config: any) => {
    console.log("🌐 发送请求:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
      headers: config.headers,
    });
    return config;
  },
  (error: any) => Promise.reject(error)
);

// 添加自定义响应拦截器，返回完整响应
customHttp.interceptors.response.use(
  (response: any) => {
    console.log("✅ 响应成功:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response; // 返回完整响应，不只是 data.data
  },
  (error: any) => {
    console.error("❌ 请求失败:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// 表单数据
const formData = reactive({
  menuConfig: {
    icon: "add-domain",
    parentId: 1,
    order: 1,
    locale: "ospp.demo",
    path: "ospp",
    name: "ospp",
    componentPath: "board/ospp/index",
    lang: "2",
    routeId: "ospp",
  },
  deployment: {
    componentPath: "/src/views",
    routePath: "",
    enableTinyProTransform: true, // 默认启用TinyPro转换
  },
});

// 状态管理
const integrating = reactive({ value: false });
const generating = reactive({ value: false });
const generatedFiles = reactive<any[]>([]);

// 当前页面信息
const currentPageInfo = computed(() => {
  const { getCurrentPage } = useCanvas();
  const { getCurrentBlock } = useBlock();
  const { isBlock } = useCanvas();

  if (isBlock()) {
    const block = getCurrentBlock();
    return {
      name: block?.label || "未知区块",
      id: String(block?.id || ""),
      type: "Block",
    };
  } else {
    const page = getCurrentPage();
    return {
      name: page?.name || "未知页面",
      id: String(page?.id || ""),
      type: "Page",
    };
  }
});

// 文件表格数据
const fileTableData = computed(() => {
  return generatedFiles.map((file) => {
    const content =
      typeof file.fileContent === "string"
        ? file.fileContent
        : String(file.fileContent || "");
    return {
      ...file,
      fileContent:
        content.substring(0, 100) + (content.length > 100 ? "..." : ""),
    };
  });
});

// Token配置
const tokenConfig = {
  // API Token接口配置
  apiToken: {
    endpoint: "/api/auth",
    credentials: {
      email: "admin@no-reply.com",
      password: "admin",
      tokenName: "lowcode-designer-integration",
    },
  },

  // token缓存配置
  cache: {
    enabled: true,
    maxAge: 30 * 60 * 1000, // 30分钟
    storageKey: "lowcode_designer_token",
  },

  // 调试模式
  debug: process.env.NODE_ENV === "development",
};

// Token管理
const tokenManager = {
  currentToken: null,
  tokenPromise: null,
  tokenInfo: null, // 存储token元信息

  // 从多种来源获取token
  async getToken() {
    if (this.currentToken && this.isTokenValid(this.currentToken)) {
      return this.currentToken;
    }

    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.fetchTokenFromSources();
    const token = await this.tokenPromise;
    this.tokenPromise = null;
    this.currentToken = token;

    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG5vLXJlcGx5LmNvbSIsImlhdCI6MTc1ODUzNDQ1MiwiZXhwIjoxNzU4NTQxNjUyfQ.3et0I2bdjB5udV16-aBT90ehXrDZFFxI5v22r_TVt74";
  },

  // 从多种来源尝试获取token - 优先使用API方式
  async fetchTokenFromSources() {
    const sources = [
      // 1. 优先使用专门的API Token接口（最可靠）
      () => this.getTokenFromApi(),
    ];

    for (const [index, source] of sources.entries()) {
      try {
        console.log(`🔄 尝试方式${index + 1}: ${source.name || "未知方式"}`);
        const token = await source();
        if (token && this.isTokenValid(token)) {
          console.log(
            `✅ Token获取成功 (方式${index + 1}):`,
            token.substring(0, 20) + "..."
          );
          return token;
        }
      } catch (error) {
        console.warn(`❌ 方式${index + 1}失败:`, error.message);
      }
    }

    throw new Error("所有token获取方式都失败了，请检查网络连接和认证配置");
  },

  // 通过专门的API Token接口获取
  async getTokenFromApi() {
    try {
      if (tokenConfig.debug) {
        console.log("🔑 开始获取API Token:", {
          endpoint: tokenConfig.apiToken.endpoint,
          tokenName: tokenConfig.apiToken.credentials.tokenName,
        });
      }

      // 使用与其他API调用相同的方式，通过customHttp调用token接口
      const response = await customHttp.post(
        "/auth/api-token",
        tokenConfig.apiToken.credentials
      );

      if (response.data && response.data.token) {
        const tokenData = {
          token: response.data.token,
          tokenId: response.data.tokenId,
          expiresIn: response.data.expiresIn,
          obtainedAt: Date.now(),
        };

        if (tokenConfig.debug) {
          console.log("✅ API Token获取成功:", {
            tokenId: tokenData.tokenId,
            expiresIn: tokenData.expiresIn,
            tokenPreview: tokenData.token.substring(0, 20) + "...",
          });
        }

        // 缓存token信息
        this.tokenInfo = {
          source: "api",
          ...tokenData,
          obtainedAt: new Date().toISOString(),
        };

        // 如果启用缓存，保存到localStorage
        if (tokenConfig.cache.enabled) {
          try {
            localStorage.setItem(
              tokenConfig.cache.storageKey,
              JSON.stringify(tokenData)
            );
            if (tokenConfig.debug) {
              console.log("💾 Token已缓存到localStorage");
            }
          } catch (cacheError) {
            console.warn("缓存token失败:", cacheError.message);
          }
        }

        return tokenData.token;
      }
      throw new Error("API返回的token格式不正确");
    } catch (error) {
      console.error("❌ API Token获取失败:", error);

      // 提供更详细的错误信息
      let errorMessage = "API获取token失败";
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = "认证失败，请检查用户名和密码";
        } else if (status === 403) {
          errorMessage = "权限不足，无法获取API Token";
        } else if (status === 404) {
          errorMessage = "API Token接口不存在，请检查接口地址";
        } else {
          errorMessage = data?.message || `服务器错误 (${status})`;
        }
      } else if (error.request) {
        errorMessage = "网络连接失败，请检查服务器是否可访问";
      }

      throw new Error(errorMessage);
    }
  },

  // 验证token是否有效
  isTokenValid(token) {
    if (!token || typeof token !== "string") return false;

    try {
      // 解析JWT token
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;

      // 检查是否过期
      if (payload.exp && payload.exp < now) {
        console.warn("Token已过期");
        return false;
      }

      return true;
    } catch (error) {
      // 如果不是JWT格式，简单验证长度
      return token.length > 10;
    }
  },

  // 验证可信任的域名
  isTrustedOrigin(origin) {
    const trustedDomains = [
      "http://localhost",
      "https://localhost",
      "http://127.0.0.1",
      "https://127.0.0.1",
      // 添加你的可信任域名
    ];

    return trustedDomains.some((domain) => origin.startsWith(domain));
  },

  // 清除token
  clearToken() {
    this.currentToken = null;
    this.tokenPromise = null;
    this.tokenInfo = null;

    // 清除缓存
    if (tokenConfig.cache.enabled) {
      try {
        localStorage.removeItem(tokenConfig.cache.storageKey);
      } catch (error) {
        console.warn("清除token缓存失败:", error.message);
      }
    }
  },
};

// 获取token状态文本
const getTokenStatusText = () => {
  if (!tokenManager.tokenInfo) return "未认证";

  const info = tokenManager.tokenInfo;
  const sourceMap = {
    api: "🔑 API获取",
    cache: "📦 缓存",
    localStorage: "💾 本地存储",
    sessionStorage: "🗂️ 会话存储",
    cookie: "🍪 Cookie",
    postMessage: "📨 消息通信",
  };

  return sourceMap[info.source] || "✅ 已认证";
};

// 获取认证头
const getAuthHeaders = async () => {
  try {
    const token = await tokenManager.getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  } catch (error) {
    utils.showNotification(
      "error",
      "认证失败",
      `无法获取认证token: ${error.message}`
    );
    throw error;
  }
};

// 图标选项数据
const iconDatas = Object.keys(icons).map((key) => ({
  label: key,
  value: key,
  icon: h("i", { class: `ci-${key}` }),
}));

// 语言选项配置
const langOptions = [
  {
    label: "英语",
    value: "1",
  },
  {
    label: "中文",
    value: "2",
  },
];

// 工具函数
const utils = {
  // 规范化文件路径
  normalizePath(path: string): string {
    let filePath = path;
    if (filePath.startsWith("./")) {
      filePath = filePath.slice(2);
    }
    if (filePath.startsWith(".")) {
      filePath = filePath.slice(1);
    }
    if (filePath.startsWith("/")) {
      filePath = filePath.slice(1);
    }
    return filePath;
  },

  // 生成页面名称的各种格式
  // formatPageName(name: string) {
  //   const cleanName = name.replace(/\s+/g, "-").toLowerCase();
  //   return {
  //     original: name,
  //     kebabCase: cleanName,
  //     path: `/${cleanName}`,
  //     componentPath: `board/${cleanName}/index`,
  //     locale: `board.${cleanName}`,
  //   };
  // },

  // 检查文件是否为Vue文件
  isVueFile(file: any): boolean {
    return file.fileName && file.fileName.endsWith(".vue");
  },

  // 检查文件是否在views目录
  isInViewsFolder(file: any): boolean {
    return (
      file.filePath &&
      (file.filePath.includes("src/views/") ||
        file.filePath.includes("views/") ||
        file.path?.includes("views"))
    );
  },

  // 显示通知
  showNotification(
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) {
    useNotify({ type, title, message });
  },

  // 调试网络请求
  async debugNetworkRequest(url: string, method: string = "GET") {
    console.log(`🔍 调试网络请求: ${method} ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`✅ 直接fetch结果:`, {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      return response;
    } catch (error) {
      console.error(`❌ 直接fetch失败:`, error);
      throw error;
    }
  },
};

// TinyPro代码转换函数
const transformForTinyPro = (vueCode: string): string => {
  if (!vueCode || typeof vueCode !== "string") {
    return vueCode;
  }

  let transformedCode = vueCode;

  // 1. 添加 TypeScript 支持
  transformedCode = transformedCode.replace(
    /<script setup>/,
    '<script setup lang="ts">'
  );

  // 2. 清理和替换导入语句
  transformedCode = transformedCode.replace(
    /import \* as vue from 'vue'\s*\n/g,
    ""
  );
  transformedCode = transformedCode.replace(
    /import { defineProps, defineEmits } from 'vue'\s*\n/g,
    ""
  );
  transformedCode = transformedCode.replace(
    /import { I18nInjectionKey } from 'vue-i18n'/g,
    "import { useI18n } from 'vue-i18n'"
  );

  // 3. 检查需要的导入并添加
  const needsReactive =
    transformedCode.includes("reactive(") ||
    transformedCode.includes("vue.reactive(");
  const needsRef =
    transformedCode.includes("ref(") || transformedCode.includes("vue.ref(");
  const needsComputed =
    transformedCode.includes("computed(") ||
    transformedCode.includes("vue.computed(");
  const needsWatch =
    transformedCode.includes("watch(") ||
    transformedCode.includes("vue.watch(");
  const needsNextTick =
    transformedCode.includes("nextTick(") ||
    transformedCode.includes("vue.nextTick(");

  const imports = [];
  if (needsReactive) imports.push("reactive");
  if (needsRef) imports.push("ref");
  if (needsComputed) imports.push("computed");
  if (needsWatch) imports.push("watch");
  if (needsNextTick) imports.push("nextTick");

  if (imports.length > 0) {
    transformedCode = transformedCode.replace(
      /(<script setup lang="ts">)/,
      `$1\nimport { ${imports.join(", ")} } from 'vue'`
    );
  }

  // 4. 移除低代码运行时代码
  transformedCode = transformedCode.replace(
    /const { t, lowcodeWrap, stores } = vue\.inject\(I18nInjectionKey\)\.lowcode\(\)\s*\n/g,
    "const { t } = useI18n()\n"
  );
  transformedCode = transformedCode.replace(
    /const wrap = lowcodeWrap\(props, { emit }\)\s*\n/g,
    ""
  );
  transformedCode = transformedCode.replace(/wrap\({ stores }\)\s*\n/g, "");
  transformedCode = transformedCode.replace(/wrap\({ state }\)\s*\n/g, "");

  // 5. 标准化 Vue API 调用
  transformedCode = transformedCode.replace(/vue\.reactive\(/g, "reactive(");
  transformedCode = transformedCode.replace(/vue\.ref\(/g, "ref(");
  transformedCode = transformedCode.replace(/vue\.computed\(/g, "computed(");
  transformedCode = transformedCode.replace(/vue\.watch\(/g, "watch(");
  transformedCode = transformedCode.replace(/vue\.nextTick\(/g, "nextTick(");

  // 6. 移除空的 props/emits 定义
  transformedCode = transformedCode.replace(
    /const props = defineProps\(\{\}\)\s*\n/g,
    ""
  );
  transformedCode = transformedCode.replace(
    /const emit = defineEmits\(\[\]\)\s*\n/g,
    ""
  );

  // 7. 清理多余的空行
  transformedCode = transformedCode.replace(/\n\s*\n\s*\n/g, "\n\n");

  return transformedCode;
};

// 生成文件预览 - 使用完整的代码生成逻辑
const generatePreview = async () => {
  generating.value = true;
  try {
    // 使用完整的代码生成逻辑，从Main.vue移植过来
    const { isBlock, getCurrentPage } = useCanvas();
    const { getCurrentBlock } = useBlock();

    const getParams = () => {
      const { getSchema } = useCanvas();
      const currentSchema = getSchema();
      const params = {
        framework: getMergeMeta("engine.config")?.dslMode,
        platform: getMergeMeta("engine.config")?.platformId,
        pageInfo: {
          schema: currentSchema,
        },
        app: null as string | null,
        tenant: null as string | null,
        id: "",
        type: "",
      };
      const paramsMap = new URLSearchParams(location.search);
      params.app = paramsMap.get("id");
      params.tenant = paramsMap.get("tenant");

      if (isBlock()) {
        const block = getCurrentBlock();
        params.id = String(block?.id || "");
        (params.pageInfo as any).name = block?.label;
        params.type = "Block";
      } else {
        const page = getCurrentPage();
        params.id = String(page?.id || "");
        (params.pageInfo as any).name = page?.name;
        params.type = "Page";
      }

      return params;
    };

    const { getAllNestedBlocksSchema, generateAppCode } = getMetaApi(
      "engine.service.generateCode"
    );

    const getAllPageDetails = async (pageList: Array<{ id: string }>) => {
      const detailPromise = pageList.map(({ id }: { id: string }) =>
        getMetaApi(META_APP.AppManage).getPageById(id)
      );
      const detailList = await Promise.allSettled(detailPromise);

      return detailList
        .map((item) => {
          if (item.status === "fulfilled" && item.value) {
            return item.value;
          }
        })
        .filter((item) => Boolean(item));
    };

    const params = getParams();
    const { id } = getMetaApi(META_SERVICE.GlobalService).getBaseInfo();

    const [appData, metaData, pageList] = await Promise.all([
      getMetaApi(META_SERVICE.Http).get(`/app-center/v1/api/apps/schema/${id}`),
      fetchMetaData(params),
      fetchPageList(params.app || ""),
    ]);

    const pageDetailList = await getAllPageDetails(pageList);

    // 这里需要手动传入 blockSet 的原因是多页面可能会存在重复的区块
    const blockSet = new Set();
    const list = pageDetailList.map((page) =>
      getAllNestedBlocksSchema(page.page_content, fetchBlockSchema, blockSet)
    );
    const blocks = await Promise.allSettled(list);

    const blockSchema: any[] = [];
    blocks.forEach((item) => {
      if (item.status === "fulfilled" && Array.isArray(item.value)) {
        blockSchema.push(...item.value);
      }
    });

    // 处理 i18n 对象中可能为 null 的情况
    if (metaData.i18n) {
      Object.keys(metaData.i18n).forEach((langKey) => {
        metaData.i18n[langKey] = metaData.i18n[langKey] || {};
      });
    } else {
      metaData.i18n = {};
    }

    const appSchema = {
      // metaData 包含dataSource、utils、i18n、globalState
      ...metaData,
      // 页面 schema
      pageSchema: pageDetailList.map((item) => {
        const { page_content, ...meta } = item;

        return {
          ...page_content,
          meta: {
            ...meta,
            router: meta.route,
          },
        };
      }),
      blockSchema,
      // 物料数据
      componentsMap: [...(appData.componentsMap || [])],
      // 物料依赖
      packages: [...(appData.packages || [])],
      meta: {
        ...(appData.meta || {}),
      },
    };

    const res = await generateAppCode(appSchema);
    const { genResult = [] } = res || {};

    // 转换文件格式
    const fileRes = genResult.map(
      ({
        fileContent,
        fileName,
        path,
        fileType,
      }: {
        fileContent: string;
        fileName: string;
        path: string;
        fileType: string;
      }) => {
        const slash = path.endsWith("/") || path === "." ? "" : "/";
        const normalizedPath = utils.normalizePath(`${path}${slash}`);

        return {
          fileContent,
          fileName,
          filePath: `${normalizedPath}${fileName}`,
          fileType,
          path,
        };
      }
    );

    // 过滤文件，只保留src/views目录下的Vue文件
    const filteredFiles = fileRes.filter((file: any) => {
      return utils.isVueFile(file) && utils.isInViewsFolder(file);
    });

    // 转换代码以适配TinyPro项目（如果启用了转换开关）
    const transformedFiles = filteredFiles.map((file: any) => ({
      ...file,
      fileContent: formData.deployment.enableTinyProTransform
        ? transformForTinyPro(file.fileContent)
        : file.fileContent,
    }));

    // 更新生成的文件列表
    generatedFiles.splice(0, generatedFiles.length, ...transformedFiles);

    utils.showNotification(
      "success",
      "生成成功",
      `已生成 ${generatedFiles.length} 个Vue页面文件`
    );

    // 自动展开和全选
    nextTick(() => {
      if (gridRef.value) {
        gridRef.value.setAllTreeExpansion(true);
        gridRef.value.setAllSelection(true);
      }
    });
  } catch (error: any) {
    utils.showNotification(
      "error",
      "生成失败",
      error?.message || "代码生成过程中出现错误"
    );
  } finally {
    generating.value = false;
  }
};

// 直接调用后台API进行集成 - 自定义拦截器
const callBackendAPI = async () => {
  try {
    // 1. 创建国际化词条
    const i18nConfig = {
      content: formData.menuConfig.name,
      key: formData.menuConfig.locale,
      lang: formData.menuConfig.lang,
    };

    // 调试：先测试一下/api/i18接口是否可访问
    console.log("🔍 准备调用i18接口，先进行网络测试...");
    try {
      await utils.debugNetworkRequest("/api/i18", "POST");
    } catch (debugError) {
      console.warn("⚠️ 网络测试失败，但继续尝试正常请求:", debugError.message);
    }

    const i18nResponse = await customHttp.post("/api/i18", i18nConfig, {
      headers: await getAuthHeaders(),
    });
    console.log("✅ 国际化创建结果:", i18nResponse.data);

    // 2. 创建菜单
    const menuConfig = {
      name: formData.menuConfig.routeId,
      path: formData.menuConfig.path,
      component: formData.menuConfig.componentPath,
      icon: formData.menuConfig.icon,
      menuType: "/",
      parentId: formData.menuConfig.parentId,
      order: formData.menuConfig.order,
      locale: formData.menuConfig.locale,
    };

    const menuResponse = await customHttp.post("/api/menu", menuConfig, {
      headers: await getAuthHeaders(),
    });
    console.log("菜单创建结果:", menuResponse.data);

    // 3. 获取角色信息
    const roleResponse = await customHttp.get(
      "/api/role/detail?page=1&limit=5",
      {
        headers: await getAuthHeaders(),
      }
    );
    console.log("角色信息:", roleResponse.data);

    const Menus = roleResponse.data.roleInfo.items[0].menus;
    const menuIds = Menus.map((item: any) => item.id);

    // 4. 配置权限
    const roleUpdateResponse = await customHttp.patch(
      "/api/role",
      {
        id: roleResponse.data.roleInfo.items[0].id,
        menuIds: [...menuIds, menuResponse.data.id],
      },
      {
        headers: await getAuthHeaders(),
      }
    );
    // eslint-disable-next-line no-console
    console.log("权限配置结果:", roleUpdateResponse.data);

    return {
      i18nResult: i18nResponse.data,
      menuResult: menuResponse.data,
      roleResult: roleUpdateResponse.data,
      menuId: menuResponse.data?.id || "unknown",
    };
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("API调用失败:", error);
    throw error;
  }
};

// 自动填充表单的函数
// const fillFormWithPageInfo = (pageName: string) => {
//   const pageFormat = utils.formatPageName(pageName);
//   Object.assign(formData.menuConfig, {
//     name: pageFormat.original,
//     routeId: pageFormat.kebabCase,
//     path: pageFormat.path,
//     componentPath: pageFormat.componentPath,
//     locale: pageFormat.locale,
//   });
// };

// 监听页面信息变化，自动填充表单
// watch(
//   [() => props.pageInfo, currentPageInfo],
//   ([newPageInfo, currentPage]) => {
//     const pageName = currentPage?.name || newPageInfo?.name || "NewPage";

//     if (pageName !== "NewPage") {
//       fillFormWithPageInfo(pageName);
//     }
//   },
//   { immediate: true }
// );

// 表单验证
const isFormValid = computed(() => {
  return (
    formData.menuConfig.name &&
    formData.menuConfig.path &&
    formData.deployment.componentPath
  );
});

// 保存文件到本地
const saveFilesToLocal = async (files: any[]) => {
  if (!files || files.length === 0) return;

  try {
    // 使用浏览器的文件系统访问API (如果支持)
    if ("showDirectoryPicker" in window) {
      const dirHandle = await (window as any).showDirectoryPicker();

      for (const file of files) {
        const fileName = "index.vue"; // file.fileName || `${file.fileType || 'file'}.vue`
        const fileHandle = await dirHandle.getFileHandle(fileName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(file.fileContent || file.content || "");
        await writable.close();
      }
    } else {
      // 降级方案：下载每个文件
      for (const file of files) {
        const fileName = "index.vue"; //file.fileName || `${file.fileType || 'file'}.vue`
        const content = file.fileContent || file.content || "";
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  } catch (error: any) {
    // throw new Error(`文件保存失败: ${error.message}`)
  }
};

// 确认集成
const confirm = async () => {
  if (!isFormValid.value) {
    utils.showNotification("warning", "表单验证失败", "请填写必填字段");
    return;
  }

  if (generatedFiles.length === 0) {
    utils.showNotification(
      "warning",
      "请先生成文件",
      '请点击"生成预览"按钮生成文件'
    );
    return;
  }

  integrating.value = true;

  try {
    // 1. 获取选中的文件 - 需要从原始数据中获取，而不是预览数据
    const selectedPreviewFiles =
      gridRef.value?.getSelectRecords() || fileTableData.value;

    // 根据选中的预览文件，从原始文件中找到对应的完整内容
    const selectedFiles = selectedPreviewFiles.map((previewFile: any) => {
      // 通过fileName和path找到原始文件
      const originalFile = generatedFiles.find(
        (file: any) =>
          file.fileName === previewFile.fileName &&
          file.filePath === previewFile.filePath
      );
      return originalFile || previewFile; // 如果找不到原始文件，使用预览文件作为备选
    });

    // 2. 保存文件到本地
    await saveFilesToLocal(selectedFiles);

    // 3. 调用后台API创建菜单和分配权限
    const apiResult = await callBackendAPI();

    // 4. 返回集成结果给父组件
    emit("confirm", {
      files: selectedFiles,
      config: formData,
      apiResult,
    });

    utils.showNotification(
      "success",
      "集成成功",
      `菜单已创建，权限已分配，已保存 ${selectedFiles.length} 个文件到本地`
    );
  } catch (error: any) {
    utils.showNotification(
      "error",
      "集成失败",
      error?.message || "集成过程中出现错误"
    );
  } finally {
    integrating.value = false;
  }
};
</script>

<style lang="less" scoped>
.system-integration-dialog {
  :deep(.tiny-dialog-box__content) {
    background-color: var(--te-toolbars-generate-code-bg-color);

    .tiny-dialog-box__header {
      background-color: var(--te-toolbars-generate-code-bg-color);

      .tiny-dialog-box__title {
        color: var(--te-toolbars-generate-code-text-color);
      }

      .tiny-dialog-box__headerbtn .tiny-dialog-box__close {
        fill: var(--te-toolbars-generate-code-icon-color) !important;

        &:hover {
          fill: var(--te-toolbars-generate-code-icon-color-primary) !important;
        }
      }
    }

    .tiny-dialog-box__footer {
      .tiny-button--primary {
        background-color: var(--te-toolbars-generate-code-bg-color-primary);
        border: none;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .footer-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .footer-tips {
        .tip-text {
          font-size: 12px;
          color: #f56c6c;
          font-style: italic;
        }
      }
    }

    .footer-right {
      display: flex;
      gap: 8px;
    }
  }
}

.integration-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 650px;
}

.page-info-section {
  .page-info-card {
    background: var(--te-toolbars-generate-code-bg-color);
    border: 1px solid var(--te-toolbars-generate-code-border-color-checked);
    border-radius: 8px;
    padding: 16px;

    .page-info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .page-info-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--te-toolbars-generate-code-text-color);
        margin: 0;
      }

      .page-info-badge {
        background: var(--te-toolbars-generate-code-bg-color-primary);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
    }

    .page-info-content {
      display: flex;
      gap: 24px;

      .page-info-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .info-label {
          color: var(--te-toolbars-generate-code-text-color);
          font-weight: 500;
          font-size: 14px;
        }

        .info-value {
          color: var(--te-toolbars-generate-code-text-color);
          font-weight: 600;
          font-size: 14px;
          background: rgba(64, 158, 255, 0.1);
          padding: 2px 8px;
          border-radius: 4px;

          &.token-status {
            font-size: 12px;

            &.api {
              background: rgba(34, 197, 94, 0.1);
              color: #16a34a;
            }

            &.cache {
              background: rgba(168, 85, 247, 0.1);
              color: #a855f7;
            }

            &.localStorage,
            &.sessionStorage {
              background: rgba(251, 191, 36, 0.1);
              color: #d97706;
            }

            &.cookie {
              background: rgba(245, 101, 101, 0.1);
              color: #dc2626;
            }

            &.postMessage {
              background: rgba(59, 130, 246, 0.1);
              color: #2563eb;
            }
          }
        }
      }
    }
  }
}

.main-content {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.integration-form {
  flex: 1;
  max-height: 100%;
  overflow-y: auto;
  padding: 16px;
  border-right: 1px solid var(--te-toolbars-generate-code-border-color-checked);
}

.file-preview {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .file-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .file-stats {
      color: var(--te-toolbars-generate-code-text-color);
      font-size: 12px;
      background: rgba(64, 158, 255, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--te-toolbars-generate-code-text-color);

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.8;
      animation: pulse 2s infinite;
    }

    .empty-text {
      font-style: italic;
      opacity: 0.8;
      margin: 0 0 8px 0;
      font-size: 16px;
    }

    .empty-hint {
      font-size: 12px;
      opacity: 0.6;
      margin: 0;
      color: var(--te-toolbars-generate-code-bg-color-primary);
    }
  }

  .file-list {
    flex: 1;
    min-height: 0;
  }
}

.form-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--te-toolbars-generate-code-text-color);
    padding-bottom: 8px;
    border-bottom: 1px solid
      var(--te-toolbars-generate-code-border-color-checked);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      &.full-width {
        grid-column: 1 / -1;
      }

      label {
        font-weight: 500;
        color: var(--te-toolbars-generate-code-text-color);
        font-size: 14px;

        .required {
          color: #f56c6c;
          margin-left: 2px;
        }
      }
    }
  }
}

.config-preview {
  background-color: var(--te-toolbars-generate-code-bg-color);
  border: 1px solid var(--te-toolbars-generate-code-border-color-checked);
  border-radius: 4px;
  padding: 12px;

  pre {
    margin: 0;
    font-size: 12px;
    color: var(--te-toolbars-generate-code-text-color);
    white-space: pre-wrap;
    word-break: break-all;
  }
}

// 动画效果
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-info-card {
  animation: fadeIn 0.3s ease-out;
}

.file-list {
  animation: fadeIn 0.5s ease-out;
}
</style>
