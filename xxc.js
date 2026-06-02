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
            <div class="ccvvde3r4">
                <button id="zoome-234">
                    <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 48 48" style="&#10;    width: 24px;&#10;    height: 24px;&#10;"> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"/> </g> <g id="icons_Q2" data-name="icons Q2"> <g> <path d="M18.6,26.6,8,37.2V30.1A2.1,2.1,0,0,0,6.3,28,2,2,0,0,0,4,30V42a2,2,0,0,0,2,2H17.9A2.1,2.1,0,0,0,20,42.3,2,2,0,0,0,18,40H10.8L21.3,29.5a2.1,2.1,0,0,0,.3-2.7A1.9,1.9,0,0,0,18.6,26.6Z"/> <path d="M30,4a2,2,0,0,0-2,2.3A2.1,2.1,0,0,0,30.1,8h7.1L26.7,18.5a2,2,0,0,0-.2,2.8A1.8,1.8,0,0,0,28,22a2,2,0,0,0,1.4-.6L40,10.8v7.1A2.1,2.1,0,0,0,41.7,20,2,2,0,0,0,44,18V6a2,2,0,0,0-2-2Z"/> </g> </g> </g> </svg>
                </button>
            </div>
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

        const escapeHtml = (value) => value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const highlightPlain = (text) => text.replace(
            /(\/\*[\s\S]*?\*\/|\/\/.*)|("[^"]*"|'[^']*'|`[^`]*`)|\b(const|let|var|function|return|if|else|for|while|class|new|async|await|import|export|from|this|document|window|display|color|background|border|padding|margin|width|height|font|position|flex|grid)\b|\b([0-9]+(?:\.[0-9]+)?(?:px|rem|em|%|vh|vw|s|ms)?)\b|([{}])|([\[\]])|([()])|([=+\-*\/%<>!?:|&.,;])/g,
            (match, comment, string, keyword, number, brace, bracket, paren, operator) => {
                if (comment) return `<span class="cm-syntax-comment">${comment}</span>`;
                if (string) return `<span class="cm-syntax-string">${string}</span>`;
                if (keyword) return `<span class="cm-syntax-keyword">${keyword}</span>`;
                if (number) return `<span class="cm-syntax-number">${number}</span>`;
                if (brace) return `<span class="cm-syntax-brace">${brace}</span>`;
                if (bracket) return `<span class="cm-syntax-bracket">${bracket}</span>`;
                if (paren) return `<span class="cm-syntax-paren">${paren}</span>`;
                if (operator) return `<span class="cm-syntax-operator">${operator}</span>`;
                return match;
            }
        );

        const highlightHtmlTag = (tag) => {
            const commentMatch = tag.match(/^(&lt;!--)([\s\S]*?)(--&gt;)$/);
            if (commentMatch) {
                return `<span class="cm-syntax-comment">${commentMatch[1]}${commentMatch[2]}${commentMatch[3]}</span>`;
            }

            return tag.replace(
                /^(&lt;\/?)([a-zA-Z][\w:-]*|![A-Z]+)?([\s\S]*?)(&gt;)$/,
                (_, open, name = "", attrs = "", close) => {
                    const coloredAttrs = attrs.replace(
                        /([\w:-]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'=&gt;]+)/g,
                        (attrText, attrName, eq, attrValue) => {
                            const attrClass = /^(id|class|href|src|alt|title|name|type|rel|aria-[\w-]+|data-[\w-]+)$/i.test(attrName)
                                ? "cm-syntax-attr-important"
                                : "cm-syntax-attr";

                            return `<span class="${attrClass}">${attrName}</span><span class="cm-syntax-operator">${eq}</span><span class="cm-syntax-string">${attrValue}</span>`;
                        }
                    );

                    return `<span class="cm-syntax-tag">${open}</span><span class="cm-syntax-tag-name">${name}</span>${coloredAttrs}<span class="cm-syntax-tag">${close}</span>`;
                }
            );
        };

        const highlightCode = (text) => {
            if (!text) return "";

            const escaped = escapeHtml(text);

            if (this.currentLang === "html") {
                return escaped
                    .split(/(&lt;!--[\s\S]*?--&gt;|&lt;\/?[a-zA-Z!][\s\S]*?&gt;)/g)
                    .map(part => part.startsWith("&lt;") ? highlightHtmlTag(part) : highlightPlain(part))
                    .join("");
            }

            return highlightPlain(escaped);
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

        const getCaretOffset = () => {
            const selection = window.getSelection();
            if (!selection.rangeCount || !codeBox.contains(selection.anchorNode)) {
                return 0;
            }

            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(codeBox);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            return preCaretRange.toString().length;
        };

        const restoreCaret = (offset) => {
            const selection = window.getSelection();
            const walker = document.createTreeWalker(codeBox, NodeFilter.SHOW_TEXT);
            let currentOffset = 0;
            let node = walker.nextNode();

            while (node) {
                const nextOffset = currentOffset + node.length;
                if (nextOffset >= offset) {
                    const range = document.createRange();
                    range.setStart(node, offset - currentOffset);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return;
                }
                currentOffset = nextOffset;
                node = walker.nextNode();
            }

            const range = document.createRange();
            range.selectNodeContents(codeBox);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        };

        const normalizeEditorText = () => codeBox.textContent.replace(/\u00a0/g, " ");

        const insertTextAtCaret = (text) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();
            const node = document.createTextNode(text);
            range.insertNode(node);
            range.setStartAfter(node);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        };

        const setCodeWithHighlight = (text) => {
            const offset = getCaretOffset();
            codeBox.innerHTML = highlightCode(text);
            restoreCaret(offset);
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
            const text = normalizeEditorText();
            this.codes[this.currentLang] = text;

            setCodeWithHighlight(text);
            updatePreview();
        });

        codeBox.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                insertTextAtCaret("\n");
                codeBox.dispatchEvent(new InputEvent("input", {
                    bubbles: true,
                    inputType: "insertLineBreak",
                    data: "\n"
                }));
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
width: max-content;
}

.ccvvde3r4 {
position: absolute;
right: 0;
top: 0;
height: 36px;
display: flex;
}
.ccvvde3r4 button {
cursor: pointer;
border: none;
flex: 1 1;
padding: 0 12px;
display: flex;
align-items: center;
justify-content: center;
margin: 4px 4px 0px 0px;
border-radius: 25px;
fill: #677485d6;
background: #0000;
}
.ccvvde3r4 button:hover {
fill: #626f80;
background: #6774850e;
}
.ccvvde3r4 button:active {
background: #67748521;
}

.cm-wrapper{
position: relative;
width: 900px;
max-width: 100%;
border:1px solid #ddd;
border-radius:12px;
/*overflow:hidden;*/
font-family:Arial;
background: #fafafa;
}

.cm-tabs{
display: flex;
background: #fafafa;
border-bottom: 1px solid #0000;
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
border-radius: 10px
}
.cm-body div {
    flex: 1 1;
    scrollbar-color: #525d6547 transparent;
}

.cm-code{
font-size: 14px;
line-height: 1.5;
padding: 15px;
padding-right: 0px;
overflow: scroll;
white-space: pre-wrap;
color: #5e656b;
font-family: monospace;
outline: none;
direction: ltr;
text-align: left;
tab-size: 4;
}

.cm-syntax-tag { color: #3f454da1; font-weight: 700; }
.cm-syntax-tag-name { color: #b85e8e; font-weight: 700; }
.cm-syntax-attr { color: #8a5cf6; }
.cm-syntax-attr-important { color: #d99559; font-weight: 700; }
.cm-syntax-string { color: #426db6; }
.cm-syntax-keyword { color: #b91c1c; font-weight: 700; }
.cm-syntax-number { color: #0e7490; }
.cm-syntax-comment { color: #7c8794; font-style: italic; }
.cm-syntax-operator { color: #656f79; font-weight: 700; }
.cm-syntax-brace { color: #ca8a04; font-weight: 700; }
.cm-syntax-bracket { color: #9333ea; font-weight: 700; }
.cm-syntax-paren { color: #0891b2; font-weight: 700; }

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
