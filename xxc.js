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

        // تخزين الأكواد في كائن محلي داخل المكون لتسهيل تعديلها
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

        // دالة لتلوين الكود داخل ديف التحرير دون فقدان مؤشر الكتابة (Caret)
        const highlightCode = (text) => {
            if (!text) return "";
            
            // تحويل الرموز الخاصة بـ HTML أولاً لتجنب مشاكل الرندرة
            let escaped = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            // تلوين الوسوم ومحتواها: &lt;...&gt;
            escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9!:-]+.*?&gt;)/g, '<span class="cm-syntax-tag">$1</span>');

            // تلوين الأقواس الحاصرة {}
            escaped = escaped.replace(/(\{)/g, '<span class="cm-syntax-brace">$1</span>')
                             .replace(/(\})/g, '<span class="cm-syntax-brace">$1</span>');

            // تلوين الأقواس المربعة []
            escaped = escaped.replace(/(\[)/g, '<span class="cm-syntax-bracket">$1</span>')
                             .replace(/(\])/g, '<span class="cm-syntax-bracket">$1</span>');

            // تلوين الأقواس الدائرية ()
            escaped = escaped.replace(/(\()/g, '<span class="cm-syntax-paren">$1</span>')
                             .replace(/(\))/g, '<span class="cm-syntax-paren">$1</span>');

            return escaped;
        };

        // دالة تحديث الـ Preview (Iframe) بناءً على القيم الحالية للأكواد
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

        // دالة لإدخال النص البرمجي في الصندوق مع الحفاظ على موضع مؤشر الكتابة
        const setCodeWithHighlight = (text) => {
            const selection = window.getSelection();
            let offset = 0;
            
            // حساب مكان المؤشر الحالي قبل التعديل
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(codeBox);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                offset = preCaretRange.toString().length;
            }

            // تطبيق التلوين
            codeBox.innerHTML = highlightCode(text);

            // إعادة تعيين موضع المؤشر بدقة بعد إعادة بناء الـ HTML الداخلي
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

        // إنشاء التبويبات (الأزرار) تلقائياً
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
                
                // عرض الكود الخاص بالتبويب الحالي مع تلوينه
                setCodeWithHighlight(this.codes[lang]);
            };
        });

        // الاستماع لحدث الكتابة والتعديل الفوري داخل الديف
        codeBox.addEventListener("input", () => {
            const text = codeBox.innerText; // جلب النص النقي بدون وسوم التلوين المضافة
            this.codes[this.currentLang] = text; // تحديث مخزن الأكواد للغة النشطة حالياً
            
            setCodeWithHighlight(text); // إعادة تلوين الكود الحالي
            updatePreview(); // تحديث العرض المباشر فوراً
        });

        // التعامل مع زر الـ Enter لإضافة سطر جديد برمجياً منعا للمشاكل ببعض المتصفحات
        codeBox.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                document.execCommand("insertLineBreak", false, null);
                e.preventDefault();
            }
        });

        // عرض أول لغة وتحديث العرض لأول مرة تلقائياً
        if (this.codes[this.currentLang]) {
            setCodeWithHighlight(this.codes[this.currentLang]);
        }
        updatePreview();
    }
}

customElements.define("code-magic", CodeMagic);

// CSS المحسن والمضاف إليه ستايلات التلوين البرمجي
const style = document.createElement("style");

style.textContent = `
code-magic{
display:block;
margin:20px 0;
}

.cm-wrapper{
width: 900px;
max-width: 100%;
border:1px solid #ddd;
border-radius:12px;
overflow:hidden;
font-family:Arial;
}

.cm-tabs{
display: flex;
background: #fafafa;
border-bottom: 1px solid #0000;
height: 36px;
}

.cm-tab{
border: none;
padding: 10px 0;
cursor: pointer;
background: none;
width: 100px;
}

.cm-tab.active{
background: #ffffff;
font-weight: bold;
box-shadow: 0px -3px 0px #3b91e1 inset;
}

.cm-body{
display: flex;
height: 500px;
background: #fafafa;
}
.cm-body div {
flex: 1 1;
}

.cm-code{
padding: 15px;
overflow: auto;
white-space: pre-wrap;
color: #5e656b;
font-family: monospace;
outline: none;
direction: ltr; /* لضمان كتابة الكود البرمجي من اليسار لليمين بشكل سليم */
text-align: left;
}

/* ستايلات تلوين الأكواد المخصصة */
.cm-syntax-tag { color: #569cd6; font-weight: bold; }       /* الوسوم الكودية < > */
.cm-syntax-brace { color: #ffd700; font-weight: bold; }     /* الأقواس الحاصرة { } */
.cm-syntax-bracket { color: #da70d6; font-weight: bold; }   /* الأقواس المربعة [ ] */
.cm-syntax-paren { color: #17a2b8; font-weight: bold; }     /* الأقواس الدائرية ( ) */

.cm-preview{
margin: 4px;
margin-left: 0;
font-family: monospace;
border-radius: 10px;
background: white;
box-shadow: 0 0 0 1px #dddddd;
width: 50%;
}

.cm-preview iframe{
width:100%;
height:100%;
border:none;
border-radius: 10px;
}
`;

document.head.appendChild(style);

})();
