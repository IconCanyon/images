(function () {

const DATA = {};

window.CodeMagic = {
    save(obj) {
        Object.assign(DATA, obj);
        document.querySelectorAll("code-magic").forEach(el => {
            if (el.renderCodeMagic) el.renderCodeMagic();
        });
    }
};

class CodeMagic extends HTMLElement {

    connectedCallback() {
        this.renderCodeMagic = () => this.render();
        this.render();
    }

    async render() {

        const id = this.getAttribute("com");
        const item = DATA[id];

        if (!item) {
            this.innerHTML = "لا توجد بيانات";
            return;
        }

        const [htmlCode, cssCode, jsCode] = await Promise.all([
            item.html ? fetch(item.html).then(r => r.text()).catch(() => "") : "",
            item.css ? fetch(item.css).then(r => r.text()).catch(() => "") : "",
            item.js ? fetch(item.js).then(r => r.text()).catch(() => "") : ""
        ]);

        this.codes = {
            html: htmlCode,
            css: cssCode,
            js: jsCode
        };

        const available = Object.keys(this.codes).filter(k => this.codes[k] !== "");
        this.currentLang = available[0] || "html";

        this.innerHTML = `
        <div class="cm-wrapper">
            <div class="cm-tabs"></div>
            <div class="cm-body">
                <div class="cm-code" contenteditable="true" spellcheck="false"></div>
                <div class="cm-preview">
                    <iframe></iframe>
                </div>
            </div>
        </div>
        `;

        const tabsContainer = this.querySelector(".cm-tabs");
        const codeBox = this.querySelector(".cm-code");
        this.iframe = this.querySelector("iframe");

        // دالة التلوين البرمجي المتقدمة والموسعة
        const highlightCode = (text) => {
            if (!text) return "";

            // 1. تحويل الرموز الأساسية لمنع تنفيذ الـ HTML في محرر الكود
            let escaped = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            // 2. تلوين النصوص داخل الاقتباسات المزدوجة والفردية ("..." أو '...')
            escaped = escaped.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="cm-syntax-string">$&</span>');

            // 3. تلوين الكلمات المفتاحية والخصائص الشائعة (class, id, href, style, src...)
            const keywords = /\b(class|id|href|style|src|type|const|let|var|function|return|if|else|for|while|import|export)\b/g;
            escaped = escaped.replace(keywords, '<span class="cm-syntax-keyword">$&</span>');

            // 4. تلوين المعاملات الرياضية والمنطقية (= , + , - , * , /)
            escaped = escaped.replace(/([=+\-*/])/g, '<span class="cm-syntax-operator">$1</span>');

            // 5. تلوين الأقواس بجميع أنواعها
            escaped = escaped.replace(/(\{)/g, '<span class="cm-syntax-brace">$1</span>')
                             .replace(/(\})/g, '<span class="cm-syntax-brace">$1</span>')
                             .replace(/(\[)/g, '<span class="cm-syntax-bracket">$1</span>')
                             .replace(/(\])/g, '<span class="cm-syntax-bracket">$1</span>')
                             .replace(/(\()/g, '<span class="cm-syntax-paren">$1</span>')
                             .replace(/(\))/g, '<span class="cm-syntax-paren">$1</span>');

            // 6. تلوين علامات الـ HTML والأقواس الزاوية للوسوم (&lt; و &gt;)
            escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9!:-]+)/g, '<span class="cm-syntax-tag">$1</span>')
                             .replace(/(&gt;)/g, '<span class="cm-syntax-tag">$1</span>');

            return escaped;
        };

        const updatePreview = () => {
            const finalCode = `
<!DOCTYPE html>
<html>
<head>
<style>${this.codes.css}</style>
</head>
<body>
${this.codes.html}
<script>
${this.codes.js}
<\/script>
</body>
</html>
`;
            this.iframe.srcdoc = finalCode;
        };

        // دالة ذكية لإرجاع المؤشر لنفس مكانه النصي الأصلي بدقة بعد إعادة رندرة الـ HTML
        const setCodeWithHighlight = (text) => {
            const selection = window.getSelection();
            let offset = 0;

            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(codeBox);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                offset = preCaretRange.toString().length;
            }

            // معالجة مشكلة السطر الأخير الفارغ في المتصفحات
            const targetText = text.endsWith('\n') ? text + ' ' : text;
            codeBox.innerHTML = highlightCode(targetText);

            if (offset > 0) {
                const restoreCaret = (el, offset) => {
                    let currentOffset = 0;
                    const nodeQueue = [el];
                    while (nodeQueue.length > 0) {
                        const node = nodeQueue.shift();
                        if (node.nodeType === Node.TEXT_NODE) {
                            if (currentOffset + node.length >= offset) {
                                const range = document.createRange();
                                range.setStart(node, offset - currentOffset);
                                range.setEnd(node, offset - currentOffset);
                                selection.removeAllRanges();
                                selection.addRange(range);
                                return true;
                            }
                            currentOffset += node.length;
                        } else {
                            let i = node.childNodes.length;
                            while (i--) {
                                nodeQueue.unshift(node.childNodes[i]);
                            }
                        }
                    }
                    return false;
                };
                restoreCaret(codeBox, offset);
            }
        };

        available.forEach((lang, index) => {
            const btn = document.createElement("button");
            btn.className = "cm-tab" + (index === 0 ? " active" : "");
            btn.textContent = lang.toUpperCase();
            btn.dataset.lang = lang;

            tabsContainer.appendChild(btn);

            btn.onclick = () => {
                this.querySelectorAll(".cm-tab").forEach(x => x.classList.remove("active"));
                btn.classList.add("active");
                this.currentLang = lang;
                setCodeWithHighlight(this.codes[lang]);
            };
        });

        codeBox.addEventListener("input", () => {
            // استخدام innerText يضمن جلب النصوص مع النزول لسطر جديد بشكل نقي وصحيح
            let text = codeBox.innerText;
            
            // إصلاح توافق المتصفحات عند تفريغ الصندوق تماماً
            if (text === '\n') text = '';

            this.codes[this.currentLang] = text;
            setCodeWithHighlight(text);
            updatePreview();
        });

        // إصلاح مشكلة ضغط الـ Enter ومنع المتصفح من إفساد الهيكل البرمجي بالـ div
        codeBox.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    // إدراج محرف سطر جديد نقي ومباشر
                    const textNode = document.createTextNode("\n");
                    range.deleteContents();
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.setEndAfter(textNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // إطلاق حدث التحديث يدوياً ليتم إعادة التلوين فوراً بناء على المحرف الجديد
                    codeBox.dispatchEvent(new Event("input"));
                }
            }
        });

        if (this.codes[this.currentLang]) {
            setCodeWithHighlight(this.codes[this.currentLang]);
        }
        updatePreview();
    }
}

customElements.define("code-magic", CodeMagic);

const style = document.createElement("style");

style.textContent = `
code-magic{
display:block;
margin:20px 0;
}

.cm-wrapper{
width: 900px;
max-width: 100%;
border:1px solid #333;
border-radius:12px;
font-family:Arial;
background: #1e1e1e; /* تحويل الثيم بالكامل لثيم داكن احترافي يناسب المطورين */
}

.cm-tabs{
display: flex;
background: #252526;
border-bottom: 1px solid #2d2d2d;
height: 36px;
overflow: hidden;
border-radius: 12px 12px 0px 0px;
}

.cm-tab{
border: none;
padding: 10px 0;
cursor: pointer;
background: none;
width: 100px;
color: #858585;
}

.cm-tab.active{
background: #1e1e1e;
font-weight: bold;
color: #fff;
box-shadow: 0px -3px 0px #007acc inset;
}

.cm-body{
display: flex;
height: 500px;
background: #1e1e1e;
border-radius: 10px
}
.cm-body div {
    flex: 1 1;
    scrollbar-color: #525d6547 transparent;
}

.cm-code{
padding: 15px;
overflow: auto;
white-space: pre-wrap;
color: #d4d4d4;
font-family: 'Courier New', Courier, monospace;
outline: none;
direction: ltr;
text-align: left;
width: 50%;
}

/* فئات وألوان التلوين البرمجي الإضافية والجديدة */
.cm-syntax-tag { color: #569cd6; font-weight: bold; }       /* الوسوم الكودية وأقواسها مثل < > */
.cm-syntax-keyword { color: #c586c0; font-weight: bold; }   /* الكلمات الدلالية مثل id, class, href */
.cm-syntax-operator { color: #d4d4d4; font-weight: bold; }  /* المعاملات مثل = , + , - */
.cm-syntax-string { color: #ce9178; }                       /* النصوص داخل الاقتباسات "strings" */
.cm-syntax-brace { color: #ffd700; font-weight: bold; }     /* الأقواس { } */
.cm-syntax-bracket { color: #da70d6; font-weight: bold; }   /* الأقواس المربعة [ ] */
.cm-syntax-paren { color: #17a2b8; font-weight: bold; }     /* الأقواس الدائرية ( ) */

.cm-preview{
margin: 4px;
margin-left: 0;
font-family: monospace;
border-radius: 10px;
background: white;
box-shadow: 0 0 0 1px #2d2d2d;
width: 50%;
}

.cm-preview iframe{
width:100%;
height:100%;
border:none;
border-radius: 10px;
background: #ffffff;
}
`;

document.head.appendChild(style);

})();
