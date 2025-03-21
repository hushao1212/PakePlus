console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

document.addEventListener('click', hookClick, { capture: true })
// 定义刷新间隔时间，这里设置为 5000 毫秒（即 5 秒）
const refreshInterval = 60000;

// 使用 setTimeout 函数来设置定时刷新
setTimeout(() => {
    // 刷新当前页面
    location.reload();
}, refreshInterval);
// 用于存储已经打开的窗口
const openedWindows = {};

function openUniqueWindow(url, windowName) {
    // 检查该窗口是否已经打开
    if (openedWindows[windowName] &&!openedWindows[windowName].closed) {
        // 如果已经打开且未关闭，则将其聚焦
        openedWindows[windowName].focus();
    } else {
        // 打开新窗口
        const newWindow = window.open(url, windowName);
        if (newWindow) {
            // 存储新打开的窗口
            openedWindows[windowName] = newWindow;
        }
    }
}

