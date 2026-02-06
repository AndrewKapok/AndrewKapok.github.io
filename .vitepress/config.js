import { defineConfig } from "vitepress";
import path from "node:path";
import fs from "node:fs";
import mathjax3 from "markdown-it-mathjax3";

// 文件根目录
const DIR_PATH = path.resolve();

// 读取mapping.json文件
const mappingPath = path.join(DIR_PATH, "mapping.json");
const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));
// 白名单,过滤不是文章的文件和文件夹
const WHITE_LIST = [
  "index.md",
  ".vitepress",
  "node_modules",
  ".idea",
  "assets",
  ".github",
  ".vscode",
  ".nojekyll",
  ".github",
  ".trae",
  ".git"
];

// 判断是否是文件夹
const isDirectory = (path) => fs.lstatSync(path).isDirectory();

// 取差值
const intersections = (arr1, arr2) =>
  Array.from(new Set(arr1.filter((item) => !new Set(arr2).has(item))));

// 把方法导出直接使用
function getList(params, path1, pathname) {
  // 存放结果
  const res = [];
  // 开始遍历params数组
  for (const fileItem of params) {
    // 拼接目录
    const dir = path.join(path1, fileItem);
    // 判断是否是文件夹
    const isDir = isDirectory(dir);
    if (isDir) {
      // 如果是文件夹,读取之后作为下一次递归参数
      const files = fs.readdirSync(dir);
      // 构建子目录的路径名，确保不包含多余的 ./
      const subPathname = pathname === "." ? fileItem : `${pathname}/${fileItem}`;
      // 查找mapping中的中文名称，如果没有则使用原名称
      const text = mapping[subPathname] || fileItem;
      res.push({
        text: text,
        collapsible: true,
        items: getList(files, dir, subPathname),
      });
    } else {
      // 获取名字
      const name = path.basename(fileItem);
      // 排除非 md 文件
      const suffix = path.extname(fileItem);
      if (suffix !== ".md") {
        continue;
      }
      // 生成链接时移除 .md 扩展名，并确保以 / 开头，不包含多余的 ./
      let linkPath = "";
      let fullPath = "";
      if (pathname === ".") {
        linkPath = name.replace(/\.md$/, "");
        fullPath = name;
      } else {
        linkPath = `${pathname}/${name.replace(/\.md$/, "")}`;
        fullPath = `${pathname}/${name}`;
      }
      // 查找mapping中的中文名称，如果没有则使用原名称（去掉.md）
      const text = mapping[fullPath] || name.replace(/\.md$/, "");
      res.push({
        text: text,
        link: `/${linkPath}`,
      });
    }
  }
  return res;
}

export const set_sidebar = (pathname) => {
  // 获取pathname的路径
  const dirPath = path.join(DIR_PATH, pathname);
  // 读取pathname下的所有文件或者文件夹
  const files = fs.readdirSync(dirPath);
  // 过滤掉
  const items = intersections(files, WHITE_LIST);
  // getList 函数后面会讲到
  return getList(items, dirPath, pathname);
};

// 生成侧边栏配置
const sidebar = set_sidebar(".");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 网站标题，游览器标签页上显示
  title: "Andrew`s Notes",
  description: "description",
  // 设置base为/，确保网站部署到域名根目录
  base: "/",
  markdown: {
    config: (md) => {
      md.use(mathjax3);
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // 页面左上方导航栏
    nav: [{ text: "Home", link: "/" }],
    // 底部配置
    footer: {
      copyright: "Copyright@ 2025 Andrew Kapok",
    },
    sidebar: sidebar,

    socialLinks: [{ icon: "github", link: "https://github.com/AndrewKapok" }],
  },
});
