diff --git a/js/glitching.js b/js/glitching.js
index 0c2350f296d1dab47103b2c2c7aa5b0f0610aedc..9ebd13cedf2344f66610646cd6a40c322a7f5720 100644
--- a/js/glitching.js
+++ b/js/glitching.js
@@ -1,76 +1,103 @@
 /**
  * Glitch efekt, který náhodně mění a bliká znaky.
  * @param {string} selector CSS selektor pro elementy s efektem.
  * @param {number} changeProbability Pravděpodobnost (0.0 - 1.0), že se znak změní.
  * @param {number} glitchProbability Pravděpodobnost (0.0 - 1.0), že znak zabliká.
  */
-function applyGlitch(selector, changeProbability = 0.05, glitchProbability = 0.05) {
-    const elements = document.querySelectorAll(selector);
 
-    if (elements.length === 0) return;
+function processNewGlitchText(element) {
+    const textNodes = Array.from(element.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.textContent);
+    textNodes.forEach(node => {
+        const text = node.textContent;
+        element.dataset.originalText = (element.dataset.originalText || '') + text;
+        const frag = document.createDocumentFragment();
+        text.split('').forEach(char => {
+            const span = document.createElement('span');
+            span.className = 'glitching-char';
+            span.textContent = char;
+            frag.appendChild(span);
+        });
+        element.insertBefore(frag, node);
+        node.remove();
+    });
+}
 
-    elements.forEach(element => {
-        if (element.dataset.glitchingActive === 'true') return;
+function applyGlitchToElement(element, changeProbability = 0.05, glitchProbability = 0.05) {
+    if (!element) return;
 
+    if (element.dataset.glitchingActive !== 'true') {
         element.dataset.glitchingActive = 'true';
-        const originalText = element.textContent;
-        element.dataset.originalText = originalText;
-
-        element.innerHTML = originalText.split('').map(char =>
-            char === ' ' ? ' ' : `<span class="glitching-char">${char}</span>`
-        ).join('');
-
-        const chars = element.querySelectorAll('.glitching-char');
+        element.dataset.originalText = element.dataset.originalText || '';
 
         // Funkce pro generování náhodného znaku
         const randomChar = () => String.fromCharCode(33 + Math.floor(Math.random() * 94));
-        
+
         const changeInterval = setInterval(() => {
+            const chars = element.querySelectorAll('.glitching-char');
+            const originalText = element.dataset.originalText || '';
             chars.forEach((char, index) => {
                 // Přidání a odebrání blikacích tříd
                 char.classList.remove('glitch-1', 'glitch-2');
                 if (Math.random() < glitchProbability) {
                     const glitchType = Math.random() > 0.5 ? 'glitch-1' : 'glitch-2';
                     char.classList.add(glitchType);
                 }
 
                 // Změna znaku
-                if (Math.random() < changeProbability) {
+                if (Math.random() < changeProbability && index < originalText.length) {
                     char.textContent = randomChar();
                     // Vrácení původního znaku po krátké chvíli
                     setTimeout(() => {
                         char.textContent = originalText[index];
                     }, 100 + Math.random() * 150);
                 }
             });
         }, 100);
 
         element.dataset.changeInterval = changeInterval;
+    }
+
+    processNewGlitchText(element);
+}
+
+function applyGlitch(selector, changeProbability = 0.05, glitchProbability = 0.05) {
+    const elements = document.querySelectorAll(selector);
+
+    if (elements.length === 0) return;
+
+    elements.forEach(element => {
+        applyGlitchToElement(element, changeProbability, glitchProbability);
     });
 }
 
 function removeGlitch(selector) {
     const elements = document.querySelectorAll(selector);
 
     elements.forEach(element => {
         if (element.dataset.glitchingActive !== 'true') return;
 
         clearInterval(element.dataset.changeInterval);
         element.innerHTML = element.dataset.originalText;
         delete element.dataset.glitchingActive;
         delete element.dataset.originalText;
         delete element.dataset.changeInterval;
     });
 }
 
 // Globalní funkce pro spouštění a zastavování efektu
 window.startGlitching = function(selector = '.glitching') {
     if (document.body.classList.contains('animations-disabled')) return;
     console.log('Starting Glitching Effect...');
     applyGlitch(selector);
 };
 
 window.stopGlitching = function(selector = '.glitching') {
     console.log('Stopping Glitching Effect...');
     removeGlitch(selector);
 };
+
+// Aktualizace pro nově přidaný text během psaní
+window.updateGlitchingElement = function(element) {
+    applyGlitchToElement(element);
+};
+
