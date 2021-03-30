/**
 * 
 */

// 參數: 開始 
var myAddress = '0x24B7ABB3f771CCf88024Da62120795ef3bd1B87A';                       // 錢包地址
var myPK = '0x05c1ba034282dcfb3350807b1dc41fe4edd073583b00138e17b7633b7bbdcbb9';    // 私鑰，正式環境請勿暴露此資訊!!
var env = 'ropsten';                                                                // Live: homestead / Test: ropsten
var views = '#viewWallet,#viewTransfer,#viewList,#viewDetail,#viewAbout,#viewInit'; // 畫面清單
// 參數: 結束

// 畫面流程: 開始
$(document).ready(function(){
    // 檢查是否有設定錢包地址與私鑰 
    if (myAddress !== ''
    && myPK !== '') {
        // 已設定切換到錢包畫面
        swapView('#viewWallet', null);
    } else {
        // 未設定則轉往初始設定畫面
        swapView('#viewInit', function(){ 
            ETHNewWallet();
        });
    }
});
// 畫面流程: 結束

// 以太坊功能: 開始 
/**
 * 產生新錢包, 並設定在畫面欄位上
 */
function ETHNewWallet(){
    var newWallet = ethers.Wallet.createRandom();
    $('#lbAddressInit').html(newWallet.address);
    $('#lbPKInit').html(newWallet.privateKey);
    // 傾倒出newWallet 物件
    // console.log(newWallet);
}

// 以太坊功能: 結束

// 客制功能: 開始 
/**
 * 切換畫面
 * @param {string} _view 
 * @param {function} _callback 
 */
function swapView(_view, _callback) { 
    $(views).hide();
    $(_view).removeClass('d-none').fadeIn();
    // 執行回覆功能
    if (_callback !== null) {
        var cb = eval(_callback);
        cb();
    }
}
// 客制功能: 結束