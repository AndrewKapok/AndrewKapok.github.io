# Tarjan算法
tarjan是一种求强连通分量的算法。

有向图 G 强连通是指，G 中任意两个结点连通。

我们把无向图当成有向图看待(一条正边，一条反边)

下面用一道例题讲解
## P3387 【模板】缩点

### 题目描述

给定一个 n 个点 m 条边有向图，每个点有一个权值，求一条路径，使路径经过的点权值之和最大。你只需要求出这个权值和。

允许多次经过一条边或者一个点，但是，重复经过的点，权值只计算一次。

### 输入格式

第一行两个正整数 n,m。

第二行 n 个整数，其中第 i 个数 a_i 表示点 i 的点权。

第三至 m+2 行，每行两个整数 u,v，表示一条 u到 v 的有向边。

### 输出格式

共一行，最大的点权之和。
## 实现思路
- 初始化
- 标记强连通分量
- 根据标记缩点
- 重新建图
- 拓扑求最大值
## 初始化

数据结构：
```cpp
int dfn[10009], low[10009]; // 存储dfn，low值
int n, m;                   // 含义如题目所示
int cnt, oldvalue[10009], newvalue[10009], color[10009], now_color;
/*
cnt 存储dfs序
oldvalue 缩点前的点权
newvalue 缩点后的点权
color 强连通分量的编号
nowcolor 当前分量编号
*/
set<int> G[10009]; // 缩点前的有向图
set<int> map[10009];
stack<int> s;           // tarjian的搜索栈
bitset<10009> in_stack; // 在栈中
```
____
输入部分:
```cpp
void build(int start, int end)
{
    G[start].insert(end);
}
void input()
{
    scanf("%d%d", &n, &m);
    for (int i = 1; i <= n; i++)
    {
        scanf("%d", &oldvalue[i]);
    }
    for (int i = 1; i <= m; i++)
    {
        int start, end;
        scanf("%d%d", &start, &end);
        build(start, end);
    }
}
```


## 标记强连通分量

```cpp
void tarjan(int id)
{
    cnt++;
    dfn[id] = low[id] = cnt; // 初始化自己的dfn和low，dfn从此确定，low由儿子或自己更新
    s.push(id);              // 入栈，代表访问到当前的元素
    in_stack[id] = true;     // 标记入栈
    for (auto a : G[id])     // 遍历所有边
    {
        // a是儿子的节点编号
        if (dfn[a] == 0) // dfn==0 未被访问过
        {
            tarjan(a);                      // 往下走
            low[id] = min(low[id], low[a]); // 用儿子更新自己
        }
        else if (in_stack[a] == true) // 自己的儿子是自己的父亲（返祖边）
        {
            low[id] = min(low[id], dfn[a]); // 有可能一个节4点有很多条返祖边，选最早的祖宗
        }
    }
    if (dfn[id] == low[id]) // 当前强连通最先访问的节点
    {
        int front;
        now_color++; // 获取当前强连通编号
        do
        {
            front = s.top();                        // 获取栈顶
            in_stack[front] = false;                // 出栈
            s.pop();                                // 弹出栈顶
            newvalue[now_color] += oldvalue[front]; // 点权合并
            color[front] = now_color;               // 保存当前节点编号为当前强连通编号
        } while (front != id); // 弹出到当前节点为止
    }
}
```
____
`main`函数：
```cpp
int main()
{
    input();
    for (int i = 1; i <= n; i++)
    {
        if (dfn[i] == 0)
        {
            tarjan(i);
        }
    }
    suodian();
    topo();
}
```
 
## 缩点/重建图

```cpp
void suodian()
{
    for (int i = 1; i <= n; i++) // 便利所有点
    {
        for (auto a : G[i]) // 便利当前点的所有边
        {
            if (color[a] != color[i]) // 如果颜色不同，则证明不是同一个新点，建立边
            {
                map[color[i]].insert(color[a]);
            }
        }
        G[i].clear();
    }
}
```

## 求最大和
```cpp
void topo()
{
    queue<int> que;
    vector<int> in(now_color + 1), can(now_color + 1);
    for (int i = 1; i <= now_color; i++)
    {
        for (auto a : map[i])
        {
            in[a]++; // 统计入度
        }
    }
    for (int i = 1; i < in.size(); i++) // 统计入度为0的节点
    {
        if (in[i] == 0)
        {
            can[i] = newvalue[i];
            que.push(i);
        }
    }
    while (que.empty() == false)
    {
        int front = que.front();
        que.pop();
        for (auto a : map[front])
        {
            can[a] = max(can[a], newvalue[a] + can[front]);
            in[a]--;
            if (in[a] == 0)
            {
                que.push(a);
            }
        }
    }
    int maxn = -1e9 - 7;
    for (auto a : can)
    {
        if (a > maxn)
        {
            maxn = a;
        }
    }
    printf("%d ", maxn);
}
```