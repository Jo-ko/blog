---
title: 线性代数
date: 2020-06-30
tags:
- 数学知识
categories:
- 前端知识
---

## 矩阵与线性变换
1. 我们可以从基向量的变换中推导出坐标中的任意点的变换
2. 矩阵与向量乘法的本质是向量的空间线性变换

::: tip 矩阵与向量乘法 
$$
\begin{pmatrix} a&c\\b&d \end{pmatrix} \times \begin{pmatrix} E\\F \end{pmatrix} = E \times \begin{pmatrix} a\\b \end{pmatrix} + F \times \begin{pmatrix} c\\d \end{pmatrix} = \begin{pmatrix} Ea + Fc\\Eb + Fd \end{pmatrix}
$$
:::

```text
matrix = [
    a, c,
    b, d
];
vector = [
    E,
    F,
]

matrix左侧部分[a, b]就是变换后的i基
matrix右侧部分[c, d]就是变换后的j基

matrix * vector = E * [
    a,
    b
] + F * [
    c,
    d
]
上述的结果就是[
    Ea + Fc,
    Eb + Fd
]
```


## 矩阵与线性变换复合
矩阵与矩阵的乘法本质是两个线性变换产生的复合矩阵

::: tip 矩阵与矩阵乘法
$$
\begin{pmatrix} a&b\\c&d \end{pmatrix} \times \begin{pmatrix} A&C\\B&D \end{pmatrix} = 
\begin{pmatrix} a&b\\c&d \end{pmatrix} \times \begin{pmatrix} A\\B \end{pmatrix} +
\begin{pmatrix} a&b\\c&d \end{pmatrix} \times \begin{pmatrix} C\\D \end{pmatrix} =
\begin{pmatrix} Aa+Bb&Ca+Db\\Ac+Bd&Cc+Dd\end{pmatrix}
$$
:::

```text
matrixA = [
    a, c,
    b, d
];
matrixB = [
    A, C,
    B, D
];

matrixA * matrixB = matrixC的过程

注意矩阵相乘的顺序是从右到左的
第1部分: matrixA * matrixB的左部分([A, B])
第2部分: matrixA * matrixB的右部分([C, D])
最后将第1部分和第2部分结合,得到matrixC
matrixC = [
    Aa+Bb, Ca+Db,
    Ac+Bd, Cc+Dd,
]
```

::: tip 矩阵的相乘的顺序和结合律
1. 交换 matrixA * matrixB != matrixB * matrixA;
2. 结合 matrixA * (matrixB * matrixC) = (matrixA * matrixB) * matrixC 
:::

::: tip 扩展下不同维度矩阵相乘
前提: 不同维度矩阵相乘需要满足: (M * N)(Z * P) = (M * P), 注意, M, Z表示行, N, P表示列,其中Z等于N

matrixA * matrixB相乘后的结果矩阵matrixC中i,j(第i行,第j列)数值等于matrixA的i行向量与matrixB的j列向量的点积
:::

## 行列式
### 2x2矩阵
> 2x2矩阵行列式(determinate)表示变换后的基向量组成的 __平面面积__ 与原有1单位的基向量面积的增长比

::: tip 2x2行列式计算
$$ \text{矩阵A} = \begin{pmatrix} a&c\\b&d \end{pmatrix}$$
$$\text{detA} = ad - bc$$
:::
```text
matrixA = [
    a, b
    c, d
]
determinantA = ad - bc;

determinantA 为0表示在矩阵A的变换下,空间被压缩到了一条线上或一个点
determinantA 为负数表示在矩阵A的变换下, 二维空间坐标的定向发生了反转
```

### 3x3矩阵
> 3x3矩阵行列式(determinate)表示变换后的基向量组成的 __平行六面体体积__ 与原有1单位的基向量体积的增长比

::: tip 3x3行列式计算
$$ \text{矩阵B} = \begin{pmatrix} a&E&x\\b&F&y\\c&G&z \end{pmatrix}$$
$$
\text{detB} = 
a\times\text{det}( \begin{pmatrix} F&y\\G&z \end{pmatrix} ) +
x\times\text{det}( \begin{pmatrix} b&F\\c&G \end{pmatrix} ) -
E\times\text{det}( \begin{pmatrix} b&y\\c&z \end{pmatrix} )
$$
:::
```text

matrixB = [
    a, E, x,
    b, F, y,
    c, G, z,
]

determinantB = a*det([
    F, y,
    G, z,
]) + x*det([
    b, F,
    c, G,
]) - E*det([
    b, y,
    c, z,
])
```

## 逆矩阵
看一个线性方程
```text
1x + 2y + 3z = 14;
2x + 4y + 1z = 10;
3x + 1y + 2z = 9;
```

这个线性方程就表示一个向量$\vec v$在矩阵m的变换下变成了向量$\vec V$(-3, 0, 2),所以我们想知道$\vec v$,只要把向量$\vec V$在m的逆矩阵m'的作用下进行变换就能得出
```text
[
    1,2,3,
    2,4,1,
    3,1,2
] * [
    x,
    y,
    z
] = [
    14,
    10,
    9
]

等同于求解
matrixA' * [
    14,
    10,
    9
] = [
    x,
    y,
    z
]

```
::: tip 求解逆矩阵

$$
\begin{pmatrix} a&b\\c&d \end{pmatrix}(^-1) =
\text{行列式的倒数} \times \text{置换后的矩阵} = 
\frac{1}{ad - bc} \times \begin{pmatrix} d&-b\\-c&a \end{pmatrix}
$$
1. 我们能看到求解时行列式不能为0,因为在坐标空间上来看,行列式为0表示是一条线,我们 __不能将线逆转换成平面__
:::

## 列空间&秩&零空间
### 秩
表示向量$\vec v$在矩阵m变换后的空间维度,二维空间最大的秩为2, 三维空间最大的秩为3
### 列空间
所有可能 __输出的向量$\vec v$__ 在矩阵m变换下的集合被称为矩阵m的列空间,也可以说列空间就是矩阵所张成的空间
### 零空间
在矩阵m变换后所有落在原点的向量集合被称为零空间

## 点积
两个维度相同的向量的点乘
$$
\vec M = \begin{pmatrix} a\\b\\c \end{pmatrix}
\vec N = \begin{pmatrix} A\\B\\C \end{pmatrix}
$$
$$
\vec M \cdot \vec N = \vec N \text{在M的投影长度} \times \vec M \text{长度} = a \times A + b \times B + c \times C = \Vert \vec M \Vert \times \Vert \vec N \Vert \times \cos (\theta)
$$

## 点积的应用点
1. 获取两个向量的夹角的余弦值,进而得到 __夹角的度数__
2. 获取向量在另一个向量的投影,并进一步将该向量进行垂直和平行的分解
3. 判断两个向量的方向

::: tip M 与 N的方向
1. $\vec M \cdot \vec N$ 为正表示两个向量方向一直
2. $\vec M \cdot \vec N$ 为负表示两个向量方向相反
3. $\vec M \cdot \vec N$ 为0表示两个向量方向垂直
:::

::: tip 点积的结合律,交换律和分配律
1. $\vec M \cdot \vec N = \vec N \cdot \vec M$
2. $\vec M \cdot (\vec N + \vec Y) = \vec M \cdot \vec N + \vec M \cdot \vec Y$
3. $(K \vec M) \cdot \vec N = \vec M \cdot (K \vec N) = k(\vec M \cdot \vec N)$
:::

### 点积与矩阵变换
**从线性变换的角度上来说就是$\vec N$ 在转置矩阵M $\begin{pmatrix} a&b&c \end{pmatrix}$ 的变换(对偶性), $\vec M$被称为对偶向量**
$$
\begin{pmatrix} a\\b\\c \end{pmatrix} \cdot \begin{pmatrix} A\\B\\C \end{pmatrix} =
\begin{pmatrix} a&b&c \end{pmatrix} \times \begin{pmatrix} A\\B\\C \end{pmatrix}
$$
1. 每当我们看到一个空间到数轴的线性变换,都能找到一个向量被称为这个变换的对偶向量,使得应用线性变换和对偶向量的点积相等
2. 理解这个对偶向量有助于了解叉乘


## 叉积
真正的叉积是通过两个三维向量生成一个新的三维向量
1. 二维叉积
> $\vec M$ 与 $\vec N$ 的叉积就是长度为 $\vec M$ 与 $\vec N$ 行列式数值(MN围成的平行四边形的面积),垂直MN向量平面的新的向量

$$
\vec M = \begin{pmatrix} a\\b \end{pmatrix}
\vec N = \begin{pmatrix} A\\B \end{pmatrix}
$$

$$
\vec M \times \vec N = a \times B - b \times A = \Vert \vec M \Vert \times \Vert \vec N \Vert \times \sin (90^\circ) = \Vert \vec M \Vert \times \Vert \vec N \Vert 
$$

::: tip M 与 N的叉积值的正负
1. $\vec M \cdot \vec N$ 为正表示M在N的右边
2. $\vec M \cdot \vec N$ 为负表示M在N的左边
:::

2. 三维叉积
> 需要注意的是三维满秩向量的行列式不能表示三维向量的叉积

$$
\vec M = \begin{pmatrix} a\\b\\c \end{pmatrix}
\vec N = \begin{pmatrix} A\\B\\C \end{pmatrix}

$$

$$
\vec M \times \vec N = 
det(\begin{pmatrix} i&a&A\\j&b&B\\k&c&C \end{pmatrix}) =
i(b \times C - B \times c)+j(c \times A - C \times a)+k(a \times B - A \times b) = 
\begin{pmatrix} b \times C-B \times c\\c \times A-C \times a\\a \times B-A \times b \end{pmatrix}
$$

上面的式子是怎么产生的
$$
fn(\begin{pmatrix} i\\j\\k \end{pmatrix}) = det(\begin{pmatrix} i&a&A\\j&b&B\\k&c&C \end{pmatrix})
\text{ fn是一个由三维空间到数轴的函数}
$$
$$
fn(\begin{pmatrix} i\\j\\k \end{pmatrix}) = \begin{pmatrix} m&n&z \end{pmatrix} \times \begin{pmatrix} i\\j\\k \end{pmatrix}
$$
__$\begin{pmatrix} m&n&z \end{pmatrix}$ 就是我们所求的__

根据对偶性
$$
\begin{pmatrix} m&n&z \end{pmatrix} \times \begin{pmatrix} i\\j\\k \end{pmatrix} = \begin{pmatrix} m\\n\\z \end{pmatrix} \cdot \begin{pmatrix} i\\j\\k \end{pmatrix}
$$
结合上面的式子
$$
\begin{pmatrix} m\\n\\z \end{pmatrix} \cdot \begin{pmatrix} i\\j\\k \end{pmatrix} =
det(\begin{pmatrix} i&a&A\\j&b&B\\k&c&C \end{pmatrix}) =
i(b \times C - B \times c)+j(c \times A - C \times a)+k(a \times B - A \times b)
$$
左边点积的计算结果
$$
\begin{pmatrix} m\\n\\z \end{pmatrix} \cdot \begin{pmatrix} i\\j\\k \end{pmatrix} = m \times i + n \times j + z \times k
$$
两边同时消去 i,j,k 我们可以得出
$$
m = b \times C - B \times c
$$
$$
n = c \times A - C \times a
$$
$$
z = a \times B - A \times b
$$

### 叉积与矩阵变换
$$
\vec a \times \vec b = matrix A ^* \times \vec b =
\begin{pmatrix} 0&-Z_a&Y_a\\Z_a&0&-X_a\\-Y_a&Z_a&0 \end{pmatrix} \times \begin{pmatrix} X_b\\Y_b\\Z_b \end{pmatrix}
$$

## 基变换
$\vec A$在矩阵$\begin{pmatrix} 1&&1\\2&&1 \end{pmatrix}$的作用的变换的结果可以看成从正常基向量看$\vec A$在特殊基向量的坐标位置


## 罗德里格斯公式推导
http://zhaoxuhui.top/blog/2018/11/16/DerivationOfRodriguesRotationFormula.html
