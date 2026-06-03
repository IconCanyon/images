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

        const allLangs = ["html", "css", "js"];
        const showOnlyExistingFiles = String(item.com || "").trim().toLowerCase() === "off";
        const hasConfiguredFiles = allLangs.some(k => Boolean(String(item[k] || "").trim()));

        if (showOnlyExistingFiles && !hasConfiguredFiles) {
            this.remove();
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

        const available = showOnlyExistingFiles
            ? allLangs.filter(k => Boolean(String(item[k] || "").trim()))
            : allLangs;
        this.currentLang = available[0] || "html";

        const zoomOpenIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 48 48" style="&#10;    width: 24px;&#10;    height: 24px;&#10;"> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"/> </g> <g id="icons_Q2" data-name="icons Q2"> <g> <path d="M18.6,26.6,8,37.2V30.1A2.1,2.1,0,0,0,6.3,28,2,2,0,0,0,4,30V42a2,2,0,0,0,2,2H17.9A2.1,2.1,0,0,0,20,42.3,2,2,0,0,0,18,40H10.8L21.3,29.5a2.1,2.1,0,0,0,.3-2.7A1.9,1.9,0,0,0,18.6,26.6Z"/> <path d="M30,4a2,2,0,0,0-2,2.3A2.1,2.1,0,0,0,30.1,8h7.1L26.7,18.5a2,2,0,0,0-.2,2.8A1.8,1.8,0,0,0,28,22a2,2,0,0,0,1.4-.6L40,10.8v7.1A2.1,2.1,0,0,0,41.7,20,2,2,0,0,0,44,18V6a2,2,0,0,0-2-2Z"/> </g> </g> </g> </svg>`;
        const zoomCloseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 48 48" style="&#10;    width: 24px;&#10;    height: 24px;&#10;">
  <g id="Layer_2" data-name="Layer 2">
    <g id="invisible_box" data-name="invisible box">
      <rect width="48" height="48" fill="none"/>
    </g>
    <g id="icons_Q2" data-name="icons Q2">
      <g>
        <path d="M8,26a2,2,0,0,0-2,2.3A2.1,2.1,0,0,0,8.1,30h7.1L4.7,40.5a2,2,0,0,0-.2,2.8A1.8,1.8,0,0,0,6,44a2,2,0,0,0,1.4-.6L18,32.8v7.1A2.1,2.1,0,0,0,19.7,42,2,2,0,0,0,22,40V28a2,2,0,0,0-2-2Z"/>
        <path d="M43.7,4.8a2,2,0,0,0-3.1-.2L30,15.2V8.1A2.1,2.1,0,0,0,28.3,6,2,2,0,0,0,26,8V20a2,2,0,0,0,2,2H39.9A2.1,2.1,0,0,0,42,20.3,2,2,0,0,0,40,18H32.8L43.4,7.5A2.3,2.3,0,0,0,43.7,4.8Z"/>
      </g>
    </g>
  </g>
</svg>`;

        this.innerHTML = `
        <div class="cm-wrapper">
            <div class="ccvvde3r4">
                <button id="download-234">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="800px" width="800px" version="1.1" id="Capa_1" viewBox="0 0 384.97 384.97" xml:space="preserve" style="&#10;    width: 24px;&#10;    height: 24px;&#10;"> <g> <g id="Arrow_Down_Circle"> <path d="M192.485,0C86.185,0,0,86.173,0,192.485c0,106.3,86.185,192.485,192.485,192.485    c106.312,0,192.485-86.185,192.485-192.485C384.97,86.173,298.797,0,192.485,0z M192.485,360.909    c-93.018,0-168.424-75.406-168.424-168.424S99.467,24.061,192.485,24.061s168.424,75.406,168.424,168.424    S285.503,360.909,192.485,360.909z"/> <path d="M268.095,209.243l-63.46,62.558V84.212c0-6.641-5.438-12.03-12.151-12.03c-6.713,0-12.151,5.39-12.151,12.03v187.589    l-63.46-62.558c-4.74-4.692-12.439-4.692-17.179,0c-4.74,4.704-4.74,12.319,0,17.011l84.2,82.997    c2.25,2.25,5.414,3.537,8.59,3.537c3.164,0,6.328-1.299,8.59-3.525l84.2-82.997c4.752-4.704,4.74-12.319,0-17.011    C280.535,204.551,272.835,204.551,268.095,209.243z"/> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </g> </svg>
                </button>
                <button id="zoome-234">
                    ${zoomOpenIcon}
                </button>
            </div>
            <div class="cm-tabs"></div>

            <div class="cm-body">

                <div class="cm-editor">
                    <div class="cm-line-numbers"></div>
                    <div class="cm-code" contenteditable="true" spellcheck="false"></div>
                </div>

                <div class="cm-preview">
                    <iframe></iframe>
                </div>

            </div>

        </div>
        `;

        const tabsContainer = this.querySelector(".cm-tabs");
        const lineNumbers = this.querySelector(".cm-line-numbers");
        const codeBox = this.querySelector(".cm-code");
        const wrapper = this.querySelector(".cm-wrapper");
        const zoomButton = this.querySelector("#zoome-234");
        const downloadButton = this.querySelector("#download-234");
        this.iframe = this.querySelector("iframe");

        const escapeHtml = (value) => value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const preserveHtmlEntities = (value, callback) => {
            const entities = [];
            const protectedValue = value.replace(/&(amp|lt|gt);/g, (entity) => {
                const token = `\uE000${entities.length}\uE001`;
                entities.push(entity);
                return token;
            });

            return protectedValue
                .split(/(\uE000\d+\uE001)/g)
                .map(part => /^\uE000\d+\uE001$/.test(part) ? part : callback(part))
                .join("")
                .replace(/\uE000(\d+)\uE001/g, (_, index) => entities[index]);
        };

        const highlightPlain = (text) => preserveHtmlEntities(text, protectedText => protectedText.replace(
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
        ));

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

        const colorToHex = (color) => {
            const probe = document.createElement("span");
            probe.style.color = "";
            probe.style.color = color;
            document.body.appendChild(probe);
            const computedColor = getComputedStyle(probe).color;
            probe.remove();

            const rgbMatch = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!rgbMatch) return "";

            return "#" + rgbMatch.slice(1, 4)
                .map(value => Number(value).toString(16).padStart(2, "0"))
                .join("");
        };

        const highlightCssCode = (text, baseOffset = 0) => {
            const colorPattern = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])|\b(?:rgb|rgba|hsl|hsla)\(\s*[^)]*?\)/g;
            let highlighted = "";
            let lastIndex = 0;
            let match;

            while ((match = colorPattern.exec(text))) {
                const colorValue = match[0];
                const colorHex = colorToHex(colorValue);

                if (!colorHex) continue;

                const start = match.index;
                const end = start + colorValue.length;

                highlighted += highlightPlain(escapeHtml(text.slice(lastIndex, start)));
                highlighted += `<span class="cm-color-swatch" contenteditable="false" data-color-start="${baseOffset + start}" data-color-end="${baseOffset + end}" data-color-value="${escapeHtml(colorValue)}" style="background:${colorHex}"></span>`;
                highlighted += `<span class="cm-syntax-color">${escapeHtml(colorValue)}</span>`;
                lastIndex = end;
            }

            highlighted += highlightPlain(escapeHtml(text.slice(lastIndex)));
            return highlighted;
        };

        const highlightCode = (text, baseOffset = 0) => {
            if (!text) return "";

            const escaped = escapeHtml(text);

            if (this.currentLang === "html") {
                return escaped
                    .split(/(&lt;!--[\s\S]*?--&gt;|&lt;\/?[a-zA-Z!][\s\S]*?&gt;)/g)
                    .map(part => part.startsWith("&lt;") ? highlightHtmlTag(part) : highlightPlain(part))
                    .join("");
            }

            if (this.currentLang === "css") {
                return highlightCssCode(text, baseOffset);
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

        const BATCH_LINE_COUNT = 300;
        const HISTORY_LIMIT = 100;
        let renderToken = 0;
        let beforeInputSnapshot = null;
        let isApplyingEditorState = false;
        const historyByLang = {
            html: { undo: [], redo: [] },
            css: { undo: [], redo: [] },
            js: { undo: [], redo: [] }
        };
        const editorViewByLang = {
            html: { start: 0, end: 0, scrollTop: 0 },
            css: { start: 0, end: 0, scrollTop: 0 },
            js: { start: 0, end: 0, scrollTop: 0 }
        };

        const getOffsetFromPosition = (node, offset) => {
            if (!node || !codeBox.contains(node)) return 0;

            const range = document.createRange();
            range.selectNodeContents(codeBox);
            range.setEnd(node, offset);
            return range.toString().length;
        };

        const getSelectionOffsets = () => {
            const selection = window.getSelection();
            if (!selection.rangeCount || !codeBox.contains(selection.anchorNode)) {
                return { start: 0, end: 0 };
            }

            const range = selection.getRangeAt(0);
            const start = getOffsetFromPosition(range.startContainer, range.startOffset);
            const end = getOffsetFromPosition(range.endContainer, range.endOffset);
            return { start, end };
        };

        const getCaretOffset = () => {
            return getSelectionOffsets().end;
        };

        const restoreSelection = (startOffset, endOffset = startOffset) => {
            const selection = window.getSelection();
            const walker = document.createTreeWalker(codeBox, NodeFilter.SHOW_TEXT);
            let currentOffset = 0;
            let node = walker.nextNode();
            const range = document.createRange();
            let foundStart = false;
            let foundEnd = false;

            while (node) {
                const nextOffset = currentOffset + node.length;
                if (!foundStart && nextOffset >= startOffset) {
                    range.setStart(node, Math.max(0, startOffset - currentOffset));
                    foundStart = true;
                }
                if (!foundEnd && nextOffset >= endOffset) {
                    range.setEnd(node, Math.max(0, endOffset - currentOffset));
                    foundEnd = true;
                    break;
                }
                currentOffset = nextOffset;
                node = walker.nextNode();
            }

            if (!foundStart) {
                range.selectNodeContents(codeBox);
                range.collapse(false);
            } else if (!foundEnd) {
                range.setEndAfter(codeBox.lastChild || codeBox);
            }

            selection.removeAllRanges();
            selection.addRange(range);
        };

        const restoreCaret = (offset) => restoreSelection(offset);

        const selectAllCode = () => {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(codeBox);
            selection.removeAllRanges();
            selection.addRange(range);
        };

        const normalizeEditorText = () => codeBox.textContent.replace(/\u00a0/g, " ");

        const syncLineNumberScroll = () => {
            lineNumbers.scrollTop = codeBox.scrollTop;
        };

        const waitForNextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

        const createSnapshot = () => {
            const selection = getSelectionOffsets();
            return {
                lang: this.currentLang,
                text: normalizeEditorText(),
                start: selection.start,
                end: selection.end,
                scrollTop: codeBox.scrollTop
            };
        };

        const saveCurrentEditorView = () => {
            const selection = getSelectionOffsets();
            editorViewByLang[this.currentLang] = {
                start: selection.start,
                end: selection.end,
                scrollTop: codeBox.scrollTop
            };
        };

        const pushHistory = (snapshot = createSnapshot()) => {
            const history = historyByLang[snapshot.lang || this.currentLang];
            if (!history) return;

            history.undo.push(snapshot);
            if (history.undo.length > HISTORY_LIMIT) history.undo.shift();
            history.redo.length = 0;
        };

        const updateLineNumbers = async (text = normalizeEditorText(), token = renderToken) => {
            const count = Math.max(1, text.split("\n").length);
            lineNumbers.innerHTML = "";

            for (let index = 0; index < count; index += BATCH_LINE_COUNT) {
                if (token !== renderToken) return false;

                const end = Math.min(index + BATCH_LINE_COUNT, count);
                lineNumbers.insertAdjacentHTML(
                    "beforeend",
                    Array.from({ length: end - index }, (_, offset) => `<div>${index + offset + 1}</div>`).join("")
                );

                if (end < count) await waitForNextFrame();
            }

            syncLineNumberScroll();
            return true;
        };

        const setCodeWithHighlight = async (text, selectionStart = getCaretOffset(), selectionEnd = selectionStart, scrollTop = codeBox.scrollTop) => {
            const token = ++renderToken;
            const lines = text.split("\n");
            codeBox.innerHTML = "";
            isApplyingEditorState = true;
            let chunkOffset = 0;

            for (let index = 0; index < lines.length; index += BATCH_LINE_COUNT) {
                if (token !== renderToken) {
                    isApplyingEditorState = false;
                    return;
                }

                const end = Math.min(index + BATCH_LINE_COUNT, lines.length);
                const chunk = lines.slice(index, end).join("\n") + (end < lines.length ? "\n" : "");
                codeBox.insertAdjacentHTML("beforeend", highlightCode(chunk, chunkOffset));
                chunkOffset += chunk.length;

                if (end < lines.length) await waitForNextFrame();
            }

            await updateLineNumbers(text, token);
            if (token !== renderToken) {
                isApplyingEditorState = false;
                return;
            }

            this.codes[this.currentLang] = text;
            codeBox.scrollTop = scrollTop;
            syncLineNumberScroll();
            restoreSelection(selectionStart, selectionEnd);
            isApplyingEditorState = false;
        };

        const refreshEditor = async (caretOffset) => {
            const text = normalizeEditorText();
            this.codes[this.currentLang] = text;
            await setCodeWithHighlight(text, caretOffset);
            updatePreview();
        };

        const replaceTextRange = async (start, end, replacement, recordHistory = true) => {
            const currentText = normalizeEditorText();
            const nextText = currentText.slice(0, start) + replacement + currentText.slice(end);
            const nextOffset = start + replacement.length;

            if (recordHistory) pushHistory({
                lang: this.currentLang,
                text: currentText,
                start,
                end,
                scrollTop: codeBox.scrollTop
            });

            await setCodeWithHighlight(nextText, nextOffset, nextOffset);
            updatePreview();
        };

        const applySnapshot = async (snapshot) => {
            await setCodeWithHighlight(snapshot.text, snapshot.start, snapshot.end, snapshot.scrollTop);
            updatePreview();
        };

        const undo = async () => {
            const history = historyByLang[this.currentLang];
            if (!history) return;

            const previous = history.undo.pop();
            if (!previous) return;

            history.redo.push(createSnapshot());
            await applySnapshot(previous);
        };

        const redo = async () => {
            const history = historyByLang[this.currentLang];
            if (!history) return;

            const next = history.redo.pop();
            if (!next) return;

            history.undo.push(createSnapshot());
            await applySnapshot(next);
        };

        const getDeleteOffsets = (inputType) => {
            const text = normalizeEditorText();
            const selection = getSelectionOffsets();

            if (selection.start !== selection.end) return selection;

            if (inputType === "deleteContentForward") {
                return { start: selection.start, end: Math.min(text.length, selection.end + 1) };
            }

            if (inputType === "deleteWordBackward") {
                const match = text.slice(0, selection.start).match(/\s*\S+\s*$/);
                return { start: match ? selection.start - match[0].length : selection.start, end: selection.end };
            }

            if (inputType === "deleteWordForward") {
                const match = text.slice(selection.end).match(/^\s*\S+/);
                return { start: selection.start, end: match ? selection.end + match[0].length : selection.end };
            }

            if (inputType === "deleteHardLineBackward" || inputType === "deleteSoftLineBackward") {
                return { start: text.lastIndexOf("\n", selection.start - 1) + 1, end: selection.end };
            }

            if (inputType === "deleteHardLineForward" || inputType === "deleteSoftLineForward") {
                const nextLine = text.indexOf("\n", selection.end);
                return { start: selection.start, end: nextLine === -1 ? text.length : nextLine };
            }

            return { start: Math.max(0, selection.start - 1), end: selection.end };
        };

        const downloadIsOff = String(item.download || "").trim().toLowerCase() === "off";
        downloadButton.disabled = downloadIsOff;

        const getDownloadFileName = () => {
            const fallbackExtensions = { html: "html", css: "css", js: "js" };
            const fileName = item[this.currentLang] || `code.${fallbackExtensions[this.currentLang] || "txt"}`;
            return fileName.split(/[\\/]/).pop() || fileName;
        };

        downloadButton.addEventListener("click", () => {
            if (downloadButton.disabled) return;

            this.codes[this.currentLang] = normalizeEditorText();

            const fileName = getDownloadFileName();
            if (!confirm(`Download ${fileName}?`)) return;

            const blob = new Blob([this.codes[this.currentLang] || ""], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        });

        available.forEach((lang, index) => {
            const btn = document.createElement("button");
            btn.className = "cm-tab" + (index === 0 ? " active" : "");
            btn.textContent = lang.toUpperCase();
            btn.dataset.lang = lang;

            tabsContainer.appendChild(btn);

            btn.onclick = () => {
                this.codes[this.currentLang] = normalizeEditorText();
                saveCurrentEditorView();
                this.querySelectorAll(".cm-tab").forEach(x => x.classList.remove("active"));
                btn.classList.add("active");
                beforeInputSnapshot = null;
                this.currentLang = lang;
                const editorView = editorViewByLang[lang] || { start: 0, end: 0, scrollTop: 0 };
                setCodeWithHighlight(this.codes[lang], editorView.start, editorView.end, editorView.scrollTop);
            };
        });

        zoomButton.addEventListener("click", () => {
            const isZoomed = wrapper.classList.toggle("cm-wrapper-is-zoomed");
            document.body.classList.toggle("cm-wrapper-zoom", isZoomed);
            zoomButton.innerHTML = isZoomed ? zoomCloseIcon : zoomOpenIcon;
        });

        codeBox.addEventListener("beforeinput", (e) => {
            if (isApplyingEditorState) return;

            if (e.inputType === "historyUndo") {
                e.preventDefault();
                undo();
                return;
            }

            if (e.inputType === "historyRedo") {
                e.preventDefault();
                redo();
                return;
            }

            if (e.inputType === "insertFromPaste") {
                const pastedText = e.dataTransfer ? e.dataTransfer.getData("text/plain") : "";
                if (!pastedText) return;

                e.preventDefault();
                const selection = getSelectionOffsets();
                replaceTextRange(selection.start, selection.end, pastedText);
                return;
            }

            if (e.inputType && e.inputType.startsWith("delete")) {
                e.preventDefault();
                const selection = getDeleteOffsets(e.inputType);
                if (selection.start === selection.end) return;
                replaceTextRange(selection.start, selection.end, "");
                return;
            }

            beforeInputSnapshot = createSnapshot();
        });

        codeBox.addEventListener("input", () => {
            if (isApplyingEditorState) return;

            const snapshot = beforeInputSnapshot;
            beforeInputSnapshot = null;
            if (snapshot) pushHistory(snapshot);
            refreshEditor();
        });

        codeBox.addEventListener("paste", (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData ? e.clipboardData.getData("text/plain") : "";
            const selection = getSelectionOffsets();
            replaceTextRange(selection.start, selection.end, pastedText);
        });

        codeBox.addEventListener("click", (e) => {
            const swatch = e.target.closest(".cm-color-swatch");
            if (!swatch || this.currentLang !== "css") return;

            e.preventDefault();

            const start = Number(swatch.dataset.colorStart);
            const end = Number(swatch.dataset.colorEnd);
            const colorValue = swatch.dataset.colorValue || "";
            const hexValue = colorToHex(colorValue);

            if (!Number.isFinite(start) || !Number.isFinite(end) || !hexValue) return;

            const input = document.createElement("input");
            input.type = "color";
            input.value = hexValue;
            input.className = "cm-color-input";

            input.addEventListener("change", () => {
                replaceTextRange(start, end, input.value).then(() => input.remove());
            }, { once: true });

            document.body.appendChild(input);
            input.click();
        });

        codeBox.addEventListener("scroll", () => {
            syncLineNumberScroll();
        });

        codeBox.addEventListener("keydown", (e) => {
            const htmlVoidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
            const isShortcut = e.ctrlKey || e.metaKey;

            if (isShortcut && e.key.toLowerCase() === "a") {
                e.preventDefault();
                selectAllCode();
                return;
            }

            if (isShortcut && e.key.toLowerCase() === "z" && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }

            if (isShortcut && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
                e.preventDefault();
                redo();
                return;
            }

            if (this.currentLang === "css" && (e.key === "{" || e.key === "[")) {
                e.preventDefault();
                const selection = getSelectionOffsets();
                const closeChar = e.key === "{" ? "}" : "]";
                const currentText = normalizeEditorText();
                const selectedText = currentText.slice(selection.start, selection.end);
                const replacement = e.key + selectedText + closeChar;
                const caretOffset = selection.start + 1 + selectedText.length;

                replaceTextRange(selection.start, selection.end, replacement).then(() => restoreCaret(caretOffset));
                return;
            }

            if (this.currentLang === "css" && e.key === ":") {
                const selection = getSelectionOffsets();

                if (selection.start === selection.end) {
                    const textBeforeCaret = normalizeEditorText().slice(0, selection.start);
                    const propertyMatch = textBeforeCaret.match(/(?:^|[{\n;]\s*)([a-zA-Z-][\w-]*)$/);

                    if (propertyMatch) {
                        e.preventDefault();
                        replaceTextRange(selection.start, selection.end, ": ;").then(() => restoreCaret(selection.start + 2));
                        return;
                    }
                }
            }

            if (e.key === "Enter") {
                e.preventDefault();
                const selection = getSelectionOffsets();

                if (this.currentLang === "css" && selection.start === selection.end) {
                    const text = normalizeEditorText();
                    const charBefore = text[selection.start - 1];
                    const charAfter = text[selection.start];

                    if ((charBefore === "{" && charAfter === "}") || (charBefore === "[" && charAfter === "]")) {
                        replaceTextRange(selection.start, selection.end, "\n    \n").then(() => restoreCaret(selection.start + 5));
                        return;
                    }

                    if (charBefore === ";") {
                        replaceTextRange(selection.start, selection.end, "\n    ").then(() => restoreCaret(selection.start + 5));
                        return;
                    }
                }

                replaceTextRange(selection.start, selection.end, "\n");
                return;
            }

            if (e.key === "Tab") {
                e.preventDefault();
                const selection = getSelectionOffsets();
                replaceTextRange(selection.start, selection.end, "    ");
                return;
            }

            if (e.key === ">" && this.currentLang === "html") {
                const offset = getCaretOffset();
                const textBeforeCaret = normalizeEditorText().slice(0, offset);
                const tagMatch = textBeforeCaret.match(/<([a-zA-Z][\w:-]*)(?:\s[^<>]*)?$/);

                if (tagMatch && !textBeforeCaret.endsWith("/") && !htmlVoidTags.has(tagMatch[1].toLowerCase())) {
                    e.preventDefault();
                    replaceTextRange(offset, offset, `></${tagMatch[1]}>`).then(() => restoreCaret(offset + 1));
                }
            }
        });

        if (this.codes[this.currentLang]) {
            setCodeWithHighlight(this.codes[this.currentLang]);
        } else {
            updateLineNumbers("");
        }
        updatePreview();
    }
}

customElements.define("code-magic", CodeMagic);

const style = document.createElement("style");

style.textContent = `
code-magic{
display: block;
margin: 20px auto;
width: 902px;
height: 539px;
max-width: 100%;
}

.ccvvde3r4 {
position: absolute;
z-index: 10;
right: 0;
top: 0;
height: 36px;
display: flex;
}
.ccvvde3r4 button {
cursor: pointer;
transition: 0.2s;
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
fill: #5b6879;
background: #6774850e;
}
.ccvvde3r4 button:active {
transition: 0.0s;
fill: #5b6879;
background: #67748521;
}
.ccvvde3r4 button:disabled {
opacity: .5;
cursor: default;
}
.ccvvde3r4 button:disabled:hover,
.ccvvde3r4 button:disabled:active {
fill: #677485d6;
background: #0000;
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

body.cm-wrapper-zoom{
overflow: hidden;
}
body.cm-wrapper-zoom .cm-editor {
border-radius: 12px 12px 12px 0px;
}
body.cm-wrapper-zoom .cm-body {
border-radius: 0px;
}

.cm-wrapper.cm-wrapper-is-zoomed{
position: fixed;
left: 0;
top: 0;
right: 0;
bottom: 0;
z-index: 999999;
width: auto;
max-width: none;
border-color: #0000;
border-radius: 0;
/*box-shadow: 0 18px 60px #0000002e;*/
display: flex;
flex-direction: column;
}

.cm-wrapper.cm-wrapper-is-zoomed .cm-body{
flex: 1 1;
}

.cm-tabs{
position: sticky;
z-index: 5;
user-select: none;
display: flex;
background: #fafafa;
border-bottom: 1px solid #0000;
height: 36px;
/*overflow: hidden;*/
border-radius: 12px 12px 0px 0px;
}

.cm-tab{
position: relative;
transition: 0.2s;
font-family: system-ui;
line-height: 0;
border: none;
padding: 10px 0;
cursor: pointer;
background: none;
width: 100px;
margin: 2px 2px;
margin-right: 0;
margin-bottom: 0;
border-radius: 10px;
display: flex;
justify-content: center;
align-items: center;
}
.cm-tab:hover {
background: #6774850e;
}
.cm-tab:active {
transition: 0.0s;
background: #67748521;
}
.cm-tab::before {
position: absolute;
transition: 0.1s;
content: '';
bottom: -3px;
height: 3px;
width: 30%;
border-radius: 5px;
opacity: 0;
background: #3b91e1;
}

.cm-tab.active{
font-weight: bold;
}
.cm-tab.active::before {
width: 50%;
opacity: 1 !important;
}

.cm-body{
position: relative;
display: flex;
height: 500px;
background: #fafafa;
border-radius: 12px;
/*overflow: hidden;*/
}
.cm-body div {
    flex: 1 1;
    scrollbar-color: #525d6547 transparent;
}

.cm-editor{
display: flex;
overflow: hidden;
min-width: 0;
flex: 1 1;
font-family: monospace;
font-size: 14px;
line-height: 1.5;
background: #fafafa;
border-radius: 12px 12px 12px 12px;
}

.cm-body .cm-editor{
flex: 1 1;
}

.cm-line-numbers{
    flex: 0 0 46px !important;
    width: 46px;
    overflow: auto;
    scrollbar-width: none;
    padding: 15px 0px 15px 0;
    box-sizing: border-box;
    color: #9aa4af;
    text-align: right;
    user-select: none;
    pointer-events: none;
    white-space: pre;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    border-right: 1px solid #e7eaf0;
    background: #f3f5f8;
}

.cm-line-numbers div{
height: 21px;
text-align: center
}

.cm-code{
flex: 1 1 !important;
min-width: 0;
font-size: 14px;
line-height: 1.5;
padding: 15px;
padding-right: 0px;
overflow: scroll;
white-space: pre;
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
.cm-syntax-color { color: #426db6; font-weight: 700; }
.cm-color-swatch{
display: inline-block;
width: 11px;
height: 11px;
margin: 0 4px 0 2px;
border: 1px solid #9aa4af;
border-radius: 2px;
box-sizing: border-box;
vertical-align: -1px;
cursor: pointer;
}
.cm-color-input{
position: fixed;
left: -100px;
top: -100px;
width: 1px;
height: 1px;
opacity: 0;
}

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
@media (max-width: 768px) {
    .cm-tab {
        width: 60px;
    }
}
@media (hover: none) and (pointer: coarse) {
.Touch-mode .cm-preview {
    position: absolute;
    margin-left: 4px;
    width: auto;
    inset: 0;
}
}
* {
    -webkit-tap-highlight-color: transparent;
}
`;

document.head.appendChild(style);

})();
