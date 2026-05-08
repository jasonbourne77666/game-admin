import { history } from '@umijs/max';
import { stringify } from 'querystring';
import { logout } from '@/services';

/**
 * 退出登录，并且将当前的 url 保存
 */
export const loginOut = async () => {
  await logout();
  const { search, pathname } = window.location;
  const urlParams = new URL(window.location.href).searchParams;
  /** 此方法会跳转到 redirect 参数所在的位置 */
  const redirect = urlParams.get('redirect');
  localStorage.removeItem('token');

  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
};
