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

        // تخزين الأكواد في كائن قابل للتعديل
        const codes = {
            html: htmlCode,
            css: cssCode,
            js: jsCode
        };

        const available = Object.keys(codes).filter(k => codes[k] !== "");
        if (available.length === 0) return;

        let currentLang = available[0];

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
        const iframe = this.querySelector("iframe");

        // دالة تحديث الـ iframe بالمتغيرات الحالية
        const updatePreview = () => {
            const finalCode = `
<!DOCTYPE html>
<html>
<head>
<style>${codes.css}</style>
</head>
<body>
${codes.html}
<script>
${codes.js}
<\/script>
</body>
</html>
`;
            iframe.srcdoc = finalCode;
        };

        // دالة تلوين الكود الذكية مع الحفاظ على مؤشر الكتابة
        const highlightCode = (text) => {
            // تحويل الرموز الخاصة بـ HTML لحمايتها
            let safeText = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            // 1. تلوين الأقواس الذكية () [] {}
            safeText = safeText.replace(/([\(\)\{\}\[\]])/g, '<span class="cm-bracket">$1</span>');

            // 2. تلوين الوسوم الكاملة < > و محتوياتها
            // استهداف الـ &lt; والـ &gt; التي قمنا بتحويلها بالأعلى ومحتواها
            safeText = safeText.replace(/(&lt;\/?[a-zA-Z0-9!-]+.*?&gt;)/g, '<span class="cm-tag">$1</span>');

            // 3. تلوين السلاسل النصية (البرمجة / CSS) "" و ''
            safeText = safeText.replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="cm-string">$1</span>');

            return safeText;
        };

        // دالة لتحديث محتوى صندوق الكود دون فقدان مكان الماوس (Caret)
        const updateCodeBoxWithHighlight = () => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            // حفظ موضع المؤشر بالنسبة للنص البرمجي
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeTemplate(codeBox);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const caretOffset = preCaretRange.toString().length;

            // تطبيق التلوين
            codeBox.innerHTML = highlightCode(codes[currentLang]);

            // استعادة موضع المؤشر بدقة
            setCurrentCursorPosition(codeBox, caretOffset);
        };

        // دالة مساعدة لاستعادة مكان المؤشر داخل عناصر الـ HTML المولدة
        function setCurrentCursorPosition(element, offset) {
            let charCount = 0;
            const doc = element.ownerDocument || element.document;
            const win = doc.defaultView || doc.parentWindow;
            const range = doc.createRange();
            range.setStart(element, 0);
            range.collapse(true);
            const nodeStack = [element];
            let node;
            let found = false;
            let stop = false;

            while (!stop && (node = nodeStack.pop())) {
                if (node.nodeType === 3) {
                    const nextCharCount = charCount + node.length;
                    if (!found && offset >= charCount && offset <= nextCharCount) {
                        range.setStart(node, offset - charCount);
                        range.setEnd(node, offset - charCount);
                        found = true;
                        stop = true;
                    }
                    charCount = nextCharCount;
                } else {
                    let i = node.childNodes.length;
                    while (i--) {
                        nodeStack.push(node.childNodes[i]);
                    }
                }
            }

            const sel = win.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        // إنشاء التبويبات (الأزرار) وتفعيل التنقل بينها
        available.forEach((lang, index) => {
            const btn = document.createElement("button");
            btn.className = "cm-tab" + (index === 0 ? " active" : "");
            btn.textContent = lang.toUpperCase();
            btn.dataset.lang = lang;

            tabsContainer.appendChild(btn);

            btn.onclick = () => {
                this.querySelectorAll(".cm-tab").forEach(x => x.classList.remove("active"));
                btn.classList.add("active");
                currentLang = lang;
                
                // عرض الكود الخاص بالتبويب الحالي مع تلوينه
                codeBox.innerHTML = highlightCode(codes[currentLang]);
            };
        });

        // الاستماع لحدث الكتابة داخل ديف الكود
        codeBox.addEventListener("input", () => {
            // تحديث الكائن البرمجي بالنص الخام الجديد
            codes[currentLang] = codeBox.innerText;
            
            // إعادة تلوين الكود فوراً
            updateCodeBoxWithHighlight();
            
            // تحديث المعاينة فوراً
            updatePreview();
        });

        // معالجة زر الإدخال (Enter) لضمان عدم إدخال وسوم div عشوائية داخل المحرر
        codeBox.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                document.execCommand("insertLineBreak", false, null);
                e.preventDefault();
            }
        });

        // العرض المبدئي لأول لغة وتفعيل المعاينة لأول مرة
        codeBox.innerHTML = highlightCode(codes[currentLang] || "");
        updatePreview();
    }
}

customElements.define("code-magic", CodeMagic);

// تنسيقات CSS (تم إضافة الستيلات الخاصة بالتلوين والأقواس والوسوم)
const style = document.createElement("style");

style.textContent = `
code-magic {
    display: block;
    margin: 20px 0;
}

.cm-wrapper {
    width: 900px;
    max-width: 100%;
    border: 1px solid #ddd;
    border-radius: 12px;
    overflow: hidden;
    font-family: Arial, sans-serif;
    direction: ltr; /* لضمان ظهور لغات البرمجة بشكل صحيح من اليسار لليمين */
}

.cm-tabs {
    display: flex;
    background: #fafafa;
    border-bottom: 1px solid #ddd;
    height: 36px;
}

.cm-tab {
    border: none;
    padding: 10px 0;
    cursor: pointer;
    background: none;
    width: 100px;
    font-family: Arial, sans-serif;
}

.cm-tab.active {
    background: #ffffff;
    font-weight: bold;
    box-shadow: 0px -3px 0px #3b91e1 inset;
}

.cm-body {
    display: flex;
    height: 500px;
    background: #fafafa;
}

.cm-body div {
    flex: 1 1;
}

.cm-code {
    width: 50%;
    padding: 15px;
    overflow: auto;
    white-space: pre-wrap;
    background: #1e1e1e; /* تحويل الخلفية لداكنة لتناسب تلوين الكود بشكل احترافي */
    color: #d4d4d4;
    font-family: 'Courier New', Courier, monospace;
    outline: none;
    box-sizing: border-box;
}

/* ستيلات تلوين الأكواد (Syntax Highlighting) */
.cm-bracket {
    color: #ffd700; /* لون ذهبي للأقواس () [] {} */
    font-weight: bold;
}

.cm-tag {
    color: #569cd6; /* لون أزرق للوسوم <></> */
}

.cm-string {
    color: #ce9178; /* لون برتقالي/بني خفيف للنصوص العادية داخل الكود */
}

.cm-preview {
    margin: 4px;
    margin-left: 0;
    font-family: monospace;
    border-radius: 10px;
    background: white;
    box-shadow: 0 0 0 1px #dddddd;
    box-sizing: border-box;
}

.cm-preview iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 10px;
}
`;

document.head.appendChild(style);

})();
