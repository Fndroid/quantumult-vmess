import React, { useState } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import './App.css';

function InputView(props) {
  return (
    <textarea 
      className="main-item input-view" 
      rows="5"
      value={props.content} 
      onChange={props.onChange} 
      placeholder="输入 vmess 链接，多个链接使用换行隔开"></textarea>
  )
}

function MethodSelector(props) {
  let items = props.items.map((i) => {
    return (
      <div key={i}>
        <input type="radio" id={i} value={i} name={i} checked={props.current === i} onChange={props.onChange}></input>
        <label htmlFor={i}>{i}</label>
      </div>
    )
  })
  return (
    <div className="main-item method-selector ">
      {items}
    </div>
  )
}

function OutputView(props) {
  let links = props.content.map(l => {
    return (
      <div className="output-item" key={l}>{l}</div>
    )
  })
  return (
    <div className="main-item output-view">
      {links}
    </div>
  )
}

function CopyBtn(props) {
  return (
    <CopyToClipboard   text={props.text} onCopy={props.onCopy}>
      <span className="copy-btn">打开 Quantumlt 并通过 URI 导入</span>
    </CopyToClipboard>
  )
}

function App() {
  const [content, setContent] = useState("")
  const [method, setMethod] = useState("none")
  const [group, setGroup] = useState("Fndroid")

  const avaliableMethods = ['none', 'aes-128-cfb', 'aes-128-gcm', 'chacha20-ietf-poly1305']

  let handleInputChange = (e) => {
    setContent(e.target.value)
  }

  let handleMethodChange = (e) => {
    setMethod(e.target.value)
  }

  let handleCopySuccess = (e) => {
    window.location.href = 'quantumult://'
  }

  let computeText = () => {
    return convert(content, method, group).map(l => `vmess://${urlsafeBase64Encode(l)}`).join('\n')
  }

  return (
    <div className="App">
      <InputView content={content} onChange={handleInputChange}></InputView>
      <MethodSelector
        items={avaliableMethods}
        current={method}
        onChange={handleMethodChange}></MethodSelector>
      <OutputView content={convert(content, method, group)}></OutputView>
      <CopyBtn text={computeText()} onCopy={handleCopySuccess}></CopyBtn>
    </div>
  );
}

function convert(content, method, group) {
  return content.split('\n').map(i => decodeVmess(i, method, group)).filter(i => i)
}

function decodeVmess(link, method, group) {
  if (/^vmess:\/\/(.*?)$/.test(link)) {
    let content = urlsafeBase64Decode(RegExp.$1)
    if (isJson(content)) {
      // v2rayN style
      let jsonConf = JSON.parse(content)
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A5366a'
      let obfs = `,obfs=${jsonConf.net === 'ws' ? 'ws' : 'http'},obfs-path="${jsonConf.path || '/'}",obfs-header="Host:${jsonConf.host || jsonConf.add}[Rr][Nn]User-Agent:${ua}"`
      let quanVmess = `${jsonConf.ps} = vmess,${jsonConf.add},${jsonConf.port},${method},"${jsonConf.id}",over-tls=${jsonConf.tls === 'tls' ? 'true' : 'false'},certificate=1${jsonConf.type === 'none' && jsonConf.net !== 'ws' ? '' : obfs},group=${group}`
      return quanVmess
    } else {
      // Quantumult style
      return ""
    }
  }
}

function isJson(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

function urlsafeBase64Decode(base64) {
  // Add removed at end '='
  base64 += Array(5 - base64.length % 4).join('=');
  base64 = base64
    .replace(/-/g, '+') // Convert '-' to '+'
    .replace(/_/g, '/'); // Convert '_' to '/'
  return new Buffer(base64, "base64").toString();
}

function urlsafeBase64Encode(url) {
  return new Buffer(url).toString("base64").replace(/-/g, '+').replace(/\\/g, '_').replace(/=+$/, '')
}


export default App;
