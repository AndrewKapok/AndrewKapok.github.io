import DefaultTheme from 'vitepress/theme';
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import { useData, useRoute } from 'vitepress';
import { toRefs } from "vue";
import "vitepress-markdown-timeline/dist/theme/index.css";

export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
        DefaultTheme.enhanceApp(ctx);
    },
    setup() {
        // 获取前言和路由
        const { frontmatter } = toRefs(useData());
        const route = useRoute();
        
        // 评论组件 - https://giscus.app/
        giscusTalk({
            repo: 'AndrewKapok/AndrewKapok.github.io',
            repoId: 'R_kgDORF47NA',
            category: 'Announcements',
            categoryId: 'DIC_kwDORF47NM4C26IG',
            mapping: 'pathname',
            inputPosition: 'top',
            lang: 'zh-CN',
            locales: {
                'zh-Hans': 'zh-CN',
                'en-US': 'en'
            },
            homePageShowComment: false,
            lightTheme: 'light',
            darkTheme: 'transparent_dark'
        }, {
            frontmatter, route
        },
            true
        );
    }
};