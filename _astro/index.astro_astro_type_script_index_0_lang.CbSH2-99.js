var e=document.documentElement,t=window.matchMedia(`(prefers-reduced-motion: reduce)`),n=null;function r(){let e=[...document.querySelectorAll(`.n3-revela:not(.is-visible)`)],t=window.innerHeight;for(let n of e)n.getBoundingClientRect().top<t*.92&&n.classList.add(`is-visible`);n=new IntersectionObserver(e=>{for(let t of e)t.isIntersecting&&(t.target.classList.add(`is-visible`),n?.unobserve(t.target))},{rootMargin:`0px 0px -8% 0px`,threshold:.08});for(let t of e)t.classList.contains(`is-visible`)||n.observe(t)}function i(){n?.disconnect(),n=null;for(let e of document.querySelectorAll(`.n3-revela`))e.classList.add(`is-visible`)}function a(){e.dataset.n3Motion=`on`,r()}function o(){delete e.dataset.n3Motion,i()}t.matches||a(),t.addEventListener(`change`,e=>{e.matches?o():a()});var s=e=>{let t=Number.parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]},c={ramo:{colors:[s(`#0b3f9e`),s(`#2f7bff`),s(`#9cc6ff`),s(`#ffffff`)],ground:[s(`#f3f7ff`),s(`#dbe8fd`)],shape:0,seed:1.37},material:{colors:[s(`#b9301f`),s(`#ff6a4a`),s(`#ffc3ad`),s(`#fff7f2`)],ground:[s(`#fff6f2`),s(`#fde2d8`)],shape:1,seed:4.11},fuente:{colors:[s(`#0f7a43`),s(`#3fbf6f`),s(`#ffd36b`),s(`#fffbea`)],ground:[s(`#f7fbf1`),s(`#e5f2dc`)],shape:2,seed:7.73}},l=`
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,u=`
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uSeed;
uniform float uShape;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uLight;
uniform vec3 uShine;
uniform vec3 uGroundTop;
uniform vec3 uGroundBottom;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 turn = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = turn * p;
    amplitude *= 0.5;
  }
  return value;
}

vec2 rotate(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float roundBox(vec2 p, vec2 size, float radius) {
  vec2 q = abs(p) - size + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

// Gradiente unitario exacto de roundBox, en el marco de la caja. Analítico a
// propósito: no depende de derivadas de pantalla ni normaliza vectores casi nulos.
vec2 roundBoxGradient(vec2 p, vec2 size, float radius) {
  vec2 q = abs(p) - size + radius;
  vec2 side = vec2(p.x < 0.0 ? -1.0 : 1.0, p.y < 0.0 ? -1.0 : 1.0);
  vec2 outside = max(q, 0.0);
  float len = length(outside);
  if (len > 1e-5) return side * outside / len;
  return q.x > q.y ? vec2(side.x, 0.0) : vec2(0.0, side.y);
}

/* ---------- Siluetas: distancia con signo y normal ---------- */

// Tubo a lo largo de una onda, en un marco girado.
float tube(vec2 p, out vec3 normal) {
  float angle = -0.62;
  vec2 q = rotate(p, -angle);
  float k = 2.4;
  float phase = 0.5;
  float amp = 0.2;
  float f = amp * sin(k * q.x + phase);
  float df = amp * k * cos(k * q.x + phase);
  float inv = inversesqrt(1.0 + df * df);
  float r = (q.y - f) * inv;
  float radius = 0.145 + 0.025 * sin(q.x * 1.9 + 0.8);
  float s = clamp(r / radius, -1.0, 1.0);
  vec2 across = rotate(vec2(-df, 1.0) * inv, angle);
  normal = normalize(vec3(across * s, sqrt(max(1.0 - s * s, 0.0))));
  return abs(r) - radius;
}

// Anillo de sección redonda, apenas achatado para leerse en perspectiva.
float ring(vec2 p, out vec3 normal) {
  vec2 v = (p - vec2(0.02, 0.01)) * vec2(1.0, 1.12);
  float len = max(length(v), 1e-4);
  vec2 outward = v / len;
  float r = len - 0.27;
  float radius = 0.115;
  float s = clamp(r / radius, -1.0, 1.0);
  normal = normalize(vec3(outward * s, sqrt(max(1.0 - s * s, 0.0))));
  return abs(r) - radius;
}

// Hoja biselada: canto redondo de ancho fijo y cara apenas curvada.
float sheet(vec2 p, vec2 center, float angle, out vec3 normal) {
  vec2 q = rotate(p - center, -angle);
  vec2 size = vec2(0.25, 0.31);
  float d = roundBox(q, size, 0.045);
  vec2 grad = rotate(roundBoxGradient(q, size, 0.045), angle);
  float bevel = 0.034;
  float u = clamp(-d / bevel, 0.0, 1.0);
  float slope = (1.0 - u) * (1.0 - u) * 2.6;
  vec2 bend = rotate(vec2(q.x * 0.35, -q.y * 0.18), angle);
  normal = normalize(vec3(grad * slope + bend, 1.0));
  return d;
}

/* ---------- Luz ---------- */

vec3 shadeSurface(vec3 normal, vec2 p, float t, float tint) {
  float lightAngle = 2.2 + 0.32 * sin(t * 0.21);
  vec3 light = normalize(vec3(cos(lightAngle), sin(lightAngle), 0.95));
  float wrap = clamp((dot(normal, light) + 0.35) / 1.35, 0.0, 1.0);
  vec3 halfway = normalize(light + vec3(0.0, 0.0, 1.0));
  float specular = pow(max(dot(normal, halfway), 0.0), 70.0);
  // normalize() puede dejar z en 1 + ε: sin clamp, pow() recibiría una base
  // negativa (indefinido en GLSL) y el NaN contaminaría el mix del fondo aunque
  // la cobertura sea 0. Se acota y se eleva al cuadrado multiplicando.
  float rim = 1.0 - clamp(normal.z, 0.0, 1.0);
  float edge = rim * rim;

  // El color fluye dentro de la silueta; la forma no se mueve.
  float body = fbm(p * 2.1 + vec2(t * 0.17, -t * 0.11) + uSeed);
  float glow = fbm(p * 1.3 - vec2(t * 0.09, t * 0.15) + uSeed * 2.3);
  vec3 albedo = mix(uDeep, uMid, smoothstep(0.28, 0.68, body + tint));
  albedo = mix(albedo, uLight, smoothstep(0.58, 0.86, glow + tint * 0.5));

  vec3 color = albedo * (0.36 + 0.78 * wrap);
  color *= 1.0 - 0.42 * edge;
  color += uLight * edge * 0.12 * (1.0 - wrap);
  color += uShine * specular * 0.62;
  return color;
}

float coverage(float d) {
  float aa = max(fwidth(d), 1e-4);
  return 1.0 - smoothstep(-aa, aa, d);
}

float castShadow(float d) {
  return 0.2 * exp(-max(d, 0.0) * 16.0);
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  // Una lámina angosta aleja la cámara en vez de cortar el objeto.
  p *= max(1.0, 0.86 / aspect);
  float t = uTime;
  vec2 shadowOffset = vec2(0.035, -0.05);

  vec3 color = mix(uGroundBottom, uGroundTop, smoothstep(-0.1, 1.0, vUv.y));
  color *= 1.0 - 0.06 * length(vUv - vec2(0.5, 0.55));

  vec3 normal;
  if (uShape < 0.5) {
    vec3 ignored;
    color *= 1.0 - castShadow(tube(p - shadowOffset, ignored));
    float d = tube(p, normal);
    color = mix(color, shadeSurface(normal, p, t, 0.0), coverage(d));
  } else if (uShape < 1.5) {
    vec2 c0 = vec2(0.13, 0.11);
    vec2 c1 = vec2(0.02, 0.02);
    vec2 c2 = vec2(-0.09, -0.08);
    vec3 n0;
    vec3 n1;
    vec3 n2;
    vec3 ignored;
    float d0 = sheet(p, c0, 0.24, n0);
    float d1 = sheet(p, c1, 0.07, n1);
    float d2 = sheet(p, c2, -0.1, n2);
    color *= 1.0 - castShadow(sheet(p - shadowOffset, c0, 0.24, ignored));
    color = mix(color, shadeSurface(n0, p, t, -0.18), coverage(d0));
    color *= 1.0 - castShadow(sheet(p - shadowOffset, c1, 0.07, ignored));
    color = mix(color, shadeSurface(n1, p, t, -0.06), coverage(d1));
    color *= 1.0 - castShadow(sheet(p - shadowOffset, c2, -0.1, ignored));
    color = mix(color, shadeSurface(n2, p, t, 0.06), coverage(d2));
  } else {
    vec3 ignored;
    color *= 1.0 - castShadow(ring(p - shadowOffset, ignored));
    float d = ring(p, normal);
    color = mix(color, shadeSurface(normal, p, t, 0.0), coverage(d));
  }

  // Grano fijo por píxel físico.
  color += (hash(gl_FragCoord.xy + uSeed * 13.0) - 0.5) * 0.028;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`,d=2;function f(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.warn(`N3: no compiló el material`,e.getShaderInfoLog(r)),e.deleteShader(r),null)):null}function p(e,t){let n=e.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,powerPreference:`low-power`});if(!n||!n.getExtension(`OES_standard_derivatives`))return null;let r=f(n,n.VERTEX_SHADER,l),i=f(n,n.FRAGMENT_SHADER,u),a=n.createProgram();if(!r||!i||!a)return null;if(n.attachShader(a,r),n.attachShader(a,i),n.linkProgram(a),!n.getProgramParameter(a,n.LINK_STATUS))return console.warn(`N3: no enlazó el material`,n.getProgramInfoLog(a)),null;n.useProgram(a);let o=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,o),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),n.STATIC_DRAW);let s=n.getAttribLocation(a,`aPosition`);n.enableVertexAttribArray(s),n.vertexAttribPointer(s,2,n.FLOAT,!1,0,0);let p=e=>n.getUniformLocation(a,e),m=p(`uResolution`),h=p(`uTime`),g=c[t];n.uniform1f(p(`uSeed`),g.seed),n.uniform1f(p(`uShape`),g.shape);let[_,v,y,b]=g.colors;n.uniform3fv(p(`uDeep`),_),n.uniform3fv(p(`uMid`),v),n.uniform3fv(p(`uLight`),y),n.uniform3fv(p(`uShine`),b),n.uniform3fv(p(`uGroundTop`),g.ground[0]),n.uniform3fv(p(`uGroundBottom`),g.ground[1]);let x=0,S=0;return{resize(){let t=Math.min(window.devicePixelRatio||1,d),r=e.clientWidth,i=e.clientHeight;if(r===0||i===0)return!1;let a=Math.round(r*t),o=Math.round(i*t);return a===x&&o===S?!1:(x=a,S=o,e.width=x,e.height=S,n.viewport(0,0,x,S),n.uniform2f(m,x,S),!0)},draw(e){n.uniform1f(h,e),n.drawArrays(n.TRIANGLE_STRIP,0,4)},dispose(){n.getExtension(`WEBGL_lose_context`)?.loseContext()}}}var m=document.documentElement,h=window.matchMedia(`(prefers-reduced-motion: reduce)`),g=14,_=[],v=g,y=-1,b=0,x=()=>m.dataset.n3Color===`pausado`,S=()=>!h.matches&&!x()&&document.visibilityState===`visible`,C=()=>_.some(e=>e.visible);function w(e){e.surface.draw(v),e.drawn||(e.drawn=!0,e.element.dataset.n3SurfaceReady=``)}function T(e){if(b=0,!S()||!C()){y=-1;return}y<0&&(y=e);let t=e-y;if(t>=32.333333333333336){v+=Math.min(t,100)/1e3,y=e;for(let e of _)e.visible&&w(e)}b=requestAnimationFrame(T)}function E(){!b&&S()&&C()&&(b=requestAnimationFrame(T))}function D(){for(let e of _)(e.visible||!e.drawn)&&w(e)}var O=new IntersectionObserver(e=>{for(let t of e){let e=_.find(e=>e.element===t.target);e&&(e.visible=t.isIntersecting,e.visible&&!e.drawn&&w(e))}E()},{rootMargin:`120px 0px`}),k=new ResizeObserver(e=>{for(let t of e){let e=_.find(e=>e.element===t.target);e?.surface.resize()&&w(e)}});for(let e of document.querySelectorAll(`[data-n3-surface]`)){let t=e.querySelector(`canvas`),n=e.dataset.n3Surface;if(!t||!n)continue;let r=p(t,n);if(!r)continue;r.resize();let i={element:e,surface:r,visible:!1,drawn:!1};_.push(i),w(i),O.observe(e),k.observe(e)}function A(){let e=x();for(let t of document.querySelectorAll(`[data-n3-pausa]`)){t.hidden=h.matches||_.length===0;let n=t.querySelector(`[data-n3-pausa-texto]`);n&&(n.textContent=e?`Reanudar color`:`Pausar color`)}}for(let e of document.querySelectorAll(`[data-n3-pausa]`))e.addEventListener(`click`,()=>{x()?delete m.dataset.n3Color:m.dataset.n3Color=`pausado`,A(),x()?D():E()});h.addEventListener(`change`,()=>{A(),h.matches?(v=g,D()):E()}),document.addEventListener(`visibilitychange`,E),A(),E();