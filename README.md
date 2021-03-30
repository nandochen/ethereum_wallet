# 以太坊錢包 Ethereum Wallet
## 關於 About
一個使用最基本HTML, Javascript, ethers.js 製作之以太坊錢包，協助您以最快速、簡單的方式進入以太坊應用程式領域。

A wallet application built on most basic HTML, Javascript and ethers.js, helping people to get into Ethereum development fast and easy.

## 目標 Goal
能夠瞭解並實作以下：
1) 建立一個數位資產錢包。
2) 交易、查看交易。

To understand and have hands-on ablity to:  
1) create a crypto wallet application.
2) commit transfer and check transaction.

## 安裝 Installation
下載或複製專案，解壓縮。

Download or clone the project, unzip. 

## 使用方式 Usage
開啟index.html。

Open index.html. 

## 正式/測試鏈 Live/Test Blockchain 
在lib/js/index.js 中調整參數env，homestead 為正式以太坊鏈；ropsten 為以太坊測試鏈。

Change the env parameter in lib/js/index.js, homestead for live Ethereum blockchain, ropsten for test Ethereum blockchain. 

```bash
var env = 'ropsten'; // homestead - 正式 Live; ropsten - 測試 test 
```
