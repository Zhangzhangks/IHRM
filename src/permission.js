import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style

import { dynamicRouter } from "./router";
NProgress.configure({ showSpinner: false })//不显示圈圈

const whiteList = ["/login", '/404'];
router.beforeEach(async (to, from, next) => {

  NProgress.start();
  if (store.getters.token) {
    if (to.path === '/login') {
      next('/');
    } else {
      next()

      if (!store.getters.userId) {
        const { roles } = await store.dispatch('user/getUserInfo') // 拉取用户信息，动态添加路由到 store
        const filterRouter = dynamicRouter.filter(item => {
          return roles.menus.includes(item.name)
        })
        // console.log(roles);
        // console.log(filterRouter);
        store.commit('user/setRouter', filterRouter)
        router.addRoutes([...filterRouter, { path: '*', redirect: '/404', hidden: true }])
        next(to.path,)

      }
    }
  }
  else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }

})

router.afterEach(() => {
  NProgress.done();
});



// NProgress.configure({ showSpinner: false }); // NProgress Configuration

// const whiteList = ["/login"]; // no redirect whitelist

// router.beforeEach(async (to, from, next) => {
//   // start progress bar
//   NProgress.start();

//   // set page title
//   document.title = getPageTitle(to.meta.title);

//   // determine whether the user has logged in
//   const hasToken = getToken();

//   if (hasToken) {
//     if (to.path === "/login") {
//       // if is logged in, redirect to the home page
//       next({ path: "/" });
//       NProgress.done();
//     } else {
//       const hasGetUserInfo = store.getters.name;
//       if (hasGetUserInfo) {
//         next();
//       } else {
//         try {
//           // get user info
//           await store.dispatch("user/getInfo");

//           next();
//         } catch (error) {
//           // remove token and go to login page to re-login
//           await store.dispatch("user/resetToken");
//           Message.error(error || "Has Error");
//           next(`/login?redirect=${to.path}`);
//           NProgress.done();
//         }
//       }
//     }
//   } else {
//     /* has no token*/
//     if (whiteList.indexOf(to.path) !== -1) {
//       // in the free login whitelist, go directly
//       next();
//     } else {
//       // other pages that do not have permission to access are redirected to the login page.
//       next(`/login?redirect=${to.path}`);
//       NProgress.done();
//     }
//   }
// });

// router.afterEach(() => {
//   // finish progress bar
//   NProgress.done();
// });
