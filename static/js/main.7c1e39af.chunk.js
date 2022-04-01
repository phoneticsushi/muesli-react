(this.webpackJsonpmuesli=this.webpackJsonpmuesli||[]).push([[0],{100:function(e,n,t){},105:function(e,n,t){"use strict";t.r(n);var a=t(0),r=t.n(a),c=t(29),i=t.n(c),o=(t(100),t(75)),l=t(155),u=t(148),s=(t(65),t(14)),d=t(12),b=t(156),j=t(154),g=t(147),h=t(150),f=t(157),p=t(149),m=t(158),O=t(160),v=t(161),x=t(152),y=t(42),V=t(47),S=t(153),w=t(2),C=["enabled","enableText","disableText"];var P=function(e){e.enabled,e.enableText,e.disableText;var n=Object(V.a)(e,C);return Object(w.jsx)(S.a,Object(y.a)(Object(y.a)({color:e.enabled?"error":"success"},n),{},{children:e.enabled?e.disableText||"Disable":e.enableText||"Enable"}))},k=t(72),A=t.n(k),R=t(22);var T,D=function(e){var n,t=Object(R.a)(),r=Object(a.useRef)(),c=Object(a.useRef)();function i(){var e;null===(e=c.current)||void 0===e||e.play()}return Object(a.useEffect)((function(){return c.current=A.a.create({container:r.current,responsive:!0}),function(){c.current.destroy(),c.current=null}}),[]),Object(a.useEffect)((function(){var e,n;null===(e=c.current)||void 0===e||e.setWaveColor(t.palette.primary.dark),null===(n=c.current)||void 0===n||n.setProgressColor(t.palette.secondary.dark)}),[t.palette.primary.dark,t.palette.secondary.dark]),Object(a.useEffect)((function(){var n,t;e.autoplay?null===(n=c.current)||void 0===n||n.on("ready",i):null===(t=c.current)||void 0===t||t.un("ready")}),[e.autoplay]),Object(a.useEffect)((function(){var n,t;e.audioPath?null===(n=c.current)||void 0===n||n.load(e.audioPath):null===(t=c.current)||void 0===t||t.empty()}),[e.audioPath]),Object(a.useEffect)((function(){var n,t;e.loop?null===(n=c.current)||void 0===n||n.on("finish",i):null===(t=c.current)||void 0===t||t.un("finish")}),[e.loop]),Object(w.jsxs)(b.a,{children:[Object(w.jsxs)("h2",{children:["AudioDisplay WIP: ",e.name||"No Name"]}),Object(w.jsxs)("p",{children:["Audio Path: ",e.audioPath]}),Object(w.jsxs)("p",{children:["Audio Duration: ",1e3*(null===(n=c.current)||void 0===n?void 0:n.getDuration()),"ms"]}),Object(w.jsx)("div",{ref:r}),Object(w.jsx)(S.a,{onClick:i,children:"Play Audio"}),Object(w.jsx)(S.a,{onClick:function(){var e;null===(e=c.current)||void 0===e||e.pause()},children:"Pause Audio"})]})},U=t(76),W=t(73),M=t.n(W);function E(e,n,t){t||(t=e.reduce((function(e,n){return e+n.length}),0));var a=function(e,n){var t=new ArrayBuffer(44+2*e.length),a=new DataView(t);return F(a,0,"RIFF"),a.setUint32(4,32+2*e.length,!0),F(a,8,"WAVE"),F(a,12,"fmt "),a.setUint32(16,16,!0),a.setUint16(20,1,!0),a.setUint16(22,1,!0),a.setUint32(24,n,!0),a.setUint32(28,2*n,!0),a.setUint16(32,2,!0),a.setUint16(34,16,!0),F(a,36,"data"),a.setUint32(40,2*e.length,!0),function(e,n,t){for(var a=0;a<t.length;a++,n+=2){var r=Math.max(-1,Math.min(1,t[a]));e.setInt16(n,r<0?32768*r:32767*r,!0)}}(a,44,e),a}(function(e,n){for(var t=new Float32Array(n),a=0,r=0;r<e.length;r++)t.set(e[r],a),a+=e[r].length;return t}(e,t),n);return new Blob([a],{type:"audio/wav"})}function F(e,n,t){for(var a=0;a<t.length;a++)e.setUint8(n+a,t.charCodeAt(a))}!function(e){e.OpeningPadding="OpeningPadding",e.Waiting="Waiting",e.Recording="Recording"}(T||(T={}));var I=function(e,n,t,a,r,c){var i=arguments.length>6&&void 0!==arguments[6]?arguments[6]:-60,o=arguments.length>7&&void 0!==arguments[7]?arguments[7]:500;if(r<=o)throw new Error("Silence detection period must be greater than padding period");var l=new AudioContext,u=l.createMediaStreamSource(e),s=new AnalyserNode(l,{minDecibels:i}),d=new Uint8Array(s.frequencyBinCount),b=[],j=T.OpeningPadding,g=null;l.audioWorklet.addModule("/muesli-react/DummyWorkletProcessor.js").then((function(e){var n=new AudioWorkletNode(l,"dummy-worklet-processor");n.port.onmessage=function(e){y(e.data[0][0])},u.connect(s).connect(n)}),(function(e){throw Error("Failed to resolve Promise loading DummyWorkletProcessor!")})),console.log("Source Sample Rate: ",l.sampleRate);var h=128,f=l.sampleRate/1e3,p=h/f;console.log("Chunk Size Ms: ",p);var m=o/p;function O(){var e=performance.now();if(s.getByteFrequencyData(d),j!==T.OpeningPadding){if(d.some((function(e){return e}))&&(g=e,j===T.Waiting&&console.log("Detected Audio"),j=T.Recording),null===g)t(0);else{var a=e-g;t(Math.max(0,r-a)),j===T.Recording&&a>r&&(console.log("Detected Silence"),v(a-o),x(),j=T.Waiting)}var c=d.reduce((function(e,n){return e+n}))/d.length;n(c)}else console.log("Skipping silence detection while waiting for padding")}function v(e){var n=e/p;console.log("Converting Audio:",b.length,"chunks available, trmming",n);var t=E(b.slice(0,b.length-n),l.sampleRate),r={name:M()({exactly:1,wordsPerString:2,separator:"-"})[0],url:window.URL.createObjectURL(t)};console.log("Generated clip",r),a(r)}function x(){b=b.slice(b.length-m,b.length)}function y(e){b.push(e),b.length>m&&(j!==T.OpeningPadding&&j!==T.Waiting||(b.shift(),j=T.Waiting))}function V(){console.log("Recorder has been stopped; publishing final clip...");var t=(c+o)/p;if(null===g)console.log("Skipping final clip publish as silence has never been detected");else if(b.length<=t)console.log("Skipping final clip publish as number of chunks",b.length,"<=",t);else{v(performance.now()-g-o)}l.close(),e.getTracks().forEach((function(e){return e.stop()})),n(void 0)}console.log("Starting Recorder...");var S=setInterval(O,100);return function(){clearInterval(S),V(),console.log("Ran cleanup function for recording routine")}},N=["minValue","maxValue","onChange"];var B=function(e){var n=Object(a.useState)(!1),t=Object(d.a)(n,2),r=t[0],c=t[1];e.minValue,e.maxValue,e.onChange;var i=Object(V.a)(e,N);return Object(w.jsx)(p.a,Object(y.a)({error:r,onChange:function(n){return function(n){var t=Number(n.target.value);!n.target.value.trim()||isNaN(t)||e.minValue&&t<e.minValue||e.maxValue&&t>e.maxValue?c(!0):(c(!1),e.onChange&&e.onChange(t))}(n)},helperText:r?e.minValue&&e.maxValue?"Value must be a number between ".concat(e.minValue," and ").concat(e.maxValue):e.minValue?"Value must be a number at least ".concat(e.minValue):e.maxValue?"Value must be a number at most ".concat(e.maxValue):"Value must be a number":void 0},i))};var L=function(e){var n=Object(a.useRef)(),t=Object(a.useState)(),r=Object(d.a)(t,2),c=r[0],i=r[1],o=Object(a.useState)(),l=Object(d.a)(o,2),u=l[0],y=l[1],V=Object(a.useState)(),S=Object(d.a)(V,2),C=S[0],k=S[1],A=Object(a.useState)(1e3),R=Object(d.a)(A,2),T=R[0],W=R[1],M=Object(a.useState)(3e3),E=Object(d.a)(M,2),F=E[0],N=E[1];Object(U.a)("r",(function(e){e.altKey&&G()}));var L=Object(a.useState)([]),q=Object(d.a)(L,2),J=q[0],z=q[1];function G(){c?(n.current(),n.current=null,i(!1),y(0)):(navigator.mediaDevices.getUserMedia({audio:!0,video:!1}).then((function(e){n.current=I(e,k,y,H,F,T)})),i(!0))}function H(e){z((function(n){return[e].concat(Object(s.a)(n))}))}var K=Object(a.useState)(!1),Q=Object(d.a)(K,2),X=Q[0],Y=Q[1],Z=Object(a.useState)(!1),$=Object(d.a)(Z,2),_=$[0],ee=$[1];return Object(w.jsxs)(b.a,{className:"App",children:[Object(w.jsx)("h2",{children:"Muesli Practice Helper"}),Object(w.jsxs)(j.a,{container:!0,spacing:2,children:[Object(w.jsx)(j.a,{item:!0,id:"controls",xs:5,sm:4,md:3,lg:2,children:Object(w.jsxs)(g.a,{spacing:2,children:[Object(w.jsx)(h.a,{title:"Toggle with Alt-R",arrow:!0,children:Object(w.jsx)(P,{enabled:c,enableText:"Start Recording",disableText:"Stop Recording",onClick:G})}),Object(w.jsxs)("p",{children:["Mic Open: ",String(c)]}),Object(w.jsxs)("p",{children:["Average Volume: ",String(C)]}),Object(w.jsxs)("p",{children:["Time until Clip: ",String(Math.floor(u/100)/10)," seconds"]}),Object(w.jsx)(f.a,{variant:"determinate",value:u/F*100}),Object(w.jsx)(p.a,{label:"Custom Audio File Path",placeholder:"(debug only)",onChange:function(e){return z([{url:e.target.value}])}}),Object(w.jsx)(B,{disabled:c,label:"Cut clip when silent for",placeholder:"Time...",InputProps:{endAdornment:Object(w.jsx)(m.a,{position:"end",children:"s"})},defaultValue:F/1e3,minValue:1,maxValue:15,onChange:function(e){return N(1e3*e)}}),Object(w.jsx)(B,{disabled:c,label:"Discard clips shorter than",placeholder:"Time...",InputProps:{endAdornment:Object(w.jsx)(m.a,{position:"end",children:"s"})},defaultValue:T/1e3,minValue:0,maxValue:5,onChange:function(e){return W(1e3*e)}}),Object(w.jsxs)(O.a,{children:[Object(w.jsx)(v.a,{control:Object(w.jsx)(x.a,{onChange:function(e){return Y(e.target.checked)}}),label:"Loop"}),Object(w.jsx)(v.a,{control:Object(w.jsx)(x.a,{onChange:function(e){return ee(e.target.checked)}}),label:"Autoplay"})]})]})}),Object(w.jsx)(j.a,{item:!0,id:"clips",xs:7,sm:8,md:9,lg:10,children:Object(w.jsx)(g.a,{spacing:2,children:J.map((function(e){return Object(w.jsx)(D,{name:e.name,audioPath:e.url,autoplay:_,loop:X},e.url)}))})})]})]})};var q=function(){var e=Object(o.a)({palette:{mode:"dark",background:{default:"#10051a"}},components:{MuiButton:{defaultProps:{variant:"outlined"}}}});return Object(w.jsxs)(l.a,{theme:e,children:[Object(w.jsx)(u.a,{}),Object(w.jsx)(L,{})]})},J=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,162)).then((function(n){var t=n.getCLS,a=n.getFID,r=n.getFCP,c=n.getLCP,i=n.getTTFB;t(e),a(e),r(e),c(e),i(e)}))};i.a.render(Object(w.jsx)(r.a.StrictMode,{children:Object(w.jsx)(q,{})}),document.getElementById("root")),J()},65:function(e,n,t){}},[[105,1,2]]]);
//# sourceMappingURL=main.7c1e39af.chunk.js.map