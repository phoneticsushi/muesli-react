(this.webpackJsonpmuesli=this.webpackJsonpmuesli||[]).push([[0],{103:function(e,n,t){},104:function(e,n,t){},114:function(e,n,t){"use strict";t.r(n);var o=t(0),r=t.n(o),c=t(31),a=t.n(c),i=(t(103),t(79)),u=t(162),l=t(156),s=(t(104),t(63)),d=t.n(s),f=t(16),j=t(12),b=t(73),h=t(164),p=t(158),v=t(157),O=t(165),g=t(161),m=t(160),x=t(64),y=t(163),k=t(2);var w=function(e){return Object(k.jsx)(y.a,Object(x.a)(Object(x.a)({color:e.enabled?"error":"success"},e),{},{children:e.enabled?e.disableText||"Disable":e.enableText||"Enable"}))},C=t(76),S=t.n(C),A=t(26);var P=function(e){var n,t=Object(A.a)(),r=Object(o.useRef)(),c=Object(o.useRef)();function a(){var e;null===(e=c.current)||void 0===e||e.play()}return Object(o.useEffect)((function(){return c.current=S.a.create({container:r.current,responsive:!0}),function(){c.current.destroy(),c.current=null}}),[]),Object(o.useEffect)((function(){var e,n;null===(e=c.current)||void 0===e||e.setWaveColor(t.palette.primary.dark),null===(n=c.current)||void 0===n||n.setProgressColor(t.palette.secondary.dark)}),[t.palette.primary.dark,t.palette.secondary.dark]),Object(o.useEffect)((function(){var n,t;e.autoplay?null===(n=c.current)||void 0===n||n.on("ready",a):null===(t=c.current)||void 0===t||t.un("ready")}),[e.autoplay]),Object(o.useEffect)((function(){var n,t;e.audioPath?null===(n=c.current)||void 0===n||n.load(e.audioPath):null===(t=c.current)||void 0===t||t.empty()}),[e.audioPath]),Object(o.useEffect)((function(){var n,t;e.loop?null===(n=c.current)||void 0===n||n.on("finish",a):null===(t=c.current)||void 0===t||t.un("finish")}),[e.loop]),Object(k.jsxs)(h.a,{children:[Object(k.jsxs)("h2",{children:["AudioDisplay WIP: ",e.name||"No Name"]}),Object(k.jsxs)("p",{children:["Audio Path: ",e.audioPath]}),Object(k.jsxs)("p",{children:["Audio Duration: ",1e3*(null===(n=c.current)||void 0===n?void 0:n.getDuration()),"ms"]}),Object(k.jsx)("div",{ref:r}),Object(k.jsx)(y.a,{onClick:a,children:"Play Audio"}),Object(k.jsx)(y.a,{onClick:function(){var e;null===(e=c.current)||void 0===e||e.pause()},children:"Pause Audio"})]})},D=t(80),R=t(77),E=t.n(R);function T(){return(T=Object(b.a)(d.a.mark((function e(){var n;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("Open Microphone"),e.next=3,navigator.mediaDevices.getUserMedia({audio:!0,video:!1});case 3:return n=e.sent,e.abrupt("return",n);case 5:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function F(e,n,t,o){var r=arguments.length>4&&void 0!==arguments[4]?arguments[4]:function(e){},c=arguments.length>5&&void 0!==arguments[5]?arguments[5]:function(e){},a=arguments.length>6&&void 0!==arguments[6]?arguments[6]:function(e){},i=new AnalyserNode(e,{minDecibels:o});n.connect(i);var u=!1;n.onended=function(){console.log("Silence Node Closed"),u=!0};var l=new Uint8Array(i.frequencyBinCount),s=performance.now(),d=!1;function f(e){if(u)return console.log("yes we have no bananas"),void a();requestAnimationFrame(f),i.getByteFrequencyData(l),l.some((function(e){return e}))&&(d||(r(),d=!0,console.log("Audio Started")),s=e),d&&e-s>t&&(c(),d=!1,console.log("Audio Stopped"))}f()}var M=function(e){var n=Object(o.useRef)(),t=Object(o.useState)(),r=Object(j.a)(t,2),c=r[0],a=r[1],i=Object(o.useState)("First Load"),u=Object(j.a)(i,2),l=u[0],s=u[1];Object(D.a)("r",(function(e){e.altKey&&C()}));var d=Object(o.useState)([]),b=Object(j.a)(d,2),x=b[0],y=b[1];function C(){c?(!function(e){console.log("Release Microphone",e),e.current.getTracks().forEach((function(e){return e.stop()})),e.current=null}(n),a(!1),s("Recording is Off")):(function(){return T.apply(this,arguments)}().then((function(e){n.current=e,function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:2e3,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:500,o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1e3,r=100,c=(n-2*t)/r,a=o/r,i=new AudioContext,u=i.createMediaStreamSource(e.current),l=new DelayNode(i,{delayTime:t/1e3,maxDelayTime:t/1e3}),d=i.createMediaStreamDestination();u.connect(l).connect(d);var j=new MediaRecorder(d.stream),b=[];function h(){s("RECORDING with chunk size ".concat(r)),j.start(r)}function p(){s("Waiting for audio..."),j.stop()}j.ondataavailable=function(e){b.push(e.data)},j.onstop=function(e){if(b.length<=a)console.log("Skipping Audio conversion as number of chunks",b.length,"<=",a);else{console.log("Converting Audio as number of chunks",b.length,">",a,"- trimming",c);var n=new Blob(b.slice(0,b.length-c),{type:"audio/ogg; codecs=opus"}),t={name:E()({exactly:1,wordsPerString:2,separator:"-"})[0],url:window.URL.createObjectURL(n)};console.log("Generated clip",t),y((function(e){return[t].concat(Object(f.a)(e))}))}b=[]},F(i,u,n,-60,(function(e){return h()}),(function(e){return p()}),(function(e){}))}(n)})),a(!0))}var S=Object(o.useState)(!1),A=Object(j.a)(S,2),R=A[0],M=A[1],B=Object(o.useState)(!1),L=Object(j.a)(B,2),N=L[0],I=L[1];return Object(k.jsxs)(h.a,{children:[Object(k.jsx)("h2",{children:'Dictaphone WIP "Effervescence"'}),Object(k.jsx)(p.a,{title:"Toggle with Alt-R",arrow:!0,children:Object(k.jsx)(w,{enabled:c,enableText:"Start Recording",disableText:"Stop Recording",onClick:C})}),Object(k.jsx)(v.a,{label:"Custom Audio File Path",placeholder:"Hello hello",onChange:function(e){return y([{url:e.target.value}])}}),l,Object(k.jsxs)(O.a,{children:[Object(k.jsx)(g.a,{control:Object(k.jsx)(m.a,{onChange:function(e){return M(e.target.checked)}}),label:"Loop"}),Object(k.jsx)(g.a,{control:Object(k.jsx)(m.a,{onChange:function(e){return I(e.target.checked)}}),label:"Autoplay"})]}),x.map((function(e){return Object(k.jsx)(P,{name:e.name,audioPath:e.url,autoplay:N,loop:R},e.url)}))]})};var B=function(){var e=Object(i.a)({palette:{mode:"dark"},components:{MuiButton:{defaultProps:{variant:"outlined"}}}});return Object(k.jsxs)(u.a,{theme:e,children:[Object(k.jsx)(l.a,{}),Object(k.jsx)(M,{})]})},L=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,166)).then((function(n){var t=n.getCLS,o=n.getFID,r=n.getFCP,c=n.getLCP,a=n.getTTFB;t(e),o(e),r(e),c(e),a(e)}))};a.a.render(Object(k.jsx)(r.a.StrictMode,{children:Object(k.jsx)(B,{})}),document.getElementById("root")),L()}},[[114,1,2]]]);
//# sourceMappingURL=main.9bdf5f4b.chunk.js.map