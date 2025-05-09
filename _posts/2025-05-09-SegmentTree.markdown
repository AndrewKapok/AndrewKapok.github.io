---
layout:     post
title:      "Hello blog"
subtitle:   "线段树详解"
date:       2025-05-09 20:03
author:     "Andrew"
header-img: "img/post-bg-2015.jpg"
catalog: true
tags:
    - cpp
    - data-structure
---

# 线段树

线段树是一种维护区间信息的树，每一个节点都对应着区间 $[l,r]$ ,每一个非叶子节点的左右子节点都对应着 $[l,\frac{l+r}{2}]$ 和 $[\frac{l+r}{2}+1,2]$ ,数组下标为 $2x$ 和 $2x+1$。

线段树**一般**是平衡二叉树，树高为$O(\log_2 n)$

下面以最大值线段树为例演讲解基本操作                               

## 建树

**作用**:构造一棵查询数组a的线段树

```cpp
void build(int l, int r, int x) // 对[l,r]区间建立一颗以x为根的线段树
{
    if (l == r)
    {
        tree[x] = a[l];
        return;
    }
    int mid = (l + r) >> 1; // (l+r)/2;
    // 左子树
    build(l, mid, (x << 1));
    // 右子树
    build(mid + 1, r, (x << 1) + 1);
    // 合并
    tree[x] = max(tree[(x << 1)], tree[(x << 1) + 1]);
    return;
}

```

## 单点修改

对数组的某一个元素修改(修改为某一个值)

```cpp
void point_modify(int left, int right /*当前搜索的左右区间*/, int x /*当前在tree数组中的编号*/, int i /*目标在原数组中的编号*/, int newvalue /*需要修改的值*/)
{
    if (left == right) // 这个元素必定表示的就是[left, left]
    {
        tree[x] = newvalue;
        return;
    }
    int mid = (left + right) >> 1;
    if (i <= mid)
    {
        point_modify(left, mid, (x << 1), i, newvalue);
    }
    else
    {
        point_modify(mid + 1, right, (x << 1) + 1, i, newvalue);
    }
    tree[x] = max(tree[x << 1], tree[(x << 1) + 1]); // 更新数据
}
```

## 区间修改

因为区间修改所需查询的区间很大，如果对区间的每一个点都修改的话时间无法接受，这里引入`懒标记`概念

### 懒标记

‌懒标记（Lazy Tag）‌是一种在线段树中用于优化区间修改操作的技术。其核心思想是在进行区间修改时，不对线段树的每个节点都进行更新，而是只在根节点上打上一个标记，表示该节点的子树需要进行某种统一操作。当需要查询或修改时，再根据懒标记进行相应的操作。‌

#### 懒标记的工作原理

1. **区间修改‌**：当需要对线段树的一个区间进行修改时，例如将区间内的每个元素统一加上一个值，只需在根节点上打上懒标记，表示该区间内的所有元素都需要进行这个操作。这样，每次区间修改的时间复杂度降低到$O( \log_2 n )$，而不是$O(n)$。
   ‌

2. **下放操作‌**：当需要查询或进一步修改涉及有懒标记的节点时，需要进行下放操作（pushdown）。
   下放操作会将懒标记传递到子节点，并更新子节点的值。例如，如果根节点的懒标记表示需要将区间内的每个元素加3，那么在下放操作中，根节点的懒标记会被传递到左右子节点，并更新子节点的值。

**懒标记的应用场景和优势**

懒标记主要用于处理区间修改操作，如将一个区间内的所有元素统一增加或减少某个值。其优势在于：

1. ‌**减少重复计算‌**：通过只在根节点打上懒标记，避免了重复计算每个元素，显著提高了区间修改的效率。
2. ‌**延迟更新‌**：懒标记允许延迟更新子树中的节点，直到真正需要查询或进一步修改时才进行更新，进一步优化了性能。

### 使用lazy标记的区间修改

这里需要写一个`down`，用于将懒标记下传给左右儿子

```cpp
// 下推懒标记
void down(int x)
{
    if (lazy[x]) // 如果有懒标记
    {
        // 下传左子树
        lazy[x << 1] += lazy[x];
        tree[x << 1] += lazy[x];
        // 下传右子树
        lazy[(x << 1) + 1] += lazy[x];
        tree[(x << 1) + 1] += lazy[x];
        // 清除当前节点的懒标记
        lazy[x] = 0;
    }
}
```

下面给出区间修改的代码

```cpp
void add_region_modify(int l, int r /*当前区间*/, int L, int R /*需要处理的区间*/, int x /*当前节点编号*/, int add_value /*区间中每一个数需要增加的值*/)
{
    if (L <= l && r <= R) // 被完全包含
    {
        tree[x] += add_value; // 最大值增加add_value
        lazy[x] += add_value;
        return;
    }
    int mid = (l + r) >> 1;
    down(x);
    if (L <= mid)
    {
        add_region_modify(l, mid, L, R, x << 1, add_value);
    }
    if (R > mid)
    {
        add_region_modify(mid + 1, r, L, R, (x << 1) + 1, add_value);
    }
    tree[x] = max(tree[x << 1], tree[(x << 1) + 1]); // 更新当前节点的最大值
    return;
}
```

## 查询操作

查询操作分为两种：`单点修改，区间查询`和`区间修改，区间查询`。

因为单点修改可以看作长度为一的区间修改，所以这里以`区间修改，区间查询`为例（使用lazy标记
）

```cpp
int query(int L, int R /*查询区域*/, int l, int r /*当前区域*/, int x)
{
    if (L <= l && r <= R) // 找到
    {
        return tree[x];
    }
    if (lazy[x] != 0)
    {
        down(x);
    }

    int mid = (l + r) >> 1; // l+(l+r)/2;
    int ans = -1e9 - 7;
    if (L <= mid)
    {
        ans = max(ans, query(L, R, l, mid, x << 1));
    }
    if (R > mid)
    {
        ans = max(ans, query(L, R, mid + 1, r, (x << 1) + 1));
    }
    return ans;
}
```