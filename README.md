# 以太坊錢包 Ethereum Wallet
## 關於 About
一個使用最基本HTML, Javascript, ethers.js 製作之以太坊錢包，協助您以最快速、簡單的方式進入以太坊應用程式領域。

A wallet application built on most basic HTML, Javascript and ethers.js, helping people to get into Ethereum development fast and easy.

## 目標 Goal
能夠瞭解並實作以下：
1) 建立一個數位資產錢包。
2) 交易、查看交易。

To understand and have hands-on ability to:  
1) create a crypto wallet application.
2) commit transfer and check transaction.

## EtherScan API 金鑰 KEY
您可以參考以下資訊取得EtherScan API 金鑰: 

Get your EtherScan API KEY: 

https://etherscan.io/apis

## IDE 
VisualStudio Code

https://code.visualstudio.com/download

## 測試以太 Test ETH
您可以在以下服務取得測試以太：

You can get test ETH from: 

1) https://faucet.ropsten.be/
2) https://faucet.dimensions.network/

## 測試USDT Test USDT
測試用USDT 將於課程中發放，您也可以聯絡我們取得。

Testing USDT will be issued during course, you can also contact us to obtain some testing USDT.

## 安裝 Installation
下載或複製專案，解壓縮。

Download or clone the project, unzip. 

## 檔案結構 File Structure
<pre><code>
.
├── index.html                          # 以太錢包 Ethereum Wallet
├── course.html                         # 課程檔 Course File
├── lib                                 # 引用資源 Resources
│   ├── js                              # Javascript 
│   └── css                             # CSS 
└── ethereum_wallet.code-workspace      # VisualStudio Code 專案 Project
</code></pre>

## 使用方式 Usage
使用瀏覽器開啟index.html。

Open index.html in browser. 

## 正式/測試鏈 Live/Test Blockchain 
在lib/js/index.js 中調整參數env，homestead 為正式以太坊鏈；ropsten 為以太坊測試鏈。

Change the env parameter in lib/js/index.js, homestead for live Ethereum blockchain, ropsten for test Ethereum blockchain. 

```bash
var env = 'ropsten'; // homestead - 正式 Live; ropsten - 測試 test 
```
