console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

// 目标IP地址配置
const TARGET_IP = '10.96.91.8';
const TARGET_PORT = 3232; // 尝试访问的端口，可根据实际情况修改
const CHECK_INTERVAL = 5000; // 检查间隔时间(毫秒)

// 网络状态检测
let networkStatus = navigator.onLine;
let ipAccessibility = true; // 目标IP可访问性
let networkAlert = null;
let accessibilityTimer = null;

// 创建网络提示框
function createNetworkAlert(message, iconClass = 'fa-wifi-slash') {
    if (networkAlert) networkAlert.remove();
    
    networkAlert = document.createElement('div');
    networkAlert.id = 'network-alert';
    networkAlert.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        min-width: 300px;
        max-width: 600px;
        padding: 30px 50px;
        font-size: 30px;
        background-color: #ff4d4f;
        color: white;
        text-align: center;
        font-weight: bold;
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25);
        z-index: 9999;
    `;
    networkAlert.innerHTML = `<i class="fa ${iconClass}" style="font-size: 28px; margin-right: 15px;"></i>${message}`;
    
    document.body.appendChild(networkAlert);
    
    setTimeout(() => {
        networkAlert.style.opacity = 1;
        networkAlert.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
}

// 移除提示框
function removeNetworkAlert() {
    if (!networkAlert) return;
    networkAlert.style.opacity = 0;
    networkAlert.style.transform = 'translate(-50%, -50%) scale(0.8)';
    setTimeout(() => {
        networkAlert.remove();
        networkAlert = null;
    }, 400);
}

// 网络状态变化处理
function handleNetworkChange() {
    if (navigator.onLine) {
        console.log('%c网络已恢复', 'color:green;font-weight:bold');
        
        if (!networkStatus) {
            networkStatus = true;
            removeNetworkAlert();
            startAccessibilityCheck(); // 网络恢复后启动IP可访问性检查
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    } else {
        console.log('%c网络已断开', 'color:red;font-weight:bold');
        networkStatus = false;
        if (accessibilityTimer) clearInterval(accessibilityTimer); // 断网时停止检查
        createNetworkAlert('网络连接已断开，请重新连接WIFI');
    }
}

// 检查目标IP的可访问性
async function checkIpAccessibility() {
    if (!networkStatus) return false; // 网络已断开，无需检查
    
    return new Promise(resolve => {
        const socket = new WebSocket(`ws://${TARGET_IP}:${TARGET_PORT}`);
        let isReachable = false;
        
        // 设置超时
        const timeoutId = setTimeout(() => {
            socket.close();
            resolve(false);
        }, 10000); // 3秒超时
        
        socket.onopen = () => {
            isReachable = true;
            socket.close();
        };
        
        socket.onclose = () => {
            clearTimeout(timeoutId);
            resolve(isReachable);
        };
        
        socket.onerror = () => {
            clearTimeout(timeoutId);
            resolve(false);
        };
    });
}

// 启动IP可访问性检查
function startAccessibilityCheck() {
    if (accessibilityTimer) clearInterval(accessibilityTimer);
    
    accessibilityTimer = setInterval(async () => {
        const isAccessible = await checkIpAccessibility();
        
        if (!isAccessible && ipAccessibility) {
            // IP从可访问变为不可访问
            ipAccessibility = false;
            console.log(`%c无法访问目标IP: ${TARGET_IP}`, 'color:red;font-weight:bold');
            createNetworkAlert(`无法访问 ${TARGET_IP}，请检查网络连接或目标设备`, 'fa-exclamation-triangle');
        } else if (isAccessible && !ipAccessibility) {
            // IP从不可访问变为可访问
            ipAccessibility = true;
            console.log(`%c目标IP ${TARGET_IP} 已恢复访问`, 'color:green;font-weight:bold');
            removeNetworkAlert();
        }
    }, CHECK_INTERVAL);
    
    console.log(`已启动目标IP ${TARGET_IP} 可访问性检测，间隔: ${CHECK_INTERVAL/1000}秒`);
}

// 页面加载时启动检查
window.addEventListener('load', () => {
    handleNetworkChange(); // 初始检查网络状态
    if (networkStatus) startAccessibilityCheck(); // 仅在初始有网络时启动IP检查
});

// 监听网络状态变化
window.addEventListener('online', handleNetworkChange);
window.addEventListener('offline', handleNetworkChange);

// 以下是原有的链接点击处理和定时刷新逻辑
const hookClick = (e) => {
    if (!networkStatus || !ipAccessibility) return; // 网络或IP不可用时阻止链接点击
    
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

const refreshInterval = 60000; // 定时刷新间隔
let refreshTimer;

function networkAwareRefresh() {
    if (navigator.onLine && ipAccessibility) {
        console.log('准备刷新页面...');
        location.reload();
    } else {
        console.log('网络或IP不可用，取消刷新，等待恢复');
    }
}

function startRefreshTimer() {
    if (refreshTimer) clearInterval(refreshTimer);
    
    refreshTimer = setInterval(networkAwareRefresh, refreshInterval);
    console.log(`已设置定时刷新，间隔: ${refreshInterval/1000}秒`);
}

window.addEventListener('load', startRefreshTimer);
window.addEventListener('online', startRefreshTimer);
window.addEventListener('offline', () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        console.log('网络断开，暂停定时刷新');
    }
});      