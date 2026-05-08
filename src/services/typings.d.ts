// @ts-ignore
/* eslint-disable */

declare namespace API {
  // 通用响应
  type BaseResponse<T> = {
    code: number;
    message: string;
    data: T;
  };

  // 分页信息
  type PageInfo<T = any> = {
    list: T[];
    total: number;
  };

  // 登录参数
  type LoginParams = {
    username: string;
    password: string;
    autoLogin?: boolean;
    type?: string;
  };

  // 登录结果
  type LoginResult = {
    code?: number;
    message?: string;
    data?: {
      token: string;
    };
  };

  // 登出结果
  type LogoutResult = {
    code?: number;
    message?: string;
  };

  // 当前用户
  type CurrentUser = {
    id: string;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    avatar: string;
    status: number;
    roles: RoleInfo[];
    permissions: string[];
  };

  // 用户参数
  type UserParams = {
    username: string;
    password?: string;
    nickname?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    status?: number;
    roleIds?: string[];
  };

  // 用户信息
  type UserInfo = {
    id: string;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    avatar: string;
    status: number;
    createTime: string;
    updateTime: string;
    lastLoginTime: string;
    roles: RoleInfo[];
  };

  // 用户列表
  type UserList = {
    list: UserInfo[];
    total: number;
    pageSize: number;
    current: number;
  };

  // 修改密码参数
  type UpdatePasswordParams = {
    oldPassword: string;
    newPassword: string;
  };

  // 角色信息
  type RoleInfo = {
    id: string;
    name: string;
    description: string;
    status: number;
    isAdmin?: boolean;
    menus: MenuItem[];
    permissions: PermissionItem[];
    createTime: string;
    updateTime: string;
  };

  // 角色列表
  type RoleList = {
    list: RoleInfo[];
    total: number;
    pageSize: number;
    current: number;
  };

  // 角色参数
  type RoleParams = {
    name: string;
    description?: string;
    status?: number;
    permissionIds?: string[];
  };

  // 菜单项
  type MenuItem = {
    id: string;
    parentId: string | null;
    parent: MenuItem | null;
    name: string;
    path: string;
    sort: number;
    createTime: string;
    updateTime: string;
    children?: MenuItem[];
  };

  // 菜单列表
  type MenuList = {
    list: MenuItem[];
    total: number;
  };

  // 菜单树
  type MenuTree = MenuItem[];

  // 菜单参数
  type MenuParams = {
    parentId?: number;
    name: string;
    path: string;
    sort?: number;
  };

  // 权限项
  type PermissionItem = {
    id: string;
    name: string;
    code: string;
    description: string;
    createTime: string;
    updateTime: string;
  };

  // 权限列表
  type PermissionList = {
    list: PermissionItem[];
    total: number;
    pageSize: number;
    current: number;
  };

  // 权限参数
  type PermissionParams = {
    name: string;
    code: string;
    description?: string;
  };

  // 通知类型
  type NoticeIconList = {
    data?: NoticeIconItem[];
    total?: number;
    success?: boolean;
  };

  // 通知项
  type NoticeIconItem = {
    id: string;
    extra?: string;
    key: string;
    read?: boolean;
    avatar?: string;
    title: string;
    status?: string;
    datetime: string;
    description: string;
    type: string;
  };

  // 规则列表
  type RuleList = {
    data?: RuleListItem[];
    total?: number;
    success?: boolean;
  };

  // 规则项
  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  // 文章栏目信息
  type ColumnInfo = {
    id: number;
    name: string;
    desc?: string;
    sort?: number;
    isActive?: number;
    createTime: string;
    updateTime: string;
  };

  // 文章栏目列表
  type ColumnList = {
    list: ColumnInfo[];
    total: number;
    pageSize: number;
    page: number;
  };

  // 文章栏目参数
  type ColumnParams = {
    name: string;
    desc?: string;
    sort?: number;
    isActive?: number;
  };

  // 文章栏目查询参数
  type ColumnQueryParams = {
    page?: number;
    pageSize?: number;
    name?: string;
    isActive?: number;
  };

  // 文章类型信息
  type ArticleTypeInfo = {
    id: number;
    name: string;
    description?: string;
    sort?: number;
    isActive?: number;
    columnId: number;
    createdAt: string;
    updatedAt: string;
  };

  // 文章类型列表
  type ArticleTypeList = {
    list: ArticleTypeInfo[];
    total: number;
    page: number;
    pageSize: number;
  };

  // 文章类型参数
  type ArticleTypeParams = {
    name: string;
    description?: string;
    sort?: number;
    isActive?: number;
    columnId: number;
  };

  // 文章类型查询参数
  type ArticleTypeQueryParams = {
    page?: number;
    pageSize?: number;
    name?: string;
    columnId?: number;
  };

  // 文章标签信息
  type TagInfo = {
    id: number;
    name: string;
    description?: string;
    sort?: number;
    isActive?: number;
    columnId: number;
    createdAt: string;
    updatedAt: string;
  };

  // 文章标签列表
  type TagList = {
    list: TagInfo[];
    total: number;
    page: number;
    pageSize: number;
  };

  // 文章标签参数
  type TagParams = {
    name: string;
    description?: string;
    sort?: number;
    isActive?: number;
    columnId: number;
  };

  // 文章标签查询参数
  type TagQueryParams = {
    page?: number;
    pageSize?: number;
    name?: string;
    isActive?: number;
    columnId?: number;
  };

  // 文章信息
  type ArticleInfo = {
    id: number;
    title: string;
    description?: string;
    content: string;
    summary?: string;
    coverImage?: string;
    columnId: number;
    articleTypeId: number;
    tags?: TagInfo[];
    isActive: number;
    views: number;
    createdAt: string;
    updatedAt: string;
  };

  // 文章列表
  type ArticleList = {
    list: ArticleInfo[];
    total: number;
    page: number;
    pageSize: number;
  };

  // 文章参数
  type ArticleParams = {
    title: string;
    description?: string;
    content: string;
    summary?: string;
    coverImage?: string;
    columnId: number;
    articleTypeId: number;
    tagIds?: number[];
    isActive?: number;
  };

  // 文章查询参数
  type ArticleQueryParams = {
    page?: number;
    pageSize?: number;
    name?: string;
    isPublished?: number;
    articleTypeId?: number;
    tagId?: number;
  };
}
