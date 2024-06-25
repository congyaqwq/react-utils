import { useBlocker } from "react-router-dom";
import { useEffect } from "react";
import React from "react";

// 1、useBeforeUnload 监听 beforeUnload 事件，这个主要能监听到 a href 前进后退等这种跳转 browser navigation，同时调用 preventDefault 再把 returnValue 设置为空字符串然后确保标记取消了 beforeunload 事件；

// 2、usePrompt 的实现拦截了 react-router navigate history.go(..) 方法。

export function usePrompt({
  doBlock,
  message,
  customFn,
}: {
  doBlock: boolean;
  message?: string;
  customFn: (resolve: () => void, reject: () => void) => void;
}) {
  useBeforeUnload(doBlock);

  useCustomPrompt({ when: doBlock, message, customFn });
}

/**
 * Wrapper around useBlocker to show a window.confirm prompt to users instead
 * of building a custom UI with useBlocker.
 *
 * Warning: This has *a lot of rough edges* and behaves very differently (and
 * very incorrectly in some cases) across browsers if user click addition
 * back/forward navigations while the confirm is open.  Use at your own risk.
 */
function useCustomPrompt({
  when,
  message,
  customFn,
}: {
  when: boolean;
  message?: string;
  customFn: (resolve: () => void, reject: () => void) => void;
}) {
  let blocker = useBlocker(when);

  React.useEffect(() => {
    if (blocker.state === "blocked" && !when) {
      blocker.reset();
    }
  }, [blocker, when]);

  React.useEffect(() => {
    shouldBlock();
    async function shouldBlock() {
      if (blocker.state === "blocked") {
        let proceed = false;
        if (message) {
          proceed = window.confirm(message);
          if (proceed) {
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            setTimeout(blocker.proceed, 0);
          } else {
            blocker.reset();
          }
        } else {
          // proceed = await customFn();
          new Promise((resolve, reject) => {
            // @ts-ignore
            customFn(resolve, reject);
          })
            // @ts-ignore
            .then(() => blocker.proceed())
            // @ts-ignore
            .catch(() => blocker.reset());
        }
        // if (proceed) {
        //   setTimeout(blocker.proceed, 0);
        // } else {
        //   blocker.reset();
        // }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocker, message]);
}

function useBeforeUnload(doBlock?: boolean) {
  useEffect(() => {
    const blockCallback = (e: BeforeUnloadEvent) => {
      if (doBlock) {
        e.preventDefault();
        return (e.returnValue = "");
      }
    };

    // 只有开启 block 才会启用监听事件，优化性能
    if (doBlock) {
      window.addEventListener("beforeunload", blockCallback);
      return () => window.removeEventListener("beforeunload", blockCallback);
    }
  }, [doBlock]);
}
